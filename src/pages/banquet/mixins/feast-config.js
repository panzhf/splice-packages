const feastConfigMixin = {
  onShow() {},
  methods: {
    /**
      orderstatus
      int 订单状态 0-报名审核，1审核通过（待送货），2-审核不通过，3-待结单（完成登记后），4-结单处理中，5 已结单（结单通过） 6结单未通过7- 已结单审核
     */
    getConfigShow(type) {
      // type为按钮类型， info是宴席订单详情信息
      let { orderstatus, operatortype, isbanquetorderedit, applytype, storedealerid } = this.info
      let isSelfApply = applytype === 0

      // 根据订单状态来（最基本的）
      switch (type) {
        case 'iseditorder':
          /**
           * 1.报名审核，待送货， 待结单才可编辑
           * 2.厂家业务员编辑过不可编辑 operatortype操作人类型 1 经销商业务员 2 厂家业务员  3 门店 isbanquetorderedit 是否编辑过
           * 3.applytype 申请人角色，0-门店，1-业务员
           */
          if (
            ![0, 1, 3].includes(orderstatus) ||
            (storedealerid && isbanquetorderedit && operatortype === 2) ||
            !isSelfApply
          ) {
            return
          }
          break
        case 'isdeleteorder':
          /**
           * 1.未通过，报名审核，待送货， 待结单
           * 2.自己提交的才可以删除 applytype 申请人角色，0-门店，1-业务员
           * 3.无扫码记录 (totalscannedamount > 0代表有扫码记录)
           */
          // 未通过，报名审核，待送货， 待结单自己提交的才可以删除
          if (![0, 1, 2, 3].includes(orderstatus) || !isSelfApply) {
            return
          }
          break
        // 仅门店自己提交的报名信息, 订单状态：结单未通过
        case 'isappealorder':
          if (![6].includes(orderstatus) || !isSelfApply) {
            return
          }
          break
        case 'isdeliver':
        case 'isuploadimg':
          if (![1, 3].includes(orderstatus)) {
            return
          }
          break
        // 结单
        case 'isfinishorder':
          if (![3].includes(orderstatus)) {
            return
          }
          break
      }
      return true
    }
  }
}
export default feastConfigMixin
