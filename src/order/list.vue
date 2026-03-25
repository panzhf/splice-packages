<template>
  <view :style="themeVars">
    <v-tabs
      v-model="active"
      :tabs="tablist"
      color="#000"
      active-color="#000"
      :line-color="lineColor"
      line-height="6rpx"
      padding-item="10rpx 40rpx"
      line-scale="0.3"
      height="76rpx"
      style="width: 500rpx; display: block"
      fixed
      field="name"
      @change="handleChangeTab"
    />
    <!-- 内容部分 -->
    <view v-for="(item, index) in list" :key="index" class="order-item" @click="handleJump(item)">
      <view class="order-head">
        <view class="head-left">
          <view
            v-if="item.subcategory == 6 || item.subcategory == 2 || item.subcategory == 13 || item.subcategory == 14"
            class="head-tag"
          >
            {{ item.subcategory | filterHead }}
          </view>
          <view class="head-fd">订单号：{{ item.ordernumber }}</view>
        </view>
        <!-- 售后订单 -->
        <view
          v-if="sForm.orderstatus === 7"
          :class="['head-right', [1, 4].includes(item.aftersalesorderstatus) ? 'head-order' : '']"
        >
          {{ item | filterSaleOrder }}
        </view>
        <view v-else :class="['head-right', item.orderstatus == 4 ? '' : 'head-order']">
          {{ item | filterOrder }}
        </view>
      </view>
      <view v-for="(log, index2) in item.items" :key="index2" class="product-item">
        <!-- 中间 -->
        <view class="order-middle">
          <view class="middle-img">
            <v-img :src="log.picture" />
          </view>
          <view class="middle-shop">
            <view class="middle-shop-top">{{ log.name }}</view>
            <view class="middle-shop-size">{{ log.types }}</view>
            <view class="middle-shop-price">
              <view class="shop-price-le">
                <view v-if="log.points">{{ log.points }}积分</view>
                <view v-if="log.points && log.originalamount" style="margin: 0 5rpx">+</view>
                <price v-if="log.originalamount" mode="cash" :price="log.originalamount" double show-sign />
              </view>
              <view class="shop-price-ri">x{{ log.quantity }}</view>
            </view>
          </view>
        </view>
      </view>
      <!-- 底部价格 -->
      <view class="order-bottom">
        <view class="bottom-price-left">
          共{{ item.items.length }}件礼品
          <span v-if="item.usepoints || item.actualamount || item.deliveryfee" style="margin-left: 16rpx">合计：</span>
        </view>
        <view class="bottom-price-right">
          <view v-if="item.usepoints">{{ item.usepoints }}积分</view>
          <view v-if="item.usepoints && (item.actualamount || item.deliveryfee)" style="margin: 0 5rpx">+</view>
          <price
            v-if="item.actualamount || item.deliveryfee"
            mode="card"
            :price="(item.actualamount + item.deliveryfee).toFixed(2)"
            double
            show-sign
          />
        </view>
      </view>
    </view>
    <none-data v-if="!list.length && !loading" msg="暂无订单" :icon="notorder" class="none-data" />
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import VTabs from '../components/v-tabs'
import price from '../components/price/price'
import { apiOrders, apiAfterSalesList } from '../api/order.js'
import { staticURL } from '@/config'

import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif

