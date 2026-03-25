import { httpPost, httpGet } from '@/utils/request' // 提领券列表
export const apiGetBringCouponList = data =>
  httpPost('/memberclub/api/v1/me/pickuplist', data, { loading: true, isCommon: true })
// 提领券详情
export const apiGetBringCouponDetail = (data, loading = true) =>
  httpGet(`/memberclub/api/v1/me/pickup/${data.id}`, {}, { loading: loading, isCommon: true })
// 提领券检验
export const apiGetBringCouponCheck = data =>
  httpGet(`/memberclub/api/v1/me/pickup/checkresult`, data, { isCommon: true })
// 获取第三方卡券详情
export const apiGetThirdCardDetail = data =>
  httpPost('/memberclub/api/v1/me/getthirdcarddetail', data, { isCommon: true })
// 提领券检验确认
export const apiGetBringCheckConfirm = data =>
  httpPost(`/memberclub/api/v1/me/pickup/confirm`, data, { isCommon: true })
// 提领券检验核销
export const apiGetBringCheckCheck = data => httpPost(`/memberclub/api/v1/me/pickup/writeoff`, data, { isCommon: true })
// 附近适用门店列表
export const apiGetNearbyStoresList = data =>
  httpPost(`/memberclub/api/v1/me/nearbystores/list`, data, { loading: true, isCommon: true })
// 附近适用门店详情
export const apiGetNearbyStoresDetail = data =>
  httpPost(`/memberclub/api/v1/me/nearbystores/detail`, data, { isCommon: true })
// 附近适用门店装修页
export const apiGetNearbyStores = data => httpPost(`/memberclub/api/v1/me/nearbystores`, data, { isCommon: true })
// 获取提领券多张生成核销码
export const apiConfirmList = data => httpPost(`/memberclub/api/v1/me/pickup/confirmList`, data, { isCommon: true })
// 轮询已核销提领券
export const apiCheckresultlist = data =>
  httpPost(`/memberclub/api/v1/me/pickup/checkresultlist`, data, { isCommon: true })
// 查询code码
export const apiGetCodeImg = data => httpGet(`/memberclub/api/v1/common/GetQrCode`, data, { isCommon: true })
