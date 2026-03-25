<template>
  <view class="page-group-buy pb-30">
    <view class="search-content">
      <!-- #ifdef MP-RETAIL -->
      <view class="search-box flex">
        <selector-picker
          v-model="filter.orderstatus"
          class="selector-width"
          :options="statusTypeOption"
          range-key="label"
        />
        <SelectorDate v-model="dateValue" time-str="请选择时间" class="flex-1 ml-20" />
      </view>
      <view class="search-box flex">
        <search-input v-model="filter.ordernokeyword" class="flex-1" placeholder="输入订单号" @search="handleSearch" />
      </view>
      <!-- #endif -->
      <!-- #ifdef MP-SALE -->
      <view class="date-wrap flex">
        <view class="picker flex-1" @tap="timeVisible1 = true">
          <view class="date-content flex flex-middle flex-between">
            <view v-show="filter.starttime == ''">请选择提报时间</view>
            <view v-show="filter.starttime != ''">
              {{ filter.starttime }} - {{ filter.endtime }}
              <text class="iconfont iconshanchu" @tap.stop="removeTime" />
            </view>
            <view class="iconfont iconrili" />
          </view>
        </view>
      </view>
      <view class="input-hexiao-wrap flex flex-middle mt-20">
        <view class="picker flex-1" @click="storePicker = true">
          <view class="picker-box">
            {{ storeName }}
            <view class="iconfont iconsanjiaojiantou rotate90" />
          </view>
        </view>
        <picker
          mode="selector"
          range-key="label"
          :range="statusTypeOption"
          class="picker flex-1 ml-20"
          @change="handleStatusChange"
        >
          <view class="picker-box">
            {{ statusLabel }}
            <view class="iconfont iconsanjiaojiantou rotate90" />
          </view>
        </picker>
        <view class="primary-search-btn" @click="handleSearch">搜索</view>
      </view>
      <!-- #endif -->
    </view>
    <view class="list-content">
      <order-item v-for="(item, index) in list" :key="index" :info="item" @audit="handleAudit" @cancel="onCancel" />
      <load-more v-if="!loading && list.length" :has-more="hasMore" />
      <view v-if="showNoneData" class="none-data">
        <none-data msg="暂无记录" />
      </view>
    </view>

    <!-- #ifdef MP-SALE -->
    <template v-if="showApplyBtn">
      <view style="height: 150rpx" />
      <view class="btn-info">
        <button class="primary-btn round" @tap="showActivity = true">代提报</button>
      </view>
    </template>
    <activity-picker v-model="showActivity" @select="handleApply" />
    <u-picker
      v-model="timeVisible1"
      title="开始时间"
      mode="time"
      :mask-close-able="false"
      @cancel="removeTime"
      @confirm="
        e => {
          timeConfirm(e, 'start')
        }
      "
    />
    <u-picker
      v-model="timeVisible2"
      title="结束时间"
      :mask-close-able="false"
      mode="time"
      @cancel="removeTime"
      @confirm="
        e => {
          timeConfirm(e, 'end')
        }
      "
    />
    <store-picker v-model="storePicker" :select-id="filter.storeid" @submit="handleStoreChange" />
    <AuditPopup
      v-model="auditPopupVisible"
      :mode="auditPopup.checkresult"
      @confirm="handleAuditConfirm($event, 'list')"
    />
    <!-- #endif -->
    <common-popup
      v-model="showPopup"
      type="confirm"
      :title="popTitle"
      :content="popContent"
      @confirm="onPopupConfirm(1)"
    />
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiOrderList,
  // #ifdef MP-SALE
  apiActivitySetting
  // #endif
} from 'packages/api/group-buy'
import LoadMore from 'packages/components/load-more/index.vue'
import SelectorPicker from '@/components/search/selector-picker'
// #ifdef MP-RETAIL
import SearchInput from '@/components/search/search-input'
import SelectorDate from '@/components/search/selector-date'
// #endif
// #ifdef MP-SALE
import NoneData from '@/components/nodata.vue'
import ActivityPicker from './components/activity-picker.vue'
import StorePicker from '@/components/people-picker/store-picker.vue'
import AuditPopup from 'packages/components/audit-popup/audit-popup.vue'
import { auditMixin } from './mixins'
// #endif
import { cancelMixin } from './mixins'
import OrderItem from './components/order-item.vue'
import loadMoreMixin from 'packages/mixins/load-more'
import refreshPageMixin from '@/mixins/refresh-page'

