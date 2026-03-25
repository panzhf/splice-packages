<template>
  <view v-if="isShow">
    <view class="change-mask" @touchmove.stop="() => {}" @tap="hide">
      <view class="change-explain" @touchmove.stop="() => {}">
        <view class="explain-box">
          <view class="title-box text-center">
            <view class="title">— 零钱说明 —</view>
          </view>
          <view class="item-box">
            <view class="item-title">零钱来源：</view>
            <view class="item-con">① 参与扫码活动，获取红包零钱奖励。</view>
            <view class="item-con">② 完成品牌发布的任务，获得红包奖励。</view>

            <view class="item-title" style="margin-bottom: 10rpx">零钱提现：</view>
            <view class="item-con">
              ① 红包零钱提现成功后，直接到帐您的［微信零钱］，微信支付将同步推送零钱入账通知。
            </view>
            <view class="item-con">② 如果出现提现失败，请等待一段时间后再重试。</view>
            <view class="item-con">③ 每人每天最多可提现10次。</view>
            <view class="item-con">④ 每次提现的时间间隔需大于15秒。</view>
            <view class="item-con">⑤ 每天0:00-8:00为系统结算时间，暂停提现，8:00后可进行提现。</view>
          </view>
        </view>
        <view class="iconfont icon-close2" @tap="isShow = false" />
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  data() {
    return {
      isShow: false,
      changeExplainBg: staticURL() + 'changeBg.png'
    }
  },
  methods: {
    show() {
      this.isShow = true
    },
    hide() {
      this.isShow = false
    }
  }
}
</script>

<style lang="scss" scoped>
.change-mask {
  width: 750rpx;
  height: 100%;
  top: 0;
  left: 0;
  position: fixed;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
.explain-box {
  position: relative;
  border-radius: 10rpx;

  .iconguanbi {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
  }
}
.change-explain {
  position: relative;
  z-index: 100;
  background-color: #fff;
  width: 600rpx;
  height: 680rpx;
  animation: tanchuang 0.4s ease-in-out;
  border-radius: 10rpx;
}
.item-box {
  padding: 10rpx 50rpx;
  .item-title {
    color: #2a2a2a;
    font-size: 28rpx;
    line-height: 36rpx;
    margin: 30rpx 0 20rpx;
  }
  .item-con {
    margin-bottom: 8rpx;
    color: #777;
    font-size: 24rpx;
    line-height: 36rpx;
  }
}
.title-box {
  width: 250rpx;
  padding: 35rpx 0 10rpx;
  margin: 0 auto;
  .title {
    font-weight: bold;
  }
}
.icon-close2 {
  position: absolute;
  bottom: -120rpx;
  left: 50%;
  color: #fff;
  font-size: 58rpx;
  transform: translateX(-50%);
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
