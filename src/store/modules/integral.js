export default {
  namespaced: true,
  state: () => ({
    isInitCategoryConfig: false, // 如果一开始没有配置，进入全部礼品页先加载配置
    giftCategoryConfig: {
      mode: 1,
      showCategory: true,
      Title: '全部礼品'
    }
  }),
  mutations: {
    setGiftCategory(state, val) {
      state.isInitCategoryConfig = true
      state.giftCategoryConfig = val
    },
    setInitConfig(state, val) {
      state.isInitCategoryConfig = val
    }
  }
}
