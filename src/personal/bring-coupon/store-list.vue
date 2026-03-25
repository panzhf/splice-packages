<template>
  <view>
    <view style="min-height: 100vh">
      <view v-if="info.template.item.length > 0">
        <view v-for="(store, index) in info.template.item" :key="index">
          <view v-if="store.name == 'Notice'" class="store-header">
            <UniNoticeBar scrollable single :background-color="bgColor" color="#885603" :text="store.data.content" />
          </view>
          <view v-if="store.name == 'ImageAd' && store.data.images.length > 0" class="store-banner">
            <image-ad v-model="store.data.images" />
          </view>
          <view v-if="store.name === 'NearbyStoresEntrance'" class="store-list">
            <view>
              <view class="detail-body-box flex flex-between flex-middle">
                <view class="store fs-32 fw-bold">附近门店</view>
                <view v-if="!gps['longitude']" class="fs-22" @tap="checkStore">
                  <text>授权获取到店距离</text>
                  <text class="icon iconfont icon-more c-6" />
                </view>
              </view>
            </view>
            <view v-for="(detail, i) in storeList" :key="i">
              <view class="item flex flex-between">
                <view class="alpha flex-1 flex flex-column" @tap="goStoreDetail(detail.id)">
                  <view class="store-name c-4 fs-28 fw-bold">{{ detail.storename }}</view>
                  <view class="distance mb-10 fs-24">{{ detail.distance | formatDistance }}</view>
                  <view class="store-address fs-24 c-6">
                    {{ detail.province }}{{ detail.city }}{{ detail.area }}{{ detail.address }}
                  </view>
                  <view v-if="detail.businesshours" class="store-work fs-24 c-6">
                    营业时间：{{ detail.businesshours }}
                  </view>
                </view>
                <view
                  class="beta flex flex-middle flex-center flex-column pl-20"
                  @tap="gps.longitude ? openMap(detail) : checkStore()"
                >
                  <view
                    :class="[
                      'icon',
                      'iconfont',
                      'icon-store-address',
                      detail.metre && detail.longitude && detail.latitude ? 'active-color' : 'c-6'
                    ]"
                  />
                  <view class="iconfont iconjuliicon map_icon" />
                  <view class="nav-tip fs-24">去导航</view>
                </view>
              </view>
            </view>
            <view v-if="storeList.length === 0" style="background: #fff">
              <none-data msg="暂无门店" class="none-data" />
            </view>
          </view>
        </view>
      </view>
      <!-- 从门店兑换进来只需要显示附近门店 -->
      <view v-else class="store-list">
        <view v-for="(detail, i) in storeList" :key="i">
          <view class="item flex flex-between">
            <view class="alpha flex-1 flex flex-column" @tap="goStoreDetail(detail.id)">
              <view class="store-name c-4 fs-28 fw-bold">{{ detail.storename }}</view>
              <view class="distance mb-10 fs-24">{{ detail.distance | formatDistance }}</view>
              <view class="store-address fs-24 c-6">
                {{ detail.province }}{{ detail.city }}{{ detail.area }}{{ detail.address }}
              </view>
              <view v-if="detail.businesshours" class="store-work fs-24 c-6">营业时间：{{ detail.businesshours }}</view>
            </view>
            <view
              class="beta flex flex-middle flex-center flex-column pl-20"
              @tap="gps.longitude ? openMap(detail) : checkStore()"
            >
              <view
                :class="[
                  'icon',
                  'iconfont',
                  'icon-store-address',
                  detail.metre && detail.longitude && detail.latitude ? 'active-color' : 'c-6'
                ]"
              />
              <view class="iconfont iconjuliicon map_icon" />
              <view class="nav-tip fs-24">去导航</view>
            </view>
          </view>
        </view>
        <view v-if="storeList.length === 0" style="background: #fff">
          <none-data msg="暂无门店" class="none-data" />
        </view>
      </view>
    </view>
    <guide-toast ref="guideToast" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetNearbyStores, apiGetNearbyStoresList } from 'packages/api/bring-coupon'
