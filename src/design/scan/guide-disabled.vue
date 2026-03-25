<template>
  <view class="no-guide-tag" :style="containerStyle">
    <image class="no-guide-tag__image" mode="widthFix" :src="icon" />
    <view :style="titleStyle">{{ info.tipsText || '啊哦，你的导购员身份被禁用了！' }}</view>
    <view class="no-guide-tag__box">
      <image v-if="followgzhurl" class="qr" mode="widthFix" :src="followgzhurl" />
    </view>
    <view v-if="followgzhurl" :style="infoStyle" class="no-guide-tag__tip">长按识别二维码</view>
    <view class="no-guide-tag__tip mt-20" :style="infoStyle">你可以联系总部或门店了解情况</view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  name: 'NoGuideTag',
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    followgzhurl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      windowWidth: 750,
      icon: staticURL(true) + 'guide-no-active-icon.png'
    }
  },
  computed: {
    containerWidth() {
      // 间隙单位是px，转成rpx大概乘以2，两边间距再乘以2
      return this.windowWidth - (this.info.gap || 0) * 4
    },
    containerStyle() {
      let s = []
      s.push(`margin-top: ${this.info.topGap}rpx`)
      return s.join(';')
    },
    titleStyle() {
      const s = []
      s.push(`color: ${this.info.textColor}`)
      s.push(`font-size: ${this.info.textFontSize * 2}rpx`)
      s.push(`font-weight: ${this.info.fontWeight}`)
      s.push(`text-align: center`)
      return s.join(';')
    },
    infoStyle() {
      let s = []
      s.push(`color: ${this.info.infoColor}`)
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
$prefix: 'no-guide-tag';
.#{$prefix} {
  overflow: hidden;

  margin: 0 auto;
  margin-top: -0.5px;
  margin-bottom: -0.5px;
  padding: 40rpx 0;

  text-align: center;
  text-align: center;
  &__item {
    display: flex;
    overflow: hidden;
  }
  &__image {
    display: block;

    width: 580rpx;
    margin: 0 auto;
  }

  &__box {
    margin: 40rpx auto;
    width: 216rpx;
    height: 216rpx;
    background-color: #fff;
    padding: 10rpx;
  }
  &__tip {
    font-size: 28rpx;
    font-weight: normal;
  }
}
</style>
