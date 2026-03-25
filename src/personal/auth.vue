<template>
  <web-view :src="authSrc" @message="msgHandle"></web-view>
</template>

<script>
import { apiWithdrawOpenid } from 'packages/api/change.js'
export default {
  data() {
    return {
      authSrc: '',
      type: 0 // 1授权米多大数据引擎（提现openid） 2用户在品牌商公众号的openid
    }
  },
  methods: {
    async msgHandle(e) {
      // console.log('授权回调结果： \n', e)
      let { randomcode, AccessToken, openid } = e.detail.data[0]
      switch (this.type) {
        case 1:
          if (uni.getStorageSync('mdChangeCode') !== randomcode) {
            return false
          }
          await apiWithdrawOpenid({ code: randomcode, accesstoken: AccessToken })
          break
        // #ifdef MP-RETAIL
        case 2:
          this.$store.commit('setUserOpenid', openid)
          break
        // #endif
        default:
          break
      }
    }
  },
  onLoad(options) {
    this.type = Number(options.type)
    this.authSrc = uni.getStorageSync('mdChangeTargeturl')
  }
}
</script>
