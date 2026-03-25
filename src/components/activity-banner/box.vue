<template>
  <view class="banner-box mt-20 bg-white">
    <view class="header flex flex-middle flex-between pl-30 pr-30">
      <view class="title fw-bold">最新活动</view>
      <view class="link fs-24" @tap="handleNav">
        全部活动
        <!-- #ifdef MP-RETAIL -->
        <text class="iconfont iconjiantou1 ml-10 c-3" />
        <!-- #endif -->
      </view>
    </view>
    <view v-if="showNoneData" class="empty text-center c-9">暂无活动</view>
    <banner-item v-for="(item, index) in list" :key="index" :info="item" />
  </view>
</template>

<script>
import BannerItem from './index.vue'
export default {
  name: 'BannerBox',
  components: {
    BannerItem
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    showNoneData() {
      return this.list.length === 0
    }
  },
  methods: {
    handleNav() {
      let url = ''
      // #ifdef MP-RETAIL
      url = '/activity-tab/index'
      // #endif
      // #ifdef MP-DISTRIBUTION
      url = '/pages/activity/index'
      // #endif
      uni.reLaunch({ url })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: banner-box;
.#{$prefix} {
  /* #ifdef MP-RETAIL */
  margin-left: 20rpx;
  margin-right: 20rpx;
  border-radius: 10rpx;
  /* #endif */
  /* #ifdef MP-DISTRIBUTION */
  border-radius: 15rpx;
  /* #endif */
  padding-bottom: 6rpx;
  .header {
    /* #ifdef MP-RETAIL */
    padding-top: 28rpx;
    /* #endif */
    /* #ifdef MP-DISTRIBUTION */
    padding-top: 24rpx;
    /* #endif */
  }
  .title {
    /* #ifdef MP-RETAIL */
    font-size: 28rpx;
    /* #endif */
    /* #ifdef MP-DISTRIBUTION */
    font-size: 32rpx;
    /* #endif */
  }
  .link {
    /* #ifdef MP-RETAIL */
    color: #666;
    /* #endif */
    /* #ifdef MP-DISTRIBUTION */
    color: $uni-color-primary;
    /* #endif */
  }
  /* #ifdef MP-RETAIL */
  .iconfont {
    font-size: 20rpx;
  }
  /* #endif */
  .empty {
    padding: 140rpx 0;
  }
}
</style>
