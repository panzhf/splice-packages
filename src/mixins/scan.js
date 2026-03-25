export const scanCbMixin = {
  methods: {
    scanDataEvent(val, route = 1) {
      // 更多说明查看` src/packages/src/scan-templates/transfer.vue`
      // 0.自家平台中转 13.V积分平台（青岛啤酒）14.爱创码智联（青岛啤酒）17.One Code（宝洁）19.万佛
      // V积分：HTTP://VJ1.TV/ZT/NNV5E85CBYST7699JL
      // 码智联：HTTPS://T.LSA0.CN/M/000/8CH9V3XHV003
      // One Code：http://qa-scan.pg.com.cn/01/06903148145593/21/15220431000091814966?93=80781641
      // 万佛：https://y38.nb42.cn/w0wZH3b4jw0U
      const m = {
        'vj1.tv': 13,
        'lsa0.cn': 14,
        'scan.pg.com.cn': 17,
        'y38.nb42.cn': 19
      }
      let domain = (decodeURIComponent(val) || '').toLowerCase().match(/https?:\/\/([^/]+)\/.+/)?.[1]
      // 码智联 T.LSA0.CN | Q.LSA0.CN
      if (domain?.includes('lsa0.cn')) {
        domain = 'lsa0.cn'
      }
      // One Code qa-scan.pg.com.cn | scan.pg.com.cn
      if (domain?.includes('scan.pg.com.cn')) {
        domain = 'scan.pg.com.cn'
      }
      const transfer = m[domain] || 0
      // 扫码处理回调
      // 首页用1，扫码页用2
      uni[route === 2 ? 'redirectTo' : 'navigateTo']({
        url: `/packages/src/scan-templates/transfer?q=${val}&transfer=${transfer}`
      })
    }
  }
}

export const scanStyle1Mixin = {
  computed: {
    scanStyle() {
      return `padding: 0 ${(this.noWinPageSetting?.scanInfo?.gap || 0) * 2}rpx`
    }
  }
}

export const scanStyle2Mixin = {
  computed: {
    scanStyle() {
      return `padding: 0 ${(this.winPageSetting?.scanInfo?.gap || 0) * 2}rpx`
    }
  }
}

export const scanQrcodeMixin = {
  methods: {
    handleScan(type = 1) {
      // type: 1-组件回调 2-直接触发，搭配scanCbMixin使用
      // #ifdef MP-WEIXIN
      // 加入标识，防止触发onshow函数接口
      uni.setStorageSync('isScan', '1')
      uni.scanCode({
        success: res => {
          let { result } = res
          result = result.trim()
          if (!result) {
            return this.$msg('扫码失败，请重试')
          }
          const v = encodeURIComponent(result)
          if (type === 2) {
            this.scanDataEvent(v, 2)
            return
          }
          this.$emit('scanData', v)
        },
        fail: () => {
          this.$msg('扫码失败，请重试')
        },
        complete() {
          uni.removeStorageSync('isScan')
        }
      })
      // #endif
      /* #ifdef H5 */
      this.$wechat.scanQRCode({
        needResult: type === 3 ? 1 : 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
        success: res => {
          let { resultStr } = res // 当needResult 为 1 时，扫码返回的结果
          resultStr = resultStr.trim()
          const v = encodeURIComponent(resultStr)
          type === 3 && this.$emit('scanData', v)
        },
        fail: () => {
          this.$msg('扫码失败，请重试')
        }
      })
      /* #endif */
    }
  }
}
