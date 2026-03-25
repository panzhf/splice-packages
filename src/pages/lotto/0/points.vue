<template>
  <view class="container">
    <view class="bg-color">
      <view class="points-wrap">
        <view class="my-points">我的积分</view>
        <view class="points-num">{{ myPoints }}</view>
        <image
          class="change-btn"
          :src="PACKAGE_STATIC_URL + 'lottery/lotto/change-btn.png'"
          mode="widthFix"
          @click="handleChange"
        />
        <view class="desc">每{{ pointAmount }}积分可兑换一次{{ drawTitle }}</view>
      </view>
    </view>

    <image class="points-top" :src="PACKAGE_STATIC_URL + 'lottery/lotto/points-top-bg.png'" mode="widthFix" />

    <view class="activity-desc">
      <image :src="PACKAGE_STATIC_URL + 'lottery/lotto/explain-bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/lotto/desc-title.png'" mode="widthFix" />
      <view
        class="content"
        :style="{
          backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/explain-bd-mid.png)`
        }"
      >
        <u-parse class="rich-text" :html="htmlString" :tag-style="parseStyle" />
      </view>
      <image :src="PACKAGE_STATIC_URL + 'lottery/lotto/explain-bd-bottom.png'" mode="widthFix" />
    </view>

    <lotto-popup
      :is-show="isShowPopup"
      :submit-text="popupSubmitText"
      :info="popupInfo"
      :img-type="imgType"
      @close="isShowPopup = false"
      @submit="handleGoCheck"
    />

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
import { apiGetPointAmount, apiWinActivityChanceByPoint } from 'packages/api/prizePool'
import { apiGetwxdata } from 'packages/api/common'
import LottoPopup from '../components/LottoPopup.vue'
import { packageStaticMixin } from 'packages/mixins/static-url'
import richTextMixin from 'packages/mixins/rich-text'

export default {
  components: {
    LottoPopup
  },
  mixins: [packageStaticMixin, richTextMixin],
  data() {
    return {
      aid: '', // 活动id
      m: '', // 品牌商编号
      latlng: '', // 经纬度坐标
      htmlString: '', // 富文本内容
      myPoints: 0, // 我的积分
      pointAmount: 0, // 每次兑换消耗积分数
      drawTitle: '抽奖机会', // 机会名称
      isShowPopup: false, // 是否显示弹窗
      popupInfo: '', // 弹窗内容
      popupSubmitText: '确定', // 弹窗确定按钮文字
      wxConfig: null, // 微信配置
      imgType: 1, //1为成功 2为失败
      parseStyle: {
        table: 'border-collapse:collapse',
        th: 'border: 1px solid #A72615',
        td: 'border: 1px solid #A72615'
      }
    }
  },
  onLoad(option) {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    this.apiGetwxdata()
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    /* #endif */
    this.htmlString = uni.getStorageSync('Rule')
    this.pointAmount = uni.getStorageSync('PointAmount')
    this.drawTitle = uni.getStorageSync('DrawTitle')
    this.getPointAmount()
  },
  onReady() {},
  methods: {
    // 获取用户积分余额
    getPointAmount() {
      apiGetPointAmount({ aid: this.aid }).then(res => {
        this.myPoints = res.return_data
      })
    },
    // 兑换抽奖机会
    handleChange() {
      // if (this.latlng == '') {
      //   uni.showToast({
      //     title: '获取定位失败，请开启GPS定位后刷新重试',
      //     icon: 'none',
      //     mask: true
      //   })
      //   return
      // }
      let params = {
        latlng: this.latlng,
        qqLatLng: this.latlng
      }
      uni.showLoading({
        title: '加载中',
        mask: true
      })
      apiWinActivityChanceByPoint(this.aid, params)
        .then(res => {
          this.imgType = 1
          this.popupInfo = `恭喜你！兑换成功<br />恭喜你获得本期${this.drawTitle}-数量1`
          this.popupSubmitText = '去查看'
          this.isShowPopup = true
          uni.hideLoading()
          this.getPointAmount()
        })
        .catch(err => {
          this.imgType = 2
          if (err.return_code === 30041) {
            this.popupInfo = '很遗憾！今日兑换机会已用完！<br />看看其他获取方式吧~'
            this.popupSubmitText = '去查看'
            uni.hideLoading()
            this.isShowPopup = true
            return
          }
          if (err.return_code === 30048) {
            this.popupInfo = '很遗憾！本期兑换机会已用完！<br />看看其他获取方式吧~'
            this.popupSubmitText = '去查看'
            uni.hideLoading()
            this.isShowPopup = true
            return
          }
          if (err.return_code === 30049) {
            this.code = 30049
            this.popupInfo = '哦喔！兑换失败！ <br />积分不够用了！'
            this.popupSubmitText = '去赚取积分'
            uni.hideLoading()
            this.isShowPopup = true
            return
          }
          uni.showToast({
            title: err.return_msg,
            icon: 'none',
            mask: true
          })
        })
    },
    // 去查看
    handleGoCheck() {
      // 积分不足
      if (this.code === 30049) {
        this.isShowPopup = false
        this.code = 0
        return
      }
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/0/index?aid=${this.aid}&memberlogin=${this.m}&skin=0`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/0/index?aid=${this.aid}&memberlogin=${this.m}&skin=0`
      })
      /* #endif */
    },
    /* #ifdef H5 */
    // 获取微信配置信息
    apiGetwxdata() {
      let url = location.href
      if (uni.getSystemInfoSync().platform === 'ios') {
        url = uni.getStorageSync('firstUrl')
      }
      let params = {
        aid: this.aid,
        url
      }
      apiGetwxdata(params).then(res => {
        let wxConfig = res.return_data
        this.$wechat.config({
          debug: false, // 开启调试模式
          appId: wxConfig.appid, // 必填，公众号的唯一标识
          timestamp: wxConfig.timestamp, // 必填，生成签名的时间戳
          nonceStr: wxConfig.noncestr, // 必填，生成签名的随机串
          signature: wxConfig.signature, // 必填，签名
          jsApiList: ['getLocation']
        })

        this.$wechat.ready(() => {
          console.log('wxconfig ready~')
          this.$wechat.getLocation({
            type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: res => {
              this.latlng = res.latitude + ',' + res.longitude
              uni.removeStorageSync('isRefresh')
            },
            fail: () => {
              if (uni.getStorageSync('isRefresh')) {
                // uni.showToast({
                //   title: '请检查手机是否开启了GPS定位',
                //   icon: 'none',
                //   mask: true
                // })
                return
              }
              uni.setStorageSync('isRefresh', true)
              location.reload()
            },
            complete: () => {
              console.log('定位结束~')
            }
          })
        })
      })
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  min-height: 100vh;
  background-color: #fff1c9;

  .points-top {
    position: absolute;
    top: 320rpx;
    left: 0;
    z-index: 20;
  }

  .bg-color {
    padding: 44rpx 30rpx 0;
    background-image: linear-gradient(to right, #fb573f 0%, #f8712b 50%, #fb4a38 100%);
  }

  .points-wrap {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 40rpx 0 80rpx;
    border-radius: 5rpx;
    background-color: #fffcf1;

    .points-num {
      font-weight: bold;
      color: #fb4b38;
      font-size: 48rpx;
    }
    .my-points {
      font-size: 22rpx;
      color: #000;
      font-weight: bold;
    }

    .change-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 260rpx;
      height: 67rpx;
      margin: 20rpx 0 10rpx;
    }

    .desc {
      font-size: 24rpx;
      color: #fb4c38;
    }
  }

  .activity-desc {
    position: relative;
    z-index: 30;
    margin: 70rpx auto 0;
    padding-bottom: 44rpx;
    position: relative;
    width: 690rpx;
    .title-img {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      width: 272rpx;
      height: 78rpx !important;
    }
    .title-desc {
      position: absolute;
      top: -7rpx;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
      width: 272rpx;
      text-align: center;
      font-weight: 800;
      letter-spacing: -1px;
      color: #ac510a;
    }
  }
  .content {
    padding: 0 36rpx;
    font-size: 26rpx;
    color: #a72615;
    background-size: 100% 100%;
    background-repeat: repeat-y;
  }

  .rich-text {
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>
