const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    index: './src/main.js',
    server: './src/server.js',
  },
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [new Dotenv()],
  output: {
    path: path.join(__dirname, '.webpack/main'),
    filename: '[name].js',
  },
  externals: {
    'pdf-parse': 'commonjs pdf-parse',
  },
};
