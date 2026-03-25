<template>
  <view v-if="isShow" class="receive-dialog-container">
    <view class="mask" />
    <view class="content">
      <view class="box" />
      <view class="title" :style="{ backgroundImage: 'url(' + titleBgImg + ')' }">请选择兑奖方式</view>
      <view class="activity-info">
        <view class="activity-top" @click.native="handleCourier">快递邮寄兑奖</view>
        <view class="activity-btn" @click.native="handleStores">前往线下门店兑奖</view>
      </view>
      <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog" />
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {},
  data() {
    return {
      isShow: false,
      info: {},
      titleBgImg: staticURL(true) + 'dialog-title.png' // 标题背景图
    }
  },
  methods: {
    open(info) {
      this.info = info
      this.isShow = true
    },
    handleCloseDialog() {
      this.isShow = false
    },
    // 快递邮寄兑奖
    handleCourier() {
      uni.redirectTo({
        url: `/packages/src/integral/detail?type=2&id=${this.info.AwardId}&activityprizeid=${this.info.SaoMaActivityPrizeID}&subcategory=6&actid=${this.info.activityId}`
      })
    },
    // 门店兑换
    handleStores() {
      uni.redirectTo({
        url: `/packages/src/integral/settle?type=4&id=${this.info.AwardId}&ordersourcetype=2`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.receive-dialog-container {
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 30000;
  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 600rpx;
    min-height: 416rpx;
    border-radius: 40rpx;
    background-image: linear-gradient(#ffffff, #fff9e2);
    animation: tanchuang 0.4s ease-in-out;
    z-index: 500;
    .box {
      position: absolute;
      z-index: 100;
      width: 577rpx;
      height: calc(100% - 20rpx);
      margin: 10rpx 0;
      border: 1rpx solid #fae5ca;
      border-radius: 30rpx;
    }

    .title {
      position: relative;
      z-index: 200;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 459rpx;
      height: 70rpx;
      padding-bottom: 8rpx;
      transform: translateY(-8rpx);
      font-size: 32rpx;
      font-weight: bold;
      color: #c01717;
      background-size: 100%;
      background-repeat: no-repeat;
    }

    .activity-info {
      height: 396rpx;
      // padding: 0 40rpx;
      // text-align: center;
      z-index: 1000;
      .activity-top {
        margin-top: 85rpx;
        width: 420rpx;
        height: 80rpx;
        background: linear-gradient(0deg, #ff2529 0%, #ff5e1f 100%);
        border-radius: 40px;
        font-size: 32rpx;
        color: #ffffff;
        line-height: 80rpx;
        text-align: center;
      }
      .activity-btn {
        margin-top: 40rpx;
        width: 420rpx;
        height: 80rpx;
        background: linear-gradient(0deg, #feebcb 0%, #ffffff 100%);
        border: 1px solid #ffaf39;
        border-radius: 40px;
        font-size: 32rpx;
        text-align: center;
        color: #f0311d;
        line-height: 80rpx;
      }
    }
  }

  .close-btn {
    color: #fff;
    position: absolute;
    bottom: -150rpx;
    font-size: 72rpx;
  }
}

@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
