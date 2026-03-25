<template>
  <movable-area class="movable-area" :style="areaStyle">
    <movable-view
      :animation="false"
      :x="x"
      :y="y"
      class="movable-view flex flex-middle flex-center flex-column"
      direction="all"
      @change="changePos"
    >
      <button open-type="contact" hover-class="none" class="icon-box flex flex-middle flex-center">
        <text :style="iconStyle" class="iconfont iconservice f2" />
      </button>
    </movable-view>
  </movable-area>
</template>

<script>
export default {
  props: {
    isCustomNavbar: {
      type: Boolean,
      default: false // 自定义导航栏
    },
    isCustomTabbar: {
      type: Boolean,
      default: false // 自定义tabbar
    },
    color: {
      type: String,
      default: '#666'
    }
  },
  data() {
    return {
      x: 350,
      y: 500,
      menuShow: false,
      sysInfo: {}
    }
  },
  computed: {
    areaStyle() {
      // 计算拖动区域位置，防止拖出到导航栏和tabbar
      const s = []
      s.push(`height: auto`)
      s.push(`top: ${this.isCustomNavbar ? this.sysInfo.statusBarHeight + 44 : 0}px`)
      s.push(`bottom: ${uni.upx2px(82) + (this.isCustomTabbar ? (this.sysInfo.isIPhoneX ? 34 : 0) : 0)}px`)
      return s.join(';')
    },
    iconStyle() {
      const s = []
      s.push(`color: ${this.color}`)
      return s.join(';')
    },
    sourceData() {
      const { source, info } = this
      return { source, info }
    }
  },
  mounted() {
    const sys = uni.getSystemInfoSync()
    const ios = !!(sys.system.toLowerCase().search('ios') + 1)
    const isIPhoneX = ios && sys.screenHeight >= 812
    sys.isIPhoneX = isIPhoneX
    sys.ios = ios
    this.sysInfo = sys
  },
  methods: {
    changePos(e) {
      const { x, y, source } = e.detail
      if (source === 'touch') {
        this.x = x
        this.y = y
      }
    },
    toggleMenu() {
      this.menuShow = !this.menuShow
    }
  }
}
</script>
<style lang="scss" scoped>
.movable-area {
  position: fixed;
  left: 0;
  z-index: 100;
  width: 100%;
  pointer-events: none;
}
.movable-view {
  width: 100rpx;
  height: auto;
  border-radius: 50rpx;
  background-color: #e9e9e9;
  pointer-events: auto;
}
.more-tip {
  margin-top: 14rpx;
  font-size: 22rpx;
}
.icon-box {
  margin: 14rpx 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: #fff;
  & + .icon-box {
    margin-top: 0;
  }
  .iconfont {
    &.f1 {
      font-size: 34rpx;
    }
    &.f2 {
      font-size: 38rpx;
    }
    &.f3 {
      font-size: 42rpx;
    }
  }
}
button {
  padding: 0;
  &::after {
    border: none;
  }
}
</style>
