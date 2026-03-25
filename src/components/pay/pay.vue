<template>
  <view />
</template>

<script>
// 导购、会员小程序才要传
// #ifndef MP-RETAIL
import { getExtConfig } from '@/config'
// #endif
import { apiOrderPayorder, apiOrderConfirmpay } from '../../api/order.js'
export default {
  name: 'Pay',
  props: {
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      payList: {},
      time1: 0,
      time2: 0,
      payInfo: null,
      wrongTimes: 0
    }
  },
  methods: {
    // 微信支付
    PayOrder(payList) {
      // payList.originalamount 金额
      this.payList = payList
      const time2 = +new Date()
      const ActualAmount = Number(this.payList.originalamount)
      if (time2 - this.time1 < 5000) {
        return this.$msg('操作过快，请稍后重试')
      }
      this.$loading.show()
      this.time1 = +new Date()

      apiOrderPayorder({
        OrderNumber: this.payList.ordernumber,
        ActualAmount,
        // #ifdef MP-CLOUDSHOP
        configtype: 1 // 云店积分商城支付不采用云店后台的支付设置
        // #endif
      }).then(res => {
        this.$loading.hide()
        if (this.$ck(res)) {
          let data = res.return_data
          this.doPay(this.payList.ordernumber, data)
        }
      })
    },
    doPay(ordernumber, payModel) {
      let that = this
      let outTradeNo = 'MC_' + ordernumber
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: payModel.timestamp,
        nonceStr: payModel.noncestr,
        package: payModel.package,
        signType: 'MD5',
        paySign: payModel.paysign,
        orderInfo: payModel.order_info,
        success: async function (res) {
          if (res.errMsg === 'requestPayment:ok') {
            that.$loading.show()
            let query = {
              sourceAppId: 1,
              tradeType: 1,
              tradeNo: ordernumber,
              status: 1,
              outTradeNo,
              openId: payModel.order_info.openid
            }
            // 导购、会员小程序才要传，万能零售不用
            // #ifndef MP-RETAIL
            query.memberLogin = getExtConfig().memberLogin
            query.openId = payModel.order_info.openid
            // #endif
            let res = await apiOrderConfirmpay(query)
            if (res.return_code !== 0) that.$msg(res.return_msg)
            that.$emit('success')
          } else {
            that.$emit('success')
          }
        },
        fail: function () {
          that.$emit('errFail')
        }
      })
    }
  }
}
</script>
