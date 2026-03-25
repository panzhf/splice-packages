<template>
  <view>
    <scroll-view class="tab-box" :show-scrollbar="false" :scroll-left="scrollLeft" scroll-x scroll-with-animation>
      <view
        v-for="(item, index) in list"
        :id="'t_' + index"
        :key="index"
        :class="['scroll-view-item', item.isdefault ? 'active' : '']"
        @tap="
          e => {
            handleChange(index)
          }
        "
      >
        <view v-if="perioddisplay === 0">第{{ item.index }}期</view> 
        <view :class="perioddisplay !== 0 ? 'no-show-period' : ''">
          <template v-if="item.showendtime === item.showstarttime">
            {{ item.showendtime }}
          </template>
          <template v-else>{{ item.showstarttime }}~{{ item.showendtime }}</template> 
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getDomInfo } from 'packages/utils/function'
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    perioddisplay: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      scrollLeft: 0
    }
  },
  watch: {
    list: {
      immediate: true,
      deep: true,
      handler(val) {
        this.setDefaultWidth()
      }
    }
  },
  methods: {
    sumWidthBeforeIndex(arr, index) {
      let sum = 0
      for (let i = 0; i <= index; i++) {
        if (arr[i].hasOwnProperty('width')) {
          sum += arr[i].width
        }
      }
      return sum
    },
    async setDefaultWidth() {
      setTimeout(async () => {
        let itemDom = await getDomInfo('.scroll-view-item', this, true)
        let viewDom = await getDomInfo('.tab-box', this)
        let index = this.list.findIndex(item => item.isdefault)
        let widthSum = this.sumWidthBeforeIndex(itemDom, index)
        const selectWeight = itemDom[index].width // 选中的元素宽度
        this.scrollLeft = widthSum - viewDom.width / 2 - selectWeight / 2
      }, 300)
    },
    handleChange(index) {
      this.$emit('handleSelect', index)
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
  position: relative;
  .scroll-view-item {
    display: inline-block;
    // height: 80rpx;
    text-align: center;
    font-size: 24rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #fff;
    padding: 9rpx 24rpx;
    position: relative;
  }
  .active {
    color: #010101;
    background: #fff;
    box-shadow: 0px 8rpx 8rpx 0px rgba(255, 118, 64, 0.3);
    border-radius: 10rpx 10rpx 0px 0px;
  }
}
.no-show-period {
  font-size: 28rpx;
  margin: 10rpx 0
}
</style>
