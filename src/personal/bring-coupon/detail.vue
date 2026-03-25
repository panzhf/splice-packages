<template>
  <view>
    <view style="min-height: 100vh">
      <template v-if="info.couponcode">
        <view class="detail-header-box" :style="{ background: `${info.setinfo.bgcolor}` }">
          <view class="detail-header">
            <view class="detail-info">
              <image class="logo" :src="info.voucherimg" />
              <view class="name c-3 fs-32 fw-bold">{{ info.vouchername }}</view>
              <view class="date fs-32 tx-c">
                <template v-if="info.expiredtype === 1">{{ info.endtime }}前有效</template>
                <template v-if="info.expiredtype === 2">
                  <view>有效期：{{ info.starttime }} 至</view>
                  {{ info.endtime }}
                </template>
              </view>
            </view>
            <view class="coupon-info">
              <view class="qrcode-box flex flex-column flex-middle">
                <view class="refresh-box" @click="handleRefreshCode">
                  <view class="iconfont iconshuaxin fs-28" />
                  刷新
                </view>
                <view class="code-img-wrap" :class="{ 'has-status': info.status === 1 || info.status === 2 }">
                  <view v-if="info.status === 1" class="icon iconfont iconshi-yong status-icon" />
                  <view v-if="info.status === 2" class="icon iconfont iconguo-qi status-icon" />
                  <u-loading v-if="codeLoading" mode="circle" class="code-img" size="120" />
                  <image v-else class="code-img" :src="imgSrc" />
                </view>
                <view class="code-content c-3 fs-30">{{ info.couponcode }}</view>
                <view class="tip c-9 fs-24">使用时请向店员出示此券</view>
              </view>
              <view
                v-if="info.setinfo.isselfhelp === 1"
                :class="['button', 'base-btn', 'fs-36', info.status !== 0 ? 'dated-button' : '']"
                @tap="handlePickup"
              >
                自助核销
              </view>
              <view class="circle left-circle" :style="{ background: `${info.setinfo.bgcolor}` }" />
              <view class="circle right-circle" :style="{ background: `${info.setinfo.bgcolor}` }" />
            </view>
          </view>
        </view>
        <view
          v-if="info.setinfo.isshowstore === 0 && info.status !== 1"
          class="detail-body-box"
          @tap="handleCheckStore"
        >
          <view class="store fs-28 fw-bold c-3">附近适用门店</view>
          <view class="icon iconfont iconjiantou1 c-9 fs-22" />
        </view>
        <view v-if="info.status === 1" class="detail-footer-box fs-28">
          <view class="item split-line">
            <text class="alpha c-6">核销门店：</text>
            <text class="beta c-3">{{ info.storename }}</text>
          </view>
          <view class="item">
            <text class="alpha c-6">核销时间：</text>
            <text class="beta c-3">{{ info.usetime }}</text>
          </view>
        </view>
        <view class="detail-footer-box fs-28">
          <view v-if="info.setinfo.usagemode" class="item split-line">
            <text class="alpha c-6">使用方式：</text>
            <text class="beta c-3">{{ info.setinfo.usagemode }}</text>
          </view>
          <view v-if="info.discountcontent" class="item split-line">
            <text class="alpha c-6">优惠内容：</text>
            <text class="beta c-3">{{ info.discountcontent }}</text>
          </view>
          <view v-if="info.setinfo.servicetel" class="item split-line">
            <text class="alpha c-6">客户电话：</text>
            <text class="beta c-3">{{ info.setinfo.servicetel }}</text>
          </view>
          <view v-if="info.setinfo.instructions" class="item">
            <text class="alpha c-6">使用说明：</text>
            <text class="beta c-3">{{ info.setinfo.instructions }}</text>
          </view>
        </view>
      </template>
    </view>
    <canvas canvas-id="myCanvas" class="canvas-code" />
    <guide-toast ref="guideToast" />
    <copyright />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetBringCouponDetail, apiGetCodeImg } from 'packages/api/bring-coupon'
