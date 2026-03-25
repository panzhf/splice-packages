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
    <view class="coupon-list">
      <u-checkbox-group v-if="activeIndex == 0 && isBatch">
        <u-checkbox
          v-for="(item, index) in list"
          :key="index"
          v-model="item.checked"
          shape="circle"
          :name="index"
          class="coupon-choice"
          active-color="#FFA200"
          @change="handleradioChange"
        >
          <view class="coupon-item" :style="{ opacity: `${item.status === 2 ? '0.7' : '1'}`, margin: '0 0 20rpx 0 ' }">
            <coupon-list :list-item="item" :is-batch.sync="isBatch" />
          </view>
        </u-checkbox>
      </u-checkbox-group>
      <view v-else>
        <view
          v-for="(item, index) in list"
          :key="index"
          class="coupon-item"
          :style="{ opacity: `${item.status === 2 ? '0.7' : '1'}` }"
          @tap.stop="handleGoCouponDetail(item)"
        >
          <coupon-list :list-item="item" />
        </view>
      </view>
    </view>
    <!-- 提领券待使用  现在批量核销 -->
    <view v-if="activeIndex == 0 && list.length" class="coupon-bottom">
      <view v-if="!isBatch" class="coupon-cancel">
        <view class="coupon-batch" @click="handleBatch">批量核销</view>
      </view>

      <view v-else class="coupon-confirm">
        <view class="confirm-left">
          <u-checkbox v-model="ischecked" active-color="#FFA200" shape="circle" @change="handleAll">全选</u-checkbox>
        </view>
        <view class="confirm-right">
          <view class="confirm-abolish" @click="handleCancel">取消</view>
          <view
            class="confirm-btn"
            :style="{ background: selectLength < 1 ? '#aaa' : 'linear-gradient(90deg, #ffa200 0%, #ffd461 100%)' }"
            @click="handleVerify"
          >
            确认 ({{ selectLength || 0 }})
          </view>
        </view>
      </view>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="!list.length && !loading" msg="暂无卡券" class="none-data" />
    <!-- 点击批量核销弹起 -->
    <coupon-hint ref="couponHint" @close="handleClose" />
    <canvas canvas-id="myCanvas" class="canvas-code" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetBringCouponList } from 'packages/api/bring-coupon'
