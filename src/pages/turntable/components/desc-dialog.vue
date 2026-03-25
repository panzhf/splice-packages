<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view class="desc-dialog flex flex-column" @tap.stop="() => {}">
      <base-tab v-model="currentTab" :tab-list="tabList" active-color="#ffe7ac" />
      <scroll-view
        class="content flex-1"
        :scroll-y="true"
        :enable-flex="true"
        :style="{ height: scrollViewHeight }"
        @scrolltolower="loadData"
      >
        <template v-if="currentTab === 0">
          <view class="item">
            <view class="title-tag">活动主题</view>
            <view>{{ info.title }}</view>
          </view>
          <view class="item">
            <view class="title-tag">活动时间</view>
            <view>{{ info.startdatetime }} 至 {{ info.enddatetime }}</view>
          </view>
          <view v-if="info.status === 2" class="item">
            <view class="title-tag">每天参与时间</view>
            <view>{{ info.timestartdatetime }} 至 {{ info.timeenddatetime }}</view>
          </view>
          <view class="item">
            <view class="title-tag">活动规则</view>
            <u-parse class="rich-text" :html="info.rule" :tag-style="parseStyle" />
          </view>
        </template>
        <template v-if="currentTab === 1">
          <none-data v-if="showNoneData" text-color="#fff4db" />
          <template v-else>
            <view
              v-for="(item, index) in list"
              :key="index"
              class="prize-item flex flex-middle"
              @tap.stop="handleNavigate(item)"
            >
              <image :src="item.prizeimageurl || defaultPrizeIcon" class="prize-icon" />
              <view class="flex-1 ml-20 mr-20 overflow-h">
                <view class="fs-28 ellipsis fw-bold">{{ item.prizename }}</view>
                <view class="fs-24 mt-10 time">{{ item.awardtime }}</view>
              </view>
              <view class="iconfont iconjiantou1 fs-24" />
            </view>
          </template>
        </template>
      </scroll-view>
      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2 fw-bold" @tap.stop="close" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import { apiGetMyPoolPrize } from 'packages/api/activity'
import BaseTab from 'packages/components/base-tab/base-tab.vue'
import NoneData from '@/components/none-data/index.vue'
import dialogMixin from 'packages/mixins/dialog'
import richTextMixin from 'packages/mixins/rich-text'
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  name: 'DescDialog',
  components: {
    BaseTab,
    NoneData
  },
  mixins: [dialogMixin, richTextMixin, packageStaticMixin],
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      currentTab: 0,
      tabList: [
        {
          label: '活动说明',
          value: 0
        },
        {
          label: '已获奖品',
          value: 1
        }
      ],
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
    },
    defaultPrizeIcon() {
      return this.PACKAGE_STATIC_URL + 'jifenJang.png'
    }
  },
  watch: {
    value(v) {
      if (v) {
        this.currentTab = 0
        this.resetData()
        this.getData()
      }
    }
  },
  mounted() {
    let sys = uni.getSystemInfoSync()
    // tab=90; scroll-view padding 40; close:60; 留白20; 250=90+40*2+60+20;
    /* #ifdef MP-WEIXIN */
    this.scrollViewHeight = `calc(${sys.windowHeight}px - 250rpx)`
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
    getData() {
      const nextPage = this.pageInfo.pageindex + 1
      apiGetMyPoolPrize({
        aid: this.info.actid,
        pageindex: nextPage,
        pagesize: this.pageInfo.pagesize
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        let r = d.return_data || []
        r.length > 0 && (this.pageInfo.pageindex = nextPage)
        this.list = [...this.list, ...r]
        this.finished = r.length === 0
      })
    },
    loadData() {
      if (this.currentTab === 0) return
      if (this.finished) return
      this.getData()
    },
    handleNavigate(item) {
      /* #ifdef H5 */
      if (this.info.isThirdOpen) {
        // 跳转到第三方的奖品列表
        this.$wechat.miniProgram.navigateTo({
          url: item.prizetype === 1 ? '/pages/integralMall/pointsDetail/index' : '/pages/myCard/myCard'
          // url: item.prizetype === 1 ? '/packages/src/integral/me' : '/packages/src/union-card/list'
        })
      } else {
        location.href = item.h5jumpurl
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({ url: item.mpjumpurl })
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
  padding: 40rpx;
  .content {
    padding: 60rpx 0 20rpx;
    box-sizing: border-box;
    color: #fff;
    font-size: 28rpx;
    overscroll-behavior-y: contain !important;
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
      padding-left: 18rpx;
      padding-right: 18rpx;
      border-bottom: 1px dotted #fff;
      & + .prize-item {
        padding-top: 40rpx;
      }
      .prize-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 10rpx;
      }
      .time {
        color: #9f9f9f;
      }
    }
    .title-tag {
      display: inline-block;
      height: 56rpx;
      margin-bottom: 30rpx;
      padding: 0 18rpx;
      line-height: 56rpx;
      color: #333;
      background-color: #ffe7ac;
      text-align: center;
      border-radius: 10rpx;
      font-weight: bold;
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
