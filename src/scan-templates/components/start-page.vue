<template>
  <view v-if="isShow" class="start-page">
    <view :style="{ top: top }" class="start-page__countdown flex flex-middle flex-center" @click="end">
      跳过 {{ times }}
    </view>
    <view class="start-page__bg" :style="{ 'background-image': 'url(' + bgImg + ')' }" />
  </view>
</template>

<script>
import { setTitleMixin } from 'packages/mixins/navigation'
export default {
  mixins: [setTitleMixin],
  props: {
    // 是否显示启动页
    isShow: {
      type: Boolean,
      default: false
    },
    // 倒计时
    time: {
      type: Number,
      default: 3
    },
    // 背景图片
    bgImg: {
      type: String,
      default: ''
    },
    // 启动页标题
    title: {
      type: String,
      default: ''
    },
    // 原先页面标题
    oldTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      times: this.time,
      timer: null // 定时器
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
      style = `${44 + this.statusBarHeight + 20}px`
      /* #endif */
      /* #ifdef H5 */
      style = `40rpx`
      /* #endif */
      return style
    }
  },
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.setTitle(this.title)
          this.countdown()
        }
      },
      immediate: true
    }
  },
  methods: {
    countdown() {
      this.timer = setTimeout(() => {
        this.times -= 1
        if (this.times >= 1) {
          this.countdown()
        } else {
          this.end()
        }
      }, 1000)
    },
    end() {
      this.$emit('update:isShow', false)
      this.$emit('end')
      this.setTitle(this.oldTitle)
      clearTimeout(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
.start-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 20000000;
}
.start-page__bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: 100%;
  // background-position: center;
  z-index: 1;
}
.start-page__countdown {
  position: absolute;
  top: 40rpx;
  right: 28rpx;
  width: 150rpx;
  height: 50rpx;
  line-height: 50rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 24rpx;
  color: #fff;
  text-align: center;
  font-size: 28rpx;
  z-index: 2;
}
</style>
