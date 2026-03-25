// #ifndef MP-SALE
import { httpGet, httpPost, httpWrap } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpGet as requestGet } from '@/utils/big-request'
// #endif

// 获取微信配置
export function apiGetwxdata(data) {
  return httpGet('WX/Getwxdata', data, { isMkt: true, loading: false })
}

// 获取公众号关注
export function apiGetCustomerType(data) {
  return httpGet('Act/GetCustomerType', data, { isMkt: true, loading: false })
}

let apiGetMpInfo, apiGetBackWardsLocation
// 查看品牌商小程序授权信息
// #ifdef H5
apiGetMpInfo = data => httpPost('/SaoMa/GetMPInfo', data, { isMkt: true, loading: false })
// #endif
// #ifdef H5
apiGetBackWardsLocation = data => httpGet('commanage/getlocation', data)
// #endif
// #ifdef H5-ACT
// h5-act 地址逆解析使用 /api/Common/GetLocationinfo
apiGetBackWardsLocation = data => httpPost('Common/GetLocationinfo', data, { isMkt: true })
// #endif
// #ifdef MP-WEIXIN
// #ifdef MP-RETAIL
apiGetMpInfo = data => httpWrap({ url: 'Common/GetMPInfo', data, type: 5, method: 'post', options: { loading: false } })
// #endif
// #ifndef MP-RETAIL
apiGetMpInfo = data => httpPost('Common/GetMPInfo', data, { isMkt: true, loading: false })
// #endif
// #endif

// #ifdef MP-MEMBER
apiGetBackWardsLocation = data => httpGet('/memberclub/api/v1/common/getBackwardsLocation', data)
// #endif
// #ifdef MP-RETAIL
apiGetBackWardsLocation = data => httpGet('commanage/getlocation', data)
// #endif
// #ifdef MP-SALE
apiGetBackWardsLocation = data =>
  requestGet({ url: 'retailassistant/api/commanage/getlocation', data, options: { isBase: 'all' } })
// #endif
// #ifdef MP-CLOUDSHOP
apiGetBackWardsLocation = data =>
  httpGet(`Store/GetBackwardsLocation`, {
    lat: data.latitude,
    lng: data.longitude
  })
// #endif
export { apiGetMpInfo, apiGetBackWardsLocation }
