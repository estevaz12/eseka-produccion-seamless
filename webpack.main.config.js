const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    index: './src/main.js',
    nserverMonitor: './src/utils/nserverMonitor.js',
  },
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    new Dotenv(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets/icons/icon.ico', to: 'assets/icons' },
        { from: 'src/assets/icons/error.ico', to: 'assets/icons' },
        { from: 'src/assets/icons/success.ico', to: 'assets/icons' },
      ],
    }),
  ],
  output: {
    path: path.join(__dirname, '.webpack/main'),
    filename: '[name].js',
  }
};
