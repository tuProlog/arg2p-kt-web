// The codes of a pairing by hand between two playgrounds (see WebWorkerCluster.invite of @tuprolog/arg2p), as links: an
// invitation (#join=) opens the playground of the other device and accepts it there, a reply (#reply=) hands it to the
// page that invited. In the fragment, which browsers do not send to the server.

export type PairingKind = 'join' | 'reply';

/** A code of a pairing, and what it is */
export interface Pairing {
    readonly kind: PairingKind;
    readonly code: string;
}

/** The link to the playground at [base] carrying [pairing] */
export function pairingLink(base: string, pairing: Pairing): string {
    const url = new URL(base);
    url.search = '';
    // the characters of the codes (base64) are those of a fragment: the QR code of the link stays as small as can be
    url.hash = `${pairing.kind}=${encodeURI(pairing.code)}`;
    return url.toString();
}

/** The pairing the fragment [hash] of a link carries (#join=... or #reply=...), if any */
export function readPairing(hash: string): Pairing | null {
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
