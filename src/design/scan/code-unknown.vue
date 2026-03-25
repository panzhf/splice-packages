<template>
  <view class="code-no-activate" :style="bgStyle">
    <image class="code-no-activate__image" mode="widthFix" :src="icon" />
    <div :style="titleStyle" class="code-no-activate__msg mb-30">{{ formatMsg(codeData.msg) }}</div>
    <view :style="infoTextStyle">
      <view v-if="info.showTime">时间：{{ time }}</view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  name: 'CodeNoActivate',
  mixins: [],
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    codeData: {
      type: Object,
      default() {
        return {}
      }
    },
    msg: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      time: '',
      icon: staticURL(true) + 'code-icon.png'
    }
  },
  computed: {
    bgStyle() {
      let s = []
      if (this.info.gap) {
        s.push(`margin: 0 ${this.info.gap * 2}rpx`)
      }
      if (this.info.topGap) {
        s.push(`margin-top:${this.info.topGap * 2}rpx`)
      }
      return s.join(';')
    },
    titleStyle() {
      const s = []
      s.push(`color: ${this.info.textColor}`)
      s.push(`font-size: ${this.info.textFontSize * 2}rpx`)
      s.push(`font-weight: ${this.info.fontWeight}`)
      s.push(`text-align: center`)
      return s.join(';')
    },
    infoTextStyle() {
      const s = []
      s.push(`color: ${this.info.infoColor}`)
      return s.join(';')
    }
  },
  created() {
    this.time = this.getFormatTime(new Date())
  },
  methods: {
    formatMsg(text) {
      if (!text) return '系统维护中，请稍后再试！'
      return decodeURIComponent(text)
    },
    formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    },
    getFormatTime(date) {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minute = date.getMinutes()
      const second = date.getSeconds()
      return (
        [year, month, day].map(this.formatNumber).join('-') +
        ' ' +
        [hour, minute, second].map(this.formatNumber).join(':')
      )
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: code-no-activate;
.#{$prefix} {
  margin: 0 auto;
  margin-top: -0.5px;
  margin-bottom: -0.5px;

  text-align: center;
  &__image {
    display: block;

    width: 580rpx;
    margin: 0 auto 60rpx;
  }
  &__msg {
    padding: 0 20rpx;
    word-break: break-all;
  }
}
</style>
