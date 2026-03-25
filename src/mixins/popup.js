// import popupMixin from 'packages/mixins/popup'
export default {
  data() {
    return {
      showPopup: false,
      popType: '',
      popTitle: '',
      popContent: '',
      confirmText: '确定',
      cancelText: '取消'
    }
  },
  methods: {
    showTips({ tppe = 'tip', title = '温馨提示', content = '' } = {}) {
      this.popType = tppe
      this.popTitle = title
      this.popContent = content
      this.showPopup = true
    }
  }
}
