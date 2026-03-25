<template>
  <view v-if="isShow" class="follow-gzh-container">
    <view class="mask" @click="handleClickMask" />
    <view class="content">
      <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog" />
      <view class="top-text">亲，本活动仅限公众号粉丝参与~</view>
      <u-image width="400rpx" height="100%" mode="widthFix" class="qr-code" :src="qrCode" />
      <view class="bottom-text">长按识别二维码关注公众号领奖</view>
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
    // 二维码链接
    qrCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      PopupBg: staticURL(true) + 'follow-workwx__bg.png'
    }
  },
  methods: {
    // 点击遮罩
    handleClickMask() {
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
.follow-gzh-container {
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 20000;

  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 500rpx;
    height: 560rpx;
    // animation: tanchuang 0.4s ease-in-out;
    background-color: #fff;
    border-radius: 20rpx;
    font-size: 24rpx;

    .qr-code {
      width: 400rpx;
      height: 400rpx;
      position: absolute;
      z-index: 30000;
      top: 60rpx;
    }

    .top-text {
      margin-top: 30rpx;
      visibility: hidden;
    }
    .bottom-text {
      margin-bottom: 40rpx;
      font-size: 30rpx;
    }
  }
  .close-btn {
    color: #fff;
    position: absolute;
    top: -80rpx;
    right: -60rpx;
    font-size: 48rpx;
    font-weight: bold;
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
