// 扫码中转类型：宝洁有几个中转页需用上，参数不在页面之间传递，不利于维护
export default {
  namespaced: true,
  state: () => ({
    transfer: 0 // 0.自家平台中转 17.宝洁
  }),
  mutations: {
    setTransfer(state, transfer) {
      state.transfer = transfer
    }
  }
}
