<template>
  <view class="sale-report" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
    <TitleBar textcolor="#fff" type="detail" is-transparent />
    <view :style="{ height: contentTop }" />
    <view class="award-wrapper c-3 fs-28">
      <view class="flex flex-middle">
        门店名称：
        <text>{{ orderInfo.storename }}</text>
      </view>
      <view class="flex flex-middle">
        预计收入：
        <text>{{ orderInfo.totalamount }}</text>
      </view>
      <view class="flex flex-middle">
        提交时间：
        <text>{{ orderInfo.addtime }}</text>
      </view>
    </view>
    <view class="step-content">
      <!-- 产品选择 -->
      <OrderItem class="mb-20" :order="orderInfo" mode="sold" @change="handleChange">
        <view slot="head-left" class="fs-30 fw-bold">售出商品</view>
      </OrderItem>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import OrderItem from './comps/order-item.vue'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { apiStoreSalesGiftReportDetail } from 'packages/api/StoreSalesGift'
import { staticURL } from '@/config'

export default {
  components: {
    OrderItem,
    TitleBar
  },
  data() {
    return {
      orderNo: '',
      orderInfo: {},
      backgroundImage: staticURL(true) + 'order-sale/celebrate-bg.png'
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    contentTop() {
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `calc(${44 + this.statusBarHeight}px + 160rpx)`
      /* #endif */
      return style
    }
  },
  onLoad(options) {
    this.orderNo = options.orderno
    this.memberlogin = options.memberlogin
    this.getOrderDetail()
  },
  methods: {
    // 获取订单详情
    async getOrderDetail() {
      const res = await apiStoreSalesGiftReportDetail({ orderno: this.orderNo, memberlogin: this.memberlogin })
      if (this.$ck(res)) {
        const data = res.return_data
        this.orderInfo = data
        this.orderDetails = data.orderdetails || []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sale-report {
  min-height: 100vh;

  background-color: $uni-bg-color-grey;
  background-repeat: no-repeat;
  background-size: 100% auto;
}

.award-wrapper {
  margin: 0 20rpx 20rpx;
  padding: 20rpx 30rpx;

  border-radius: 10rpx;
  background: #fff;

  line-height: 1.8;
}

.step-content {
  .product-header {
    margin-bottom: -10rpx;
  }
}
</style>
