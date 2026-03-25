<template>
  <view class="testFlag fs-30">
    <input v-model.trim="name" placeholder="请输入灰度标识" maxlength="20" class="input" />
    <view class="flex flex-middle mt-50 text-center">
      <view class="flag-btn plain flex-1" @tap="cancel">取消灰度</view>
      <view class="flag-btn flex-1 ml-30" @tap="setUp">设置灰度</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      name: 'Fifty_Grey'
    }
  },
  // #ifdef MP-MEMBER
  onLoad() {
    this.name = 'graytest'
  },
  // #endif
  methods: {
    setUp() {
      if (this.name.trim() === '') {
        return this.$msg('灰度标识不能为空')
      }
      uni.setStorageSync('TestFlag', this.name)
      this.$msg('设置成功')
    },
    cancel() {
      uni.setStorageSync('TestFlag', '')
      this.$msg('取消成功')
    }
  }
}
</script>

<style lang="scss">
.testFlag {
  height: 100vh;
  padding: 30rpx 50rpx;
  background-color: #fff;
  .input {
    padding: 20rpx;
    border-bottom: 1rpx solid #aaa;
  }
  .flag-btn {
    height: 80rpx;
    line-height: 80rpx;
    background: #12d269;
    color: #fff;
    border-radius: 10rpx;
    &.plain {
      background: #dd524d;
    }
  }
}
</style>
