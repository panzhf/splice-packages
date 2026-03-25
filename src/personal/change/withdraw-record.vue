<template>
  <view class="getList-wrapper" :style="themeVars">
    <!-- 提示横幅 --> 
    <view class="change-tips fs-24 c-red pl-30"> 
      <view>提现记录非实时更新，数据同步至本列表通常需要 1-2 分钟。</view>
      <view>若未看到最新记录，请稍后重新进入本页面即可。</view>
    </view> 
    <!-- 有记录 -->
    <view class="ml-30 fs-28 c-0 fw-bold my-change">
      累计提现金额：
      <text class="primary-color">¥ {{ Pinmoney | cashFixedTwo }}</text>
    </view>
    <view class="list-wrap">
      <view v-for="(item, index) in list" :key="index">
        <view class="item bd-e" @tap="jumpDetai(item.id)">
          <view class="flex flex-middle title">
            <view class="c-3 fs-28 ub-f1">
              <text class="fw-bold">{{ item.title }}</text>
              <text v-if="!item.issuccess" class="c-red">（{{ item.reson }}）</text>
            </view>
            <view :class="[item.direction === 1 ? 'c-0' : 'c-red', 'fs-32', 'fw-bold']">
              ¥{{ item.amount | cashFixedTwo }}
            </view>
          </view>
          <view class="flex flex-middle">
            <view class="fs-24 c-9 time ub-f1">
              {{ item.tradetime }}
            </view>
            <view class="icon iconfont iconjiantou1 fs-18 c-3" />
          </view>
        </view>
      </view>
    </view>

    <!-- 无记录 -->
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="!list.length && !loading" :icon-style="iconStyle" :icon="icon" msg="暂无记录" class="none-data" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiWithdrawList } from 'packages/api/change.js'
// #ifndef MP-RETAIL
// 零售用宿主小程序的组件
import NoneData from 'packages/components/none-data/index.vue'
// #endif
import LoadMore from 'packages/components/load-more/index.vue'
import { cashFixedTwo } from 'packages/filters'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    // #ifndef MP-RETAIL
    NoneData,
    // #endif
    LoadMore
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
      Pinmoney: 0,
      list: [],
      paging: {
        pageindex: 1,
        pagesize: 10,
        sortings: []
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    icon() {
      let url = ''
      // #ifdef MP-SALE
      url = staticURL(true) + 'personal/no-withdraw.png'
      // #endif
      return url
    },
    iconStyle() {
      let style = ''
      // #ifdef MP-SALE
      style = 'width: 300rpx;height: 218rpx'
      // #endif
      return style
    }
  },
  async onLoad() {
  },
  async onShow() {
    // 刷新列表
    this.list = []
    this.paging.pageindex = 1
    this.hasMore = true
    this.loading = true
    this.busy = false
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
    async getData() {
      try {
        if (this.busy || !this.hasMore) return
        this.busy = true
        let res = await apiWithdrawList({ ...this.paging })
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
      } catch (error) {
        this.$msg(error.return_msg || '获取提现记录失败')
      }
    },
    jumpDetai(id) {
      uni.navigateTo({
        url: `./withdraw-detail?orderId=${id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/change.scss';
.getList-wrapper {
  min-height: 100vh;
}
.change-tips {
  color: #ff6440;
  background-color: #fffef3;  
  padding-top: 12rpx;
  padding-bottom: 12rpx;
}
.my-change {
  padding: 30rpx 0 20rpx;
}
.list-wrap {
  background-color: #fff;
  border-radius: 10rpx;
  margin: 0 20rpx;
  .item {
    margin: 0 30rpx;
    height: 145rpx;
    box-sizing: border-box;
    .title {
      padding: 36rpx 0 10rpx;
    }
    .time {
      .label {
        display: inline-block;
        margin-left: 10rpx;
        padding: 0 12rpx;
        height: 32rpx;
        font-size: 20rpx;
        line-height: 32rpx;
        border: 1px solid rgba(221, 221, 221, 1);
        border-radius: 3px;
      }
    }
  }
}
</style>
