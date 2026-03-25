<template>
  <view
    v-if="showBrandChange || isexpires"
    class="brand-name logout flex flex-middle ub-pj mt-10 bg-f br-10"
    @tap="handleChangeStore"
  >
    <view class="fs-30 c-0 flex-1 flex flex-middle">
      <view class="brandImg shrink-0 mr-20">
        <image
          :src="storeSettingInfo.memberLoginHeadPath ? storeSettingInfo.memberLoginHeadPath : brandImg"
          class="br-round"
        />
      </view>
      <view class="ellipsis-1">
        {{ memberLoginName }}
      </view>
    </view>
    <view v-if="isexpires" class="overdue">
      <u-icon name="warning-fill" color="#ff4b40" size="22" style="margin-right: 6rpx" />
      {{ isexpires ? '该品牌商订购的服务已到期' : '' }}
    </view>
    <view class="iconfont icon-arrow-right c-6 fs-14" />
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { staticURL } from '@/config'

export default {
  name: 'RetailBrandName',
  data() {
    return {
      brandImg: staticURL() + 'shop/shopPictureDefault.png',
      memberLoginName: '',
      storeSettingInfo: {}
    }
  },
  computed: {
    ...mapState(['storeInfo']),
    isexpires() {
      return this.storeInfo.isexpires
    },
    showBrandChange() {
      const stores = uni.getStorageSync('storeNumber')
      return stores > 1
    }
  },
  created() {
    const storeSettingInfo = uni.getStorageSync('storeSettingInfo')
    if (storeSettingInfo) {
      const storeInfo = JSON.parse(storeSettingInfo)
      this.memberLoginName = storeInfo.memberLoginName || ''
      this.storeSettingInfo = JSON.parse(storeSettingInfo)
    }
  },
  methods: {
    handleChangeStore() {
      uni.navigateTo({
        url: '/shop/change'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.brand-name.logout {
  height: 100rpx;
  padding: 0 30rpx;
}
.brandImg {
  width: 60rpx;
  height: 60rpx;
  text-align: center;
  background: #fff2f2;
  image {
    width: 60rpx;
    height: 60rpx;
  }
}
.overdue {
  color: #ff4b40;
  font-size: 22rpx;
  margin-right: 16rpx;
}
</style>
