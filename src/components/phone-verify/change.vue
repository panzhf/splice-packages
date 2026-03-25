<template>
  <view class="code-change" :class="[alignClass, customClass]">
    <text class="fs-22 code-change__tip">若{{ customText }}失败，请切换为验证码验证</text>
    <text class="fs-24 ml-20 code-change__btn" @tap="handleChange">
      点击切换
      <!-- 图标是插件库的 -->
      <text class="iconfont iconjiantou1 fs-20 ml-10" />
    </text>
  </view>
</template>

<script>
// import VerifyCodeChange from 'packages/components/phone-verify/change.vue'
// <VerifyCodeChange v-model="byYzm" />
export default {
  name: 'VerifyCodeChange',
  props: {
    value: Boolean,
    align: {
      type: String,
      validator(value) {
        return ['left', 'center', 'right'].includes(value)
      },
      default: 'right' // 文字对齐，一般在common.scss中已声明如 `text-center`
    },
    customClass: {
      type: String,
      default: '' // 其他样式如 `pr-40`，主要是适配页面布局
    },
    customText: {
      type: String,
      default: '微信授权手机号'
    }
  },
  computed: {
    alignClass() {
      return `text-${this.align}`
    }
  },
  methods: {
    handleChange() {
      this.$emit('input', !this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.code-change {
  .code-change__tip {
    color: #aaa;
  }
  .code-change__btn {
    color: #0f80ff;
  }
}
</style>
