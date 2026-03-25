export const commonMixin = {
  data() {
    return {
      isShowExample: false, // 规则弹窗
      statusBarHeight: 20,
      windowHeight: 667
    }
  },
  computed: {
    top() {
      let style = `${44 + this.statusBarHeight}px`
      return style
    },
    ruleTop() {
      let style = ''
      style = `calc(${this.top} + 40rpx)`
      return style
    }
  },
  onReady() {
    try {
      const { statusBarHeight, windowHeight } = uni.getSystemInfoSync()
      this.statusBarHeight = statusBarHeight
      this.windowHeight = windowHeight
    } catch (error) {
      console.log(error)
    }
  }
}
