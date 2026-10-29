import { readPairing, type PairingLink } from './federation/links.js';
import { read, type Shared } from './links.js';

// The links the playground is opened with: a setup shared (?s=, or the plain parameters, see links.ts), and a pairing
// (#join=, #reply=, see federation/links.ts). They come by the address the page loads with, by its fragment as it
// changes, and, in the installed app, by its launch queue: a link opened while the app is open focuses it (see
// launch_handler in the manifest) rather than loading another page.

/** What the links opening the playground are given to */
export interface LinkHandlers {
    /** A setup shared: what it carries, and what was wrong with it */
    shared(link: Shared): void;
    pairing(link: PairingLink): void;
}

// The launch queue of an installed app (not in every browser yet)
interface Launching {
    launchQueue?: { setConsumer(consumer: (params: { targetURL?: string }) => void): void };
}

/** How long after the page loads its launch queue may bring the address it loaded with once more, in milliseconds */
const LAUNCHED_WITHIN = 3000;

/**
 * Follows the links opened in [target], a window: each is given to [handlers] once, and what it carried leaves the
 * address bar, so that a reload does not open it again. The address the page loads with comes by its launch queue too,
 * right after it loads: that one is let go, and any link opened later is followed, the same link again included.
 * Gives what stops following them.
 */
export function followLinks(target: Window & Launching, handlers: LinkHandlers): () => void {
    let loaded: string | null = target.location.href;
    const until = Date.now() + LAUNCHED_WITHIN;
    // the launch queue keeps its consumer: once stopped, it is let be
    let following = true;
    // the link at [url]: [here], the address of the page, which leaves the address bar
    const take = (url: string, here: boolean) => {
        const { search, hash } = new URL(url, target.location.href);
        const shared = read(search);
        const sharing = shared.content !== null || shared.errors.length > 0;
        const pairing = readPairing(hash);
        if (here && (sharing || pairing !== null)) {
            const { pathname, search: kept, hash: left } = target.location;
            target.history.replaceState(null, '', pathname + (sharing ? '' : kept) + (pairing === null ? left : ''));
        }
        if (sharing) handlers.shared(shared);
        if (pairing !== null) handlers.pairing(pairing);
    };
    const changed = () => take(target.location.href, true);
    take(target.location.href, true);
    target.addEventListener('hashchange', changed);
    target.launchQueue?.setConsumer(({ targetURL }) => {
        if (targetURL === undefined || !following) return;
        const again = targetURL === loaded && Date.now() < until;
        loaded = null;
        if (!again) take(targetURL, false);
    });
    return () => {
        following = false;
        target.removeEventListener('hashchange', changed);
    };
}
