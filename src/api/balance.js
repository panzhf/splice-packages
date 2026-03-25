// #ifdef MP-SALE
import { httpWrap, httpPost } from '@/utils/big-request'
// #endif
/**
 * 获取我的零钱信息
 * @returns {Promise}
 */
export function apiGetMyPocket() {
  return httpWrap({
    url: 'salesmanmanage/MyPocket',
    type: 3
  })
}

/**
 * 绑定提现账户openid
 * @param {Object} data - { mainopenid: string, verification: string }
 * @returns {Promise}
 */
export function apiBindWithdrawOpenid(data) {
  return httpWrap({
    url: 'salesman/bindwithdrawopenid',
    type: 1,
    method: 'post',
    data
  })
}

/**
 * 授权头像昵称
 * @param {Object} data - { nickname: string, headpath: string }
 * @returns {Promise}
 */
export function apiAuthorizedAvatar(data) {
  return httpPost({ url: 'user/authorizedavatar', data, options: { resolveData: 'all' } })
}

/**
 * 提现接口
 * @param {Object} data - { amount: number, mainOpenID: string }
 * @returns {Promise}
 */
export function apiWithdraw(data) {
  return httpWrap({
    url: 'salesmanmanage/withdraw',
    type: 3,
    method: 'post',
    data
  })
}
// 新提现接口
export function apiNewWithdraw(data) {
  return httpWrap({
    url: 'salesmanmanage/newwithdraw',
    type: 3,
    method: 'post',
    data
  })
}

/**
 * 获取提现结果(根据单号)
 * @param {Object} params - { tradeno: string }
 * @returns {Promise}
 */
export function apiGetWithdrawResult(params) {
  return httpWrap({
    url: 'salesmanmanage/withdrawresult',
    type: 3,
    data: params
  })
}
