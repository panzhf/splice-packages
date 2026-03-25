<template>
  <view v-if="show" class="popop-container" @touchmove.stop="() => {}">
    <view class="container br-10">
      <view class="title">- {{ info.title }} -</view>
      <scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" :show-scrollbar="false">
        <rich-text :nodes="info.explain" />
      </scroll-view>
      <view class="iconfont icon-close2" @tap="show = false" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      info: {},
      show: false
    }
  },
  methods: {
    showToast(info) {
      // 优先替换\r\n，再替换单独的\r或\n，避免多余的<br>
      info['explain'] = info['explain'].replace(/\r\n/g, '<br>').replace(/[\r\n]/g, '<br>')
      this.info = info
      this.show = true
    }
  }
}
</script>

<style lang="scss" scoped>
.popop-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  .container {
    position: absolute;
    width: 600rpx;
    height: 680rpx;
    background-color: #fff;
    padding: 0 30rpx;
    box-sizing: border-box;
    animation: tanchuang 0.4s ease-in-out;
    .title {
      font-size: 30rpx;
      font-weight: 700;
      text-align: center;
      margin-top: 40rpx;
    }
    .icon-close2 {
      position: absolute;
      bottom: -150rpx;
      left: 260rpx;
      color: #fff;
      font-size: 70rpx;
    }
    .scroll-Y {
      height: 510rpx;
      margin-top: 40rpx;

      ::-webkit-scrollbar {
        width: 0;
        height: 0;
        color: transparent;
      }
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
</style>
