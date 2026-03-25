<template>
  <view v-if="isShow" class="container">
    <view class="mask"></view>
    <view class="content">
      <view class="title">恭喜你获得以下奖品</view>
      <view v-for="(item, index) in getrewards" :key="index" class="reward-item" :style="[setStyle(index)]">
        <image class="img" :src="setImgSrc(item)" />
        <view class="text">
          {{ item.rewardcontent }}
          <text v-if="[3, 10].includes(item.rewardtype)">元</text>
          {{ item.name }}
        </view>
      </view>
      <image class="reward-img" :src="rewardImg" />
      <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog"></view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    getrewards: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      rewardImg: staticURL() + 'popup/prize-box.png',
      hbImg: staticURL() + 'popup/hb.png',
      huoImg: staticURL() + 'popup/huo.png',
      jpImg: staticURL() + 'popup/jp.png',
      bgImg: staticURL() + 'popup/text-bg.png',
      arr: [1, 2, 3, 4]
    }
  },
  methods: {
    setImgSrc(item) {
      if (item.rewardtype === 3) {
        return this.hbImg
      }
      if (item.rewardtype === 2) {
        return this.jpImg
      }
      if (item.rewardtype === 1) {
        return this.huoImg
      }
      // if(item.rewardtype===1){
      //   return this.jpImg
      // }
    },
    setStyle(index) {
      let left = 0
      let top = 0
      if (index === 0) {
        left = 90
        top = 130
      }
      if (index === 1) {
        left = 420
        top = 170
      }
      if (index === 2) {
        left = 90
        top = 440
      }
      if (index === 3) {
        left = 500
        top = 500
      }
      return { left: left + 'rpx', top: top + 'rpx' }
    },
    // 点击遮罩
    handleClickMask() {
      this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 999;
  .state-img {
    width: 319rpx;
    height: 223rpx;
    position: absolute;
    bottom: 30rpx;
  }
  .name {
    font-size: 32rpx;
    font-family: PingFang SC Bold, PingFang SC Bold-Bold;
    font-weight: 700;
    text-align: center;
    color: #ffffff;
    line-height: 48rpx;
    position: absolute;
    top: 80rpx;
  }
  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.9);
  }

  .content {
    z-index: 2;
    position: relative;
    width: 100%;
    height: 100%;
    top: 140rpx;
    top: calc(140rpx + constant(safe-area-inset-bottom));
    top: calc(140rpx + env(safe-area-inset-bottom));
    .title {
      font-size: 30rpx;
      color: #ffffff;
      font-size: 45rpx;
      text-align: center;
    }
    .reward-item {
      position: absolute;
      // width: 144rpx;
      animation: arrow1 2s infinite;
      -webkit-animation: arrow1 2s infinite;
      animation-timing-function: ease-in-out;
      -webkit-animation-timing-function: ease-in-out;

      -webkit-animation-direction: alternate;
      animation-direction: alternate;
      .img {
        width: 144rpx;
        height: 144rpx;
        margin: 0 auto;
      }
      .text {
        margin-top: -10rpx;
        text-align: center;
        // background-repeat: no-repeat;
        // background-size: 100%;
        color: #994412;
        height: 40rpx;
        padding: 0 10rpx;
        background: #efd37e;
        border-radius: 20rpx;
      }
    }
    .reward-img {
      width: 568rpx;
      height: 485rpx;
      position: absolute;
      top: 650rpx;
      left: 90rpx;
    }
    .close-btn {
      color: #fff;
      position: absolute;
      top: 56rpx;
      right: 30rpx;
      font-size: 72rpx;
    }
  }
}

@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
/*nimation-delay:1s*/
@keyframes arrow1 {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(10px);
  }
}

@-webkit-keyframes arrow1 {
  0% {
    -webkit-transform: translateY(0);
  }
  100% {
    -webkit-transform: translateY(10px);
  }
}
</style>
