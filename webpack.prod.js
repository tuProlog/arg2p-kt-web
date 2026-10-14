const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { GenerateSW } = require('workbox-webpack-plugin');

// The scripts and styles index.html loads from CDNs: precached with the app,
// so that the installed app also starts offline. Keep in sync with index.html.
const CDN_ASSETS = [
	'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
	'https://code.jquery.com/jquery-3.4.1.slim.min.js',
	'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
	'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js',
];

module.exports = merge(common, {
    mode: 'production',
    output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'prodDist'),
		publicPath: "/arg2p-kt-web/",
	},
	plugins: [
		// Service worker: precaches the build (so the app is installable and
		// works offline) and is regenerated on every build, so a deploy
		// replaces the cached version on the next start.
		new GenerateSW({
			swDest: 'service-worker.js',
			clientsClaim: true,
			skipWaiting: true,
			// The solver bundle is several MB.
			maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
			// The compressed copies are for the server, not the cache.
			exclude: [/\.gz$/, /\.LICENSE\.txt$/],
			additionalManifestEntries: CDN_ASSETS.map(url => ({ url, revision: null })),
			// Shared links carry the state in the query string (`?s=...`):
			// they all open the same precached page.
			ignoreURLParametersMatching: [/.*/],
			runtimeCaching: [{
				urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com'
					|| url.origin === 'https://fonts.gstatic.com',
				handler: 'StaleWhileRevalidate',
				options: { cacheName: 'fonts' }
			}]
		})
	],
});