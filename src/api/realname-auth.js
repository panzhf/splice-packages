// #ifdef MP-DISTRIBUTION || MP-RETAIL || MP-GUIDE
import { httpWrap } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpWrap as bigRequestWrap } from '@/utils/big-request'
// #endif

// 实名认证相关接口
let apiGetRealnameAuthStatus,
  apiSubmitRealnameAuth,
  apiReportNoRemind,
  apiGetRealnameDisplayWindow,
  apiGetRealnameContract
// #ifdef MP-DISTRIBUTION
apiGetRealnameAuthStatus = data => httpWrap({ url: 'AccountCertificate/GetAccountCertificate', data, type: 6 }) // 获取实名认证状态
apiSubmitRealnameAuth = data =>
  httpWrap({ url: 'AccountCertificate/AccountCertificate', data, method: 'post', type: 6 }) // 提交实名认证
apiReportNoRemind = data => httpWrap({ url: 'AccountCertificate/SetDisplayWindow', data, method: 'post', type: 6 }) // 上报"7天内不再提示"
apiGetRealnameDisplayWindow = data => httpWrap({ url: 'AccountCertificate/DisplayWindow', data, type: 6 }) // 判断是否显示实名认证弹窗
apiGetRealnameContract = data => httpWrap({ url: 'AccountCertificate/Contract', data, type: 6 }) // 判断当前品牌商是否开通实名认证功能
// #endif

// #ifdef MP-RETAIL
apiGetRealnameAuthStatus = data => httpWrap({ url: 'AccountCertificate/GetAccountCertificate', data, type: 13 }) // 获取实名认证状态
apiSubmitRealnameAuth = data =>
  httpWrap({ url: 'AccountCertificate/AccountCertificate', data, method: 'post', type: 13 }) // 提交实名认证
apiReportNoRemind = data => httpWrap({ url: 'AccountCertificate/SetDisplayWindow', data, method: 'post', type: 13 }) // 上报"7天内不再提示"
apiGetRealnameDisplayWindow = data => httpWrap({ url: 'AccountCertificate/DisplayWindow', data, type: 13 }) // 判断是否显示实名认证弹窗
apiGetRealnameContract = data => httpWrap({ url: 'AccountCertificate/Contract', data, type: 13 }) // 判断当前品牌商是否开通实名认证功能
// #endif

// #ifdef MP-GUIDE
apiGetRealnameAuthStatus = data => httpWrap({ url: 'AccountCertificate/GetAccountCertificate', data, type: 2 }) // 获取实名认证状态
apiSubmitRealnameAuth = data =>
  httpWrap({ url: 'AccountCertificate/AccountCertificate', data, method: 'post', type: 2 }) // 提交实名认证
apiReportNoRemind = data => httpWrap({ url: 'AccountCertificate/SetDisplayWindow', data, method: 'post', type: 2 }) // 上报"7天内不再提示"
apiGetRealnameDisplayWindow = data => httpWrap({ url: 'AccountCertificate/DisplayWindow', data, type: 2 }) // 判断是否显示实名认证弹窗
apiGetRealnameContract = data => httpWrap({ url: 'AccountCertificate/Contract', data, type: 2 }) // 判断当前品牌商是否开通实名认证功能
// #endif

// #ifdef MP-SALE
apiGetRealnameAuthStatus = data => bigRequestWrap({ url: 'AccountCertificate/GetAccountCertificate', data, type: 7 }) // 获取实名认证状态
apiSubmitRealnameAuth = data =>
  bigRequestWrap({ url: 'AccountCertificate/AccountCertificate', data, method: 'post', type: 7 }) // 提交实名认证
apiReportNoRemind = data =>
  bigRequestWrap({ url: 'AccountCertificate/SetDisplayWindow', data, method: 'post', type: 7 }) // 上报"7天内不再提示"
apiGetRealnameDisplayWindow = data => bigRequestWrap({ url: 'AccountCertificate/DisplayWindow', data, type: 7 }) // 判断是否显示实名认证弹窗
apiGetRealnameContract = data => bigRequestWrap({ url: 'AccountCertificate/Contract', data, type: 7 }) // 判断当前品牌商是否开通实名认证功能
// #endif

export {
  apiGetRealnameAuthStatus,
  apiSubmitRealnameAuth,
  apiReportNoRemind,
  apiGetRealnameDisplayWindow,
  apiGetRealnameContract
}
