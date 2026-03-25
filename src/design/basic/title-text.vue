<template>
  <view
    :class="['title-text', `is-${textData.Style}`]"
    :style="{
      'background-color': textData.BgColor,
      color: textData.TextColor
    }"
    @tap="handleOpenLink(textData)"
  >
    <view class="title-text__title" :style="titleStyle">
      {{ textData.Name }}
    </view>
    <view v-if="textData.Style === 'more'" class="title-text__more">
      更多
      <view class="iconfont iconjiantou title-text__more-icon"></view>
    </view>
  </view>
</template>

<script>
import openLinkMixin from '@/mixins/open-link'
export default {
  mixins: [openLinkMixin],
  props: {
    textData: {
      type: Object,
      default() {
        return {}
      }
    },
    isCustom: {
      type: Boolean,
      default: false // 装修自定义，个别品牌商需要[废弃，在后台装修]
    }
  },
  computed: {
    titleStyle() {
      const s = []
      s.push(`text-align: ${this.textData.Align}`)
      this.textData.fontWeight && s.push(`font-weight: ${this.textData.fontWeight}`)
      this.textData.fontSize && s.push(`font-size: ${this.textData.fontSize * 2}rpx`)
      this.textData.fontStyle && s.push(`font-style: ${this.textData.fontStyle}`)
      this.textData.letterSpacing && s.push(`letter-spacing: ${this.textData.letterSpacing * 2}rpx`)
      return s.join(';')
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'title-text';
.#{$prefix} {
  display: flex;
  align-items: center;
  // margin-left: 30rpx;
  // margin-right: 30rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
  height: 80rpx;
  background-color: #fff;
  // border-radius: 10rpx;
  &.is-more {
    justify-content: space-between;
  }
  .#{$prefix}__title {
    flex: 1;
    font-size: 30rpx;
    font-weight: bold;
  }
  .#{$prefix}__more {
    display: flex;
    align-items: center;
    margin-left: 20rpx;
    font-size: 24rpx;
    color: inherit;
    opacity: 0.4;
    .#{$prefix}__more-icon {
      margin-left: 6rpx;
      font-size: 14rpx;
      color: inherit;
    }
  }
}
</style>
