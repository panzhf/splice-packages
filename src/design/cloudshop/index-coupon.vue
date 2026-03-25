
<template>
  <view v-if="list.length > 0" class="coupon-list" :class="couponData.Layout">
    <view
      v-for="(item, index) in list"
      :key="index"
      class="coupon-item"
      :style="{
        color:
          item.UserLimitState === 1 || item.Invalid === 1 ? hex2rgb(couponData.TextColor, 0.5) : couponData.TextColor,
        background: couponData.BgColor
      }"
      @tap="receiveCouponcode(item.Id, false)"
    >
      <view class="info">
        <view class="money">
          <span class="text">￥</span>
          <span class="num" :style="{ fontSize: calcFont(item.ShoppingVouchersDenominations, couponData.Layout) }">
            {{ item.ShoppingVouchersDenominations }}
          </span>
        </view>
        <view class="discount">
          <template v-if="couponData.Layout === 'large'">
            {{
              item.ShoppingVouchersUsingCondition
                ? `满${item.ShoppingVouchersUsingCondition}减${item.ShoppingVouchersDenominations}`
                : item.DescVouchersType
            }}，
          </template>
          {{ item.DescProduct }}可用
        </view>
        <view v-if="['large', 'medium'].includes(couponData.Layout)" class="time">
          <template v-if="couponData.Layout === 'large'">有效期：</template>
          {{ item.DescValidity | formatTime }}
        </view>
      </view>
      <view v-if="['large', 'medium'].includes(couponData.Layout)" class="button" @tap.stop="receiveCouponcode(item.Id, true)">
        <view class="receive-btn">立即领取</view>
      </view>
      <view class="circle" :class="['large', 'medium'].includes(couponData.Layout) ? 'top' : 'left'"></view>
      <view class="circle" :class="['large', 'medium'].includes(couponData.Layout) ? 'bottom' : 'right'"></view>

      <view
        v-if="item.Invalid === 1"
        class="status-icon iconfont iconyishixiao1"
        :style="{ color: couponData.TextColor }"
      ></view>
      <view
        v-if="item.UserLimitState === 1 && item.Invalid !== 1"
        class="status-icon iconfont iconyilingwan1"
        :style="{ color: couponData.TextColor }"
      ></view>
    </view>
  </view>
</template>

