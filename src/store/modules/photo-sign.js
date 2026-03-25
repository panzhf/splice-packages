import { apiGetStatistic } from 'packages/api/photo-sign'
import { ck } from 'packages/utils'

export default {
  namespaced: true,
  state: () => ({
    photoSignCount: {
      total: undefined,
      month: undefined // 拍照打卡统计
    }
  }),
  mutations: {
    setPhotoSign(state, val) {
      state.photoSignCount = val
    }
  },
  actions: {
    updatePhotoSign({ commit }, payload) {
      apiGetStatistic(payload).then(res => {
        if (ck(res)) {
          commit('setPhotoSign', res.return_data)
        }
      })
    }
  }
}
