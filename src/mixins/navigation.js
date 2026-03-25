export const setTitleMixin = {
  methods: {
    setTitle(title) {
      uni.setNavigationBarTitle({
        title
      })
    }
  }
}

export const setTitleColorMixin = {
  methods: {
    setTitleColor({ frontColor, backgroundColor }) {
      if (!['#ffffff', '#000000'].includes(frontColor)) throw new Error('前景色仅支持：#ffffff、#000000')
      uni.setNavigationBarColor({
        frontColor,
        backgroundColor
      })
    }
  }
}

export const setBgColorMixin = {
  methods: {
    setBackgroundColor({
      backgroundColor,
      backgroundColorTop = backgroundColor,
      backgroundColorBottom = backgroundColor
    }) {
      uni.setBackgroundColor({
        backgroundColor,
        backgroundColorTop,
        backgroundColorBottom
      })
    }
  }
}
