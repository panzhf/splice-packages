import { httpGet, httpPost, httpWrap } from '@/utils/request'
// #ifdef MP-MEMBER
// 质保相关接口（仅会员小程序 MP-MEMBER）
// 质保产品列表
export function apiGetWarrantyList(data) {
  return httpPost('Warranty/PageRegisterRecord', data, { isMkt: true, loading: true })
}

// 获取质保服务信息
export function apiGetWarrantyServiceInfo(data) {
  return httpGet('Warranty/GetServiceInfo', data, { isMkt: true })
}

// 获取登记信息
export function apiGetWarrantyRegistrationInfo(data) {
  return httpGet('Warranty/GetRegistrationInfo', data, { isMkt: true })
}

// 获取表单组件配置
export function apiGetWarrantyFormComponents(data) {
  return httpGet('Warranty/GetFormComponents', data, { isMkt: true, loading: true })
}

// 提交质保登记
export function apiSubmitWarranty(data) {
  return httpPost('Warranty/Submit', data, { isMkt: true, loading: true })
}

// 校验登记入口
export function apiValidateRegisterEntry(data) {
  return httpGet('Warranty/ValidateRegisterEntry', data, { isMkt: true, loading: true })
}

// 分页查询用户服务记录
export function apiPageUserServiceRecord(data) {
  return httpPost('Warranty/PageUserServiceRecord', data, { isMkt: true, loading: false })
}
// #endif
// #ifdef MP-RETAIL
// 售后换新相关接口（仅万能零售 MP-RETAIL，走 activemarketingapi） 
const httpPostRetail = (url, data, options = {}) => httpWrap({ url, data, type: 5, method: 'post', options })

/** 质保查询：根据 SN 码或质保码 ID 查询 */
export const apiQueryWarrantyByCode = (params, options = {}) => {
  return httpPostRetail('Warranty/QueryWarrantyByCode', params, { loading: true, ...options })
}

/** 门店补登记提交（SupplyRegister） */
export const apiSupplementRegister = (data, options = {}) => {
  return httpPostRetail('Warranty/SupplyRegister', data, { loading: true, ...options })
}

/** 新产品校验（换新操作页） */
export const apiValidateNewProduct = (data, options = {}) => {
  return httpPostRetail('Warranty/ValidateNewProduct', data, { loading: true, ...options })
}

/** 执行换新 */
export const apiExecuteExchange = (data, options = {}) => {
  return httpPostRetail('Warranty/ExecuteExchange', data, { loading: true, ...options })
}

/** 分页查询门店换新记录 */
export const apiPageStoreExchangeRecord = (data, options = {}) => {
  return httpPostRetail('Warranty/PageStoreExchangeRecord', data, { loading: true, ...options })
}
// #endif
