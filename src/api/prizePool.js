import { httpPost, httpGet } from '@/utils/request'

// 获取活动详细信息
export function apiGetActivity(data) {
  return httpGet('PrizePool/GetActivity', data, { isMkt: true })
}

// 获取活动当前的参与统计， 总统计和个人统计
export function apiGetAcivityParticipationCount(data) {
  return httpGet('PrizePool/GetAcivityParticipationCount', data, { isMkt: true })
}

// 获取活动当前的中奖名单
export function apiGetActivityAwardRecords(data) {
  return httpGet('PrizePool/GetActivityAwardRecords', data, { isMkt: true })
}

// 获取活动当前的参与统计，总统计和个人统计
export function apiGetPeriodAwardStatistics(data) {
  return httpGet('PrizePool/GetPeriodAwardStatistics', data, { isMkt: true })
}

// 用户积分余额
export function apiGetPointAmount(data) {
  return httpGet('PrizePool/GetPointAmount', data, { isMkt: true })
}

// 积分兑换
export function apiWinActivityChanceByPoint(aid, data, options) {
  return httpPost(`PrizePool/WinActivityChanceByPoint?aid=${aid}`, data, { isMkt: true, ...options })
}

// 获取时效派发二维码
export function apiGetChanceQrCode(data) {
  return httpGet('PrizePool/GetChanceQrCode', data, { isMkt: true })
}

// 扫码获取时效派发参与机会
export function apiWinActivityChanceByQrCode(aid, tempKey, data) {
  return httpPost(`PrizePool/WinActivityChanceByQrCode?aid=${aid}&tempKey=${tempKey}`, data, { isMkt: true })
}

// 首次中奖提示
export function apiGetFirstAwardTipsByAwardId(data) {
  return httpGet('PrizePool/GetFirstAwardTipsByAwardId', data, { isMkt: true })
}

// 首次中奖提示
export function apiGetShowPoolPrize(data) {
  return httpGet('PrizePool/GetShowPoolPrize', data, { isMkt: true })
}

// 用于小程序将自增长的活动ID转成GUID格式的主键ID
export function apiGetActID(data) {
  return httpGet(`PrizePool/GetActID`, data, { isMkt: true })
}

// 查询商户的订阅小程序模板ID
export function apiGetSubscribeTemplateId(data) {
  return httpGet('PrizePool/GetSubscribeTemplateId', data, { isMkt: true })
}

// 获取订阅授权成功后调用回写
export function apiAddSubscribeRecord(data, options) {
  return httpGet('PrizePool/AddSubscribeRecord', data, { isMkt: true, ...options })
}

// 判断抽奖机会是否有增加
export function apiGetActChanceIsNew(data, options) {
  return httpGet('PrizePool/GetActChanceIsNew', data, { isMkt: true, ...options })
}

/* 集拼图 start */
// 已获得奖品列表
export const apiGetMyPoolPrize = data => httpGet('PrizePool/GetMyPoolPrize', data, { isMkt: true })
// 当前分期奖池奖品
export const apiGetJigsawpuzzlePrize = data =>
  httpGet('PrizePool/GetJigsawpuzzlePrize', data, { isMkt: true, loading: false })
// 瓜分奖池结果
export const apiGetIsAwardNotice = data =>
  httpGet('PrizePool/GetIsAwardNotice', data, { isMkt: true, loading: false, skipExpire: true })
// 地理位置回传
export const apiSetLocation = data => httpPost('PrizePool/SetJoinAddress', data, { isMkt: true, loading: false })
/* 集拼图 end */
