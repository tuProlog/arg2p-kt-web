import { fromBase64url, toBase64url } from '../base64url.js';
import { messageOf } from '../errors.js';
import { pairingLink } from './links.js';
import { Relay, relayUrl, type Fetch, type Subscription } from './relay.js';

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
//
// Whoever holds the link of an invitation (it carries the key) can read the replies, and publish one of their own with
// the code of another: A keeps the first reply of each code, and pairs with no code two different replies came with.
// An invitation lasts INVITATION_LIFETIME, reads the relay only while its page is shown, and ends with its page.

/** The relay replies go through when no other is set */
export const DEFAULT_RELAY = 'https://ntfy.sh';

/** How long accepting an invitation, or completing a pairing, is waited for, in milliseconds */
export const PAIRING_TIMEOUT = 30_000;

/** How long an invitation lasts, in milliseconds: then it is dropped, and reads the relay no longer */
export const INVITATION_LIFETIME = 10 * 60_000;

/** How long a reply opened in a page of its own waits for the page of its invitation to take it, in milliseconds */
const HAND_OFF_WAIT = 5000;

// The characters of the short codes: none that reads as another (0 and O, 1 and I and L)
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 5;

/** What a dropped invitation fails with */
const DROPPED = 'This invitation was dropped: invite again.';

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

/** The invitation of the code of a link, or null when it is none (its relay elsewhere is no https address, say) */
export function decodeInvitation(code: string): Invitation | null {
    const [topic, key, offer, ...rest] = code.trim().split('.');
    const relay = rest.length === 0 ? DEFAULT_RELAY : relayUrl(rest.join('.'));
    if (!isToken(topic) || !isToken(key) || offer === undefined || offer === '' || relay === null) return null;
    return { topic, key, offer, relay };
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
    return `arg2p-${toBase64url(random(12))}`;
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
    return toBase64url(new Uint8Array(await crypto.subtle.exportKey('raw', key)));
}

/** [text] sealed with [key]: readable only with it */
export async function seal(key: string, text: string): Promise<string> {
    const iv = random(12);
    const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await importKey(key), new TextEncoder().encode(text));
    return toBase64url(concat(iv, new Uint8Array(sealed)));
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

// What the pages of this device tell each other about a reply, by the topic of the invitation it answers: the page of
// the invitation tells at once that it takes the reply, then whether it paired
type HandOff =
    | { type: 'reply'; reply: Reply }
    | { type: 'taking'; topic: string }
    | { type: 'paired'; topic: string }
    | { type: 'failed'; topic: string; message: string };

/** How the pages of this device reach each other: a BroadcastChannel, or none where there is none (or for tests) */
export type Channels = () => BroadcastChannel | null;

const broadcast: Channels = () => (typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL));

/** The page an invitation is shown in: its window, or a fake one for tests */
export type Page = Pick<Window, 'addEventListener' | 'removeEventListener'> & {
    readonly document: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>;
};

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
    /** Told when the invitation ends with no pairing, by itself: its lifetime over, its page gone, its pairing failed */
    readonly dropped?: () => void;
    /** How long it lasts, in milliseconds: INVITATION_LIFETIME unless told */
    readonly lifetime?: number;
    /** The page it is shown in: the window unless told (none: it lasts its lifetime, whatever the page does) */
    readonly page?: Page | null;
    readonly channels?: Channels;
    readonly fetch?: Fetch;
}

// A code typed, waiting for its reply
interface Wanted {
    readonly code: string;
    found(answer: string): void;
    failed(error: Error): void;
}

/**
 * An invitation of this device: its link, and the replies to it as they come, through the relay or from another page
 * of this device (a reply link opened on it), until it pairs or is dropped
 */
export class Inviting {
    /** The link of the invitation, to show as a QR code */
    readonly link: string;
    // the replies come through the relay, by their code: the first of each
    private readonly replies = new Map<string, string>();
    // the codes another reply came with after the first: someone else holds the invitation, and neither pairs
    private readonly conflicts = new Set<string>();
    // the messages of the relay, opened one after the other: a code typed waits for those come so far
    private opened: Promise<void> = Promise.resolve();
    private wanted: Wanted | null = null;
    private readonly subscription: Subscription;
    private readonly channel: BroadcastChannel | null;
    // what stops its lifetime, and the following of its page
    private readonly ending: () => void;
    private closed = false;
    private paired = false;
    private busy = false;

