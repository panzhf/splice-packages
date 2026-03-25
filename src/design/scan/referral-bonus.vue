<template>
  <view v-if="dxmRegisInfo.RegisSuccess">
    <view class="referral-bonus" :style="containerStyle">{{ tipsText }}</view>
  </view>
</template>

<script>
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    dxmRegisInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      swiperHeight: '',
      activeIndex: 0,
      imgUrl: '',
      imgHeight: [],
      windowWidth: 750
    }
  },
  computed: {
    tipsText() {
      if (this.dxmRegisInfo.IsFrist) {
        // 首次
        return '恭喜，推荐返利信息登记成功！'
      } else {
        if (this.dxmRegisInfo.IsSelf) {
          return '您已经登记过推荐返利信息了！'
        } else {
          return '该码已经被别人登记过了！'
        }
      }
    },
    containerWidth() {
      // 间隙单位是px，转成rpx大概乘以2，两边间距再乘以2
      return this.windowWidth - (this.info.gap || 0) * 4
    },
    alignItems() {
      if (this.info.align === 'left') {
        return 'end'
      }
      if (this.info.align === 'center') {
        return 'center'
      }
      if (this.info.align === 'right') {
        return 'flex-end'
      }
      return ''
    },
    containerStyle() {
      let s = []
      s.push(`width: ${this.containerWidth}rpx`)
      s.push(`align-items: ${this.alignItems}`)
      s.push(`fontSize: ${(this.info.textFontSize || 0) * 2}rpx`)
      s.push(`color: ${this.info.textColor}`)
      s.push(`font-weight: ${this.info.fontWeight}`)
      s.push(`background-image: url(${this.info.bg})`)
      s.push(`margin-top: ${(this.info.topGap || 0) * 2}rpx`)
      return s.join(';')
    }
  },
  mounted() {},
  methods: {
    handleClick() {
      this.$emit('get-award')
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'referral-bonus';
.#{$prefix} {
  overflow: hidden;
  margin: 0 auto;
  height: 76rpx;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  padding: 0 90rpx;
  flex-direction: column;
  justify-content: center;
}
</style>
