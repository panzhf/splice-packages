import { httpPost, httpGet } from '@/utils/request'

// 用于小程序将自增长的活动ID转成GUID格式的主键ID
export function apiGetActID(data) {
  return httpGet(`Competition/GetActID`, data, { isMkt: true })
}

// 活动详情
export function apiGetActivity(data) {
  return httpGet(`Competition/GetActivity`, data, { isMkt: true })
}

// 获取活动累计金额
export function apiGetAcivityParticipationStat(data) {
  return httpGet(`Competition/GetAcivityParticipationStat`, data, { isMkt: true })
}

// 获取活动详细记录
export function apiGetActivityGuessingRecord(data) {
  return httpGet('Competition/GetBetRecord', data, { isMkt: true, loading: true })
}
// 已获得奖品列表
export const apiGetMyGuessing = data => httpGet('Competition/GetMyPoolPrize', data, { isMkt: true, loading: true })
// 获取比赛日期
export const apiGetGetMatchTime = data => httpGet('Competition/GetMatchTime', data, { isMkt: true })
// 获取比赛列表
export const apiGetMatchStatistics = data => httpPost(`Competition/GetMatchStatistics`, data, { isMkt: true })

// 竞猜
export const apiMatchBeRanks = data => httpPost(`Competition/BeRanks`, data, { isMkt: true, loading: true })
// 开奖提醒
export const apiAddSubscribeRecord = data => httpGet(`Competition/AddSubscribeRecord`, data, { isMkt: true })
// 获取中奖信息
export const apiGetIsAwardNotice = data =>
  httpGet(`Competition/GetIsAwardNotice`, data, { isMkt: true, skipExpire: true })
