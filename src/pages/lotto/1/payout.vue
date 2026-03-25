<template>
  <view class="container">
    <image class="payout-top" :src="PACKAGE_STATIC_URL + 'lottery/bnht/points-top-bg.png'" mode="widthFix" />
    <view class="main-text">扫描下方二维码可获得1次{{ drawTitle }}</view>
    <view class="qrcode-wrap">
      <!-- #ifdef H5 -->
      <tki-qrcode ref="qrcode" class="qrcode" :size="276" onval :val="payoutQrCode" />
      <!-- #endif -->
      <view v-if="isShowFailure" class="failure">
        <image class="failure-img" :src="PACKAGE_STATIC_URL + 'lottery/bnht/circleimg.png'" mode="widthFix" />
        <view>二维码失效</view>
      </view>
    </view>
    <view class="time-text">{{ timeMin }}分钟后失效</view>
    <view
      class="payout-btn"
      :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/btn-bg.png)` }"
      @click="handleRefresh"
    >
      刷新
    </view>
    <view
      class="payout-btn"
      :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/back-act-btn.png)` }"
      @click="handleBackHome"
    >
      返回活动
    </view>
    <image class="points-bottom" :src="PACKAGE_STATIC_URL + 'lottery/bnht/explain-bottom.png'" mode="widthFix" />
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
      timer: null, // 定时器
      drawTitle: '抽奖机会'
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
    this.drawTitle = uni.getStorageSync('drawTitle')
    this.getChanceQrCode()
  },
  onReady() {},
  methods: {
    // 获取派发二维码
    getChanceQrCode() {
      apiGetChanceQrCode({ aid: this.aid }).then(res => {
        let qrCode = ''
        /* #ifdef H5 */
        let path = res.return_data.Url.replace('lotto/scanqrcode', 'lotto/1/scanqrcode')
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

  .payout-top {
    position: absolute;
    top: 0;
    left: 0;
  }

  .main-text {
    margin-top: 188rpx;
    font-size: 30rpx;
    font-weight: bold;
  }

  .qrcode-wrap {
    position: relative;
    margin: 40rpx auto;
    width: 306rpx;
    height: 306rpx;
    padding: 15rpx;
    border: 2rpx solid #ffe089;

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
    margin-bottom: 175rpx;

    &::before {
      content: '';
      display: inline-block;
      margin-right: 10rpx;
      width: 70rpx;
      height: 2rpx;
      margin-bottom: 8rpx;
      background-image: linear-gradient(to left, #ffe089, #ff3a3c);
    }
    &::after {
      content: '';
      display: inline-block;
      margin-left: 10rpx;
      width: 70rpx;
      height: 2rpx;
      margin-bottom: 8rpx;
      background-image: linear-gradient(to right, #ffe089, #ff3a3c);
    }
  }

  .payout-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 291rpx;
    height: 74rpx;
    margin: 0 auto 52rpx;
    font-size: 30rpx;
    font-weight: bold;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .points-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
</style>
