<template>
  <movable-area 
    class="add-customer-area" 
    :style="{ top: `${moveInfo.top}px`, height: `${moveInfo.height}px` }"
  >
    <movable-view 
      class="add-customer-view" 
      inertia 
      direction="all" 
      :x="moveInfo.x" 
      :y="moveInfo.y"
    >
      <view class="add-customer-btn" :style="{ backgroundImage: `url(${bgImage})` }" @tap="handleClick"> 
        <text class="add-customer-text">添加门店</text>
      </view>
    </movable-view>
  </movable-area>
</template>

<script>
import { staticURL } from '@/config'

export default {
  name: 'AddCustomerButton',
  props: {
    // 是否显示按钮
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      moveInfo: {
        top: 44,
        height: 603,
        x: 626, // 初始位置 x (rpx)
        y: 500  // 初始位置 y (rpx)
      },
      bgImage: staticURL() + 'visit/add-btn-bg.png'
    }
  },
  mounted() {
    this.initMoveArea()
  },
  methods: {
    // 初始化可拖拽区域
    initMoveArea() {
      const { screenHeight, windowHeight, system, statusBarHeight, windowWidth } = uni.getSystemInfoSync()
      // 判断是否iPhone横条
      const isIphoneX = !!(system.toLowerCase().search('ios') + 1) && screenHeight >= 812
      this.moveInfo.top = statusBarHeight + 44
      // 去除tabbar和navbar
      this.moveInfo.height = windowHeight - 50 - (isIphoneX ? 34 : 0) - this.moveInfo.top
      
      // 设置初始位置（右侧居中）
      // rpx 转 px 的比例
      const rpxRatio = 750 / windowWidth
      // 按钮宽度 240rpx
      const btnWidthRpx = 240
      // 初始位置：右侧，垂直居中
      // x: 屏幕宽度 - 按钮宽度 - 右边距
      this.moveInfo.x = (windowWidth * rpxRatio) - btnWidthRpx - 30
      // y: 垂直居中位置
      this.moveInfo.y = (this.moveInfo.height * rpxRatio) / 2 - 45
    },
    // 点击事件
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
.add-customer-area {
  position: fixed;
  left: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none; // 让area不触发底部点击
}

.add-customer-view {
  width: 190rpx;
  height: 68rpx;
  pointer-events: auto; // 恢复按钮点击
}

.add-customer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 190rpx;
  height: 68rpx;
  line-height: 56rpx;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;  
  box-sizing: border-box;
} 

.add-customer-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  white-space: nowrap;
  margin-left: 50rpx;
}
</style>

