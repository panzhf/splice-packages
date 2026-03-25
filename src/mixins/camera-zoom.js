// import cameraZoomMixin, { autoScanMixin } from 'packages/mixins/camera-zoom'
export default {
  data() {
    return {
      cameraCtx: null,
      maxZoom: 2,
      isZoom: false // 倍数放大（微信bug，部分安卓机：华为/荣耀/小米/VIVO/OPPO/三星等，maxzoom放大到40/60/80倍，可能有小数）
    }
  },
  methods: {
    initCtx(m) {
      let n = uni.getStorageSync('systemInfo') || uni.getSystemInfoSync()
      const mm = Math.floor(m)
      this.isZoom = /android/i.test(n.system) && [40, 60, 80].includes(mm)
      this.maxZoom = this.isZoom ? mm : m
      this.cameraCtx = uni.createCameraContext()
      // #ifdef MP-RETAIL || MP-SALE
      // 新经销和导购用的另外判断方式
      this.cameraInit = true
      // #endif
    },
    setZoom(m) {
      if (!m) {
        m = uni.getStorageSync('cameraZoom') || (this.isZoom ? 10 : 1)
      }
      this.cameraCtx.setZoom({
        zoom: m,
        fail: e => {
          this.$log.error({
            type: 'other',
            desc: 'camera setZoom',
            data: JSON.stringify(e)
          })
        }
      })
    }
  }
}

// 高清模式自动扫码，搭配cameraZoomMixin使用
export const autoScanMixin = {
  data() {
    return {
      cameraInit: false, // 初始化相机后，v-if渲染再次渲染无需提示
      scanTimer: null,
      autoScan: false // 自动扫码标记
    }
  },
  onUnload() {
    this.clearScanTimer()
  },
  beforeDestroy() {
    this.clearScanTimer()
  },
  methods: {
    // 扫描类型校验方法
    validateScanType(e) {
      // 兼容性判断：如果e.detail没有值，则不走扫码类型校验
      if (e.detail && e.detail.type) {
        // 扫码类型校验
        const isQRCode = e.detail.type === 'QR_CODE' || e.detail.type === 'qrcode'
        const isBarcode = e.detail.type === 'barcode'

        // 根据scanTypeMixin中的scanType数组来判断允许的扫描类型
        const allowQRCode = this.scanType.includes('qrCode')
        const allowBarcode = this.scanType.includes('barCode')

        if (isQRCode && !allowQRCode) return false // 不允许扫二维码
        if (isBarcode && !allowBarcode) return false // 不允许扫条形码
      }
      return true
    },
    initScanTimer() {
      if (this.cameraInit) return
      this.scanTimer = setTimeout(() => {
        this.$msg('识别困难，请点击右侧高清模式扫描', { duration: 5000 })
      }, 8000)
    },
    clearScanTimer() {
      this.scanTimer && clearTimeout(this.scanTimer)
      this.scanTimer = null
    },
    onChangeScan() {
      this.isShowCamera = false // 隐藏相机组件
      this.autoScan = true
      uni.scanCode({
        onlyFromCamera: true,
        scanType: this.scanType || ['qrCode', 'barCode'],
        success: res => {
          this.throttle({ detail: res })
        },
        fail: () => {
          this.isShowCamera = true
          this.autoScan = false
        }
      })
    }
  }
}

// 判断机型为iPhone
export const deviceMixin = {
  data() {
    return {
      isIOS: false
    }
  },
  mounted() {
    // 上报日志部分已存设备信息，若获取不到则重新获取。开发工具切换机型时可以先清缓存
    let n = uni.getStorageSync('systemInfo') || uni.getSystemInfoSync()
    this.isIOS = /ios/i.test(n.system)
    this.deviceCb && this.deviceCb()
  }
}

// 宴席有礼，扫一扫支持扫码类型配置
export const scanTypeMixin = {
  data() {
    return {
      scanType: ['qrCode', 'barCode']
    }
  },
  methods: {
    setScanType(info) {
      const s = []
      if (info.isqrcode) s.push('qrCode')
      if (info.isbarcode) s.push('barCode')
      this.scanType = s
    }
  }
}
