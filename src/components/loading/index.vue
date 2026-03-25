<template>
  <view class="loading-container flex flex-middle flex-center" :style="{ backgroundColor: backgroundColor }">
    <image v-if="isSet && currentImg" :src="currentImg" class="cover" />
    <!-- <image v-if="!isSet && !currentImg" :src="loadingGif" class="logo" /> -->
    <view v-if="!isSet && !currentImg" class="loading-content flex flex-middle">
      <view v-for="(item, index) in num" :key="index" class="ball" :style="{ backgroundColor: loadingColor }" />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    useDefault: Boolean, // 强制使用默认loading
    backgroundColor: {
      type: String,
      default: '#f4f4f4'
    },
    loadingColor: {
      type: String,
      default: '#ffa200'
    }
  },
  data() {
    return {
      isSet: true, // 是否采用设置
      currentImg: '',
      num: 4
    }
  },
  computed: {
    mpSetting() {
      let setting = {}
      /* #ifdef MP-WEIXIN */
      setting = this.$store.state.mpSetting
      /* #endif */
      return setting
    },
    calcData() {
      const { useDefault, mpSetting } = this
      return { useDefault, mpSetting }
    }
  },
  watch: {
    calcData: {
      immediate: true,
      deep: true,
      handler(v) {
        if (v.useDefault) {
          this.isSet = false
          return
        }
        const height = uni.getSystemInfoSync().windowHeight
        if (v.mpSetting.startupbig && v.mpSetting.startupsmall) {
          // 采用设置图片
          this.currentImg = height <= 667 ? v.mpSetting.startupsmall : v.mpSetting.startupbig
          this.isSet = true
        } else {
          this.isSet = false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
  // background-color: #f4f4f4;
  // .logo {
  //   width: 360rpx;
  //   height: 360rpx;
  // }
  .cover {
    width: 100%;
    height: 100%;
  }
  .ball {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    transform: scale(1);
    animation: ball 0.6s ease-in-out infinite alternate;
    & + .ball {
      margin-left: 20rpx;
    }
    &:nth-child(1) {
      animation-delay: 0;
    }
    &:nth-child(2) {
      animation-delay: -0.9s;
    }
    &:nth-child(3) {
      animation-delay: -1.8s;
    }
    &:nth-child(4) {
      animation-delay: -2.4s;
    }
  }
}
@keyframes ball {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}
</style>
