<template>
  <view>
    <!-- 提现记录详情  -->
    <view v-if="!loading" class="detail-wrapper" style="min-height: 100vh">
      <view class="list-wrap">
        <view class="item bd-e flex flex-middle flex-between fs-28">
          <view class="c-6 key">金额</view>
          <view class="c-0 value">¥{{ list.amount | cashFixedTwo }}</view>
        </view>
        <view class="item bd-e flex flex-middle flex-between fs-28">
          <view class="c-6 key">说明</view>
          <view class="c-0 value">
            {{ list.remark }}
          </view>
        </view>
        <view class="item bd-e flex flex-middle flex-between fs-28">
          <view class="c-6 key">时间</view>
          <view class="c-0 value">
            {{ list.tradetime }}
          </view>
        </view>
        <view class="item bd-e flex flex-middle flex-between fs-28">
          <view class="c-6 key">交易订单</view>
          <view class="c-0 value">
            {{ list.tradeno }}
          </view>
        </view>
        <view class="item bd-e fs-28">
          <view class="flex flex-middle flex-between">
            <view class="c-6 key">状态</view>
            <view class="value fw-bold">
              <text :class="[1, 2].includes(list.tradestate) ? 'c-red' : 'c-0'">
                {{ list.tradestate | changeResultText }}
              </text>
            </view>
          </view>
          <view v-if="list.tradestate === 2" class="c-red tx-r fs-24 mt-10">{{ list.reson }}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import { apiGetWithdrawDetail } from 'packages/api/change.js'
import { changeResultText } from 'packages/filters'
import { cashFixedTwo } from 'packages/filters'
export default {
  filters: { changeResultText, cashFixedTwo },
  data() {
    return {
      id: 0,
      list: {},
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  async onLoad(option) {
    this.id = option.orderId
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  methods: {
    async getData() {
      try {
        if (this.busy) return
        this.busy = true
        let res = await apiGetWithdrawDetail({ id: this.id })
        if (this.$ck(res, true)) {
          this.list = res.return_data
          this.busy = false
          this.loading = false
        }
      } catch (error) {
        this.$msg(error.return_msg || '获取提现详情失败')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import './styles/change.scss';
.list-wrap {
  background-color: #fff;
  .bd-e:last-child {
    background: none !important;
  }
  .item {
    margin: 0 30rpx;
    padding: 40rpx 0;
  }
}
</style>
