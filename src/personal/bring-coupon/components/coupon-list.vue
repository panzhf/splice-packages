<template>
  <view class="coupon-item">
    <view class="alpha">
      <view :class="['line', listItem.status === 2 ? 'line-extract-dated' : '']" />
      <view v-if="listItem.status === 2" class="icon iconfont iconguo-qi c-9" />
      <view v-if="listItem.status === 1" class="icon iconfont iconshi-yong" style="color: #ffd386" />
      <view class="alpha-box">
        <view class="circle top-left-circle" />
        <view class="circle top-right-circle" />
        <view class="left-box">
          <image :src="listItem.voucherimg" class="coupon-poster" />
          <view class="left">
            <view class="title c-3 fs-28 ellipsis fw-bold">{{ listItem.vouchername }}</view>
            <view class="remask">
              <view class="tag c-9" :style="{ backgroundImage: `url(${coupon_bg})` }">提领券</view>
            </view>
          </view>
        </view>
        <view v-if="listItem.status === 0" class="right base-btn">去使用</view>
      </view>
    </view>
    <view class="beta">
      <view class="circle left-circle" />
      <view class="circle right-circle" />
      <view class="first" :style="{ fontSize: isBatch ? '22rpx' : '24rpx' }">
        <view class="left">
          <view v-if="listItem.expiredtype === 1" class="c-9">{{ listItem.endtime }} 前有效</view>
          <view v-if="listItem.expiredtype === 2" class="c-9">
            有效期：{{ listItem.starttime }} 至 {{ listItem.endtime }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    listItem: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isBatch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      coupon_bg: staticURL(true) + 'coupon/circle-bg.png'
    }
  },
  onload() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
// @import '../../styles/icon.css';
.coupon-item {
  // display: flex;
  // flex-direction: column;
  // color: #f4f4f4;
  // margin: 30rpx 0 0;
  // background: #fff;
  .alpha {
    position: relative;
    overflow: hidden;
    .icon {
      position: absolute;
      top: -8rpx;
      right: 30rpx;
      font-size: 112rpx;
      z-index: 3;
    }
    .line {
      position: absolute;
      top: 1rpx;
      left: 1rpx;
      width: calc(100% - 2rpx);
      height: 5rpx;
      border-radius: 5rpx;
      background: #ffd386;
    }
    // 提领券颜色(待使用 和已使用)
    .line-extract {
      background: #ffd386;
    }
    // 已过期颜色
    .line-extract-dated {
      background: #f2f2f2;
    }
    // .line-extract-used {
    //   background: #FFD386;
    // }
    .alpha-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 0 20rpx 30rpx;
      border: 1rpx solid #e7e7e7;
      border-bottom: none;
      border-top-left-radius: 5rpx;
      border-top-right-radius: 5rpx;
      .left-box {
        display: flex;
        .coupon-poster {
          width: 100rpx;
          height: 100rpx;
          border-radius: 5rpx;
          margin-right: 20rpx;
        }
        .left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-size: 24rpx;
          line-height: 1;
          .title {
            width: 350rpx;
            color: #000;
          }
          .remask {
            display: flex;
            align-items: center;
            padding: 14rpx 0 0;
            color: #01c500;
            .tag {
              background-size: 100% 100%;
              background-repeat: no-repeat;
              padding: 6rpx 12rpx;
            }
          }
        }
      }
    }
    .right {
      width: 120rpx;
      height: 50rpx;
      line-height: 50rpx;
      text-align: center;
      border-radius: 25rpx;
      margin: 0 30rpx 0 0;
      font-size: 24rpx;
    }
    .coupon-used-text {
      color: #fff;
      background: #dadada;
    }
  }
  .coupon-used-bg {
    background-color: #9a9a9a;
  }
  .beta {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .first {
      display: flex;
      justify-content: space-between;
      font-size: 24rpx;
      padding: 20rpx 30rpx 25rpx;
      border-top: 1rpx dashed #e7e7e7;
      border-left: 1rpx solid #e7e7e7;
      border-right: 1rpx solid #e7e7e7;
      border-bottom: 1rpx solid #e7e7e7;
      border-bottom-left-radius: 5rpx;
      border-bottom-right-radius: 5rpx;
      .left {
        color: #999;
      }
      .right {
        display: flex;
        color: #666;
        height: 32rpx;
        .detail {
        }
        .icon {
          display: block;
          padding-left: 13rpx;
          transform: rotate(90deg);
          font-size: 22rpx;
          margin: 0 0 6rpx;
        }
        .icon-rotate {
          transform: rotate(-90deg);
          margin: 10rpx 0 0;
        }
      }
      .check-active {
        color: rgba(102, 102, 102, 0.5);
      }
    }
    .second {
      font-size: 26rpx;
      color: #333;
      padding: 0 0 20rpx;
    }
  }
  .circle {
    position: absolute;
    width: 26rpx;
    height: 26rpx;
    border-radius: 50%;
    border: 1rpx solid #e7e7e7;
    background: #f4f4f4;
    z-index: 2;
  }
  .left-circle {
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
  }
  .right-circle {
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
  }
  .top-left-circle {
    bottom: 0;
    left: 0;
    transform: translate(-50%, 50%);
  }
  .top-right-circle {
    bottom: 0;
    right: 0;
    transform: translate(50%, 50%);
  }
}
.base-btn {
  background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
  box-shadow: 0px 0px 8rpx #ffa200;
  color: #ffffff;
}
</style>
