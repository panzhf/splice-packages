<template>
  <view class="overdue-content flex flex-center flex-column flex-middle text-center">
    <image
      :src="icon"
      :mode="mode"
      class="banner-box"
      :style="{ width: iconWidth + 'rpx', height: iconHeight + 'rpx' }"
    />
    <view class="msg">{{ overdueData.companyName || '' }}订购的服务已到期</view>
    <view class="link-tip">如需查看历史记录请前往个人中心</view>
    <view class="link-btn" @tap="handleNav()">前往个人中心</view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    overdueData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      icon: staticURL(true) + 'overdue/close.png',
      iconWidth: 200,
      iconHeight: 200,
      iconMode: 'scaleToFill'
    }
  },
  methods: {
    handleNav() {
      uni.reLaunch({
        url: this.overdueData.link
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.overdue-content {
  min-height: 100vh;
  padding: 0 100rpx;
  .msg {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    line-height: 32rpx;
  }
  .link-tip {
    font-size: 24rpx;
    color: #999;
    margin: 25rpx 0 50rpx;
  }
  .link-btn {
    width: 420rpx;
    margin-bottom: 100rpx;
    color: #9a4802;
    text-align: center;
    background: linear-gradient(-90deg, #f2bc64 0%, #ffe29a 100%);
    font-weight: 700;
    box-sizing: border-box;
    font-size: 32rpx;
    border-radius: 40rpx;
    height: 80rpx;
    line-height: 80rpx;
  }
}
</style>
