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
      <base-tab v-model="currentTab" :tab-list="tabList" />

      <template v-if="currentTab === 0">
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
              {{ desc.title }}
            </scroll-view>
          </view>
          <view class="item">
            <view class="title-tag">活动时间</view>
            <view>{{ desc.starttime }} 至 {{ desc.endtime }}</view>
          </view>
          <view class="item">
            <view class="title-tag">活动规则</view>
            <u-parse class="rich-text" :html="desc.rule" :tag-style="parseStyle" />
          </view>
        </scroll-view>
      </template>

      <template v-if="currentTab === 1">
        <none-data v-if="showNoneData" text-color="#fff4db" />
        <template v-else>
          <scroll-view
            class="content flex-1"
            :scroll-y="true"
            :enable-flex="true"
            :style="{ height: scrollViewHeight }"
            @scrolltolower="loadData"
          >
            <view v-for="(item, index) in list" :key="index" class="prize-item flex flex-middle">
              <image :src="item.prizeimageurl" class="prize-icon" />
              <view class="flex-1 ml-20 mr-20 overflow-h">
                <view class="fs-28 ellipsis fw-bold">
                  ￥{{ item.awardamount | cashFixedTwo }}品牌红包
                  <text v-if="item.sendstatus === -1">（请联系客服补发）</text>
                </view>
                <view v-if="item.awardsendtime" class="fs-24 mt-10 time">{{ item.awardsendtime }}</view>
              </view>
            </view>
          </scroll-view>
        </template>
      </template>

      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2 fw-bold" @tap.stop="close" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
import richTextMixin from 'packages/mixins/rich-text'
import BaseTab from 'packages/components/base-tab/base-tab.vue'
// #ifndef MP-RETAIL
import NoneData from 'packages/components/none-data/index.vue'
// #endif
import { apiStoreSalesGiftGetRedPacketRecords } from 'packages/api/StoreSalesGift'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { cashFixedTwo } from 'packages/filters'

export default {
  components: {
    BaseTab,
    // #ifndef MP-RETAIL
    NoneData
    // #endif
  },
  filters: {
    cashFixedTwo
  },
  mixins: [dialogMixin, richTextMixin, packageStaticMixin],
  props: {
    top: {
      type: String,
      default: '0'
    },
    desc: {
      type: Object,
      default: () => {}
    },
    actInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      currentTab: 0,
      scrollViewHeight: '',
      list: [],
      pageInfo: {
        pageindex: 0,
        pagesize: 10
      },
      finished: false,
      tabList: [
        {
          label: '活动说明',
          value: 0
        },
        {
          label: '已获红包',
          value: 1
        }
      ]
    }
  },
  computed: {
    showNoneData() {
      // 用于判断无数据显示占位图
      return this.list.length === 0
    }
  },
  watch: {
    value(v) {
      if (v) {
        this.currentTab = 0
        this.getData()
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
    getData() {
      apiStoreSalesGiftGetRedPacketRecords({
        activityid: this.actInfo.activityid
      }).then(res => {
        let list = res.return_data?.results || []
        list.forEach(item => {
          item.prizeimageurl = this.PACKAGE_STATIC_URL + 'hb.png'
        })
        this.list = list
      })
    },
    loadData() {
      if (this.currentTab === 0) return
      if (this.finished) return
      this.getData()
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
    box-sizing: border-box;
    padding: 60rpx 0 20rpx;

    color: #fff;

    font-size: 28rpx;

    .item {
      & + .item {
        margin-top: 60rpx;
      }

      .rich-text {
        word-break: break-all;
      }
    }

    .title-tag {
      display: inline-block;

      height: 56rpx;
      margin-bottom: 30rpx;
      padding: 0 18rpx;

      text-align: center;

      color: #333;
      background-color: #fff;

      line-height: 56rpx;
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

    color: #fff;

    font-size: 26rpx;
  }
}
</style>
