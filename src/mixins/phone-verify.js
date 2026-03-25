// 手机号快速验证组件
// import phoneVerifyMixin from 'packages/mixins/phone-verify'
export default {
  data() {
    return {
      verifyState: false, // 验证状态，true表示验证次数不足，需提示
      autoFocus: false, // 输入框自动聚焦
      showVerifyFail: false // 验证失败弹窗提示
    }
  },
  methods: {
    onVerifyFail() {
      this.verifyState = true
      this.autoFocus = true
      uni.$emit('phone-verify')
    }
  }
}
// import { customInputMixin } from 'packages/mixins/phone-verify'
// 配合组件使用 import PhoneVerify from 'packages/components/phone-verify/index.vue'
export const customInputMixin = {
  data() {
    return {
      showCustomInput: false // 手动输入手机号弹窗
    }
  }
}

// import { yzmMixin } from 'packages/mixins/phone-verify'
// import VerifyCodeChange from 'packages/components/phone-verify/change.vue'
// 配合验证码切换组件使用（3+2助手小程序）
export const yzmMixin = {
  data() {
    return {
      yzm: '',
      byYzm: false // 验证码验证方式
    }
  },
  computed: {
    isYzmMode() {
      // 验证码模式
      return this.verifyState || this.byYzm
    }
  }
}

// import { codeTipMixin } from 'packages/mixins/phone-verify'
// 配合验证码提示组件使用 <CodeTip :value="yzm" :is-blur="isCodeBlur" />（3+2助手小程序）
// <input @focus="toggleBlur(0)" @blur="toggleBlur(1)" />
export const codeTipMixin = {
  data() {
    return {
      isCodeBlur: false // 验证码输入框失去焦点
    }
  },
  methods: {
    toggleBlur(t = 1) {
      this.isCodeBlur = t === 1
    }
  }
}
