<template>
  <view v-if="show" class="address-edit" :style="themeVars">
    <view class="form bg-f">
      <view class="form-item flex bd-e">
        <view class="key required" :class="{ 'is-pg': isCustom }">地区信息</view>
        <view v-if="address" class="value flex-1 ellipsis-2" style="margin-right: 150rpx">
          {{ address }}
        </view>
        <view
          class="mdfont icon-mdfont-address iconfont icon-address-user fs-30 text-center edit-color"
          @tap="handleAddressMap"
        >
          <text class="fs-24 ml-10">获取定位</text>
        </view>
      </view>
      <view :class="['form-item flex flex-middle', isCustom ? 'bd-e' : '']">
        <view class="key required" :class="{ 'is-pg': isCustom }">详细地址</view>
        <view class="value flex-1">
          <textarea
            v-model.trim="storeInfo.address"
            class="proDescribe"
            :auto-height="true"
            placeholder="详细地址"
            :placeholder-style="placeStyle"
            maxlength="50"
            @blur="handleGetValue($event, 'a')"
          />
        </view>
      </view>
      <view v-if="isCustom" class="form-item flex flex-middle">
        <view class="key required" :class="{ 'is-pg': isCustom }">门牌号</view>
        <view class="value flex-1">
          <textarea
            v-model.trim="storeInfo.houseNumber"
            class="proDescribe"
            :auto-height="true"
            placeholder="补充楼栋、门牌号信息"
            :placeholder-style="placeStyle"
            maxlength="20"
            @blur="handleGetValue($event, 'h')"
          />
        </view>
      </view>
    </view>
    <view class="form-button">
      <button
        class="primary-btn round"
        hover-class="button-action"
        :style="type === 0 || type === 3 ? btnStyle : null"
        @tap="SaveStoreInfo"
      >
        确认修改
      </button>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { staticURL } from '@/config/index'
