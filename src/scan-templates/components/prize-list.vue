<template>
  <view class="prize-list-container" :style="{ color: fontColor }">
    <image class="prize-title-img" mode="widthFix" :src="prizeTitleImg" />
    <view v-for="(item, index) in currentPrizeList" :key="index" class="prize-item">
      <image
        class="prize-icon"
        mode="aspectFit"
        :src="item.imgpath || PACKAGE_STATIC_URL + `scan/prizeIcon${index + 1}.png`"
      />
      <view class="prize-text">
        <!-- #ifdef H5 -->
        <view class="prize-name ellipsis">{{ item.prizeName }}</view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="prize-name ellipsis">{{ item.prizename }}</view>
        <!-- #endif -->
        <view class="prize-desc ellipsis">
          <view v-for="(remark, index) in item.remark" :key="index">{{ remark }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  props: {
    // 奖项内容标题图片
    prizeTitleImg: {
      type: String,
      default: ''
    },
    // 奖项内容文字颜色
    fontColor: {
      type: String,
      default: '#fff'
    },
    // 奖项列表
    prizeList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    currentPrizeList() {
      return this.prizeList.filter(prize => {
        return prize.type === 0
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.prize-list-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;

  .prize-title-img {
    width: 100%;
    margin-bottom: 30rpx;
    max-width: 600rpx;
  }

  .prize-item {
    display: flex;
    width: 600rpx;
    height: 100%;
    padding: 10rpx 16rpx;
    border: 2rpx dotted #fff;
    border-radius: 10rpx;

    &.prize-item {
      margin-top: 20rpx;
    }

    .prize-icon {
      display: block;
      width: 90rpx;
      height: 90rpx;
      border-radius: 5rpx;
    }

    .prize-text {
      margin-left: 20rpx;
      width: 450rpx;
    }

    .prize-name {
      width: 500rpx;
      font-size: 30rpx;
      font-weight: bold;
    }

    .prize-desc {
      width: 500rpx;
      font-size: 24rpx;
    }
  }
}
</style>
