<template>
  <view class="container">
    <image class="payout-top-bg" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-top-bg.jpg'" mode="widthFix" />
    <image class="payout-fail-img" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-fail.png'" mode="widthFix" />
    <u-parse class="text" :html="errText" />
    <view class="back-btn" @click="handleBackHome">查看活动</view>

    <image class="payout-bottom-bg" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-bottom-bg.jpg'" mode="widthFix" />

    <!-- #ifdef H5 -->
    <!-- 关注公众号 -->
    <md-follow-gzh />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  data() {
    return {
      aid: '', // 活动id
      m: '', // 品牌商编号
      errcode: 0, // 错误编码
      errText: ''
    }
  },
  onLoad(option) {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    this.errcode = this.$route.query.errcode
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    this.errcode = option.errcode
    /* #endif */
    this.setErrText()
  },
  onReady() {},
  methods: {
    // 设置错误提示内容
    setErrText() {
      if (this.errcode == 30055) {
        this.errText = '码已失效...<br />请刷新码后再扫'
        return
      }
      if (this.errcode == 30041) {
        this.errText = '啊哦，今日时效码领取次数<br />已用完，看看其他获取方式吧~'
        return
      }
      if (this.errcode == 30048) {
        this.errText = '啊哦，本期时效码领取次数<br />已用完，看看其他获取方式吧~'
        return
      }
      this.errText = `派发失败${this.errcode}`
    },
    // 返回活动
    handleBackHome() {
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/2/index?aid=${this.aid}&memberlogin=${this.m}&skin=2`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/2/index?aid=${this.aid}&memberlogin=${this.m}&skin=2`
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100vh;
  text-align: center;
  background-color: #fff;

  .payout-top-bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
  }

  .payout-fail-img {
    position: absolute;
    top: 245rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: 360rpx;
  }

  .text {
    position: absolute;
    top: 573rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    font-size: 30rpx;
    color: #000;
  }

  .back-btn {
    position: absolute;
    bottom: 373rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 500rpx;
    height: 80rpx;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 42rpx;
    color: #fff;
    background-image: linear-gradient(#ff8c4d, #ff3f42);
    border: 2rpx solid #ffdca6;
  }

  .payout-bottom-bg {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10;
  }
}
</style>
