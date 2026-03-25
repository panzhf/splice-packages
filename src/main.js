// #ifdef H5
/* eslint-disable */
__webpack_public_path__ = window.staticResourceURLPrefix || '/'
// #endif

import Vue from 'vue'
import App from './App'
import store from './store'
import uView from 'uview-ui-v1'
import MdUtils from 'miduo-utils'
import { ck, msg, loading } from '@/utils/index'
Vue.use(uView)
Vue.use(MdUtils) // 挂载toLowerKey到全局
// #ifdef H5
import vImg from './components/imgs'
import wechat from '@/utils/wechat.js'
Vue.use(wechat)
/* #ifdef H5-SCAN */
import { VueJsonp } from 'vue-jsonp'
Vue.use(VueJsonp)
/* #endif */
Vue.component('VImg', vImg)
// #endif
Vue.prototype.$store = store
Vue.prototype.$ck = ck
Vue.prototype.$msg = msg
Vue.prototype.$loading = loading

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
