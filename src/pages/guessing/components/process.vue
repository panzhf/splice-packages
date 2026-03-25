<template>
  <view class="progress">
    <view
      v-for="(item, index) in processTemp"
      :key="index"
      class="progress-item"
      :class="item.isMove ? 'item-move' : ''"
      :style="[item.style]"
    >
      <template v-if="item.showText">{{ item.number }}%</template>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    process: {
      type: Array,
      require: true,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      // 进度数组媒介
      processTemp: this.process,
      // 偏移标识
      moveLogo: 8,
      // 颜色背景
      bgColor: ['#0181FE', '#EB090B', '#D0D0D0'],
      // 长度数组
      lengthArray: [1, 10, 30]
    }
  },
  watch: {
    process(val, oldVal) {
      this.processTemp = this.formateProcess(val)
    }
  },
  mounted() {
    this.processTemp = this.formateProcess(this.processTemp)
  },
  methods: {
    progressItem(item) {
      return {
        width: item.widthNumber,
        zIndex: item.zIndex,
        backgroundColor: item.backgroundColor
      }
    },
    /**
     * @description 是否左移
     * @param {Number} index 处理元素的下标
     * @date 2022年5月26日08:49:04
     **/
    isMoveLeft(currentIndex, array) {
      let flag = false
      if (array[currentIndex].number === 0) {
        return flag
      }
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (array[i].number > 0) {
          flag = true
          break
        }
      }
      return flag
    },
    /**
     * @description 计算元素的宽度
     * @date 2022年5月26日09:37:02
     * @param {Number} number 比率
     * @return {String} 组件长度
     **/
    calculateWidth(number = 0) {
      if (number > 0) {
        return 'calc(' + '14rpx + ' + number + '%)'
      } else {
        return number + '%'
      }
    },
    /**
     * @description 格式化数据
     * @date 2022年5月26日11:34:51
     * @param {Array} array 带格式化数组
     * @return {Array} 格式化的数据
     **/
    formateProcess(array) {
      let arr = []
      let aLength = array.length
      // let aLength = [3,2,1]
      for (let i = 0; i < aLength; i++) {
        let obj = {
          id: i,
          number: array[i].number,
          isMove: false,
          showText: array[i].showText,
          style: {
            ...array[i].style,
            zIndex: i % 2 ? 3 : 2,
            width: this.calculateWidth(array[i].number)
          }
        }
        arr.push(obj)
      }
      for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
          arr[i].isMove = false
        } else {
          arr[i].isMove = this.isMoveLeft(i, arr)
        }
      }
      return arr
    }
  }
}
</script>

<style>
.progress {
  display: flex;
  max-height: 28rpx;
  height: 100%;
  background-color: #ebebeb;
  border-radius: 10rpx;
}

.item-move {
  margin-left: -14rpx;
}
</style>
