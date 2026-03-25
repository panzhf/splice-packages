<template>
  <web-view :src="link" @message="onMessage" />
</template>

<script>
import {
  ruleUrl,
  // #ifdef MP-MEMBER || MP-GUIDE
  usercenterUrl,
  getExtConfig
  // #endif
} from '@/config'
export default {
  data() {
    return {
      link: ''
    }
  },
  onLoad(options) {
    const { pageType, applyNo } = options
    // #ifdef MP-MEMBER || MP-GUIDE
    const { memberLogin: m } = getExtConfig()
    // #endif
    // 传参有pageType表示协议页面，不传表示常规
    switch (pageType) {
      case 'rule':
        this.setInfo('规则中心', `${ruleUrl}pages/detail?applyno=${applyNo}`)
        break
      // #ifdef MP-MEMBER || MP-GUIDE
      case 'complaint':
        this.setInfo('我要投诉', `${usercenterUrl}usercenter/writecomplaint?m=${m}`)
        break
      case 'business':
        // 商家隐私声明
        this.setInfo('规则中心', `${ruleUrl}pages/detail?applyno=${applyNo}&m=${m}`)
        break
      // #endif
      default:
        this.link = uni.getStorageSync('webViewPath')
        break
    }
  },
  methods: {
    setInfo(title, url) {
      uni.setNavigationBarTitle({ title })
      this.link = url
    },
    onMessage(e) {
      // #ifdef MP-RETAIL
      if (e.detail.data[0].reply === 'agree') {
        const map = uni.getStorageSync('aiAgreeMap') || {}
        const key = uni.getStorageSync('aiAgreeKey')
        if (!map[key]) {
          map[key] = {
            agree: false,
            url: ''
          }
        }
        map[key].agree = true
        uni.setStorageSync('aiAgreeMap', map)
        uni.$emit('aiAgree')
      }
      uni.navigateBack()
      // #endif
    }
  }
}
</script>
