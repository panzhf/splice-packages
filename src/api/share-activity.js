import { httpPost, httpGet } from '@/utils/request'

// 活动详情
export function apiGetShareInfo(data) {
  return httpGet(`Share/GetShareInfo`, data, { isMkt: true })
}

// 助力明细
export function apiGetShareRecords(data) {
  return httpGet(`Share/GetShareRecords`, data, { isMkt: true, loading: true })
}

// 获取分享链接
export function apiGetShareAwardLink(data) {
  return httpGet(`Share/GetShareAwardLink`, data, { isMkt: true })
}

// 助力
export function apiAssistant(data) {
  return httpPost(`Share/Share`, data, { isMkt: true })
}

// 数据统计
export function apiGetShareAwardStat(data) {
  return httpGet(`Share/GetShareAwardStat`, data, { isMkt: true })
}
