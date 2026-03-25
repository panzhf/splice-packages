<template>
  <view v-if="isVisible" class="dialog">
    <view class="dialog-mask" />
    <view class="dialog-main">
      <view class="dialog-section">
        <view class="dialog-panel">
          <u-parse class="dialog-body" :html="content" :tag-style="style" />
          <view class="dialog-footer">
            <view v-for="(item, index) in btns" :key="index">
              <view class="dialog-btn" @tap="handleClick">{{ item.text }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isVisible: false,
      content: '',
      btns: [],
      style: {
        p: 'text-align: left;'
      }
    }
  },
  methods: {
    handleClick() {
      this.close()
    },
    open(options) {
      this.isVisible = true
      this.content = options.content
      this.btns = options.btns
    },
    close() {
      this.isVisible = false
      this.$emit('layer-close')
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  position: relative;
  word-break: break-all;
  user-select: auto;
  z-index: 10000;
}
.dialog-mask,
.dialog-main {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
}
.dialog-mask {
  background-color: rgba(0, 0, 0, 0.7);
  pointer-events: auto;
}
.dialog-main {
  display: table;
  pointer-events: none;
}
.dialog-section {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
.dialog-panel {
  display: inline-block;
  width: 80%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  pointer-events: auto;
  animation-name: dialogAnim;
  animation-duration: 500ms;
  animation-fill-mode: both;
}
@keyframes dialogAnim {
  0% {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
  }
  80% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: translateZ(0);
  }
}
.dialog-body {
  padding: 60rpx 68rpx;
  font-size: 32rpx;
  color: #333;
  line-height: 52rpx;
  max-height: 300px;
  overflow-y: auto;
}
.dialog-footer {
  padding-left: 90rpx;
  padding-right: 90rpx;
  padding-bottom: 60rpx;
}
.dialog-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  vertical-align: middle;
  border-radius: 46rpx;
  text-align: center;
  background: linear-gradient(90deg, rgba(255, 194, 0, 1) 0%, rgba(255, 139, 2, 1) 100%);
  font-size: 34rpx;
  color: #fff;
}
</style>
