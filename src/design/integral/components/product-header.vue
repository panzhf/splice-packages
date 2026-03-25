<template>
  <view v-show="isShowTitle" class="product-header">
    <view class="product-header__title ut-s">
      <span v-show="title" class="product-header__tag"></span>
      {{ title }}
    </view>
    <view class="product-header__more" @click="handleOpenLink('/packages/src/integral/list')">
      更多
      <view class="iconfont iconjiantou product-header__more-icon"></view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    isShowTitle: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleOpenLink(link) {
      uni.navigateTo({
        url: link
      })
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
    display: flex;
    align-items: center;
    // .#{$prefix}__tag {
    //   display: inline-block;
    //   margin-right: 8rpx;
    //   width: 8rpx;
    //   height: 30rpx;
    //   background-color: $bg-color;
    //   border-radius: 4rpx;
    // }
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
