import { httpPost, httpGet, httpWrap } from '@/utils/request'

let apiHomeDecoration,
  apiGetGoodsList,
  apiCheckoutOrder,
  apiGetIntegralDetail,
  apiGetIntegralMarketingDetail,
  apiIntegralGetGoodsList,
  apiIntegralGetGoodsListClass,
  apiGetMyPoint,
  apiGetBackwardsLocation,
  apiPrizeDetail,
  apiGetIntegralDgDetail,
  apiGetStoreList,
  apiAddSubscribemsgRecord,
  apiCartDelete, // 删除购物车
  apiCartGetItems, // 查询购物车子项
  apiCartUpdate, // 修改购物车规格(价格)--多规格
  apiAddCart,
  apiGetCartCount,
  apiCheckExistStore, // 检查附近是否有门店
  apiGetRedemptionResultPage // 兑换结果页装修

// #ifdef MP-GUIDE
// 积分商城首页
apiHomeDecoration = data => {
  data.sourcetype = 3
  return httpGet('/decrationcenter/api/v1/Decration/HomeDetail', data)
}
// 礼品列表
apiGetGoodsList = data => httpPost('/guideassistant/api/gift/getgiftlist', data)
// 验证订单
apiCheckoutOrder = data => httpPost('/guideassistant/api/order/checkout', data)
// 获取积分商品详情
apiGetIntegralDetail = data => httpGet('/points/api/v1/minilipin/getgiftinfo', data)
apiGetIntegralDgDetail = data => httpGet('/points/api/v1/minilipin/getactgiftinfo', data)
// 全部礼品
apiIntegralGetGoodsList = data => httpPost('/guideassistant/api/gift/getallgiftlist', data)
// 分类
apiIntegralGetGoodsListClass = data => httpGet('/guideassistant/api/gift/getgifttypelist', data)
// 门店列表
apiGetStoreList = data => httpPost('/guideassistant/api/sales/getnearbystore', data)
// 经纬度获取省市区
apiGetBackwardsLocation = data => httpGet('/guideassistant/api/commanage/getlocation', data)
// 获取奖品详情
apiPrizeDetail = data => httpWrap({ url: 'mycenter.mycenter/v1/getprizeinfo', method: 'get', data })
// 添加消息订阅记录
apiAddSubscribemsgRecord = data => httpPost('/guideassistant/api/commanage/addsubscribemsgrecord', data)
// 用户信息（用来查积分数据）
apiGetMyPoint = data => httpGet('/guideassistant/api/me/getuserinfo', data)

apiCartDelete = data => httpPost('/guideassistant/api/order/delete', data) // 删除购物车
apiCartGetItems = data => httpPost('/guideassistant/api/order/getitems', data) // 查询购物车子项
apiCartUpdate = data => httpPost('/guideassistant/api/order/update', data) // 修改购物车规格(价格)--多规格

// 添加购物车
apiAddCart = (data, loading = true) => httpPost('/guideassistant/api/order/set', data, { loading }) // 设置购物车请求:首次设定为创建、后续为修改，扣除至0为删除
// 查询购物车数量
apiGetCartCount = data => httpPost('/guideassistant/api/order/getitemcount', data)
// 检查附近是否有门店
apiCheckExistStore = data => httpPost('/guideassistant/api/sales/checkExistStore', data)
// #endif

// #ifdef MP-MEMBER || MP-CLOUDSHOP
// 积分商城首页
apiHomeDecoration = data => httpGet('/decrationcenter/api/v1/Decration/HomeDetail', data, { isCommon: true })

// #ifdef MP-MEMBER
// 兑换结果页装修
apiGetRedemptionResultPage = () =>
  httpGet('/decrationcenter/api/v1/Decration/GetRedemptionResultPage', {}, { isCommon: true })
// #endif

// 礼品列表
apiGetGoodsList = data => httpPost('/points/api/v1/goods/pagelist', data, { isCommon: true })
// 验证订单
apiCheckoutOrder = data => httpPost('/memberclub/api/v1/order/checkout', data, { isCommon: true })
// 获取积分商品详情
apiGetIntegralDetail = data => httpGet('/points/api/v1/minilipin/getgiftinfo', data, { isCommon: true })
// 全部礼品
apiIntegralGetGoodsList = data => httpPost('/points/api/v1/goods/allpagelist', data, { isCommon: true })
// 分类
apiIntegralGetGoodsListClass = data => httpGet('/points/api/v1/minilipin/getgifttypelist', data, { isCommon: true })
// 我的积分
apiGetMyPoint = data => httpGet('/points/api/v1/minilipin/getmytotalpoint', data, { isCommon: true })
// 查询购物车数量
apiGetCartCount = data => httpPost('/memberclub/api/v1/shoppingcart/getitemcount', data, { isCommon: true })
// 添加购物车
apiAddCart = data => httpPost('/memberclub/api/v1/shoppingcart/set', data, { isCommon: true })
apiCartGetItems = data => httpPost('/memberclub/api/v1/shoppingcart/getitems', data, { isCommon: true })
apiCartUpdate = data => httpPost('/memberclub/api/v1/shoppingcart/update', data, { isCommon: true })
apiCartDelete = data => httpPost('/memberclub/api/v1/shoppingcart/delete', data, { isCommon: true })
apiCheckExistStore = data => httpPost('/memberclub/api/v1/me/nearbystores/checkexiststore', data, { isCommon: true })
// 添加发货和退货消息订阅
apiAddSubscribemsgRecord = data =>
  httpPost('/memberclub/api/v1/order/subscribedeliveryandrefundmsg', data, { isCommon: true })
// #endif

// #ifndef MP-RETAIL
// 获取积分营销商品详情
apiGetIntegralMarketingDetail = data => httpPost('/memberclub/api/v1/common/productdetail', data)
// #endif

// #ifdef MP-RETAIL
// 获取积分营销商品详情
apiGetIntegralMarketingDetail = data => httpPost('order/productdetail', data)
// 验证订单
apiCheckoutOrder = data => httpPost('order/checkout', data)
// #endif
export {
  apiHomeDecoration,
  apiGetGoodsList,
  apiCheckoutOrder,
  apiGetIntegralDetail,
  apiGetIntegralMarketingDetail,
  apiIntegralGetGoodsList,
  apiIntegralGetGoodsListClass,
  apiGetMyPoint,
  apiGetBackwardsLocation,
  apiPrizeDetail,
  apiGetIntegralDgDetail,
  apiGetStoreList,
  apiAddSubscribemsgRecord,
  apiCartDelete, // 删除购物车
  apiCartGetItems, // 查询购物车子项
  apiCartUpdate, // 修改购物车规格(价格)--多规格
  apiAddCart,
  apiGetCartCount,
  apiCheckExistStore,
  apiGetRedemptionResultPage
}
