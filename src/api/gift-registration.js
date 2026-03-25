import { httpGet, httpPost } from '@/utils/request'

/**
 * 获取活动详情（含表单配置）
 * @param {Object} data - { activityID, openID }
 */
export function apiGetActivity(data) {
  return httpGet('GiftRegistration/GetActivity', data, { isMkt: true })
}

/**
 * 提交礼品领取登记
 * @param {Object} data - 登记表单数据
 */
export function apiSubmitRegistration(data) {
  return httpPost('GiftRegistration/Submit', data, { isMkt: true })
}

/**
 * 获取用户填写记录列表
 * @param {Object} data - { pageNum, pageSize, activityID }
 */
export function apiGetUserRecords(data) {
  return httpPost('GiftRegistration/GetUserRecords', data, { isMkt: true })
}

/**
 * 获取登记记录详情
 * @param {Object} data - { recordID }
 */
export function apiGetRecordDetail(data) {
  return httpGet('GiftRegistration/GetRecordDetail', data, { isMkt: true })
}

/**
 * 获取手机号（解密）
 * @param {Object} data - { code }
 */
export function apiGetMobile(data) {
  return httpPost('Common/GetMobile', data, { isMkt: true })
}

/**
 * H5 发送手机验证码（参照 collect-dialog）
 * @param {Object} data - { mobile, OpenID, m, ActivityID? }
 */
export function apiSendSmsVerifyCode(data) {
  return httpPost('Common/SendSmsVerifyCode', data, { isMkt: true })
} 

/**
 * 验证短信验证码（Common）
 * @param {Object} data - { MemberLogin: 品牌商编号, Mobile: 手机号, OpenID: 用户OpenID, Code: 验证码 }
 */
export function apiValidateSmsVerifyCode(data) {
  return httpPost('Common/ValidateSmsVerifyCode', data, { isMkt: true })
}

// 上传图片
export const apiUploadImageURL = 'Image/UploadImage'
// 上传视频
export const apiUploadMediaURL = 'Image/UploadMedia'
