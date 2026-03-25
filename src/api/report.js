// 日志上报：现在3+2助手使用BI
// #ifndef MP-SALE
import { httpPost } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpPost as requestPost } from '@/utils/big-request'
// #endif
let apiBIReport
// #ifdef MP-DISTRIBUTION || MP-RETAIL
apiBIReport = data => httpPost('biwarehouse/report', data, { loading: false, requireAuth: false })
// #endif

// #ifdef MP-GUIDE
apiBIReport = data => httpPost('/guideassistant/api/biwarehouse/report', data, { loading: false, requireAuth: false })
// #endif

// #ifdef MP-SALE
apiBIReport = data => requestPost({ url: 'biwarehouse/report', data, options: { loading: false } })
// #endif

export { apiBIReport }