import GuideToast from 'packages/components/guide-toast/index.vue'
import userAuthHub from 'packages/utils/user-auth-hub'
// import QRCode from 'packages/utils/qr-code'
import Map from 'packages/utils/map'
export default {
  components: {
    GuideToast
  },
  data() {
    return {
      timer: null,
      imgSrc: '',
      info: {},
      id: 0,
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      throttle: false,
      isGeography: false, // 获取地理位置防抖
      codeLoading: false // 生成二维码loading标识
    }
  },
  async onLoad(option) {
    this.id = option.id
  },
  onShow() {
    this.getData()
  },
  onUnload() {
    this.clearTimer()
  },
  onHide() {
    this.clearTimer()
  },
  onPullDownRefresh() {
    this.clearTimer()
    this.getData()
    uni.stopPullDownRefresh()
  },
  methods: {
    handleRefreshCode() {
      if (this.codeLoading) return
      this.codeLoading = true
      apiGetCodeImg({
        content: decodeURIComponent(this.info.qrcodecontent)
      }).then(res => {
        this.codeLoading = false
        if (this.$ck(res, true)) {
          this.imgSrc = res.return_data.qrcode
        }
      })
    },
    goStorePage(param = {}) {
      let paramString = JSON.stringify(param)
      if (this.throttle) return
      if (this.info.voucherid) {
        // 防抖
        this.throttle = true
        uni.navigateTo({
          url: `./store-list?gps=${paramString}&id=${this.info.voucherid}`
        })
        setTimeout(() => {
          this.throttle = false
        }, 2000)
      } else {
        this.$msg('VoucherId参数不存在')
      }
    },
    async handleCheckStore() {
      if (this.isGeography) return
      // this.isGeography = true
      let res = await Map.getWgsInfo()
      if (res.code === 200) this.isGeography = true
      setTimeout(() => {
        this.isGeography = false
      }, 2000)
      if (res.code === 200) {
        this.goStorePage(res.data.gps)
      } else if (res.code === 1002) {
        let toastInfo = {
          status: true,
          title: '请先开启手机的GPS定位功能',
          buttonText: '知道了'
        }
        this.$refs.guideToast.setToastInfo(toastInfo)
      } else {
        this.goStorePage()
      }
    },
    async scanCode() {
      return new Promise((resolve, reject) => {
        uni.scanCode({
          success(res) {
            resolve(res)
          },
          fail(error) {
            reject(error)
          }
        })
      })
    },
    async handlePickup() {
      // Status 0(未使用) 1(已使用) 2(已过期)
      if (this.info.status !== 0) {
        return
      }
      let couponid = this.id
      let scanResult = await this.scanCode()
      let { result } = scanResult
      result = result.trim()
      if (result) {
        let storeId = scanResult.result // 门店id
        let pickUpResult = await new Promise((resolve, reject) => {
          userAuthHub.subscribe(resolve)
          uni.navigateTo({
            url: `./cancel?couponid=${couponid}&storeid=${storeId}`
          })
        })
        if (pickUpResult.result) {
          this.clearTimer()
          this.getData()
        } else if (pickUpResult.code === 600016) {
          // 提领券过期
          this.info.status = 2
          this.clearTimer()
        }
      }
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      const params = { id: this.id }
      let res = await apiGetBringCouponDetail(params)
      if (this.$ck(res, true)) {
        this.info = res.return_data
        this.busy = false
        this.loading = false
        this.handleRefreshCode()
        if (this.info.status === 0) {
          this.timer = setTimeout(() => {
            this.pollStatusUpdate(params)
          }, 3000)
        } else {
          this.clearTimer()
        }
      } else {
        this.busy = false
      }
    },
    /** 轮询只更新核销状态，不刷新整页、不重新拉二维码 */
    async pollStatusUpdate(params) {
      let res = await apiGetBringCouponDetail(params, false)
      if (this.$ck(res, false)) {
        this.info = res.return_data
        if (this.info.status === 0) {
          this.timer = setTimeout(() => {
            this.pollStatusUpdate(params)
          }, 2000)
        } else {
          this.clearTimer()
        }
      } else {
        this.clearTimer()
      }
    },
    clearTimer() {
      this.timer && clearTimeout(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f4f4f4;
}
.detail-header-box {
  background: #ffd561;
  padding: 30rpx;
  .detail-header {
    position: relative;
    overflow: hidden;
    background: #fff;
    border-radius: 8rpx;
    .detail-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      .logo {
        width: 120rpx;
        height: 120rpx;
        padding: 40rpx 0 0;
        vertical-align: top;
        border-radius: 5rpx;
      }
      .name {
        padding: 30rpx 30rpx 37rpx;
        text-align: center;
      }
      .date {
        width: 650rpx;
        margin: 0 auto 50rpx;
        padding: 20rpx;
        background: rgba(255, 162, 0, 0.102);
        color: #ffa200;
        border-radius: 8rpx;
        box-sizing: border-box;
      }
    }
    .coupon-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-top: 1rpx dashed #dedede;
      position: relative;
      .refresh-box {
        display: flex;
        align-items: center;
        position: absolute;
        right: 30rpx;
        top: 20rpx;
        color: #3e94dd;
      }
      .circle {
        width: 40rpx;
        height: 40rpx;
        position: absolute;
        top: 0;
        z-index: 1;
        background: #ffd561;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      .left-circle {
        left: 0;
      }
      .right-circle {
        right: 0;
        transform: translate(50%, -50%);
      }
      .code-img-wrap {
        position: relative;
        width: 300rpx;
        height: 300rpx;
        margin: 90rpx auto 20rpx;
        &.has-status .code-img {
          opacity: 0.3;
        }
        .status-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 160rpx;
          z-index: 50;
        }
      }
      .code-img {
        width: 300rpx;
        height: 300rpx;
        display: block;
      }
      .code-content {
        padding-bottom: 20rpx;
      }
      .tip {
        margin: 0 0 42rpx;
      }
      .button {
        width: 520rpx;
        height: 80rpx;
        line-height: 80rpx;
        margin-bottom: 40rpx;
        text-align: center;
        border-radius: 40rpx;
      }
      .dated-button {
        background: linear-gradient(90deg, rgba(218, 218, 218, 1) 0%, rgba(237, 237, 237, 1) 100%) !important;
        box-shadow: 0px 0px 8rpx rgba(218, 218, 218, 1);
      }
    }
    .qrcode-box {
      position: relative;
      width: 650rpx;
      margin: 40rpx auto;
      background: #f9f9f9;
      padding: 30rpx;
      border-radius: 8rpx;
      box-sizing: border-box;
    }
  }
}
.detail-body-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx 0 0;
  background: #fff;
  padding: 34rpx 30rpx;
}
.detail-footer-box {
  padding: 0 30rpx 10rpx;
  background: #fff;
  margin: 20rpx 0 0;
  .item {
    padding: 30rpx 0;
    display: flex;
    .alpha {
      display: block;
      width: 180rpx;
    }
    .beta {
      display: block;
      flex: 1;
    }
  }
  .item:last-child {
    background: none;
  }
}
.canvas-code {
  position: fixed;
  left: -999px;

  width: 150px;
  height: 150px;
}
.base-btn {
  background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
  box-shadow: 0px 0px 8rpx #ffa200;
  color: #ffffff;
}
</style>
