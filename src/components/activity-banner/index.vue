<template>
  <view class="banner-item" @tap.stop="handleNav">
    <image :src="info.bannerpath" mode="widthFix" class="cover" />
    <view class="title fs-28 fw-bold">{{ info.title }}</view>
    <view v-if="showDesc && info.desc" class="desc c-6 fs-26">{{ info.desc }}</view>
    <view class="time c-9 fs-24" :class="{ 'flex flex-middle flex-between': showLink }">
      <text>活动时间：{{ info.timerange }}</text>
      <text v-if="showLink">
        详情
        <text class="iconfont iconjiantou1 link-icon" />
      </text>
    </view>
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import overdueMixin from 'packages/mixins/overdue'
export default {
  name: 'BannerItem',
  mixins: [overdueMixin],
  props: {
    info: {
      type: Object,
      default: () => ({})
    },
    showLink: Boolean,
    showDesc: Boolean // 描述 [暂无使用]
  },
  methods: {
    handleNav() {
      if (!this.overdueChecked()) return
      const { acttype, id, outactivityid } = this.info
      // acttype 18.门店邀请有礼 24.渠道返利 25.N元换购 26.陈列有礼 29.导购集盖任务 30.红包券 31.宴席有礼 32.开箱有礼 37.
      // 38.团购有礼
      const m = {
        // #ifdef MP-RETAIL
        ...{
          18: '/activity-tab/invite/index',
          24: `/activity-tab/channel-activity/index?id=${outactivityid}&actid=${id}`,
          25: `/activity-tab/convert/index?id=${id}`,
          26: `/packages/src/pages/display-present/index?id=${outactivityid}`,
          30: '/activity-tab/redsecurities-activity/index?activeIndex=1',
          31: `/packages/src/pages/banquet/index?scene=${encodeURIComponent(`id=${outactivityid}`)}`,
          32: `/scans/record/index?activityid=${outactivityid}`,
          37: `/packages/src/pages/order-sale/index?id=${id}`,
          38: `/packages/src/pages/group-buy/index?id=${id}`,
          39: `/packages/src/pages/promotion-gift/index?id=${id}`
        },
        // #endif
        // #ifdef MP-DISTRIBUTION
        ...{
          24: `/activity/rebate-detail?id=${outactivityid}&actid=${id}`,
          25: `/activity/convert-detail?id=${id}`,
          37: `/packages/src/pages/order-sale/index?id=${id}`
        },
        // #endif
        // #ifdef MP-SALE
        ...{
          24: `/activity/channel-activity/index?id=${outactivityid}&actid=${id}`
        }
        // #endif
      }
      if (acttype === 24) {
        uni.setStorageSync('channelActivityDetail', JSON.stringify(this.info))
      }
      uni.navigateTo({
        url: m[acttype]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: banner-item;
.#{$prefix} {
  padding: 30rpx;

  border-radius: 15rpx;
  background: #fff;
  .cover {
    display: block;

    width: 100%;
  }
  .title {
    margin: 12rpx 0;
  }
  .desc {
    margin-bottom: 22rpx;

    line-height: 40rpx;
  }
  .link-icon {
    margin-left: 8rpx;

    font-size: 20rpx;
  }
}
</style>
