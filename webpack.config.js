const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entry: {
    ui: './src/index.tsx',
    code: './src/code.ts',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/},
      {test: /\.css$/, loader: [{loader: 'style-loader'}, {loader: 'css-loader'}]},
      {test: /\.(png|jpg|gif|webp|svg|zip)$/, loader: [{loader: 'url-loader'}]},
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    "alias": {
      "react": "preact/compat",
      "react-dom": "preact/compat"
    }
  },

  devtool: 'inline-source-map',

  stats: {
    children: false,
  },

  plugins: [
    new webpack.DefinePlugin({
      'global': {}
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
    }),
    new HtmlWebpackInlineSourcePlugin(),
    //new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*/]),
    new CompressionPlugin(),
  ],
};

const devConfig = {
  mode: 'development',
}

const prodConfig = {
  mode: 'production',
}

module.exports = isProduction
    ? merge(config, prodConfig)
    : merge(config, devConfig);