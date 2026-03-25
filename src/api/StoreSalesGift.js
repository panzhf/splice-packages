import { httpWrap, httpPost } from '@/utils/request'

let apiStoreSalesGiftGetActivityList,
  apiStoreSalesGiftGetActivityDetail,
  apiStoreSalesGiftReportDetail,
  apiStoreSalesGiftGetRedPacketRecords,
  apiStoreSalesGiftGetSalesRanking,
  apiStoreSalesGiftGetStoreGoodsStocks,
  apiStoreSalesGiftSubmitOrder,
  apiStoreSalesGiftGetOrderStatistics,
  apiStoreSalesGiftGetMyOrders,
  apiStoreSalesGiftGetOrderDetail,
  apiStoreSalesGiftForwardToGroup

// #ifdef MP-DISTRIBUTION
// 获取门店动销有礼活动列表
apiStoreSalesGiftGetActivityList = data =>
  httpWrap({
    url: `StoreSalesGift/DealerPageActivity`,
    method: 'post',
    type: 5,
    data
  })

// 获取活动详情页
apiStoreSalesGiftGetActivityDetail = data =>
  httpWrap({
    url: `StoreSalesGift/DealerGetActivityDetail`,
    method: 'get',
    type: 5,
    data
  })

// 获取门店动销有礼活动红包发放记录
apiStoreSalesGiftGetRedPacketRecords = data =>
  httpWrap({
    url: `StoreSalesGift/DealerGetRedPacketRecords`,
    method: 'post',
    type: 5,
    data
  })

// 获取实时销量排行榜
apiStoreSalesGiftGetSalesRanking = data =>
  httpWrap({
    url: `StoreSalesGift/DealerGetSalesRanking`,
    method: 'post',
    type: 5,
    data
  })
// #endif

// #ifdef MP-RETAIL
// 获取活动详情页
apiStoreSalesGiftGetActivityDetail = data =>
  httpWrap({
    url: `StoreSalesGift/GetActivityDetail`,
    method: 'get',
    type: 5,
    data
  })
apiStoreSalesGiftReportDetail = data =>
  httpPost(
    'retailcommon/activemarketingapi',
    {
      url: `/api/StoreSalesGift/GetOrderDetail`,
      method: 'get',
      data
    },
    { loading: true, requireAuth: false }
  )

// 获取门店动销有礼活动红包发放记录
apiStoreSalesGiftGetRedPacketRecords = data =>
  httpWrap({
    url: `StoreSalesGift/GetRedPacketRecords`,
    method: 'post',
    type: 5,
    data
  })

// 获取实时销量排行榜
apiStoreSalesGiftGetSalesRanking = data =>
  httpWrap({
    url: `StoreSalesGift/GetSalesRanking`,
    method: 'post',
    type: 5,
    data
  })

// 获取门店可提交商品及库存列表
apiStoreSalesGiftGetStoreGoodsStocks = data =>
  httpWrap({
    url: `StoreSalesGift/GetStoreGoodsStocks`,
    method: 'post',
    type: 5,
    data
  })

// 提交门店动销订单
apiStoreSalesGiftSubmitOrder = data =>
  httpWrap({
    url: `StoreSalesGift/SubmitOrder`,
    method: 'post',
    type: 5,
    data
  })

// 获取订单数量统计
apiStoreSalesGiftGetOrderStatistics = data =>
  httpWrap({
    url: `StoreSalesGift/GetOrderStatistics`,
    method: 'get',
    type: 5,
    data
  })

// 获取我的订单列表
apiStoreSalesGiftGetMyOrders = data =>
  httpWrap({
    url: `StoreSalesGift/GetMyOrders`,
    method: 'post',
    type: 5,
    data
  })

// 获取订单详情
apiStoreSalesGiftGetOrderDetail = data =>
  httpWrap({
    url: `StoreSalesGift/GetOrderDetail`,
    method: 'get',
    type: 5,
    data
  })

// 转发到群
apiStoreSalesGiftForwardToGroup = data =>
  httpWrap({
    url: `StoreSalesGift/ForwardToGroup`,
    method: 'post',
    type: 5,
    data
  })

// #endif

export {
  apiStoreSalesGiftGetActivityList,
  apiStoreSalesGiftGetActivityDetail,
  apiStoreSalesGiftReportDetail,
  apiStoreSalesGiftGetRedPacketRecords,
  apiStoreSalesGiftGetSalesRanking,
  apiStoreSalesGiftGetStoreGoodsStocks,
  apiStoreSalesGiftSubmitOrder,
  apiStoreSalesGiftGetOrderStatistics,
  apiStoreSalesGiftGetMyOrders,
  apiStoreSalesGiftGetOrderDetail,
  apiStoreSalesGiftForwardToGroup
}
