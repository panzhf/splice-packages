<template>
  <view class="camera-zoom-box" :style="customStyle">
    <view v-if="showMode" class="item change-box flex flex-middle flex-center" @tap.stop="changeMode">
      <text class="mdfont icon-gaoqingmoshi" />
      <view class="tip fs-22">高清模式</view>
    </view>
    <view class="item flex flex-middle flex-center" @tap.stop="handleZoom(1)">
      <text class="mdfont icon-fangda" />
    </view>
    <view class="item flex flex-middle flex-center" @tap.stop="handleZoom(0)">
      <text class="mdfont icon-suoxiao" />
    </view>
  </view>
</template>

<script>
// 相机缩放，范围[1, maxZoom]。可取小数，精确到小数后一位。
// import CameraZoom from 'packages/components/camera/zoom'
import { deviceMixin } from 'packages/mixins/camera-zoom'
export default {
  name: 'CameraZoom',
  mixins: [deviceMixin],
  props: {
    maxZoom: {
      type: Number,
      default: 2
    },
    zIndex: {
      type: Number,
      default: 2
    },
    isOpen: Boolean // 开放，不区分ios和安卓
  },
  data() {
    return {
      current: 1,
      top: 290
    }
  },
  computed: {
    showMode() {
      return this.isOpen || this.isIOS
    },
    customStyle() {
      const s = [`z-index: ${this.zIndex}`]
      s.push(`top: ${this.top}rpx`)
      return s.join(';')
    },
    isZoom() {
      // 微信bug，部分安卓机：华为/荣耀/小米/VIVO/OPPO/三星等，maxzoom放大到40/60/80倍
      return !this.isIOS && [40, 60, 80].includes(this.maxZoom)
    },
    zoomRatio() {
      // 缩放比例同步放大
      return this.isZoom ? 10 : 1
    }
  },
  mounted() {
    this.current = uni.getStorageSync('cameraZoom') || this.zoomRatio
  },
  methods: {
    handleZoom(type) {
      // 0缩小 1放大
      let z = this.current
      if (type === 1) {
        if (z >= this.maxZoom) {
          return this.$msg('已达到最大缩放级别')
        }
        z = +(this.current + 0.2 * this.zoomRatio).toFixed(1)
        if (z > this.maxZoom) {
          z = this.maxZoom
        }
      } else {
        if (z <= this.zoomRatio) {
          return this.$msg('已达到最小缩放级别')
        }
        z = +(this.current - 0.2 * this.zoomRatio).toFixed(1)
        if (z < this.zoomRatio) {
          z = this.zoomRatio
        }
      }
      this.current = z
      this.$emit('zoom', this.current)
      uni.setStorageSync('cameraZoom', z)
    },
    deviceCb() {
      if (this.showMode) {
        this.top = 130
      }
    },
    changeMode() {
      this.$emit('change-mode')
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: camera-zoom-box;
.#{$prefix} {
  position: fixed;
  right: 20rpx;
  color: #fff;
  .tip {
    position: absolute;
    bottom: -24rpx;
    width: 150%;
    text-align: center;
  }
  .item {
    position: relative;
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    &.change-box {
      margin-bottom: 48rpx;
      .mdfont {
        font-size: 36rpx;
      }
    }
    & + .item {
      margin-top: 26rpx;
    }
    .mdfont {
      font-size: 40rpx;
    }
  }
}
</style>
