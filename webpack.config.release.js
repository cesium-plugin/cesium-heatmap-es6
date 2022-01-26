const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin");
const CopyDirWebpackPlugin = require('./webapck-plugin-copy');
const config = require('./package.json');
const Webpack = require('webpack');
const rootPath = "./dist";

const p = new CleanWebpackPlugin()
p.removeFiles(["dist", "lib", "public/CesiumHeatmap"])
const plugins = [
    new Webpack.BannerPlugin({
        banner: `${config.name} v${config.version} - [filebase], [hash], ${new Date()}`
    }),
    new CopyDirWebpackPlugin([
        { from: path.resolve(__dirname, `${rootPath}`), to: path.resolve('./public/CesiumHeatmap/dist') },
        { from: path.resolve(__dirname, `./lib`), to: path.resolve('./public/CesiumHeatmap/lib') },//拷贝至静态目录测试umd
        { from: path.resolve(__dirname, `./docs`), to: path.resolve('./public/CesiumHeatmap/docs') },
    ]),
]
const entry = {}
entry[`${config.name}.umd`] = "./src/source/index.ts"
module.exports = {
    mode: "production",
    // mode: "development",
    // devtool:"eval",
    entry,
    output: {
        path: path.resolve(__dirname, rootPath),
        filename: `[name].js`,
        chunkFilename: '[name].[chunkhash].js',
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx'
        ],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'awesome-typescript-loader?silent=true&declaration=true&declarationDir=lib' },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader'],
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ]
            },
            { test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' }
        ]
    },
    plugins,
    externals: {
        "cesium": "Cesium"
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,//去掉license
            }),
        ],
    }
};