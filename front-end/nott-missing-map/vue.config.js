var path = require('path')
module.exports = {
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, 'src')
      }
    },
  }
}
