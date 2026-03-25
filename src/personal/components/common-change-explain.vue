<template>
  <view v-if="showPopup" class="wrap-popup" @touchmove.stop="handleMove">
    <view class="common-popup" @touchmove.stop="handleMove">
      <view class="header fw-bold fs-32 text-center">- 提现说明 -</view>
      <view class="content fs-26 c-2a">
        <view class="item">
          1、红包零钱提现申请后，受微信规则限制，将于24小时内到账。所申请的款项将直接到账您的【微信零钱】，微信支付将同步推送零钱入账通知。
        </view>
        <view class="item">2、若出现提现失败，请等待一段时间后再重试。</view>
        <view class="item">3、零钱达到1.00元或以上才可提现，且每次提现不高于200元。</view>
        <view class="item">4、每人每天最多可提现10次。</view>
        <view class="item">5、每次提现的时间间隔需大于15秒。</view>
        <view class="item">6、每天0:00-8:00为系统结算时间，暂停提现，8:00后可进行提现。</view>
      </view>
    </view>
    <view class="pop-close icon iconfont iconguanbi1" @tap="handleClose" />
  </view>
</template>

<script>
export default {
  name: 'CommonChangeExplain',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPopup: false
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
    }
  },
  methods: {
    handleClose() {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}
.pop-close {
  color: #fff;
  font-size: 60rpx;
  padding: 20rpx;
  margin-top: 40rpx;
}
.common-popup {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  animation-name: scale;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  width: 660rpx;
  @include box;
  .header {
    @include lh(100rpx);
  }
  .title {
    font-weight: 700;
    padding: 20rpx 0;
  }
  .content {
    padding: 0 30rpx 40rpx;
    line-height: 40rpx;
    text-align: justify;
    .item {
      margin-bottom: 20rpx;
    }
  }
}
@keyframes scale {
  0% {
    transform: scale(0.98);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
