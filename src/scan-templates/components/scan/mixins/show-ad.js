import { apiGetExternalUserId } from 'packages/api/scan'
/* #ifdef H5 */
import { getQuery } from 'packages/utils/function'
/* #endif */
export const showAdMixin = {
  data() {
    return {
      showAdImg: false,
      adImg: ''
    }
  },
  methods: {
    setShowAdImg(val) {
      if (val.showImg) {
        // 未开已加企微不显示
        if (!val.showAddWx) this.showAdImg = true
        else this.getGetExternalUserId()
      } else {
        // 需重置，否则上一次显示后，其他页面配置不显示不会隐藏
        this.showAdImg = false
      }
      this.adImg = val?.imgInfo?.imgUrl || ''
    },
    getGetExternalUserId() {
      let params = {}
      /* #ifdef H5 */
      params = {
        memberlogin: getQuery('m'),
        openid: uni.getStorageSync('openId')
      }
      /* #endif */
      apiGetExternalUserId(params).then(res => {
        if (this.$ck(res)) {
          const { externaluserid } = res.return_data
          if (!externaluserid) {
            this.showAdImg = true
          }
        }
      })
    }
  }
}

export const showScanImgMixin = {
  data() {
    return {
      showScanImg: false,
      scanImg: ''
    }
  },
  methods: {
    setShowScanImg(val) {
      this.showScanImg = val?.showScan
      this.scanImg = val?.scanInfo?.imgUrl || ''
    }
  }
}
