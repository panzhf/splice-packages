<template>
  <!-- 会员小程序：服务记录 -->
  <view class="service-record-page">
    <!-- 搜索条件固定顶部 -->
    <view class="filter-header">
      <view class="filter-wrap p-20">
        <view class="search-box mb-20">
          <view class="time-content flex flex-1 flex-middle" @tap="timeVisible1 = true">
            <text v-if="timeStart" class="time-range-text c-3 fs-28">
              {{ timeStart }}
              <text class="ml-20 mr-20">-</text>
              {{ timeEnd }}
            </text>
            <text v-else class="time-placeholder fs-28">请选择服务时间</text>
            <text v-if="timeStart" class="icon iconfont icon-close2 clear-time" @tap.stop="handleClearTime" />
            <text class="iconfont icon-sanjiao ml-10 time-arrow" />
          </view>
        </view>
        <view class="search-box flex">
          <search-input
            v-model="serviceno"
            class="input-width"
            placeholder="请输入服务单号"
            :max-length="20"
            :showSearchBtn="false"
            custom-style="border: 1rpx solid #DDDDDD;" 
            @search="handleSearch"
          />
          <search-input
            v-model="warrantycode"
            class="flex-1 ml-20"
            placeholder="请输入质保码ID"
            custom-style="border: 1rpx solid #DDDDDD;"
            btn-style="background: linear-gradient(90deg, #FFA200 0%, #FFD461 100%), #FFFFFF; color: #fff;border-radius: 36rpx;"
            @search="handleSearch"
          />
        </view>
      </view>
    </view>

    <!-- 列表区域，预留顶部空间 -->
    <view class="record-panel p-20">
      <exchange-record-list
        :list="recordList"
        record-type="service"
        :has-more="hasMore"
        :loading="loading"
        @loadMore="loadMore"
      />
      <none-data v-if="recordList.length === 0 && !loading" msg="暂无服务记录" />

      <!-- 开始 / 结束时间 u-picker，依次弹出，选完后回显到上方输入框 -->
      <u-picker
        v-model="timeVisible1"
        title="开始时间"
        mode="time"
        :mask-close-able="false"
        @cancel="timePickerClose"
        @confirm="e => timeConfirm(e, 'start')"
      />
      <u-picker
        v-model="timeVisible2"
        title="结束时间"
        mode="time"
        :mask-close-able="false"
        @cancel="timePickerClose"
        @confirm="e => timeConfirm(e, 'end')"
      />
    </view>
  </view>
</template>

<script>
import { apiPageUserServiceRecord } from 'packages/api/warranty'
import ExchangeRecordList from './components/exchange-record-list.vue'
import NoneData from '@/components/none-data/index.vue'
import SearchInput from 'packages/components/search/search-input.vue'

export default {
  name: 'ServiceRecord',
  components: {
    ExchangeRecordList,
    NoneData,
    SearchInput
  },
  data() {
    return {
      serviceno: '',
      warrantycode: '',
      dateValue: '',
      timeVisible1: false,
      timeVisible2: false,
      startTimestamp: 0,
      tempStart: '',
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
    storeId() {
      try {
        const info = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
        return info.storeId || 0
      } catch {
        return 0
      }
    }
  },
  onShow() {
    this.$nextTick(() => {
      if (this.recordList.length === 0) this.handleSearch()
    })
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    pad2(n) {
      return String(n).padStart(2, '0')
    },
    timeConfirm(e, state) {
      if (state === 'start') {
        this.startTimestamp = e.timestamp
        this.timeVisible1 = false
        this.tempStart = `${e.year}-${this.pad2(e.month)}-${this.pad2(e.day)}`
        this.timeVisible2 = true
      } else {
        if (e.timestamp <= this.startTimestamp) {
          setTimeout(() => {
            this.timeVisible2 = true
          }, 1000)
          return this.$msg('结束时间不能小于开始时间')
        }
        this.dateValue = `${this.tempStart},${e.year}-${this.pad2(e.month)}-${this.pad2(e.day)}`
        this.timeVisible2 = false
        this.handleSearch()
      }
    },
    /** 取消时清空已选时间，与 date-picker 的 timePickerClose + resetTime 一致 */
    timePickerClose() {
      this.timeVisible1 = false
      this.timeVisible2 = false
      this.resetTime()
    },
    resetTime() {
      this.dateValue = ''
      this.tempStart = ''
      this.startTimestamp = 0
    },
    handleClearTime() {
      this.resetTime()
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
    getData() {
      if (this.busy) return
      this.busy = true
      const pageIndex = this.form.pageIndex + 1
      const params = {
        serviceno: this.serviceno,
        warrantycode: this.warrantycode,
        timestart: this.timeStart ? `${this.timeStart} 00:00:00` : '',
        timeend: this.timeEnd ? `${this.timeEnd} 23:59:59` : '',
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        storeid: this.storeId
      }
      apiPageUserServiceRecord(params)
        .then(res => {
          if (this.$ck(res)) {
            const d = this.$toLowerKey(res, true)
            const results = d.return_data && d.return_data.results ? d.return_data.results : []
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
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.service-record-page {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
}

/* 搜索条件固定顶部 */
.filter-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: $uni-bg-color-grey;
  padding: 20rpx;
}

.record-panel {
  padding: 220rpx 20rpx 20rpx; /* 顶部预留固定搜索区域高度 */
} 

.input-width {
  width: 275rpx;
}

.time-content {
  flex: 1;
  height: 76rpx;
  background: #fff;
  border: 1rpx solid #dddddd;
  color: #333333;
  border-radius: 35rpx;
  position: relative;
  padding: 0 30rpx;
}

.time-range-text,
.time-placeholder {
  flex: 1;
  text-align: left;
}

.clear-time {
  flex-shrink: 0;
  margin-left: 10rpx;
  padding: 10rpx;
  font-size: 32rpx;
  color: #999;
}

.time-arrow {
  flex-shrink: 0;
  color: #c1c1c1;
  font-size: 12rpx;
}
</style>
