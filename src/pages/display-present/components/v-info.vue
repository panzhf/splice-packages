<template>
  <view class="info">
    <view class="row flex">
      <view class="lable">任务名称：</view>
      <view class="content flex-1">
        {{ info.activityinfo.title }}
      </view>
    </view>
    <view class="row flex mt-20">
      <view class="lable">任务时间：</view>
      <view class="content flex-1">{{ info.activityinfo.starttime }}至{{ info.activityinfo.endtime }}</view>
    </view>
    <view class="row flex mt-20">
      <view class="lable">参加频次：</view>
      <view class="content flex-1">
        <template v-if="info.activityinfo.periodtype === 2">每周</template>
        <template v-else-if="info.activityinfo.periodtype === 1">每月</template>
        <template v-else>每{{ info.activityinfo.periodworkingdays }}天</template>
        参与{{ info.activityinfo.scanmaxtimesperperiod }}次，每次获得
        <text v-if="firstPrize.hbid">{{ firstPrize.remark }}元红包</text>
        <text v-if="firstPrize.hbid && firstPrize.shouvouid">，</text>
        <text v-if="firstPrize.shouvouid">{{ firstPrize.shouvouname }}*{{ firstPrize.shouvouamount }}</text>
      </view>
    </view>
    <view class="row flex mt-20">
      <view class="lable">陈列产品：</view>
      <view class="content flex-1">
        <view
          v-for="(item, index) in info.activityinfo.strategyjson.validproducts"
          :key="index"
          class="product flex"
          :class="{ 'mt-20': index !== 0 }"
        >
          <image class="product-img mr-20" :src="item.producturl" mode="aspectFit" />
          <view class="title flex-1">{{ item.productname }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    firstPrize() {
      const prizes = this.info?.activityinfo?.prizes
      return prizes?.[0] || {}
    }
  }
}
</script>

<style lang="scss" scoped>
.info {
  background-color: #fff;
  padding: 36rpx 40rpx;
  .row {
    .lable {
      width: 150rpx;
    }
    .product {
      .product-img {
        width: 120rpx;
        height: 120rpx;
      }
    }
  }
}
</style>
