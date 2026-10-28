import { pairingLink } from './links.js';
import { Relay, type Fetch } from './relay.js';

// The pairing of two playgrounds, with no server of their own. The device that invites (A) shows one QR code: a link
// carrying its WebRTC invitation (see WebWorkerCluster.invite), a topic of a public relay (relay.ts) and a key, all of
// them new. The other device (B) opens it, accepts the invitation, and publishes its reply on the topic, sealed with
// the key (AES-GCM), together with a short code it shows. A reads the topic, and completes the pairing with the reply
// whose code the user types: the relay sees ciphertext alone, and the code tells A which reply comes from the device
// in front of the user.
//
// Should the relay fail, B shows its reply as a link too (#reply=), which A scans, pastes, or opens: a reply link
// opened on A opens a page of its own, which hands it to the page that invited (a BroadcastChannel), found by the
// topic of its invitation, so that no other page inviting on A takes it.

/** The relay replies go through when no other is set */
export const DEFAULT_RELAY = 'https://ntfy.sh';

/** How long accepting an invitation, or completing a pairing, is waited for, in milliseconds */
export const PAIRING_TIMEOUT = 30_000;

// The characters of the short codes: none that reads as another (0 and O, 1 and I and L)
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 5;

/** The channel of the pages of this device handing each other the replies to their invitations */
const CHANNEL = 'arg2p-pairing';

/** What pairs: the WebRTC of a cluster (see WebWorkerCluster) */
export interface Peer {
    invite(): Promise<string>;
    accept(invitation: string): Promise<string>;
    complete(reply: string): Promise<void>;
}

/** An invitation, as its link carries it: the WebRTC offer, the topic of the relay its replies go to, and their key */
export interface Invitation {
    readonly offer: string;
    readonly topic: string;
    readonly key: string;
    readonly relay: string;
}

/** A reply, as its link carries it: the topic of the invitation it answers, and the WebRTC answer */
export interface Reply {
    readonly topic: string;
    readonly answer: string;
}

// The codes of the links: their parts joined with dots, which neither base64 nor the topics use; the relay last, and
// only when it is not the default one, as its URL has dots of its own

export function encodeInvitation(invitation: Invitation): string {
    const parts = [invitation.topic, invitation.key, invitation.offer];
    return (invitation.relay === DEFAULT_RELAY ? parts : [...parts, invitation.relay]).join('.');
}

/** The invitation of the code of a link, or null when it is none */
export function decodeInvitation(code: string): Invitation | null {
    const [topic, key, offer, ...relay] = code.trim().split('.');
    if (!isToken(topic) || !isToken(key) || offer === undefined || offer === '') return null;
    return { topic, key, offer, relay: relay.length === 0 ? DEFAULT_RELAY : relay.join('.') };
}

export function encodeReply(reply: Reply): string {
    return `${reply.topic}.${reply.answer}`;
}

/** The reply of the code of a link, or null when it is none */
export function decodeReply(code: string): Reply | null {
    const at = code.indexOf('.');
    const topic = code.slice(0, at).trim();
    const answer = code.slice(at + 1).trim();
    return at === -1 || !isToken(topic) || answer === '' ? null : { topic, answer };
}

function isToken(text: string | undefined): text is string {
    return text !== undefined && /^[A-Za-z0-9_-]{8,64}$/.test(text);
}

/** A topic of the relay no one else picks: random */
export function newTopic(): string {
    return `arg2p-${base64url(random(12))}`;
}

/** A code to type, random */
export function newCode(): string {
    return [...random(CODE_LENGTH)].map(byte => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

/** [text], typed, as a code: what is not a character of the codes left out, in capitals */
export function normalCode(text: string): string {
    return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** A new key to seal the replies with (AES-GCM, 128 bits), as text */
export async function newKey(): Promise<string> {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 128 }, true, ['encrypt', 'decrypt']);
    return base64url(new Uint8Array(await crypto.subtle.exportKey('raw', key)));
}

/** [text] sealed with [key]: readable only with it */
export async function seal(key: string, text: string): Promise<string> {
    const iv = random(12);
    const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await importKey(key), new TextEncoder().encode(text));
    return base64url(concat(iv, new Uint8Array(sealed)));
}

