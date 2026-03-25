// #ifdef MP-RETAIL
import { httpWrap } from '@/utils/request'
const httpGet = (url, data) => httpWrap({ url, data, type: 5, method: 'get' })
const httpPost = (url, data) => httpWrap({ url, data, type: 5, method: 'post' })
// #endif
// #ifdef MP-SALE
import { httpWrap as request } from '@/utils/big-request'
const requestGet = (url, data) => request({ url, data, type: 5, method: 'get' })
const requestPost = (url, data) => request({ url, data, type: 5, method: 'post' })
// #endif

let apiActivityDetail, // 活动详情
  apiOrderList, // 订单列表
  apiOrderDetail, // 订单详情
  apiActivitySetting, // 团购设置
  apiGetWaitOrder, // 待提交订单
  apiApply, // 报名提交
  apiEditOrder, // 编辑订单
  apiDeleteOrder, // 删除订单
  apiIsCanApply, // 是否符合报名要求
  apiDeliveryOrder, // 送货登记
  apiDeliveryStatistics, // 登记统计
  apiDeliveryList, // 送货登记列表
  apiReturnOrder, // 退货登记
  apiReturnStatistics, // 退货登记统计
  apiReturnList, // 退货登记列表
  apiCancelOrder, // 取消订单
  apiDeliveryOrderBack // 送货登记-错误回退

// #ifdef MP-RETAIL
apiActivityDetail = data => httpGet('GroupBuy/GetActivity', data) // 活动详情
apiActivitySetting = data => httpGet('GroupBuy/GetSetting', data)
apiOrderList = data => httpPost('GroupBuy/Orders', data)
apiOrderDetail = data => httpPost('GroupBuy/OrderDetail', data)
apiGetWaitOrder = data => httpPost('GroupBuy/GetWaitSubmitOrder', data)
apiApply = data => httpPost('GroupBuy/SubmitOrder', data)
apiEditOrder = data => httpPost('GroupBuy/EditOrder', data) // 编辑订单
apiDeleteOrder = data => httpPost('GroupBuy/DeleteOrder', data) // 删除订单
apiIsCanApply = data => httpPost('GroupBuy/IsCanApplyFor', data)
apiDeliveryOrder = data => httpPost('GroupBuy/DeliveryOrder', data)
apiDeliveryStatistics = data => httpPost('GroupBuy/OrderDeliveryStat', data)
apiDeliveryList = data => httpPost('GroupBuy/OrderDeliveryList', data)
apiReturnOrder = data => httpPost('GroupBuy/ReturnedOrder', data)
apiReturnStatistics = data => httpPost('GroupBuy/OrderReturnedStat', data)
apiReturnList = data => httpPost('GroupBuy/OrderReturnedList', data)
apiCancelOrder = data => httpPost('GroupBuy/CancelOrder', data)
apiDeliveryOrderBack = data => httpPost('GroupBuy/DeliveryOrderBack', data)

export const apiAwardRecord = data => httpPost('GroupBuy/PageAwardRecord', data) // 奖品记录
// #endif

// #ifdef MP-SALE
apiActivityDetail = data => requestGet('GroupBuy/GetActivity', data)
apiActivitySetting = data => requestGet('GroupBuy/GetSetting', data)
apiOrderList = data => requestPost('GroupBuy/Orders', data)
apiOrderDetail = data => requestPost('GroupBuy/OrderDetail', data)
apiGetWaitOrder = data => requestPost('GroupBuy/GetWaitSubmitOrder', data)
apiApply = data => requestPost('GroupBuy/SubmitOrder', data)
apiEditOrder = data => requestPost('GroupBuy/EditOrder', data) // 编辑订单
apiDeleteOrder = data => requestPost('GroupBuy/DeleteOrder', data) // 删除订单
apiIsCanApply = data => requestPost('GroupBuy/IsCanApplyFor', data)
apiDeliveryOrder = data => requestPost('GroupBuy/DeliveryOrder', data)
apiDeliveryStatistics = data => requestPost('GroupBuy/OrderDeliveryStat', data)
apiDeliveryList = data => requestPost('GroupBuy/OrderDeliveryList', data)
apiReturnOrder = data => requestPost('GroupBuy/ReturnedOrder', data)
apiReturnStatistics = data => requestPost('GroupBuy/OrderReturnedStat', data)
apiReturnList = data => requestPost('GroupBuy/OrderReturnedList', data)
apiCancelOrder = data => requestPost('GroupBuy/CancelOrder', data)
apiDeliveryOrderBack = data => requestPost('GroupBuy/DeliveryOrderBack', data)

export const apiCheckOrder = data => requestPost('GroupBuy/CheckOrder', data) // 审核订单
export const apiFinishOrder = data => requestPost('GroupBuy/FinishOrder', data) // 手动结单

export const apiGetActivities = data => requestPost('outact/getexchangeactivityInfo', data) // 活动列表
// #endif

export {
  apiActivityDetail,
  apiOrderList,
  apiOrderDetail,
  apiActivitySetting,
  apiGetWaitOrder,
  apiApply,
  apiEditOrder,
  apiDeleteOrder,
  apiIsCanApply,
  apiDeliveryOrder,
  apiDeliveryStatistics,
  apiDeliveryList,
  apiReturnOrder,
  apiReturnStatistics,
  apiReturnList,
  apiCancelOrder,
  apiDeliveryOrderBack
}
