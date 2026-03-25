<template>
  <view
    :class="['none-content flex flex-center flex-column flex-middle text-center', onType != 1 ? 'on' : '']"
    :style="customStyle"
  >
    <image :src="defaultIcon" :style="customIconStyle" class="banner-box" />
    <view class="msg" :style="customMsgStyle">{{ msg }}</view>
    <slot />
  </view>
</template>

<script>
// import { staticURL } from '../../config'
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  props: {
    icon: {
      type: String,
      default: ''
    },
    iconStyle: {
      type: String,
      default: '' // 设置宽高等，`width: 200rpx;height: 200px`
    },
    msg: {
      type: String,
      default: '暂无数据'
    },
    msgStyle: {
      type: String,
      default: '' // 设置大小等，`font-size: 30rpx;`
    },
    textColor: {
      type: String,
      default: '#666'
    },
    onType: {
      type: String,
      default: '1'
    },
    customStyle: {
      type: String,
      default: ''
    }
  },
  computed: {
    defaultIcon() {
      return this.icon || this.PACKAGE_STATIC_URL + 'no-data.png'
    },
    customIconStyle() {
      const s = []
      if (this.iconStyle) {
        s.push(this.iconStyle)
      }
      return s.join(';')
    },
    customMsgStyle() {
      const s = [`color: ${this.textColor}`]
      if (this.msgStyle) {
        s.push(this.msgStyle)
      }
      return s.join(';')
    }
  }
}
</script>

<style lang="scss" scoped>
.none-content {
  padding: 200rpx 0;
  margin: 0 auto;
  &.on {
    padding: 200rpx 0 60rpx;
  }
  .banner-box {
    width: 389rpx;
    height: 228rpx;
  }
  .msg {
    padding-top: 30rpx;
    font-size: 30rpx;
  }
}
</style>