/** What [sealed] says, opened with [key]: fails when it was sealed with another, or changed */
export async function unseal(key: string, sealed: string): Promise<string> {
    const bytes = fromBase64url(sealed);
    const opened = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, await importKey(key), bytes.slice(12));
    return new TextDecoder().decode(opened);
}

function importKey(key: string): Promise<CryptoKey> {
    return crypto.subtle.importKey('raw', fromBase64url(key), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

/** [promise], or a failure telling [what] took too long once [ms] milliseconds have passed */
export function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${what} took too long`)), ms);
        promise.then(
            value => {
                clearTimeout(timer);
                resolve(value);
            },
            error => {
                clearTimeout(timer);
                reject(error);
            },
        );
    });
}

// What the pages of this device tell each other about a reply, by the topic of the invitation it answers
type HandOff = { type: 'reply'; reply: Reply } | { type: 'paired'; topic: string } | { type: 'failed'; topic: string; message: string };

/** How the pages of this device reach each other: a BroadcastChannel, or none where there is none (or for tests) */
export type Channels = () => BroadcastChannel | null;

const broadcast: Channels = () => (typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL));

/** Where an invitation is from, and how its replies come */
export interface InvitingOptions {
    /** The relay the replies go through */
    readonly relay: string;
    /** The playground the link opens */
    readonly base: string;
    /** Told whether the relay can be read, each time that changes */
    readonly reached?: (ok: boolean) => void;
    /** Told when a reply opened in another page of this device paired */
    readonly handedOff?: () => void;
    readonly channels?: Channels;
    readonly fetch?: Fetch;
}

/**
 * An invitation of this device: its link, and the replies to it as they come, through the relay or from another page
 * of this device (a reply link opened on it), until it pairs or is dropped
 */
export class Inviting {
    /** The link of the invitation, to show as a QR code */
    readonly link: string;
    // the replies come through the relay, by their code
    private readonly replies = new Map<string, string>();
    // the code typed, waiting for its reply
    private wanted: { code: string; found(answer: string): void } | null = null;
    private readonly stopRelay: () => void;
    private readonly channel: BroadcastChannel | null;
    private closed = false;
    private busy = false;

    /** An invitation of [peer] */
    static async start(peer: Peer, options: InvitingOptions): Promise<Inviting> {
        const [offer, key] = await Promise.all([peer.invite(), newKey()]);
        return new Inviting(peer, { offer, key, topic: newTopic(), relay: options.relay }, options);
    }

    private constructor(
        private readonly peer: Peer,
        private readonly invitation: Invitation,
        options: InvitingOptions,
    ) {
        this.link = pairingLink(options.base, { kind: 'join', code: encodeInvitation(invitation) });
        const relay = new Relay(invitation.relay, options.fetch);
        this.stopRelay = relay.subscribe(invitation.topic, message => void this.received(message), options.reached);
        this.channel = (options.channels ?? broadcast)();
        this.channel?.addEventListener('message', event => void this.handedOff(event.data as HandOff, options.handedOff ?? (() => {})));
    }

    /** The topic of the relay the replies go to: the invitation, among those of the pages of this device */
    get topic(): string {
        return this.invitation.topic;
    }

    /** Pairs with the reply whose code is [code], once it comes (it may not have come yet) */
    async pair(code: string): Promise<void> {
        const wanted = normalCode(code);
        const answer =
            this.replies.get(wanted) ??
            (await withTimeout(
                new Promise<string>(found => (this.wanted = { code: wanted, found })),
                PAIRING_TIMEOUT,
                `Waiting for a reply with the code ${wanted}`,
            ).finally(() => (this.wanted = null)));
        await this.complete(answer);
        this.close();
    }

    /** Pairs with [reply] (a reply link scanned, pasted, or opened on this device): false when it answers another invitation */
    async take(reply: Reply): Promise<boolean> {
        if (reply.topic !== this.invitation.topic) return false;
        await this.complete(reply.answer);
        this.close();
        return true;
    }

    /** Drops the invitation: no reply pairs with it any longer */
    close(): void {
        this.closed = true;
        this.stopRelay();
        this.channel?.close();
    }

    // The pairing completed with [answer]: the invitation is closed by the caller, once it told what it has to
    private async complete(answer: string): Promise<void> {
        if (this.closed) throw new Error('This invitation was dropped: invite again.');
        if (this.busy) throw new Error('A reply is already completing the pairing.');
        this.busy = true;
        try {
            await withTimeout(this.peer.complete(answer), PAIRING_TIMEOUT, 'Completing the pairing');
        } finally {
            this.busy = false;
        }
    }

    // A message of the topic: a reply sealed with the key of the invitation, and its code (any other is let go)
    private async received(message: string): Promise<void> {
        try {
            const { code, answer } = JSON.parse(await unseal(this.invitation.key, message)) as { code?: unknown; answer?: unknown };
            if (typeof code !== 'string' || typeof answer !== 'string') return;
            this.replies.set(normalCode(code), answer);
            if (this.wanted?.code === normalCode(code)) this.wanted.found(answer);
        } catch {
            // not sealed with this key: not a reply to this invitation
        }
    }

    // A reply opened in another page of this device: this page pairs with it if it answers its invitation, and tells
    private async handedOff(message: HandOff, paired: () => void): Promise<void> {
        if (message.type !== 'reply' || message.reply.topic !== this.invitation.topic) return;
        try {
            await this.complete(message.reply.answer);
            this.channel?.postMessage({ type: 'paired', topic: message.reply.topic } satisfies HandOff);
            this.close();
            paired();
        } catch (error) {
            this.channel?.postMessage({ type: 'failed', topic: message.reply.topic, message: messageOf(error) } satisfies HandOff);
        }
    }
}

/** What joining an invitation gives the user to show: the code to type on the device that invited, and the reply as a link */
export interface Joined {
    /** The code, null when the relay could not take the reply */
    readonly code: string | null;
    readonly link: string;
    /** Why the relay could not take the reply */
    readonly relayError: string | null;
}

/** Joins [invitation] with [peer]: its reply goes through the relay, and is given as a link to the playground at [base] too */
export async function join(peer: Peer, invitation: Invitation, base: string, fetch?: Fetch): Promise<Joined> {
    const answer = await withTimeout(peer.accept(invitation.offer), PAIRING_TIMEOUT, 'Accepting the invitation');
    const link = pairingLink(base, { kind: 'reply', code: encodeReply({ topic: invitation.topic, answer }) });
    const code = newCode();
    try {
        await new Relay(invitation.relay, fetch).publish(invitation.topic, await seal(invitation.key, JSON.stringify({ code, answer })));
        return { code, link, relayError: null };
    } catch (error) {
        return { code: null, link, relayError: messageOf(error) };
    }
}

/**
 * Hands [reply], opened in this page, to the page of this device whose invitation it answers: whether it paired, or
 * null when no page answers within [wait] milliseconds
 */
export function handOff(reply: Reply, wait = 8000, channels: Channels = broadcast): Promise<{ paired: true } | { paired: false; message: string } | null> {
    const channel = channels();
    if (channel === null) return Promise.resolve(null);
    return new Promise(resolve => {
        const done = (result: { paired: true } | { paired: false; message: string } | null) => {
            clearTimeout(timer);
            channel.close();
            resolve(result);
        };
        const timer = setTimeout(() => done(null), wait);
        channel.addEventListener('message', event => {
            const message = event.data as HandOff;
            if (message.type === 'reply' || message.topic !== reply.topic) return;
            done(message.type === 'paired' ? { paired: true } : { paired: false, message: message.message });
        });
        channel.postMessage({ type: 'reply', reply } satisfies HandOff);
    });
}

/** The message of [error], whatever it is */
export function messageOf(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) return String(error.message);
    return String(error);
}

function random(length: number): Uint8Array<ArrayBuffer> {
    return crypto.getRandomValues(new Uint8Array(length));
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array<ArrayBuffer> {
    const joined = new Uint8Array(a.length + b.length);
    joined.set(a);
    joined.set(b, a.length);
    return joined;
}

function base64url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(byte => (binary += String.fromCharCode(byte)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(text: string): Uint8Array<ArrayBuffer> {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, char => char.charCodeAt(0));
}
