// base64url (RFC 4648, its alphabet for URLs, with no padding): the shared links, and the keys and the sealed replies
// of the pairings

/** [bytes] as base64url */
export function toBase64url(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(byte => (binary += String.fromCharCode(byte)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The bytes of [text], base64url: fails when it is none */
export function fromBase64url(text: string): Uint8Array<ArrayBuffer> {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(binary, char => char.charCodeAt(0));
}
