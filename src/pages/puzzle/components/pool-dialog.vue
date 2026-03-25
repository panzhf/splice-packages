<template>
  <u-popup
    v-model="showDialog"
    mode="center"
    border-radius="20"
    :mask-custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    z-index="100"
    @close="close"
  >
    <view class="pool-dialog flex flex-column flex-middle text-center fs-32 fw-medium">
      <view class="header fs-36 flex flex-middle flex-center">
        <image :src="PACKAGE_STATIC_URL + 'puzzle/title-line.png'" class="title-icon" />
        <view class="title fw-bold">{{ info.JackpotName }}</view>
        <image :src="PACKAGE_STATIC_URL + 'puzzle/title-line.png'" class="title-icon rotate" />
      </view>
      <scroll-view scroll-y class="scroll-list">
        <view v-for="(item, index) in info.PrizeList" :key="index" class="item flex flex-middle">
          <image :src="item.PrizeImageUrl" class="icon shrink-0" />
          <view class="fs-26 text-left">{{ item.Name }}</view>
        </view>
      </scroll-view>
      <view class="btn-group">
        <view class="confirm-btn fs-32 text-center" @tap="close">马上集拼图</view>
      </view>
    </view>
  </u-popup>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
import commonMixin from '../mixins'
export default {
  name: 'PoolDialog',
  mixins: [packageStaticMixin, dialogMixin, commonMixin],
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: pool-dialog;
.#{$prefix} {
  color: #bb240f;
  background-color: #ffdcab;
  box-shadow: inset 0px 1rpx 10rpx 0px #c92f00;
  border: 2rpx solid #ffdcab;
  @include wh(554rpx, 660rpx);
  @include round(20rpx);
  @include box();
  .header {
    @include whl(100%, 85rpx);
    background-color: #ca3c1c;
    color: #ffdcab;
    @include round(20rpx 20rpx 0 0);
    .title {
      margin: 0 20rpx;
      letter-spacing: 6rpx;
    }
  }
  .title-icon {
    @include wh(67rpx, 28rpx);
    &.rotate {
      transform: rotateY(180deg);
    }
  }
  .scroll-list {
    height: 440rpx;
    padding: 20rpx 40rpx;
    @include box();
    .item {
      padding: 20rpx 0;
      & + .item {
        border-top: 1rpx solid rgba(202, 60, 28, 0.2);
      }
    }
    .icon {
      @include wh(70rpx);
      @include box();
      @include round(5rpx);
      margin-right: 20rpx;
    }
  }
  .btn-group {
    padding-top: 20rpx;
  }
  .confirm-btn {
    @include whl(300rpx, 75rpx);
    margin: 0 auto 42rpx;
    @include round(38rpx);
    color: #fff;
    background-color: #ca3c1c;
  }
}
</style>
