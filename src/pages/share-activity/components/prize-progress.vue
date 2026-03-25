<template>
  <view class="prize-progress bg-white br-10">
    <CustomHeader title="获取奖励进度" />
    <!-- <view class="progress-box">
      <progress
        :percent="percent"
        stroke-width="24rpx"
        border-radius="12rpx"
        activeColor="#FEA021"
        backgroundColor="#eee"
      />
    </view> -->
    <view class="prize-info flex">
      <view class="item">
        <view class="row">已邀请好友</view>
        <view class="num">{{ info.totalCount }}</view>
      </view>
      <view class="item">
        <view class="row">累计获得{{ info.customchancetext }}</view>
        <view class="num">{{ count.totalwinnum }}</view>
      </view>
    </view>
    <view class="flex flex-middle flex-center text-box">
      <view class="count-box fs-26">
        每分享
        <text class="count">{{ info.awardperiodnum }}</text>
        个好友获
        <text class="count">{{ info.winnumperperiod }}</text>
        {{ info.customchancetext }}
        ，最多可获得
        <text class="count">{{ count.themaxaawrdnum }}</text>
        {{ info.customchancetext }}
      </view>
    </view>
    <view v-if="count.isreachdatelimit" class="text-center fs-22 fw-bold tip">今日分享好友已达上限~</view>
  </view>
</template>

<script>
import CustomHeader from './custom-header'
export default {
  name: 'PrizeProgress',
  components: { CustomHeader },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    count: {
      type: Object,
      default: () => {}
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: prize-progress;
$color: #fea021;
.#{$prefix} {
  position: relative;
  min-height: 270rpx;
  margin: 0 30rpx 20rpx;
  padding: 30rpx;
  .progress-box {
    position: relative;
    margin-top: 44rpx;
    margin-bottom: 28rpx;
  }
  .prize-info {
    justify-content: space-between;
    padding: 0 10rpx;
    margin-top: 30rpx;

    .item {
      background-color: #f2f2f2;
      width: 261rpx;
      .row {
        color: #000000;
        font-size: 32rpx;
        text-align: center;
        margin-top: 10rpx;
      }
      .num {
        margin: 10rpx 0;
        font-size: 48rpx;
        color: #f64d47;
        text-align: center;
      }
    }
  }
  .text-box {
    margin: 20rpx 0;
    margin-bottom: 30rpx;
  }
  .count-box {
    .count {
      margin: 0 4rpx;
      color: $color;
    }
  }
  .tip {
    position: absolute;
    left: 0;
    bottom: 0;
    @include whl(100%, 50rpx);
    @include round(0 0 10rpx 10rpx);
    color: #f64d47;
    background-color: #fff2ee;
  }
}
</style>
