<template>
  <view>
    <view class="progress">
      <view class="progress-content" :style="{ width: num + '%' }"></view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    showSign: {
      type: Boolean,
      value: true
    },
    num: {
      type: [Number, String],
      default: 80
    }
  }
}
</script>

<style lang="scss" scoped>
.progress {
  background: #eeeeee;
  border-radius: 8px;
  height: 15rpx;
  width: 100%;
  position: relative;
  overflow: hidden;
  .progress-content {
    position: absolute;
    height: 100%;
    left: 0;
    background-color: #ffa401;
    top: 0;
    border-radius: 15rpx;
  }
}
</style>
