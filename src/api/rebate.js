import { httpPost, httpGet } from '@/utils/request'
// 用于小程序将自增长的活动ID转成GUID格式的主键ID
export function apiGetActID(data) {
  return httpGet(`OCR/GetActID`, data, { isMkt: true })
}

// 活动详情
export function apiGetActivity(data) {
  return httpGet(`OCR/GetActivity`, data, { isMkt: true })
}
// 添加上传记录
export function apiAddRecord(data) {
  return httpPost(`OCR/AddUploadRecords`, data, { isMkt: true })
}
// 查询订阅模板
export function apiGetSubscribeTemplateId(data) {
  return httpGet(`OCR/GetSubscribeTemplateId`, data, { isMkt: true })
}
// 查询记录列表
export function apiGetRecordList(data) {
  return httpGet(`OCR/GetUploadRecords`, data, { isMkt: true })
}
// 获取活动的奖项列表
export function apiGetActivityPrizes(data) {
  return httpGet(`OCR/GetActivityPrizes`, data, { isMkt: true })
}
// 获取图片
export function apiGetWxImg(data) {
  return httpPost(`image/GetImageByMediaId`, data, { isMkt: true })
}
// 获奖记录轮播
export function apiGetActivityAwardRecords(data) {
  return httpGet(`OCR/GetActivityAwardRecords`, data, { isMkt: true })
}
// 添加订阅
export function apiAddSubscribeRecord(data) {
  return httpGet(`OCR/AddSubscribeRecord`, data, { isMkt: true })
}