import { statusType } from './config'
export default {
  components: {
    LoadMore,
    SelectorPicker,
    // #ifdef MP-RETAIL
    SearchInput,
    SelectorDate,
    // #endif
    // #ifdef MP-SALE
    NoneData,
    ActivityPicker,
    StorePicker,
    AuditPopup,
    // #endif
    OrderItem
  },
  mixins: [
    loadMoreMixin,
    refreshPageMixin,
    cancelMixin,
    // #ifdef MP-SALE
    auditMixin
    // #endif
  ],
  data() {
    return {
      // #ifdef MP-RETAIL
      activityId: 0,
      // #endif
      filter: {
        orderstatus: -1,
        ordernokeyword: '',
        starttime: '',
        endtime: '',
        // #ifdef MP-SALE
        storeid: 0
        // #endif
      },
      finalFilter: {
        orderstatus: -1,
        ordernokeyword: '',
        starttime: '',
        endtime: '',
        // #ifdef MP-SALE
        storeid: 0
        // #endif
      }, // 防止填写搜索表单后没点击搜索，使用填写数据加载更多，导致异常
      dateValue: '', // 日期
      statusTypeOption: [
        {
          val: -1,
          label: '全部状态'
        },
        ...statusType
      ],
      loading: true,
      cancelQuery: {},
      // #ifdef MP-SALE
      timeVisible1: false,
      timeVisible2: false,
      starttime: 0,
      endtime: 0,
      selectorIndex: 0,
      statusLabel: '全部状态',
      storeName: '全部门店',
      storePicker: false,
      showActivity: false,
      settings: {}
      // #endif
    }
  },
  // #ifdef MP-SALE
  computed: {
    isSale() {
      // userinfo.dealerid  0 // 厂家业务员  >0 // 经销商业务员
      return this.$store.state.userinfo.dealerid === 0
    },
    showApplyBtn() {
      // 经销商业务员默认有权限，厂家业务员受后台设置控制
      return !this.isSale || (this.isSale && this.settings.opensalesmanproxyapply === 1)
    }
  },
  // #endif
  onLoad(options) {
    // #ifdef MP-RETAIL
    this.activityId = +options.activityid
    // #endif
    // #ifdef MP-SALE
    this.fetchSettings()
    // #endif
  },
  onShow() {
    this.handleSearch()
  },
  methods: {
    refreshPage() {
      this.handleSearch()
    },
    async handleSearch() {
      this.finalFilter = { ...this.filter }
      // #ifdef MP-RETAIL
      const [starttime = '', endtime = ''] = (this.dateValue || '').split(',')
      this.finalFilter.starttime = `${starttime}`
      this.finalFilter.endtime = `${endtime}`
      // #endif
      // #ifdef MP-SALE
      this.filter.starttime && (this.finalFilter.starttime = `${this.filter.starttime} 00:00:00`)
      this.filter.endtime && (this.finalFilter.endtime = `${this.filter.endtime} 23:59:59`)
      // #endif
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
        const res = await apiOrderList({
          // #ifdef MP-RETAIL
          activityid: this.activityId,
          // #endif
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
    },
    onCancel(params) {
      this.cancelQuery = params
      this.handleCancel()
    },
    cancelCb() {
      setTimeout(() => {
        this.handleSearch()
      }, 1500)
    },
    // #ifdef MP-SALE
    async fetchSettings() {
      const res = await apiActivitySetting()
      if (this.$ck(res)) {
        this.settings = res.return_data
      }
    },
    removeTime() {
      this.filter.starttime = ''
      this.filter.endtime = ''
    },
    timeConfirm(e, state) {
      if (state === 'start') {
        this.timeVisible1 = false
        this.starttime = e.timestamp
        this.filter.starttime = `${e.year}-${e.month}-${e.day}`
        this.timeVisible2 = true
      } else {
        this.endtime = e.timestamp
        if (e.timestamp <= this.starttime) {
          setTimeout(() => {
            this.timeVisible2 = true
          }, 1000)
          return this.$msg('结束时间不能小于开始时间')
        }
        this.filter.endtime = `${e.year}-${e.month}-${e.day}`
        this.timeVisible2 = false
      }
    },
    handleStatusChange(e) {
      this.selectorIndex = Number(e.detail.value)
      const s = this.statusTypeOption[this.selectorIndex]
      this.filter.orderstatus = s.val
      this.statusLabel = s.label
    },
    handleStoreChange(e) {
      this.storeName = e.storename
      this.filter.storeid = e.storeid
    },
    handleApply(item) {
      this.$navPage(`./apply?activityid=${item.activityid}`)
    }
    // #endif
  }
}
</script>

<style lang="scss" scoped>
@import './styles/common.scss';
@import './styles/list.scss';
</style>
