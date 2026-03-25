import { httpPost, httpGet } from '@/utils/request'
let apiGetCardList,
  apiGetCardDetail,
  apiGetPointInfo,
  apiPointDetail,
  apiGetMall,
  apiGetPointsExplain,
  apiGetLMCardDetail,
  apiGetPrizeMsgTemplate,
  apiGetMyPageMsgTemplate,
  apiNeedSubscribeMsgTemplate,
  apiAddMessageSubscribeRecord

// #ifdef MP-GUIDE
// 联盟卡券列表
apiGetCardList = data => httpPost('/guideassistant/api/guidercenter/getcardlist', data)
// 联盟卡券详情
apiGetCardDetail = data => httpGet('/guideassistant/api/guidercenter/getcarddetail', data)
// 获取积分信息
apiGetPointInfo = data => httpGet('/guideassistant/api/me/getmepoint', data)
// 积分详情
apiPointDetail = data => httpGet('/guideassistant/api/me/getpointdetail', data)
// 商城信息
apiGetMall = data => httpGet('/guideassistant/api/me/getuserinfo', data)
// 积分说明
apiGetPointsExplain = data => httpGet('/guideassistant/api/me/getpointsexplain', data)
// 联盟卡券详情（单号查）apiGetLMCardDetail
apiGetLMCardDetail = data => httpGet('/guideassistant/api/guidercenter/getalliancecarddetail', data)
// #endif

// #ifdef MP-MEMBER || MP-CLOUDSHOP
// 联盟卡券列表
apiGetCardList = data => httpPost('/memberclub/api/v1/me/cardlist', data, { isCommon: true })
// 联盟卡券详情
apiGetCardDetail = data => httpGet('/memberclub/api/v1/me/carddetail', data, { isCommon: true })
// 获取积分信息
apiGetPointInfo = data => httpGet('/memberclub/api/v1/me/point', data, { isCommon: true })
// 积分详情
apiPointDetail = data => httpGet('/memberclub/api/v1/me/pointdetail', data, { isCommon: true })
// 商城信息
apiGetMall = data => httpGet('/memberclub/api/v1/me/points/mall', data, { isCommon: true })
// 积分说明
apiGetPointsExplain = data => httpGet('/memberclub/api/v1/me/points/explain', data, { isCommon: true })
// 获取个人中心消息模板
apiGetMyPageMsgTemplate = data => httpPost('/memberclub/api/v1/common/getmsgtemplate', data, { isCommon: true })
// 判断是否需要订阅消息
apiNeedSubscribeMsgTemplate = data => httpPost('/memberclub/api/v1/common/needsubscribemsgtemplate', data, { isCommon: true })
// 添加订阅记录
apiAddMessageSubscribeRecord = data => httpPost('/memberclub/api/v1/common/addmessagesubscriberecord', data, { isCommon: true })
// #endif

// #ifdef MP-MEMBER
apiGetPrizeMsgTemplate = data => httpGet('/memberclub/api/v1/me/GetPrizeMsgTemplate', data, { isCommon: true })
// #endif

export {
  apiGetCardList,
  apiGetCardDetail,
  apiGetPointInfo,
  apiPointDetail,
  apiGetMall,
  apiGetPointsExplain,
  apiGetLMCardDetail,
  apiGetPrizeMsgTemplate,
  apiGetMyPageMsgTemplate,
  apiNeedSubscribeMsgTemplate,
  apiAddMessageSubscribeRecord
}
