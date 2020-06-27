const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
// const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const path = require('path')
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
    extensions: ['.tsx', '.ts', '.js'],
    "alias": {
      "react": "preact/compat",
      "react-dom": "preact/compat"
    }
  },

  devtool: 'source-map',

  stats: {
    children: false,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
    }),

    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
    // new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.(js|css)$/]),
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