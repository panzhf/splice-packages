<template>
  <view>
    <view v-if="dialogVisible" class="yd-confirm">
      <view class="confirm-box fade-in">
        <view class="confirm-tips">
          {{ tips }}
        </view>
        <view v-if="content" class="confirm-tips">
          {{ content }}
        </view>
        <view class="confirm-button-box">
          <view v-if="cancel" class="cancel" @tap.stop="close">{{ cancel }}</view>
          <view v-if="affirmName" :class="cancel ? 'affirm' : 'affirm ml0'" @tap.stop="affirm">{{ affirmName }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      tips: '',
      cancel: '取消',
      affirmName: '确认',
      type: '',
      content: ''
    }
  },
  methods: {
    open(tips, cancel, affirm, type = '', content) {
      this.dialogVisible = true
      this.tips = tips
      this.cancel = cancel
      this.affirmName = affirm
      this.type = type
      this.content = content
    },
    close() {
      this.dialogVisible = false
      this.$emit('close')
    },
    affirm() {
      this.dialogVisible = false
      this.$emit('affirm', this.type)
    }
  }
}
</script>

<style lang="scss" scoped>
.fade-in {
  -webkit-animation: fadeInDown 0.3s;
  animation: fadeInDown 0.3s;
}
// 动画
@keyframes fadeInDown {
  0% {
    -webkit-transform: scale3d(0, 0, 0);
    transform: scale3d(0.5, 0.5, 0.5);
    opacity: 0;
  }
  50% {
    -webkit-animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
    animation-timing-function: cubic-bezier(0.47, 0, 0.745, 0.715);
  }
  100% {
    -webkit-transform: translate3d(-50%, -50%, 0);
    transform: translate3d(-50%, -50%, 0);
    -webkit-animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 1;
  }
}
.yd-confirm {
  z-index: 9999;
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  top: 0;
  left: 0;
  .confirm-box {
    background-color: #fff;
    width: 460rpx;
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 20rpx;
    transform: translate3d(-50%, -50%, 0);
    padding: 30rpx 46rpx;
    padding-top: 68rpx;
    .confirm-tips {
      text-align: center;
      font-size: 30rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #000000;
      line-height: 40rpx;
    }
    .confirm-button-box {
      display: flex;
      margin-top: 50rpx;
      justify-content: center;
      .cancel {
        background: #ffffff;
        border: 1rpx solid #cccccc;
        border-radius: 35rpx;
        width: 170rpx;
        text-align: center;
        height: 70rpx;
        line-height: 70rpx;
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: bold;
        color: #333333;
      }
      .affirm {
        width: 170rpx;
        text-align: center;
        height: 70rpx;
        line-height: 70rpx;
        color: #fff;
        border-radius: 35rpx;
        background: #ff4b40;
        margin-left: 30rpx;
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: bold;
        color: #ffffff;
      }
      .ml0 {
        margin-left: 0;
      }
    }
  }
}
</style>
