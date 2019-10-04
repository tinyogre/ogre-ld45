const common = require('./webpack.common');
const merge = require('webpack-merge');
const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const webpack = require('webpack');
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');

const outputDir = 'dist';
const publicPath = '';
const tsConfig = 'tsconfig.prod.json';

// noinspection JSUnresolvedFunction
module.exports = merge(common, {
    output: {
        path: path.resolve(__dirname, outputDir),
        filename: '[name].bundle.min.js',
        publicPath: publicPath,
        crossOriginLoading: 'anonymous'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: false
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: false,
                            sass: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new FileManagerPlugin({
            onEnd: {
                copy: [
                    {
                        source: path.resolve(__dirname, 'assets'),
                        destination: path.resolve(__dirname, outputDir) + '/assets'
                    }
                ]
            }
        }),
        // new UglifyJSPlugin({
        //     sourceMap: true
        // }),
        // new SriPlugin({
        //     hashFuncNames: ['sha256', 'sha384']
        // }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
});
