const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const protocolPath = path.resolve(__dirname, '../protocol');

let appjson = require('./src/app.json');
let entries = appjson.pages.slice();
entries.unshift('app');

module.exports = {
    entry: entries.reduce((prev, next) => {
        prev[next] = './src/' + next;
        return prev;
    }, {}),
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        symlinks: false
    },
    module: {
        rules: [
            {
                test: v => v.startsWith(protocolPath),
                loader: 'tsrpc-protocol-loader',
                options: {
                    protocolPath: protocolPath
                }
            },
            { test: /\.ts$/, use: 'ts-loader' },
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            '**/*.{wxss,wxml,json}',
        ], { context: 'src' })
    ],
    devtool: 'source-map'
}