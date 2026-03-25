<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view class="ranking-dialog flex flex-column" @tap.stop="() => {}">
      <!-- #ifdef MP-WEIXIN -->
      <view :style="{ height: top }"></view>
      <!-- #endif -->
      <view class="dialog-content">
        <!-- 弹窗头部 -->
        <view class="dialog-header pb-10">
          <view class="top-image-container">
            <image :src="topImage" mode="widthFix" class="top-image" />
          </view>
          <view class="subtitle pb-20">{{ statisticalTime }}</view>
          <view class="close-btn" @tap.stop="close">
            <text class="iconfont icon-close fs-24 c-6"></text>
          </view>
        </view>
        <!-- 弹窗内容 -->
        <view class="content">
          <view class="custom-table ml-30 mr-30">
            <view class="table-header fs-32">
              <view v-for="(column, index) in tableColumns" :key="index" :class="{ 'w-80': index === 0 }" class="col">
                {{ column.label }}
              </view>
            </view>
            <scroll-view
              :scroll-y="true"
              :enable-flex="true"
              :style="{ height: '750rpx' }"
              :scroll-with-animation="true"
              @scrolltolower="scrollBottom"
            >
              <view v-for="(item, index) in list" :key="index" class="table-row fs-24">
                <view class="col w-80">
                  <image v-if="index < 3" :src="rankImage(index)" mode="widthFix" class="rank-image" />
                  <view v-else>{{ index + 1 }}</view>
                </view>
                <view class="col">{{ item.storename }}</view>
                <view class="col reward">￥{{ item.totalamount | cashFixedTwo }}</view>
                <view class="col">{{ item.totalquantity }}</view>
              </view>
              <view v-if="list.length === 0" class="no-data">暂无数据</view>
            </scroll-view>
          </view>
        </view>

        <view class="bottom-space"></view>
      </view>
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
import { apiStoreSalesGiftGetSalesRanking } from 'packages/api/StoreSalesGift'
import { staticURL } from '@/config'
import dayjs from 'dayjs'
import { cashFixedTwo } from 'packages/filters'

export default {
  filters: {
    cashFixedTwo
  },
  mixins: [dialogMixin],
  props: {
    // 活动ID
    activityId: {
      type: [Number, String],
      default: 0
    },
    // 活动时间
    actInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      topImage: staticURL(true) + 'order-sale/rank-bg.png',
      // #ifdef MP-WEIXIN
      top: '',
      // #endif
      scrollViewHeight: '',
      list: [], // 列表数据
      busy: false, // 防重复标记
      paging: {
        PageIndex: 1,
        PageSize: 10
      },
      hasMore: true // 是否还有更多数据
    }
  },
  computed: {
    statisticalTime() {
      const endTime = dayjs().subtract(1, 'day').hour(23).minute(59).second(59).format('YYYY-MM-DD HH:mm:ss')
      const starttime = dayjs(this.actInfo.starttime).format('YYYY-MM-DD')
      if (new Date(endTime).getTime() < new Date(starttime).getTime()) {
        return ''
      }
      return `统计时间：${starttime} ~ ${endTime}`
    },
    tableColumns() {
      return [
        { label: '排名', key: 'rank' },
        { label: '门店名称', key: 'storename' },
        { label: '获动销红包', key: 'totalamount' },
        { label: '销量', key: 'totalquantity' }
      ]
    }
  },
  watch: {
    // 监听弹窗显示状态，重置数据
    showDialog(newVal) {
      if (newVal && this.list.length === 0) {
        this.resetData()
        this.getData()
      }
    }
  },
  mounted() {
    let sys = uni.getSystemInfoSync()
    // #ifdef MP-WEIXIN
    this.top = sys.statusBarHeight + 44 + 'px'
    // #endif
  },
  methods: {
    rankImage(index) {
      return staticURL(true) + `order-sale/rank${index + 1}.png`
    },
    // 重置数据
    resetData() {
      this.list = []
      this.paging.PageIndex = 1
      this.hasMore = true
      this.busy = false
    },

    // 滚动到底部触发加载更多
    scrollBottom() {
      if (this.hasMore && !this.busy) {
        this.paging.PageIndex++
        this.getData()
      }
    },

    // 获取数据的方法
    async getData() {
      if (this.busy) return
      this.busy = true
      const res = await apiStoreSalesGiftGetSalesRanking({
        ActivityID: this.activityId,
        PageIndex: this.paging.PageIndex,
        PageSize: this.paging.PageSize
      })
      this.busy = false

      if (this.$ck(res)) {
        const newData = res.return_data.results || []

        // 如果是第一页，直接替换数据
        if (this.paging.PageIndex === 1) {
          this.list = newData
        } else {
          // 否则追加数据
          this.list = [...this.list, ...newData]
        }

        // 判断是否还有更多数据
        this.hasMore = newData.length >= this.paging.PageSize
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/table.scss';
$prefix: ranking-dialog;
.#{$prefix} {
  height: 100%;

  color: #333;

  font-size: 28rpx;
}
.dialog-content {
  margin-top: auto;
}

.dialog-header {
  position: relative;

  margin-top: 150rpx;
  padding: 40rpx 30rpx 20rpx;

  text-align: center;

  border-radius: 30rpx 30rpx 0px 0px;
  background: #fff;
  .top-image-container {
    position: absolute;
    top: -90rpx;
    right: 0;
    left: 0;

    width: 100%;

    text-align: center;

    .top-image {
      width: 233rpx;
    }
  }

  .subtitle {
    margin-top: 80rpx;

    color: #aaaaaa;

    font-size: 24rpx;
  }

  .close-btn {
    position: absolute;
    top: 36rpx;
    right: 32rpx;
  }
}

.content {
  background: #fff;
  .rank-image {
    width: 60rpx;
  }
}

.bottom-space {
  height: 60rpx;

  background: #fff;
}
.w-80 {
  width: 80rpx;
}
</style>
