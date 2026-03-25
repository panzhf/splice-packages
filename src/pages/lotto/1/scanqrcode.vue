<template>
  <view class="container">
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetwxdata } from 'packages/api/common'
import { apiWinActivityChanceByQrCode } from 'packages/api/prizePool'

export default {
  data() {
    return {
      aid: '', // 活动id
      tempKey: '', // 缓存名
      latlng: '' // 经纬度坐标
    }
  },
  onLoad(option) {
    /* #ifdef H5 */
    uni.setStorageSync('firstUrl', location.href)
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    this.tempKey = this.$route.query.tempKey
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    this.tempKey = option.tempKey
    /* #endif */
    // this.apiGetwxdata()
    this.handleWinActivityChanceByQrCode()
  },
  onReady() {},
  methods: {
    // 扫码获取时效派发的参与机会
    handleWinActivityChanceByQrCode() {
      let params = {
        latlng: this.latlng,
        qqLatLng: this.latlng
      }
      apiWinActivityChanceByQrCode(this.aid, this.tempKey, params)
        .then(res => {
          /* #ifdef H5 */
          uni.reLaunch({
            url: `/pages/lotto/1/index?aid=${this.aid}&memberlogin=${this.m}&skin=1&scansuccess=1`
          })
          /* #endif */
          /* #ifdef MP-WEIXIN */
          uni.navigateTo({
            url: `/packages/src/pages/lotto/1/index?aid=${this.aid}&memberlogin=${this.m}&skin=1&scansuccess=1`
          })
          /* #endif */
        })
        .catch(err => {
          /* #ifdef H5 */
          uni.reLaunch({
            url: `/pages/lotto/1/payout-fail?aid=${this.aid}&memberlogin=${this.m}&skin=1&errcode=${err.return_code}`
          })
          /* #endif */
          /* #ifdef MP-WEIXIN */
          uni.reLaunch({
            url: `/packages/src/pages/lotto/1/payout-fail?aid=${this.aid}&memberlogin=${this.m}&skin=1&errcode=${err.return_code}`
          })
          /* #endif */
        })
    },
    /* #ifdef H5 */
    // 获取微信配置信息
    apiGetwxdata() {
      let params = {
        aid: this.aid,
        url: location.href
      }
      apiGetwxdata(params).then(res => {
        this.wxConfig = res.return_data
        /* #ifdef H5 */
        this.initGetLocation()
        /* #endif */
      })
    },
    // 初始化定位
    initGetLocation() {
      this.$wechat.config({
        debug: false, // 开启调试模式
        appId: this.wxConfig.appid, // 必填，公众号的唯一标识
        timestamp: this.wxConfig.timestamp, // 必填，生成签名的时间戳
        nonceStr: this.wxConfig.noncestr, // 必填，生成签名的随机串
        signature: this.wxConfig.signature, // 必填，签名
        jsApiList: ['scanQRCode', 'updateAppMessageShareData', 'getLocation']
      })

      this.$wechat.ready(() => {
        console.log('points wxconfig ready~')
        this.$wechat.getLocation({
          type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: res => {
            this.latlng = res.latitude + ',' + res.longitude
            this.handleWinActivityChanceByQrCode()
          },
          cancel: () => {
            this.handleWinActivityChanceByQrCode()
            // uni.showToast({
            //   title: '获取定位失败',
            //   icon: 'none',
            //   mask: true
            // })
          }
        })
      })
    }
    /* #endif */
  }
}
</script>
