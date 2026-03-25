<template>
  <view class="home-page">
    <title-bar textcolor="#000" title="扫码有礼" />
    <image :src="bg" mode="widthFix" />
    <image class="btn" :src="sacnBtn" mode="scaleToFill" @click="handleScan" />
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
      // 在静态资源 URL 后追加时间戳作为版本号，避免缓存问题
      bg: staticURL(true) + 'pg/transfer-bg.jpg' + '?v=' + Date.now(), // 背景图
      sacnBtn: staticURL(true) + 'pg/btn.png' + '?v=' + Date.now() // 按钮图
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
@import 'packages/styles/mixins.scss';
.home-page {
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  image {
    width: 100%;
  }
  .btn {
    position: absolute;
    bottom: 30rpx;
    @include h-cen;
    @include wh(750rpx, 200rpx);
  }
}
</style>
