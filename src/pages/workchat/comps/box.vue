<template>
  <view class="invite-box">
    <view class="invite-box__top" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'workchat/cg-top.png'})` }">
      <slot name="title" />
    </view>
    <view class="invite-box__content" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL + 'workchat/bg-m.png'})` }">
      <slot name="content" />
    </view>
    <image class="invite-box__bottom" :src="PACKAGE_STATIC_URL + 'workchat/bg-bottom.png'" mode="scaleToFill" />
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin]
}
</script>

<style lang="scss" scoped>
.invite-box {
  position: relative;
  width: 624rpx;
  margin: 0 auto;
  &__top {
    width: 624rpx;
    height: 68rpx;
    color: #fff;
    font-size: 30rpx;
    padding: 0 30rpx;
    box-sizing: border-box;
    background-size: 624rpx 68rpx;
  }
  &__bottom {
    height: 30rpx;
    width: 624rpx;
  }
  &__content {
    padding: 0 20rpx;
    background-repeat: repeat-y;
    background-size: 624rpx auto;
  }
}
</style>
