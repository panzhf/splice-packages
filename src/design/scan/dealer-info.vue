<template>
  <!-- 经销商信息组件 -->
  <view class="dealer-info" :style="bgStyle">
    <image :src="info.bgUrl" mode="widthFix" class="bg" />
    <template v-for="(item, index) in info.list">
      <div v-if="isShowField(item)" :key="index" class="flex item-wrap">
        <view class="title" :style="{ color: item.labelColor, fontWeight: item.labelFontWeight, width: maxLabelwidth }">
          {{ item.label }}：
        </view>
        <view class="content flex-1" :style="{ color: item.valueColor, fontWeight: item.valueFontWeight }">
          {{ dealerData[item.value] }}
        </view>
      </div>
    </template>
  </view>
</template>

<script>
export default {
  name: 'DealerInfo',
  mixins: [],
  props: {
    info: {
      type: Object,
      default() {
        return {
          bgUrl: '',
          bgColor: '#fff',
          fontSize: 14,
          list: []
        }
      }
    },
    dealerData: {
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
    maxLabelwidth() {
      let max = this.info.list.reduce((pre, cur) => (cur.label.length > pre ? cur.label.length : pre), 0)
      return `${(max + 1) * 2 * this.info.fontSize}rpx`
    },
    bgStyle() {
      let s = []
      let info = this.info
      if (info.fontSize) {
        s.push(`font-size:${info.fontSize * 2}rpx;`)
      }
      if (info.bgColor) {
        s.push(`background-color:${info.bgColor};`)
      }
      if (info.gap) {
        s.push(`margin: 0 ${info.gap * 2}rpx`)
      }
      return s.join(';')
    }
  },
  created() {},
  methods: {
    isShowField(item) {
      let key = item.value
      let value = this.dealerData[key]
      return !!value
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: dealer-info;
.#{$prefix} {
  border-radius: 8rpx;
  padding: 60rpx 30rpx;
  position: relative;
  overflow: hidden;
  .bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
  }
  .item-wrap {
    position: relative;
    z-index: 1;
    line-height: 1.2;
    .title {
      text-align: right;
    }
    .content {
      text-align: left;
      overflow-wrap: break-word; // 允许单词换行
      word-break: break-all; // 在长单词或URL内部强制换行
    }
    & + .item-wrap {
      margin-top: 36rpx;
    }
  }
}
</style>
