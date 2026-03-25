<template>
  <view class="page-box">
    <view class="prize-tips">领取记录非实时显示，将会在领奖后一分钟后显示</view>
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
    <view class="coupon-list">
      <view v-for="(item, index) in list" :key="index" class="coupon-item-box">
        <view
          class="coupon-item"
          :style="{ opacity: `${item.status === 1 ? '0.7' : '1'}` }"
          @tap.stop="handleGoCouponDetail(item)"
        >
          <view class="alpha">
            <view class="line" />
            <view class="alpha-box">
              <view class="circle top-left-circle" />
              <view class="circle top-right-circle" />
              <view class="left-box">
                <v-img :src="item.picurl" class="coupon-poster" size="200" />
                <view class="left">
                  <view class="title c-3 fs-28 ellipsis fw-bold">{{ item.title }}</view>
                  <view class="remask">
                    <view class="tag c-9" :style="{ backgroundImage: `url(${CouponBg})` }">联盟卡券</view>
                  </view>
                </view>
              </view>
              <view v-if="item.status !== 1" class="right base-btn">去使用</view>
            </view>
          </view>
          <view class="beta">
            <view class="circle left-circle" />
            <view class="circle right-circle" />
            <view class="first">
              <view class="left">
                <view class="c-9">有效期：{{ item.validperiodtips ? item.validperiodtips : item.effecttime }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="!list.length && !loading" msg="暂无卡券" class="none-data" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
    <!-- #ifdef MP-GUIDE -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetCardList } from '../api/my'
import Tab from '../components/tab'
import NoneData from '@/components/none-data/index.vue'
import LoadMore from '@/components/load-more/index.vue'
import { staticURL } from '@/config'
// #ifdef MP-GUIDE
import overdueMixin from 'packages/mixins/overdue'
// #endif
export default {
  components: {
    Tab,
    NoneData,
    LoadMore
  },
  // #ifdef MP-GUIDE
  mixins: [overdueMixin],
  // #endif
  data() {
    return {
      CouponBg: staticURL(true) + 'circle-bg.png',
      tabArr: [
        {
          name: '未过期',
          value: 0
        },
        {
          name: '已过期',
          value: 1
        }
      ],
      activeIndex: 0,
      list: [],
      paging: {
        PageIndex: 1,
        PageSize: 10,
        isExpire: 0
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  async onLoad() {
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  methods: {
    resetData() {
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.list = []
      this.paging = {
        PageIndex: 1,
        PageSize: 10,
        isExpire: 0
      }
    },
    handleGoCouponDetail(item) {
      // 过期打烊提示
      // #ifdef MP-GUIDE
      if (!this.overdueChecked()) return
      // #endif
      uni.navigateTo({
        url: `/packages/src/union-card/detail?id=${item.id}`
      })
    },
    handleTabChange(e) {
      this.resetData()
      this.paging.isExpire = e.value
      this.getData()
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      let res = await apiGetCardList({ ...this.paging })
      if (this.$ck(res, true)) {
        this.list = [...this.list, ...res.return_data.list]
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        this.busy = false
        this.loading = false
      }
    }
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.PageIndex++
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-box {
  overflow: hidden;
  .prize-tips {
    position: fixed;
    z-index: 3;
    top: 0;

    width: 100%;

    text-align: center;

    color: #ff6440;
    background-color: #fffef3;

    font-size: 26rpx;
    line-height: 60rpx;
  }
  .tab {
    position: fixed;
    z-index: 4;
    top: 60rpx;

    width: 100%;
  }
  .none-data {
    margin-top: 210rpx;
  }
  .coupon-list {
    margin-top: 180rpx;
    padding: 0 30rpx;
    .coupon-item-box {
      .coupon-item {
        display: flex;
        flex-direction: column;

        margin: 30rpx 0 0;

        color: #f4f4f4;
        background: #fff;
        .alpha {
          position: relative;

          overflow: hidden;
          .line {
            position: absolute;
            top: 1rpx;
            left: 1rpx;

            width: calc(100% - 2rpx);
            height: 5rpx;

            border-radius: 5rpx;
            background: #ffd386;
          }
          .alpha-box {
            display: flex;
            align-items: center;
            justify-content: space-between;

            padding: 30rpx 0 20rpx 30rpx;

            border: 1rpx solid #e7e7e7;
            border-bottom: none;
            border-top-left-radius: 5rpx;
            border-top-right-radius: 5rpx;
            .left-box {
              display: flex;
              .coupon-poster {
                width: 100rpx;
                height: 100rpx;
                margin-right: 20rpx;

                border-radius: 5rpx;
              }
              .left {
                display: flex;
                flex-direction: column;
                justify-content: center;

                font-size: 24rpx;
                line-height: 1;
                .title {
                  width: 350rpx;

                  color: #000;
                }
                .remask {
                  display: flex;
                  align-items: center;

                  padding: 14rpx 0 0;
                  .tag {
                    padding: 6rpx 12rpx;

                    background-repeat: no-repeat;
                    background-size: 100% 100%;
                  }
                }
              }
            }
          }
          .right {
            width: 120rpx;
            height: 50rpx;
            margin: 0 30rpx 0 0;

            text-align: center;

            border-radius: 25rpx;

            font-size: 24rpx;
            line-height: 50rpx;
          }
          .coupon-used-text {
            color: #fff;
            background: #dadada;
          }
        }
        .coupon-used-bg {
          background-color: #9a9a9a;
        }
        .beta {
          position: relative;

          display: flex;
          overflow: hidden;
          flex-direction: column;
          .first {
            display: flex;
            justify-content: space-between;

            padding: 20rpx 30rpx 25rpx;

            border-top: 1rpx dashed #e7e7e7;
            border-right: 1rpx solid #e7e7e7;
            border-bottom: 1rpx solid #e7e7e7;
            border-left: 1rpx solid #e7e7e7;
            border-bottom-right-radius: 5rpx;
            border-bottom-left-radius: 5rpx;

            font-size: 24rpx;
            .left {
              color: #999;
            }
            .right {
              display: flex;

              height: 32rpx;

              color: #666;
            }
            .check-active {
              color: rgba(102, 102, 102, 0.5);
            }
          }
          .second {
            padding: 0 0 20rpx;

            color: #333;

            font-size: 26rpx;
          }
        }
        .circle {
          position: absolute;
          z-index: 2;

          width: 26rpx;
          height: 26rpx;

          border: 1rpx solid #e7e7e7;
          border-radius: 50%;
          background: #f4f4f4;
        }
        .left-circle {
          top: 0;
          left: 0;

          transform: translate(-50%, -50%);
        }
        .right-circle {
          top: 0;
          right: 0;

          transform: translate(50%, -50%);
        }
        .top-left-circle {
          bottom: 0;
          left: 0;

          transform: translate(-50%, 50%);
        }
        .top-right-circle {
          right: 0;
          bottom: 0;

          transform: translate(50%, 50%);
        }
      }
    }
  }
}
</style>
