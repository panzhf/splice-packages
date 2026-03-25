import { apiAdConfig } from 'packages/api/custom-ad.js'
import { ck } from 'packages/utils'
import { isCurrentDateTimeInRange } from 'packages/utils/function'

export default {
  namespaced: true,
  state: () => ({
    needUpgradeTip: false, // 是否需要升级提示
    transfertypename: '' // 转移类型名称
  }),
  mutations: {
    setNeedUpgradeTip(state, val) {
      state.needUpgradeTip = val
    },
    setTransferTypeName(state, val) {
      state.transfertypename = val
    }
  },
  actions: {
    updateNeedUpgradeTip({ commit }) {
      commit('setNeedUpgradeTip', false) // 重置状态
      commit('setTransferTypeName', '')
      return new Promise(resolve => {
        apiAdConfig().then(res => {
          let flag = false
          let type = ''
          if (ck(res, true) && res.return_data && res.return_data.evtransfertip) {
            type = res.return_data.transfertypename
            const { starttime, endtime } = res.return_data.evtransfertip
            if (isCurrentDateTimeInRange(starttime, endtime)) {
              flag = true
            }
          }
          commit('setNeedUpgradeTip', flag)
          commit('setTransferTypeName', type)
          resolve(flag)
        })
      })
    }
  }
}
