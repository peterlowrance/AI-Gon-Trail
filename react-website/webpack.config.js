const path = require('path');
const webpack = require('webpack');

const isProduction = process.env.npm_lifecycle_script.includes('production');

module.exports = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',

    watch: !isProduction,
    watchOptions: {
        ignored: /node_modules/
    },

    entry: {
        'index': path.resolve(__dirname, 'src/index.tsx')
    },
    output: {
        path: path.resolve(__dirname, 'static/'),
        filename: '[name].js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
                },
                exclude: [
                    /node_modules/
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(svg|ico|png|gif|jpg|jpeg)(\?|$)/,
                loader: 'file-loader'
            }
        ]
    },
    cache: true,
    plugins: [
        new webpack.ProvidePlugin({'React': 'react'})
    ],

    optimization: {
        splitChunks: {
            cacheGroups: {
                eui: {
                    test: /[\\/]node_modules[\\/](@elastic)[\\/]/,
                    name: 'eui'
                },
                vender: {
                    test: /[\\/]node_modules[\\/](?!@elastic)/,
                    name: 'vender',
                    chunks: 'all'
                }
            }
        }
    }
}