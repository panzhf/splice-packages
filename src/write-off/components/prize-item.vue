<template>
  <view class="prize-item" :class="{ 'is-last': isLast, point: item.type === 'jf' }">
    <!-- 积分类型 -->
    <view
      v-if="item.type === 'jf'"
      :style="{ backgroundImage: `url(${awardPic.jf})` }"
      class="prize-item__card prize-item__card--point tx-c"
    >
      <view class="prize-item__content">
        <text class="prize-item__amount-large fw-bold">{{ item.amount }}</text>
        <text class="prize-item__unit">（积分）</text>
      </view>
      <view class="prize-item__desc">{{ item.amount }}积分已到账</view>
    </view>

    <!-- 红包类型 -->
    <view
      v-else-if="item.type === 'hb'"
      :style="{ backgroundImage: `url(${awardPic.hb})` }"
      class="prize-item__card prize-item__card--redpacket tx-c"
    >
      <view class="prize-item__content">
        <text class="prize-item__symbol">￥</text>
        <text class="prize-item__amount-large fw-bold">{{ item.amount }}</text>
        <text class="prize-item__unit">（{{ item.prizetype | rewardTypesFilter }}）</text>
      </view>
    </view>

    <!-- 实物类型 -->
    <view
      v-else-if="item.type === 'gw'"
      :style="{ backgroundImage: `url(${awardPic.gw})` }"
      class="prize-item__card prize-item__card--goods"
    >
      <image :src="item.prizeimage" mode="aspectFill" class="prize-item__image" />
      <view class="prize-item__info">
        <view class="prize-item__name">{{ item.prizename }}</view>
        <view class="prize-item__count">x{{ item.amount }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { rewardTypesFilter } from 'packages/filters'

export default {
  name: 'PrizeItem',
  filters: {
    rewardTypesFilter
  },
  props: {
    // 奖品数据
    item: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // 是否是最后一个
    isLast: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      awardPic: {
        hb: staticURL(true) + 'write-off/hb.png',
        jf: staticURL(true) + 'write-off/jf.png',
        gw: staticURL(true) + 'write-off/gw.png'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.prize-item {
  margin: 0 auto 20rpx;
  width: 610rpx;
  height: 140rpx;
  box-sizing: border-box;

  &.is-last {
    margin-bottom: 0;
  }

  &.point {
    padding-top: 10rpx;
  }

  &__card {
    width: 100%;
    height: 100%;
    // padding-top: 30rpx;
    background-size: 610rpx 140rpx;
    background-repeat: no-repeat;
    background-position: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &--point {
      // padding-top: 10rpx;
      color: #ff5e33;
    }

    &--redpacket {
      color: #fff;
    }

    &--goods {
      flex-direction: row;
      padding: 25rpx 30rpx;
      // align-items: center;
    }
  }

  &__content {
    display: flex;
    align-items: baseline;
    justify-content: center;
  }

  &__symbol {
    font-size: 36rpx;
  }

  &__amount-large {
    font-size: 56rpx;
    line-height: 1;
  }

  &__unit {
    font-size: 26rpx;
    // margin-left: 8rpx;
  }

  &__desc {
    font-size: 24rpx;
    margin-top: 10rpx;
  }

  &__image {
    width: 90rpx;
    height: 90rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    margin-left: 18rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__name {
    font-size: 28rpx;
    font-weight: 700;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 425rpx;
  }

  &__count {
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }
}
</style>
