
<template>
  <u-mask :show="showDialog" :zoom="false" :duration="0" :z-index="100" @click="close">
    <view class="popup-content fs-28 tx-c" @tap.stop="() => {}">
      <view class="header mb-20 fs-30">
        物流码明细
        <u-icon name="close" color="#666" size="24" class="close" @click="close" />
      </view>
      <view class="table-header flex">
        <view class="col-1">物流码</view>
        <view class="col-2">时间</view>
        <view class="flex-1">操作人</view>
      </view>
      <scroll-view class="content" scroll-y @scrolltolower="loadMoreData">
        <view v-for="(item, index) in list" :key="index" class="row flex flex-middle">
          <view class="col-1">{{ item.smallserialnumber }}</view>
          <view class="col-2">{{ item.addtime }}</view>
          <view class="flex-1">
            {{ mode === 1 ? item.returnedmanno : item.delivermanno }}-{{
              mode === 1 ? item.returnedmanname : item.delivermanname
            }}
          </view>
        </view>
        <load-more v-if="!loading && list.length" :has-more="hasMore" />
        <none-data v-if="showNoneData" class="noda" :show-icon="false" :view-height="560" msg="暂无记录" />
      </scroll-view>
    </view>
  </u-mask>
</template>

<script>
// import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import loadMoreMixin from 'packages/mixins/load-more'
import dialogMixin from 'packages/mixins/dialog'
import { apiDeliveryList, apiReturnList } from 'packages/api/group-buy'
export default {
  components: {
    // NoneData,
    LoadMore
  },
  mixins: [loadMoreMixin, dialogMixin],
  props: {
    mode: {
      type: Number,
      default: 0 // 0.登记物流码 1.退货物流码
    },
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: true
    }
  },
  watch: {
    showDialog(v) {
      this.resetData()
      if (v) {
        this.getData()
      }
    }
  },
  methods: {
    async getData() {
      try {
        if (this.busy) return
        this.busy = true
        const nextPage = this.paging.page + 1
        const res = await (this.mode === 0 ? apiDeliveryList : apiReturnList)({
          pageindex: nextPage,
          pagesize: this.paging.pageSize,
          ...this.info
        })
        if (this.$ck(res)) {
          this.dealRes({ res, nextPage, listProp: 'results' })
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    loadMoreData() {
      if (this.hasMore) {
        this.getData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.popup-content {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  padding: 30rpx;
  box-sizing: border-box;
  border-radius: 30rpx 30rpx 0 0;
  background-color: #fff;
  .header {
    position: relative;
    .close {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
  .table-header {
    height: 72rpx;
    line-height: 72rpx;
    background-color: #f5f5f5;
  }
  .content {
    height: 600rpx;
  }
  .row {
    min-height: 100rpx;
    line-height: 1.5;
    border-bottom: 1rpx solid #f5f5f5;
  }
  .col-1 {
    width: 170rpx;
  }
  .col-2 {
    width: 180rpx;
  }
}
</style>
