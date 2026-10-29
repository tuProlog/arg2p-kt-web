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
    type Invitation,
    type InvitingOptions,
} from '../src/federation/pairing.js';
import { fakeChannels, fakePage, fakePeer, fakeRelay, sleep } from './fakes.js';

const { deepEqual, equal, match } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const BASE = 'https://tuprolog.github.io/arg2p-kt-web/';

/** The invitation the link of [inviting] carries */
function invitationOf(inviting: Inviting): Invitation {
    return decodeInvitation(readPairing(new URL(inviting.link).hash)!.code)!;
}

/** What [promise] failed with: a failure itself when it did not fail */
async function failure(promise: Promise<unknown>): Promise<Error> {
    return promise.then(
        () => assert.fail('it did not fail'),
        (error: Error) => error,
    );
}

/** An invitation of [peer] through [relay], on no page and no channel unless told */
function invite(peer: ReturnType<typeof fakePeer>, relay: ReturnType<typeof fakeRelay>, options: Partial<InvitingOptions> = {}): Promise<Inviting> {
    return Inviting.start(peer.peer, { relay: DEFAULT_RELAY, base: BASE, fetch: relay.fetch, channels: () => null, page: null, ...options });
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

    it('should take no invitation whose relay is no https address', function () {
        const invitation = { topic: 'arg2p-abcdefgh12', key: 'a2V5LWtleS1rZXk', offer: 'zOFFER+/x==' };
        for (const relay of ['http://ntfy.example.org', 'javascript:alert(1)', 'ntfy.example.org']) {
            assert.isNull(decodeInvitation(encodeInvitation({ ...invitation, relay })), relay);
        }
    });

    it('should pair with the reply whose code is typed, through the relay', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const b = fakePeer('b');
        const inviting = await invite(a, relay);
        try {
            // the QR code: the link of the invitation
            const code = readPairing(new URL(inviting.link).hash)!;
            equal(code.kind, 'join');
            const invitation = decodeInvitation(code.code)!;
            equal(invitation.offer, 'offer-of-a');
            // another device replies on the topic too, and something that is no reply
            await relay.fetch(`${DEFAULT_RELAY}/${invitation.topic}`, { method: 'POST', body: 'spam' });
            const other = await join(fakePeer('c').peer, invitation, BASE, { fetch: relay.fetch });
            const joined = await join(b.peer, invitation, BASE, { fetch: relay.fetch });
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

    it('should refuse a code two different replies came with: someone else holds the invitation', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const dropped: string[] = [];
        const inviting = await invite(a, relay, { dropped: () => dropped.push('dropped') });
        const invitation = invitationOf(inviting);
        const joined = await join(fakePeer('b').peer, invitation, BASE, { fetch: relay.fetch });
        // whoever holds the link reads the reply of B (the link carries the key), and publishes their own with its code
        const [sealed] = relay.state.published;
        const { code } = JSON.parse(await unseal(invitation.key, sealed!)) as { code: string };
        equal(code, joined.code);
        await relay.fetch(`${DEFAULT_RELAY}/${invitation.topic}`, {
            method: 'POST',
            body: await seal(invitation.key, JSON.stringify({ code, answer: 'answer-of-mallory' })),
        });
        // the same reply come twice is no conflict
        await relay.fetch(`${DEFAULT_RELAY}/${invitation.topic}`, { method: 'POST', body: sealed! });
        await sleep(2500);
        match((await failure(inviting.pair(code))).message, /Two different replies came with the code/);
        deepEqual(a.completed, []);
        // and the invitation is dropped
        deepEqual(dropped, ['dropped']);
        match((await failure(inviting.pair(code))).message, /dropped/);
    });

    it('should keep the first reply of a code: a later one pairs with none', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const inviting = await invite(a, relay);
        const invitation = invitationOf(inviting);
        const joined = await join(fakePeer('b').peer, invitation, BASE, { fetch: relay.fetch });
        await sleep(2500);
        // B's reply, read before the other one comes
        const pairing = inviting.pair(joined.code!);
        await relay.fetch(`${DEFAULT_RELAY}/${invitation.topic}`, {
            method: 'POST',
            body: await seal(invitation.key, JSON.stringify({ code: joined.code, answer: 'answer-of-mallory' })),
        });
        await pairing;
        deepEqual(a.completed, ['answer-of-b-to-offer-of-a']);
    });

    it('should give the reply as a link when the relay cannot take it, and pair with it', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const inviting = await invite(a, relay);
        try {
            relay.state.down = true;
            const joined = await join(fakePeer('b').peer, invitationOf(inviting), BASE, { fetch: relay.fetch });
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

    it('should send no reply once joining is cancelled', async function () {
        const relay = fakeRelay();
        const inviting = await invite(fakePeer('a'), relay);
        try {
            const cancelled = new AbortController();
            const joining = join(fakePeer('b').peer, invitationOf(inviting), BASE, { fetch: relay.fetch, signal: cancelled.signal });
            cancelled.abort();
            equal((await failure(joining)).name, 'AbortError');
            deepEqual(relay.state.published, []);
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
        const told: string[] = [];
        const inviting = await invite(first, relay, { channels, handedOff: () => told.push('first') });
        const another = await invite(second, relay, { channels, handedOff: () => told.push('second') });
        try {
            relay.state.down = true;
            const joined = await join(fakePeer('b').peer, invitationOf(another), BASE, { fetch: relay.fetch });
            // the reply link, opened in a page of its own on this device
            const answered = await handOff(decodeReply(readPairing(new URL(joined.link).hash)!.code)!, { wait: 2000, channels });
            deepEqual(answered, { paired: true });
            deepEqual(first.completed, []);
            deepEqual(second.completed, ['answer-of-b-to-offer-of-second']);
            deepEqual(told, ['second']);
            // a reply to no invitation of this device: no page answers
            assert.isNull(await handOff({ topic: 'arg2p-nobodyhere', answer: 'answer-x' }, { wait: 200, channels }));
        } finally {
            inviting.close();
            another.close();
        }
    });

    it('should wait for a pairing handed off as long as it takes, once the page of the invitation takes the reply', async function () {
        const relay = fakeRelay();
        const channels = fakeChannels();
        // a pairing slower than the page handing off waits for a page to take its reply
        const a = fakePeer('a', 400);
        const inviting = await invite(a, relay, { channels });
        const answered = await handOff({ topic: inviting.topic, answer: 'answer-of-b' }, { wait: 100, channels });
        deepEqual(answered, { paired: true });
        deepEqual(a.completed, ['answer-of-b']);
    });

    it('should tell the page handing off why the pairing failed', async function () {
        const relay = fakeRelay();
        const channels = fakeChannels();
        const inviting = await invite(fakePeer('a'), relay, { channels });
        deepEqual(await handOff({ topic: inviting.topic, answer: 'garbage' }, { wait: 500, channels }), { paired: false, message: 'not an answer' });
    });

    it('should drop an invitation: no reply pairs with it any longer, and a code waiting for its reply fails', async function () {
        const relay = fakeRelay();
        const a = fakePeer('a');
        const inviting = await invite(a, relay);
        const waiting = inviting.pair('ABCDE');
        const reply = { topic: invitationOf(inviting).topic, answer: 'answer-late' };
        inviting.close();
        match((await failure(waiting)).message, /dropped/);
        match((await failure(inviting.take(reply))).message, /dropped/);
        deepEqual(a.completed, []);
        // nor does it read the relay
        const reads = relay.reads();
        await sleep(2500);
        equal(relay.reads(), reads);
    });

    it('should wait for the last code typed alone', async function () {
        const relay = fakeRelay();
        const inviting = await invite(fakePeer('a'), relay);
        try {
            const first = inviting.pair('AAAAA');
            const second = inviting.pair('BBBBB');
            match((await failure(first)).message, /Another code was typed/);
            const joined = await join(fakePeer('b').peer, invitationOf(inviting), BASE, { fetch: relay.fetch });
            // the code of the reply typed after: the one waited for is that of the last call
            const third = inviting.pair(joined.code!);
            match((await failure(second)).message, /Another code was typed/);
            await third;
        } finally {
            inviting.close();
        }
    });

    it('should end once its lifetime is over, and read the relay no longer', async function () {
        const relay = fakeRelay();
        const dropped: string[] = [];
        const inviting = await invite(fakePeer('a'), relay, { lifetime: 100, dropped: () => dropped.push('dropped') });
        await sleep(200);
        deepEqual(dropped, ['dropped']);
        const reads = relay.reads();
        await sleep(2500);
        equal(relay.reads(), reads);
        match((await failure(inviting.pair('ABCDE'))).message, /dropped/);
    });

    it('should read the relay only while its page is shown, and end with it', async function () {
        const relay = fakeRelay();
        const page = fakePage();
        page.hide(true);
        const dropped: string[] = [];
        const inviting = await invite(fakePeer('a'), relay, { page: page.page, dropped: () => dropped.push('dropped') });
        // the first read, made as it started
        await sleep(2500);
        equal(relay.reads(), 1);
        page.hide(false);
        await sleep(100);
        equal(relay.reads(), 2);
        page.leave();
        deepEqual(dropped, ['dropped']);
        match((await failure(inviting.pair('ABCDE'))).message, /dropped/);
    });
});
