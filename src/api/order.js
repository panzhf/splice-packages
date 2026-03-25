import { httpPost, httpGet } from '@/utils/request'
let apiOrders,
  apiOrderdetail,
  apiOrderlogistics,
  apiOrderOrderreceiving,
  apiOrderConfirm,
  apiOrderCommit,
  apiOrderFreightinfo,
  apiGetCheckoutFreight,
  apiOrderStorerewarddetail,
  apiOrderOrderstatus,
  apiOrderPayorder,
  apiOrderhandler,
  apiOrderConfirmpay,
  apiExpressTemplate,
  apiGetModuleSetting,
  apiCancalOrder,
  apiGetNearbyStoresList,
  apiRefundOrder,
  apiApplyAfterSales,
  apiConfirmReturnPackage,
  apiAfterSalesDetail,
  apiCancelAfterSales,
  apiAfterSalesList,
  apiGetAfterSaleMsgTemplateId,
  apiAddSubscribemsgRecord

// #ifdef MP-GUIDE
// 订单列表
apiOrders = data => httpPost('/guideassistant/api/order/getorderlist', data)
// 查看订单详情
apiOrderdetail = data => httpGet(`/guideassistant/api/order/getorderdetail`, { orderid: data }, { loading: false })
// 订单物流详情
apiOrderlogistics = data => httpGet(`/guideassistant/api/order/getorderlogistics`, data)
// 订单确认收货
apiOrderOrderreceiving = data => httpGet(`/guideassistant/api/order/orderreceiving`, data)
// 填写订单
apiOrderConfirm = data => httpGet(`/guideassistant/api/order/confirm`, data)
// 提交订单
apiOrderCommit = data => httpPost(`/guideassistant/api/order/commitorder`, data)
// 获取运费
apiOrderFreightinfo = data => httpPost(`/guideassistant/api/common/freightinfo`, data)
// 购物车结算获取运费
apiGetCheckoutFreight = data => httpPost(`/guideassistant/api/order/getcheckoutfreightinfo`, data)
// 门店兑换
apiOrderStorerewarddetail = data => httpPost(`/memberclub/api/v1/order/storerewarddetail`, { ordernumber: data })
// 查询订单状态
apiOrderOrderstatus = data =>
  httpGet(`/guideassistant/api/order/getorderstatus`, { ordernumber: data }, { loading: false })
// 发起支付订单
apiOrderPayorder = data => httpPost(`/guideassistant/api/order/payorder`, data)
// // 发放礼品
apiOrderhandler = data => httpGet(`/guideassistant/api/order/sendgift`, data)
// 付款成功的回调(临时)
apiOrderConfirmpay = data => {
  data.outTradeNo = data.outTradeNo.replace('MC_', 'SMP_')
  return httpPost(`/guideassistant/api/order/cancel`, data)
}
// 模板消息订阅
apiExpressTemplate = data => httpGet(`/guideassistant/api/commanage/getsubscribetemplateid`, data)
// 取消订单
apiCancalOrder = data => httpPost(`/guideassistant/api/order/cancel`, data)
// 附近适用门店列表
apiGetNearbyStoresList = data => httpPost(`/guideassistant/api/sales/getnearbystore`, data, { loading: true })
// 退款（门店核销订单退款）
apiRefundOrder = data => httpPost(`/guideassistant/api/order/refund`, data)

// 售后列表）
apiAfterSalesList = data => httpPost(`/guideassistant/api/order/aftersaleslist`, data)
// 申请售后
apiApplyAfterSales = data => httpPost(`/guideassistant/api/order/applyaftersales`, data)
// 取消售后
apiCancelAfterSales = data => httpPost(`/guideassistant/api/order/cancelaftersales`, data)
// 售后详情
apiAfterSalesDetail = data => httpGet(`/guideassistant/api/order/aftersalesdetail`, data)
// 售后退货
apiConfirmReturnPackage = data => httpPost(`/guideassistant/api/order/confirmreturnpackage`, data)
// 售后消息订阅模板
apiGetAfterSaleMsgTemplateId = data => httpGet(`/guideassistant/api/commanage/getsubscribetemplateid`, data)
// 添加消息订阅模板
apiAddSubscribemsgRecord = data => httpPost(`/guideassistant/api/commanage/addsubscribemsgrecord`, data)

// #endif

