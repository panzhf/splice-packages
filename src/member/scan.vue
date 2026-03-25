<template>
  <view />
</template>

<script>
import { mapState } from 'vuex'
import { scanCbMixin } from 'packages/mixins/scan'
export default {
  mixins: [scanCbMixin],
  computed: {
    ...mapState('scanTransfer', ['transfer'])
  },
  onLoad() {
    uni.scanCode({
      success: res => {
        let { result } = res
        result = result.trim()
        if (!result) {
          this.$msg('扫码失败，请重试')
          return uni.navigateTo()
        }
        // 扫码处理回调
        // uni.redirectTo({
        //   url: `/packages/src/scan-templates/transfer?q=${encodeURIComponent(res.result)}&transfer=${this.transfer}`
        // })
        // 宝洁的码需完整二维码链接
        this.scanDataEvent(encodeURIComponent(result), 2)
      },
      fail: () => {
        uni.navigateBack()
      }
    })
  }
}
</script>
