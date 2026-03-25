export default {
  namespaced: true,
  state: () => ({
    isloadcopyright: false,
    isshowlogo: 0, // 技术支持 1：隐藏
    isshowcomplaint: 0, // 投诉 1：隐藏
    // #ifdef H5
    complaintlink: ''
    // #endif
  }),
  mutations: {
    setCopyright(state, payload) {
      if (state.isloadcopyright) return
      state.isloadcopyright = true
      state.isshowlogo = payload.isshowlogo
      state.isshowcomplaint = payload.isshowcomplaint
      // #ifdef H5
      state.complaintlink = payload.complaintlink
      // #endif
    }
  }
}
