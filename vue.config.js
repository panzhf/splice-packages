const path = require('path')
const resolve = dir => path.join(__dirname, dir)

module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('@', resolve('src')).set('packages', resolve('src'))
  },
  devServer: {
    proxy: {
      '/mock': {
        target: 'http://fwv2.t.miduonet.com',
        // target: 'http://192.168.5.240:8092/', // ����Ӫ��mock-server
        changeOrigin: true,
        pathRewrite: {
          '^/mock': ''
        }
      },
      '/mkt': {
        target: 'https://mkt.t.miduonet.com',
        changeOrigin: true,
        pathRewrite: {
          '^/mkt': ''
        }
      }
    }
  }
}
