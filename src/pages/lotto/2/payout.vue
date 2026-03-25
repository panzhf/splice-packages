<template>
  <view class="container">
    <!-- <image class="payout-top-bg" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-top-bg.jpg'" mode="widthFix" />
    <image class="payout-text-bg" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-text-bg.png'" mode="widthFix" />
    <text class="payout-text">可获得1次抽奖机会</text>

    <image class="payout-center-bg" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-center-bg.png'" mode="widthFix" /> -->
    <view
      class="payout-bgimg"
      :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/sdjc/payout-bgimg.jpg)` }"
    />
    <image class="payout-title" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-title.png'" mode="widthFix" />
    <image class="payout-center" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-center.png'" mode="widthFix" />
    <image class="payout-bottom" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/payout-bottom.png'" mode="widthFix" />
    <view class="qrcode-wrap">
      <!-- #ifdef H5 -->
      <tki-qrcode ref="qrcode" class="qrcode" :size="300" onval :val="payoutQrCode" />
      <!-- #endif -->
      <view v-if="isShowFailure" class="failure">
        <image class="failure-img" :src="PACKAGE_STATIC_URL + 'lottery/bnht/circleimg.png'" mode="widthFix" />
        <view>二维码失效</view>
      </view>
    </view>
    <view class="time-text">{{ timeMin }}分钟后失效</view>
    <view class="refresh-btn" @click="handleRefresh">刷新</view>
    <view class="back-btn" @click="handleBackHome">返回活动</view>

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
/* #ifdef H5 */
import tkiQrcode from '../components/tki-qrcode/tki-qrcode'
/* #endif */
import { apiGetChanceQrCode } from 'packages/api/prizePool'
import { packageStaticMixin } from 'packages/mixins/static-url'

export default {
  components: {
    /* #ifdef H5 */
    tkiQrcode
    /* #endif */
  },
  mixins: [packageStaticMixin],
  data() {
    return {
      aid: '', // 活动id
      timeMin: 0, // 失效时间
      payoutQrCode: '', // 派发二维码
      isShowFailure: false, // 是否已经失效
      timer: null // 定时器
    }
  },
  onLoad(option) {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    /* #endif */
    this.timeMin = uni.getStorageSync('SalerQrCodeExpireMinutes')
    this.getChanceQrCode()
  },
  onReady() {},
  methods: {
    // 获取派发二维码
    getChanceQrCode() {
      apiGetChanceQrCode({ aid: this.aid }).then(res => {
        let qrCode = ''
        /* #ifdef H5 */
        let path = res.return_data.Url.replace('lotto/scanqrcode', 'lotto/2/scanqrcode')
        qrCode = location.href.split('/pages/lotto')[0] + path
        this.payoutQrCode = qrCode
        /* #endif */
        console.log('派发链接：', qrCode)
        this.isShowFailure = false
        this.initTimeFailure()
      })
    },
    // 初始化失效时间
    initTimeFailure() {
      clearTimeout(this.timer)
      let time = this.timeMin * 60 * 1000
      this.timer = setTimeout(() => {
        this.isShowFailure = true
      }, time)
    },
    // 刷新
    handleRefresh() {
      this.getChanceQrCode()
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
  background-color: #fd7c42;

  .payout-top-bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
  }

  .payout-bgimg {
    width: 100vw;
    height: 100vh;
    background-size: 100%;
    background-repeat: no-repeat;
  }

  .payout-top,
  .payout-title,
  .payout-center,
  .payout-bottom {
    position: absolute;
  }
  .payout-top {
    top: 0;
    left: 0;
  }
  .payout-title {
    width: 70%;
    top: 100rpx;
    left: 50%;
    transform: translateX(-50%);
  }
  .payout-center {
    top: 370rpx;
    left: 0;
  }
  .payout-bottom {
    bottom: 0;
    left: 0;
  }

  .payout-text-bg {
    position: absolute;
    top: 98rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    width: 420rpx;
  }

  .payout-text {
    position: absolute;
    top: 176rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    font-size: 30rpx;
    color: #fff;
    font-weight: bold;
  }

  .payout-center-bg {
    position: absolute;
    top: 88rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }

  .qrcode-wrap {
    position: absolute;
    top: 370rpx;
    left: 50%;
    width: 306rpx;
    height: 306rpx;
    transform: translateX(-50%);
    z-index: 30;

    .failure {
      position: absolute;
      top: -1px;
      left: -1px;
      width: 308rpx;
      height: 308rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      color: #fff;
      background-color: rgba($color: #000000, $alpha: 0.7);

      .failure-img {
        width: 70rpx;
        margin-bottom: 10rpx;
      }
    }
  }

  .time-text {
    position: absolute;
    top: 700rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    font-size: 30rpx;
  }

  .refresh-btn,
  .back-btn {
    position: absolute;
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
  }
  .refresh-btn {
    bottom: 278rpx;
    color: #fff;
    background-image: linear-gradient(#ff8c4d, #ff3f42);
    border: 2rpx solid #ffdca6;
  }
  .back-btn {
    bottom: 158rpx;
    color: #ac510a;
    background-image: linear-gradient(#fffffe, #ffd99e);
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
