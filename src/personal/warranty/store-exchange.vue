<template>
  <view class="store-exchange-page container" :style="themeVars">
    <view class="container-header bg-white">
      <tab
        :active-index.sync="activeIndex"
        :tab="tabArr"
        :draw-height="6"
        :draw-width="60"
        inactive-color="#666"
        :active-bag-color="themeInfo.color"
        @change="handleTabChange"
      />
    </view>
    <view :style="{ height: tabHeaderHeight }"></view>

    <warranty-query ref="warrantyQuery" v-show="activeIndex === 0" />
    <exchange-record
      v-show="activeIndex === 1"
      ref="exchangeRecord"
      :visible="activeIndex === 1"
    />
  </view>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Tab from '@/components/tab/index.vue'
import WarrantyQuery from './components/warranty-query.vue'
import ExchangeRecord from './components/exchange-record.vue'

export default {
  name: 'StoreExchange',
  components: { Tab, WarrantyQuery, ExchangeRecord },
  data() {
    return {
      tabArr: [
        { name: '质保查询', value: '0' },
        { name: '换新记录', value: '1' }
      ],
      activeIndex: 0
    }
  },
  computed: {
    ...mapState(['themeInfo']),
    ...mapGetters(['themeVars']),
    tabHeaderHeight() {
      return '96rpx'
    }
  },
  onLoad(options) {
    if (options.tab === '1') {
      this.activeIndex = 1
    }
  },
  onShow() {
    // 页面级 onShow：从补登记页返回时读取 storage 并触发质保查询（子组件 onShow 在部分场景不可靠）
    this.$nextTick(() => {
      const q = this.$refs.warrantyQuery
      if (q && typeof q.applySupplementSuccessFromStorage === 'function') {
        q.applySupplementSuccessFromStorage()
      }
    })
    if (this.activeIndex === 1 && this.$refs.exchangeRecord && this.$refs.exchangeRecord.recordList.length === 0) {
      this.$refs.exchangeRecord.handleSearch()
    }
  },
  onReachBottom() {
    if (this.activeIndex === 1 && this.$refs.exchangeRecord) {
      this.$refs.exchangeRecord.loadMore()
    }
  },
  watch: {
    activeIndex(val) {
      if (val === 1 && this.$refs.exchangeRecord && this.$refs.exchangeRecord.recordList.length === 0) {
        this.$nextTick(() => this.$refs.exchangeRecord && this.$refs.exchangeRecord.handleSearch())
      }
    }
  },
  methods: {
    handleTabChange() {
      if (this.activeIndex === 1 && this.$refs.exchangeRecord && this.$refs.exchangeRecord.recordList.length === 0) {
        this.$nextTick(() => this.$refs.exchangeRecord && this.$refs.exchangeRecord.handleSearch())
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.store-exchange-page {
  background-color: $uni-bg-color-grey; 
}
.store-exchange-page.container {
  background: #f5f5f5;
}
.container-header {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
