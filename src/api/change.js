import { httpPost, httpGet } from '@/utils/request'
// #ifdef MP-SALE
import { httpPost as requestPost, httpWrap } from '@/utils/big-request'
// #endif
// #ifdef MP-RETAIL
import { httpWrap } from '@/utils/request'
// #endif
let apiGetExchange, apiExchangeList, apiWithdrawList, apiGetWithdrawDetail, apiWithdraw, apiWithdrawOpenid, apiNewWithdraw
// #ifdef MP-MEMBER || MP-CLOUDSHOP
apiGetExchange = data => httpGet('/memberclub/api/v1/me/exchange', data, { isCommon: true })
apiExchangeList = data => httpPost(`/memberclub/api/v1/me/exchangelist`, data, { isCommon: true })
apiWithdrawList = data => httpPost(`/memberclub/api/v1/me/withdrawlist`, data, { isCommon: true })
apiGetWithdrawDetail = data => httpGet(`/memberclub/api/v1/me/withdrawdetail/${data.id}`, {}, { isCommon: true })
apiWithdraw = data => httpPost(`/memberclub/api/v1/me/withdraw`, data, { isCommon: true })
apiWithdrawOpenid = data => httpPost(`/memberclub/api/v1/me/bindwithdrawopenid`, data, { isCommon: true })
apiNewWithdraw = data => httpPost(`/memberclub/api/v1/me/newwithdraw`, data, { isCommon: true })
// #endif

// #ifdef MP-RETAIL
// 首页
apiGetExchange = data => httpGet(`storemanage/getloosechange?js_code=${data.js_code}`, data)
// 零钱收支明细
apiExchangeList = data => httpPost(`storemanage/getexchangelist`, data)
// 提现记录
apiWithdrawList = data => httpPost(`storemanage/getwithdrawrecord`, data)
// 提现记录详情
apiGetWithdrawDetail = data => httpPost(`storemanage/getwithdrawdetail`, data)
// 零钱提现
apiWithdraw = data => httpPost(`storemanage/withdraw`, data)
// 授权绑定
apiWithdrawOpenid = data => httpPost(`storemanage/bindmainopenid`, data)
// 新提现接口
apiNewWithdraw = data => httpWrap({
    url: 'storemanage/newwithdraw',
    type: 12,
    method: 'post',
    data
  })
// #endif

// #ifdef MP-RETAIL
// 首页
apiGetExchange = data => httpGet(`storemanage/getloosechange?js_code=${data.js_code}`, data)
// 零钱收支明细
apiExchangeList = data => httpPost(`storemanage/getexchangelist`, data)
// 提现记录
apiWithdrawList = data => httpPost(`storemanage/getwithdrawrecord`, data)
// 提现记录详情
apiGetWithdrawDetail = data => httpPost(`storemanage/getwithdrawdetail`, data)
// 零钱提现
apiWithdraw = data => httpPost(`storemanage/withdraw`, data)
// 授权绑定
apiWithdrawOpenid = data => httpPost(`storemanage/bindmainopenid`, data)
// #endif

// #ifdef MP-SALE
// 零钱收支明细
apiExchangeList = data =>
  httpWrap({
    url: 'salesmanmanage/exchangelist',
    type: 3,
    method: 'post',
    data
  })
// 提现记录
apiWithdrawList = data =>
  httpWrap({
    url: 'salesmanmanage/withdrawlist',
    type: 3,
    method: 'post',
    data
  })

// 提现记录详情
apiGetWithdrawDetail = data =>
  httpWrap({
    url: 'salesmanmanage/withdrawdetail',
    type: 3,
    method: 'get',
    data
  })

// 新提现接口
apiNewWithdraw = data =>
  httpWrap({
    url: 'salesmanmanage/newwithdraw',
    type: 3,
    method: 'post',
    data
  })
// #endif

export { apiGetExchange, apiExchangeList, apiWithdrawList, apiGetWithdrawDetail, apiWithdraw, apiWithdrawOpenid, apiNewWithdraw }
