const path = require('path');

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
  output: {
    path: path.join(__dirname, '.webpack/main'),
    filename: '[name].js',
  },
};
