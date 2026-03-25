<template>
  <view class="navigate-button" :style="containerStyle">
    <view class="img-box">
      <image :src="imgUrl" mode="widthFix" class="image" @tap.stop="handleNavigate" />
    </view>
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import { getUserLocation } from 'packages/utils/location-mp.js'
// #endif
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    imgUrl() {
      return this.info.imgUrl
    },
    containerStyle() {
      let s = []
      s.push(`padding: 0 ${(this.info.gap || 0) * 2}rpx`)
      return s.join(';')
    }
  },
  methods: {
    async handleNavigate() {
      // #ifdef MP-WEIXIN
      let resData = await getUserLocation({
        skipChoose: false, // 是否用地图选点
        useTencentMapAPI: false, // 是否用腾讯地图逆解析
        isReturnProvinceCity: false // 是否返回省市区
      })
      uni.navigateTo({
        url: `/packages/src/personal/bring-coupon/store-list?gps=${JSON.stringify(resData)}`
      })
      // #endif
      // #ifdef H5
      const url = uni.getStorageSync('nearbyStoreUrl') || ''
      if (!url) {
        return
      }
      location.href = url
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'navigate-button';
.#{$prefix} {
  overflow: hidden;
  .img-box {
    position: relative;
  }
}
</style>
