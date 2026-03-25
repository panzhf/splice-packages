<template>
  <view>
    <view class="go-active" :style="containerStyle" @click.native="handleClick">
      <!-- #ifdef H5 -->
      <drow-btn :info="{ ...guideInfo, ...info, height: '48px', width: `${containerWidth / 2}px` }" />
      <!-- #endif -->

      <!-- #ifdef MP-WEIXIN -->
      {{ info.tipsText }}
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
import DrowBtn from 'packages/design/scan/drow-btn.vue'
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
export default {
  name: 'GoActive',
  components: {
    DrowBtn
  },
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    guideInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
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
      s.push(`margin-top: ${this.info.topGap * 2}rpx`)
      s.push(`background: linear-gradient(to right, ${this.info.leftColor}, ${this.info.rightColor});`)
      s.push(`border-radius: ${(this.info.radius || 0) * 2}rpx`)
      s.push(`color: ${this.info.textColor}`)
      s.push(`font-size: ${this.info.textFontSize * 2}rpx`)
      s.push(`height: ${this.info.textFontSize * 2 + 60}rpx`)
      s.push(`line-height: ${this.info.textFontSize * 2 + 60}rpx`)
      s.push(`font-weight: ${this.info.fontWeight}`)
      return s.join(';')
    }
  },
  mounted() {},
  methods: {
    handleClick() {
      /* #ifdef MP-WEIXIN */
      navigateToMP({
        format: false,
        // appId: this.guideInfo.appid,
        path: this.guideInfo.path,
        scene: this.guideInfo.scene
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'go-active';
.#{$prefix} {
  overflow: hidden;

  margin: 0 auto;
  margin-top: -0.5px;
  margin-bottom: -0.5px;
  text-align: center;
}
</style>
