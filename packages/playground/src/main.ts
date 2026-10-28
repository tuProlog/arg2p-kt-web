import './app.js';

// Installable, and usable offline: the service worker of the build alone (the dev server is always served fresh)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}
