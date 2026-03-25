<template>
  <view :style="themeVars">
    <view :style="{ height: isBtn ? '140rpx' : '50rpx' }" />
    <view class="coupon-bottom" :style="{ bottom: bottom + 'rpx', background: bgColor }">
      <view :class="isBtn ? 'bottom-btn-wrap' : 'list-wrap'" class="flex flex-middle">
        <view v-for="(item, index) in btnArr" :key="index" class="flex-1" @tap="dropDetail(item)">
          <view v-if="isBtn" class="item" :style="{ borderColor }">
            <view class="fs-36 mt-10 fw-bold" :style="{ color: numberColor }">{{ info[item.key] || 0 }}张</view>
            <view class="fs-22" :style="{ color: descColor }">{{ item.desc }}</view>
          </view>
          <view v-else class="item">
            <text class="c-6 fs-24" :style="{ color: descColor }">{{ item.desc }}：</text>
            <text :style="{ color: numberColor }">
              {{ info[item.key] || 0 }}张
              <text class="iconfont ml-10" :class="arrowIcon" />
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { arrowIcon } from 'packages/utils/default-picture'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  name: 'ReturnCouponBottom',
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    info: {
      type: Object,
      default: () => ({})
    },
    isBtn: {
      type: Boolean,
      default: false
    },
    // 位置
    bottom: {
      type: Number,
      default: 0
    },
    numberColor: {
      type: String,
      default: ''
    },
    descColor: {
      type: String,
      default: ''
    },
    borderColor: {
      type: String,
      default: ''
    },
    bgColor: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      arrowIcon,
      btnArr: [
        { desc: '有效期不足30天', key: 'validcount', validDay: 30 },
        { desc: '有效期不足7天', key: 'validlessthensevendaycount', validDay: 7 }
      ]
    }
  },
  methods: {
    dropDetail(item) {
      this.$emit('drop', { validDay: item.validDay })
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon-bottom {
  position: fixed;
  z-index: 3;
  width: 100%;
  .bottom-btn-wrap {
    padding: 30rpx 0;
    margin-left: 30rpx;
    .item {
      border: 2rpx solid var(--theme-color, $uni-color-primary);
      width: 330rpx;
      height: 90rpx;
      color: var(--theme-color, $uni-color-primary);
      text-align: center;
      border-radius: 45rpx;
      line-height: 1.2;
      background: white;
    }
  }
  .list-wrap {
    height: 50rpx;
    padding: 10rpx 30rpx 0;
    .item {
      font-size: 28rpx;
      color: var(--theme-color, $uni-color-primary);
      text-align: center;
      line-height: 40rpx;
      .iconfont {
        vertical-align: top;
        font-size: 18rpx;
      }
    }
  }
}
</style>
