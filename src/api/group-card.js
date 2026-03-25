import { httpPost, httpGet } from '@/utils/request'
export const apiGetPageJoinRecord = data => {
  return httpPost('CollectCardGift/PageJoinRecord', data, { loading: true, isMkt: true })
}
export const apiGetCardactivity = data => {
  return httpGet('CollectCardGift/GetActInfo', data, { loading: true, isMkt: true })
}
export const apiGetUserJoinData = data => {
  return httpGet('CollectCardGift/GetUserJoinData', data, { loading: true, isMkt: true })
}
export const apiCollectCardDrawCard = data => {
  // 抽卡
  return httpPost('CollectCardGift/DrawCard', data, { loading: true, isMkt: true })
}
export const apiGetActStatisticsData = data => {
  // 抽卡
  return httpGet('CollectCardGift/GetActStatisticsData', data, { loading: true, isMkt: true })
}
export const apiExchangePrize = data => {
  // 抽奖
  return httpPost('CollectCardGift/ExchangePrize', data, { loading: true, isMkt: true })
}
export const apiGetPageCardAwardRecord = data => {
  // 抽奖
  return httpPost('CollectCardGift/PageAwardRecord', data, { loading: true, isMkt: true })
}
