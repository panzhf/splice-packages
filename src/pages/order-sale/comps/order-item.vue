<template>
  <view class="order-item" :style="themeVars" @click="handleClick">
    <!-- 订单头部 -->
    <view class="order-head">
      <view class="head-left c-3 fs-28">
        <!-- 我的订单 -->
        <view v-if="mode === 'order'" class="flex flex-middle">
          <image :src="hbImage" class="hb-image mr-10" />
          <text class="primary-color fs-32 fw-bold">￥{{ order.totalamount | cashFixedTwo }}</text>
        </view>
        <slot v-else name="head-left" />
      </view>

      <!-- 样式3: 订单状态 - 显示状态文字 -->
      <view v-if="mode === 'order'" class="head-right">
        <text :class="['status-text fs-28 fw-bold', getStatusClass(order.orderstatus)]">
          {{ getStatusText(order.orderstatus) }}
        </text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <view
        v-for="(product, index) in order.orderdetails"
        :key="index"
        class="product-item flex"
        :class="mode === 'order' ? 'pb-20 pt-20' : 'pb-40 pt-40'"
        :style="itemStyle"
      >
        <!-- 勾选框 -->
        <u-checkbox
          v-if="isEdit"
          :value="product.isChecked"
          class="mt-40 check-box"
          size="36"
          shape="circle"
          :active-color="activeTabColor"
          :disabled="!product.stock"
          @change="handleChange($event, index, 'isChecked')"
        />
        <view class="flex-1 flex">
          <view class="product-image-wrapper flex flex-middle flex-center mr-20">
            <image :src="product.goodspicurl" class="product-image" mode="aspectFit" />
          </view>
          <view class="flex-1">
            <text class="fs-28 fw-bold">
              {{ product.goodsname }}
              <text v-if="product.goodsformatname">-{{ product.goodsformatname }}</text>
            </text>

            <view class="flex mt-10 c-6 flex-middle product-info-wrapper">
              <view v-if="mode !== 'order'" class="product-content flex-1">
                <view class="reward-info">
                  <text>奖励红包：</text>
                  <text class="primary-color">￥{{ product.unitreward | cashFixedTwo }}</text>
                </view>
                <view v-if="!order.orderstatus" class="reward-info">
                  <view v-if="product.existundeductorder" class="error-color">
                    <view>库存更新中，请稍后再重试~</view>
                  </view>
                  <text v-else>库存数量：{{ product.stock }}</text>
                </view>
              </view>
              <!-- 数量选择器 -->
              <view v-if="isEdit && !product.existundeductorder" class="quantity-wrapper">
                <quantity-selector
                  :value="product.quantity"
                  :max="product.stock"
                  @change="handleChange($event, index, 'quantity')"
                />
              </view>
              <text v-else-if="!isEdit" class="fs-24 c-6">x{{ product.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 时间信息 -->
    <view v-if="mode === 'order'" class="time-info pt-20 c-6">
      <template v-if="[4, 5].includes(order.orderstatus)">
        <text class="time-label">审核时间:</text>
        <text class="time-value">{{ order.audittime || '' }}</text>
      </template>
      <template v-else>
        <text class="time-label">提交时间:</text>
        <text class="time-value">{{ order.addtime || '' }}</text>
      </template>
    </view>
  </view>
</template>

<script>
import QuantitySelector from './quantity-selector.vue'
import { staticURL } from '@/config'
import { activeColor } from 'packages/utils/default-picture'
import { cashFixedTwo } from 'packages/filters'

export default {
  name: 'OrderItem',
  components: {
    QuantitySelector
  },
  filters: {
    cashFixedTwo
  },
  props: {
    order: {
      type: Object,
      required: true
    },
    // 样式类型: 'sold'(售出商品), 'edit'(提交订单), 'order'(订单状态)
    mode: {
      type: String,
      default: 'order',
      validator: value => ['sold', 'edit', 'order'].includes(value)
    },
    itemStyle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeColor
    }
  },
  computed: {
    isEdit() {
      return this.mode === 'edit'
    },
    hbImage() {
      return staticURL(true) + 'order-sale/hb.png'
    },
    activeTabColor() {
      let color = this.activeColor
      // #ifdef MP-RETAIL
      color = this.themeInfo.color
      // #endif
      return color
    }
  },
  methods: {
    handleChange(val, index, prop) {
      // 更新值
      const value = prop === 'isChecked' ? val?.value : val
      this.$emit('change', value, index, prop)
    },
    // 获取状态文本
    getStatusText(status) {
      // 1-待转发、3-待审核、4-审核通过、5-审核不通过
      const statusMap = {
        1: '待转发',
        3: '待审核',
        4: '审核通过',
        5: '审核不通过'
      }
      return statusMap[status] || ''
    },
    // 获取状态样式类
    getStatusClass(status) {
      switch (status) {
        case 5:
          return 'error-color'
        case 4:
          return 'status-approved'
        default:
          return 'primary-color'
      }
    },

    // 点击订单
    handleClick() {
      this.$emit('click', this.order)
    }
  }
}
</script>

<style lang="scss" scoped>
.order-item {
  position: relative;

  margin: 0 20rpx 20rpx;
  padding: 30rpx;

  border-radius: 10rpx;
  background: #ffffff;
  .order-head {
    display: flex;
    justify-content: space-between;

    .head-left {
      .hb-image {
        width: 40rpx;
        height: 40rpx;
      }
    }

    .head-right {
      .status-text {
        &.status-approved {
          color: #333;
        }
      }
    }
  }

  .product-info {
    .product-item {
      position: relative;

      overflow: hidden;

      width: 100%;
      .check-box {
        width: 56rpx;
      }
      .product-image-wrapper {
        width: 120rpx;
        height: 120rpx;

        border-radius: 8rpx;
        background: #f6f6f6;
        .product-image {
          width: 120rpx;
          height: 120rpx;
        }
      }
    }
    .product-item:last-child {
      padding-bottom: 0;
    }
    .product-item:not(:last-child) {
      @include border-bottom(#e5e5e5);
    }
    .product-info-wrapper {
      position: relative;
    }

    .quantity-wrapper {
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }

  .time-info {
    margin-top: 20rpx;

    @include border-top(#e5e5e5);
  }
}
</style>
