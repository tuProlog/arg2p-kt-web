import type { Channels, Page, Peer } from '../src/federation/pairing.js';
import type { Fetch } from '../src/federation/relay.js';

// What the pairing reaches, faked: the relay, the WebRTC of a device, the pages of a device and the page shown

/**
 * A relay as ntfy answers: what is published on a topic is read back with its id, after the one given (`since`). It
 * tells what was published, and how many times each topic was read; down, it cannot be reached.
 */
export function fakeRelay() {
    const topics = new Map<string, { id: string; message: string }[]>();
    const state = { down: false, published: [] as string[], reads: new Map<string, number>() };
    let ids = 0;
    const fetch: Fetch = async (url, init) => {
        if (state.down) throw new TypeError('Failed to fetch');
        init?.signal?.throwIfAborted();
        const { pathname, searchParams } = new URL(url);
        const [topic, kind] = pathname.slice(1).split('/') as [string, string | undefined];
        const messages = topics.get(topic) ?? [];
        topics.set(topic, messages);
        if (init?.method === 'POST') {
            messages.push({ id: `m${++ids}`, message: init.body! });
            state.published.push(init.body!);
            return { ok: true, status: 200, text: async () => '' };
        }
        if (kind !== 'json' || searchParams.get('poll') !== '1') throw new Error(`not a read: ${url}`);
        state.reads.set(topic, (state.reads.get(topic) ?? 0) + 1);
        const since = searchParams.get('since');
        const after = since === 'all' ? messages : messages.slice(messages.findIndex(it => it.id === since) + 1);
        const lines = after.map(it => JSON.stringify({ id: it.id, time: 0, event: 'message', topic, message: it.message }));
        return { ok: true, status: 200, text: async () => [JSON.stringify({ id: 'k', event: 'keepalive' }), ...lines].join('\n') };
    };
    /** The times the topics were read, all of them */
    const reads = () => [...state.reads.values()].reduce((a, b) => a + b, 0);
    return { fetch, state, reads };
}

/** The WebRTC of a device: what it was asked, and its answers; [slow], its pairings take that many milliseconds */
export function fakePeer(name: string, slow = 0) {
    const completed: string[] = [];
    const peer: Peer = {
        invite: async () => `offer-of-${name}`,
        accept: async offer => `answer-of-${name}-to-${offer}`,
        complete: async reply => {
            if (!reply.startsWith('answer-')) throw new Error('not an answer');
            await sleep(slow);
            completed.push(reply);
        },
    };
    return { peer, completed };
}

/** The pages of a device, on one channel: what one posts the others are told, as a BroadcastChannel does */
export function fakeChannels(): Channels {
    const pages = new Set<{ listeners: ((event: { data: unknown }) => void)[] }>();
    return () => {
        const page = { listeners: [] as ((event: { data: unknown }) => void)[] };
        pages.add(page);
        return {
            addEventListener: (_: string, listener: (event: { data: unknown }) => void) => page.listeners.push(listener),
            postMessage: (data: unknown) => {
                if (!pages.has(page)) throw new Error('Channel is closed');
                [...pages].filter(it => it !== page).forEach(it => it.listeners.forEach(listener => setTimeout(() => listener({ data: structuredClone(data) }))));
            },
            close: () => pages.delete(page),
        } as unknown as BroadcastChannel;
    };
}

/** The page an invitation is shown in: hidden or shown, and gone, as the browser tells it */
export function fakePage() {
    const target = new EventTarget();
    const document = Object.assign(new EventTarget(), { hidden: false });
    const page = Object.assign(target, { document }) as unknown as Page;
    return {
        page,
        hide: (hidden: boolean) => {
            document.hidden = hidden;
            document.dispatchEvent(new Event('visibilitychange'));
        },
        leave: () => target.dispatchEvent(new Event('pagehide')),
    };
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Once [condition] holds, looked at every few milliseconds: a failure telling [what] once [ms] milliseconds have passed */
export async function until(condition: () => boolean, what: string, ms = 5000): Promise<void> {
    const end = Date.now() + ms;
    while (!condition()) {
        if (Date.now() > end) throw new Error(`Still waiting for ${what}`);
        await sleep(10);
    }
}
