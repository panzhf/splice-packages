<template>
  <view>
    <!-- 显示区域 -->
    <view class="area-wrap">
      <address-picker ref="addressPicker" class="address" @getAddress="getAddress">
        <template #result="{ region }">
          <view :class="['picker-result', region[0] ? '' : 'pl70']">
            <view v-if="region[0]" class="title">{{ region[1] }}{{ region[2] }}</view>
            <view v-else class="title">全国</view>
            <text class="iconfont iconjiantou" />
          </view>
        </template>
      </address-picker>
      <ProductSearch
        class="search"
        :search-data="{
          Placeholder: '搜索门店',
          Style: 'round',
          type: 'white'
        }"
        :is-auto-focus="false"
        @confirm="onProductSearchConfirm"
      />
    </view>
    <map
      v-if="nearbyStoreObj.Lat"
      :scale="scale"
      show-location
      :longitude="lookStore.Lng"
      :latitude="lookStore.Lat"
      :markers="markers"
      class="map-content"
      @markertap="handleMarkerTap"
      @callouttap="handleMarkerTap"
    />
    <!-- 网点列表页 -->
    <scroll-view v-if="list.length" :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" :scroll-into-view="toView">
      <view
        v-for="(item, index) in list"
        :id="'view' + item.Id"
        :key="index"
        class="shop_detailBox defaultShop"
        hover-class="button-hover"
        @click="handleBindStore(item.storeid)"
      >
        <view v-if="item.storeid === Id" class="iconfont iconxuanzejiaobiao defaultShop_icon" />
        <view class="shop_name">
          <view class="shop_name_text">{{ item.storename }}</view>
        </view>
        <view class="shop_detail">
          <view class="shop_detailAddr">
            <view class="shop_address">
              <view class="iconfont icondizhi store_detail__icon" />
              <view class="shop_detail_text">{{ item.addressdetail }}</view>
            </view>
          </view>
          <view class="shop_detailMap" @click.stop="handleOpenMap(item)">
            <view class="iconfont iconjuliicon map_icon" />
            <view class="distanceText">{{ item.distance }}</view>
          </view>
        </view>
      </view>
    </scroll-view>
    <none-data
      v-if="!list.length"
      msg="当前地区暂无门店~"
      :icon="areaEmptyIcon"
      :icon-width="389"
      :icon-height="228"
      class="nono-data"
    />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import NoneData from 'packages/components/none-data/index.vue'
