import './app.js';

// Installable, and usable offline: the service worker of the build alone (the dev server is always served fresh). A
// new version waits for the page to load it, which offers it once nothing would be lost (a run, a federation).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    import('virtual:pwa-register').then(({ registerSW }) => {
        const updateSW = registerSW({
            immediate: true,
            onNeedRefresh: () => document.querySelector('arg2p-playground')?.offerUpdate(() => void updateSW(true)),
        });
    });
}
