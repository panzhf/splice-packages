/* #ifdef MP-WEIXIN */
/* #ifdef MP-RETAIL */
import { httpPost, httpGet, httpWrap } from '@/utils/request'
const defaultScanConfig = { loading: false }
export const apiMiniSaoMa = data => httpPost('scancode/minisaoma', data, defaultScanConfig)
// 错误信息
export const apiMiniSaoMaErrInfo = data => httpWrap({ url: '/api/saoma/minisaomaerrorpageinfo', data, type: 6, method: 'post', options: defaultScanConfig })
// 获取扫码状态
export const apiGetPKZSaoMaErrorMsg = data => httpWrap({ url: '/Api/Code.SaoMao/V1/GetSaoMaErrorPageInfo', data, type: 7, method: 'post', options: defaultScanConfig })
// 扫码信息配置
export const apiMiniSaoMaInfo = data => httpWrap({ url: '/api/saoma/minisaomapageinfo', data, type: 6, method: 'post', options: defaultScanConfig })
// 扫码错误默认信息获取
export const apiGetMiniSaoMaErrorPageInfo = data => httpWrap({ url: '/api/saoma/minisaomaerrorpageinfo', data, type: 6, method: 'post', options: defaultScanConfig })
// 立即领取
export const apiSumbitawardApply = (data,config={loading:true}) => httpWrap({ url: '/Api/Code.Award/V1/SumbitAwardApply', data, type: 10, method: 'post', options: config })
// 获取中奖者详情
export const apiAwardpageInfo = (data,config={loading:true}) => httpWrap({ url: '/api/Code.SaoMao/V1/GetAwardPageInfo', data, type: 7, method: 'post', options: config })
// 获取中奖者详情
export const apiGetHbState = (data,config={loading:false}) => httpWrap({ url: '/api/Code.Award/V1/GetHbSendResult', data, type: 10, method: 'post', options: config })
// 设置扫码微信地理位置信息
export const apiMiniSetSaomarecordwxLocation = data =>
  httpWrap({ url: '/api/Code.SaoMao/V1/SetSaoMaRecordWXLocation', data, type: 11, method: 'post', options: defaultScanConfig })
// 获取中奖结果
export const apiMiniAwardreSultn = (data,config={loading:false}) => httpWrap({ url: '/api/Code.Award/V1/GetAwardResult', data, type: 10, method: 'post', options: config })
// 发送手机验证码
export const apiSendCode = data => httpWrap({ url: '/Api/Code.SaoMao/V1/SendCode', data, type: 7, method: 'post', options: defaultScanConfig })
// 获取获奖者名单数据
export const apiGetActivityZJDataList = data => httpWrap({ url: '/Api/Code.SaoMao/V1/GetActivityZJDataList', data, type: 7, method: 'get', options: defaultScanConfig })