import AddressPicker from '../components/address-picker'
import ProductSearch from './components/search-bar.vue'
import { apiGetBackwardsLocation, apiGetStoreList } from 'packages/api/integral.js'
import { getJsCode } from '@/utils/set-mp'
export default {
  components: {
    AddressPicker,
    ProductSearch,
    NoneData
  },
  data() {
    return {
      Id: 0,
      areaEmptyIcon: staticURL(true) + 'areaEmptyIcon.png', //收入明细
      nearbyStoreObj: {
        Lat: 0,
        Lng: 0,
        Province: 0,
        City: 0,
        Area: 0,
        KeyWord: '', // 模糊查询 名称/详细地址
        PageIndex: 1,
        PageSize: 300,
        awdcode: ''
      },
      scale: 17,
      lookStore: {
        Lat: 0,
        Lng: 0
      },
      markers: [],
      list: [],
      JsCode: ''
    }
  },
  async onLoad(opotion) {
    this.nearbyStoreObj.Lat = Number(opotion.lat)
    this.nearbyStoreObj.Lng = Number(opotion.lng)
    this.nearbyStoreObj.awdcode = opotion.awdcode || ''
    this.lookStore.Lat = Number(opotion.lat)
    this.lookStore.Lng = Number(opotion.lng)
    this.JsCode = await getJsCode()
    const cityObj = await this.GetBackwardsLocation()
    this.nearbyStoreObj.Province = cityObj.province
    this.nearbyStoreObj.City = cityObj.city
    this.nearbyStoreObj.Area = cityObj.area
    this.$nextTick(() => {
      this.$refs.addressPicker.region = [cityObj.provincename, cityObj.cityname, cityObj.areaname]
    })
    this.QueryNearbyStore()
  },
  methods: {
    handleOpenMap(item) {
      let LanAndLat = item.lanandlat.split(',')
      let latitude = LanAndLat[0] - 0
      let longitude = LanAndLat[1] - 0
      uni.openLocation({
        latitude,
        longitude,
        name: item.Name,
        address: item.AddressDetail
      })
    },
    // 经纬度换省市区
    GetBackwardsLocation() {
      return new Promise((resolve, reject) => {
        // #ifdef MP-GUIDE
        const { memberlogin } = JSON.parse(uni.getStorageSync('currentBrandInfo') || '{}')
        // #endif
        apiGetBackwardsLocation({
          // #ifdef MP-GUIDE
          memberlogin,
          // #endif
          lat: this.nearbyStoreObj.Lat,
          lng: this.nearbyStoreObj.Lng,
          js_code: this.JsCode
        })
          .then(res => {
            if (this.$ck(res)) {
              resolve(res.return_data)
            }
          })
          .catch(error => {
            reject(error.return_msg)
          })
      })
    },
    async handleBindStore(Id) {
      if (Id == this.Id) return
      uni.showLoading({
        title: '切换中'
      })
      try {
        this.Id = Id
        this.markers.forEach(item => {
          item.width = item.storeid == Id ? 30 : 20
          item.height = item.storeid == Id ? 37 : 25
          item.iconPath = item.storeid == Id ? staticURL(true) + 'select-city.png' : staticURL(true) + 'store-city.png'
          item.callout.borderColor = item.storeid == Id ? '#ff4b40' : '#ff8808'
          item.callout.color = item.storeid == Id ? '#ff4b40' : '#ff8808'
          if (item.id === Id) {
            this.lookStore = {
              Lat: item.latitude,
              Lng: item.longitude
            }
            this.scale = 19
          }
        })
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
      }
    },
    handleMarkerTap(e) {
      // this.handleBindStore(e.detail.markerId)
      this.toView = 'view' + e.detail.markerId
    },
    onProductSearchConfirm(res) {
      this.nearbyStoreObj.KeyWord = res.keyword
      this.QueryNearbyStore()
    },
    getAddress(res) {
      console.log(res)
      this.nearbyStoreObj.Province = res.Province.id
      this.nearbyStoreObj.City = res.City.id
      this.nearbyStoreObj.Area = res.Area.id
      this.QueryNearbyStore()
    },
    QueryNearbyStore() {
      this.$loading.show({
        title: '加载中'
      })
      apiGetStoreList(this.nearbyStoreObj).then(res => {
        if (this.$ck(res)) {
          this.$loading.hide()
          let Results = res.return_data.list || []
          Results.filter((item, i) => {
            if (item.distance >= 1000) {
              item.distance = Number((item.distance - 0) / 1000).toFixed(1) + 'km'
            } else {
              item.distance = Number(item.distance - 0).toFixed(1) + 'm'
            }
            return item
          })

          let markers = []
          Results.forEach(item => {
            let obj = {
              latitude: Number(item.latitude),
              longitude: Number(item.longitude),
              id: item.storeid,
              Name: item.Name,
              width: item.storeid == this.Id ? 30 : 20,
              height: item.storeid == this.Id ? 37 : 25,
              iconPath:
                item.storeid == this.Id ? staticURL(true) + 'select-city.png' : staticURL(true) + 'store-city.png',
              callout: {
                content: item.storename,
                padding: 5,
                display: 'ALWAYS',
                borderRadius: 5,
                borderColor: item.storeid == this.Id ? '#ff4b40' : '#ff8808',
                borderWidth: 1,
                bgColor: '#fff',
                color: item.storeid == this.Id ? '#ff4b40' : '#ff8808'
              }
            }
            markers.push(obj)
          })
          this.markers = markers
          this.list = [...Results]
          if (this.nearbyStoreObj.KeyWord && this.list.length === 0) {
            this.$set(this.textArray, 0, '没有找到相关网点')
          }
          this.toView = 'view0'
          this.$nextTick(() => {
            this.toView = 'view' + this.Id
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.pl70 {
  padding-left: 70rpx;
}
.map-content {
  width: 100%;
  height: 610rpx;
}
.area-wrap {
  display: flex;
  width: 100%;
  z-index: 9999;
  height: 110rpx;
  line-height: 110rpx;
  padding: 0 20rpx;
  position: relative;
  background-color: #ffffff;
  box-shadow: 0px 0px 0px 0px rgba(34, 24, 20, 0.15);
  .address {
    width: 200rpx;
  }
  .search {
    position: absolute;
    top: 50%;
    right: 20rpx;
    transform: translateY(-50%);
    width: 70%;
    z-index: 98;
  }
}
.picker-result {
  display: flex;
  .title {
    max-width: 190rpx;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    outline: 0 !important;
    word-break: break-all;
  }

  .iconjiantou {
    transform: rotate(90deg) translateY(0%);
    font-size: 10rpx;
    margin-left: 6rpx;
  }
}
.shop_detailBox {
  background-color: #fff;
  padding: 30rpx;
  border-bottom: 20rpx solid #f5f5f5;
  position: relative;
  .defaultShop_icon {
    position: absolute;
    right: 0rpx;
    top: 0rpx;
    color: #ff4b40;
    font-size: 50rpx;
  }
  .shop_name {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    .shop_name_text {
      font-size: 30rpx;
      font-weight: bold;
      color: #000000;
      line-height: 34rpx;
      margin-right: 12rpx;
    }
    .default_style {
      font-size: 22rpx;
      padding: 0 6rpx;
      border: 1px solid #ff4b40;
      border-radius: 3rpx;
      color: #ff4b40;
      line-height: 24rpx;
      font-weight: normal;
      display: block;
      height: 24rpx;
      text-align: center;
    }
  }
  .shop_detail {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    .shop_detailAddr {
      font-size: 26rpx;
      color: #666;
      line-height: 34rpx;
      .store_detail__icon {
        font-size: 24rpx;
      }
      .shop_detail_text {
        display: flex;
        flex-wrap: wrap;
        width: 460rpx;
        margin-left: 12rpx;
        // word-break: keep-all;
        // word-wrap: break-word;
      }
      .shop_opentime {
        margin-top: 22rpx;
      }
      .shop_address,
      .shop_opentime {
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
      }
    }
    .shop_detailMap {
      text-align: center;
      margin-right: 10rpx;
      .map_icon {
        color: #0866ff;
        font-size: 32rpx;
      }
      .distanceText {
        margin-top: 14rpx;
        color: #666666;
        font-size: 24rpx;
        line-height: 34rpx;
      }
    }
  }
}
.scroll-Y {
  box-sizing: border-box;
  height: calc(100vh - 732rpx - constant(safe-area-inset-bottom));
  height: calc(100vh - 732rpx - env(safe-area-inset-bottom));
  position: absolute;
  bottom: 20rpx;
  bottom: calc(20rpx + constant(safe-area-inset-bottom));
  bottom: calc(20rpx + env(safe-area-inset-bottom));
  padding: 20rpx 30rpx;
}
.nono-data ::v-deep .none-content {
  padding: 80rpx;
}
</style>
