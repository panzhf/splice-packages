<template>
  <common-popup
    v-model="showPopup"
    type="confirm"
    max-size
    :title="title"
    :content="content"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <!-- mode=2时显示复选框，通过slot插入到content下方 -->
    <view v-if="mode === 2" class="flex flex-center mt-30">
      <u-checkbox v-model="noRemindChecked" size="32" shape="circle" :active-color="checkboxActiveColor">
        <view class="ml-10 c-6 fs-28">7天内弹窗不再弹出</view>
      </u-checkbox>
    </view>
  </common-popup>
</template>

<script>
/**
 * 实名认证弹窗组件
 * 支持3种模式：
 * - mode=1: 强制认证模式（首页使用，不带"7天内不再提示"复选框）
 * - mode=2: 提示认证模式（首页使用，带"7天内不再提示"复选框，勾选后关闭时会上报）
 * - mode=3: 提现认证模式（提现页使用，无复选框，提示文案与首页一致）
 *
 * 注意：mode=2时，如果勾选了"7天内弹窗不再弹出"复选框，在弹窗关闭时会自动触发 no-remind 事件
 *
 * 使用示例：
 * <realname-auth-popup
 *   v-model="showPopup"
 *   :mode="1"
 *   @confirm="handleConfirm"
 *   @cancel="handleCancel"
 *   @no-remind="handleNoRemind"
 * />
 */
export default {
  name: 'RealnameAuthPopup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    mode: {
      type: Number,
      default: 1,
      validator(v) {
        return [1, 2, 3].includes(v)
      }
    },
    title: {
      type: String,
      default: '温馨提示'
    },
    confirmText: {
      type: String,
      default: '去认证'
    },
    cancelText: {
      type: String,
      default: '下次再说'
    }
  },
  data() {
    return {
      showPopup: false,
      content:
        '根据《中华人民共和国个人所得税法实施条例》规定，当前品牌商开通个税代缴功能，请您先完成个人信息认证，否则无法获得佣金或奖励。',
      noRemindChecked: false,
      checkboxActiveColor: ''
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
      if (v) {
        // 弹窗打开时初始化复选框颜色
        this.initCheckboxColor()
      } else {
        // 关闭时，如果勾选了复选框，需要上报
        if (this.noRemindChecked) {
          this.$emit('no-remind')
        }
        // 重置复选框状态
        this.noRemindChecked = false
      }
    }
  },
  methods: {
    initCheckboxColor() {
      // #ifdef MP-SALE
      this.checkboxActiveColor = '#3246C3'
      // #endif
      // #ifdef MP-RETAIL
      this.$nextTick(() => {
        this.checkboxActiveColor = this.themeInfo?.color || '#FF7640'
      })
      // #endif
      // #ifdef MP-DISTRIBUTION
      this.checkboxActiveColor = '#5D76FF'
      // #endif
      // #ifdef MP-GUIDE
      this.checkboxActiveColor = '#FF9E01'
      // #endif
    },
    handleConfirm() {
      this.$emit('confirm')
      this.showPopup = false
    },
    handleCancel() {
      this.$emit('cancel')
      this.showPopup = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
