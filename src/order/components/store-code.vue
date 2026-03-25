<template>
  <div>
    <view class="settle-stores">
      <view class="settle-inside settle-sty">
        <view>请向门店出示二维码进行核销！</view>
        <view class="stores-already">
          <span class="mdfont" :class="{ 'icon-yihexiao': list.orderstatus !== 3 }" />
          <image class="stores-logo" :style="{ opacity: list.orderstatus !== 3 ? 0.3 : '' }" :src="imgSrc" />
        </view>
        <view class="stores-exchange">
          兑换码：
          <span class="stores-sp">{{ list.checkcode }}</span>
        </view>
        <view v-if="list.orderstatus === 3" class="stores-toview" @click="handleCheckStore">查看附近适用门店</view>
        <view v-if="list.orderstatus === 4" class="stores-already">
          <view style="margin-bottom: 15rpx">核销门店：{{ list.checkorderusername }}</view>
          <view>核销时间：{{ list.checktime }}</view>
        </view>
      </view>
    </view>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Object,
      default: () => {}
    },
    imgSrc: {
      type: String,
      default: ''
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
    padding: 30rpx 0;
    background: #fff;
    border-radius: 10rpx;
    .stores-already {
      position: relative;
      .mdfont {
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
        font-size: 26rpx;
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
      /* #ifdef MP-RETAIL */
      color: #fff;
      /* #endif */
    }
    .stores-already {
      font-size: 24rpx;
      color: #999999;
    }
  }
}
</style>
