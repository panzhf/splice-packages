<template>
  <view class="prize-list bg-white">
    <view class="scroll-list">
      <view v-for="(item, index) in list" :key="index" class="prize-item text-center">
        <view v-if="item.prizetype === 0" class="iconfont iconwodejiangpin gift" />
        <view v-else-if="item.prizetype === 2" class="iconfont iconlianmengkaquan coupon" />
        <view v-else-if="item.prizetype === 3" class="iconfont iconhongbaoquan packet" />
        <view v-else class="tooltip">{{ item.content }}</view>
        <view class="dot" />
        <view class="day fs-24 c-3">{{ item.day }}天</view>
      </view>
    </view>
    <view v-if="list.length > 5" class="more-arrow flex flex-middle">
      <view class="iconfont iconjiantou1 icon-1" />
      <view class="iconfont iconjiantou1 icon-2" />
      <view class="iconfont iconjiantou1 icon-3" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrizeList',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: prize-list;
.#{$prefix} {
  position: relative;
  height: 197rpx;
  margin: 0 20rpx;
  padding: 54rpx 30rpx 0;
  box-shadow: 0 0 20rpx 0 rgba(255, 207, 175, 0.57);
  @include round(30rpx);
  @include box;
  .scroll-list {
    position: relative;
    white-space: nowrap;
    overflow: scroll;
    height: 100%;
  }
  .prize-item {
    position: relative;
    width: 130rpx;
    display: inline-block;
    font-size: 0;
    &::after {
      position: absolute;
      top: 58rpx;
      left: 0;
      content: '';
      @include wh(100%, 4rpx);
      min-height: 2px;
      background-color: var(--theme-color);
    }
    .iconfont {
      height: 34rpx;
      background: linear-gradient(90deg, #ff361b 0%, #ff5c30 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .dot {
      position: absolute;
      top: 52rpx;
      @include h-cen;
      @include wh(16rpx);
      @include round;
      background-color: var(--theme-color);
    }
    .tooltip {
      position: relative;
      display: inline-block;
      @include lh(34rpx);
      padding: 0 12rpx;
      @include round(16rpx);
      background-color: var(--theme-color);
      color: #fff;
      font-size: 20rpx;
      &::after {
        position: absolute;
        bottom: -6px;
        content: '';
        @include h-cen;
        @include wh(0);
        border: 4px solid var(--theme-color);
        border-left-color: transparent;
        border-bottom-color: transparent;
        border-right-color: transparent;
      }
    }
    .day {
      margin-top: 54rpx;
    }
  }
  .more-arrow {
    position: absolute;
    top: 108rpx;
    right: -8rpx;
    animation: flash 1s ease 4s infinite;
    .iconfont {
      font-size: 12rpx;
      &.icon-1 {
        transform: scaleY(1.2) translateX(1rpx);
        color: var(--theme-color);
      }
      &.icon-2 {
        transform: scaleY(1.2) translateX(-6rpx);
        color: var(--confirmbtn-bg);
      }
      &.icon-3 {
        transform: scaleY(1.2) translateX(-14rpx);
        color: var(--arrow-center);
      }
    }
  }
  @keyframes flash {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(4rpx);
      opacity: 0;
    }
  }
}
</style>
