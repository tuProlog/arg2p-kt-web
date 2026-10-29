// The public relay that the replies to invitations go through (see pairing.ts): ntfy (https://ntfy.sh, or one hosted
// elsewhere), whose topics anyone can publish to and read, from a page of any site (CORS). It sees what pairing.ts
// seals alone.

/** What the relay is reached with: fetch, as the browser has it, or a fake one for tests */
export type Fetch = (url: string, init?: { method?: string; body?: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

/** How often a topic is read, in milliseconds */
const POLL_EVERY = 2000;

/** How long a request to the relay is waited for, in milliseconds: one that hangs is let go, and tried again */
const REQUEST_TIMEOUT = 10_000;

/** How the relay is reached: by default, fetch, each request waited for 10 s, a topic read every 2 s */
export interface RelayOptions {
    readonly fetch?: Fetch;
    /** How long a request is waited for, in milliseconds */
    readonly timeout?: number;
    /** How often a topic is read, in milliseconds */
    readonly every?: number;
}

/** A topic read (see Relay.subscribe) */
export interface Subscription {
    /** Reads it no longer: no message is given from now on */
    stop(): void;
    /** Reads it no longer until resumed (the page is hidden, say): the messages meanwhile come then */
    pause(): void;
    resume(): void;
}

/** The URL of a relay, [text] as typed or carried by a link: an absolute https URL, or null when it is not one */
export function relayUrl(text: string): string | null {
    try {
        const url = new URL(text.trim());
        if (url.protocol !== 'https:') return null;
        // the topics follow its path
        url.search = '';
        url.hash = '';
        return url.toString().replace(/\/+$/, '');
    } catch {
        return null;
    }
}

export class Relay {
    private readonly base: string;
    private readonly fetch: Fetch;
    private readonly timeout: number;
    private readonly every: number;

    /** The relay at [url]: fails when it is not an absolute https URL */
    constructor(url: string, options: RelayOptions = {}) {
        const base = relayUrl(url);
        if (base === null) throw new Error(`The relay must be an https address, not ${url}.`);
        this.base = base;
        this.fetch = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
        this.timeout = options.timeout ?? REQUEST_TIMEOUT;
        this.every = options.every ?? POLL_EVERY;
    }

    /** Publishes [message] on [topic]: fails when the relay cannot be reached, or refuses it, or [signal] aborts it */
    async publish(topic: string, message: string, signal?: AbortSignal): Promise<void> {
        const response = await this.fetch(`${this.base}/${topic}`, { method: 'POST', body: message, signal: this.bounded(signal) });
        if (!response.ok) throw new Error(`the relay answered ${response.status}`);
    }

    /**
     * Reads [topic] (its messages kept by the relay first) until stopped: [received] is given each message once,
     * [reached] whether the relay could be read each time that changes
     */
    subscribe(topic: string, received: (message: string) => void, reached: (ok: boolean) => void = () => {}): Subscription {
        const seen = new Set<string>();
        const controller = new AbortController();
        let since = 'all';
        let ok: boolean | null = null;
        let timer: ReturnType<typeof setTimeout> | undefined;
        // a read going on, and whether the reads are paused
        let reading = false;
        let paused = false;
        const tell = (now: boolean) => {
            if (now !== ok) reached((ok = now));
        };
        const next = () => {
            clearTimeout(timer);
            if (!controller.signal.aborted && !paused && !reading) timer = setTimeout(poll, this.every);
        };
        const poll = async () => {
            reading = true;
            try {
                const response = await this.fetch(`${this.base}/${topic}/json?poll=1&since=${since}`, { signal: this.bounded(controller.signal) });
                if (!response.ok) throw new Error(`the relay answered ${response.status}`);
                for (const line of (await response.text()).split('\n')) {
                    const event = parse(line);
                    if (event === null || seen.has(event.id)) continue;
                    seen.add(event.id);
                    since = event.id;
                    if (!controller.signal.aborted) received(event.message);
                }
                tell(true);
            } catch {
                if (!controller.signal.aborted) tell(false);
            } finally {
                reading = false;
            }
            next();
        };
        void poll();
        return {
            stop: () => {
                controller.abort();
                clearTimeout(timer);
            },
            pause: () => {
                paused = true;
                clearTimeout(timer);
            },
            resume: () => {
                if (!paused || controller.signal.aborted) return;
                paused = false;
                if (!reading) void poll();
            },
        };
    }

    // [signal], and the timeout of a request: one that hangs fails, rather than stopping the reads for ever
    private bounded(signal: AbortSignal | undefined): AbortSignal {
        const timeout = AbortSignal.timeout(this.timeout);
        return signal === undefined ? timeout : AbortSignal.any([signal, timeout]);
    }
}

// A message of the relay, a line of JSON: null for anything else (the events that keep the connection, say)
function parse(line: string): { id: string; message: string } | null {
    try {
        const event = JSON.parse(line) as { id?: unknown; event?: unknown; message?: unknown };
        return event.event === 'message' && typeof event.id === 'string' && typeof event.message === 'string' ? { id: event.id, message: event.message } : null;
    } catch {
        return null;
    }
}
