<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view class="record-dialog flex flex-column" @tap.stop="() => {}">
      <view :style="{ height: top }" />
      <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/record.png?v1`" class="title-icon" />
      <view class="record-content">
        <header class="header fsz-28 flex">
          <view class="item flex-3">比赛名称</view>
          <view class="item flex-3">竞猜项</view>
          <view class="item flex-3">竞猜时间</view>
          <view class="item flex-2">竞猜数</view>
          <view class="item flex-3">是否中奖</view>
        </header>
        <scroll-view
          class="content flex-1"
          :scroll-y="true"
          :enable-flex="true"
          :style="{ height: scrollViewHeight }"
          @scrolltolower="loadData"
        >
          <view v-for="(item, index) in list" :key="index" class="row fsz-24 flex">
            <view class="item flex-3">{{ item.MatchesName }}</view>
            <view class="item flex-3">{{ item.RanksName }}</view>
            <view class="item flex-3">{{ item.CreatedTime }}</view>
            <view class="item flex-2">{{ item.BetNum }}</view>
            <view class="item flex-3">{{ item.AwardDesc }}</view>
          </view>
          <none-data v-if="showNoneData" text-color="#fff4db" />
        </scroll-view>
      </view>
      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2 fw-bold" @tap.stop="close" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import { apiGetActivityGuessingRecord } from 'packages/api/guessing'
import NoneData from '@/components/none-data/index.vue'
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
import commonMixin from '../mixins'
export default {
  name: 'RecordDialog',
  components: {
    NoneData
  },
  mixins: [packageStaticMixin, dialogMixin, commonMixin],
  props: {
    baseStaticUrl: {
      type: String,
      default: ''
    },
    top: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      scrollViewHeight: '',
      list: [],
      loading: true
    }
  },
  computed: {
    showNoneData() {
      // 用于判断无数据显示占位图
      return !this.loading && this.list.length === 0
    }
  },
  watch: {
    value(v) {
      if (v) {
        this.getData()
      } else {
        this.loading = true
        this.List = []
      }
    }
  },
  mounted() {
    let sys = uni.getSystemInfoSync()
    /* #ifdef MP-WEIXIN */
    this.scrollViewHeight = `calc(${sys.windowHeight}px - ${this.top} - 450rpx)`
    /* #endif */
    /* #ifdef H5 */
    this.scrollViewHeight = `calc(${sys.windowHeight}px - 450rpx)`
    /* #endif */
  },
  methods: {
    getData() {
      apiGetActivityGuessingRecord({
        aid: this.info.aid,
        memberLogin: this.info.memberLogin
      }).then(res => {
        this.loading = false
        if (this.$ck(res)) {
          this.list = res.return_data || []
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: record-dialog;
.#{$prefix} {
  height: 100%;
  padding: 0 30rpx 76rpx;
  .title-icon {
    margin: 60rpx auto 0;
    height: 30rpx;
  }
  .record-content {
    margin-top: 40rpx;
    border: 1rpx solid #fff;
    .header {
      color: #fff;
      height: 92rpx;
      line-height: 92rpx;
      border-bottom: 1rpx solid #fff;
      .item {
        text-align: center;
      }
    }
    .content {
      padding: 40rpx 0;
      box-sizing: border-box;
      color: #fff;
      font-size: 28rpx;
      .row {
        text-align: center;
        .item {
          margin-bottom: 30rpx;
        }
      }
    }
  }

  .close-btn {
    margin-top: 60rpx;
    color: #fff;
    .iconfont {
      font-size: 60rpx;
    }
  }
}
</style>
