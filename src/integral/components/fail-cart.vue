<template>
  <u-mask
    :show="showDialog"
    :zoom="false"
    :mask-click-able="false"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }"
    z-index="100"
  >
    <view class="fail-dialog flex flex-column flex-middle flex-center">
      <view class="fail-container">
        <view class="title fw-bold fs-32 text-center">抱歉，下单失败</view>
        <scroll-view scroll-y enable-flex class="cart-list">
          <view v-for="(item, index) in list" :key="index" class="item flex flex-middle">
            <image class="img shrink-0" :src="item.picture" />
            <view class="flex-1 ml-20">
              <view class="fs-24">{{ item.name }}</view>
              <view v-if="item.formatname" class="fs-24 c-9">{{ item.formatname }}</view>
              <view class="fs-22 c-9">x{{ item.quantity }}</view>
              <view class="fs-22 tip">{{ item.failtip }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="footer-btns flex flex-middle fw-bold">
          <button class="btn plain" @tap="handleBack">返回购物车</button>
          <button class="flex-1 btn active ml-20" @tap="handleRemove">移除失败礼品并下单</button>
        </view>
      </view>
      <view class="close-btn iconfont icon-close2" @tap="close" />
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
export default {
  name: 'FailCart',
  mixins: [dialogMixin],
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleRemove() {
      this.$emit('remove')
    },
    handleBack() {
      this.close()
      // uni.redirectTo({ url: '/packages/src/integral/cart' })
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: fail-dialog;
.#{$prefix} {
  position: fixed;
  z-index: 101;
  width: 100%;
  height: 100%;
}
.fail-container {
  width: 650rpx;
  padding: 40rpx 30rpx;
  background: #fff;
  border-radius: 10rpx;
  /* #ifdef MP-CLOUDSHOP */
  box-sizing: border-box;
  /* #endif */
}
.cart-list {
  max-height: 540rpx;
  padding: 30rpx 0;
  .item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #e5e5e5;
    line-height: 32rpx;
  }
  .img {
    display: block;
    width: 120rpx;
    height: 120rpx;
  }
  .tip {
    color: #ff6440;
  }
}
.footer-btns {
  .btn {
    height: 80rpx;
    border-radius: 40rpx;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    &.plain {
      width: 250rpx;
      background: #fff;
      border: 1px solid #999;
      /* #ifdef MP-CLOUDSHOP */
      box-sizing: border-box;
      /* #endif */
    }
    &.active {
      background: $bg-color;
    }
  }
}
.close-btn {
  margin-top: 60rpx;
  font-size: 60rpx;
  color: #fff;
}
</style>
