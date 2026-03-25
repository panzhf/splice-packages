export default {
  computed: {
    isGiftExchange() {
      //ordersourcetype: 1, //订单来源类型，1：积分商城订单 2:扫码中奖订单 3：营销订单 4: 扫码礼包门店兑奖 5:生日礼包
      // 是否是领取礼品
      return [2, 3, 4, 5].includes(this.ordersourcetype)
    },
    textStride() {
      // return this.isGiftExchange ? '领取' : '兑换'
      return '兑换'
    }
  }
}
