/*
 * @Description 微信支付确认收款 mixin
 */
const merchantTransferMixin = {
  methods: {
    // 调用微信支付确认收款
    requestMerchantTransfer(returnData) {
      // 检查是否支持 requestMerchantTransfer
      if (wx.canIUse && wx.canIUse('requestMerchantTransfer')) {
        const { wxmchid, wxappid, wxpackageinfo, state, message } = returnData || {}
        
        // 参数校验
        if (!wxmchid || !wxappid || !wxpackageinfo || state !== 200) {
          let msg = message || '提现请求失败，请稍候再试。'
          switch (state) {
            case 403:
              msg = '提现请求失败，请稍候再试。'
              break
          }
          this.$msg && this.$msg(msg)
          setTimeout(() => {
            uni.setStorageSync('withdrawFailed', true)
            uni.navigateBack()
          }, 2000)
          return
        }
        
        wx.requestMerchantTransfer({
          mchId: wxmchid,
          appId: wxappid,
          package: wxpackageinfo,
          success: (res) => {
            // 注意：res.err_msg 将在页面展示成功后返回应用时返回 ok，并不代表付款成功
            // 实际转账状态需要通过后端回调通知或查询接口确认
            // 检测确认操作的不同状态 
            if (res.errMsg === 'requestMerchantTransfer:ok' && res.result === 'cancel') {
              // 用户取消确认收款 
              uni.setStorageSync('withdrawFailed', true)
              uni.navigateBack()
            } else {
              uni.navigateBack()
            }
          },
          fail: (res) => {
            // fail 回调通常表示调用失败或用户取消
            // 存储失败标记，跳转到余额页显示提示
            uni.setStorageSync('withdrawFailed', true)
            uni.navigateBack()
          }
        })
      } else {
        console.warn('当前环境不支持 requestMerchantTransfer')
        this.$msg && this.$msg('你的微信版本过低，请更新至最新版本。')
        setTimeout(() => {
          uni.setStorageSync('withdrawFailed', true)
          uni.navigateBack()
        }, 2000)
      }
    }
  }
}

export default merchantTransferMixin

