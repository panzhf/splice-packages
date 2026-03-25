<template>
  <view class="bgm" :style="{ top: musicTop }">
    <image
      v-show="isPlayBgm"
      class="audio-icon"
      :class="{ 'dzp-audio-on': isAnimate }"
      :src="PACKAGE_STATIC_URL + 'scan/audio-on.png'"
      @click="handleToggleBgm(false)"
    />
    <image
      v-show="!isPlayBgm"
      class="audio-icon dzp-audio-off"
      :src="PACKAGE_STATIC_URL + 'scan/audio-off.png'"
      @click="handleToggleBgm(true)"
    />
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  props: {
    src: {
      type: String,
      default: ''
    },
    isInitPlay: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPlayBgm: false,
      isAnimate: true, // 预览如果没有微信jdk，一开始没有动画效果
      innerAudioContext: null // 音频上下文
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `${44 + this.statusBarHeight}px`
      /* #endif */
      return style
    },
    musicTop() {
      let style = ''
      /* #ifdef H5 */
      style = `30rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 56rpx)`
      /* #endif */
      return style
    }
  },
  watch: {
    src: {
      handler(val) {
        if (val) {
          this.innerAudioContext = uni.createInnerAudioContext()
          this.innerAudioContext.src = this.src
          this.innerAudioContext.loop = true
          this.innerAudioContext.obeyMuteSwitch = false
          /* #ifdef MP-WEIXIN */
          this.handlePlayBgm()
          /* #endif */
          /* #ifdef H5 */
          if (uni.getSystemInfoSync().platform === 'ios') {
            this.handlePlayBgm()
          }
          /* #endif */
        }
      },
      immediate: true
    }
  },
  destroyed() {
    this.closeMusic()
  },
  methods: {
    // 播放音乐
    initPlayMusic() {
      if (uni.getSystemInfoSync().platform === 'ios') {
        this.innerAudioContext.autoplay = true
        // 解决苹果自动播放没声音问题
        this.$wechat.ready(() => {
          this.$wechat.getNetworkType({
            success: () => {
              this.innerAudioContext.play()
            }
          })
        })
      } else {
        this.innerAudioContext.play()
      }
    },
    closeMusic() {
      if (this.innerAudioContext) {
        this.innerAudioContext.stop()
        this.innerAudioContext = null
      }
    },
    // 播放背景音乐
    handlePlayBgm() {
      // if (!this.isShowBgm) return // 未开启背景音乐
      if (this.isPlayBgm) return // 已经在播放

      /* #ifdef MP-WEIXIN */
      this.innerAudioContext.autoplay = true
      uni.setInnerAudioOption({
        obeyMuteSwitch: false
      })
      /* #endif */
      /* #ifdef H5-SCAN */
      this.initPlayMusic()
      /* #endif */
      // #ifdef H5-DECORATE
      // 如果预览中引入微信配置需要进入页面就播放
      if (this.isInitPlay) {
        this.initPlayMusic()
      } else {
        this.isAnimate = false
      }
      // #endif
      this.isPlayBgm = true
    },
    // 背景音乐播放/暂停切换
    handleToggleBgm(state) {
      // #ifndef H5-DECORATE
      state ? this.innerAudioContext.play() : this.innerAudioContext.pause()
      this.isPlayBgm = state
      // #endif

      // #ifdef H5-DECORATE
      if (!this.isAnimate) {
        this.isAnimate = true
        this.isPlayBgm = true
        this.innerAudioContext.play()
      } else {
        this.isAnimate = false
        this.isPlayBgm = false
        this.innerAudioContext.pause()
      }
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.bgm {
  position: fixed;
  z-index: 100;
  left: 20rpx;
  /* #ifdef MP-WEIXIN */
  top: 260rpx;
  /* #endif */
  /* #ifdef H5 */
  top: 140rpx;
  /* #endif */
  width: 60rpx;
  height: 60rpx;

  @keyframes audio-on-rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .dzp-audio-on {
    animation: audio-on-rotate 2s linear infinite;
  }

  .audio-icon {
    width: 60rpx;
    height: 60rpx;
  }
}
</style>
