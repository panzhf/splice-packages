<template>
  <view class="anti-fake" :style="bgStyle">
    <image v-if="antiFakeInfo.scanTextIcon" class="anti-fake__icon" :src="antiFakeInfo.scanTextIcon" />
    <view :style="titleStyle" class="mb-10 fw-bold">
      <text :style="{ color: antiFakeInfo.scanTextColor }">
        {{ msg }}
      </text>
    </view>
    <view v-if="antiFakeInfo.showAntiFake" :style="infoTextStyle">防伪码：{{ codeData.code }}</view>
  </view>
</template>

<script>
export default {
  name: 'AntiFakeInfo',
  mixins: [],
  props: {
    isFirst: {
      type: Boolean,
      default: false
    },
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
    fwTip: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {
    antiFakeInfo() {
      const {
        //防伪信息
        firstScanTextColor, //首次文案颜色
        firstScanTextIcon, //首次图标
        firstScanTextBg, //首次背景图
        firstScanFontSize, //首次扫码文字大小
        firstBgColor, // 首次背景颜色
        scanTextColor, //文案颜色
        scanTextIcon, //图标
        scanTextBg, //背景图
        scanFontSize, //扫码文字大小
        gap, //左右间距
        topGap, //上间距
        bgColor, //背景颜色
        showAntiFake, //显示防伪码
        antiFakeTextColor, //访问文案颜色
        antiFakeTextFontSize //防伪文字大小
      } = this.info
      return this.isFirst
        ? {
            scanTextColor: firstScanTextColor,
            scanTextIcon: firstScanTextIcon,
            scanTextBg: firstScanTextBg,
            scanFontSize: firstScanFontSize,
            gap,
            topGap,
            bgColor: firstBgColor,
            showAntiFake,
            antiFakeTextColor,
            antiFakeTextFontSize
          }
        : {
            scanTextColor,
            scanTextIcon,
            scanTextBg,
            scanFontSize,
            gap,
            topGap,
            bgColor,
            showAntiFake,
            antiFakeTextColor,
            antiFakeTextFontSize
          }
    },
    bgStyle() {
      let s = []
      if (this.antiFakeInfo.bgColor) {
        s.push(`background-color: ${this.antiFakeInfo.bgColor}`)
      }
      if (this.antiFakeInfo.scanTextBg) {
        s.push(`background-image:url(${this.antiFakeInfo.scanTextBg});`)
      }
      s.push(`margin: ${this.antiFakeInfo.topGap * 2}rpx ${this.antiFakeInfo.gap * 2}rpx 0`)
      return s.join(';')
    },
    titleStyle() {
      const s = []
      this.antiFakeInfo.scanFontSize && s.push(`font-size: ${this.antiFakeInfo.scanFontSize * 2}rpx`)
      return s.join(';')
    },
    infoTextStyle() {
      const s = []
      this.antiFakeInfo.antiFakeTextColor && s.push(`color: ${this.antiFakeInfo.antiFakeTextColor}`)
      this.antiFakeInfo.antiFakeTextFontSize && s.push(`font-size: ${this.antiFakeInfo.antiFakeTextFontSize * 2}rpx`)
      return s.join(';')
    },
    msg() {
      return this.fwTip || (!this.isFirst ? '恭喜你，扫码成功!' : '恭喜你，首次扫码!')
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: anti-fake;
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
