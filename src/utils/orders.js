// 过滤器成功查看详情  (下单页面)
export function filterSuccess(status, orderid, type, subcategory) {
  // 礼品类型 lipintype ，0：实物礼品 1：虚拟商品（虚拟票券类） 2：购物券 3：微信红包 4：联盟卡券 5：直充类，
  // 6:提领券 ，7：零钱红包 8:微信代金券 9：红包券 11:品牌红包 12：企业付款红包
  const defaultUrl = `/packages/src/order/detail?id=${orderid}&type=${type}&subcategory=${subcategory}`
  const m = {
    2: '/personal/coupon/list',
    3: `/packages/src/order/detail?id=${orderid}&type=${type}`,
    4: '/packages/src/union-card/list',
    6: '/packages/src/personal/bring-coupon/list',
    7: '/packages/src/personal/change/index',
    8: '/personal/wechat-coupon/list',
    9: '/personal/my-voucher/list'
  }
  // #ifdef MP-GUIDE
  m[7] = '/balance/index'
  // #endif
  // #ifdef MP-CLOUDSHOP
  m[2] = '/pointsMall/mall/personal/coupon'
  m[4] = '/pointsMall/mall/personal/allianceCardList'
  m[9] = '/cloudStore/MyVoucher/List'
  delete m[8]
  // #endif
  return status in m ? m[status] : defaultUrl
}

//  过滤器成功按钮  (下单页面)
export function filterSuccessBtn(status) {
  // 礼品类型 lipintype ，0：实物礼品 1：虚拟商品（虚拟票券类） 2：购物券 3：微信红包 4：联盟卡券 5：直充类，
  // 6:提领券  7：零钱红包 8:微信代金券 9：红包券
  const btnMap = {
    2: '查看购物券',
    4: '查看联盟卡券',
    6: '查看提领券',
    7: '查看零钱',
    8: '微信代金券',
    9: '查看红包券'
  }
  return btnMap[status] || '查看订单详情'
}
