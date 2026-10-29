import jsQR from 'jsqr';
import { encode } from 'uqr';
import { assert, describe, it } from 'vitest';
import {
    Federation,
    deviceName,
    devicesOf,
    type Cluster,
    type FederationEvent,
    type FederationStats,
    type ParallelRun,
    type SiteStats,
} from '../src/federation/federation.js';
import { codeIn, pairingLink, readPairing } from '../src/federation/links.js';
import { DEFAULT_RELAY, type Peer } from '../src/federation/pairing.js';
import { fakePeer, fakeRelay, sleep, until } from './fakes.js';

const { deepEqual, equal, match } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

// a code as WebWorkerCluster makes them: z, then base64 (with + and /), some 600 characters
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const CODE = 'z' + Array.from({ length: 600 }, (_, i) => ALPHABET[(i * 37 + 11) % 64]).join('') + '==';
const BASE = 'https://tuprolog.github.io/arg2p-kt-web/?s=abc';

describe('The links of a pairing', function () {
    it('should carry a code in their fragment, and give it back', function () {
        const link = pairingLink(BASE, { kind: 'join', code: CODE });
        const url = new URL(link);
        equal(url.search, '');
        equal(url.pathname, '/arg2p-kt-web/');
        deepEqual(readPairing(url.hash), { kind: 'join', code: CODE });
        deepEqual(readPairing(new URL(pairingLink(BASE, { kind: 'reply', code: CODE })).hash), { kind: 'reply', code: CODE });
    });

    it('should tell the code of a kind in what was scanned or pasted', function () {
        const reply = pairingLink(BASE, { kind: 'reply', code: CODE });
        equal(codeIn(reply, 'reply'), CODE);
        equal(codeIn(` ${CODE}\n`, 'reply'), CODE);
        // an invitation scanned where a reply is expected
        equal(codeIn(pairingLink(BASE, { kind: 'join', code: CODE }), 'reply'), null);
        equal(codeIn('', 'join'), null);
        equal(readPairing('#s=abc'), null);
        equal(readPairing(''), null);
    });

    it('should fit a QR code that reads back the same', function () {
        const link = pairingLink('https://tuprolog.github.io/arg2p-kt-web/', { kind: 'join', code: CODE });
        const qr = encode(link, { ecc: 'M', border: 2 });
        // as a camera would see it: four pixels a module
        const scale = 4;
        const size = qr.size * scale;
        const pixels = new Uint8ClampedArray(size * size * 4);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dark = qr.data[Math.floor(y / scale)]![Math.floor(x / scale)]!;
                pixels.fill(dark ? 0 : 255, (y * size + x) * 4, (y * size + x) * 4 + 3);
                pixels[(y * size + x) * 4 + 3] = 255;
            }
        }
        equal(jsQR(pixels, size, size)?.data, link);
        // some 100 modules a side, which a phone reads off a screen
        assert.isAtMost(qr.version, 21, `version ${qr.version}`);
        assert.notInclude(link, '%', 'the code as it is in the link');
    });
});

describe('The devices of a federation', function () {
    // as a cluster paired with another tells them: its own site (its Web Workers included), its Web Workers, the other
    // device, and one beyond it
    const stats: FederationStats = {
        site: 'site-a',
        sites: [
            { id: 'site-a', workers: 2, delegate: false, via: null },
            { id: 'site-a1', workers: 1, delegate: true, via: null },
            { id: 'site-a2', workers: 1, delegate: true, via: null },
            { id: 'site-b', workers: 4, delegate: false, via: null },
            { id: 'site-c', workers: null, delegate: false, via: 'site-b' },
        ],
        evaluation: null,
    };

    it('should tell this device first, then the others', function () {
        deepEqual(devicesOf(stats), [
            { id: 'site-a', name: 'This device', workers: 2, via: null },
            { id: 'site-b', name: 'Device 1', workers: 4, via: null },
            { id: 'site-c', name: 'Device 2', workers: null, via: 'Device 1' },
        ]);
    });

    it('should tell the device a worker ran on', function () {
        equal(deviceName(stats, 'site-a2'), 'This device');
        equal(deviceName(stats, 'site-b'), 'Device 1');
        equal(deviceName(stats, 'site-x'), 'site-x');
    });
});

/** A promise, settled from outside */
function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(it => (resolve = it));
    return { promise, resolve };
}

/** A cluster on the WebRTC of [peer], whose devices are told by [sites] (its own site first): it tells when it closes */
class FakeCluster implements Cluster {
    onChange: (() => void) | null = null;
    closed = false;
    sites: SiteStats[] = [{ id: 'site-a', workers: 2, delegate: false, via: null }];

    constructor(private readonly peer: Peer) {}

    invite = () => this.peer.invite();
    accept = (invitation: string) => this.peer.accept(invitation);
    complete = (reply: string) => this.peer.complete(reply);
    solve = (): Promise<ParallelRun> => Promise.reject(new Error('no runs here'));
    stop = () => {};

    stats(): FederationStats {
        return { site: this.sites[0]!.id, sites: this.sites, evaluation: null };
    }

    close(): void {
        this.closed = true;
    }
}

