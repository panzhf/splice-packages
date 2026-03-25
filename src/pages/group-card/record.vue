<template>
  <view class="page-box">
    <tab
      :tab="tabArr"
      active-color="#FFA200"
      draw-height="2"
      active-bag-color="#FFA200"
      :active-index.sync="activeIndex"
      draw-width="40"
      class="tab"
      @change="handleTabChange"
    />
    <view class="card-list">
      <view v-for="(item, index) in list" :key="index" class="card-item-box">
        <view class="card-item" :class="item.cardstatus !== 2 && 'card-item-gray'">
          <view class="left">
            <image :src="item.cardimg" class="card-poster" />
            <view class="left-box flex-1" :class="item.cardstatus === 3 && 'left-box-gray'">
              <view class="title c-3 fs-28 ellipsis fw-bold">{{ item.cardname }}</view>
              <view class="time">
                <view>获得时间：{{ item.addtime }}</view>
                <view>过期时间：{{ item.realexpirydate }}</view>
              </view>
            </view>
          </view>
          <!-- 卡牌状态，1-已使用、2-未使用、3-已过期 -->
          <view v-if="item.cardstatus === 3" class="icon iconfont icon-coupon-overdue c-9" style="color: #999999" />
          <!-- 3 卡已使用 -->
          <view v-if="item.cardstatus === 1" class="icon iconfont icon-coupon-used" style="color: #ffd386" />
        </view>
      </view>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="!list.length && !loading" msg="暂无数据" class="none-data" />
  </view>
</template>

<script>
import { apiGetPageJoinRecord } from 'packages/api/group-card'
import Tab from '@/components/tab'
import NoneData from '@/components/none-data/index.vue'
import LoadMore from '@/components/load-more/index.vue'

export default {
  components: {
    Tab,
    NoneData,
    LoadMore
  },
  mixins: [],
  data() {
    return {
      tabArr: [
        {
          name: '未使用',
          value: 2
        },
        {
          name: '已使用',
          value: 1
        },
        {
          name: '已过期',
          value: 3
        }
      ],
      activeIndex: 0,
      list: [],
      pageInfo: {
        PageIndex: 1,
        PageSize: 10,
        cardStatus: 2
      },
      actid: '',
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  async onLoad(options) {
    this.actid = options.actid
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.pageInfo.PageIndex++
      this.getData()
    }
  },
  methods: {
    resetData() {
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.list = []
      this.pageInfo = {
        PageIndex: 1,
        PageSize: 10,
        cardStatus: 2
      }
    },
    handleTabChange(e) {
      this.resetData()
      this.pageInfo.cardStatus = e.value
      this.getData()
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      let res = await apiGetPageJoinRecord({ actid: this.actid, ActType: 36, ...this.pageInfo })
      res = this.$toLowerKey(res, true)
      if (this.$ck(res, true) && res.return_data) {
        this.list = [...this.list, ...res.return_data.results]
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        this.busy = false
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-box {
  overflow: hidden;
  .tab {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 4;
  }
  .none-data {
    margin-top: 300rpx;
  }
  .card-list {
    padding: 0 30rpx;
    margin-top: 120rpx;
    .card-item-box {
      .card-item {
        display: flex;
        flex-direction: column;
        color: #f4f4f4;
        margin: 30rpx 0 0;
        background: #fff;
        border-radius: 10rpx;
        position: relative;
        overflow: hidden;
        .left {
          display: flex;
          padding: 20rpx 30rpx;
          .card-poster {
            width: 96rpx;
            height: 120rpx;
            border-radius: 5rpx;
            margin-right: 20rpx;
          }
          .left-box {
            .title {
              width: 350rpx;
              color: #000;
              font-weight: bold;
              font-size: 28rpx;
              margin-bottom: 10rpx;
            }
            .time {
              font-weight: 500;
              font-size: 24rpx;
              color: #999999;
              line-height: 32rpx;
            }
          }
        }
        .icon {
          position: absolute;
          top: -10rpx;
          right: 30rpx;
          font-size: 112rpx;
          z-index: 3;
        }
      }
      .card-item-gray {
        image {
          filter: grayscale(70%);
        }
      }
      .left-box-gray {
        opacity: 0.5;
      }
    }
  }
}
</style>
