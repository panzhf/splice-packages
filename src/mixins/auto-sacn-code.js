export default {
  data() {
    return {
      scanTimer: null,
      autoScan: false, // 自动扫描状态
      firstSetMsg: true
    }
  },
  onUnload() {
    this.clearScanTimer()
  },
  computed: {
    isIphone() {
      const platform = uni.getSystemInfoSync().platform
      return platform === 'ios' || platform === 'devtools'
    }
  },
  methods: {
    initScanTimer() {
      if (this.firstSetMsg && this.isIphone) {
        this.firstSetMsg = false
        this.scanTimer = setTimeout(() => {
          this.$msg('识别困难，请点击右侧高清模式扫描', { duration: 5000 })
        }, 8000)
      }
    },
    handleWxscan({ scanType = ['qrCode', 'barCode'] } = {}) {
      this.isShowCamera = false
      this.autoScan = true
      uni.scanCode({
        onlyFromCamera: true,
        scanType: scanType,
        success: res => {
          this.isShowCamera = true
          this.throttle({
            detail: res
          })
        },
        fail: () => {
          this.isShowCamera = true
          this.autoScan = false
        }
      })
    },
    clearScanTimer() {
      this.scanTimer && clearTimeout(this.scanTimer)
      this.scanTimer = null
    }
  }
}