<script>
// #ifdef MP
import { SendCoupon } from '@/api/CollectCouponsAct'
// #endif
export default {
  filters: {
    formatTime(v) {
      // iOS不支持
      // return v.replace(/(?<=\d+)-/g, '.')
      return v.replace(/\b-\b/g, '.')
    }
  },
  props: {
    couponData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    list() {
      if (!this.couponData.ShowInvalid) {
        // 隐藏已领完、已失效券
        return this.couponData.Coupon.filter(item => !(item.UserLimitState === 1 || item.Invalid === 1))
      }
      return this.couponData.Coupon
    }
  },
  methods: {
    calcFont(num, mode) {
      // 对金额字体大小动态调整，一般情况下不会出现这么大的金额
      let s = String(num)
      let r = 70
      if (mode === 'medium' && s.length > 5) r = 48
      if (mode === 'small' && s.length > 4) r = 40
      if (mode === 'mini' && s.length > 5) r = 52
      return `${r}rpx`
    },
    hex2rgb(color, opacity = 1) {
      // rgb => rgba
      let c = color.toLowerCase().replace(/^rgb\(([^a]+)\)/i, `rgba($1, ${opacity})`)

      if (!/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(c)) return c
      c = c.slice(1)
      let newColor = ''
      if (c.length === 3) {
        for (let i = 0; i < c.length; i++) {
          // 转为6位的颜色
          newColor += `${c[i]}${c[i]}`
        }
      } else {
        newColor = c
      }
      return `rgba(${parseInt('0x' + newColor.slice(0, 2))}, ${parseInt('0x' + newColor.slice(2, 4))}, ${parseInt(
        '0x' + newColor.slice(4, 6)
      )}, ${opacity})`
    },
    // 购物卷领取
    receiveCouponcode(id, flag) {
      /* #ifdef MP */ 
      if (['large', 'medium'].includes(this.couponData.Layout) && !flag) {
        uni.navigateTo({
          url: `/pointsMall/mall/personal/couponDetail?couponid=${id}&type=1`,
        });
        return
      }
      uni.showLoading({
        title: '正在领取中'
      })
      SendCoupon({ Id: id }).then(res => {
        uni.hideLoading()
        if (res.Return_code === 0) {
          uni.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 2000
          })
          this.$emit('getHome')
        } else if (res.Return_code === 37017) {
          uni.navigateTo({
            url: '/pages/index/login'
          })
        } else {
          uni.showToast({
            title: res.Return_msg,
            icon: 'none',
            duration: 2000
          })
        }
      })
      /* #endif */
    }
  }
}
</script>
<style scoped lang="scss">
$prefix: coupon;
.#{$prefix}-list {
  padding: 0 15px;
  box-sizing: border-box;
  background-color: #fff;
  line-height: 1;
  .#{$prefix}-item {
    position: relative;
    display: flex;
    height: 180rpx;
    border-radius: 14rpx;
    font-size: 24rpx;
    overflow: hidden;
    .info {
      flex: 1;
    }
    .money {
      display: flex;
      align-items: center;
    }
    .text {
      font-size: 30rpx;
    }
    .num {
      margin-left: 8rpx;
      font-weight: bold;
    }
    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 100%;
    }
    .circle {
      position: absolute;
      content: '';
      width: 24rpx;
      height: 24rpx;
      z-index: 1;
      background-color: #fff;
      border-radius: 50%;
      &.top {
        top: -12rpx;
      }
      &.right {
        right: -12rpx;
      }
      &.bottom {
        bottom: -12rpx;
      }
      &.left {
        left: -12rpx;
      }
    }
    .status-icon {
      position: absolute;
      top: -20rpx;
      right: -10rpx;
      font-size: 118rpx;
    }
  }
  &.large,
  &.medium {
    .num {
      font-size: 70rpx;
    }
    .discount {
      margin-top: 16rpx;
    }
    .time {
      margin-top: 12rpx;
    }
    .button {
      border-left: 1px dashed currentColor;
      font-size: 26rpx;
    }
  }
  &.medium,
  &.small {
    display: flex;
    flex-wrap: wrap;
  }
  &.large {
    .#{$prefix}-item {
      align-items: center;
      padding-left: 30rpx;
      & + .#{$prefix}-item {
        margin-top: 20rpx;
      }
    }
    .info {
      padding-right: 20rpx;
    }
    .button {
      width: 192rpx;
      .receive-btn {
        width: 140rpx;
        height: 60rpx;
        line-height: 60rpx;
        box-sizing: border-box;
        text-align: center;
        border-radius: 30rpx;
        border: 1px solid currentColor;
      }
    }
    .circle {
      right: 180rpx;
    }
  }
  &.medium {
    .#{$prefix}-item {
      width: calc((100% - 10rpx) / 2);
      margin-right: 10rpx;
      &:nth-of-type(even) {
        margin-right: 0;
      }
      &:nth-of-type(n + 3) {
        margin-top: 20rpx;
      }
    }
    .info {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    .time {
      font-size: 22rpx;
    }
    .button {
      width: 72rpx;
      letter-spacing: 4rpx;
      writing-mode: vertical-lr;
    }
    .circle {
      right: 60rpx;
    }
  }
  &.small {
    .#{$prefix}-item {
      width: calc((100% - 28rpx) / 3);
      margin-right: 14rpx;
      &:nth-of-type(3n) {
        margin-right: 0;
      }
      &:nth-of-type(n + 4) {
        margin-top: 20rpx;
      }
    }
  }
  &.mini {
    overflow-x: auto;
    display: flex;
    flex-wrap: nowrap;
    .#{$prefix}-item {
      flex-shrink: 0;
      width: calc((100% - 100rpx) / 2);
      margin-right: 20rpx;
    }
  }
  &.small,
  &.mini {
    .info {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .money {
      flex: 1;
    }
    .discount {
      width: 100%;
      height: 64rpx;
      line-height: 64rpx;
      text-align: center;
      border-top: 1px dashed currentColor;
    }
    .circle {
      bottom: 52rpx;
    }
  }
}
</style>
