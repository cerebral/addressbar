var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'build');

var config = {
  entry: path.resolve(__dirname, 'index.js'),
  devtool: 'eval-source-map',
  output: {
    filename: 'bundle.js',
    libraryTarget: 'umd',
    library: 'addressbar'
  }
};

module.exports = config;
