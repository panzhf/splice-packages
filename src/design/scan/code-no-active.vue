<template>
  <view class="code-no-activate" :style="bgStyle">
    <image v-if="info.icon" class="code-no-activate__image" mode="widthFix" :src="info.icon" />
    <div :style="titleStyle" class="mb-30">该二维码未激活！</div>
    <view :style="infoTextStyle">
      <view class="mb-10">（{{ msg || '请待消费者扫描对应的防伪营销码之后再扫' }}）</view>
      <view>时间：{{ time }}</view>
    </view>
  </view>
</template>

<script>
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
      time: ''
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
      s.push(`font-size: ${this.info.tipsTextFontSize * 2}rpx`)
      s.push(`font-weight: ${this.info.fontWeight}`)
      return s.join(';')
    },
    infoTextStyle() {
      const s = []
      s.push(`color: ${this.info.infoColor}`)
      s.push(`font-size: ${this.info.textFontSize * 2}rpx`)
      return s.join(';')
    }
  },
  created() {
    this.time = this.getFormatTime(new Date())
  },
  mounted() {},
  methods: {
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
@import '~@/styles/mixins.scss';
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
}
</style>
