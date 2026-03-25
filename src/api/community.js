import { httpPost, httpGet } from '@/utils/request'

export function apiGetTopicList(data) {
  return httpGet('ContentCommunity/GetTopicList', data, { isMkt: true })
}
export function apiGetContentCommunityList(data) {
  return httpPost('ContentCommunity/ContentCommunityList', data, { isMkt: true })
}
export function apiContentCommunityDetailList(data) {
  return httpPost('ContentCommunity/ContentCommunityDetailList', data, { isMkt: true })
}
export function apiContentCommunityDetail(data) {
  return httpPost('ContentCommunity/ContentCommunityDetail', data, { isMkt: true })
}
export function apiCreateContent(data) {
  return httpPost('ContentCommunity/CreateContent', data, { isMkt: true })
}
export function apiGetMyContent(data) {
  return httpPost('ContentCommunity/GetMyContent', data, { isMkt: true })
}
export function apiGetShareContent(data) {
  return httpGet('ContentCommunity/GetShareContent', data, { isMkt: true })
}
export function apiContentLikeit(data) {
  return httpPost('ContentCommunity/Likeit', data, { isMkt: true })
}
export function apiShareReward(data) {
  return httpPost('ContentCommunity/ShareReward', data, { isMkt: true })
}
export function apiDeleteContent(data) {
  return httpPost('ContentCommunity/DeleteContent', data, { isMkt: true })
}

export function apiHomeDecoration(data) {
  return httpGet('/decrationcenter/api/v1/Decration/HomeDetail', data, { isCommon: true })
}

export function apiGetMiniCode(data) {
  // #ifdef MP-CLOUDSHOP
  return httpGet('Store/GetMiniCode', data)
  // #endif
  // #ifdef MP-MEMBER
  // eslint-disable-next-line no-unreachable
  return httpGet('/memberclub/api/v1/common/getminicode', data)
  // #endif
}
