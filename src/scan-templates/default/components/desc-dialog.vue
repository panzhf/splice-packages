<template>
  <view v-if="isShow" class="desc-dialog-container">
    <view class="mask" @click="handleClickMask"></view>
    <view class="content">
      <view class="box"></view>
      <view class="title" :style="{ backgroundImage: 'url(' + titleBgImg + ')' }">活动说明</view>
      <view class="activity-info">
        <view class="info-item">
          <view class="info-title">活动主题</view>
          <view class="info-detail theme">{{ pageConfig.activetitle }}</view>
        </view>
        <view class="info-item">
          <view class="info-title">活动时间</view>
          <view class="info-detail time">{{ pageConfig.activetime }}</view>
        </view>
      </view>
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
    // 弹窗内容
    pageConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      titleBgImg: staticURL(true) + 'dialog-title.png' // 标题背景图
    }
  },
  methods: {
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
.desc-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

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
    width: 600rpx;
    min-height: 416rpx;
    border-radius: 40rpx;
    background-image: linear-gradient(#ffffff, #fff9e2);
    // animation: tanchuang 0.4s ease-in-out;

    .box {
      position: absolute;
      z-index: 100;
      width: 577rpx;
      height: calc(100% - 20rpx);
      margin: 10rpx 0;
      border: 1rpx solid #fae5ca;
      border-radius: 30rpx;
    }

    .title {
      position: relative;
      z-index: 200;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 459rpx;
      height: 70rpx;
      padding-bottom: 8rpx;
      transform: translateY(-8rpx);
      font-size: 32rpx;
      font-weight: bold;
      color: #c01717;
      background-size: 100%;
      background-repeat: no-repeat;
    }

    .activity-info {
      width: 100%;
      height: 396rpx;
      padding: 0 40rpx;

      .info-item {
        border-bottom: 1rpx solid rgba($color: #e0ccbe, $alpha: 0.5);
        &:last-child {
          border-bottom: none;
        }
      }

      .info-title {
        margin-top: 30rpx;
        margin-bottom: 20rpx;
        font-size: 28rpx;
        color: #2a2a2a;
      }

      .info-detail {
        margin-bottom: 40rpx;
        font-size: 24rpx;
      }

      .theme {
        font-weight: bold;
        color: #000;
      }

      .time {
        color: #777777;
      }
    }
  }

  .close-btn {
    color: #fff;
    position: absolute;
    bottom: -150rpx;
    font-size: 72rpx;
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
