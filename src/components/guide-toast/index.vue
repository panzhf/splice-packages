<template>
  <view v-if="show" class="guide-toast" catchtouchmove="preventMove">
    <view class="mask"></view>
    <view class="content">
      <view v-if="title.length > 0" class="title">{{ title }}</view>
      <view v-if="content.length > 0" class="text">{{ content }}</view>
      <view v-if="contentArray.length > 0">
        <view v-for="(item, index) in contentArray" :key="index">
          <view class="text">{{ item }}</view>
        </view>
      </view>
      <view class="button" @tap="onhandler">{{ buttonText }}</view>
      <view class="close-toast icon iconfont icon-guide-close" @tap="hideToast"></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 是否显示
      show: false,
      // 标题
      title: '',
      // 单个信息内容
      content: '',
      // 多个信息内容
      contentArray: [],
      // 按钮文案
      buttonText: '继续扫码',
      // 按钮的类型(0 知道了 1 继续扫码 2 打开授权设置)
      type: 0
    }
  },
  methods: {
    hideToast() {
      this.show = false
      this.title = ''
      this.content = ''
      this.contentArray = []
      this.$emit('close', false)
    },
    onhandler() {
      this.touchButton(this.type)
      this.type = 0
    },
    setToastInfo({ status = false, title = '', content = '', contentArray = [], buttonText = '知道了', type = 0 }) {
      this.show = status
      this.title = title
      this.content = content
      this.contentArray = contentArray
      this.buttonText = buttonText
      this.type = type
    },
    touchButton(type) {
      if (type === 2) {
        uni.openSetting()
      }
      this.hideToast()
    }
  }
}
</script>

<style lang="scss" scoped>
.guide-toast {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 101;
    background: rgba(0, 0, 0, 0.7);
  }
  .content {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%);
    width: 420rpx;
    padding: 54rpx 52rpx 46rpx;
    background: #fff;
    text-align: center;
    border-radius: 8rpx;
    z-index: 102;
    .title {
      font-size: 28rpx;
      color: #000;
      font-weight: bold;
      padding-bottom: 29rpx;
      word-break: break-all;
    }
    .text {
      font-size: 24rpx;
      color: #666;
      padding: 0 0 6rpx;
      word-break: break-all;
    }
    .button {
      width: 240rpx;
      height: 80rpx;
      background: linear-gradient(-90deg, rgba(255, 170, 49, 1) 0%, rgba(255, 100, 64, 1) 100%);
      border-radius: 40rpx;
      color: #fff;
      line-height: 80rpx;
      margin: 30rpx auto 0;
      font-size: 32rpx;
    }
    .close-toast {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: -140rpx;
      color: #fff;
      font-size: 66rpx;
    }
  }
}
</style>
