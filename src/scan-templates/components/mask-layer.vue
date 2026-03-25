<template>
  <view class="layer" @touchmove.stop="() => {}">
    <view class="layer__shade" @tap="handleClickShade" />
    <view class="layer__main">
      <view class="layer__section">
        <slot />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    handleClickShade() {
      this.$emit('click-mask')
    }
  }
}
</script>

<style lang="scss" scoped>
.layer {
  position: relative;
  z-index: 10000;
  box-sizing: content-box;
  pointer-events: none;
  word-break: break-all;
  animation-fill-mode: both;
  animation-duration: 0.2s;
  animation-timing-function: cubic-bezier(0.25, 0.8, 0.5, 1);
  animation-name: layerShadeBounceIn;
}
.layer__main,
.layer__shade {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-sizing: content-box;
  transform: translateZ(0);
}

.layer__shade {
  background-color: rgba(0, 0, 0, 0.7);
  pointer-events: auto;
}
@keyframes layerShadeBounceIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.layer__main {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
