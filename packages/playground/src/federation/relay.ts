// The public relay that the replies to invitations go through (see pairing.ts): ntfy (https://ntfy.sh, or one hosted
// elsewhere), whose topics anyone can publish to and read, from a page of any site (CORS). It sees what pairing.ts
// seals alone.

/** What the relay is reached with: fetch, as the browser has it, or a fake one for tests */
export type Fetch = (url: string, init?: { method?: string; body?: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

/** How often a topic is read, in milliseconds */
const POLL_EVERY = 2000;

export class Relay {
    private readonly base: string;

    /** The relay at [url] */
    constructor(
        url: string,
        private readonly fetch: Fetch = (input, init) => globalThis.fetch(input, init),
    ) {
        this.base = url.trim().replace(/\/+$/, '');
    }

    /** Publishes [message] on [topic]: fails when the relay cannot be reached, or refuses it */
    async publish(topic: string, message: string): Promise<void> {
        const response = await this.fetch(`${this.base}/${topic}`, { method: 'POST', body: message });
        if (!response.ok) throw new Error(`the relay answered ${response.status}`);
    }

    /**
     * Reads [topic] (its messages kept by the relay first) until stopped: [received] is given each message once,
     * [reached] whether the relay could be read each time that changes. Gives what stops it.
     */
    subscribe(topic: string, received: (message: string) => void, reached: (ok: boolean) => void = () => {}): () => void {
        const seen = new Set<string>();
        const controller = new AbortController();
        let since = 'all';
        let ok: boolean | null = null;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const tell = (now: boolean) => {
            if (now !== ok) reached((ok = now));
        };
        const poll = async () => {
            try {
                const response = await this.fetch(`${this.base}/${topic}/json?poll=1&since=${since}`, { signal: controller.signal });
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
                if (controller.signal.aborted) return;
                tell(false);
            }
            if (!controller.signal.aborted) timer = setTimeout(poll, POLL_EVERY);
        };
        void poll();
        return () => {
            controller.abort();
            clearTimeout(timer);
        };
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
