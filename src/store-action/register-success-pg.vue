
<template>
  <!-- 宝洁定制门店注册成功页 -->
  <view class="home-page">
    <title-bar textcolor="#000" title="扫码有礼" />
    <image :src="bg" mode="widthFix" style="width: 100%" />
    <image :style="top" class="btn" :src="sacnBtn" mode="scaleToFill" @click="handleScan" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import TitleBar from 'packages/components/title-bar/title-home.vue'
export default {
  components: {
    TitleBar
  },
  data() {
    return {
      bg: staticURL(true) + 'pg/success.jpg',
      sacnBtn: staticURL(true) + 'pg/btn.png'
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
.home-page {
  position: relative;
  overflow: hidden;
  height: 100vh;
  .btn {
    position: absolute;
    top: 130rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 750rpx;
    height: 200rpx;
  }
}
</style>

