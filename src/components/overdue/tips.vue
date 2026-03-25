<template>
  <common-popup v-model="showPopup" type="tip" :content="tipMsg" @close="handleClose" />
</template>

<script>
/*
用法：
<OverdueTips v-if="isExpires" v-model="showOverdueTips" />
import overdueMixin from 'packages/mixins/overdue'

if (!this.overdueChecked()) return
@tap="!isExpires ? (其他方法) : (showOverdueTips = true)"
*/

export default {
  name: 'OverDue',
  props: {
    value: Boolean,
    showOverdueType: {
      // 0 过期提示  1 过期提示+需要提醒对资产进行处理
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showPopup: false
    }
  },
  computed: {
    companyName() {
      let memberloginname
      // #ifdef MP-RETAIL
      memberloginname = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}').memberLoginName || ''
      // #endif
      // #ifndef MP-RETAIL
      memberloginname = JSON.parse(uni.getStorageSync('currentBrandInfo') || '{}').memberloginname || ''
      // #endif
      return memberloginname
    },
    tipMsg() {
      let assetTip = '订购的服务已到期，请及时对红包零钱进行提现。'
      // #ifdef MP-GUIDE
      assetTip = '订购的服务已到期，请您及时查看积分和红包零钱，并尽快使用和进行提现。'
      // #endif
      const tipMsg = this.showOverdueType ? assetTip : `订购的服务已到期，功能暂时无法使用！`
      return `${this.companyName}${tipMsg}`
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
    }
  },
  methods: {
    handleClose() {
      this.$emit('input', false)
    }
  }
}
</script>
