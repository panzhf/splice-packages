<template>
  <view class="page-expense-detail full-container pt-20">
    <view class="expense-header">
      <view class="flex ml-20 search-box flex-middle">
        发放时间：
        <view class="search-date flex flex-1" @tap="showDatePicker = true">
          <view v-if="dateFilter.startTime" class="flex-1">
            {{ dateFilter.startTime }}
            <text class="ml-10 mr-10">-</text>
            {{ dateFilter.endTime }}
          </view>
          <view v-else class="flex-1">请选择发放时间</view>
          <text class="icon iconfont icon-more fs-28 c-2a ml-10" />
        </view>
      </view>
      <view class="flex ml-20 search-box flex-middle">
        门店：
        <search-input
          v-model="keyword"
          placeholder="名称、门店编号"
          custom-style="margin:0;padding-left:12rpx"
          :show-search-icon="false"
          class="flex-1"
          @search="handleSearch"
        />
        <button class="search-button fs-30" hover-class="button-action" @tap="handleSearch">搜索</button>
      </view>
      <date-picker
        v-model="showDatePicker"
        :default-date.sync="startDefault"
        class="flex-1"
        @confirm="datePickerComfirm"
      />
    </view>
    <view style="height: 210rpx" />
    <view class="main">
      <view class="count-box fw-medium fs-28 mb-30 c-6">
        累计发放金额：
        <text class="count fw-bold c-0">￥{{ totalamount | cashFixedTwo }}</text>
      </view>
      <view v-for="(item, index) in list" :key="index" class="item mb-30">
        <view class="flex">
          <view class="flex flex-middle flex-center mr-20">
            <image :src="item.storeheadpath" class="user-image" mode="widthFix" />
          </view>
          <view class="flex-1">
            <view class="mb-10">
              <text class="fs-28 fw-bold">￥{{ item.awardamount | cashFixedTwo }}品牌红包</text>

              <text v-if="item.sendstatus === -1" class="warn-color fs-24">（请联系客服补发）</text>
            </view>

            <view class="c-6 fs-24">
              <view class="flex flex-middle">
                门店名称：
                <text>{{ item.storename }}</text>
              </view>
              <view class="flex flex-middle">
                负责人：
                <text>{{ item.storeleader }}</text>
              </view>
              <view class="flex flex-middle">
                发放时间：
                <text>{{ item.awardsendtime }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <none-data
        v-if="showNoneData"
        msg="暂无数据"
        used-height="500"
        :icon="nonDataDefault"
        icon-width="140"
        icon-height="146"
      />
      <load-more v-if="!loading && list.length" :has-more="hasMore" />
    </view>
  </view>
</template>

<script>
import SearchInput from '@/components/search/search-input'
import DatePicker from '@/components/search/date-picker'
import LoadMore from '@/components/load-more'
import loadMoreMixin from '@/mixins/load-more-maxid'
import { apiStoreSalesGiftGetRedPacketRecords } from 'packages/api/StoreSalesGift'
import { nonDataDefault } from '@/utils/default-picture'
import { cashFixedTwo } from 'packages/filters'
export default {
  name: 'ExpenseDetail',
  components: { LoadMore, DatePicker, SearchInput },
  filters: {
    cashFixedTwo
  },
  mixins: [loadMoreMixin],
  data() {
    return {
      nonDataDefault,
      showDatePicker: false, // 显示时间选择
      totalCount: 0,
      totalamount: 0,
      keyword: '',
      dateFilter: '', // 时间
      loading: true,
      activityid: ''
    }
  },
  onLoad(options) {
    this.activityid = options.activityid
    this.getData()
  },
  methods: {
    handleSearch() {
      this.resetData()
      this.totalCount = 0
      this.totalamount = 0
      this.getData()
    },
    datePickerComfirm(e) {
      if (!e) return
      this.dateFilter = {
        startTime: e.starttime,
        endTime: e.endtime
      }
      this.handleSearch()
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      try {
        const res = await apiStoreSalesGiftGetRedPacketRecords({
          pageindex: nextPage,
          pagesize: this.paging.pageSize,
          storekeyword: this.keyword,
          activityid: this.activityid,
          starttime: this.dateFilter?.startTime ? `${this.dateFilter.startTime} 00:00:00` : '',
          endtime: this.dateFilter?.endTime ? `${this.dateFilter.endTime} 23:59:59` : ''
        })
        if (this.$ck(res)) {
          res.return_data.list = res.return_data.results
          this.dealRes({ res, nextPage })
          let { totalamount, totalcount } = res.return_data
          this.totalamount = totalamount
          this.totalCount = totalcount
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-expense-detail {
  .expense-header {
    position: fixed;
    z-index: 2;
    top: 0;
    left: 0;

    width: 100%;

    background: #fff;
  }
  .main {
    margin: 0 30rpx 20rpx;
  }
  .search-box {
    display: flex;

    margin: 20rpx 30rpx 20rpx 30rpx;
    .search-date {
      height: 80rpx;
      padding: 0 32rpx;

      border-radius: 15rpx;
      background: #f5f5f5;

      line-height: 80rpx;
    }
    .search-button {
      flex-shrink: 0;

      margin-left: 20rpx;

      text-align: center;

      color: #fff;
      border-radius: 15rpx;
      background: #5d76ff;

      @include whl(110rpx, 80rpx);
    }
    .icon {
      transform: rotate(90deg);
    }
  }
  .item {
    padding: 30rpx 20rpx;

    border-radius: 10rpx;
    box-shadow: 0px 0px 8px 0px rgba(93, 118, 255, 0.2);
    .user-image {
      width: 100rpx;
      height: 100rpx;

      border-radius: 10rpx;
    }
  }
}
</style>
