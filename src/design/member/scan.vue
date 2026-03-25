<template>
  <view class="pr">
    <v-img size="900" class="scan-image" mode="widthFix" :src="scanData.imgUrl" @click.native="handleScan()" />
    <auth-button />
  </view>
</template>

<script>
import { scanQrcodeMixin } from 'packages/mixins/scan'
export default {
  mixins: [scanQrcodeMixin],
  props: {
    scanData: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.scan-image {
  display: block;
  width: 100%;
  margin: 0 auto;
}
</style>
