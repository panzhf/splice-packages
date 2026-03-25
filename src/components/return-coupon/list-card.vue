<template>
  <view class="list">
    <view
      v-if="!hideOpera"
      class="header-wrap flex flex-middle"
      :class="awardVisible ? 'border-line' : ''"
      @tap="handleVisible"
    >
      <view class="flex-1"><slot name="header" /></view>
      <view class="rotate-icon" :class="[awardVisible ? 'rotate-top' : 'rotate-left']">
        <text class="iconfont c-6" :class="arrowIcon" />
      </view>
    </view>
    <view v-if="awardVisible || hideOpera" class="item-info">
      <slot name="list" />
    </view>
  </view>
</template>

<script>
import { arrowIcon } from 'packages/utils/default-picture'
export default {
  name: 'ReturnCouponListCard',
  props: {
    hideOpera: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      arrowIcon,
      awardVisible: false
    }
  },
  methods: {
    handleVisible() {
      this.awardVisible = !this.awardVisible
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  margin: 0 20rpx 30rpx 20rpx;
  background-color: #fff;
  border-radius: 10rpx;

  /* #ifdef MP-SALE */
  box-shadow: 0rpx 4rpx 6rpx 4rpx rgb(228, 232, 255, 0.6);
  .iconfont {
    font-size: 20rpx;
  }
  /* #endif */
  /* #ifdef MP-DISTRIBUTION */
  box-shadow: 0rpx 0rpx 8rpx 0rpx rgba(93, 118, 255, 0.2);
  .iconfont {
    font-size: 26rpx;
  }
  /* #endif */
  /* #ifdef MP-RETAIL */
  .iconfont {
    font-size: 20rpx;
  }
  /* #endif */
  .header-wrap {
    min-height: 100rpx;
    margin: 0 30rpx;
  }
  .border-line {
    @include border-bottom(#e5e5e5);
  }
  .rotate-icon {
    line-height: 40rpx;
    padding-right: 5rpx;
  }
  .rotate-top {
    transform: rotate(90deg);
    transition: transform 0.5s;
  }
  .rotate-left {
    transform: rotate(0deg);
    transition: transform 0.5s;
  }
}
</style>
