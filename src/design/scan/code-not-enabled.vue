<template>
  <view class="tip-info flex flex-between" :style="bgStyle">
    <image size="1000" class="tip-info__image" mode="widthFix" :src="icon" />
    <div :style="titleStyle">该码未启用！</div>
    <view class="flex-1 flex mt-20 msg-c" :style="infoTextStyle">
      <view v-if="info.showAntiFake" class="text-tips">品牌商：{{ codeData.companyname }}</view>
      <view v-if="info.showBatch" class="text-tips">批次属性：{{ codeData.batchattr || '-' }}</view>
      <view v-if="info.showNumber" class="text-tips">流水号：{{ codeData.serialnumber }}</view>
      <view v-if="info.showConfig" class="text-tips">参数：{{ codeData.code }}</view>
      <view v-if="info.showTime" class="text-tips">时间：{{ time }}</view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  name: 'TipInfo',
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
$prefix: tip-info;
.#{$prefix} {
  padding: 0 48rpx;
  flex-direction: column;
  &__image {
    display: block;
    width: 580rpx;
    margin: 0 auto 60rpx;
  }
  .msg-c {
    flex-wrap: wrap;
  }
  .text-tips {
    text-align: center;
    width: 100%;
    margin-top: 10rpx;
    font-size: 26rpx;
  }
}
</style>
