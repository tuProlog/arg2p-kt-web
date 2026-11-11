// Imported by the service worker of the playground (see vite.config.ts), before its routes: every response it gives is
// isolated across origins. GitHub Pages sends no such headers, and a browser gives SharedArrayBuffer only to isolated
// pages: the Web Workers of a cluster wait on it for one another (see WebWorkerCluster of @tuprolog/arg2p), and without it
// the cluster solves alone. A response of no origin of ours (opaque) is left as it is.
const respondWith = FetchEvent.prototype.respondWith;

FetchEvent.prototype.respondWith = function (response) {
    return respondWith.call(
        this,
        Promise.resolve(response).then(given => {
            if (given.status === 0) return given;
            const headers = new Headers(given.headers);
            headers.set('Cross-Origin-Opener-Policy', 'same-origin');
            headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
            return new Response(given.body, { status: given.status, statusText: given.statusText, headers });
        }),
    );
};
