const path = require('path')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const BundleTracker = require('webpack-bundle-tracker')

const publicPath = process.env.VUE_APP_PUBLIC_PATH || '/'
module.exports = {
  publicPath: publicPath,
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import '~@/assets/styles/variable.scss';
          @import '~@/assets/styles/mixin.scss';
        `,
      },
    },
  },
  configureWebpack: {
    plugins: [
      new StyleLintPlugin({
        files: ['src/**/*.{vue,html,css,scss}'],
        failOnError: false,
        cache: false,
        fix: false,
      }),
      new BundleTracker({
        path: __dirname,
        filename: 'webpack-stats.json'
      }),
    ],
    output: {
      filename: '[name].js',
      publicPath: publicPath
    },
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    port: 8080,
    devMiddleware: {
      publicPath: 'http://localhost:8080/',
    },
    hot: 'only',
  },
  // ... rest of your configuration (pwa, etc.) remains the same
}