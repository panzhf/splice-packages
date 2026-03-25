<template>
  <view class="error">
    <image class="error-icon" :src="icon" mode="widthFix" />
    <view class="error-content">{{ msg }}</view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  data() {
    return {
      icon: staticURL(true) + 'lottery/img/wei.png',
      msg: ''
    }
  },
  onLoad(options) {
    this.msg = decodeURIComponent(options.msg || '抱歉，人家找不到活动信息呢~')
  }
}
</script>

<style lang="scss" scoped>
.error {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  text-align: left;
  font-size: 32rpx;
  color: #783618;
  background-color: #ffe34f;
  box-sizing: border-box;
}
.error-content {
  padding-top: 40rpx;
  font-weight: bold;
}
.error-icon {
  width: 240rpx;
}
</style>
