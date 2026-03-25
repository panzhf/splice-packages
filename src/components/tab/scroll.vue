<template>
  <scroll-view
    class="tab-box"
    :show-scrollbar="false"
    :scroll-left="scrollLeft"
    scroll-x
    :style="{
      backgroundColor: `${bgColor}`
    }"
  >
    <view
      class="active-bar"
      :style="{
        transform: `translateX(${translateX}px)`,
        width: `${drawWidth}px`,
        height: `3px`,
        backgroundColor: `${activeBagColor}`
      }"
    ></view>
    <view
      v-for="(item, index) in tab"
      :id="'t_' + index"
      :key="index"
      :class="['scroll-view-item', activeIndex === index ? 'active' : '']"
      :style="{ color: activeIndex === index ? activeColor : inactiveColor }"
      @tap="
        e => {
          handleChange(item, index, e)
        }
      "
    >
      {{ item.name }}
    </view>
  </scroll-view>
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
 * bgColor 背景颜色
 */
import { getDomInfo } from 'packages/utils/utils'
export default {
  props: {
    tab: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: -1
    },
    drawWidth: {
      type: String,
      default: '25'
    },
    activeBagColor: {
      type: String,
      default: '#ff4b40'
    },
    bgColor: {
      type: String,
      default: '#fff'
    },
    inactiveColor: {
      type: String,
      default: '#000'
    },
    activeColor: {
      type: String,
      default: '#000'
    },
    isLoading: {
      type: Boolean,
      default: false // 用于判断tab是否正在加载数据，防止tab切换数据错乱
    }
  },
  data() {
    return {
      toIndex: 0,
      scrollLeft: 0, // 滚动scroll-view的左边滚动距离
      translateX: 17.5,
      //tab的宽度
      tabWidth: 0
    }
  },
  methods: {
    async handleChange(item, index, e) {
      if (this.isLoading) return
      if (index === this.activeIndex) return
      // 元素到左边的距离+元素宽度的一半-滑块宽度的一半
      let offsetLeft = e.target.offsetLeft
      let itemDom = await getDomInfo(`#t_${index}`, this)
      let activeDom = await getDomInfo(`.active-bar`, this)

      let itemDomWidth = itemDom.width / 2
      let activeDomWidth = activeDom.width / 2
      this.translateX = offsetLeft + itemDomWidth - activeDomWidth
      this.$emit('update:activeIndex', index)
      this.$emit('change', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-box ::-webkit-scrollbar {
  width: 0;
  height: 0;
  color: transparent;
  display: none;
}
.tab-box {
  white-space: nowrap;
  background-color: #fff;
  position: relative;
  .scroll-view-item {
    display: inline-block;
    height: 100rpx;
    text-align: center;
    line-height: 100rpx;
    font-size: 28rpx;
    font-weight: 500;
    padding: 0 32rpx;
    position: relative;
  }
  .active {
    font-size: 32rpx;
    font-weight: bold;
  }
  .active-bar {
    position: absolute;
    top: 76rpx;
    left: 0;
    height: 3rpx;
    transition: all 0.3s;
  }
}
</style>
