<template>
  <view :style="themeVars">
    <view v-if="mode || showBtn" style="height: 200rpx" />
    <view v-if="showBtn" class="footer-btn flex">
      <button
        v-for="(item, index) in footBtns"
        :key="index"
        :class="['primary-btn', 'round', 'flex-1', index === 0 && footBtns.length === 2 ? 'plain' : '']"
        hover-class="button-action"
        @tap="handleClick(item)"
      >
        {{ item.name }}
      </button>
    </view>
    <view v-if="mode === 1" class="footer-btn flex">
      <button class="primary-btn round plain flex-1" hover-class="button-action" @tap="handleFailed">审核不通过</button>
      <button class="primary-btn round flex-1 ml-30" hover-class="button-action" @tap="handlePass">审核通过</button>
    </view>

    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :max-length="maxLength"
      :default-value.sync="popDaultValue"
      :is-textarea="popIsTextarea"
      :tip="popTips"
      :placeholder="popPlaceholder"
      @confirm="handleConfirm"
    />
  </view>
</template>
<script>
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import commonPopupMixin from 'packages/mixins/common-popup'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    CommonPopup
  },
  mixins: [
    commonPopupMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  /*
  footBtns:
    [
     { type: 'del', name: '删除' ,tips:''},
     { type: 'edit', name: '修改' }
    ]
  */
  props: {
    footBtns: {
      type: Array,
      default: () => []
    },
    mode: {
      type: Number,
      default: -1 //  0详情 1审核
    }
  },
  data() {
    return { operaType: '', tips: '' }
  },
  computed: {
    showBtn() {
      return !this.mode && this.footBtns.length
    }
  },
  methods: {
    handleClick(item) {
      switch (item.type) {
        case 'edit':
          this.handleEdit()
          break
        case 'del':
          this.tips = item.tips || ''
          this.handleDele()
          break
        default:
          break
      }
    },
    handlePass() {
      this.popType = 'confirm'
      this.popTitle = ''
      this.popContent = '确定审核通过吗？'
      this.maxLength = 20
      this.popIsTextarea = false
      this.operaType = 'auditPass'
      this.popCancelText = '取消'
      this.popConfirmText = '确定'
      this.showPopup = true
    },
    handleFailed() {
      this.operaType = 'auditFailed'
      this.popDaultValue = ''
      this.popType = 'prompt'
      this.popTitle = '审核不通过理由'
      this.maxLength = 50
      this.popIsTextarea = true
      this.popTips = ''
      this.popPlaceholder = '请填写审核不通过的理由,限50字'
      this.popContent = ''
      this.showPopup = true
    },
    handleDele() {
      this.operaType = 'delete'
      this.popType = 'confirm'
      this.popTitle = ''
      this.popContent = this.tips || '确定要删除吗？'
      this.showPopup = true
    },
    handleEdit() {
      this.$emit('edit')
    },
    async handleConfirm(value) {
      if (this.operaType === 'auditFailed') {
        if (value === '') {
          return this.$msg('请填写审核不通过的理由')
        }
        if (value.length > this.maxLength) {
          return this.$msg(`不能超过${this.maxLength}字`)
        }
      }
      let obj = {
        value: value,
        operaType: this.operaType
      }
      this.$emit('confirm', obj)
      this.showPopup = false
    }
  }
}
</script>
<style lang="scss" scoped>
.footer-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 30rpx;
  box-sizing: border-box;
  padding: 25rpx 40rpx 0;
  .primary-btn:nth-child(2) {
    margin-left: 30rpx;
  }
}
</style>
