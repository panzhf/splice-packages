<template>
  <!-- 宝洁未注册错误页 -->
  <view class="error-page">
    <title-bar v-if="backHome" textcolor="#000" title="温馨提示" type="custom" :is-back="false" />
    <title-home v-else textcolor="#000" title="温馨提示" />
    <view :style="top">
      <image class="code-image" mode="widthFix" :src="icon" />
      <view class="tips fs-36 fw-bold">
        <view class="mb-10">您不是首次扫码用户,</view>
        <view>暂时无法参与本次活动哦～</view>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import TitleHome from 'packages/components/title-bar/title-home.vue'
export default {
  components: {
    TitleBar,
    TitleHome
  },
  props: {
    backHome: {
      // 点击返回跳回主页
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      icon: staticURL(true) + 'code-error-icon.png'
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      // 顶部适配
      const style = `top:${44 + this.statusBarHeight + 280}px;`
      return style
    }
  },
  methods: {
    handleScan() {
      uni.navigateTo({
        url: '/packages/src/member/scan'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.error-page {
  position: relative;
  overflow: hidden;
  height: 100vh;
  background: #fff;
  text-align: center;
  .code-image {
    display: block;
    width: 480rpx;
    margin: 400rpx auto 60rpx;
  }
  .tips {
    color: #333;
    line-height: 40rpx;
  }
}
/* #ifdef MP-RETAIL */
::v-deep .back-custom-box {
  background: none !important;
}
/* #endif */
</style>
