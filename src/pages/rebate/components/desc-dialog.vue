<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view class="desc-dialog flex flex-column" @tap.stop="() => {}">
      <view :style="{ height: top }" />
      <!-- <base-tab v-model="currentTab" :tab-list="tabList"></base-tab> -->
      <scroll-view
        class="content flex-1"
        :scroll-y="true"
        :enable-flex="true"
        :style="{ height: scrollViewHeight }"
        @scrolltolower="loadData"
      >
        <view class="item">
          <view class="title-tag">活动信息</view>
          <scroll-view scroll-y scroll-with-animation style="max-height: 200rpx">
            {{ info.Title }}
          </scroll-view>
        </view>
        <view class="item">
          <view class="title-tag">活动时间</view>
          <view>{{ info.StartTime }} 至 {{ info.EndTime }}</view>
        </view>
        <view class="item">
          <view class="title-tag">活动规则</view>
          <u-parse class="rich-text" :html="info.Rule" :tag-style="parseStyle" />
        </view>
      </scroll-view>
      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2 fw-bold" @tap.stop="close" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
import richTextMixin from 'packages/mixins/rich-text'
export default {
  mixins: [dialogMixin, richTextMixin],
  props: {
    top: {
      type: String,
      default: '0'
    },
    desc: {
      type: String,
      default: ''
    },
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      scrollViewHeight: '',
      list: [],
      pageInfo: {
        pageindex: 0,
        pagesize: 10
      },
      finished: false
    }
  },
  computed: {
    showNoneData() {
      // 用于判断无数据显示占位图
      return this.finished && this.list.length === 0
    }
  },
  watch: {
    value(v) {
      if (v) {
        this.currentTab = 0
        this.resetData()
      }
    }
  },
  mounted() {
    let sys = uni.getSystemInfoSync()
    // tab=90; scroll-view padding 40; close:60; 留白20; 250=90+40*2+60+20;
    /* #ifdef MP-WEIXIN */
    this.scrollViewHeight = `calc(${sys.windowHeight}px - ${this.top} - 250rpx)`
    /* #endif */
    /* #ifdef H5 */
    this.scrollViewHeight = `calc(${sys.windowHeight}px - 250rpx)`
    /* #endif */
  },
  methods: {
    resetData() {
      this.list = []
      this.pageInfo.pageindex = 0
      this.finished = false
    },
    loadData() {
      if (this.currentTab === 0) return
      if (this.finished) return
      this.getData()
    },
    handleNavigate(item) {
      /* #ifdef H5 */
      location.href = item.H5JumpUrl
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({ url: item.MpJumpUrl })
      /* #endif */
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: desc-dialog;
.#{$prefix} {
  height: 100%;
  padding: 0 40rpx 40rpx;
  .content {
    padding: 60rpx 0 20rpx;
    box-sizing: border-box;
    color: #fff;
    font-size: 28rpx;
    .item {
      & + .item {
        margin-top: 60rpx;
      }
      .rich-text {
        word-break: break-all;
        // white-space: pre-wrap;
      }
    }
    .prize-item {
      padding-bottom: 40rpx;
      border-bottom: 1px dotted #fff;
      & + .prize-item {
        padding-top: 40rpx;
      }
      .prize-icon {
        width: 70rpx;
        height: 70rpx;
        border-radius: 10rpx;
      }
      .prize-name {
        margin-left: 20rpx;
        font-size: 26rpx;
      }
    }
    .title-tag {
      display: inline-block;
      height: 56rpx;
      margin-bottom: 30rpx;
      padding: 0 18rpx;
      line-height: 56rpx;
      color: #333;
      background-color: #fff;
      text-align: center;
    }
  }
  .close-btn {
    margin-bottom: 20rpx;
    color: #fff;
    .iconfont {
      font-size: 60rpx;
    }
  }
}
</style>
