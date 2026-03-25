<template>
  <view v-show="isShowTitle" class="product-header">
    <view class="product-header__title ut-s">
      <span v-show="title" class="product-header__tag"></span>
      {{ title }}
    </view>
    <view class="product-header__more" @click="handleOpenLink('/pages/product/index')">
      更多
      <view class="iconfont iconjiantou product-header__more-icon"></view>
    </view>
  </view>
</template>

<script>
/* #ifdef MP */
import { navigateTo } from '@/utils/unis'
/* #endif */
export default {
  props: {
    isShowTitle: {
      type: [String, Boolean],
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleOpenLink(link) {
      /* #ifdef MP */
      navigateTo(link)
      /* #endif */
    }
  }
}
</script>

<style lang="scss">
$prefix: 'product-header';
.#{$prefix} {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 30rpx;
  .#{$prefix}__title {
    flex: 1;
    font-size: 30rpx;
    font-weight: bold;
    color: #000;
    .#{$prefix}__tag {
      display: inline-block;
      margin-right: 8rpx;
      width: 4rpx;
      height: 24rpx;
      background-color: #ff4b40;
      border-radius: 4rpx;
    }
  }
  .#{$prefix}__more {
    display: flex;
    align-items: center;
    margin-left: 10prx;
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
