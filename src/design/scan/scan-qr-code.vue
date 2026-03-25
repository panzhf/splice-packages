<template>
  <view>
    <view class="scan-qr-code" :style="containerStyle">
      <v-img
        v-if="imgUrl"
        size="1000"
        class="adward-entrance__image"
        mode="widthFix"
        :src="imgUrl"
        @click.native="handleScan(mode)"
      />
    </view>
  </view>
</template>

<script>
import { scanQrcodeMixin } from 'packages/mixins/scan'
export default {
  mixins: [scanQrcodeMixin],
  props: {
    mode: {
      type: Number,
      default: 1 // 1.扫码模板扫一扫 3.自行处理扫码结果
    },
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      imgUrl: '',
      windowWidth: 750
    }
  },
  computed: {
    containerWidth() {
      // 间隙单位是px，转成rpx大概乘以2，两边间距再乘以2
      return this.windowWidth - (this.info.gap || 0) * 4
    },
    containerStyle() {
      let s = []
      s.push(`width: ${this.containerWidth}rpx`)
      s.push(`margin-top: ${(this.info.topGap || 0) * 2}rpx`)
      return s.join(';')
    }
  },
  watch: {
    info: {
      handler(val) {
        this.imgUrl = val.imgUrl
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'scan-qr-code';
.#{$prefix} {
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  margin-top: -0.5px;
  margin-bottom: -0.5px;
  &__item {
    display: flex;
    overflow: hidden;
  }
  .#{$prefix}__image {
    display: block;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
