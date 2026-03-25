import {
  httpPost,
  // #ifdef H5
  httpGet
  // #endif
} from '@/utils/request'

let apiScanSourceCodeWriteOff, // 源码核销
  apiSaveStore, // 保存已选门店
  apiGetStoreSSOToken // 获取门店SSO Token
// #ifdef MP-WEIXIN
apiScanSourceCodeWriteOff = data =>
  httpPost('/memberclub/api/v1/WriteOff/scansourcecodewriteoff', data, { loading: true })
// apiSaveStore = data => httpPost('/memberclub/api/v1/WriteOff/savenyuanstoreselection', data)
apiGetStoreSSOToken = data => httpPost('/memberclub/api/v1/ScanCode/getstoressotoken', data)
// #endif
// #ifdef H5
apiScanSourceCodeWriteOff = data => httpPost('/WriteOff/ScanSourceCodeWriteOff', data)
// apiSaveStore = data => httpPost('/WriteOff/SaveNYuanStoreSelection', data)
apiGetStoreSSOToken = data => httpPost('/SaoMa/GetStoreSSOToken', data, { loading: false })

export const apiGetBrandInfo = data => httpGet('/SaoMa/GetMpBasicSetting', data, { loading: false })
export const apiGetMiniProgramSpecialInfo = data =>
  httpGet('/SaoMa/GetMiniProgramSpecialInfo', data, { loading: false })
// #endif
export { apiScanSourceCodeWriteOff, apiSaveStore, apiGetStoreSSOToken }