// 查询待领取的奖品列表
export const apiGetAwardForWaitList = data => httpWrap({ url: '/Api/Code.SaoMao/V1/GetAwardForWaitList', data, type: 7, method: 'get', options: defaultScanConfig })
// 验证码校验
export const apiJudgeValidVerifyCode = data => httpWrap({ url: '/Api/Code.SaoMao/V1/JudgeValidVerifyCode', data, type: 7, method: 'post', options: defaultScanConfig })
// 获取消费者是否已核销
export const apiGetCodeWriteOffInfo = data => httpWrap({ url: '/api/writeoff/getcodewriteoff', data, type: 6, method: 'post', options: defaultScanConfig })
// 查询错误码信息
export const apiGetErrorCodeInfo = data => httpWrap({ url: '/Api/Code.SaoMao/V1/GetSaoMaErrorPageInfo', data, type: 7, method: 'post', options: defaultScanConfig })
// 查询品牌商公众号code
export const apiGetGzhCodeImg = data => httpWrap({ url: '/Api/Code.SaoMaoExt/V1/MFollowQrCodeUrl', data, type: 7, method: 'post', options: defaultScanConfig })
// 获取错误模板装修
export const apiErrorPageInfo = data => httpWrap({ url: '/decrationcenter/api/v1/Decration/GetErrorTemplate', data, type: 9, method: 'get', options: defaultScanConfig })
// 获取可选门店列表
export const apiGetStoreList = data => httpWrap({ url: '/Api/Code.SaoMao/V1/GetCustomerMdStores', data, type: 7, method: 'post', options: defaultScanConfig })
// 选择门店
export const apiSavaStore = data => httpWrap({ url: '/Api/Code.SaoMao/V1/SaveMdStoresForScanAward', data, type: 7, method: 'post', options: defaultScanConfig })
// 获取动销码信息
export const apiGetDxmCodeInfo = data => httpWrap({ url: '/Api/Code.SaoMao/V1/GetDxmSaoMaPageInfo', data, type: 7, method: 'post', options: defaultScanConfig })
// 获取身份筛选弹窗
export const apiGetSaoMaoIdentity = data => httpWrap({ url: '/Api/Code.Award/V1/GetSaoMaoIdentity', data, type: 10, method: 'post', options: defaultScanConfig })
// 设置身份筛选弹窗
export const apiSetSaoMaoIdentity = data => httpWrap({ url: '/Api/Code.Award/V1/SetSaoMaoIdentity', data, type: 10, method: 'post', options: defaultScanConfig })
// 获取领奖记录的联盟卡券发放状态
export const apiGetAwardGrantState = (data, config = { loading: false }) => httpWrap({ url: '/Api/Code.SaoMao/V1/GetAwardGrantState', data, type: 7, method: 'post', options: config })
export const apiGetExternalUserId = (data) => httpWrap({ url: '/Api/Code.Award/V1/GetExternalUserId', data, type: 10, method: 'post', options: defaultScanConfig })
/* #endif */
/* #ifdef MP-MEMBER */
import { httpPost, httpGet } from '@/utils/request'
export const apiMiniSaoMa = data => httpPost('/memberclub/api/v1/ScanCode/minisaoma', data)
// 错误信息
export const apiMiniSaoMaErrInfo = data => httpPost('/memberclub/api/v1/ScanCode/minisaomaerrorpageinfo', data)
// 获取扫码状态
export const apiGetPKZSaoMaErrorMsg = data => httpPost('/memberclub/api/v1/ScanCode/getsaomaerrorpageinfo', data, { isMkt: false })
// 扫码信息配置
export const apiMiniSaoMaInfo = data => httpPost('/memberclub/api/v1/ScanCode/minisaomapageinfo', data)
// 扫码错误默认信息获取
export const apiGetMiniSaoMaErrorPageInfo = data => httpPost('/memberclub/api/v1/ScanCode/minisaomaerrorpageinfo', data)
// 立即领取
export const apiSumbitawardApply = (data,config={loading:true}) => httpPost('/memberclub/api/v1/ScanCode/minisumbitawardapply', data,config)
// 获取中奖者详情
export const apiAwardpageInfo = (data,config={loading:true}) => httpPost('/memberclub/api/v1/ScanCode/awardpageinfo',data,config)
// 获取中奖者详情
export const apiGetHbState = (data,config={loading:false}) => httpPost('/memberclub/api/v1/ScanCode/hbsendresult',data,config)
// 设置扫码微信地理位置信息
export const apiMiniSetSaomarecordwxLocation = data =>
  httpPost('/memberclub/api/v1/ScanCode/minisetsaomarecordwxlocation', data)
