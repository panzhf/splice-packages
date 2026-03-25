import { httpGet, httpPost } from '@/utils/request'

// 获取活动详细信息
export function apiGetActivity(data) {
  return httpGet('Act/GetActivityInfo', data, { isMkt: true })
}
// 用于小程序将自增长的活动ID转成GUID格式的主键ID
export function apiGetActID(data) {
  return httpGet(`Act/GetActID`, data, { isMkt: true })
}
// 抽奖
export function apiGetPrize(data, options) {
  return httpGet(`Act/GetActivityPrize`, data, { isMkt: true, skipAuth: true, ...options })
}

// 获取版权链接
export function apiGetMenuList(data) {
  return httpGet('Act/GetMenuList', data, { isMkt: true, loading: false })
}

/* 拍一拍 */
// 兑换参与机会
export function apiWinChance(data) {
  return httpGet('Act/WinActivityChance', data, { isMkt: true, loading: true })
}
// 兑换参与机会
export function apiGetPointAmount(data) {
  return httpGet('Act/GetPointAmount', data, { isMkt: true })
}
// 已获得奖品列表
export function apiGetMyPoolPrize(data) {
  return httpGet('Act/GetMyPoolPrize', data, { isMkt: true })
}

/* #ifdef H5 */
// 获取第三方小程序的appid百雀羚
export function apiGetBaiQueLingMini(data) {
  return httpPost('Common/GetBaiQueLingMini', data, { isMkt: true, loading: false })
}
/* #endif */
