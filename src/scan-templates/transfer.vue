<template>
  <view>
    <!-- #ifdef MP-RETAIL -->
    <loading use-default />
    <!-- #endif -->
    <!-- #ifdef MP-MEMBER -->
    <loading />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiMiniSaoMa } from '../api/scan.js'
import { getParam } from '../utils/function.js'
import Loading from 'packages/components/loading/index.vue'
// #ifdef MP-RETAIL
import { getJsCode } from '@/utils/set-mp'
// #endif

export default {
  components: {
    Loading
  },
  data() {
    return {
      options: {},
      qrcode: '',
      domain: '', // 区域
      /**
       * 0.自家平台中转 1.爱创平台中转 2.贝怡乐平台中转 3.雪花-透云平台中转 4.泥坑酒-泰宝平台中转
       * 5.承德板城酒业-宏泰 6.百雀羚-弥特跳转 7.素莲丝 8.百年糊涂 9.蒙古王旧码 10.消时乐旧码 11.顺德酒厂旧码
       * 12.六颗核桃特殊码 13.V积分平台（青岛啤酒）14.爱创码智联（青岛啤酒）17.宝洁
       */
      transfer: 0,
      isnews: false, // 消息推送进来的
      loading: false // 防止重复请求
    }
  },
  onLoad(options) {
    this.options = options
    // 类似 http://f315.cc/m/0605/03raepm7ucorb4vf
    // 开发环境调试启动参数：q=http://f315.cc/m/0605/03raepm7ucorb4vf
    this.qrcode = options.q ? decodeURIComponent(options.q) : ''
    // 储存一遍码信息
    uni.setStorageSync('scanCodeInfo', this.qrcode)
    this.transfer = Number(options.transfer) || 0
    this.domain = options.domain || ''
    this.isnews = !!options.isnews || false
    // #ifdef MP-WEIXIN
    // 储存中转页的参数
    uni.setStorageSync('scanOptions', options)
    // #endif
  },
  async onShow() {
    let codeTicket = '' // 微信一物一码扫码带过来的参数
    if (this.transfer === 17) {
      // 宝洁：One Code码源是完整二维码
      codeTicket = this.qrcode
    } else if (this.qrcode.includes('panpass.com') && this.qrcode.includes('fw=')) {
      //金钢山：例：http://cx.panpass.com/?fw=7034289781983284
      codeTicket = getParam(this.qrcode, 'fw');
      this.transfer = 20;
    } else if (
      this.qrcode.includes('ztjoin.com') &&
      this.qrcode.includes('code=') &&
      this.qrcode.includes('pw=')
    ) {
      //慧明眼镜：例：http://cx.ztjoin.com/?code=2026021115021201&pw=123456
      const codeVal = getParam(this.qrcode, 'code')//小标
      const pwVal = getParam(this.qrcode, 'pw')
      codeTicket = codeVal && pwVal ? codeVal + pwVal : '';
      this.transfer = 21;//21-李白，22-悟空，23-哪吒，这里只传21，再通过后端接口判断区分
    } else {
      const index = this.qrcode.lastIndexOf('/')
      codeTicket = this.qrcode.substring(index + 1, this.qrcode.length)
    }
    if (!codeTicket) {
      return this.$msg('码格式不正确')
    }
    if (this.loading) return
    this.loading = true
    let params = {
      code_ticket: codeTicket,
      transfer: this.transfer,
      domain: this.domain
    }
    // #ifdef MP-RETAIL
    // 门店小程序添加中转参数
    const jscode = await getJsCode()
    uni.setStorageSync('jscode', jscode)
    params.authKey = jscode
    // #endif
    let res = await apiMiniSaoMa(params)
    this.loading = false
    if (this.$ck(res, false)) {
      // #ifdef MP-WEIXIN
      this.$log.info({
        api: 'ScanCode/minisaoma',
        response: JSON.stringify(res || {}),
        options: JSON.stringify(this.options),
        params: JSON.stringify(params)
      })
      // #endif
      uni.redirectTo({
        url: res.return_data.jumppath + `&isnews=${this.isnews}`
      })
    } else {
      // #ifdef MP-WEIXIN
      this.$log.error({
        api: 'ScanCode/minisaoma',
        response: JSON.stringify(res || {}),
        options: JSON.stringify(this.options),
        params: JSON.stringify(params)
      })
      // #endif
      uni.redirectTo({
        // 有些msg是中文的，且携带链接
        url: `/packages/src/scan-templates/error-page?msg=${encodeURIComponent(res.return_msg)}&pageType=-1`
      })
    }
  }
}
</script>
