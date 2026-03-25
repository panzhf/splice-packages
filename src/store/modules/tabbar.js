const state = () => ({
  tabBar: [], //tabBar数据
  tabbarSetting: {}, // 配色
  tabData: [] // tabBar显示数据（有效）
})

const mutations = {
  setTabBarData(state, val) {
    state.tabBar = val
  },
  setTabbarSetting(state, val) {
    state.tabbarSetting = val
  },
  setTabData(state, val) {
    state.tabData = val
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
