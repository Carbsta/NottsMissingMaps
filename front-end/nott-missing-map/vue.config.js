var path = require('path');
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
module.exports = {
  publicPath: './',
  configureWebpack: {
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      new VuetifyLoaderPlugin()
    ],
  }
}
