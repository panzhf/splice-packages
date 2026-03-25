<template>
  <view class="orderDetail-info block">
    <view class="info-top">
      {{ cardTitle }}
      <view v-if="showOrderNumber" class="order-no">订单编号：{{ orderInfo.ordernumber }}</view>
    </view>
    <view v-for="(item, index) in orderInfo.items" :key="index" class="info-content" @click="handleCourier(item)">
      <view class="info-img">
        <image class="img-full" mode="aspectFit" :src="item.picture" />
        <view v-if="subcategory == 19 || type == 5" class="no-return-tip">*此商品性质不支持退货服务</view>
      </view>
      <view class="info-shop">
        <view class="info-shop-top">{{ item.name }}</view>
        <view class="info-shop-size">{{ item.types }}</view>
        <view class="info-shop-price">
          <view class="shop-price-le">
            <view v-if="item.points">{{ item.points }}积分</view>
            <view v-if="item.points && item.originalamount" class="plus-margin">+</view>
            <price v-if="item.originalamount" mode="cash" :price="item.originalamount" double show-sign />
          </view>
          <view class="shop-price-ri">x{{ item.quantity }}</view>
        </view>
      </view>
    </view>
    <view v-if="showTotal" class="order-summary mt-20">
      <view class="order-main">
        共{{ totalQuantity }}件商品 实付：
        <price
          :price="(orderInfo.actualamount + orderInfo.deliveryfee).toFixed(2)"
          double
          show-sign
          mode="card"
          class="b-i-inline"
        />
      </view>
      <view v-if="orderInfo.deliveryfee" class="order-extra">
        （含快递费：
        <price mode="cash" :price="orderInfo.deliveryfee" double show-sign class="b-i-inline" />
        ）
      </view>
    </view>
  </view>
</template>

<script>
import price from 'packages/components/price/price'
export default {
  components: {
    price
  },
  props: {
    orderInfo: {
      type: Object,
      default: () => ({ items: [], actualamount: 0, deliveryfee: 0, ordernumber: 0 })
    },
    subcategory: {
      type: Number,
      default: 0
    },
    type: {
      type: Number,
      default: 0
    },
    showTotal: {
      type: Boolean,
      default: true
    },
    showOrderNumber: {
      type: Boolean,
      default: false
    },
    cardTitle: {
      type: String,
      default: '礼品信息'
    }
  },
  computed: {
    // 总件数
    totalQuantity() {
      return this.orderInfo.items?.reduce((total, item) => total + item.quantity, 0)
    }
  },
  methods: {
    handleCourier(item) {
      this.$emit('handleCourier', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.orderDetail-info {
  .info-top {
    font-size: 28rpx;
    font-weight: 700;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    .order-no {
      font-size: 24rpx;
      color: #666;
      font-weight: 400;
    }
  }

  .info-content {
    display: flex;
    overflow: hidden;
    align-items: center;

    & + .info-content {
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #e5e5e5;
    }

    .info-img {
      width: 160rpx;
      height: 160rpx;
      text-align: center;
      position: relative;

      .img-full {
        width: 100%;
        height: 100%;
      }

      .no-return-tip {
        color: #ff0000;
        font-size: 24rpx;
        width: 310rpx;
      }
    }

    .info-shop {
      margin-left: 20rpx;
      width: 72%;

      .info-shop-top {
        font-size: 28rpx;
        font-weight: 700;
        text-align: left;
        color: #000;
        line-height: 36rpx;
        margin-bottom: 20rpx;
      }

      .info-shop-size {
        font-size: 24rpx;
        font-weight: 500;
        text-align: left;
        color: #999;
        line-height: 30rpx;
        margin-bottom: 20rpx;
      }

      .info-shop-price {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 24rpx;

        .shop-price-le {
          display: flex;
          font-weight: 700;
          align-items: center;

          .plus-margin {
            margin: 0 5rpx;
          }
        }

        .shop-price-ri {
          color: #666;
        }
      }
    }
  }

  .order-summary {
    width: 100%;
    text-align: right;
    border-top: 1rpx solid #eee;

    .order-main {
      font-size: 24rpx;
      color: #222;
      margin-top: 15rpx;
      font-weight: 700;
      .order-amount {
        color: $bg-color;
        font-weight: bold;
        margin-left: 4rpx;
      }
    }

    .order-extra {
      font-size: 12px;
      color: #888;
      margin-top: 4rpx;
    }
  }
}
.b-i-inline {
  display: inline-block;
}
</style>
