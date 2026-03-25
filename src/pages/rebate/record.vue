<template>
  <view class="list">
    <view v-for="(item, index) in list" :key="index" class="item" @click="handleClickItem(item)">
      <view class="iconfont iconjiantou2 link-icon" />
      <view class="img-box">
        <view class="num">x{{ item.ImageUrl.length }}</view>
        <image v-if="item.ImageUrl" :src="item.ImageUrl[0]" class="img" mode="aspectFit" />
      </view>
      <view class="right">
        <view class="row">
          审核状态：
          <text v-if="item.AuditStatus === 1" class="ing">审核中</text>
          <text v-if="item.AuditStatus === 0" class="ing">待审核</text>
          <text v-if="item.AuditStatus === 2" class="success">审核成功</text>
          <text v-if="item.AuditStatus === 3" class="err">审核失败</text>
        </view>
        <view class="row">上传时间：{{ item.CreatedTime }}</view>
      </view>
    </view>
    <none-data v-if="!list.length && !loading" msg="暂无记录" class="none-data" />
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetRecordList } from 'packages/api/rebate'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
export default {
  components: {
    LoadMore,
    NoneData
  },
  data() {
    return {
      paging: {
        aid: '',
        PageIndex: 1,
        PageSize: 10
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      list: [] //数据
    }
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.PageIndex++
      this.getData()
    }
  },
  async onLoad(options) {
    this.paging.aid = options.aid
    this.$loading.show()
    await this.getData()
    this.$loading.hide()
  },
  methods: {
    handleClickItem(item) {
      uni.setStorageSync('recordItem', JSON.stringify(item))
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/rebate/detail`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/rebate/detail`
      })
      /* #endif */
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      let res = await apiGetRecordList(this.paging)
      if (this.$ck(res, true)) {
        const result = res.return_data || []
        this.list = [...this.list, ...result]
        // 判断加载完成
        this.hasMore = res.return_count > this.list.length
        this.busy = false
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  padding: 30rpx;
  .item {
    display: flex;
    border-bottom: 1px solid #eeeeee;
    padding-bottom: 30rpx;
    padding-top: 20rpx;
    position: relative;
    .iconjiantou2 {
      position: absolute;
      right: 20rpx;
      color: #000;
      top: 76rpx;
    }
    .img-box {
      width: 120rpx;
      height: 120rpx;
      background: #ffffff;
      border: 1rpx solid #eeeeee;
      position: relative;
      .num {
        position: absolute;
        left: 0;
        bottom: 0;
        border-radius: 0px 15rpx 0px 0px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        padding: 4rpx 8rpx;
      }
      .img {
        width: 120rpx;
        height: 120rpx;
      }
    }
    .right {
      margin-left: 20rpx;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #333333;
      .row {
        margin-top: 10rpx;
        .ing {
          color: #ff7f00;
        }
        .err {
          color: #f43b0b;
        }
        .success {
          color: #000;
        }
      }
    }
  }
}
</style>
<style>
page {
  background-color: #fff;
}
</style>
