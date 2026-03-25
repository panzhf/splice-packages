<template>
  <view class="reason bg-f">
    <view class="reason-title">选择注销账号的原因</view>
    <view
      v-for="item in reasonList"
      :key="item.index"
      class="item flex flex-middle fs-32"
      :class="[item.index ? 'bd-e' : '']"
      @tap="handleChoose(item)"
    >
      <text class="iconfont mr-10" :class="[chooseValue === item.index ? 'icon-checked' : 'icon-uncheck']" />
      <text class="name">{{ item.value }}</text>
    </view>
    <view v-if="!chooseValue" class="textarea">
      <textarea
        v-model.trim="otherReason"
        :maxlength="100"
        class="input"
        placeholder="请输入原因"
        @blur="handleGetValue"
      ></textarea>
      <view class="fs-24 tx-r mr-20">
        <text class="c-6">{{ otherReason.length }}</text>
        /
        <text class="c-9">100</text>
      </view>
    </view>
    <view class="safe-btns flex">
      <button v-if="showBack" class="safe-btn back-btn" @tap="handleBack">上一步</button>
      <button class="safe-btn continue-btn" :disabled="disabled" @tap="handleNext">下一步</button>
    </view>
    <view class="blank-height"></view>
  </view>
</template>

<script>
export default {
  name: 'Reason',
  props: {
    showBack: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      reasonList: [
        { index: 1, value: '有其它常用账号' },
        { index: 2, value: '安全/隐私考虑' },
        { index: 3, value: '手机号或微信无法解绑' },
        { index: 4, value: '使用时（如扫码、下单）遇到困难' },
        { index: 0, value: '其它原因' }
      ],
      chooseValue: -1,
      otherReason: '',
      reason: ''
    }
  },
  computed: {
    disabled() {
      return this.chooseValue === -1
    }
  },
  methods: {
    handleGetValue(e) {
      this.otherReason = e.detail.value
    },
    handleChoose(item) {
      this.chooseValue = item.index
      this.reason = item.value
    },
    handleBack() {
      this.$emit('setStep', 1)
    },
    handleNext() {
      if (this.chooseValue === -1) return
      if (this.chooseValue === 0 && this.otherReason === '') return this.$msg('请输入原因！')
      this.$emit('reason', `${this.chooseValue ? this.reason : '其他原因-' + this.otherReason}`)
      this.$emit('setStep', 3)
    }
  }
}
</script>

<style lang="scss" scoped>
.reason {
  .reason-title {
    padding: 50rpx 0 30rpx 50rpx;
    font-size: 32rpx;
    font-weight: 700;
  }
  .item {
    height: 100rpx;
    margin: 0 50rpx;
    padding: 15rpx 0;
    .name {
      color: #2a2a2a;
      font-weight: 500;
    }
  }
  .textarea {
    margin: 0 50rpx;
    .input {
      width: 610rpx;
      padding: 20rpx;
      height: 240rpx;
      background: #f4f4f4;
      border-radius: 10rpx;
    }
  }
}
</style>
