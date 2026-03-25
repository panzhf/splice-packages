<template>
  <view class="confirm bg-f">
    <view v-if="resultData.return_code === 0" class="confirm-header">
      <view class="icon iconfont icon-success" />
      <view class="text">您的帐号注销已完成!</view>
      <view class="tip">相逢一场，终有一别！十分感谢您一直以来对系统的使用和支持，期待您再次归来</view>
    </view>
    <view v-else class="confirm-header">
      <view class="icon iconfont icon-duihuan-fail" />
      <view class="text">您的帐号注销失败!</view>
      <view class="tip">{{ resultData.return_msg || '服务器异常，未完成全部注销业务，注销失败，请重新发起注销' }}</view>
    </view>
    <view class="safe-btn continue-btn" @tap="handleExit">确认</view>
    <view class="blank-height" />
  </view>
</template>

<script>
export default {
  name: 'LogoffResult',
  props: {
    resultData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  methods: {
    handleExit() {
      if (this.resultData.return_code !== 0) {
        const pages = getCurrentPages()
        let targetPageIndex = -1
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].route === 'packages/src/personal/safe/index') {
            targetPageIndex = i
            break
          }
        }
        uni.navigateBack({ delta: pages.length - targetPageIndex - 1 })
        return
      }

      //  #ifdef MP-MEMBER
      uni.reLaunch({
        url: `/pages/index/index`
      })
      // #endif

      // #ifdef  MP-GUIDE
      uni.reLaunch({
        url: `/pages/login/index`
      })
      // #endif
    }
  }
}
</script>
<style lang="scss" scoped>
.confirm {
  .confirm-header {
    text-align: center;
    padding: 150rpx 0;
    .iconfont {
      font-size: 80rpx;
      margin-bottom: 30rpx;
    }
    .text {
      line-height: 48rpx;
      font-weight: 700;
      font-size: 40rpx;
    }
    .tip {
      margin: 20rpx 70rpx;
      color: #666;
      font-size: 26rpx;
      line-height: 36rpx;
    }
  }
  .safe-btn {
    margin: 0 70rpx;
  }
}
</style>
