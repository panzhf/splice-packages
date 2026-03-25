export const navigateMixin = {
  methods: {
    handleNavigate(url) {
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({ url })
      /* #endif */
      /* #ifdef H5 */
      location.href = url
      /* #endif */
    }
  }
}

export const propMixin = {
  props: {
    list: {
      type: Array,
      default: () => [] // 奖项数据
    },
    info: {
      type: Object,
      default: () => {}
    }
  }
}
