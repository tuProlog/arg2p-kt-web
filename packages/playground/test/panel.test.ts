// @vitest-environment happy-dom
import { afterEach, assert, beforeEach, describe, it } from 'vitest';
import { Federation, type Cluster, type FederationStats, type ParallelRun, type SiteStats } from '../src/federation/federation.js';
import '../src/federation/panel.js';
import type { Arg2pFederation } from '../src/federation/panel.js';
import { DEFAULT_RELAY, encodeInvitation, newKey, type Peer } from '../src/federation/pairing.js';
import { fakePeer, fakeRelay, sleep, until } from './fakes.js';

const { deepEqual, equal, match } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const BASE = 'https://tuprolog.github.io/arg2p-kt-web/';

/** A cluster on the WebRTC of [peer], whose devices are told by [sites] (its own site first) */
class FakeCluster implements Cluster {
    onChange: (() => void) | null = null;
    sites: SiteStats[] = [{ id: 'site-b', workers: 2, delegate: false, via: null }];

    constructor(private readonly peer: Peer) {}

    invite = () => this.peer.invite();
    accept = (invitation: string) => this.peer.accept(invitation);
    complete = (reply: string) => this.peer.complete(reply);
    solve = (): Promise<ParallelRun> => Promise.reject(new Error('no runs here'));
    stop = () => {};
    close = () => {};

    stats(): FederationStats {
        return { site: this.sites[0]!.id, sites: this.sites, evaluation: null };
    }
}

/** The panel of a federation whose cluster starts once [start] is called, its invitations through a fake relay */
async function panelOf(options: { lifetime?: number } = {}) {
    const relay = fakeRelay();
    let start!: () => void;
    const cluster = new FakeCluster(fakePeer('b').peer);
    const started = new Promise<Cluster>(resolve => (start = () => resolve(cluster)));
    const federation = new Federation(() => started, { fetch: relay.fetch, channels: () => null, page: null, lifetime: options.lifetime });
    const panel = document.createElement('arg2p-federation') as Arg2pFederation;
    panel.federation = federation;
    document.body.append(panel);
    await panel.updateComplete;
    const settled = async () => {
        await sleep(20);
        await panel.updateComplete;
    };
    const button = (label: string) => [...panel.shadowRoot!.querySelectorAll('button')].find(it => it.textContent?.trim() === label) ?? null;
    const click = async (label: string) => {
        const found = button(label);
        ok(found !== null, `no button ${label}`);
        found!.click();
        await settled();
    };
    const text = () => panel.shadowRoot!.textContent!.replace(/\s+/g, ' ');
    return { relay, federation, cluster, panel, start, settled, button, click, text };
}

/** The code of a link of an invitation, through the default relay */
async function invitation(): Promise<string> {
    return encodeInvitation({ topic: 'arg2p-abcdefgh12', key: await newKey(), offer: 'offer-of-a', relay: DEFAULT_RELAY });
}

describe('The federation panel', function () {
    beforeEach(function () {
        (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM.setURL(BASE);
    });

    afterEach(function () {
        document.body.replaceChildren();
    });

    it('should drop an invitation cancelled while it is prepared, and invite once at a time', async function () {
        const { relay, federation, start, button, click, settled } = await panelOf();
        await click('Invite a device');
        ok(button('Invite a device')!.disabled, 'Invite while waiting');
        await click('Cancel');
        assert.isFalse(button('Invite a device')!.disabled);
        start();
        await settled();
        assert.isFalse(federation.inviting);
        equal(relay.reads(), 0);
    });

    it('should drop an invitation shown no longer', async function () {
        const { federation, start, click, panel } = await panelOf();
        start();
        await click('Invite a device');
        await until(() => panel.shadowRoot!.querySelector('.qr') !== null, 'the invitation');
        ok(federation.inviting);
        await click('Join a device');
        assert.isFalse(federation.inviting);
    });

    it('should show no longer an invitation that ended by itself', async function () {
        const { start, click, panel, text } = await panelOf({ lifetime: 200 });
        start();
        await click('Invite a device');
        await until(() => panel.shadowRoot!.querySelector('.qr') !== null, 'the invitation');
        await until(() => panel.shadowRoot!.querySelector('.qr') === null, 'the invitation to end');
        match(text(), /The invitation ended/);
    });

    it('should send no reply when joining is cancelled', async function () {
        const { relay, start, click, panel, settled, text } = await panelOf();
        await panel.open({ kind: 'join', code: await invitation() });
        await settled();
        match(text(), /A device invites this one/);
        await click('Join');
        match(text(), /Accepting the invitation/);
        await click('Cancel');
        start();
        await sleep(100);
        await settled();
        deepEqual(relay.state.published, []);
        assert.notMatch(text(), /Type this code/);
    });

    it('should show its code until the device that invited is linked, then that it paired', async function () {
        const { relay, cluster, start, click, panel, settled, text } = await panelOf();
        start();
        await panel.open({ kind: 'join', code: await invitation() });
        await settled();
        await click('Join');
        await until(() => /Type this code on the device that invited/.test(text()), 'the code');
        equal(relay.state.published.length, 1);
        cluster.sites = [...cluster.sites, { id: 'site-a', workers: 4, delegate: false, via: null }];
        cluster.onChange?.();
        await until(() => !/Type this code/.test(text()), 'the pairing');
        match(text(), /Paired: the devices lend each other their workers/);
        match(text(), /Paired with 1 device/);
    });

    it('should refuse a relay that is no https address', async function () {
        const { federation, panel, settled, text } = await panelOf();
        const input = panel.shadowRoot!.querySelector<HTMLInputElement>('input[aria-label="The relay"]')!;
        input.value = 'http://ntfy.example.org';
        input.dispatchEvent(new Event('change'));
        await settled();
        match(text(), /The relay must be an https address/);
        equal(input.value, DEFAULT_RELAY);
        equal(federation.relay, DEFAULT_RELAY);
    });
});
