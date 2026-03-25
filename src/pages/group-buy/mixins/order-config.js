const groupBuyOrderConfigMixin = {
  computed: {
    // #ifdef MP-SALE
    userinfo() {
      return this.$store.state.userinfo
    },
    salemanType() {
      // 1厂家业务员 2经销商业务员
      return this.userinfo.dealerid > 0 ? 2 : this.userinfo.dealerid === 0 ? 1 : 0
    },
    isNoDirectSales() {
      // storedealerid: 0 直营门店订单，非0非直营门店订单
      // 只有厂家业务员(dealerid === 0)且是非直营门店订单(storedealerid !== 0)时为true
      return this.salemanType === 1 && this.info.storedealerid
    }
    // #endif
  },
  methods: {
    // 判断当前用户是否是订单提交人
    getOrderRoleAllow(type) {
      if (!this.info || !this.info.applicantno) return false
      const { operatortype, applytype, operatorid } = this.info
      // #ifdef MP-SALE
      //  operatortype操作人类型 1 经销商业务员 2 厂家业务员
      //  1. 经销商业务员自己提交的：当前是经销商业务员 且 订单操作人类型是经销商业务员
      //  2. 厂家业务员（直营门店订单）自己提交的
      //  3. 厂家业务员（非直营门店订单）
      // applytype 申请人角色，0-门店，1-业务员
      // 不是业务员提交的，或者不是直营门店订单，不允许编辑
      let isAllow = applytype === 1 || this.isNoDirectSales
      // 上次编辑的是厂家业务员，且自己不是厂家业务员，则不允许编辑
      if (isAllow && !(type === 'iseditororder' && operatorid && operatortype === 2 && this.salemanType !== 1)) {
        return true
      }
      // #endif
      // #ifdef MP-RETAIL
      // 上次编辑的不是厂家业务员，且是自己提交的就可以编辑
      if (applytype === 0 && !(type === 'iseditororder' && operatorid && operatortype === 2)) {
        return true
      }
      // #endif
      return false
    },
    /**
     * 团购订单权限判断
     * @param {string} type - 权限类型：iseditorder(编辑权限)、isdeleteorder(删除权限)
     * @returns {boolean} - 是否有权限
     *
     * 订单状态：
        0-待提交
        1-待审核
        2-审核通过
        3-审核不通过
        4-待结单
        5-结单待审核
        6-结单审核未通过
        7-已结单
        8-结单处理中
        9-已取消
     *
     * 权限规则：
     * 1. 门店、经销商业务员、厂家业务员（直营门店订单）：谁提交的订单谁有编辑/删除权限
     * 2. 厂家业务员（非直营门店订单）：默认有删除和编辑权限
     */
    getConfigShow(type) {
      let { orderstatus } = this.info

      switch (type) {
        case 'iseditorder':
          // 判断订单状态是否允许编辑
          return [1, 4].includes(orderstatus)

        case 'isdeleteorder':
          // 判断订单状态是否允许删除
          return [1, 4, 9].includes(orderstatus)

        default:
          return false
      }
    }
  }
}

export default groupBuyOrderConfigMixin