import { UniNoticeBar } from '@dcloudio/uni-ui'
import Map from 'packages/utils/map'
import GuideToast from 'packages/components/guide-toast/index.vue'
import NoneData from 'packages/components/none-data/index.vue'
import ImageAd from './components/image-ad'
export default {
  components: {
    UniNoticeBar,
    GuideToast,
    NoneData,
    ImageAd
  },
  filters: {
    formatDistance: distance => {
      if (!distance) return '未获得距离'
      // 小于1000使用m单位，超过1000使用km单位
      if (distance >= 1000) {
        const km = (distance / 1000).toFixed(1)
        return `距您${km}km`
      }
      return `距您${distance}m`
    }
  },
  data() {
    return {
      gps: {},
      MpName: '',
      storeList: [],
      storeCount: 0,
      page: 1,
      voucherid: '',
      info: {
        template: {
          item: []
        }
      },
      textArray: ['暂无附近门店'],
      storeids: []
    }
  },
  async onLoad(option) {
    if (option.id) {
      this.$loading.show()
      let voucherid = Number(option.id)
      if (option['gps']) {
        let gps = JSON.parse(option['gps'])
        let param = Object.assign({}, gps, { voucherid: voucherid })
        this.findDistanceInfo(param)
        this.gps = gps
        this.voucherid = voucherid
        this.$loading.hide()
      }
    } else {
      if (option['gps']) {
        if (option['storeids']) {
          this.storeids = JSON.parse(option['storeids'])
        }
        let gps = JSON.parse(option['gps'])
        let param = Object.assign({}, gps)
        let params = {}
        // 从门店兑换跳进来如果选择了部分门店需要带上storeids   如果storeids=[0] 就不需要带
        if (this.storeids[0] === 0 || this.storeids.length === 0) {
          params = Object.assign({}, param, { page: 1 })
        } else {
          params = Object.assign({}, param, { page: 1 }, { storeids: this.storeids })
        }
        let lists = await this.requestStoreListApi(params)
        if (lists.succeeded) {
          this.MpName = lists.data.mpname
          this.storeList = lists.data.stores
          this.storeCount = lists.data.totalcount
          this.isLoadend = lists.data.totalcount === lists.data.stores.length
        }
        this.gps = gps
        this.$loading.hide()
      }
    }
  },
  async onReachBottom() {
    if (this.storeCount > this.storeList.length) {
      let page = this.page + 1
      let params = {}
      // 从门店兑换跳进来如果选择了部分门店需要带上storeids   如果storeids=[0] 就不需要带
      if (this.storeids[0] === 0 || this.storeids.length === 0) {
        params = Object.assign({}, this.gps, {
          page: page,
          voucherid: this.voucherid || 0
        })
      } else {
        params = Object.assign({}, this.gps, {
          page: page,
          voucherid: this.voucherid || 0,
          storeids: this.storeids
        })
      }

      let lists = await this.requestStoreListApi(params)
      if (lists.succeeded) {
        this.page = page
        this.storeList = this.storeList.concat(lists.data.stores)
        this.storeCount = lists.data.totalcount
      }
    }
  },
  methods: {
    goStoreDetail(id) {
      let paramString = JSON.stringify(this.gps)
      uni.navigateTo({
        url: `./store-detail?id=${id}&gps=${paramString}`
      })
    },
    async checkStore() {
      let info = await Map.getWgsInfo()
      if (info.code === 1004) {
        var obj = {
          status: true,
          buttonText: '去设置',
          type: 2,
          title: `需要获取你的位置信息,请先允许${this.MpName}使用你的位置信息`
        }
        this.$refs.guideToast.setToastInfo(obj)
      } else if (info.code === 200) {
        this.page = 1
        this.gps = info.data.gps
        let param = Object.assign({}, this.gps, { voucherid: this.voucherid })
        this.findDistanceInfo(param)
      } else if (info.code === 1002) {
        let obj = {
          status: true,
          title: '请先开启手机的GPS定位功能',
          buttonText: '知道了'
        }
        this.$refs.guideToast.setToastInfo(obj)
      }
    },

    openMap(storeDetail) {
      if (storeDetail.latitude && storeDetail.longitude) {
        uni.openLocation({
          latitude: parseFloat(storeDetail.latitude),
          longitude: parseFloat(storeDetail.longitude),
          name: storeDetail.storename,
          address: `${storeDetail.province}${storeDetail.city}${storeDetail.area}${storeDetail.address}`
        })
      } else {
        this.$msg('该门店无经纬度信息')
      }
    },
    // 查询门店模块
    async requestStoresApi(param) {
      return new Promise(resolve => {
        apiGetNearbyStores(param).then(res => {
          if (this.$ck(res)) {
            resolve({ succeeded: true, data: res.return_data })
          } else {
            resolve({ succeeded: false, data: res })
          }
        })
      })
    },
    // 重新查询页面数据
    async findDistanceInfo(param) {
      let info = await this.requestStoresApi(param)
      if (info.succeeded) {
        this.info = info.data
        let params = Object.assign({}, param, { page: 1 })
        let lists = await this.requestStoreListApi(params)
        if (lists.succeeded) {
          this.MpName = lists.data.mpname
          this.storeList = lists.data.stores
          this.storeCount = lists.data.totalcount
          this.isLoadend = lists.data.totalcount === lists.data.stores.length
        }
      } else {
        this.$msg(info.data.return_msg ? info.data.return_msg : '服务异常')
      }
      uni.stopPullDownRefresh()
    },
    // 查询门店列表
    async requestStoreListApi(param) {
      return new Promise(resolve => {
        apiGetNearbyStoresList(param).then(res => {
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
.store-header {
  margin: 20rpx 30rpx;
  border-radius: 30rpx;
  .van-notice-bar {
    background-color: rgba(255, 255, 255, 0.5) !important;
    height: 60rpx;
    border-radius: 30rpx;
  }
}
.store-banner {
  margin-bottom: 20rpx;
}
.store-list {
  padding: 0 30rpx;
  background: #fff;
  .detail-body-box {
    padding: 40rpx 0 10rpx;
    color: #302622;
    .icon {
      font-size: 20rpx;
      padding: 0 0 0 12rpx;
    }
  }
  .item {
    padding: 40rpx 0 30rpx;
    .alpha {
      .store-name {
        padding-bottom: 14rpx;
      }
      .store-address {
        padding: 0 20rpx 6rpx 0;
      }
    }
    .beta {
      position: relative;
      .active-color {
        color: #dd2726;
      }
      .distance {
        padding-top: 6rpx;
      }
      .map_icon {
        color: var(--theme-color, $uni-color-primary);
        font-size: 32rpx;
      }
      .nav-tip {
        margin-top: 10rpx;
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
}
</style>
