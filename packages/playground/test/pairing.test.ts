import { assert, describe, it } from 'vitest';
import { readPairing } from '../src/federation/links.js';
import {
    DEFAULT_RELAY,
    Inviting,
    decodeInvitation,
    decodeReply,
    encodeInvitation,
    handOff,
    join,
    newCode,
    newKey,
    normalCode,
    seal,
    unseal,
    type Channels,
    type Peer,
} from '../src/federation/pairing.js';
import type { Fetch } from '../src/federation/relay.js';

const { deepEqual, equal, match } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const BASE = 'https://tuprolog.github.io/arg2p-kt-web/';

/** A relay as ntfy answers: what is published on a topic is read back with its id, after the one given (`since`) */
function fakeRelay() {
    const topics = new Map<string, { id: string; message: string }[]>();
    const state = { down: false, published: [] as string[] };
    let ids = 0;
    const fetch: Fetch = async (url, init) => {
        if (state.down) throw new TypeError('Failed to fetch');
        const { pathname, searchParams } = new URL(url);
        const [topic, kind] = pathname.slice(1).split('/') as [string, string | undefined];
        const messages = topics.get(topic) ?? [];
        topics.set(topic, messages);
        if (init?.method === 'POST') {
            messages.push({ id: `m${++ids}`, message: init.body! });
            state.published.push(init.body!);
            return { ok: true, status: 200, text: async () => '' };
        }
        equal(kind, 'json');
        equal(searchParams.get('poll'), '1');
        const since = searchParams.get('since');
        const after = since === 'all' ? messages : messages.slice(messages.findIndex(it => it.id === since) + 1);
        const lines = after.map(it => JSON.stringify({ id: it.id, time: 0, event: 'message', topic, message: it.message }));
        return { ok: true, status: 200, text: async () => [JSON.stringify({ id: 'k', event: 'keepalive' }), ...lines].join('\n') };
    };
    return { fetch, state };
}

/** The WebRTC of a device: what it was asked, and its answers */
function fakePeer(name: string) {
    const completed: string[] = [];
    const peer: Peer = {
        invite: async () => `offer-of-${name}`,
        accept: async offer => `answer-of-${name}-to-${offer}`,
        complete: async reply => {
            if (!reply.startsWith('answer-')) throw new Error('not an answer');
            completed.push(reply);
        },
    };
    return { peer, completed };
}

/** The pages of a device, on one channel */
function fakeChannels(): Channels {
    const pages = new Set<{ listeners: ((event: { data: unknown }) => void)[] }>();
    return () => {
        const page = { listeners: [] as ((event: { data: unknown }) => void)[] };
        pages.add(page);
        return {
            addEventListener: (_: string, listener: (event: { data: unknown }) => void) => page.listeners.push(listener),
            postMessage: (data: unknown) => [...pages].filter(it => it !== page).forEach(it => it.listeners.forEach(listener => setTimeout(() => listener({ data: structuredClone(data) })))),
            close: () => pages.delete(page),
        } as unknown as BroadcastChannel;
    };
}

