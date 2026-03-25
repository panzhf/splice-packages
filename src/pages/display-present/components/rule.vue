<template>
  <view class="rule" :style="ruleStyle">
    <view class="title">任务规则</view>
    <u-parse class="rich-text mt-20" :html="info.activityinfo.rule" :tag-style="parseStyle" />
  </view>
</template>

<script>
import richTextMixin from 'packages/mixins/rich-text'
export default {
  mixins: [richTextMixin],
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    barColor: {
      type: String,
      default: '#ff7640'
    }
  },
  computed: {
    ruleStyle() {
      return `--bar-color: ${this.barColor}`
    }
  }
}
</script>

<style lang="scss" scoped>
.rule {
  background-color: #fff;
  padding: 36rpx 40rpx;
  .title {
    font-size: 32rpx;
    font-family: PingFang SC;
    font-weight: bold;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      width: 7rpx;
      height: 28rpx;
      background: var(--bar-color, $uni-color-primary);
      border-radius: 4rpx;
      top: 8rpx;
      left: -16rpx;
    }
  }
}
</style>
