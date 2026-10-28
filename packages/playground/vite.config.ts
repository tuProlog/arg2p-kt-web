import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// The version of a package as installed, shown in the page: its package.json is next to its module (which is all
// its exports give)
function versionOf(name: string): string {
    const manifest = join(dirname(fileURLToPath(import.meta.resolve(name))), 'package.json');
    return (JSON.parse(readFileSync(manifest, 'utf8')) as { version: string }).version;
}

export default defineConfig(({ command, isPreview }) => ({
    // published on GitHub Pages, under the name of the repository
    base: command === 'build' || isPreview ? '/arg2p-kt-web/' : '/',
    define: {
        __ARG2P_VERSION__: JSON.stringify(versionOf('@tuprolog/arg2p')),
    },
    // the worker of the solver is bundled on its own, with none of the plugins of the page
    worker: { format: 'es', plugins: () => [] },
    build: {
        target: 'es2022',
        // the solver alone is several MB: it is loaded in its worker, after the page
        chunkSizeWarningLimit: 6000,
    },
    plugins: [
        // The service worker precaches the build, so that the playground is installable and works offline; every build
        // makes a new one, which waits for the page to load it (see main.ts): taking over by itself, it would reload
        // a page in the middle of a run or of a pairing
        VitePWA({
            registerType: 'prompt',
            injectRegister: null,
            // the manifest is public/manifest.webmanifest, which index.html links
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
                maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
                // shared links carry their state in the query string (?s=...): they all open the precached page
                ignoreURLParametersMatching: [/.*/],
            },
        }),
    ],
    test: {
        include: ['test/**/*.test.ts'],
        environment: 'node',
        testTimeout: 60_000,
    },
}));