// #ifdef MP-MEMBER || MP-CLOUDSHOP
// 订单列表
apiOrders = data => httpPost('/memberclub/api/v1/order/orders', data, { isCommon: true })
// 查看订单详情
apiOrderdetail = data => httpGet(`/memberclub/api/v1/order/orderdetail/${data}`, {}, { loading: false, isCommon: true })
// 订单物流详情
apiOrderlogistics = data => httpGet(`/memberclub/api/v1/order/orderlogistics`, data, { isCommon: true })
// 订单确认收货
apiOrderOrderreceiving = data => httpGet(`/memberclub/api/v1/order/orderreceiving`, data, { isCommon: true })
// 填写订单
apiOrderConfirm = data => httpGet(`/memberclub/api/v1/order/confirm`, data, { isCommon: true })
// 提交订单
apiOrderCommit = data => httpPost(`/memberclub/api/v1/order/commit`, data, { isCommon: true })
// 获取运费
apiOrderFreightinfo = data => httpPost(`/memberclub/api/v1/common/freightinfo`, data, { isCommon: true })
// 门店兑换
apiOrderStorerewarddetail = data => httpPost(`/memberclub/api/v1/order/storerewarddetail`, data, { isCommon: true })
// 查询订单状态
apiOrderOrderstatus = data => httpGet(`/memberclub/api/v1/order/orderstatus/${data}`, {}, { isCommon: true })
// 发起支付订单
apiOrderPayorder = data => httpPost(`/memberclub/api/v1/order/payorder`, data, { isCommon: true })
//  发放礼品
apiOrderhandler = data => httpPost(`/memberclub/api/v1/orderhandler/sendgift`, data, { isCommon: true })
// 付款成功的回调(临时)
apiOrderConfirmpay = data => httpPost(`/memberclub/api/v1/order/confirmpay`, data, { isCommon: true })
// 模板消息订阅
apiExpressTemplate = data => httpPost(`/memberclub/api/v1/order/getsendpackagemsgtemplateid`, data, { isCommon: true })
// 查系统设置
apiGetModuleSetting = data => httpGet(`/decrationcenter/api/v1/decration/getmodulesetting`, data, { isCommon: true })
// 购物车结算获取运费
apiGetCheckoutFreight = data => httpPost(`/memberclub/api/v1/common/getcheckoutfreightinfo`, data, { isCommon: true })
// 取消订单
apiCancalOrder = data => httpPost(`/memberclub/api/v1/order/cancel`, data, { isCommon: true })
// 附近适用门店列表
apiGetNearbyStoresList = data =>
  httpPost(`/memberclub/api/v1/me/nearbystores/list`, data, { loading: true, isCommon: true })
// 退款（门店核销订单退款）
apiRefundOrder = data => httpPost(`/memberclub/api/v1/order/refund`, data, { loading: true, isCommon: true })
// 售后退货
apiConfirmReturnPackage = data =>
  httpPost(`/memberclub/api/v1/order/confirmreturnpackage`, data, { loading: true, isCommon: true })
// 申请售后
apiApplyAfterSales = data =>
  httpPost(`/memberclub/api/v1/order/applyaftersales`, data, { loading: true, isCommon: true })
// 取消售后
apiCancelAfterSales = data =>
  httpPost(`/memberclub/api/v1/order/cancelaftersales`, data, { loading: true, isCommon: true })
// 售后详情
apiAfterSalesDetail = data =>
  httpGet(`/memberclub/api/v1/order/aftersalesdetail`, data, { loading: true, isCommon: true })

// 售后列表
apiAfterSalesList = data => httpPost('/memberclub/api/v1/order/aftersaleslist', data, { isCommon: true })

// 售后消息订阅模板
apiGetAfterSaleMsgTemplateId = data =>
  httpGet('/memberclub/api/v1/order/getaftersalemsgtemplateid', data, { isCommon: true })
// 添加售后消息订阅模板
apiAddSubscribemsgRecord = data => httpPost('/memberclub/api/v1/order/subscribeaftersalesmsg', data, { isCommon: true })
// #endif

// #ifdef MP-RETAIL
// 订单列表
apiOrders = data => httpPost('order/orders', data)
// 查看订单详情
apiOrderdetail = data => httpGet(`order/orderdetail`, { orderid: data }, { loading: false })
// 订单物流详情
apiOrderlogistics = data => httpGet(`order/orderlogistics`, data)
// 订单确认收货
apiOrderOrderreceiving = data => httpGet(`order/orderreceiving`, data)
// 填写订单
apiOrderConfirm = data => httpGet(`order/confirm`, data)
// 获取运费
apiOrderFreightinfo = data => httpPost(`order/freightinfo`, data)
// 提交订单
apiOrderCommit = data => httpPost(`order/commit`, data)
// 查询订单状态
apiOrderOrderstatus = data => httpGet(`order/orderstatus`, { ordernumber: data }, { loading: false })
// 发起支付订单
apiOrderPayorder = data => httpPost(`order/payorder`, data)
// 付款成功的回调(临时)
apiOrderConfirmpay = data => httpPost(`order/confirmpay`, data)
// 附近适用门店列表
apiGetNearbyStoresList = data => httpPost(`store/getnearbystore`, data, { loading: true })
// 退款（门店核销订单退款）
apiRefundOrder = data => httpPost(`order/refund`, data)

// 售后列表）
apiAfterSalesList = data => httpPost(`order/aftersaleslist`, data)
// 售后退货
apiConfirmReturnPackage = data => httpPost(`order/confirmreturnpackage`, data)
// 取消售后
apiCancelAfterSales = data => httpPost(`order/cancelaftersales`, data)
// 售后详情
apiAfterSalesDetail = data => httpGet(`order/aftersalesdetail`, data)

// #endif

export {
  apiOrders,
  apiOrderdetail,
  apiOrderlogistics,
  apiOrderOrderreceiving,
  apiOrderConfirm,
  apiOrderCommit,
  apiOrderFreightinfo,
  apiGetCheckoutFreight,
  apiOrderStorerewarddetail,
  apiOrderOrderstatus,
  apiOrderPayorder,
  apiOrderhandler,
  apiOrderConfirmpay,
  apiExpressTemplate,
  apiGetModuleSetting,
  apiCancalOrder,
  apiGetNearbyStoresList,
  apiRefundOrder,
  apiApplyAfterSales,
  apiConfirmReturnPackage,
  apiAfterSalesDetail,
  apiCancelAfterSales,
  apiAfterSalesList,
  apiGetAfterSaleMsgTemplateId,
  apiAddSubscribemsgRecord
}
