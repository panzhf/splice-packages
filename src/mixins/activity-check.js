export const activityCheckMixin = {
  methods: {
    checkBrand({ m, t = 1 } = {}) {
      let s = uni.getStorageSync('storeSettingInfo')
      if (!s) {
        uni.reLaunch({
          url: '/pages/login/index'
        })
        return false
      }
      let store = JSON.parse(s)
      if (store.memberLogin !== m) {
        this.brandConfirm({ t })
        return false
      }
      return true
    },
    brandConfirm({ t = 1 } = {}) {
      const o = {
        1: '参与', // 陈列有礼
        2: '报名' // 宴席有礼
      }
      uni.showModal({
        title: '获取数据异常',
        content: `请检查当前登录品牌商和${o[t]}活动时的品牌商是否一致`,
        showCancel: false,
        confirmText: '返回首页',
        success: ({ confirm }) => {
          confirm && uni.reLaunch({ url: '/pages/index/index' })
        }
      })
    }
  }
}
