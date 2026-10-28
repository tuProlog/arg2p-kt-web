// What the pages of this device tell each other about a pairing (a reply link opens a page of its own, the invitation
// waits in another): with no solver in it, for the page to load it only once a federation is asked for

/** The channel of the pages of this device handing each other the reply to an invitation */
export const CHANNEL = 'arg2p-pairing';

export type PairingMessage = { type: 'reply'; code: string } | { type: 'paired' } | { type: 'failed'; message: string };

/** The Web Workers a federation runs on this device: one less than its processors, at most 4 (a phone has little memory to spare) */
export function workerCount(): number {
    return Math.max(1, Math.min(4, (globalThis.navigator?.hardwareConcurrency ?? 2) - 1));
}

/**
 * Hands [code], the reply to an invitation, to the page of this device that invited (a reply link opens a page of its
 * own): what that page answers, or null if none answers within [wait] milliseconds
 */
export function receiveReply(code: string, wait = 8000): Promise<{ paired: true } | { paired: false; message: string } | null> {
    if (typeof BroadcastChannel === 'undefined') return Promise.resolve(null);
    const channel = new BroadcastChannel(CHANNEL);
    return new Promise(resolve => {
        const done = (result: { paired: true } | { paired: false; message: string } | null) => {
            clearTimeout(timer);
            channel.close();
            resolve(result);
        };
        const timer = setTimeout(() => done(null), wait);
        channel.addEventListener('message', event => {
            const message = event.data as PairingMessage;
            if (message.type === 'paired') done({ paired: true });
            else if (message.type === 'failed') done({ paired: false, message: message.message });
        });
        channel.postMessage({ type: 'reply', code } satisfies PairingMessage);
    });
}
