const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
	entry: {
		"app": './app/control.mjs',
		"editor.worker": 'monaco-editor/editor/editor.worker.js',
		"arg2p": './app/common.js'
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [{
			// The page's own stylesheet is inlined into index.html (see the
			// template), so the layout is there before the bundles run.
			test: /\.css$/,
			resourceQuery: /inline/,
			type: 'asset/source'
		}, {
			test: /\.css$/,
			resourceQuery: { not: [/inline/] },
			use: ['style-loader', 'css-loader']
		}, {
			test: /\.ttf$/,
			use: ['file-loader']
		},
		{
		  test: /\.js$/,
		  exclude: /node_modules/,
		  use: ["babel-loader"]
		},
		{
			test: /\.mjs$/,
			exclude: /node_modules/,
			use: ["babel-loader"]
		}]
	},
	resolve: {
		fallback: {
			fs: false
		}
	},
	plugins: [
		new NodePolyfillPlugin(),
		new CompressionPlugin(),
		new HtmlWebpackPlugin({
		  title: 'Arg2p Playground',
		  template: 'assets/index.html'
		})
	  ],
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
	},
};
