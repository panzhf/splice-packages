<template>
  <div>
    <u-mask
      :show="isShow"
      :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
      :mask-click-able="false"
      :zoom="false"
      z-index="1000"
    >
      <view class="dialog flex flex-column" :style="{ backgroundImage: `url(${bgImg})` }" @tap.stop="() => {}">
        <image :src="btnImg1" mode="scaleToFill" class="btn" @click="handleClick(1)" />
        <image :src="btnImg2" mode="scaleToFill" class="btn plan" @click="handleClick(2)" />
      </view>
    </u-mask>
  </div>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      bgImg: staticURL(true) + '/scan/identity-bg.png?v1',
      btnImg1: staticURL(true) + '/scan/identity-btn-1.png',
      btnImg2: staticURL(true) + '/scan/identity-btn-2.png'
    }
  },
  methods: {
    handleClick(type) {
      this.$emit('select', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  width: 620rpx;
  height: 500rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-size: 100% 100%;
  padding-top: 200rpx;
  .btn {
    width: 466rpx;
    height: 106rpx;
    margin: 0 auto;
  }
  .plan {
    margin-top: 30rpx;
  }
}
</style>
