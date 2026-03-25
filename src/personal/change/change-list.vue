<template>
  <view :style="themeVars">
    <!-- 收支明细 -->
    <view class="budgetList-wrapper page-custom-color" style="min-height: 100vh"> 
      <view class="container-header" style="height: 256rpx">
        <!-- 提示横幅 --> 
        <view class="change-tips fs-24 c-red pl-30"> 
          <view>收支明细非实时更新，数据同步至本列表通常需要 1-2 分钟。</view>
          <view>若未看到最新记录，请稍后重新进入本页面即可。</view>
        </view> 
        <tab
          :tab="activiyTab"
          :draw-height="2"
          :draw-width="70"
          :active-index.sync="activiyTabIndex"
          :active-color="activeTabColor"
          :active-bag-color="activeTabColor"
          @change="handleTabChange"
        />
        <view class="flex pt-20 pl-30 page-custom-color">
          我的零钱余额：
          <text class="primary-color fw-bold">¥ {{ Pinmoney | cashFixedTwo }}</text>
        </view>
      </view>
      <view style="height: 256rpx" />
      <!-- 有记录 -->
      <view v-show="!loading" class="list-wrap">
        <view v-for="(item, index) in list" :key="index">
          <view class="item bd-e">
            <view class="flex flex-middle title">
              <view class="c-3 fs-28 fw-bold flex-1">
                <view class="ellipsis">{{ item.title }}</view>
              </view>
              <view :class="[item.direction === 1 ? 'c-0' : 'primary-color', 'fs-32', 'fw-bold']">
                {{ item.direction === 1 ? '+' : '-' }} ¥{{ item.amount | cashFixedTwo }}
              </view>
            </view>
            <view class="fs-24 c-9 time">
              {{ item.tradetime }}
              <view class="label">
                {{ item.source || '其他' }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <!--end  有记录 -->
      <none-data v-if="list.length === 0 && !loading" :icon="icon" :msg="msg" :icon-style="iconStyle" />
      <load-more v-if="list.length" :has-more="hasMore" />
    </view>
  </view>
</template>

<script>
import { apiExchangeList } from 'packages/api/change.js'
import Tab from 'packages/components/tab/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import { activeColor } from 'packages/utils/default-picture'
import { cashFixedTwo } from 'packages/filters'
import { staticURL } from '@/config'
// #ifdef MP-RETAIL
import { mapState } from 'vuex'
// #endif
// #ifndef MP-RETAIL
// 零售用宿主小程序的组件
import NoneData from 'packages/components/none-data/index.vue'
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    // #ifndef MP-RETAIL
    NoneData,
    // #endif
    LoadMore,
    Tab
  },
  filters: {
    cashFixedTwo
  },
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      activeColor: activeColor,
      activiyTab: ['全部', '收入', '支出'],
      activiyTabIndex: 0,
      Pinmoney: 0,
      list: [],
      paging: {
        pageindex: 1,
        pagesize: 10,
        tradetype: 0 // 交易类型，0全部，1收入，2支出
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    iconStyle() {
      let style = ''
      // #ifdef MP-SALE
      style = 'width: 300rpx;height: 208rpx'
      // #endif
      return style
    },
    // #ifdef MP-RETAIL
    ...mapState(['isSpecialMp']),
    // #endif
    activeTabColor() {
      let color = this.activeColor
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      color = this.themeInfo.color
      // }
      // #endif
      return color
    },
    icon() {
      let url = ''
      // #ifdef MP-SALE
      url = staticURL(true) + 'personal/no-income.png'
      // #endif
      return url
    },
    msg() {
      return this.activiyTabIndex === 0 ? '暂无收支明细' : this.activiyTabIndex === 1 ? '暂无收入明细' : '暂无支出明细'
    }
  },
  async onLoad() {
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.pageindex++
      this.getData()
    }
  },
  methods: {
    resetData() {
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.list = []
      this.paging = {
        pageindex: 1,
        pagesize: 10,
        tradetype: 0
      }
    },
    handleTabChange(e) {
      this.resetData()
      this.paging.tradetype = this.activiyTabIndex
      this.getData()
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      let res = await apiExchangeList({ ...this.paging })
      if (this.$ck(res, true)) {
        // #ifdef MP-SALE
        this.list = [...this.list, ...res.return_data.list]
        this.Pinmoney = res.return_data.extend.pinmoney
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        // #endif
        // #ifndef MP-SALE
        this.list = [...this.list, ...res.return_data.results]
        this.Pinmoney = res.return_data.pinmoney
        // 判断加载完成
        this.hasMore = res.return_data.total > this.list.length
        // #endif

        this.busy = false
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/change.scss';
.container-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f5f5f5;
}
.budget-header {
  position: fixed;
  height: 169rpx;
  width: 100%;
  padding-top: 30rpx;
  z-index: 1;
  top: 0;
  background-color: #f4f4f4;
}
.tab-nav {
  margin: 0 auto 10rpx;
  color: #000;
  width: 542rpx;
  height: 74rpx;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 36rpx;
  .item {
    position: relative;
    height: 72rpx;
    line-height: 72rpx;
    &.bor-left {
      &:after {
        content: '';
        width: 1px;
        height: 72rpx;
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(221, 221, 221, 1);
      }
    }
  }
}

.my-change {
  padding: 20rpx 0;
}
.change-tips {
  color: #ff6440;
  background-color: #fffef3;  
  padding-top: 12rpx;
  padding-bottom: 12rpx;
}
.list-wrap {
  background-color: #fff;
  border-radius: 10rpx;
  margin: 0 20rpx;
  .item {
    margin: 0 30rpx;
    height: 154rpx;
    box-sizing: border-box;
    .title {
      padding: 30rpx 0 10rpx;
    }
    .time {
      .label {
        display: inline-block;
        margin-left: 10rpx;
        padding: 0 12rpx;
        height: 32rpx;
        font-size: 20rpx;
        line-height: 30rpx;
        @include border(#dddddd, 3rpx);
      }
    }
  }
}
</style>
