<template>
  <view class="record-panel p-20">
    <view class="filter-wrap">
      <view class="search-box">
        <selector-picker
          v-model="timeType"
          class="selector-width"
          :options="timeTypeOptions"
          :value="timeType"
          range-key="label"
          placeholder="时间类型"
        />
        <selector-date v-model="dateValue" class="flex-1 ml-20" time-str="日期范围" />
      </view>
      <view class="search-box">
        <search-input
          v-model="serviceno"
          class="input-width"
          placeholder="请输入服务单号"
          :max-length="20" 
          :showSearchBtn="false" 
        />
        <search-input
          v-model="warrantycode"
          class="flex-1 ml-20"
          placeholder="请输入质保码ID"
          @search="handleSearch"
        />
      </view>
    </view>

    <exchange-record-list
      :list="recordList"
      record-type="store"
      :has-more="hasMore"
      :loading="loading"
      @loadMore="loadMore"
    />
    <none-data
      v-if="recordList.length === 0 && !loading"
      :icon="noneIcon"
      msg="暂无换新记录"
      icon-width="256"
      icon-height="190"
    />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiPageStoreExchangeRecord } from 'packages/api/warranty'
import ExchangeRecordList from './exchange-record-list.vue'
import NoneData from '@/components/none-data/none-data.vue'
import SelectorPicker from '@/components/search/selector-picker'
import SelectorDate from '@/components/search/selector-date'
import SearchInput from '@/components/search/search-input'

export default {
  name: 'ExchangeRecord',
  components: { ExchangeRecordList, NoneData, SelectorPicker, SelectorDate, SearchInput },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      serviceno: '',
      warrantycode: '',
      timeType: 1,
      dateValue: '',
      timeTypeOptions: [
        { label: '服务时间', val: 1 },
        { label: '补货时间', val: 2 }
      ],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      recordList: [],
      hasMore: true,
      loading: true,
      busy: false
    }
  },
  computed: {
    timeStart() {
      if (!this.dateValue) return ''
      const arr = this.dateValue.split(',')
      return arr[0] || ''
    },
    timeEnd() {
      if (!this.dateValue) return ''
      const arr = this.dateValue.split(',')
      return arr[1] || ''
    },
    searchParams() {
      return `${this.timeType}${this.dateValue}${this.serviceno}${this.warrantycode}`
    }
  },
  methods: {
    resetSearch() {
      this.serviceno = ''
      this.warrantycode = ''
      this.timeType = 1
      this.dateValue = ''
    },
    onResetFilter() {
      this.resetSearch()
      this.handleSearch()
    },
    handleSearch() {
      setTimeout(() => {
        this.recordList = []
        this.form.pageIndex = 0
        this.hasMore = true
        this.loading = true
        this.getData()
      }, 200)
    },
    loadMore() {
      if (this.hasMore && !this.busy) this.getData()
    },
    getData(cb) {
      if (this.busy) return
      this.busy = true
      const pageIndex = this.form.pageIndex + 1
      const params = {
        serviceno: this.serviceno,
        warrantycode: this.warrantycode,
        timetype: this.timeType,
        timestart: this.timeStart,
        timeend: this.timeEnd,
        pageindex: pageIndex,
        pagesize: this.form.pageSize
      }
      apiPageStoreExchangeRecord(params)
        .then(res => {
          if (this.$ck(res)) {
            const d = this.$toLowerKey(res, true)
            const results = (d.return_data && d.return_data.results) ? d.return_data.results : []
            this.form.pageIndex = pageIndex
            this.recordList = [...this.recordList, ...results]
            this.hasMore = results.length >= this.form.pageSize
          } else {
            this.hasMore = false
          }
          this.busy = false
          this.loading = false
        })
        .catch(() => {
          this.busy = false
          this.loading = false
          typeof cb === 'function' && cb()
        })
    }
  }
}
</script>

<style lang="scss" scoped>  
.search-box {
  display: flex;
  margin: 0 0 20rpx;
}

.selector-width {
  width: 220rpx;
  flex-shrink: 0;
}

.input-width {
  width: 275rpx;
}
</style>
