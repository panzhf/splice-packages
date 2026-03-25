<template>
  <view>
    <view style="min-height: 100vh" class="store-list">
      <view v-for="(detail, i) in storeList" :key="i">
        <view class="item flex flex-between">
          <view class="alpha flex-1 flex flex-column">
            <view class="store-name c-4 fs-28 fw-bold">{{ detail.storename }}</view>
            <view class="distance mb-10 fs-24">{{ detail.distance | formatDistance }}</view>
            <view class="store-address fs-24 c-6">
              {{ detail.province }}{{ detail.city }}{{ detail.area }}{{ detail.address }}
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
      <view v-if="storeList.length === 0">
        <none-data msg="暂无门店" class="none-data" />
      </view>
    </view>
    <guide-toast ref="guideToast" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetNearbyStoresList } from 'packages/api/order'
import Map from 'packages/utils/map'
import GuideToast from 'packages/components/guide-toast/index.vue'
import NoneData from 'packages/components/none-data/index.vue'
export default {
  components: {
    GuideToast,
    NoneData
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
      // personLine: '',
      gps: {},
      MpName: '',
      storeList: [],
      storeCount: 0,
      page: 1,
      info: {},
      textArray: ['暂无附近门店']
    }
  },
  async onLoad(option) {
    if (option['gps']) {
      let gps = JSON.parse(option['gps'])
      this.gps = gps

      // 查询门店
      const params = this.getParams()
      this.findDistanceInfo(params)
      this.$loading.hide()
    }
  },
  async onReachBottom() {
    this.loadMore()
  },
  methods: {
    loadMore() {
      if (this.storeCount > this.storeList.length) {
        const page = this.page + 1
        const params = this.getParams(page)
        // 获取门店
        this.findDistanceInfo(params)
      }
    },
    getParams(page = 1) {
      let params = {
        // #ifdef MP-RETAIL || MP-GUIDE
        pageindex: page,
        pagesize: 10,
        lng: this.gps.longitude,
        lat: this.gps.latitude,
        // #endif
        // #ifdef MP-MEMBER || MP-CLOUDSHOP
        page,
        longitude: this.gps.longitude,
        latitude: this.gps.latitude
        // #endif
      }
      return params
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
        let param = Object.assign({}, this.gps, { page: 1 })
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
    // 重新查询页面数据
    async findDistanceInfo(params) {
      let res = await apiGetNearbyStoresList(params)
      if (this.$ck(res)) {
        const data = res.return_data

        this.MpName = data.mpname
        this.storeCount = data.totalcount
        // #ifdef MP-RETAIL || MP-GUIDE
        this.page = params.pageindex
        const list = data.list.map(item => {
          return {
            ...item,
            area: item.areaname,
            city: item.cityname,
            province: item.provincename
          }
        })
        if (params.pageindex === 1) {
          this.storeList = list
        } else {
          this.storeList = this.storeList.concat(list)
        }
        // #endif
        // #ifdef MP-MEMBER || MP-CLOUDSHOP
        this.page = params.page
        if (params.page === 1) {
          this.storeList = data.stores
        } else {
          this.storeList = this.storeList.concat(data.stores)
        }
        // #endif
        // 如果查询的总数据查过10条，并且当前页面少于10条数据，则加载更多, 最多加载更多2次
        if (this.storeCount > 10 && this.storeList.length < 10 && this.page < 3) {
          this.loadMore()
        }
      }
      uni.stopPullDownRefresh()
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f4f4f4;
}
.store-list {
  padding: 0 30rpx;
  background: #fff;
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
