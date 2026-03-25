<template>
  <view v-show="showTip" class="code-tip fs-24" :style="customStyle">
    {{ errorTip }}
  </view>
</template>

<script>
import { regCode } from 'packages/utils/reg'
export default {
  name: 'CodeTip',
  props: {
    value: {
      type: [Number, String],
      default: ''
    },
    isBlur: Boolean,
    mode: {
      type: Number,
      default: 1 // 1.验证码
    },
    customStyle: {
      type: String,
      default: '' // 一般用于设置与页面布局其他样式对齐如 `padding-left: 40rpx`
    }
  },
  computed: {
    showTip() {
      // 输入框失焦后校验
      return this.isBlur && !regCode(this.value)
    },
    errorTip() {
      const o = {
        1: '请输入6位数验证码'
      }
      return o[this.mode]
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: code-tip;
.#{$prefix} {
  margin-top: 8rpx;
  color: #f35854;
}
</style>
