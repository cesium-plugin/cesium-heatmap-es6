const path = require('path');
const CopyDirWebpackPlugin = require('./webapck-plugin-copy');
const config = require('./package.json');
const Webpack = require('webpack');

const plugins = [
    new Webpack.BannerPlugin({
        banner: `${config.name} v${config.version} - [filebase], [hash], ${new Date()}`
    }),
    new CopyDirWebpackPlugin([
        {
            from: path.resolve(__dirname, `./src/source`),
            to: path.resolve('./dist'),
            skipts: true,//跳过ts
        },
    ]),
]

module.exports = {
    mode: "production",
    plugins,
};