// #ifdef MP-MEMBER || MP-RETAIL
import { getExtConfig } from '@/config/index'
// #endif
import { getUserLocation } from 'packages/utils/location-mp.js'
import { specialRegisterStyle } from 'packages/config/custom'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {},
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      show: false,
      m: '', // 只有注册 && 宝洁才需要显示门牌号,其他页面不要传品牌编号
      storeInfo: {
        province: '',
        city: '',
        area: '',
        street: '',
        address: '',
        lanandlat: '',
        houseNumber: '' //门牌号
      },
      loading: false,
      type: 0 //0会员小程序注册页  1其它（激活页/手动添加修改）2万能零售注册页（未接入） 3是精准定位需要接口去转换获取
    }
  },
  computed: {
    btnStyle() {
      let s = []
      s.push(`background-color: ${this.customStyle.btnBgc}`)
      s.push(`background-image: url(${this.customStyle.btnImg})`)
      s.push(`height: ${this.customStyle.btnHeight}`)
      s.push(`line-height: ${this.customStyle.btnLineHeight}`)
      return s.join(';')
    },
    placeStyle() {
      let s = []
      s.push(`color: #999;`)
      s.push(`font-weight: normal;`)
      s.push(`font-size: 30rpx`)
      return s.join(';')
    },
    isCustom() {
      let isCustom = false
      // #ifdef MP-MEMBER || MP-RETAIL
      isCustom = specialRegisterStyle.includes((getExtConfig() || {}).memberLogin)
      // #endif
      return isCustom
    },
    customStyle() {
      if (this.isCustom) {
        return {
          btnImg: staticURL(true) + 'personal/btn-bg.png',
          btnBgc: '#f4f4f4',
          btnHeight: '118rpx',
          btnLineHeight: '118rpx'
        }
      }
      return {
        btnHeight: '80rpx',
        btnLineHeight: '80rpx'
      }
    },
    address() {
      let { province, city, area, street } = this.storeInfo
      return (province || '') + (city || '') + (area || '') + (street || '')
    }
  },
  async onLoad(options) {
    this.type = Number(options.type || 0)
    // console.log(' this.type', this.type)
    this.m = options.m ? options.m.toString() : ''
    const storeInfoTemp = uni.getStorageSync('storeRegisterAddress')
    this.storeInfo = { ...this.storeInfo, ...storeInfoTemp }
    this.show = true
    if (!this.storeInfo.lanandlat) {
      setTimeout(() => {
        this.chooseLocation()
      }, 300)
    }
  },
  methods: {
    handleGetValue(e, type) {
      const v = e.detail.value
      type === 'a' ? (this.storeInfo.address = v) : (this.storeInfo.houseNumber = v)
    },
    handleAddressMap() {
      this.chooseLocation()
    },
    // 保存店铺信息
    SaveStoreInfo() {
      if (this.type === 1 && !this.storeInfo.lanandlat) {
        return this.$msg('暂未录入经纬度信息，请重新获取定位')
      }
      if (this.storeInfo.province === '' || this.storeInfo.city === '') return this.$msg('请选择地区信息')
      if (this.storeInfo.address === '') return this.$msg('请填写详细地址')
      if (this.isCustom && this.storeInfo.houseNumber === '') return this.$msg('请填写门牌号')
      this.updateStoreInfo()
    },
    async updateStoreInfo() {
      if (this.loading) return
      this.loading = true
      let { province, city, area, address, street, lanandlat, houseNumber, provinceid, cityid, areaid, streetid } =
        this.storeInfo
      this.type === 0 || this.type === 3
        ? uni.setStorageSync('storeRegisterAddress', {
            province,
            city,
            area,
            street,
            address,
            lanandlat,
            houseNumber,
            provinceid,
            cityid,
            areaid,
            streetid
          })
        : uni.$emit('store-register-address', {
            province,
            city,
            area,
            street,
            address,
            lanandlat,
            houseNumber
          })
      this.loading = false
      uni.navigateBack()
    },
    // 获取用户当前地址
    async chooseLocation() {
      if (this.type === 3) {
        // 要通过接口去获取精准定位的，有provinceid，cityid，areaid，streetid
        let resData = await getUserLocation({ skipChoose: true, useTencentMapAPI: false })
        const {
          provincename: province,
          cityname: city,
          areaname: area,
          streetname: street,
          provinceid,
          cityid,
          areaid,
          streetid,
          address,
          longitude,
          latitude
        } = resData
        const lanandlat = latitude + ',' + longitude
        this.storeInfo = {
          ...this.storeInfo,
          province,
          city,
          area,
          street,
          address,
          lanandlat,
          provinceid,
          cityid,
          areaid,
          streetid
        }
        return
      }
      let resData = await getUserLocation()
      const { province, city, district: area, town: street, address, lonandlat: lanandlat } = resData
      this.storeInfo = {
        ...this.storeInfo,
        province,
        city,
        area,
        street,
        address,
        lanandlat
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.form {
  margin: 20rpx;
  padding: 0 30rpx 30rpx;
  border-radius: 10rpx;
  line-height: 40rpx;
  .form-title {
    color: #000;
    font-size: 32rpx;
    font-weight: 700;
  }
  &-item {
    padding: 30rpx 0;
    font-size: 30rpx;
    .key {
      position: relative;
      color: $uni-text-color-grey;
      width: 150rpx;
      &.required {
        &::before {
          position: absolute;
          content: '*';
          top: 4rpx;
          left: -18rpx;
          font-weight: bold;
          color: #dd2726;
        }
        // &.is-pg {
        //   &::before {
        //     color: #00559e;
        //   }
        // }
      }
    }
    .value {
      text-align: left;
    }
    .icon-address-user {
      position: absolute;
      top: 0;
      right: -20rpx;
      width: 150rpx;
      padding: 30rpx 0;
    }
  }
  .proDescribe {
    display: block;
    width: 100%;
    border: none;
    font-size: 32rpx;
    z-index: 0;
  }
}
.form-button {
  margin: 60rpx 20rpx 0;
}
.edit-color {
  color: #0f80ff;
}
.primary-btn {
  background-size: 100% 100%;
}
// #ifdef MP-SALE
.address-edit {
  min-height: 100vh;
  background-color: #f4f4f4;
}
// #endif
</style>
