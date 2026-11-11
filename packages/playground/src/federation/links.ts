// The link to the federation of a server (an instance of Arg2P on the JVM or Node.js listening, as the extension of VS
// Code does): the playground opened with it (#federate=<the address of its WebSockets>, and &code=<its code> when it
// requires one) connects to it once the user agrees. In the fragment, which browsers do not send to the server.

/** A server of a federation: the address of its WebSockets (ws: or wss:), and the code it requires, if any */
export interface ServerLink {
    readonly url: string;
    readonly code: string | null;
}

/** The link to the playground at [base] opening the federation of [link] */
export function federationLink(base: string, link: ServerLink): string {
    const url = new URL(base);
    url.search = '';
    const params = new URLSearchParams({ federate: link.url });
    if (link.code !== null) params.set('code', link.code);
    url.hash = params.toString();
    return url.toString();
}

/** The server the fragment [hash] of a link carries (#federate=...), if any: null when it is none, or no WebSocket address */
export function readFederationLink(hash: string): ServerLink | null {
    const params = new URLSearchParams(hash.trim().replace(/^#/, ''));
    const address = params.get('federate');
    const url = address === null ? null : serverAddress(address);
    if (url === null) return null;
    const code = params.get('code')?.trim() ?? '';
    return { url, code: code === '' ? null : code };
}

/** [text] as the address of the WebSockets of a server (ws://host:port, wss://host:port), or null when it is none */
export function serverAddress(text: string): string | null {
    try {
        const url = new URL(text.trim());
        return (url.protocol === 'ws:' || url.protocol === 'wss:') && url.host !== '' ? url.toString().replace(/\/$/, '') : null;
    } catch {
        return null;
    }
}

/**
 * Why a page at [page] cannot reach [url], the address of a server: a page on https reaches wss addresses alone (and
 * ws ones on this very machine), as browsers refuse the others; null when it can
 */
export function unreachable(url: string, page: string): string | null {
    const server = new URL(url);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(server.hostname);
    if (new URL(page).protocol === 'https:' && server.protocol === 'ws:' && !local) {
        return 'A page on https reaches a server over wss:// alone: use the secure address of the server.';
    }
    return null;
}
