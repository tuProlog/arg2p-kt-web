import { assert, describe, it } from 'vitest';
import {
    Federation,
    deviceName,
    devicesOf,
    type Cluster,
    type FederationStats,
    type ParallelRun,
    type SiteStats,
} from '../src/federation/federation.js';
import { federationLink, readFederationLink, serverAddress, unreachable } from '../src/federation/links.js';

const { deepEqual, equal, match } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const BASE = 'https://tuprolog.github.io/arg2p-kt-web/?s=abc';

describe('The links of the federation of a server', function () {
    it('should carry its address and its code in their fragment, and give them back', function () {
        const link = federationLink(BASE, { url: 'wss://192.168.1.17:9432', code: '4831' });
        equal(new URL(link).search, '');
        deepEqual(readFederationLink(new URL(link).hash), { url: 'wss://192.168.1.17:9432', code: '4831' });
        deepEqual(readFederationLink(new URL(federationLink(BASE, { url: 'ws://localhost:9431', code: null })).hash), {
            url: 'ws://localhost:9431',
            code: null,
        });
    });

    it('should carry no server when the address is none of WebSockets', function () {
        equal(readFederationLink('#federate=https%3A%2F%2Fexample.org'), null);
        equal(readFederationLink('#join=abc'), null);
        equal(readFederationLink(''), null);
    });

    it('should read the address of a server typed', function () {
        equal(serverAddress(' wss://hub-host:9431 '), 'wss://hub-host:9431');
        equal(serverAddress('wss://hub-host:9431/'), 'wss://hub-host:9431');
        equal(serverAddress('hub-host:9431'), null);
        equal(serverAddress('http://hub-host:9431'), null);
    });

    it('should refuse ws addresses from a page on https, but those of this machine', function () {
        match(unreachable('ws://192.168.1.17:9431', BASE)!, /wss/);
        equal(unreachable('ws://localhost:9431', BASE), null);
        equal(unreachable('wss://192.168.1.17:9432', BASE), null);
        equal(unreachable('ws://192.168.1.17:9431', 'http://localhost:5173/'), null);
    });
});

describe('The devices of a federation', function () {
    // as the cluster of a device connected to a server tells them: its own site, the server, and a phone linked to it
    const stats: FederationStats = {
        site: 'site-a',
        sites: [
            { id: 'site-a', name: '', workers: 2 },
            { id: 'site-b', name: 'gpisa-laptop', workers: 8 },
            { id: 'site-c', name: '', workers: null },
        ],
        evaluation: null,
    };

    it('should tell this device first, then the others by their names', function () {
        deepEqual(devicesOf(stats), [
            { id: 'site-a', name: 'This device', workers: 2 },
            { id: 'site-b', name: 'gpisa-laptop', workers: 8 },
            { id: 'site-c', name: 'Device 2', workers: null },
        ]);
    });

    it('should tell the device a worker ran on', function () {
        equal(deviceName(stats, 'site-a'), 'This device');
        equal(deviceName(stats, 'site-b'), 'gpisa-laptop');
        equal(deviceName(stats, 'site-x'), 'site-x');
    });
});

/** A promise, settled from outside */
function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(it => (resolve = it));
    return { promise, resolve };
}

/** A cluster connecting to the servers it is given, and refusing the others: it tells what it connected to, and when it closes */
class FakeCluster implements Cluster {
    onChange: (() => void) | null = null;
    closed = false;
    connected: [string, string | null][] = [];
    sites: SiteStats[] = [{ id: 'site-a', name: '', workers: 2 }];

    connect = async (url: string, code: string | null): Promise<void> => {
        if (code === 'wrong') throw new Error(`${url} refused the link: wrong code`);
        this.connected.push([url, code]);
        this.sites = [...this.sites, { id: 'site-server', name: 'server', workers: 8 }];
        this.onChange?.();
    };
    solve = (): Promise<ParallelRun> => Promise.reject(new Error('no runs here'));
    stop = () => {};

    stats(): FederationStats {
        return { site: this.sites[0]!.id, sites: this.sites, evaluation: null };
    }

    close(): void {
        this.closed = true;
    }
}

/** A federation whose cluster starts once [start] is called */
function federationOf() {
    const started = deferred<FakeCluster>();
    const cluster = new FakeCluster();
    const federation = new Federation(() => started.promise);
    return { federation, cluster, start: () => started.resolve(cluster) };
}

/** What [promise] failed with: a failure itself when it did not fail */
async function failure(promise: Promise<unknown>): Promise<Error> {
    return promise.then(
        () => assert.fail('it did not fail'),
        (error: Error) => error,
    );
}

describe('The federation', function () {
    it('should connect to a server once its cluster starts, and know its devices', async function () {
        const { federation, cluster, start } = federationOf();
        const connecting = federation.connect('wss://hub:9432', '4831');
        ok(federation.running);
        equal(federation.server, null);
        start();
        await connecting;
        deepEqual(cluster.connected, [['wss://hub:9432', '4831']]);
        equal(federation.server, 'wss://hub:9432');
        deepEqual(
            federation.devices.map(it => it.id),
            ['site-server'],
        );
    });

    it('should tell why a server refused it, and stay not connected', async function () {
        const { federation, start } = federationOf();
        start();
        match((await failure(federation.connect('wss://hub:9432', 'wrong'))).message, /refused/);
        equal(federation.server, null);
    });

    it('should close its cluster once left, those starting once started', async function () {
        const { federation, cluster, start } = federationOf();
        const connecting = federation.connect('wss://hub:9432', null);
        federation.leave();
        start();
        match((await failure(connecting)).message, /left/);
        await new Promise(resolve => setTimeout(resolve));
        ok(cluster.closed);
        equal(federation.running, false);
        equal(federation.stats, null);
    });
});
