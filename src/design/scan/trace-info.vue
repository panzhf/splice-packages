<template>
  <!-- 追溯组件 -->
  <view class="retrace-info" :style="bgStyle">
    <image :src="info.bgUrl" mode="widthFix" class="bg" />
    <template v-for="(item, index) in info.list">
      <div v-if="isShowField(item)" :key="index" class="flex item-wrap">
        <view class="title" :style="{ color: item.labelColor, fontWeight: item.labelFontWeight, width: maxLabelwidth }">
          {{ item.label }}：
        </view>
        <view class="content flex-1" :style="{ color: item.valueColor, fontWeight: item.valueFontWeight }">
          {{ traceData[item.value] }}
        </view>
      </div>
    </template>
  </view>
</template>

<script>
export default {
  name: 'TraceInfo',
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
    traceData: {
      type: Object,
      default() {
        return {
          code: '20901672100004920012909834760766',
          productname: '施美蚊不叮驱蚊花露水195ml',
          specsend: '195ml',
          barcode: '1234567890123',
          productionlotnumber: 'DEYCRRZ',
          productiondate: '2024-12-12',
          scancount: 1,
          first: '2024-12-02 16:42:29',
          fwinfo: '您查询的产品是施美蚊不叮驱蚊花露水！',
          expirationtime: '2027-05-24',
          pesticideregistercode: '农药生许（沪）0009',
          checkresult: '合格',
          registerpersonname: '上海嘉亨日用化学品有限公司',
          pesticideregisternum: 'WP20080610',
          pesticidename: '驱蚊花露水',
          productionenterprises: '湖州嘉亨实业有限公司',
          factoryaddress: '浙江省湖州市南浔区练市镇练溪大道988号',
          extendfield1: '农药生许（浙）0089',
          apiproducename: '某生产公司',
          apiregistercode: '农药登证号0089',
        }
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
      let value = this.traceData[key]
      switch (key) {
        case 'expirationtime':
          // 失效日期返回格式不对不显示
          if (value === '0001-01-01 00:00:00') {
            value = ''
          }
          break
      }
      return !!value
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: retrace-info;
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
