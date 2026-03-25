<template>
  <view class="name-box" @touchstart.stop="handleTouchInput">
    <input
      v-model="inputValue"
      class="input-text"
      :focus="focus"
      placeholder="请输入您的昵称"
      type="nickname"
      :maxlength="20"
      @change="handleSubmit"
    />
  </view>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      focus: false
    }
  },
  computed: {
    inputValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    handleSubmit(e) {
      this.inputValue = e.detail.value
      this.$emit('confirm')
    },
    handleTouchInput() {
      this.focus = false
      if (wx.requirePrivacyAuthorize) {
        wx.requirePrivacyAuthorize({
          success: () => {
            console.log('用户同意了隐私协议 或 无需用户同意隐私协议')
            // 用户同意隐私协议后给昵称input聚焦
            this.setFocus()
          },
          fail: () => {
            console.log('用户拒绝了隐私协议')
            this.setFocus()
          }
        })
      } else {
        this.setFocus()
      }
    },
    setFocus(state = true) {
      setTimeout(() => {
        this.focus = state
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
.name-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .input-text {
    width: 100%;
  }
}
</style>
