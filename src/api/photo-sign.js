import { httpPost, httpGet } from '@/utils/request'

// 装修组件打卡统计
export function apiGetStatistic(data) {
  return httpGet('Sign/GetStatisticByOpenId', data, { isMkt: true })
}
// 获取活动详细信息
export function apiGetActivity(data) {
  return httpGet('Sign/GetSignActInfo', data, { isMkt: true })
}
// 用于小程序将自增长的活动ID转成GUID格式的主键ID
export function apiGetActID(data) {
  return httpGet(`Sign/GetActID`, data, { isMkt: true })
}
// 已打卡信息
export function apiGetSigned(data) {
  return httpGet(`Sign/GetSign`, data, { isMkt: true })
}
// 当天已打卡图片
export function apiGetSignedImg(data) {
  return httpGet(`Sign/GetSignDateImage`, data, { isMkt: true })
}
// 打卡
export function apiSetSign(data) {
  return httpGet(`Sign/SetSign`, data, { isMkt: true })
}
// 打卡记录
export function apiGetRecord(data) {
  return httpGet(`Sign/GetUserSignRecordList`, data, { isMkt: true })
}
// 已获奖品
export function apiGetMyPrize(data) {
  return httpGet(`Sign/GetUserSignAwardRecordList`, data, { isMkt: true })
}
// 排行榜
export function apiGetRank(data) {
  return httpGet(`Sign/GetUserSignRangeList`, data, { isMkt: true })
}

// 是否开启打卡日记
export function apiHasDiary(data) {
  return httpGet(`Sign/GetActivity`, data, { isMkt: true })
}
// 打卡日记
export function apiGetDiaries(data) {
  return httpGet(`Sign/GetAllUserSignRecordList`, data, { isMkt: true, loading: true })
}
// 打卡日记详情
export function apiGetDiaryDetail(data) {
  return httpGet(`Sign/GetUserSignRecord`, data, { isMkt: true })
}
// 新版打卡
export function apiSetNewSign(data) {
  return httpPost(`Sign/NewSetSign`, data, { isMkt: true })
}
// 点赞
export function apiLikeit(data) {
  return httpPost(`Sign/Likeit`, data, { isMkt: true })
}
