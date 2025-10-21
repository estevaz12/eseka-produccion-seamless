const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    index: './src/main.js',
    server: './src/server.js',
    nserverMonitor: './src/utils/nserverMonitor.js',
  },
  // Put your normal webpack config below here
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new Dotenv(),
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets/icons/icon.ico', to: 'assets/icons' },
        { from: 'src/assets/icons/electronico.ico', to: 'assets/icons' },
        { from: 'src/assets/icons/error.ico', to: 'assets/icons' },
        { from: 'src/assets/icons/success.ico', to: 'assets/icons' },
      ],
    }),
  ],
  output: {
    path: path.join(__dirname, '.webpack/main'),
    filename: '[name].js',
  },
  externals: {
    pdfreader: 'commonjs2 pdfreader',
    pdfkit: 'commonjs2 pdfkit',
  },
};
