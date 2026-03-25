<template>
  <view class="coupon-item" :class="isLarge ? 'coupon-item-large' : 'coupon-item-small'" :style="themeVars">
    <view class="flex flex-middle">
      <view v-if="tag" class="tag flex flex-middle flex-center" :style="tagBg">
        {{ tag }}
      </view>
      <v-img :src="item.voucherimg || prodErrImg" class="pic" />
      <view class="info flex flex-middle">
        <view class="title ellipsis-2">
          {{ item.vouchername }}
        </view>
      </view>
      <view class="item-right-num mr-10">{{ item.vouchercount }}张</view>
      <view class="item-right-arrow iconfont c-6" :class="arrowIcon" />
    </view>
  </view>
</template>
<script>
import { prodDefault } from '@/utils/default-picture'
import { arrowIcon } from 'packages/utils/default-picture'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
// #ifdef MP-RETAIL
import { hex2rgb } from 'packages/utils'
// #endif
export default {
  name: 'ReturnCouponItem',
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    isLarge: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      arrowIcon,
      prodErrImg: prodDefault
    }
  },
  computed: {
    tagBg() {
      let style = ''
      // #ifdef MP-RETAIL
      style = `background: ${hex2rgb(this.themeInfo.color, 0.1)};`
      // #endif
      return style
    }
  }
}
</script>
<style lang="scss" scoped>
.item-right-num {
  font-weight: bold;
}
.coupon-item-small {
  position: relative;
  padding: 30rpx 0;
  .pic {
    width: 80rpx;
    height: 80rpx;
    flex-shrink: 0;
  }
  .info {
    flex: 1;
    margin-left: 20rpx;
    margin-right: 20rpx;
    .title {
      color: #3d3d3d;
      font-size: 24rpx;
    }
  }

  .item-right-num {
    font-size: 24rpx;
    color: #222222;
  }
  .item-right-arrow {
    /* #ifdef MP-DISTRIBUTION */
    font-size: 24rpx;
    /* #endif */
    /* #ifdef MP-SALE || MP-RETAIL  */
    font-size: 18rpx;
    /* #endif */
  }
}
.coupon-item-large {
  position: relative;
  padding: 30rpx;
  .pic {
    width: 120rpx;
    height: 120rpx;
    flex-shrink: 0;
  }
  .info {
    flex: 1;
    margin-left: 20rpx;
    margin-right: 20rpx;
    .title {
      color: #333333;
      font-size: 28rpx;
    }
  }

  .item-right-num {
    font-size: 32rpx;
    color: var(--theme-color, $uni-color-primary);
    line-height: 40rpx;
  }
  .item-right-arrow {
    /* #ifdef MP-DISTRIBUTION */
    font-size: 26rpx;
    /* #endif */
    /* #ifdef MP-SALE || MP-RETAIL  */
    font-size: 20rpx;
    /* #endif */
  }
  .tag {
    position: absolute;
    right: 0;
    top: 0;
    width: 100rpx;
    height: 40rpx;
    font-size: 22rpx;
    border-radius: 0rpx 10rpx 0rpx 20rpx;
    color: var(--theme-color, $uni-color-primary);
    /* #ifdef MP-SALE || MP-DISTRIBUTION */
    background: rgba($color: $uni-color-primary, $alpha: 0.1);
    /* #endif */
  }
}
</style>
