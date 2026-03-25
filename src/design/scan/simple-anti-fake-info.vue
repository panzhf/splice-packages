<template>
  <view class="simple-anti-fake" :style="bgStyle">
    <image v-if="info.scanTextIcon" class="simple-anti-fake__icon" :src="info.scanTextIcon" />
    <view :style="titleStyle" class="mb-10 fw-bold">
      <text :style="{ color: info.scanTextColor }">
        {{ msg }}
      </text>
    </view>
    <view v-if="info.showAntiFake" :style="infoTextStyle">防伪码：{{ codeData.code }}</view>
  </view>
</template>

<script>
export default {
  name: 'SimpleAntiFakeInfo',
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
    return {}
  },
  computed: {
    bgStyle() {
      let s = []
      if (this.info.bgColor) {
        s.push(`background-color: ${this.info.bgColor}`)
      }
      if (this.info.scanTextBg) {
        s.push(`background-image:url(${this.info.scanTextBg});`)
      }
      s.push(`margin: ${(this.info.topGap || 0) * 2}rpx ${(this.info.gap || 15) * 2}rpx 0`)
      return s.join(';')
    },
    titleStyle() {
      const s = []
      this.info.scanFontSize && s.push(`font-size: ${this.info.scanFontSize * 2}rpx`)
      return s.join(';')
    },
    infoTextStyle() {
      const s = []
      this.info.antiFakeTextColor && s.push(`color: ${this.info.antiFakeTextColor}`)
      this.info.antiFakeTextFontSize && s.push(`font-size: ${this.info.antiFakeTextFontSize * 2}rpx`)
      return s.join(';')
    },
    msg() {
      return this.info.scanText || '您好，您所查询的是正牌产品，请放心使用！'
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: simple-anti-fake;
.#{$prefix} {
  min-height: 349rpx;
  padding: 40rpx 10rpx;

  text-align: center;

  background-size: 100% 100%;
  &__bg {
    display: block;

    width: 100%;
    margin: 0 auto;
  }
  &__icon {
    width: 222rpx;
    height: 157rpx;
    margin: 0 auto 35rpx;
  }
}
</style>

