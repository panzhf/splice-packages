import { apiGetWaitSubsidygoodsvoucherstatistics } from 'packages/api/writeoff'
const commonMixin = {
  data() {
    return {
      activityTabIndex: 0,
      showType: 1, // 默认产品
      sourceStatistics: [],
      validNumInfo: {},
      voucherCount: 0
    }
  },
  computed: {
    tabId() {
      return this.activityTabIndex + 1
    },
    showEmpty() {
      return !this.loading && (this.showType === 0 ? !this.sourceStatistics.length : !this.loading && !this.list.length)
    }
  },
  onPullDownRefresh() {
    this.handleTabChange(this.showType)
  },
  onLoad(options) {
    this.activityTabIndex = Number(options.tab || 0)
    this.initData()
  },
  onShow() {
    // 先请求一次有效期数据
    this.activityTabIndex === 0 && this.getWaitVoucherstatistics()
  },
  methods: {
    getWaitVoucherstatistics() {
      apiGetWaitSubsidygoodsvoucherstatistics().then(res => {
        let { validlessthenthirtydaycount, validlessthensevendaycount } = res.return_data
        this.validNumInfo = {
          validcount: validlessthenthirtydaycount,
          validlessthensevendaycount
        }
      })
    },
    getVoucherData() {
      if (this.showType === 0) {
        this.getVoucherStatistics()
      } else {
        this.getData()
      }
    },
    async handleVoucherStatistics(res) {
      uni.stopPullDownRefresh()
      if (this.$ck && this.$ck(res, true)) {
        let { sourcestatistics, totalcount } = res.return_data
        this.voucherCount = totalcount
        this.loading = false
        this.hasMore = false
        this.sourceStatistics = sourcestatistics
      }
    },
    handleTabChange(val) {
      this.showType = val
      this.resetData()
      this.getVoucherData()
    },
    getOtherParams(item) {
      return `validDay=${item.validDay}&sourcetype=${item.sourcetype}`
    }
  }
}
export default commonMixin
