import { httpPost, httpGet } from '@/utils/request'
/** 邀请有礼页面 */
export const apiGetApplyData = data => httpGet('/memberclub/api/v1/Card/GetInvitePolite')
/** 奖励说明 */
export const apiGetApplyAwardData = data => httpGet('/memberclub/api/v1/Card/AwardDescription')
/** 我的邀请 */
export const apiGetMyApplyAwardData = data => httpGet('/memberclub/api/v1/Card/MyInvitation')
/** 获取海报数据 */
export const apiGetCardHaiBaoSettingInfo = data => httpGet('/memberclub/api/v1/Card/GetCardHaiBaoSettingInfo')
/** 获取邀请太阳码 */
export const apiGetMiniCode = data => httpGet('/memberclub/api/v1/Card/inviterqrcode', data)
/** 获取会员信息表单 */
export const apiGetmemberFormData = data => httpPost('/memberclub/api/v1/Card/GetReceiveCardInfo', data)
/** 获取会员卡券 */
export const apiGetCouponList = data => httpGet('/memberclub/api/v1/Card/GetCouponList', data)
/** 领取会员卡会员 */
export const apiSetReceiveCard = data => httpPost('/memberclub/api/v1/Card/SetReceiveCard', data)
/** 获取红包券 */
export const apiGetHongBaoCardListInfo = data => httpGet('/memberclub/api/v1/Card/GetHongBaoCardListInfo', data)
/** 获取提领券 */
export const apiGetPickUpCouponList = data => httpGet('/memberclub/api/v1/Card/GetPickUpCouponList', data)
/** 会员卡信息 */
export const apiGetMemberCenterInfo = data => httpGet('/memberclub/api/v1/Card/GetMemberCenterInfo', data)
