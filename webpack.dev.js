const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    // File change events do not reach WSL for projects on the Windows drive
    // (/mnt/c), so the sources are polled instead.
    watchOptions: {
        poll: 1000,
        ignored: /node_modules/
    },
    devServer: {
        static: './dist',
        client: {
            overlay: false,
        }  
    },
});