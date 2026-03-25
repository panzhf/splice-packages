import { httpPost, httpGet } from '@/utils/request'
export const apiGetRegisterInfo = data => {
  return httpPost('/memberclub/api/v1/store/GetRegisterInfoByMAndD', data)
}
export function apiGetStoreRegisterMobile(data) {
  return httpPost('/memberclub/api/v1/store/GetStoreRegisterMobile', data)
}
export const apiGetStoreDealer = data => httpPost('/memberclub/api/v1/store/GetRegisterDealerList', data) // 6 获取所属经销商列表
export const apiGetStoreTypes = data => httpGet('/memberclub/api/v1/store/GetStoreTypes', data) // 9 获取门店类型
export const apiGetShopSizes = data => httpGet('/memberclub/api/v1/store/GetShopSizes', data) // 获取面积
export const apiNoAuthCode = data => httpPost('/memberclub/api/v1/store/GetAuth', data) // 普通获取验证码
// 添加门店与经销商关联关系
export const apiRelate = data => httpPost('/memberclub/api/v1/store/AddRelationDealer', data)

// 检查门店是否可以关联经销商
export const apiCheckRelation = data => httpPost('/memberclub/api/v1/store/CheckRelationDealer', data)
export const apiValidateCode = data => httpPost('/memberclub/api/v1/store/ValidateSMSCode', data) // 核对短信验证码
export const apiSubmitRegister = data =>
  httpPost('/memberclub/api/v1/store/StoreRegister', data, { loading: true, requireAuth: false }) // 8 门店提交注册

/** 注册页装修 Decration/StoreRegisterPage */
export const apiRegisterPage = data =>
  httpGet('/decrationcenter/api/v1/Decration/StoreRegisterPage', data, { requireAuth: false, loading: false })
