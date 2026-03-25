export default {
  namespaced: true,
  state: () => ({
    needAuth: true // 用户信息授权
  }),
  mutations: {
    setNeedAuth(state, payload) {
      state.needAuth = payload
    }
  }
}
