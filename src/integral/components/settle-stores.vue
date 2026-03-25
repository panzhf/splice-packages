<template>
  <view class="settle-content">
    <!-- 门店兑奖 -->
    <view class="settle-stores">
      <view class="settle-inside settle-sty">
        <view>请向门店出示二维码进行兑奖！</view>
        <view class="stores-already"> 
          <!-- #ifdef MP-MEMBER -->
          <span class="mdfont" :class="{ 'icon-yihexiao': list.status === '已兑换' }" />
          <!-- #endif -->
          <span class="iconfont" :class="{ iconyiduihuan: list.status == '已领取' }" />
          <!-- #ifdef MP-MEMBER -->
          <image class="stores-logo" :style="{ opacity: list.status == '已领取' || list.status === '已兑换' ? '0.3' : '' }" :src="imgSrc" />
          <!-- #endif -->
          <!-- #ifndef MP-MEMBER -->
          <image class="stores-logo" :style="{ opacity: list.status == '已领取' ? '0.3' : '' }" :src="imgSrc" />
          <!-- #endif -->
        </view>
        <view class="stores-exchange">
          兑换码：
          <span class="stores-sp">{{ list.code }}</span>
        </view>
        <!-- #ifdef MP-MEMBER -->
        <view v-if="list.isshowstore == 1 && list.status != '已领取' && list.status !== '已兑换'" class="stores-toview" @click="handleCheckStore">
          查看附近适用门店
        </view>
        <!-- #endif -->
        <!-- #ifndef MP-MEMBER -->
        <view v-if="list.isshowstore == 1 && list.status != '已领取'" class="stores-toview" @click="handleCheckStore">
          查看附近适用门店
        </view>
        <!-- #endif -->
        <view v-if="list.status == '已领取'" class="stores-already">
          <view style="margin-bottom: 15rpx">兑奖门店：{{ list.storename }}</view>
          <view>兑奖时间：{{ list.awardtime }}</view>
        </view>
        <!-- #ifdef MP-MEMBER -->
        <view v-if="list.status == '已兑换'" class="stores-already">
          <view v-if="list.writeoffstore" style="margin-bottom: 15rpx">核销门店：{{ list.writeoffstore }}</view>
          <view v-if="list.writeoffdate">核销时间：{{ list.writeoffdate }}</view>
        </view>
        <!-- #endif -->
      </view>
    </view>
    <!-- 礼品信息 -->
    <view class="settle-info settle-sty">
      <view class="info-top">礼品信息</view>
      <view class="info-content">
        <view class="info-img">
          <v-img :src="list.prizeimg" />
        </view>
        <view class="info-shop">
          <view class="info-shop-top">{{ list.prizename }}</view>
          <view class="info-shop-size" />
          <view class="info-shop-price">
            <view class="shop-price-le">
              <!-- <view v-if="price1">{{ price1 }}积分</view>
              <view v-if="price1 && list.price" style="margin: 0 5rpx">+</view> -->
              <price v-if="list.price" mode="cash" :price="list.price" double show-sign />
            </view>
            <view class="shop-price-ri">x{{ list.quantity }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 门店兑奖 信息 -->
    <view class="integral-exchange settle-sty">
      <view class="exchange-box">
        <view class="exchange-left">中奖时间</view>
        <view>{{ list.winningtime }}</view>
      </view>
      <view class="exchange-box">
        <view class="exchange-left">兑奖有效时间</view>
        <view>{{ list.overtime }}</view>
      </view>
      <view class="exchange-box">
        <view class="exchange-left">来源</view>
        <view>{{ list.rewardsource }}</view>
      </view>
      <view class="exchange-box">
        <view class="exchange-left">状态</view>
        <view>{{ list.status }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    listStore: {
      type: Object,
      default: () => {}
    },
    img: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      list: {},
      imgSrc: ''
    }
  },
  watch: {
    listStore: {
      handler(val) {
        this.list = val
      },
      immediate: true,
      deep: true
    },
    img: {
      handler(val) {
        this.imgSrc = val
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleCheckStore() {
      this.$emit('near')
    }
  }
}
</script>


<style lang="scss" scoped>
// @import '../../styles/icon.css';

.settle-content {
  .settle-sty {
    background: #ffffff;
    padding: 30rpx 20rpx;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
  }

  .settle-info {
    .info-top {
      font-size: 28rpx;
      font-weight: 700;
      margin-bottom: 20rpx;
    }
    .info-content {
      display: flex;
      align-items: center;
      .info-img {
        width: 160rpx;
        height: 160rpx;
        position: relative;
      }
      .info-shop {
        margin-left: 20rpx;
        width: 72%;
        .info-shop-top {
          font-size: 28rpx;
          font-weight: 700;
          text-align: left;
          color: #000000;
          line-height: 36rpx;
          margin-bottom: 20rpx;
        }
        .info-shop-size {
          font-size: 24rpx;
          font-weight: 500;
          text-align: left;
          color: #999999;
          line-height: 30rpx;
          margin-bottom: 20rpx;
        }
        .info-shop-price {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 24rpx;
          .shop-price-le {
            display: flex;
            font-weight: 700;
          }
          .shop-price-ri {
            color: #666666;
          }
        }
      }
    }
  }

  .integral-exchange {
    .exchange-box {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #000;
      font-weight: 500;
      border-bottom: 2rpx solid #eeeeee;
      padding-bottom: 25rpx;
      margin-top: 30rpx;
      .exchange-left {
        color: #666666;
        width: 170rpx;
        text-align: left;
        margin-right: 30rpx;
      }
      &:nth-child(1) {
        margin-top: 0;
      }
      &:nth-last-child(1) {
        border-bottom: 2rpx solid transparent;
        padding-bottom: 0;
      }
    }
  }

  .settle-stores {
    text-align: center;
    &::after {
      content: '';
      width: 100%;
      height: 140rpx;
      background: $bg-color;
      position: absolute;
      left: 0;
      top: -48rpx;
      z-index: 10;
    }
    .settle-inside {
      position: relative;
      z-index: 99;
      font-weight: bolder;
      padding-bottom: 60rpx;
      .stores-already {
        position: relative;
        .mdfont, .iconfont {
          position: absolute;
          top: 25%;
          left: 37%;
          font-size: 145rpx;
          color: #000;
          z-index: 50;
          font-weight: 300;
        }
        .stores-logo {
          width: 240rpx;
          height: 240rpx;
          vertical-align: top;
          padding: 30rpx 0;
          margin: 0 auto;
        }
      }

      .stores-exchange {
        font-size: 24rpx;
        margin-bottom: 35rpx;
        .stores-sp {
          font-size: 36rpx;
          // letter-spacing: 2rpx;
        }
      }
      .stores-toview {
        color: #000000;
        font-size: 32rpx;
        background: $bg-color;
        border-radius: 50rpx;
        padding: 25rpx 0;
        font-weight: 500;
        width: 460rpx;
        margin: 0 auto;
      }
      .stores-already {
        font-size: 24rpx;
        color: #999999;
      }
    }
  }
}
</style>
