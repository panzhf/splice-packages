import { statusType } from '../config'
export const statusFilterMixin = {
  filters: {
    statusFilter(v) {
      return statusType.find(item => item.val === v)?.label || ''
    }
  }
}

import { apiCheckOrder } from 'packages/api/group-buy'
import overdueMixin from 'packages/mixins/overdue'
export const auditMixin = {
  mixins: [overdueMixin],
  data() {
    return {
      auditPopupVisible: false,
      auditPopup: {
        checkresult: 0, // 0.审核不通过需要remark 1.审核通过
        checkremark: '',
        storeid: 0,
        orderno: '',
        activityid: 0
      }
    }
  },
  methods: {
    handleAudit(state, params) {
      if (!this.overdueChecked()) return

      this.auditPopup.checkresult = !!state
      this.auditPopup.checkremark = ''
      this.auditPopup = { ...this.auditPopup, ...params }
      this.auditPopupVisible = true
    },
    async handleAuditConfirm(val, pageType) {
      this.auditPopupVisible = false
      this.auditPopup.checkremark = val
      try {
        const res = await apiCheckOrder(this.auditPopup)
        if (this.$ck(res)) {
          this.$msg('操作成功')
          setTimeout(() => {
            pageType === 'list' ? this.handleSearch() : this.getData()
          }, 1500)
        }
      } catch (error) {
        this.$msg(error.return_msg)
      }
    }
  }
}

import { simplePopupMixin } from 'packages/mixins/common-popup'
import { apiCancelOrder } from 'packages/api/group-buy'
export const cancelMixin = {
  mixins: [simplePopupMixin],
  methods: {
    handleCancel() {
      this.showTips({
        // 对应popType
        type: 'cancel',
        content: '确认取消吗？'
      })
    },
    async cancelOrder(cancelType = 0) {
      try {
        const res = await apiCancelOrder(cancelType === 1 ? this.cancelQuery : this.query)
        if (this.$ck(res)) {
          this.$msg('取消成功', { icon: 'success' })
          this.cancelCb && this.cancelCb()
        }
      } catch (error) {
        this.$msg(error.return_msg)
      }
    },
    onPopupConfirm(cancelType = 0) {
      // 0.提报页取消 1.列表页取消
      this.showPopup = false
      if (this.popType === 'submit') {
        this.submitInfo()
      } else if (this.popType === 'cancel') {
        this.cancelOrder(cancelType)
      }
    }
  }
}

export { default as orderConfigMixin } from './order-config'
