import { assert, describe, it } from 'vitest';
import type { PairingLink } from '../src/federation/links.js';
import { shareUrl, type Shared } from '../src/links.js';
import { followLinks } from '../src/router.js';

const { deepEqual, equal } = assert;

const BASE = 'https://tuprolog.github.io/arg2p-kt-web/';
const CONTENT = { theory: 'f1 :=> a.', query: 'a', flags: 'queryMode.' };

/** A window at [url]: its address as the page changes it, its fragment as it is opened, and its launch queue */
function fakeWindow(url: string) {
    const target = new EventTarget();
    let address = new URL(url);
    let consumer: ((params: { targetURL?: string }) => void) | null = null;
    const window = Object.defineProperties(target, {
        location: { get: () => ({ href: address.href, pathname: address.pathname, search: address.search, hash: address.hash }) },
        history: { value: { replaceState: (_: unknown, __: string, to: string) => (address = new URL(to, address)) } },
        launchQueue: { value: { setConsumer: (it: (params: { targetURL?: string }) => void) => (consumer = it) } },
    });
    return {
        window: window as unknown as Window,
        address: () => address.href,
        /** A link opened in the page: its fragment changes */
        open: (hash: string) => {
            address = new URL(hash, address);
            target.dispatchEvent(new Event('hashchange'));
        },
        /** A link the installed app is launched with, while it is open */
        launch: (url: string) => consumer?.({ targetURL: url }),
    };
}

/** What [window] is opened with, by kind */
function follow(window: Window) {
    const opened = { shared: [] as Shared[], pairing: [] as PairingLink[] };
    const stop = followLinks(window, { shared: it => opened.shared.push(it), pairing: it => opened.pairing.push(it) });
    return { opened, stop };
}

describe('The links the playground is opened with', function () {
    it('should open a shared link once, and leave the address bar', function () {
        const page = fakeWindow(shareUrl(CONTENT, BASE));
        const { opened } = follow(page.window);
        deepEqual(opened.shared, [{ content: CONTENT, errors: [] }]);
        equal(page.address(), BASE);
        // its launch, right after the page loaded with it, is the same link
        page.launch(shareUrl(CONTENT, BASE));
        equal(opened.shared.length, 1);
    });

    it('should leave alone what is no link', function () {
        const page = fakeWindow(`${BASE}?stale=1#here`);
        const { opened } = follow(page.window);
        deepEqual(opened, { shared: [], pairing: [] });
        equal(page.address(), `${BASE}?stale=1#here`);
    });

    it('should open the links an installed app is launched with while open, shared ones included', function () {
        const page = fakeWindow(BASE);
        const { opened } = follow(page.window);
        page.launch(shareUrl(CONTENT, BASE));
        page.launch(`${BASE}#join=abc`);
        deepEqual(opened.shared, [{ content: CONTENT, errors: [] }]);
        deepEqual(opened.pairing, [{ kind: 'join', code: 'abc' }]);
        // the page stays where it is
        equal(page.address(), BASE);
    });

    it('should open the links of pairings opened in the page, the same one again included', function () {
        const page = fakeWindow(`${BASE}#join=abc`);
        const { opened, stop } = follow(page.window);
        equal(page.address(), BASE);
        page.open('#join=abc');
        page.open('#reply=def');
        deepEqual(opened.pairing, [
            { kind: 'join', code: 'abc' },
            { kind: 'join', code: 'abc' },
            { kind: 'reply', code: 'def' },
        ]);
        equal(page.address(), BASE);
        stop();
        page.open('#join=ghi');
        page.launch(`${BASE}#join=ghi`);
        equal(opened.pairing.length, 3);
    });

    it('should tell what was wrong with a shared link', function () {
        const page = fakeWindow(`${BASE}?mode=conarg`);
        const { opened } = follow(page.window);
        deepEqual(opened.shared, [{ content: null, errors: ['Unknown mode "conarg", expected "structured" or "abstract".'] }]);
        equal(page.address(), BASE);
    });
});
