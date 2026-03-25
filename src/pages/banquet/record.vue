<template>
  <view :style="themeVars">
    <view class="search-content">
      <view class="search-box">
        <selector-picker
          v-model="filter.orderstatus"
          class="selector-width"
          :options="rewardTypeOptions"
          :value="filter.orderstatus"
          range-key="label"
        />
        <SelectorDate v-model="dateValue" time-str="请选择时间" class="flex-1 ml-18" />
      </view>
      <view class="search-box">
        <selector-picker
          v-model="filter.type"
          class="selector-width"
          :options="searchTypeOption"
          :value="filter.type"
          range-key="label"
        />
        <search-input v-model="filter.keyword" class="ml-18 flex-1" placeholder=" 请输入" @search="handleSearch" />
      </view>
    </view>
    <view style="height: 200rpx" />

    <view class="content">
      <list-item :list="list" :reward-type-option="rewardTypeOption" />
      <load-more v-if="!loading && list.length" :has-more="hasMore" />
      <none-data v-if="!list.length && !loading" msg="暂无记录" class="none-data" />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiBanquetOrders } from 'packages/api/banquet.js'
import SelectorDate from '@/components/search/selector-date'
import SelectorPicker from '@/components/search/selector-picker'
import SearchInput from '@/components/search/search-input'
import ListItem from './components/record-item.vue'
import NoneData from '@/components/none-data/none-data.vue'
import LoadMore from '@/components/load-more/index.vue'
export default {
  components: {
    SelectorPicker,
    SelectorDate,
    SearchInput,
    ListItem,
    NoneData,
    LoadMore
  },
  data() {
    return {
      dateValue: '', // 日期
      rewardTypeOption: [
        //  奖品类型
        {
          val: -1,
          label: '全部'
        },
        {
          val: 0,
          label: '报名审核'
        },
        {
          val: 2,
          label: '未通过'
        },
        {
          val: 1,
          label: '待送货'
        },
        {
          val: 3,
          label: '待结单'
        },
        {
          val: 4,
          label: '结单中',
          hide: true
        },
        {
          val: 5,
          label: '结单通过'
        },
        {
          val: 6,
          label: '结单未通过'
        },
        {
          val: 7,
          label: '已结单待审核'
        },
        {
          val: 8,
          label: '已申诉待审核'
        }
      ],
      searchTypeOption: [
        //  奖品类型
        {
          val: 2,
          label: '单号'
        },
        {
          val: 1,
          label: '宴席主'
        },
        {
          val: -1,
          label: '全部'
        }
      ],
      list: [],
      paging: {
        pageindex: 1,
        pagesize: 10
      },
      filter: {
        activityid: '',
        orderstatus: -1,
        type: -1,
        keyword: '',
        starttime: '',
        endtime: ''
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    rewardTypeOptions() {
      return this.rewardTypeOption.filter(item => !item.hide)
    }
  },
  async onLoad(options) {
    this.filter.activityid = options.id
  },
  onShow() {
    this.handleSearch()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.pageindex++
      this.getData()
    }
  },
  methods: {
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      let query = Object.assign({}, this.paging, this.filter)
      if (this.dateValue) {
        query.starttime = this.dateValue.split(',')[0]
        query.endtime = this.dateValue.split(',')[1]
      }
      let res = await apiBanquetOrders(query)
      if (this.$ck(res, true)) {
        this.list = [...this.list, ...res.return_data]
        // 判断加载完成
        this.hasMore = res.return_count > this.list.length
        this.busy = false
        this.loading = false
      }
    },
    handleSearch() {
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.list = []
      this.paging = {
        pageindex: 1,
        pagesize: 10
      }
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-box {
  display: flex;
  margin: 20rpx 30rpx 20rpx 30rpx;
  ::v-deep .search-btn {
    margin-left: 10rpx;
  }
}
.ml-18 {
  margin-left: 18rpx;
}
.search-content {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  background: #f4f4f4;
  width: 100%;
}
</style>
