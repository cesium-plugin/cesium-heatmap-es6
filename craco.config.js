const webpack = require('webpack');
const CracoLessPlugin = require('craco-less');
const isEnvProduction = process.env.NODE_ENV === "production";
const CompressionWebpackPlugin = require("compression-webpack-plugin");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")
const CopyWebpackPlugin = require('copy-webpack-plugin');

const TerserPlugin = require('terser-webpack-plugin');
const plugins = [
    new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('./Cesium/')
    })]
if (isEnvProduction) {
    plugins.push(new CompressionWebpackPlugin({
        test: /\.(css|js)$/,
        // 只处理比1kb大的资源
        threshold: 1024,
        // 只处理压缩率低于90%的文件
        minRatio: 0.9
    }))
} else {
    // plugins.push(new BundleAnalyzerPlugin())
    plugins.push(new CopyWebpackPlugin({
        patterns: [
            { from: 'node_modules/cesium/Build/Cesium', to: 'Cesium' },
        ],
    }))
}
module.exports = {
    webpack: {
        plugins,
        configure: (config) => {
            config.entry = ['./src/index.tsx']
            const markdown = {
                test: /\.md$/,
                use: [
                    {
                        loader: require.resolve("html-loader")
                    },
                    {
                        loader: require.resolve('markdown-loader'),
                    }]
            }
            config.module.rules[1].oneOf.unshift(markdown)
            //移除cesium警告
            config.module.unknownContextCritical = false
            config.module.unknownContextRegExp = /\/cesium\/cesium\/Source\/Core\/buildModuleUrl\.js/
            config.externals = [{
                'cesium': 'Cesium',
            },]
            config.optimization = {
                minimizer: [new TerserPlugin({
                    extractComments: false,
                })],
            }
            return config
        }
    },
    devServer: (devServerConfig) => {
        devServerConfig.proxy = {
            '/3dtiles': { target: 'https://data1.mars3d.cn', secure: false, changeOrigin: true, },
            '/terrain': { target: 'http://data.marsgis.cn', secure: false, changeOrigin: true, },
            '/realspace/services/': { target: 'http://www.supermapol.com', secure: false, changeOrigin: true, },
            '/iserver/services/': { target: 'http://support.supermap.com.cn:8090', secure: false, changeOrigin: true, },
        }
        return devServerConfig;
    },
    plugins: [{
        plugin: CracoLessPlugin,
        options: {
            lessLoaderOptions: {
                lessOptions: {
                    modifyVars: {
                        // '@primary-color': '#73ffff'
                        '@font-size-base': '16px'
                    },
                    javascriptEnabled: true,
                },
            },
        },
    }],
};