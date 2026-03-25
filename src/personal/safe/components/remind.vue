<template>
  <view class="remind bg-f">
    <view class="remind-header">
      <view class="icon iconfont icon-duihuan-fail"></view>
      <view class="text">重要提醒</view>
      <view class="text">注销后，您将放弃以下权益</view>
    </view>
    <view class="remind-content">
      <view class="li">账号信息、用户权益等用户权益将被清空且无法恢复</view>
      <view class="li">系统用户身份及以该身份获得的积分、红包零钱、佣金、卡券等用户资产将被清空且无法恢复</view>
      <view class="li">扫码记录、交易记录、其他数据记录等将被清空无法恢复</view>
      <view class="li">由于所有交易记录（包含订单）将被清空，请确保所有交易已完结且无纠纷</view>
      <view class="li">账号注销后视作你自动放弃所有权益</view>
      <view class="li">账号一旦被注销将不可恢复，请在操作前自行备份账号相关的所有信息和数据</view>
      <view class="li">账号注销不代表注销前的账号行为和相关责任得到豁免或减轻</view>
      <view class="li">
        账号注销前请确认不存在或不需要使用的数据和服务，否则一旦注销后将会导致其他产品或服务的必要功能无法实现，你将无法再登录品牌相关应用
      </view>
    </view>
    <view class="safe-btns">
      <view class="agree-rule" @tap="agree = !agree">
        <text class="iconfont fs-32 mr-10" :class="[agree ? 'icon-checked' : 'icon-uncheck']" />
        我已阅读并同意
        <text class="edit-color" @tap.stop="handleLinkRule">《注销协议》</text>
      </view>
      <view class="flex">
        <button class="safe-btn back-btn" @tap="handleBack">上一步</button>
        <button class="safe-btn continue-btn" :disabled="!agree" @tap="handleNext">下一步</button>
      </view>
    </view>
    <view style="height: 210rpx"></view>
  </view>
</template>

<script>
export default {
  name: 'Remind',
  props: {
    loginOutRuleNo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      agree: false
    }
  },
  methods: {
    // 跳转规则页面
    handleLinkRule() {
      uni.navigateTo({
        url: `/packages/src/rule/webview?pageType=rule&applyNo=` + this.loginOutRuleNo
      })
    },
    handleBack() {
      this.$emit('setStep', 2)
    },
    handleNext() {
      if (!this.agree) return this.$msg('请先阅读并同意注销协议！')
      this.$emit('setStep', 4)
    }
  }
}
</script>

<style lang="scss" scoped>
.remind {
  .remind-header {
    text-align: center;
    padding: 40rpx 0;
    .icon-duihuan-fail {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }
    .text {
      line-height: 48rpx;
      font-weight: 700;
      font-size: 32rpx;
    }
  }
  .remind-content {
    font-size: 26rpx;
    margin: 0 30rpx;
    padding: 40rpx 30rpx 40rpx 60rpx;
    background: #f9f9f9;
    border-radius: 10rpx;
    .li {
      position: relative;
      font-size: 26rpx;
      color: #333;
      margin-bottom: 20rpx;
      text-align: justify;
      &::before {
        position: absolute;
        width: 10rpx;
        height: 10rpx;
        background: #000000;
        border-radius: 50%;
        left: -25rpx;
        top: 12rpx;
        content: '';
      }
    }
  }
  .agree-rule {
    text-align: center;
    color: #333;
    font-size: 26rpx;
    margin-top: -30rpx;
    padding: 30rpx 30rpx 40rpx 30rpx;
  }
  .edit-color {
    color: #1e8dff;
  }
}
</style>