// 获取中奖结果
export const apiMiniAwardreSultn = (data,config={loading:false}) => httpPost('/memberclub/api/v1/ScanCode/miniawardresult', data,config)
// 发送手机验证码
export const apiSendCode = data => httpPost('/memberclub/api/v1/ScanCode/sendcode', data)
// 获取获奖者名单数据
export const apiGetActivityZJDataList = data => httpGet('/memberclub/api/v1/scancode/getactivityzjdatalist', data)
// 查询待领取的奖品列表
export const apiGetAwardForWaitList = data => httpGet('/memberclub/api/v1/ScanCode/getawardforwaitlist', data)
// 验证码校验
export const apiJudgeValidVerifyCode = data => httpPost('/memberclub/api/v1/ScanCode/judgevalidverifycode', data)
// 获取消费者是否已核销
export const apiGetCodeWriteOffInfo = data => httpPost('/memberclub/api/v1/ScanCode/GetCodeWriteOffInfo', data)
// 查询错误码信息
export const apiGetErrorCodeInfo = data => httpPost('/memberclub/api/v1/ScanCode/getsaomaerrorpageinfo', data)
// 查询品牌商公众号code
export const apiGetGzhCodeImg = data => httpPost('/memberclub/api/v1/ScanCode/getmfollowqrcodeurl', data)
// 获取错误模板装修
export const apiErrorPageInfo = data => httpGet('/decrationcenter/api/v1/Decration/GetErrorTemplate', data)
// 获取可选门店列表
export const apiGetStoreList = data => httpPost('/memberclub/api/v1/common/GetCustomerMdStores', data)
// 选择门店
export const apiSavaStore = data => httpPost('/memberclub/api/v1/common/SaveMdStoresForScanAward', data)
// 获取动销码信息
export const apiGetDxmCodeInfo = data => httpPost('/memberclub/api/v1/ScanCode/getdxmsaomapageinfo', data)
// 获取身份筛选弹窗
export const apiGetSaoMaoIdentity = data => httpPost('/memberclub/api/v1/ScanCode/GetSaoMaoIdentity', data)
// 设置身份筛选弹窗
export const apiSetSaoMaoIdentity = data => httpPost('/memberclub/api/v1/ScanCode/SetSaoMaoIdentity', data)
// 获取领奖记录的联盟卡券发放状态
export const apiGetAwardGrantState = (data, config = { loading: false }) => httpPost('/memberclub/api/v1/ScanCode/getawardgrantstate', data, config)
export const apiGetExternalUserId = (data) => httpPost('/memberclub/api/v1/ScanCode/GetExternalUserId', data)
/* #endif */
// 不用单独配置的
// 获取当前码解锁红包券详情
export const apiCouponUnlockResult = (data,config={loading:true}) => httpPost('/memberclub/api/v1/ScanCode/getcodecouponrecord', data)
// 获取个人待解锁红包列表
export const apiGetCouponRecord = (data,config={loading:true}) => httpPost('/memberclub/api/v1/ScanCode/getcouponrecord', data)
// 解锁红包券接口
export const apiCouponUnlock = (data,config={loading:true}) => httpPost('/memberclub/api/v1/ScanCode/couponunlock', data)
// 获取券解锁攻略
export const apiCouponExplain = data => httpPost('/memberclub/api/v1/ScanCode/getcouponexplain', data)
// 获取导购员信息
export const apiGetPKZSaoMaGuideInfo = data => httpPost('/memberclub/api/v1/ScanCode/getdgmsaomapageinfo', data,{ isMkt: false })
// 收集登记用户信息
export const apiSetAwardUserInfo = data => httpPost('/memberclub/api/v1/ScanCode/awardsetuserinfo', data)
// 获取是否需要登记
export const apiGetIsRegisterInfo = data => httpPost('/memberclub/api/v1/ScanCode/getIsRegisterInfo', data)
// 收集用户信息
export const apiSetUserInfo = data => httpPost('/memberclub/api/v1/ScanCode/setuserinfo', data)
/* #endif */

/* #ifdef H5 */
// 扫码信息配置
import { httpPost, httpGet } from '../utils/request'
// 获取扫码错误信息
export const apiGetPKZSaoMaErrorMsg = data => httpPost('/SaoMa/GetSaoMaErrorPageInfo', data, { isMkt: false })
// 获取导购员信息
export const apiGetPKZSaoMaGuideInfo = data => httpPost('/SaoMa/GetDgmSaoMaPageInfo', data, { isMkt: false })

