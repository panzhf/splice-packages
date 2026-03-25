<template>
  <view class="phone-verify flex flex-column flex-middle fs-28">
    <view class="fw-bold fs-32">手机号快速验证组件模拟</view>
    <view class="flex flex-middle flex-between mt-10">
      <view class="fw-bold" :class="{ 'danger-tip': mock }">当前次数{{ mock ? '不足' : '充足' }}</view>
      <view class="change-btn ml-20 text-center" @tap="handleChange">切换</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VerifyMock',
  data() {
    return {
      mock: false
    }
  },
  mounted() {
    const m = uni.getStorageSync('mockVerify')
    if (typeof m === 'boolean') {
      this.mock = m
      return
    }
    uni.setStorageSync('mockVerify', this.mock)
  },
  methods: {
    handleChange() {
      this.mock = !this.mock
      uni.setStorageSync('mockVerify', this.mock)
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: phone-verify;
.#{$prefix} {
  position: relative;
  background: linear-gradient(to right, #d3959b, #bfe6ba);
  padding: 10rpx;
  .change-btn {
    width: 120rpx;
    height: 56rpx;
    line-height: 56rpx;
    background-color: #4cd964;
    color: #fff;
    border-radius: 28rpx;
  }
  .danger-tip {
    color: #dd2726;
  }
}
</style>
