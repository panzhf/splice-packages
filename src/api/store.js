// #ifdef MP-MEMBER
import { httpPost, httpGet } from '@/utils/request'
// #endif
// #ifdef MP-RETAIL
import { httpPost as retailPost, httpGet as retailGet } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpPost as salePost, httpGet as saleGet } from '@/utils/big-request'
// #endif
// #ifdef MP-DISTRIBUTION
import { httpGet as distributionGet, httpPost as distributionPost } from '@/utils/request'
// #endif

let apiGetShopSizes,
  apiGetStoreDealer,
  apiGetStoreTypes,
  apiGetRegisterInfo,
  apiValidateCode,
  apiCheckMobile,
  apiGetStoreDetail,
  apiGetDealerTypes,
  apiStoreAuthentication

// #ifdef MP-MEMBER
apiGetShopSizes = data => httpGet('/memberclub/api/v1/store/GetShopSizes', data) // 1 获取面积
apiGetStoreTypes = data => httpGet('/memberclub/api/v1/store/GetStoreTypes', data) // 2 获取门店类型
apiGetStoreDealer = data => httpPost('/memberclub/api/v1/store/GetRegisterDealerList', data) // 3 获取所属经销商列表
apiStoreAuthentication = data => httpPost('/memberclub/api/v1/store/StoreAuthentication', data) // 门店身份判断&日志记录接口
// #endif

// #ifdef MP-RETAIL
apiGetRegisterInfo = (data, loading = true) =>
  retailPost('retailcommon/getregisterinfobymandd', data, { requireAuth: false, loading }) // 1 根据品牌商和经销商id获取注册信息
apiGetShopSizes = data => retailGet('commanage/getshopsizes', data, { requireAuth: false }) // 2 门店面积
apiGetStoreTypes = data => retailGet('commanage/getstoretypes', data, { loading: true, requireAuth: false }) // 3 获取门店类型
apiGetStoreDealer = data => retailPost('commanage/getregisterdealerlist', data, { loading: true, requireAuth: false }) // 4 获取所属经销商列表
apiValidateCode = data => retailPost('retailcommon/validatesmscode', data, { requireAuth: false }) // 5 核对短信验证码
apiGetStoreDetail = (data, loading = true) =>
  retailPost('retailcommon/getstoreinfo  ', data, { requireAuth: false, loading }) //  6 获取门店信息
// #endif

// #ifdef MP-SALE
apiGetRegisterInfo = data =>
  salePost({ url: 'storemanage/getregisterinfobymandd', data, options: { resolveData: 'all' } }) // 1 获取邀请注册门店字段
apiGetShopSizes = data =>
  saleGet({
    url: `storemanage/getshopsizes?js_code=${data.js_code}`,
    options: { resolveData: 'all' }
  }) // 2 门店面积
apiGetStoreTypes = data =>
  saleGet({
    url: `storemanage/getstoretypes?memberlogin=${data.memberlogin}&js_code=${data.js_code}`,
    options: { resolveData: 'all' }
  }) // 3 获取门店类型
apiGetStoreDealer = data =>
  salePost({ url: 'storemanage/getregisterdealerlist', data, options: { resolveData: 'all' } }) // 4 获取所属经销商列表
apiCheckMobile = data =>
  saleGet({
    url: `storemanage/checkmobilebyassistant?m=${data.m}&mobile=${data.mobile}&dealerid=${data.dealerid}`,
    options: { resolveData: 'all', loading: false }
  }) // 5 检查注册手机号
// #endif

// #ifdef MP-DISTRIBUTION
apiGetRegisterInfo = data => distributionPost('storemanage/getregisterinfobymandd', data) // 1 获取经销商邀请注册门店字段
apiGetShopSizes = data => distributionGet('storemanage/getshopsizes', data) // 2 获取面积
apiGetStoreTypes = data => distributionGet('storemanage/getstoretypes', data) // 3 获取门店类型
apiCheckMobile = data => distributionGet('storemanage/checkmobilebyassistant', data, { loading: false }) // 5 检查注册手机号
apiGetDealerTypes = data => distributionGet('commanage/getdealertypes', data, { requireAuth: false }) // 3 获取经销商类型列表
// #endif

export {
  apiGetShopSizes,
  apiGetStoreDealer,
  apiGetStoreTypes,
  apiGetRegisterInfo,
  apiValidateCode,
  apiCheckMobile,
  apiGetStoreDetail,
  apiGetDealerTypes,
  apiStoreAuthentication
}
