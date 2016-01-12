var path = require('path')
var buildPath = path.resolve(__dirname, 'build')

var config = {
  context: __dirname,
  devtool: 'eval-source-map',
  entry: [
    path.resolve(__dirname, 'index.js')],
  output: {
    path: buildPath,
    filename: 'addressbar.js',
    libraryTarget: 'umd',
    library: 'addressbar'
  }
}

module.exports = config