// 扫码明细
export const apiGetPKZSaoMaPageInfo = data => httpPost('/SaoMa/GetPKZSaoMaPageInfo', data,{ isMkt: false, loading: false })
// 登记领奖
export const apiSumbitAwardApply = data => httpPost('/Award/SumbitAwardApply', data,{ isMkt: false, loading: false })
// 领奖结果
export const apiGetAwardResult = data => httpPost('/Award/GetAwardResult', data,{ isMkt: false, loading: false })
// 获奖结果
export const apiGetAwardPageInfo = data => httpPost('/SaoMa/GetAwardPageInfo', data,{ isMkt: false, loading: false })
// 查询待领取的奖品列表
export const apiGetAwardForWaitList = data => httpGet('/SaoMa/GetAwardForWaitList', data)
// 获取获奖者名单数据
export const apiGetActivityZJDataList = data => httpGet('/SaoMa/GetActivityZJDataList', data)
// 获取当前码解锁红包券
export const apiGetCodeCouponRecord = data => httpPost('/Award/GetCodeCouponRecord', data)
// 获取个人待解锁红包券
export const apiGetCouponRecord = data => httpPost('/Award/GetCouponRecord', data)
// 解锁红包券接口
export const apiCouponUnLock = data => httpPost('/Award/couponUnLock', data)
// 待解锁红包券规则
export const apiGetCouponExplain = data => httpPost('/Award/GetCouponExplain', data)
// 请求是否为指定活动区域内
export const apiSetSaoMaRecordWXLocation = data => httpPost('/SaoMa/SetSaoMaRecordWXLocation', data)
// 提交用户资料
export const apiSetUserInfo = data => httpPost('/SaoMa/SetUserInfo', data)
// 发送短信
export const apiSendCode = data => httpPost('/SaoMa/SendCode', data)
// 验证码校验
export const apiJudgeValidVerifyCode = data => httpPost('/SaoMa/JudgeValidVerifyCode', data)
// 获取WxConfig
export const apiGetWxConfig = data => httpGet('/SaoMa/GetWxConfig', data)
// 获取中奖者详情
export const apiGetHbState = data => httpPost('/Award/GetHbSendResult', data, { loading: false })
// 获取消费者是否已核销
export const apiGetCodeWriteOffInfo = data => httpPost('/SaoMa/GetCodeWriteOffInfo', data)
// 查询品牌商公众号code
export const apiGetGzhCodeImg = data => httpPost('/Member/MFollowQrCodeUrl', data)
// 获取错误模板装修
export const apiErrorPageInfo = data => httpGet('/SaoMa/GetErrorTemplate', data)
// 获取可选门店列表
export const apiGetStoreList = data => httpPost('/SaoMa/GetCustomerMdStores', data)
// 选择门店
export const apiSavaStore = data => httpPost('/SaoMa/SaveMdStoresForScanAward', data)
// 获取动销码信息
export const apiGetDxmCodeInfo = data => httpPost('/SaoMa/GetDxmSaoMaPageInfo', data)
// 设置身份筛选弹窗
export const apiSetSaoMaoIdentity = data => httpPost('/Award/SetSaoMaoIdentity', data)
// 获取身份筛选弹窗
export const apiGetSaoMaoIdentity = data => httpPost('/Award/GetSaoMaoIdentity', data)

export const apiSetAwardUserInfo = data => httpPost('/SaoMa/AwardSetUserInfo', data)
// 获取是否需要登记
export const apiGetIsRegisterInfo = data => httpPost('/SaoMa/GetIsRegisterInfo', data)

// 获取联盟卡券详情
export const apiGetAwardGrantState = (data, config = { loading: false }) => httpPost('/SaoMa/GetAwardGrantState', data, config)
// 获取版权信息
export const apiGetAccountInfo = data => httpGet('/member/GetAccountInfo', data, { loading: false })

export const apiGetExternalUserId = data => httpPost('/Award/GetExternalUserId', data)
/* #endif */




