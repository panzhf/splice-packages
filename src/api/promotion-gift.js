import { httpWrap, httpPost } from '@/utils/request'
const httpGet = (url, data) => httpWrap({ url, data, type: 5, method: 'get' })
const httpPostWrap = (url, data) => httpWrap({ url, data, type: 5, method: 'post' })

// 活动详情
export const apiActivityDetail = data => {
  return httpGet('ClerkPromotionGift/GetActivityDetail', data)
}

// 店员扫码登记
export const apiRegisterPromotion = data => {
  return httpPost('writeoff/registerpromotion', data)
}

// 分页获取我的登记记录
export const apiPagePromotionRecords = data => {
  return httpPostWrap('ClerkPromotionGift/PagePromotionRecords', data)
}

// 分页获取我的奖励记录
export const apiPageAwardRecords = data => {
  return httpPostWrap('ClerkPromotionGift/PageAwardRecords', data)
}
