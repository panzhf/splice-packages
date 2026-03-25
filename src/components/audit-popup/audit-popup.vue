<template>
  <common-popup
    v-model="showDialog"
    :type="popType"
    :title="popTitle"
    :content="popContent"
    :placeholder="mode === 3 ? '请输入审核意见，100字以内' : '原因，30字之内'"
    :max-length="mode === 3 ? 100 : 30"
    is-textarea  
    :custom-style="isneedauditidea ? 'animation: none;' : ''"
    @confirm="onConfirm"
  >
    <view v-if="isneedauditidea && showDialog">
      <view v-if="mode === 0" class="audit-popup-remark tx-l">
        <view class="mb-20">原因：</view>
        <textarea v-model="remark" placeholder="请输入原因，30字之内" maxlength="30" class="textarea br-10 text-left" />
      </view>
      <view v-if="mode === 0" class="tx-l mt-20">审核意见：</view>
      <textarea
        v-model="auditidea"
        placeholder="请输入审核意见，该意见门店不可见，100字以内"
        maxlength="100"
        class="textarea br-10 text-left mt-20"
      />
    </view>
  </common-popup>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
export default {
  name: 'AuditPopup',
  mixins: [dialogMixin],
  props: {
    mode: {
      type: Number,
      default: -1 // 0.不通过 1.审核通过 2.申诉通过 3.结单审核
    },
    isneedauditidea: {
      type: Boolean,
      default: false // 是否申诉场景
    }
  },
  data() {
    return {
      remark: '',
      auditidea: ''
    }
  },
  watch: {
    showDialog(val) {
      if (val) {
        this.remark = ''
        this.auditidea = ''
      }
    }
  },
  computed: {
    popType() {
      if (this.isneedauditidea) {
        return 'confirm'
      }
      return [1, 2].includes(this.mode) ? 'confirm' : 'prompt'
    },
    popTitle() {
      if (this.mode === 3) {
        return '审核意见'
      }
      return [1, 2].includes(this.mode) ? '提示' : '不通过'
    },
    popContent() {
      const m = {
        1: '通过后审核状态不能更改，是否确定？',
        2: '通过后，订单状态将更改为“结单通过”，同时系统将对该订单执行重新发奖，是否确定通过？'
      }
      return m[this.mode] || ''
    }
  },
  methods: {
    onConfirm(v) {
      if (this.popType === 'prompt' && !v.trim()) {
        let msg = this.mode === 3 ? '请输入审核意见' : '请输入原因'
        return this.$msg(msg)
      }
      if (this.isneedauditidea) { 
        if (this.mode === 0 &&!this.remark.trim()) {
          return this.$msg('请输入原因')
        }
        
        if (!this.auditidea.trim()) {
          return this.$msg('请输入审核意见')
        }
        this.$emit('confirm', this.remark, this.auditidea)
      } else {
        this.$emit('confirm', v)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
.textarea {
  width: calc(100% - 32rpx);
  padding: 12rpx 16rpx;
  border: 1px solid #aaa;
  height: 210rpx;
  background: #f0f0f0;
}
.audit-popup-remark {
  margin-top: -20rpx;
}
</style>
