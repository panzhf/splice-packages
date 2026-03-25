<template>
  <u-popup
    v-model="showDialog"
    mode="bottom"
    :mask-custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }"
    :mask-close-able="false"
    closeable
    border-radius="30"
  >
    <view class="phone-verify">
      <view class="fw-bold title fs-30 text-center">填写手机号</view>
      <input
        v-model.trim="mobile"
        type="number"
        maxlength="11"
        placeholder="请输入手机号"
        :focus="focus"
        class="input"
        @blur="onBlur"
      />
      <view class="error-tip fs-24">{{ errorTip }}</view>
      <view class="confirm-btn fs-32 fw-bold text-center" @tap="handleConfirm">确认</view>
    </view>
  </u-popup>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
export default {
  name: 'PhoneVerify',
  mixins: [dialogMixin],
  data() {
    return {
      mobile: '',
      focus: false,
      errorTip: ''
    }
  },
  watch: {
    showDialog(val) {
      if (val) {
        this.mobile = ''
        this.errorTip = ''
        setTimeout(() => {
          this.focus = true
        }, 300)
      } else {
        this.focus = false
      }
    }
  },
  methods: {
    onBlur(e) {
      const v = (e.detail.value || '').trim()
      if (!v) {
        this.errorTip = '请输入手机号'
        return
      }
      if (!/^1[3-9]\d{9}$/.test(v)) {
        this.errorTip = '手机号格式错误'
        return
      }
      this.errorTip = ''
      this.mobile = v
    },
    handleConfirm() {
      if (this.errorTip) return
      this.$emit('confirm', this.mobile)
      this.showDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: phone-verify;
.#{$prefix} {
  padding: 50rpx 85rpx 80rpx;
  .title {
    color: #222;
  }
  .input {
    margin-top: 70rpx;
    padding: 20rpx 0;

    border-bottom: 1rpx solid #ccc;
  }
  .error-tip {
    height: 30rpx;
    line-height: 24rpx;
    color: #fa3534;
    margin-top: 12rpx;
  }
  .confirm-btn {
    height: 80rpx;
    margin-top: 60rpx;

    color: #fff;
    background-color: $uni-color-primary;

    line-height: 80rpx;
    border-radius: 40rpx;
  }
}
</style>
