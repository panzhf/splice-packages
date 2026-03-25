<template>
  <view v-if="isShow" class="follow-workwx-container">
    <view class="mask" @click="handleCloseDialog" />
    <view class="content">
      <view class="tips">长按识别下方二维码添加好友领奖</view>
      <view class="qr-code-wrap">
        <u-image width="400rpx" mode="widthFix" class="qr-code" :src="activityQrCode" alt="" />
      </view>
      <view class="finger" :style="{ backgroundImage: 'url(' + fingerImg + ')' }" />
      <u-image width="750rpx" mode="widthFix" style="opacity: 0" :src="activityQrCode" alt="" />
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
    activityQrCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      PopupBg: staticURL(true) + 'follow-workwx__bg.png',
      fingerImg: staticURL(true) + 'finger.jpg'
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
.follow-workwx-container {
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 100;

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
    width: 660rpx;
    height: 910rpx;
    // animation: tanchuang 0.4s ease-in-out;
    background-color: #fff;
    border-radius: 20rpx;

    .tips {
      font-size: 32rpx;
      color: #222;
      font-weight: bold;
      margin-top: 76rpx;
      user-select: none;
    }

    .qr-code-wrap {
      position: absolute;
      top: 164rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 480rpx;
      height: 480rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
      box-shadow: 0 0 15rpx 0 rgba(255, 198, 178, 0.35);
      border-radius: 20rpx;

      .qr-code {
        width: 400rpx;
        height: 400rpx;
      }
    }

    .finger {
      position: absolute;
      bottom: 30rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 150rpx;
      height: 180rpx;
      margin: 0 auto;
      background-size: 100%;
      background-repeat: no-repeat;
      user-select: none;
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
