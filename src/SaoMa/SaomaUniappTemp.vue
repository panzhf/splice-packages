<template>
  <view v-if="!validTemp" class="tip">请检查扫码模板路径</view>
</template>

<script>
import { stringify } from './query-parse'
export default {
  data() {
    return {
      validTemp: true
    }
  },
  onLoad(options) {
    /* #ifdef H5 */
    uni.setStorageSync('firstUrl', location.href)
    /* #endif */

    if (!options.page) {
      this.validTemp = false
      return
    }

    uni.reLaunch({
      url: `/SaoMa/transfer?${stringify(options)}`
    })
  }
}
</script>
<style>
.tip {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
