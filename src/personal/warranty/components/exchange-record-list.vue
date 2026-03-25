<template>
  <view class="list-wrap">
    <view v-for="(item, idx) in list" :key="idx" class="record-card bg-f br-10 p-30 mb-20">
      <!-- 头部：服务单号 + 时间 | 补货状态（仅门店换新记录展示） -->
      <view class="card-header flex flex-between">
        <view class="card-header__left">
          <view class="card-service-no fs-30 fw-bold c-3">服务单号：{{ item.serviceno || '-' }}</view>
          <view v-if="item.servicetime" class="card-service-time fs-28 mt-10">
            {{ item.servicetime }}
          </view>
        </view>
        <text
          v-if="recordType === 'store'"
          class="fw-bold"
          :class="['card-status', 'fs-28', item.replenishstatus === 1 ? 'success-color' : 'error-color']"
        >
          {{ item.replenishstatus === 1 ? '已补货' : '未补货' }}
        </text>
      </view>
      <!-- 中间：旧码 → 换新为 → 新码 -->
      <view class="card-body fs-28 mt-30 pt-30 bd-t-e">
        <view class="card-row">
          <text class="card-label c-3">旧SN码：</text>
          <text class="card-value c-3">{{ item.oldsmallserialnumber || '-' }}</text>
        </view>
                <view class="card-row">
          <text class="card-label c-3">旧质保码：</text>
          <text class="card-value c-3">{{ item.oldcodestr || '-' }}</text>
        </view>
        <view class="card-arrow-row tx-l flex flex-middle">
          <text class="mdfont icon-huanxinicon fs-20 mr-10 primary-color"></text>
          <text class="fs-24 primary-color">换新为</text>
        </view>
        <view class="card-row">
          <text class="card-label c-3">新SN码：</text>
          <text class="card-value c-3">{{ item.newsmallserialnumber || '-' }}</text>
        </view>
        <view class="card-row">
          <text class="card-label c-3">新质保码：</text>
          <text class="card-value c-3">{{ item.newcodestr || '-' }}</text>
        </view>
      </view>
      <!-- 底部：继承保修期至 -->
      <view class="card-footer fs-30 flex flex-middle mt-30 pt-30 bd-t-e primary-color">
        <text class="card-label">继承保修期至：</text>
        <text class="card-value">{{ item.inheritedwarrantyendtime || '-' }}</text>
      </view>
    </view>

    <load-more v-if="list.length" :has-more="hasMore" :loading="loading" @click="$emit('loadMore')" />
  </view>
</template>

<script>
import LoadMore from '@/components/load-more/index.vue'

export default {
  name: 'ExchangeRecordList',
  components: {
    LoadMore
  },
  props: {
    /** 列表数据 */
    list: {
      type: Array,
      default: () => []
    },
    /** 记录类型：store-门店换新记录，service-服务记录 */
    recordType: {
      type: String,
      default: 'store'
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.list-wrap {
  margin: 0;
}

.card-header__left {
  min-width: 0;
  flex: 1;
}

.card-service-time { 
  color: #aaa;
}

.card-body .card-row {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  margin-bottom: 12rpx;
  min-width: 0;
}

.card-body .card-row:last-of-type {
  margin-bottom: 0;
}

.card-arrow-row {
  margin: 20rpx 0;
} 
/*  #ifdef MP-MEMBER   */
.p-30 {
  padding: 30rpx;
}
.bd-t-e {
  border-top: 1rpx solid #e5e5e5;
}
/*  #endif  */
</style>
