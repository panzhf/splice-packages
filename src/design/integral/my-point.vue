<template>
  <view
    class="my-point flex flex-center flex-column"
    :style="{ 'background-color': value.bgColor, color: value.color }"
  >
    <view class="fs-24">可用积分</view>
    <view class="flex flex-middle">
      <view class="point">{{ point }}</view>
      <img :src="value.btnUrl" class="btn ml-40" @tap="handleOpenLink(value.linkInfo)" />
    </view>
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import { apiGetMyPoint } from 'packages/api/integral'
/* #endif */
import openLinkMixin from '@/mixins/open-link'
export default {
  name: 'MyPoint',
  mixins: [openLinkMixin],
  props: {
    value: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      point: undefined
    }
  },
  mounted() {
    this.getInfo()
  },
  methods: {
    getInfo() {
      /* #ifdef MP-WEIXIN */
      apiGetMyPoint().then(res => {
        if (res.return_code === 0) {
          /* #ifdef MP-GUIDE */
          this.point = res.return_data.points
          /* #endif */
          /* #ifndef MP-GUIDE */
          this.point = res.return_data
          /* #endif */
        }
      })
      /* #endif */
      /* #ifdef H5-DECORATE */
      this.point = 99
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: my-point;
.#{$prefix} {
  height: 180rpx;
  padding: 0 30rpx;
  .point {
    font-size: 60rpx;
  }
  .btn {
    width: 150rpx;
    height: 50rpx;
  }
}
</style>
