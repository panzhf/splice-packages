// #ifdef MP-RETAIL
import { httpPost, httpGet } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpPost as requestPost, httpGet as requestGet } from '@/utils/big-request'
// #endif

let apiOrderAppeal, apiGetAppealRecord

// #ifdef MP-RETAIL
export function apiBanquetGetactivity(data) {
  return httpPost(`activitymanage/banquet/getactivity`, data)
}
export function apiBanquetIscanApplyfor(data) {
  return httpPost(`activitymanage/banquet/iscanapplyfor`, data)
}
export function apiBanquetGetDictionnaryList(data) {
  return httpGet(`activitymanage/banquet/getdictionnary`, data)
}
export function apiBanquetApply(data) {
  return httpPost(`activitymanage/banquet/apply`, data)
}
export function apiBanquetOrders(data) {
  return httpPost(`activitymanage/banquet/orders`, data) // 订单记录
}
export function apiBanquetOrderDetail(data) {
  return httpPost(`activitymanage/banquet/orderdetail`, data) // 订单详情
}
export function apiBanquetOrderPhoto(data) {
  return httpPost(`activitymanage/banquet/saveorderpictures`, data) // 上传订单图片
}
export function apiBanquetOrderDeliverystat(data) {
  return httpPost(`activitymanage/banquet/orderdeliverystat`, data) // 送货登记数据查询
}
export function apiBanquetFinishorder(data) {
  return httpPost(`activitymanage/banquet/finishorder`, data) // 结单
}
export function apiDeliveryorder(data) {
  return httpPost(`activitymanage/banquet/deliveryorder`, data) // 出货
}
export function apiReturnedorder(data) {
  return httpPost(`activitymanage/banquet/returnedorder`, data) // 退货
}
export function apiGetorderdeliverystat(data) {
  return httpPost(`activitymanage/banquet/orderdeliverystat`, data) //获取送货记录明细
}
export function apiGetorderreturnedstat(data) {
  return httpPost(`activitymanage/banquet/orderreturnedstat`, data) //获取退货记录明细
}
export function apiGetObtaiNedAward(data) {
  return httpPost(`activitymanage/banquet/getobtainedaward`, data) //已获奖品列表
}
export function apiOrderDeliveryList(data) {
  return httpPost(`activitymanage/banquet/orderdeliverylist`, data) //送货记录
}
export function apiOrderReturnEdList(data) {
  return httpPost(`activitymanage/banquet/orderreturnedlist`, data) //退货记录
}
export function apiBanquetUpdateOrder(data) {
  return httpPost(`activitymanage/banquet/updateorder`, data) // 编辑订单
}
export function apiBanquetOrdersMenu(data) {
  return httpPost(`activitymanage/banquet/getbanquetsetting`, data) // 配置查询
}
export function apiBanquetDeleteOrder(data) {
  return httpPost(`activitymanage/banquet/deleteorder`, data) // 删除订单
}

apiOrderAppeal = data => httpPost('activitymanage/banquet/orderappeal', data) // 订单申诉
apiGetAppealRecord = data => httpPost('activitymanage/banquet/getbanquetappealrecord', data) // 获取申诉记录
// #endif

// #ifdef MP-SALE
apiOrderAppeal = data =>
  requestPost({ url: 'activitymanage/banquet/orderappeal', data, options: { resolveData: 'all' } }) // 订单申诉
apiGetAppealRecord = data =>
  requestPost({ url: 'activitymanage/banquet/getbanquetappealrecord', data, options: { resolveData: 'all' } }) // 获取申诉记录
export const apiOrderAppealCheck = data =>
  requestPost({ url: 'activitymanage/banquet/orderappealcheck', data, options: { resolveData: 'all' } }) // 申诉审核
export const apiBanquetOrdersMenu = data =>
  requestPost({ url: 'activitymanage/banquet/getbanquetsetting', data, options: { resolveData: 'all' } }) // 宴席配置（是否显示菜单等）
// #endif

export { apiOrderAppeal, apiGetAppealRecord }
