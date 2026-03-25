<template>
  <view>
    <view style="min-height: 100vh">
      <view class="store-detail-header">
        <view class="item split-line" style="align-items: center">
          <image class="poster" :src="detail.storeimg" />
          <view class="info">
            <view class="name fs-28 fw-bold">{{ detail.storename }}</view>
            <view class="address fs-24 c-6">
              {{ detail.province }}{{ detail.city }}{{ detail.area }}{{ detail.address }}
            </view>
            <view class="distance" @tap="detail.metre ? openMap : getLocationInfo">
              <text class="icon iconfont icon-store-address" />
              <text v-if="detail.metre" class="distance fs-24 c-6">{{ detail.metre }}</text>
              <text wx:else class="distance fs-24 c-6">授权获取到店距离</text>
            </view>
          </view>
        </view>
        <view v-if="detail.businesshours" class="item split-line c-3 fs-28 tr">
          <text class="alpha">营业时间：</text>
          <text class="beta">{{ detail.businesshours }}</text>
        </view>
        <view v-if="detail.phoneno" class="item c-3 fs-28 tr" @tap="call(detail.phoneno)">
          <text class="alpha">电话：</text>
          <text class="beta">{{ detail.phoneno }}</text>
          <view class="icon iconfont icon-store-tele base-txt" />
        </view>
      </view>
      <view
        v-if="detail.percapita || detail.recommend || detail.characteristic || detail.introduction"
        class="store-detail-header"
      >
        <view v-if="detail.percapita" class="item split-line c-3 fs-28 tr">
          <text class="alpha">人均价格：</text>
          <text class="beta">{{ detail.percapita }}元</text>
        </view>
        <view v-if="detail.recommend" class="item split-line c-3 fs-28 tr">
          <text class="alpha">推荐：</text>
          <text class="beta">{{ detail.recommend }}</text>
        </view>
        <view v-if="detail.characteristic" class="item split-line c-3 fs-28 tr">
          <text class="alpha">特色：</text>
          <text class="beta">{{ detail.characteristic }}</text>
        </view>
        <view v-if="detail.introduction" class="item c-3 fs-28 tr">
          <text class="alpha">简介：</text>
          <text class="beta">{{ detail.introduction }}</text>
        </view>
      </view>
      <view v-if="detail.images.length > 0" class="store-detail-poster">
        <view class="title fs-32 fw-bold">门店图片</view>
        <view class="poster-list">
          <block v-for="(item, index) in detail.images" :key="index">
            <view class="poster-box" @tap="LookPoster(item)">
              <image class="poster" :src="item" />
            </view>
          </block>
        </view>
      </view>
      <view
        v-if="
          detail.images.length === 0 &&
          !(detail.percapita || detail.recommend || detail.characteristic || detail.introduction)
        "
      >
        <none-data msg="该门店详情正在完善中" class="none-data" />
      </view>
    </view>
    <guide-toast ref="guideToast" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetNearbyStoresDetail } from 'packages/api/bring-coupon'
import Map from 'packages/utils/map'
import NoneData from 'packages/components/none-data/index.vue'
import GuideToast from 'packages/components/guide-toast/index.vue'
import { previewImage } from 'packages/utils'

export default {
  components: {
    NoneData,
    GuideToast
  },
  data() {
    return {
      storeid: '',
      gps: {},
      detail: {},
      textArray: ['该门店详情正在完善中...']
    }
  },
  async onLoad(option) {
    // this.findRecordList(this.tablist[this.selectTab].id)
    if (option['id']) {
      let storeid = Number(option['id'])
      this.storeid = storeid
      if (option['gps']) {
        let gps = JSON.parse(option['gps'])
        this.gps = gps
        let params = Object.assign({}, gps, { storeid: storeid })
        this.setStoreDetail(params)
      } else {
        let params = Object.assign({}, {}, { storeid: storeid })
        this.setStoreDetail(params)
      }
    }
  },
  methods: {
    async getLocationInfo() {
      let info = await Map.getWgsInfo()
      if (info.code === 1004) {
        let obj = {
          status: true,
          buttonText: '去设置',
          type: 2,
          title: `需要获取你的位置信息,请先允许${this.detail.MpName}使用你的位置信息`
        }
        this.$refs.guideToast.setToastInfo(obj)
      } else if (info.code === 200) {
        this.gps = info.data.gps
        let params = Object.assign({}, this.gps, { storeid: this.storeid })
        this.setStoreDetail(params)
      } else if (info.code === 1002) {
        let obj = {
          status: true,
          title: '请先开启手机的GPS定位功能',
          buttonText: '知道了'
        }
        this.$refs.guideToast.setToastInfo(obj)
      }
    },
    openMap() {
      let storeDetail = this.detail
      if (storeDetail.latitude && storeDetail.longitude) {
        wx.openLocation({
          latitude: parseFloat(storeDetail.latitude),
          longitude: parseFloat(storeDetail.longitude),
          name: storeDetail.storename,
          address: `${storeDetail.province}${storeDetail.city}${storeDetail.area}${storeDetail.address}`
        })
      } else {
        this.$msg('该门店无经纬度信息')
      }
    },
    LookPoster(url) {
      previewImage({
        current: url,
        urls: this.detail.images
      })
    },
    call(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },
    async setStoreDetail(param) {
      let result = await this.requestStoresApi(param)
      if (result.succeeded) {
        this.detail = result.data
      } else {
        this.$msg(result.data.return_msg ? result.data.return_msg : '服务异常')
      }
      uni.stopPullDownRefresh()
    },
    async requestStoresApi(param) {
      return new Promise((resolve, reject) => {
        apiGetNearbyStoresDetail(param).then(res => {
          if (this.$ck(res)) {
            resolve({ succeeded: true, data: res.return_data })
          } else {
            resolve({ succeeded: false, data: res })
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f4f4f4;
}
.store-detail-header {
  padding: 7rpx 30rpx 0 30rpx;
  background: #fff;
  margin: 0 0 20rpx;
  .item {
    display: flex;
    padding: 0 0 30rpx;
    position: relative;
    .icon-store-tele {
      position: absolute;
      top: 30rpx;
      right: 0;
      font-size: 30rpx;
      z-index: 1;
    }
    .poster {
      width: 120rpx;
      height: 120rpx;
      vertical-align: top;
      padding: 0 22rpx 0 0;
    }
    .info {
      display: flex;
      flex-direction: column;
      flex: 1;
      .name {
        color: #302622;
      }
      .address {
        padding: 10rpx 0 5rpx;
      }
      .distance {
        .icon-store-address {
          color: #2f2f2f;
          font-size: 22rpx;
          padding: 0 8rpx 0 0;
        }
      }
    }
    .alpha {
      width: 120rpx;
      padding: 0 22rpx 0 0;
      white-space: nowrap;
    }
    .beta {
      flex: 1;
    }
  }
  .item:last-child {
    background: none;
  }
  .tr {
    padding: 30rpx 0;
  }
}

.store-detail-poster {
  background: #fff;
  padding: 0 30rpx;
  .title {
    color: #302622;
    padding: 40rpx 0 30rpx;
  }
  .poster-list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .poster-box {
      width: 330rpx;
      height: 180rpx;
      overflow: hidden;
      display: flex;
      align-items: center;
      margin: 0 0 30rpx;
      .poster {
        width: 100%;
        vertical-align: top;
      }
    }
  }
}
</style>