    /** An invitation of [peer] */
    static async start(peer: Peer, options: InvitingOptions): Promise<Inviting> {
        const [offer, key] = await Promise.all([peer.invite(), newKey()]);
        return new Inviting(peer, { offer, key, topic: newTopic(), relay: options.relay }, options);
    }

    private constructor(
        private readonly peer: Peer,
        private readonly invitation: Invitation,
        private readonly options: InvitingOptions,
    ) {
        this.link = pairingLink(options.base, { kind: 'join', code: encodeInvitation(invitation) });
        const relay = new Relay(invitation.relay, { fetch: options.fetch });
        this.subscription = relay.subscribe(invitation.topic, message => this.received(message), options.reached);
        this.channel = (options.channels ?? broadcast)();
        this.channel?.addEventListener('message', event => void this.handedOff(event.data as HandOff));
        this.ending = this.live(options.page === undefined ? (typeof window === 'undefined' ? null : window) : options.page);
    }

    /** The topic of the relay the replies go to: the invitation, among those of the pages of this device */
    get topic(): string {
        return this.invitation.topic;
    }

    /** Pairs with the reply whose code is [code], once it comes (it may not have come yet) */
    async pair(code: string): Promise<void> {
        if (this.closed) throw new Error(DROPPED);
        const wanted = normalCode(code);
        const answer = this.replies.get(wanted) ?? (await this.reply(wanted));
        // the replies come with it opened as well: another one with its code is someone else's
        await this.opened;
        if (this.conflicts.has(wanted)) {
            this.close();
            throw new Error(`Two different replies came with the code ${wanted}: someone else has the invitation too. Invite again, and show it to the other device alone.`);
        }
        await this.complete(answer);
    }

    /** Pairs with [reply] (a reply link scanned, pasted, or opened on this device): false when it answers another invitation */
    async take(reply: Reply): Promise<boolean> {
        if (reply.topic !== this.invitation.topic) return false;
        await this.complete(reply.answer);
        return true;
    }

    /** Drops the invitation: no reply pairs with it any longer, and a code waiting for its reply fails */
    close(): void {
        if (this.closed) return;
        this.closed = true;
        this.subscription.stop();
        this.channel?.close();
        this.ending();
        this.wanted?.failed(new Error(DROPPED));
        this.wanted = null;
        if (!this.paired) this.options.dropped?.();
    }

    // The reply with the code [code], once it comes: a failure once PAIRING_TIMEOUT has passed, the invitation is
    // dropped, or another code is typed
    private reply(code: string): Promise<string> {
        this.wanted?.failed(new Error(`Another code was typed than ${this.wanted.code}.`));
        let wanted: Wanted | null = null;
        const found = new Promise<string>((resolve, reject) => (wanted = { code, found: resolve, failed: reject }));
        this.wanted = wanted;
        return withTimeout(found, PAIRING_TIMEOUT, `Waiting for a reply with the code ${code}`).finally(() => {
            if (this.wanted === wanted) this.wanted = null;
        });
    }

    // The pairing completed with [answer], what came of it [told] (null: paired), then the invitation ended, paired or
    // not: its offer is spent on the first reply tried, and no later reply completes one that took too long
    private async complete(answer: string, told: (error: unknown) => void = () => {}): Promise<void> {
        if (this.closed) throw new Error(DROPPED);
        if (this.busy) throw new Error('A reply is already completing the pairing.');
        this.busy = true;
        let failure: unknown = null;
        try {
            await withTimeout(this.peer.complete(answer), PAIRING_TIMEOUT, 'Completing the pairing');
            this.paired = true;
        } catch (error) {
            failure = error;
        }
        this.busy = false;
        told(this.paired ? null : failure);
        this.close();
        if (!this.paired) throw failure;
    }

    // A message of the topic: a reply sealed with the key of the invitation, and its code (any other is let go)
    private received(message: string): void {
        this.opened = this.opened.then(async () => {
            let reply: { code?: unknown; answer?: unknown };
            try {
                reply = JSON.parse(await unseal(this.invitation.key, message)) as typeof reply;
            } catch {
                // not sealed with this key: not a reply to this invitation
                return;
            }
            if (typeof reply.code !== 'string' || typeof reply.answer !== 'string') return;
            const code = normalCode(reply.code);
            const first = this.replies.get(code);
            if (first === undefined) {
                this.replies.set(code, reply.answer);
                if (this.wanted?.code === code) this.wanted.found(reply.answer);
            } else if (first !== reply.answer) {
                this.conflicts.add(code);
            }
        });
    }