/** A federation whose cluster starts once [started] is resolved, its invitations through [relay], and what it tells */
function federationOf(peer: Peer, relay: ReturnType<typeof fakeRelay>, lifetime?: number) {
    const started = deferred<FakeCluster>();
    const cluster = new FakeCluster(peer);
    const federation = new Federation(() => started.promise, { fetch: relay.fetch, channels: () => null, page: null, lifetime });
    const events: FederationEvent[] = [];
    federation.subscribe(it => events.push(it));
    return { federation, cluster, start: () => started.resolve(cluster), events, told: () => events.filter(it => it !== 'changed') };
}

/** What [promise] failed with: a failure itself when it did not fail */
async function failure(promise: Promise<unknown>): Promise<Error> {
    return promise.then(
        () => assert.fail('it did not fail'),
        (error: Error) => error,
    );
}

describe('The federation', function () {
    it('should drop an invitation asked for before another one, or before it is ready', async function () {
        const relay = fakeRelay();
        // the invitations of the WebRTC come once let go
        const offers: ReturnType<typeof deferred<string>>[] = [];
        const peer: Peer = { ...fakePeer('a').peer, invite: () => (offers.push(deferred<string>()), offers.at(-1)!.promise) };
        const { federation, start } = federationOf(peer, relay);
        // asked for twice while the cluster starts: the first is never made
        const first = federation.invite(BASE, () => {});
        const second = federation.invite(BASE, () => {});
        start();
        match((await failure(first)).message, /dropped/);
        await until(() => offers.length === 1, 'the second invitation');
        // asked for again while the second is being made: the second is closed once it is ready
        const third = federation.invite(BASE, () => {});
        await until(() => offers.length === 2, 'the third invitation');
        offers.forEach(it => it.resolve('offer'));
        match((await failure(second)).message, /dropped/);
        await third;
        ok(federation.inviting);
        // one invitation reads the relay: the one closed read it once, as it was made
        await sleep(2200);
        deepEqual([...relay.state.reads.values()].sort(), [1, 2]);
        federation.dropInvitation();
    });

    it('should drop an invitation being made when it is cancelled', async function () {
        const relay = fakeRelay();
        const { federation, start } = federationOf(fakePeer('a').peer, relay);
        const inviting = federation.invite(BASE, () => {});
        federation.dropInvitation();
        start();
        match((await failure(inviting)).message, /dropped/);
        assert.isFalse(federation.inviting);
        await sleep(50);
        equal(relay.reads(), 0);
    });

    it('should make no invitation once left while its cluster starts, and close the cluster', async function () {
        const relay = fakeRelay();
        const { federation, cluster, start } = federationOf(fakePeer('a').peer, relay);
        const inviting = federation.invite(BASE, () => {});
        ok(federation.running);
        federation.leave();
        start();
        match((await failure(inviting)).message, /dropped|left/);
        await sleep(10);
        ok(cluster.closed);
        assert.isFalse(federation.running);
        equal(relay.reads(), 0);
    });

    it('should tell when a device paired, on both devices, and when an invitation ended by itself', async function () {
        const relay = fakeRelay();
        const a = federationOf(fakePeer('a').peer, relay);
        const b = federationOf(fakePeer('b').peer, relay);
        b.cluster.sites = [{ id: 'site-b', workers: 4, delegate: false, via: null }];
        a.start();
        b.start();
        const link = await a.federation.invite(BASE, () => {});
        const joined = await b.federation.join(readPairing(new URL(link).hash)!.code, BASE);
        deepEqual(b.told(), []);
        await a.federation.pair(joined.code!);
        deepEqual(a.told(), ['paired']);
        assert.isFalse(a.federation.inviting);
        // B is told once the device that invited is linked to it
        b.cluster.sites = [...b.cluster.sites, { id: 'site-a', workers: 2, delegate: false, via: null }];
        b.cluster.onChange?.();
        deepEqual(b.told(), ['paired']);
        equal(b.federation.devices.length, 1);
        b.cluster.onChange?.();
        deepEqual(b.told(), ['paired']);
        // an invitation lasting a moment ends by itself
        const brief = federationOf(fakePeer('c').peer, relay, 50);
        brief.start();
        await brief.federation.invite(BASE, () => {});
        await sleep(100);
        deepEqual(brief.told(), ['dropped']);
        assert.isFalse(brief.federation.inviting);
    });

    it('should send no reply when joining is cancelled', async function () {
        const relay = fakeRelay();
        const a = federationOf(fakePeer('a').peer, relay);
        a.start();
        const link = await a.federation.invite(BASE, () => {});
        const b = federationOf(fakePeer('b').peer, relay);
        const cancelled = new AbortController();
        const joining = b.federation.join(readPairing(new URL(link).hash)!.code, BASE, cancelled.signal);
        cancelled.abort();
        b.start();
        equal((await failure(joining)).name, 'AbortError');
        deepEqual(relay.state.published, []);
        a.federation.dropInvitation();
    });

    it('should take an https relay alone', function () {
        const { federation } = federationOf(fakePeer('a').peer, fakeRelay());
        assert.isFalse(federation.setRelay('http://ntfy.example.org'));
        assert.isFalse(federation.setRelay('javascript:alert(1)'));
        equal(federation.relay, DEFAULT_RELAY);
        ok(federation.setRelay(''));
    });
});
