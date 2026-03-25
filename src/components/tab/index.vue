<template>
  <view>
    <view class="tab-box" :style="{ background: tabBg }">
      <view
        class="active-bar"
        :style="{
          transform: `translateX(${translateX}px)`,
          width: `${width}px`,
          height: `${drawHeight}px`,
          backgroundColor: `${activeBagColor}`
        }"
      ></view>
      <view
        v-for="(item, index) in tab"
        :key="index"
        :class="['tab-item', activeIndex === index ? 'active' : '', hasBorderLine ? '' : 'no-border']"
        :style="{ color: activeIndex === index ? activeColor : inactiveColor }"
        @tap="handleChange(item, index)"
      >
        {{ item.name || item }}
      </view>
    </view>
  </view>
</template>

<script>
/**
 * activeIndex 选中索引
 * tab tab 数据 字符串数组/对象数组
 * drawWidth 底部滑条宽度
 * drawHeight 底部滑条高度
 * activeColor 选中颜色
 * inactiveColor 未选中颜色
 * activeBagColor 选中条颜色
 */
export default {
  props: {
    tabBg: {
      type: String,
      default: '#ffff'
    },
    hasBorderLine: {
      type: Boolean,
      default: true
    },
    activeIndex: {
      type: Number,
      default: -1
    },
    tab: {
      type: Array,
      default: () => {
        return []
      }
    },
    drawWidth: {
      type: String,
      default: ''
    },
    drawHeight: {
      type: String,
      default: '1'
    },
    activeColor: {
      type: String,
      default: '#000'
    },
    inactiveColor: {
      type: String,
      default: '#000'
    },
    activeBagColor: {
      type: String,
      default: '#ff4b40'
    },
    isLoading: {
      type: Boolean,
      default: false // 用于判断tab是否正在加载数据，防止tab切换数据错乱
    }
  },
  data() {
    return {
      translateX: 0,
      active: this.activeIndex,
      //tab的宽度
      tabWidth: 0
    }
  },
  computed: {
    //滑动条的宽度
    width() {
      if (this.drawWidth) {
        return this.drawWidth
      } else {
        return this.tabWidth / this.tab.length
      }
    }
  },
  watch: {
    activeIndex(v) {
      this.$nextTick(async () => {
        if (this.drawWidth) {
          const w = await this.getWidth()
          let width = (w / this.tab.length - Number(this.width)) / 2
          this.translateX = width + (w / this.tab.length) * v
        }
      })
    }
  },
  async mounted() {
    this.tabWidth = await this.getWidth()
    if (this.drawWidth) {
      this.translateX = (this.tabWidth / this.tab.length - Number(this.width)) / 2
    }
  },
  methods: {
    async handleChange(item, index) {
      if (this.isLoading) return
      if (this.activeIndex === index) return
      if (this.drawWidth) {
        const w = await this.getWidth()
        let width = (w / this.tab.length - Number(this.width)) / 2
        this.translateX = width + (w / this.tab.length) * index
      } else {
        this.translateX = index * this.width
      }
      this.$emit('update:activeIndex', index)
      this.$emit('change', item)
    },
    getWidth() {
      return new Promise(resolve => {
        let query = uni.createSelectorQuery().in(this)
        //选择id
        query
          .select('.tab-box')
          .boundingClientRect(function (rect) {
            resolve(rect.width)
          })
          .exec()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-box {
  display: flex;
  box-sizing: border-box;
  height: 86rpx;
  position: relative;
  background-color: #fff;
  .active-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3rpx;
    background-color: #ff4b40;
    transition: all 0.3s;
  }
  .tab-item {
    font-size: 30rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #000000;
    line-height: 86rpx;
    flex: 1;
    text-align: center;
    border-bottom: 1rpx solid #eeeeee;
  }
  .no-border {
    border: none;
  }
}
</style>