    // A reply opened in another page of this device: this page takes it if it answers its invitation, and tells
    private async handedOff(message: HandOff): Promise<void> {
        if (message.type !== 'reply' || message.reply.topic !== this.invitation.topic || this.closed) return;
        const topic = message.reply.topic;
        let told = false;
        const tell = (error: unknown) => {
            told = true;
            this.tell(error === null ? { type: 'paired', topic } : { type: 'failed', topic, message: messageOf(error) });
        };
        this.tell({ type: 'taking', topic });
        try {
            await this.complete(message.reply.answer, tell);
            this.options.handedOff?.();
        } catch (error) {
            // told already, unless it never started completing (another reply was)
            if (!told) tell(error);
        }
    }

    // [message] to the other pages of this device: none once the invitation is dropped
    private tell(message: HandOff): void {
        try {
            this.channel?.postMessage(message);
        } catch {
            // the channel is closed
        }
    }

    // Drops the invitation once its lifetime is over, or [page] goes; the relay is read only while the page is shown.
    // Gives what stops it.
    private live(page: Page | null): () => void {
        const timer = setTimeout(() => this.close(), this.options.lifetime ?? INVITATION_LIFETIME);
        if (page === null) return () => clearTimeout(timer);
        const shown = () => (page.document.hidden ? this.subscription.pause() : this.subscription.resume());
        const gone = () => this.close();
        shown();
        page.document.addEventListener('visibilitychange', shown);
        page.addEventListener('pagehide', gone);
        return () => {
            clearTimeout(timer);
            page.document.removeEventListener('visibilitychange', shown);
            page.removeEventListener('pagehide', gone);
        };
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

/** How an invitation is joined: the relay reached with [fetch], and [signal] cancelling the joining */
export interface JoinOptions {
    readonly fetch?: Fetch;
    readonly signal?: AbortSignal;
}

/**
 * Joins [invitation] with [peer]: its reply goes through the relay, and is given as a link to the playground at [base]
 * too. Cancelled, it fails, and sends the device that invited no reply.
 */
export async function join(peer: Peer, invitation: Invitation, base: string, options: JoinOptions = {}): Promise<Joined> {
    const answer = await withTimeout(peer.accept(invitation.offer), PAIRING_TIMEOUT, 'Accepting the invitation');
    options.signal?.throwIfAborted();
    const link = pairingLink(base, { kind: 'reply', code: encodeReply({ topic: invitation.topic, answer }) });
    const code = newCode();
    try {
        const sealed = await seal(invitation.key, JSON.stringify({ code, answer }));
        await new Relay(invitation.relay, { fetch: options.fetch }).publish(invitation.topic, sealed, options.signal);
        return { code, link, relayError: null };
    } catch (error) {
        options.signal?.throwIfAborted();
        return { code: null, link, relayError: messageOf(error) };
    }
}

/** What handing a reply off gives: whether it paired, or null when no page of this device took it */
export type HandedOff = { paired: true } | { paired: false; message: string } | null;

/** How a reply is handed off: how long a page is waited for to take it, in milliseconds, and the pages of this device */
export interface HandOffOptions {
    readonly wait?: number;
    readonly channels?: Channels;
}

/**
 * Hands [reply], opened in this page, to the page of this device whose invitation it answers: whether it paired, or
 * null when no page takes it in time. Once a page takes it, its pairing is waited for as long as a pairing may take.
 */
export function handOff(reply: Reply, options: HandOffOptions = {}): Promise<HandedOff> {
    const channel = (options.channels ?? broadcast)();
    if (channel === null) return Promise.resolve(null);
    return new Promise(resolve => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const done = (result: HandedOff) => {
            clearTimeout(timer);
            channel.close();
            resolve(result);
        };
        const wait = (ms: number, result: HandedOff) => {
            clearTimeout(timer);
            timer = setTimeout(() => done(result), ms);
        };
        wait(options.wait ?? HAND_OFF_WAIT, null);
        channel.addEventListener('message', event => {
            const message = event.data as HandOff;
            if (message.type === 'reply' || message.topic !== reply.topic) return;
            if (message.type === 'taking') wait(PAIRING_TIMEOUT + HAND_OFF_WAIT, { paired: false, message: 'The page that invited did not tell whether it paired.' });
            else done(message.type === 'paired' ? { paired: true } : { paired: false, message: message.message });
        });
        channel.postMessage({ type: 'reply', reply } satisfies HandOff);
    });
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
