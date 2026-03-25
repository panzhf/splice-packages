<template>
  <view class="store-info" :style="{ 'background-image': `url(${storeData.BgImage})` }">
    <skeleton :loading="loading" :avatar-size="skeleton.avatarSize" :row="skeleton.row">
      <view class="store-info__body">
        <view v-if="storeData.AvatarShow !== 2" class="store-info__avatar" @click="handleOpenStoreDetail">
          <v-img v-if="HeadPath" size="400" :src="HeadPath" alt="" />
          <v-img v-else size="400" :src="storeData.Avatar" alt="" />
        </view>
        <view class="store-info__right">
          <view class="store-box">
            <view
              class="ellipsis store-info__header"
              :style="{ color: storeData.StoreNameColor }"
              @click="handleOpenStoreDetail"
            >
              {{ Name }}
            </view>
            <view v-if="isShowChoice" class="store-info_changeBtn" @click="handleOpenSwitchStore">
              <text class="store-info_btnText">切换</text>
              <text class="iconfont iconjiantou1" />
            </view>
          </view>
          <view
            v-if="storeData.OwnerNameShow !== 2"
            class="ellipsis store-info__name"
            :style="{ color: storeData.StoreOwnerNameColor }"
            @click="handleOpenStoreDetail"
          >
            {{ Leader }} · 店主
          </view>
          <view
            v-if="isStoreAddressShow"
            class="store-info__info flex flex-between"
            :style="{ color: storeData.SubtitleColor }"
          >
            <view class="flex flex-middle flex-1" @click="handleOpenMap()">
              <!-- <view class="iconfont icondizhi store-info__icon"></view> -->
              <view class="ellipsis-2">{{ fullAddress }}</view>
            </view>
            <view class="address-nav" @click="handleOpenMap()">
              <view class="iconfont iconjuliicon" />
              <view>导航</view>
            </view>
          </view>
        </view>
      </view>
    </skeleton>
    <confirm ref="confirm" />
  </view>
</template>

<script>
// import { GetStoreInfo,GetGeneralInfo,GetStoreAddressShow } from "@/api/Store";
import skeleton from './store/skeleton.vue'
import confirm from './store/confirm.vue'
/* #ifdef MP */
import { getLocation } from '@/utils/unis'
/* #endif */
export default {
  components: {
    skeleton,
    confirm
  },
  props: {
    storeData: {
      type: Object,
      default() {
        return {}
      }
    },
    storeInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    storeBase: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isShowChoice: false,
      isStoreAddressShow: true,
      loading: false,
      skeleton: {
        avatarSize: '110rpx',
        row: 2
      },
      Name: this.storeInfo.Name,
      Leader: this.storeInfo.Leader,
      Mobile: this.storeInfo.Mobile,
      ProvinceName: this.storeInfo.ProvinceName,
      CityName: this.storeInfo.CityName,
      AreaName: this.storeInfo.AreaName,
      Address: this.storeInfo.Address,
      LanAndLat: {
        lat: '',
        lng: ''
      },
      SwitchType: '',
      Id: this.storeInfo.Id,
      HeadPath: this.storeInfo.HeadPath
    }
  },
  computed: {
    fullAddress() {
      return (
        (this.ProvinceName === this.CityName ? this.CityName : this.ProvinceName + this.CityName) +
        this.AreaName +
        this.Address
      )
    }
  },
  watch: {
    storeInfo: {
      handler(val) {
        /* #ifdef MP */
        let LanAndLat = val.LanAndLat.split(',')
        if (LanAndLat.length > 1) {
          this.LanAndLat.lat = Number(LanAndLat[0])
          this.LanAndLat.lng = Number(LanAndLat[1])
        }
        this.isStoreAddressShow = this.storeBase.StoreAddressShow

        //判断是否有切换店铺按钮
        this.SwitchType = this.storeBase.SwitchType

        if ((getApp().globalData.StoreIdLengths > 1 && this.SwitchType === 1) || this.SwitchType === 2) {
          this.isShowChoice = true
        }
        this.Name = val.Name
        this.Leader = val.Leader
        this.Mobile = val.Mobile
        this.ProvinceName = val.ProvinceName
        this.CityName = val.CityName
        this.AreaName = val.AreaName
        this.Address = val.Address
        this.Id = val.Id
        this.HeadPath = val.HeadPath
        /* #endif */
      },
      immediate: true,
      deep: true
    }
  },
  created() {},
  methods: {
    handleOpenStoreDetail() {
      /* #ifdef MP */
      uni.navigateTo({
        url: '/cloudStore/store/detail'
      })
      /* #endif */
    },
    handleMakePhoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },
    handleOpenMap() {
      /* #ifdef MP */
      uni.openLocation({
        latitude: this.LanAndLat.lat,
        longitude: this.LanAndLat.lng,
        name: this.Name,
        address: `${this.fullAddress}`
      })
      /* #endif */
    },
    async handleOpenSwitchStore() {
      /* #ifdef MP */
      const locRes = await getLocation()
      if (!locRes.latitude && !locRes.longitude) {
        this.$refs.confirm.open('获取定位信息失败,请检查是否有开启定位功能', '', '确认')
        return
      }
      uni.navigateTo({
        url: `/cloudStore/store/switchstore?switchType=${this.SwitchType}&Id=${this.Id}`
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'store-info';
.#{$prefix} {
  // margin-left: 30rpx;
  // margin-right: 30rpx;
  padding-top: 10rpx;
  padding-bottom: 20rpx;
  // border-radius: 20rpx; // 秒杀方案装修去掉
  background-color: #fff;
  background-position: top center;
  background-size: cover;
  .#{$prefix}__header {
    display: inline-block;
    // padding: 10rpx 104rpx 10rpx 20rpx;
    border-radius: 0 30rpx 30rpx 0;
    font-size: 30rpx;
    font-weight: bold;
    color: #000;
  }
  .#{$prefix}__body {
    display: flex;
    align-items: center;
    margin-top: 20rpx;
    padding: 0 20rpx; // 秒杀方案装修添加
  }
  .#{$prefix}__avatar {
    position: relative;
    margin-left: 20rpx;
    margin-right: 30rpx;
    width: 110rpx;
    height: 110rpx;
    background-size: 100% 100%;
    border-radius: 50%;
    overflow: hidden;
    img {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      max-width: 100%;
      max-height: 100%;
      vertical-align: middle;
    }
  }
  .#{$prefix}__name {
    font-size: 28rpx;
    font-weight: bold;
    color: #000;
  }
  .#{$prefix}__info {
    // display: flex;
    // justify-content: space-between;
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: 36rpx;

    // .address {
    //   width: 80%;
    // }

    .address-nav {
      text-align: center;
      width: 20%;
    }
  }
  .#{$prefix}__icon {
    margin-right: 10rpx;
    font-size: 26rpx;
  }
  .store-info__right {
    flex: 1;
  }
}
.store-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20rpx; // 秒杀方案装修添加
  .store-info__header {
    max-width: 400rpx;
  }
  .store-info_changeBtn {
    padding: 10rpx 0;
    font-size: 24rpx;
    color: #000000;
    .iconjiantou1 {
      font-size: 20rpx;
    }
    .store-info_btnText {
      margin-right: 8rpx;
    }
  }
}

.iconjuliicon {
  color: #0866ff;
}
</style>
