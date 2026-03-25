<template>
  <view class="page-record">
    <!-- 筛选区域 - 固定顶部 -->
    <view class="search-header">
      <view class="search-box flex">
        <selector-picker v-model="filter.triggerstatus" class="selector-width" :options="statusOptions" range-key="label" />
        <SelectorDate v-model="dateValue" time-str="请选择时间" class="flex-1 ml-20" />
      </view>
      <view class="search-box flex">
        <search-input v-model="filter.logisticscode" class="flex-1" placeholder="输入登记码" @search="handleSearch" />
      </view>
    </view>

    <!-- 占位高度 -->
    <view style="height: 212rpx" />

    <!-- 列表内容 -->
    <view class="list-content">
      <view v-for="(item, index) in list" :key="index" class="record-item">
        <view
          v-for="field in getItemFields(item)"
          :key="field.key"
          :class="field.class"
          class="item-row flex fs-28"
        >
          <view class="label c-6">{{ field.label }}：</view>
          <view class="value flex-1 c-3">
            <template v-if="field.key === 'reward'">
              <text v-if="item.amount">￥{{ item.amount | cashFixedTwo }}</text>
              <text v-if="item.prizetype" class="ml-10">{{ item.prizetype | rewardTypwFilter }}</text>
            </template>
            <template v-else>
              {{ field.value || item[field.key] || '-' }}
            </template>
          </view>
        </view>
      </view>

      <load-more v-if="!loading && list.length" :has-more="hasMore" />

      <view v-if="showNoneData" class="none-data">
        <none-data msg="暂无记录" />
      </view>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiPagePromotionRecords } from 'packages/api/promotion-gift'
import { cashFixedTwo } from 'packages/filters'
import { rewardTypwFilter } from './filters'
import LoadMore from 'packages/components/load-more/index.vue'
import SelectorPicker from '@/components/search/selector-picker'
import SearchInput from '@/components/search/search-input'
import SelectorDate from '@/components/search/selector-date'
import loadMoreMixin from 'packages/mixins/load-more'
import refreshPageMixin from '@/mixins/refresh-page'

export default {
  components: {
    LoadMore,
    SelectorPicker,
    SearchInput,
    SelectorDate
  },
  filters: {
    cashFixedTwo,
    rewardTypwFilter
  },
  mixins: [loadMoreMixin, refreshPageMixin],
  data() {
    return {
      activityId: 0,
      filter: {
        triggerstatus: -1,
        logisticscode: '',
        starttime: '',
        endtime: ''
      },
      finalFilter: {
        triggerstatus: -1,
        logisticscode: '',
        starttime: '',
        endtime: ''
      },
      dateValue: '',
      statusOptions: [
        {
          val: -1,
          label: '全部状态'
        },
        {
          val: 1,
          label: '已触发'
        },
        {
          val: 2,
          label: '未触发'
        }
      ],
      loading: true
    }
  },
  onLoad(options) {
    if (!options.activityid) return this.$msg('参数错误')
    this.activityId = +options.activityid
    this.getData()
  },
  methods: {
    getItemFields(item) {
      const fields = [
        {
          key: 'addtime',
          label: '登记时间',
          class: 'bd-e'
        },
        {
          key: 'logisticscode',
          label: '登记码'
        },
        {
          key: 'goodsname',
          label: '商品名称',
          value: item.goodsformatname
            ? `${item.goodsname || ''}-${item.goodsformatname}`
            : item.goodsname
        },
        {
          key: 'triggertimes',
          label: '登记结果',
          value: `第${item.triggertimes}次`
        },
        {
          key: 'awardstatusstr',
          label: '发奖状态'
        }
      ]

      // 条件显示字段
      if (item.winstatus === 1) {
        fields.push({
          key: 'code',
          label: '触发码'
        })
        fields.push({
          key: 'reward',
          label: '奖励内容',
          class: 'primary-color'
        })
      }
      return fields
    },

    refreshPage() {
      this.handleSearch()
    },

    async handleSearch() {
      const finalFilter = { ...this.filter }
      if (this.dateValue) {
        finalFilter.starttime = this.dateValue.split(',')[0]
        finalFilter.endtime = this.dateValue.split(',')[1]
      } else {
        finalFilter.starttime = ''
        finalFilter.endtime = ''
      }
      this.finalFilter = finalFilter
      await this.resetData()
      this.getData(() => {
        this.$store.commit('updateRefreshTag', false)
      })
    },

    async getData(cb) {
      try {
        if (this.busy) return
        this.busy = true
        const nextPage = this.paging.page + 1
        const res = await apiPagePromotionRecords({
          activityid: this.activityId,
          pageindex: nextPage,
          pagesize: this.paging.pageSize,
          ...this.finalFilter
        })
        if (this.$ck(res)) {
          this.dealRes({ res, nextPage, listProp: 'results' })
        }
      } finally {
        this.busy = false
        this.loading = false
        typeof cb === 'function' && cb()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-record {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  background-color: #f5f5f5;

  .search-box {
    display: flex;
    margin: 20rpx 30rpx;

    & + .search-box {
      margin-top: 0;
    }
  }

  .selector-width {
    width: 240rpx;
  }
}

.list-content {
  padding: 0 20rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 30rpx 30rpx;
  margin-bottom: 20rpx;

  .item-row {
    padding-bottom: 12rpx;
    line-height: 36rpx;
    &:last-child {
      padding-bottom: 0;
    }
    &.bd-e {
      padding-bottom: 24rpx;
      margin-bottom: 24rpx;
      .value {
        color: #666;
      }
    }
    .label {
      width: 140rpx;
    }
    &.primary-color {
      .value {
        color: var(--theme-color, #ff7640);
      }
    }
  }
}

.none-data {
  padding-top: 200rpx;
}
</style>
