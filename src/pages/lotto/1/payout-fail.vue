<template>
  <view class="container">
    <image class="payout-fail-img" :src="PACKAGE_STATIC_URL + 'lottery/bnht/payout-fail.png'" mode="widthFix" />
    <u-parse class="text" :html="errText" />
    <view
      class="payout-btn"
      :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/btn-bg.png)` }"
      @click="handleBackHome"
    >
      查看活动
    </view>

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
      errText: '' // 错误提示内容
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
        url: `/pages/lotto/1/index?aid=${this.aid}&memberlogin=${this.m}&skin=1`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/1/index?aid=${this.aid}&memberlogin=${this.m}&skin=1`
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
  padding: 50rpx 50rpx 56rpx;
  text-align: center;
  color: #ffe497;
  background-image: linear-gradient(#ff4348, #ff3131);

  .payout-fail-img {
    width: 400rpx;
    margin-top: 290rpx;
    margin-bottom: 40rpx;
  }

  .text {
    font-size: 36rpx;
    font-weight: bold;
  }

  .payout-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 291rpx;
    height: 74rpx;
    margin: 163rpx auto 52rpx;
    font-size: 30rpx;
    font-weight: bold;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
}
</style>