export default {
  components: {
    VTabs,
    NoneData,
    price,
    LoadMore
  },
  filters: {
    filterHead(val) {
      // 2：积分换购订单 6:扫码实物中奖订单 13：营销订单 14:会员小程序
      switch (val) {
        case 2:
          return '兑换'
        case 6:
          return '扫码'
        case 13:
          return '活动'
        case 14:
          return '会员'
        default:
          break
      }
    },
    filterOrder(val) {
      // 1 待支付、2 待发货、3 待收货\待核销、4 已完成、5 已取消、6 退款订单、7 处理中
      switch (val.orderstatus) {
        case 1:
          return '待支付'
        case 2:
          return '待发货'
        case 3:
          return val.deliverymode === 1 ? '待核销' : '待收货'
        case 4:
          return '完成交易'
        case 5:
          return '已取消'
        case 6:
          return '退款订单'
        case 7:
          return '处理中'
        default:
          break
      }
    },
    filterSaleOrder(val) {
      // // 1待审核；2退款完成；3退款关闭；4退货退款中；5退货退款完成；6退货退款关闭
      switch (val.aftersalesorderstatus) {
        case 1:
          return '待审核'
        case 2:
          return '退款完成'
        case 3:
          return '退款关闭'
        case 4:
          return '退货退款中'
        case 5:
          return '退货退款完成'
        case 6:
          return '退货退款关闭'
        default:
          break
      }
    }
  },
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      tablist: [
        {
          id: 0,
          name: '全部'
        },
        {
          id: 1,
          name: '兑换中'
        },
        {
          id: 6,
          name: '待付款'
        },
        {
          id: 2,
          name: '待发货'
        },
        {
          id: 3,
          name: '待收货/待核销'
        },
        {
          id: 4,
          name: '已完成'
        },
        {
          id: 5,
          name: '失败/退款'
        },
        {
          id: 7,
          name: '售后订单'
        }
      ],
      //订单接口数据
      sForm: {
        orderstatus: 0, //选中的id
        PageIndex: 1,
        PageSize: 10
      },
      active: 0, // 选中的下标
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      list: [], //商品数据
      type: 1, //跳转参数
      notorder: staticURL(true) + `notorder.png`
    }
  },
  computed: {
    lineColor() {
      let color = '#ffa200'
      // #ifdef MP-RETAIL
      color = this.themeInfo.color
      // #endif
      return color
    }
  },
  async onLoad(options) {
    const type = +options.type || 0
    this.active = type
    this.sForm.orderstatus = this.tablist[type].id
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
    uni.$on('update-order', () => {
      this.resetData()
      this.getData()
    })
  },
  onUnload() {
    uni.$off('update-order')
  },
  onReachBottom() {
    if (this.hasMore) {
      this.sForm.PageIndex++
      this.getData()
    }
  },
  methods: {
    // 点击头部切换
    handleChangeTab(index) {
      this.sForm.orderstatus = this.tablist[index].id
      this.resetData()
      this.getData()
    },
    // 订单数据
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      try {
        const isAfterSales = this.sForm.orderstatus === 7
        const fn = isAfterSales ? apiAfterSalesList : apiOrders
        const query = { ...this.sForm }
        if (isAfterSales) {
          delete query.orderstatus // 售后订单不需要orderstatus
        }
        const res = await fn(query)
        if (this.$ck(res, true)) {
          const result = res.return_data || []
          this.list = this.sForm.PageIndex === 1 ? result : [...this.list, ...result]
          this.hasMore = result.length === this.sForm.PageSize
        }
      } catch (e) {
        // 可根据需要添加错误处理
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    // 如果刷新重置一下数据
    resetData() {
      this.sForm.PageIndex = 1
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.list = []
    },
    // 点击订单详情跳转
    handleJump(item) {
      if (this.sForm.orderstatus === 7) {
        // 售后订单跳转
        uni.navigateTo({
          url: `./sale-detail?id=${item.ordernumber}`
        })
        return
      }
      // "subcategory" --类型，2：积分换购订单 6:扫码实物中奖订单 13：营销订单 14:会员小程序 19:生日礼包
      if (item.subcategory === 2) {
        this.type = 1
      } else if (item.subcategory === 6 || item.subcategory === 14) {
        this.type = 2
      } else if (item.subcategory === 13) {
        this.type = 3
      } else if (item.subcategory === 19) {
        this.type = 5
      }
      uni.navigateTo({
        url: `./detail?id=${item.orderid}&type=${this.type}&subcategory=${item.subcategory}`
      })
    }
  }
}
</script>


<style lang="scss" scoped>
// @import '../styles/icon.css';
.order-item {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  background: #ffffff;
  border-radius: 10rpx;
  .order-head {
    display: flex;
    align-items: center;
    height: 83rpx;
    justify-content: space-between;
    .head-left {
      display: flex;
      align-items: center;
      .head-tag {
        margin-right: 20rpx;
        padding: 3rpx 7rpx;
        background: var(--theme-color, $bg-color);
        border-radius: 6rpx;
        font-size: 20rpx;
        font-weight: bold;
        border-radius: 5px;
        color: $order-text-color;
      }
      .head-fd {
        font-size: 24rpx;
        color: #999;
      }
    }
    .head-right {
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: bold;
      line-height: 34rpx;
    }
    .head-order {
      // color: $order-stats-color;
      color: var(--theme-color, $order-stats-color);
    }
  }
  .product-item {
    & + .product-item {
      padding-top: 30rpx;
    }
  }
  .order-middle {
    padding-bottom: 30rpx;
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #eee;
    .middle-img {
      width: 160rpx;
      height: 160rpx;
      position: relative;
    }
    .middle-shop {
      margin-left: 20rpx;
      width: 73%;
      overflow: hidden;
      .middle-shop-top {
        font-size: 28rpx;
        font-weight: 700;
        text-align: left;
        color: #000000;
        line-height: 36rpx;
        margin-bottom: 20rpx;
      }
      .middle-shop-size {
        font-size: 24rpx;
        font-weight: 500;
        text-align: left;
        color: #999999;
        line-height: 30rpx;
        margin-bottom: 20rpx;
      }
      .middle-shop-price {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 24rpx;
        .shop-price-le {
          display: flex;
          font-weight: 700;
          align-items: center;
        }
      }
    }
  }
  .order-bottom {
    padding: 30rpx 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-weight: 500;
    .bottom-price-left {
      color: #444444;
      font-size: 24rpx;
    }
    .bottom-price-right {
      display: flex;
      align-items: center;
      font-size: 30rpx;
      // color: $price-color;
      color: var(--theme-color, $price-color);
      font-weight: bolder;
    }
  }
}
</style>