import Tab from '@/components/tab'
import NoneData from 'packages/components/none-data/index.vue'
import couponList from './components/coupon-list'
import couponHint from './components/coupon-hint'
import LoadMore from 'packages/components/load-more/index.vue'
import { staticURL } from '@/config'
export default {
  components: {
    Tab,
    NoneData,
    LoadMore,
    couponList,
    couponHint
  },
  data() {
    return {
      coupon_bg: staticURL(true) + 'coupon/circle-bg.png',
      tabArr: [
        {
          name: '待使用',
          value: 1
        },
        {
          name: '已使用',
          value: 2
        },
        {
          name: '已过期',
          value: 3
        }
      ],
      activeIndex: 0,
      list: [],
      paging: {
        PageIndex: 1,
        PageSize: 10,
        status: 1
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      selectLength: 0, //选中提领券的长度
      ischecked: false, //是否全选
      customerid: 0, // 用户id
      isBatch: false // 是否开启批量核销功能
    }
  },
  onShow() {
    this.resetData(this.paging.status)
    this.getData()
  },

  onUnload() {
    this.$refs.couponHint.handleOnShow()
  },

  onReachBottom() {
    if (this.hasMore) {
      this.paging.PageIndex++
      this.getData()
    }
  },

  methods: {
    handleGoCouponDetail(item) {
      if (this.isBatch === true) return
      uni.navigateTo({
        url: `./detail?id=${item.id}`
      })
    },
    resetData(status = 1) {
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.list = []
      this.paging = {
        PageIndex: 1,
        PageSize: 10,
        status
      }
    },
    handleTabChange(e) {
      this.resetData(e.value)
      this.getData()
      this.handleCancel()
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      // this.list = []
      let res = await apiGetBringCouponList({ ...this.paging })
      if (this.$ck(res, true)) {
        this.customerid = res.return_data.customerid // 用户id
        this.list = [...this.list, ...res.return_data.list]
        this.list.forEach(v => {
          if (v.checked) {
            v.checked = true
          } else {
            v.checked = false
          }
        })
        if (this.selectLength !== this.list.length) this.ischecked = false
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        // this.hasMore = false
        this.busy = false
        this.loading = false
      }
    },
    // 点击批量核销
    handleBatch() {
      this.isBatch = true
    },
    handleClose() {
      this.resetData()
      this.handleCancel()
      this.getData()
    },
    // 点击单选
    handleradioChange(v) {
      this.$set(this.list[v.name], 'checked', v.value)
      this.onselectLength()
      if (this.selectLength !== this.list.length) this.ischecked = false
      this.$forceUpdate()
    },
    // 全选
    handleAll(e) {
      this.list.forEach(v => {
        if (e.value === true) {
          v.checked = true
        } else {
          v.checked = false
        }
      })
      this.onselectLength()
      this.$forceUpdate()
    },
    // 点击取消
    handleCancel() {
      this.list.forEach(v => {
        v.checked = false
      })
      this.ischecked = false
      this.isBatch = false
      this.selectLength = 0
      this.$forceUpdate()
    },
    onselectLength() {
      let arr = []
      this.list.forEach(v => {
        if (v.checked === true) {
          arr.push(v)
        }
      })
      this.selectLength = arr.length
      if (this.selectLength === this.list.length) this.ischecked = true
    },
    // 点击确定
    handleVerify() {
      if (this.selectLength === 0) {
        return uni.showToast({
          title: '请选择提领券',
          icon: 'none'
        })
      }
      let arr = [] // id集合
      let couponcodelist = [] //券码集合
      this.list.forEach(v => {
        if (v.checked === true) {
          arr.push(v.id)
          couponcodelist.push(v.couponcode)
        }
      })
      this.$refs.couponHint.showToast(arr, couponcodelist, this.selectLength, this.customerid)
    }
  }
}
</script>

<style lang="scss" >
.c-9 {
  color: #999;
}
.page-box {
  overflow: hidden;
  .tab {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 3;
  }
  .none-data {
    margin-top: 300rpx;
  }
  .coupon-choice {
    display: flex;
    align-items: center;
  }
  .coupon-list {
    padding: 0 30rpx;
    margin-top: 120rpx;
    margin-bottom: 70rpx;
    .coupon-item {
      display: flex;
      flex-direction: column;
      color: #f4f4f4;
      // margin: 30rpx 0 0;
      background: #fff;
      & + .coupon-item {
        margin-top: 30rpx;
      }
      .alpha {
        position: relative;
        overflow: hidden;
        .icon {
          position: absolute;
          top: -8rpx;
          right: 30rpx;
          font-size: 112rpx;
          z-index: 3;
        }
        .line {
          position: absolute;
          top: 1rpx;
          left: 1rpx;
          width: calc(100% - 2rpx);
          height: 5rpx;
          border-radius: 5rpx;
          background: #ffd386;
        }
        // 提领券颜色(待使用 和已使用)
        .line-extract {
          background: #ffd386;
        }
        // 已过期颜色
        .line-extract-dated {
          background: #f2f2f2;
        }
        // .line-extract-used {
        //   background: #FFD386;
        // }
        .alpha-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
              border-radius: 5rpx;
              margin-right: 20rpx;
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
                color: #01c500;
                .tag {
                  background-size: 100% 100%;
                  background-repeat: no-repeat;
                  padding: 6rpx 12rpx;
                }
              }
            }
          }
        }
        .right {
          width: 120rpx;
          height: 50rpx;
          line-height: 50rpx;
          text-align: center;
          border-radius: 25rpx;
          margin: 0 30rpx 0 0;
          font-size: 24rpx;
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
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .first {
          display: flex;
          justify-content: space-between;
          font-size: 24rpx;
          padding: 20rpx 30rpx 25rpx;
          border-top: 1rpx dashed #e7e7e7;
          border-left: 1rpx solid #e7e7e7;
          border-right: 1rpx solid #e7e7e7;
          border-bottom: 1rpx solid #e7e7e7;
          border-bottom-left-radius: 5rpx;
          border-bottom-right-radius: 5rpx;
          .left {
            color: #999;
          }
          .right {
            display: flex;
            color: #666;
            height: 32rpx;
            .icon {
              display: block;
              padding-left: 13rpx;
              transform: rotate(90deg);
              font-size: 22rpx;
              margin: 0 0 6rpx;
            }
            .icon-rotate {
              transform: rotate(-90deg);
              margin: 10rpx 0 0;
            }
          }
          .check-active {
            color: rgba(102, 102, 102, 0.5);
          }
        }
        .second {
          font-size: 26rpx;
          color: #333;
          padding: 0 0 20rpx;
        }
      }
      .circle {
        position: absolute;
        width: 26rpx;
        height: 26rpx;
        border-radius: 50%;
        border: 1rpx solid #e7e7e7;
        background: #f4f4f4;
        z-index: 2;
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
        bottom: 0;
        right: 0;
        transform: translate(50%, 50%);
      }
    }
  }
  .coupon-bottom {
    box-sizing: content-box;
    position: fixed;
    width: 100%;
    // height: 110rpx;
    padding-top: 20rpx;
    bottom: 0;
    background-color: #fff;
    padding-bottom: calc(constant(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
    z-index: 1000;
    .coupon-cancel {
      display: flex;
      justify-content: flex-end;
      padding-bottom: 10rpx;
      .coupon-batch {
        text-align: center;
        width: 180rpx;
        height: 80rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        line-height: 80rpx;
        background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
        color: #fff;
        margin-right: 30rpx;
      }
    }

    .coupon-confirm {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30rpx;
      padding-bottom: 10rpx;
      .confirm-left {
        display: flex;
        align-items: center;
        margin-left: 10rpx;
      }
      .confirm-right {
        display: flex;
        align-items: center;
        text-align: center;
        font-size: 28rpx;
        line-height: 80rpx;
        .confirm-abolish {
          width: 190rpx;
          height: 80rpx;
          border-radius: 40rpx;
          border: 1px solid #cccccc;
          background: #ffffff;
          margin-right: 20rpx;
        }
        .confirm-btn {
          width: 190rpx;
          height: 80rpx;
          border-radius: 40rpx;
          background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
          color: #fff;
        }
      }
    }
  }
}
.canvas-code {
  position: fixed;
  left: -999px;

  width: 150px;
  height: 150px;
}
</style>

