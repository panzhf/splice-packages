<template>
  <view class="no-active" :style="containerStyle">
    <image v-if="info.icon" class="no-active__image" mode="widthFix" :src="info.icon" />
    {{ msg || '啊哦，你不是门店负责人，不能参与活动！' }}
  </view>
</template>

<script>
export default {
  name: 'NoActive',
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    msg: {
      type: String,
      default: ''
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
      s.push(`color: ${this.info.textColor}`)
      s.push(`font-size: ${this.info.textFontSize * 2}rpx`)
      s.push(`font-weight: ${this.info.fontWeight}`)
      s.push(`margin-top: ${this.info.topGap * 2}rpx`)
      return s.join(';')
    }
  },
  mounted() {},
  methods: {
    handleClick() {
      this.$emit('click')
    },
    onSwiperChanged(e) {
      this.activeIndex = e.detail.current
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'no-active';
.#{$prefix} {
  margin: 0 auto;
  margin-top: -0.5px;
  margin-bottom: -0.5px;
  padding: 40rpx 0;

  text-align: center;
  &__image {
    display: block;

    width: 580rpx;
    margin: 0 auto;
  }
}
</style>
