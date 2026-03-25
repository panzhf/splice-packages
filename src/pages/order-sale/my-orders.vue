<template>
  <view>
    <!-- 标签页 -->
    <view class="container-header">
      <v-tabs
        v-model="activiyTabIndex"
        :tabs="tablist"
        color="#000"
        active-color="#000"
        inactive-color="#666666"
        :line-color="activeTabColor"
        line-height="5rpx"
        padding-item="10rpx 40rpx"
        :line-scale="0.5"
        height="90rpx"
        field="name"
        fixed
        @change="handleTabChange"
      />
    </view>
    <!-- 订单列表 -->
    <view class="order-list">
      <OrderItem
        v-for="item in list"
        :key="item.orderno"
        :order="item"
        style-type="order"
        :show-time-info="true"
        @click="handleJump"
      />
    </view>

    <!-- 无数据提示 -->
    <none-data v-if="!list.length && !loading" msg="暂无订单" class="none-data" />
    <!-- 加载更多 -->
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import VTabs from 'packages/components/v-tabs'
import LoadMore from '@/components/load-more/index.vue'
import OrderItem from './comps/order-item.vue'
import { apiStoreSalesGiftGetMyOrders, apiStoreSalesGiftGetOrderStatistics } from 'packages/api/StoreSalesGift'
import { activeColor } from 'packages/utils/default-picture'

export default {
  components: {
    VTabs,
    LoadMore,
    OrderItem
  },
  data() {
    return {
      activityid: '',
      activeColor,
      activiyTabIndex: 0,
      hasMore: true,
      loading: true,
      busy: false,
      list: [],
      sForm: {
        status: 0,
        PageIndex: 1,
        PageSize: 10
      },
      // 各状态的数量统计
      statusCounts: {
        all: 0,
        pending: 0,
        reviewing: 0,
        approved: 0,
        rejected: 0
      }
    }
  },
  computed: {
    tablist() {
      const { pendingforward = 0, pendingaudit = 0, approved = 0, rejected = 0 } = this.statusCounts
      return [
        {
          name: '全部',
          value: 0
        },
        {
          name: `待转发(${pendingforward || 0})`,
          value: 1
        },
        {
          name: `待审核(${pendingaudit})`,
          value: 3
        },
        {
          name: `审核通过(${approved})`,
          value: 4
        },
        {
          name: `审核不通过(${rejected})`,
          value: 5
        }
      ]
    },
    activeTabColor() {
      let color = this.activeColor
      // #ifdef MP-RETAIL
      color = this.themeInfo.color
      // #endif
      return color
    }
  },
  onLoad(options) {
    // 当 activityid 有值的时候，请求门店可提交商品列表
    if (options.activityid) {
      this.activityid = options.activityid
    }
  },
  onShow() {
    this.init()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.sForm.PageIndex++
      this.getData()
    }
  },
  methods: {
    async init() {
      this.sForm.PageIndex = 1
      await this.getOrderStatistics()
      await this.getData()
    },
    // 切换标签页
    async handleTabChange(val) {
      this.sForm.status = this.tablist[val].value
      this.resetData()
      await this.getOrderStatistics()
      await this.getData()
    },

    // 获取订单数据
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      this.loading = true
      const res = await apiStoreSalesGiftGetMyOrders({
        PageIndex: this.sForm.PageIndex,
        PageSize: this.sForm.PageSize,
        OrderStatus: this.sForm.status,
        activityid: this.activityid
      })
      this.busy = false
      this.loading = false

      if (this.$ck(res)) {
        const newData = res.return_data.results || []
        this.list = this.sForm.PageIndex === 1 ? newData : [...this.list, ...newData]
        this.hasMore = newData.length >= this.sForm.PageSize
      }
    },

    // 获取订单统计信息
    async getOrderStatistics() {
      const res = await apiStoreSalesGiftGetOrderStatistics({
        activityid: this.activityid
      })
      if (this.$ck(res)) {
        this.statusCounts = res.return_data || {}
      }
    },

    // 重置数据
    resetData() {
      this.sForm.PageIndex = 1
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.list = []
    },

    // 点击订单跳转
    handleJump(item) {
      uni.navigateTo({
        url: `./order-detail?orderno=${item.orderno}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container-header {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;

  width: 100%;
  height: 90rpx;

  background: #f5f5f5;
}

.order-list {
  padding-top: 110rpx;
  background: #f5f5f5;
}
</style>
