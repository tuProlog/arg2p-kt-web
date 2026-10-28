// The links of a pairing between two playgrounds (see pairing.ts): an invitation (#join=) opens the playground of the
// other device, which joins it there; a reply (#reply=) hands it to the page that invited. In the fragment, which
// browsers do not send to the server.

export type PairingKind = 'join' | 'reply';

/** A link of a pairing: what it is, and its code */
export interface PairingLink {
    readonly kind: PairingKind;
    readonly code: string;
}

/** The link to the playground at [base] carrying [link] */
export function pairingLink(base: string, link: PairingLink): string {
    const url = new URL(base);
    url.search = '';
    // the characters of the codes (base64, dots, the URL of a relay) are those of a fragment: the QR code of the link
    // stays as small as can be
    url.hash = `${link.kind}=${encodeURI(link.code)}`;
    return url.toString();
}

/** The link of a pairing the fragment [hash] of a link carries (#join=... or #reply=...), if any */
export function readPairing(hash: string): PairingLink | null {
    const match = /^#?(join|reply)=(.+)$/.exec(hash.trim());
    if (match === null) return null;
    try {
        const code = decodeURIComponent(match[2]!);
        return code === '' ? null : { kind: match[1] as PairingKind, code };
    } catch {
        return null;
    }
}

/**
 * The code of the kind [kind] in [text], as scanned or pasted: a link carrying it, or the code alone; null if the text
 * carries a pairing of the other kind
 */
export function codeIn(text: string, kind: PairingKind): string | null {
    const trimmed = text.trim();
    if (trimmed === '') return null;
    let hash: string | null = null;
    try {
        hash = new URL(trimmed).hash;
    } catch {
        // not a link: the code alone
    }
    if (hash === null) return trimmed;
    const pairing = readPairing(hash);
    return pairing !== null && pairing.kind === kind ? pairing.code : null;
}

// The launch queue of an installed app (not in every browser yet)
interface Launching {
    launchQueue?: { setConsumer(consumer: (params: { targetURL?: string }) => void): void };
}

/**
 * Follows the links of pairings opened in [target], a window: the one it was opened with, those opened in it once open
 * (its fragment changes), and those an installed playground is launched with (they focus the page open, see
 * launch_handler in the manifest, rather than load another). Each leaves the address bar, so that a reload does not
 * open it again, and is told [opened] once. Gives what stops following them.
 */
export function followPairingLinks(target: Window & Launching, opened: (link: PairingLink) => void): () => void {
    let last: string | null = null;
    const take = (url: string) => {
        const link = readPairing(new URL(url, target.location.href).hash);
        if (link === null) return;
        if (target.location.hash !== '') target.history.replaceState(null, '', target.location.pathname + target.location.search);
        // the link a page is launched with comes by its address and by the launch queue
        if (link.code === last) return;
        last = link.code;
        opened(link);
    };
    const changed = () => take(target.location.href);
    take(target.location.href);
    target.addEventListener('hashchange', changed);
    target.launchQueue?.setConsumer(params => params.targetURL !== undefined && take(params.targetURL));
    return () => target.removeEventListener('hashchange', changed);
}
