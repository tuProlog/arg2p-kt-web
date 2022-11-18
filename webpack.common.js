const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
	entry: {
		"app": './app/control.mjs',
		"editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
		"arg2p": './app/common.js'
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [{
			test: /\.css$/,
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
