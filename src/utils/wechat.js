// 引入微信jssdk
const jweixin = require('jweixin-module')

const plugin = {
  install(Vue) {
    Vue.prototype.$wechat = jweixin
    Vue.wechat = jweixin
  },
  $wechat: jweixin
}

export default plugin
export const install = plugin.install
