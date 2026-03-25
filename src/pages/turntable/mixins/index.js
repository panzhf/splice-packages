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
    skin: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default: () => [] // 奖项数据
    },
    info: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    skinClass() {
      return `skin-${this.skin}`
    }
  }
}
