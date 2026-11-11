// @vitest-environment happy-dom
import { afterEach, assert, beforeEach, describe, it } from 'vitest';
import { Federation, type Cluster, type FederationStats, type ParallelRun, type SiteStats } from '../src/federation/federation.js';
import '../src/federation/panel.js';
import type { Arg2pFederation } from '../src/federation/panel.js';
import { sleep, until } from './fakes.js';

const { deepEqual, equal, match } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const BASE = 'https://tuprolog.github.io/arg2p-kt-web/';

/** A cluster connecting to the servers it is given (one with the code 'wrong' refuses it), with the devices it knows */
class FakeCluster implements Cluster {
    onChange: (() => void) | null = null;
    connected: [string, string | null][] = [];
    sites: SiteStats[] = [{ id: 'site-a', name: '', workers: 2 }];

    connect = async (url: string, code: string | null): Promise<void> => {
        if (code === 'wrong') throw new Error(`${url} refused the link: wrong code`);
        this.connected.push([url, code]);
        this.sites = [...this.sites, { id: 'site-server', name: 'gpisa-laptop', workers: 8 }];
        this.onChange?.();
    };
    solve = (): Promise<ParallelRun> => Promise.reject(new Error('no runs here'));
    stop = () => {};
    close = () => {};

    stats(): FederationStats {
        return { site: this.sites[0]!.id, sites: this.sites, evaluation: null };
    }
}

/** The panel of a federation on a fake cluster */
async function panelOf() {
    const cluster = new FakeCluster();
    const federation = new Federation(() => Promise.resolve<Cluster>(cluster));
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
    const type = async (label: string, value: string) => {
        const input = panel.shadowRoot!.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settled();
    };
    const text = () => panel.shadowRoot!.textContent!.replace(/\s+/g, ' ');
    return { federation, cluster, panel, settled, button, click, type, text };
}

describe('The federation panel', function () {
    beforeEach(function () {
        (window as unknown as { happyDOM: { setURL(url: string): void } }).happyDOM.setURL(BASE);
    });

    afterEach(function () {
        document.body.replaceChildren();
    });

    it('should connect to the server typed, with its code, and show its devices', async function () {
        const { cluster, click, type, text } = await panelOf();
        await type('The address of the server', 'wss://192.168.1.17:9432');
        await type('The code of the server', ' 4831 ');
        await click('Connect');
        await until(() => /Connected:/.test(text()), 'the connection');
        deepEqual(cluster.connected, [['wss://192.168.1.17:9432', '4831']]);
        match(text(), /Connected to wss:\/\/192\.168\.1\.17:9432, with 1 device/);
        match(text(), /gpisa-laptop/);
    });

    it('should ask to confirm a link of a server opened in the page, and connect once confirmed', async function () {
        const { cluster, panel, click, settled, text } = await panelOf();
        let revealed = false;
        panel.addEventListener('arg2p-reveal', () => (revealed = true));
        await panel.open({ url: 'wss://hub:9432', code: '1234' });
        await settled();
        ok(revealed);
        match(text(), /A link connects this device to the federation of a server/);
        equal(cluster.connected.length, 0);
        await click('Connect');
        await until(() => cluster.connected.length === 1, 'the connection');
        deepEqual(cluster.connected, [['wss://hub:9432', '1234']]);
    });

    it('should connect to no server when a link is declined', async function () {
        const { cluster, panel, click, settled, text, button } = await panelOf();
        await panel.open({ url: 'wss://hub:9432', code: null });
        await settled();
        await click('Decline');
        assert.notMatch(text(), /A link connects this device/);
        equal(button('Decline'), null);
        equal(cluster.connected.length, 0);
    });

    it('should tell why a server cannot be reached, or refused this device', async function () {
        const { cluster, click, type, text } = await panelOf();
        await type('The address of the server', 'hub:9432');
        await click('Connect');
        match(text(), /no address of a server/);
        await type('The address of the server', 'ws://192.168.1.17:9431');
        await click('Connect');
        match(text(), /over wss:\/\/ alone/);
        await type('The address of the server', 'wss://192.168.1.17:9432');
        await type('The code of the server', 'wrong');
        await click('Connect');
        await until(() => /refused the link/.test(text()), 'the refusal');
        equal(cluster.connected.length, 0);
    });

    it('should leave the federation', async function () {
        const { federation, click, type, text } = await panelOf();
        await type('The address of the server', 'wss://hub:9432');
        await click('Connect');
        await until(() => federation.server !== null, 'the connection');
        await click('Leave');
        match(text(), /Left the federation/);
        equal(federation.running, false);
    });
});
