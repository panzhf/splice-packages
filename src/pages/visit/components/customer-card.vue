<template>
  <view class="customer-card-wrapper">
    <view class="customer-header-box">
      <view class="customer-content">
        <image
          class="customer-avatar"
          :src="customerInfo.avatar || defaultAvatar"
          mode="aspectFill"
        />
        <view class="customer-info c-6 fs-24 flex-1">
          <view class="c-3 fw-bold fs-28 mb-10">{{ customerInfo.customername || '' }}</view>
          <!-- 任务模式显示地址 -->
          <view v-if="mode === 'task'" class="customer-extra">
             {{ customerInfo.address || '' }}
          </view>
          <!-- 详情模式显示编号 -->
          <view v-else-if="mode === 'detail' && customerInfo.customerno" class="customer-extra">
            {{ customerInfo.customerno }}
          </view>
        </view>
        <!-- 右侧操作插槽 -->
        <view class="customer-action">
          <slot name="action"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { STATIC_URL } from '@/config'

export default {
  name: 'CustomerCard',
  props: {
    // 客户信息对象
    customerInfo: {
      type: Object,
      default: () => ({})
    },
    // 展示模式：task-任务模式（显示地址），detail-详情模式（显示编号）
    mode: {
      type: String,
      default: 'task'
    },
    // 客户类型：1-门店，2-经销商
    customerType: {
      type: Number,
      default: 1
    }
  },
  computed: {
    // 根据客户类型返回对应的默认图片
    defaultAvatar() {
      if (this.customerType === 2) {
        // 经销商
        return STATIC_URL + 'common/dealer-default.png'
      } else {
        // 门店（默认）
        return STATIC_URL + 'common/shop-default.png'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.customer-card-wrapper {
  .customer-header-box {
    background: #fff;
    border-bottom: 4rpx solid $uni-color-primary;

    .customer-content {
      display: flex;
      align-items: center;
      padding: 20rpx 30rpx;

      .customer-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
        flex-shrink: 0;
        background: #f5f5f5;
      } 
    }
  }
  .c-3 {
    color: #333;
  }
}
</style>