describe('The pairing', function () {
    it('should seal what only its key opens', async function () {
        const key = await newKey();
        const sealed = await seal(key, 'the reply');
        equal(await unseal(key, sealed), 'the reply');
        assert.notInclude(sealed, 'reply');
        // sealed anew each time
        ok(sealed !== (await seal(key, 'the reply')));
        await unseal(await newKey(), sealed).then(
            () => assert.fail('opened with another key'),
            () => {},
        );
    });

    it('should make codes easy to read and to type', function () {
        const codes = Array.from({ length: 200 }, () => newCode());
        codes.forEach(it => match(it, /^[A-HJ-NP-Z2-9]{5}$/));
        ok(new Set(codes).size > 190);
        equal(normalCode(' k7q-2m '), 'K7Q2M');
    });

    it('should carry an invitation and a reply in the links', function () {
        const invitation = { topic: 'arg2p-abcdefgh12', key: 'a2V5LWtleS1rZXk', offer: 'zOFFER+/x==', relay: DEFAULT_RELAY };
        deepEqual(decodeInvitation(encodeInvitation(invitation)), invitation);
        const elsewhere = { ...invitation, relay: 'https://ntfy.example.org:8080/base' };
        deepEqual(decodeInvitation(encodeInvitation(elsewhere)), elsewhere);
        deepEqual(decodeReply('arg2p-abcdefgh12.zANSWER=='), { topic: 'arg2p-abcdefgh12', answer: 'zANSWER==' });
        assert.isNull(decodeInvitation('zOFFER'));
        assert.isNull(decodeReply('no-topic'));
    });

    it('should pair with the reply whose code is typed, through the relay', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const b = fakePeer('b');
        const inviting = await Inviting.start(a.peer, { relay: DEFAULT_RELAY, base: BASE, fetch: relay.fetch, channels: () => null });
        try {
            // the QR code: the link of the invitation
            const code = readPairing(new URL(inviting.link).hash)!;
            equal(code.kind, 'join');
            const invitation = decodeInvitation(code.code)!;
            equal(invitation.offer, 'offer-of-a');
            // another device replies on the topic too, and something that is no reply
            await relay.fetch(`${DEFAULT_RELAY}/${invitation.topic}`, { method: 'POST', body: 'spam' });
            const other = await join(fakePeer('c').peer, invitation, BASE, relay.fetch);
            const joined = await join(b.peer, invitation, BASE, relay.fetch);
            ok(joined.code !== null && joined.relayError === null);
            // the relay sees no reply in the clear
            relay.state.published.forEach(it => assert.notInclude(it, 'answer-of'));
            await inviting.pair(joined.code!.toLowerCase());
            deepEqual(a.completed, ['answer-of-b-to-offer-of-a']);
            ok(other.code !== joined.code);
        } finally {
            inviting.close();
        }
    });

    it('should give the reply as a link when the relay cannot take it, and pair with it', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const inviting = await Inviting.start(a.peer, { relay: DEFAULT_RELAY, base: BASE, fetch: relay.fetch, channels: () => null });
        try {
            relay.state.down = true;
            const joined = await join(fakePeer('b').peer, decodeInvitation(readPairing(new URL(inviting.link).hash)!.code)!, BASE, relay.fetch);
            assert.isNull(joined.code);
            match(joined.relayError!, /Failed to fetch/);
            const reply = readPairing(new URL(joined.link).hash)!;
            equal(reply.kind, 'reply');
            ok(await inviting.take(decodeReply(reply.code)!));
            deepEqual(a.completed, ['answer-of-b-to-offer-of-a']);
        } finally {
            inviting.close();
        }
    });

    it('should hand a reply opened on this device to the page of its invitation alone', async function () {
        const relay = fakeRelay();
        const channels = fakeChannels();
        const first = fakePeer('first');
        const second = fakePeer('second');
        // two pages of this device invite
        const inviting = await Inviting.start(first.peer, { relay: DEFAULT_RELAY, base: BASE, fetch: relay.fetch, channels });
        const another = await Inviting.start(second.peer, { relay: DEFAULT_RELAY, base: BASE, fetch: relay.fetch, channels });
        try {
            const invitation = decodeInvitation(readPairing(new URL(another.link).hash)!.code)!;
            relay.state.down = true;
            const joined = await join(fakePeer('b').peer, invitation, BASE, relay.fetch);
            // the reply link, opened in a page of its own on this device
            const answered = await handOff(decodeReply(readPairing(new URL(joined.link).hash)!.code)!, 2000, channels);
            deepEqual(answered, { paired: true });
            deepEqual(first.completed, []);
            deepEqual(second.completed, ['answer-of-b-to-offer-of-second']);
            // a reply to no invitation of this device: no page answers
            assert.isNull(await handOff({ topic: 'arg2p-nobodyhere', answer: 'answer-x' }, 200, channels));
        } finally {
            inviting.close();
            another.close();
        }
    });

    it('should drop an invitation: no reply pairs with it any longer', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const inviting = await Inviting.start(a.peer, { relay: DEFAULT_RELAY, base: BASE, fetch: relay.fetch, channels: () => null });
        const reply = { topic: decodeInvitation(readPairing(new URL(inviting.link).hash)!.code)!.topic, answer: 'answer-late' };
        inviting.close();
        await inviting.take(reply).then(
            () => assert.fail('paired with a dropped invitation'),
            error => match(error.message, /dropped/),
        );
        deepEqual(a.completed, []);
    });
});
