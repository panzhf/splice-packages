<template>
  <view :style="themeVars">
    <tab
      :tab="activiyTab"
      :draw-height="5"
      :active-bag-color="themeInfo.color"
      :draw-width="63"
      :active-index.sync="activiyTabIndex"
      class="tab"
      @change="handleChange"
    />
    <view class="list">
      <view v-for="(item, index) in list" :key="index" :class="['item', 'flex', index !== 0 ? 'mt-20' : '']">
        <image class="product" :src="item.layoutimageurl" mode="scaleToFill" />
        <view class="right ml-20 flex-1">
          <view class="state">
            <view class="row flex">
              上传时间：
              <view>{{ item.createdtime }}</view>
            </view>
            <view class="row flex mt-6">
              参与人：
              <view>{{ item.storemanname }} {{ item.storemanmobileno || '' }}</view>
            </view>
            <view class="row flex mt-6">
              状态：
              <view :class="{ err: item.processstatus === -1 }">{{ filtersState(item.processstatus) }}</view>
            </view>
            <view v-if="item.processstatus === 1" class="row flex mt-6">
              <div class="lable-left">奖励：</div>
              <div class="lable-right">
                <view v-if="item.hbid">
                  ￥{{ item.hbmoney }}
                  <text
                    v-if="filtersHbState(item.hbsendresult, item.hbtype)"
                    class="tips ml-10"
                    :class="item.hbsendresult === -1 ? 'err' : item.hbsendresult === 0 ? 'warm' : ''"
                  >
                    ({{ filtersHbState(item.hbsendresult, item.hbtype) }})
                  </text>
                </view>
                <view v-if="item.shouvouid">
                  {{ item.shouvouname }} *{{ item.shouvouamount }}
                  <text
                    class="tips ml-10"
                    :class="item.shouvousendresult === -1 ? 'err' : item.shouvousendresult === 0 ? 'warm' : ''"
                  >
                    ({{ item.shouvoustatusdesc }})
                  </text>
                </view>
              </div>
            </view>
          </view>
          <view v-if="item.processstatus === -1" class="btn-box flex flex-end">
            <view class="btn" @tap="handleRemark(item)">
              查看原因
              <text class="iconfont iconjiantou1" />
            </view>
          </view>
        </view>
      </view>
      <load-more v-if="!loading && list.length" :has-more="hasMore" style="width: 100%" />
      <none-data v-if="!list.length && !loading" msg="暂无数据" class="none-data" style="width: 100%" />
    </view>
    <common-popup v-model="showPopup" title="未通过原因" :content="popupMsg" class="pop" />
  </view>
</template>

<script>
import { apiGetRecordList } from 'packages/api/display-present'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import Tab from '@/components/tab/index.vue'
import filtersMixin from './mixins'
import { activityCheckMixin } from 'packages/mixins/activity-check'
export default {
  components: {
    Tab,
    NoneData,
    LoadMore
  },
  mixins: [filtersMixin, activityCheckMixin],
  data() {
    return {
      showPopup: false,
      popupMsg: '',
      activityId: 0,
      activiyTab: [
        {
          name: '全部',
          value: -2
        },
        {
          name: '待审核',
          value: -0
        },
        {
          name: '通过',
          value: 1
        },
        {
          name: '未通过',
          value: -1
        }
      ],
      activiyTabIndex: 0,
      list: [],
      maxid: 0,
      processstatus: -2,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  onLoad(options) {
    this.activityId = options.id
    if (options.m) {
      // 没有m：通过旧版本消息订阅进入，或小程序页面跳转，请求数据为空。新版本有m，得检验
      const r = this.checkBrand({ m: options.m })
      if (!r) return
    }
    this.getData()
    this.$store.commit('updateRefreshTag', true)
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    handleChange() {
      this.list = []
      this.maxid = 0
      this.hasMore = true
      this.loading = true
      this.busy = false
      this.getData()
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      const { activiyTabIndex, activiyTab } = this
      this.busy = true
      let res = await apiGetRecordList({
        maxid: this.maxid,
        activityid: this.activityId,
        processstatus: activiyTab[activiyTabIndex].value
      })
      if (this.$ck(res, true)) {
        this.list = [...this.list, ...res.return_data.list]
        this.maxid = res.return_data.maxid
        // 判断加载完成
        this.hasMore = res.return_data.maxid !== 0
        this.busy = false
        this.loading = false
      }
    },
    getRewardText(item) {
      const parts = []
      if (item.hbmoney) parts.push(`￥${item.hbmoney}`)
      if (item.shouvouname && item.shouvouamount) parts.push(`${item.shouvouname}*${item.shouvouamount}`)
      return parts.join('，')
    },
    handleRemark(item) {
      this.popupMsg = item.remark
      this.showPopup = true
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  padding: 20rpx;
  .item {
    background: #fff;
    padding: 30rpx;
    .product {
      @include wh(150rpx, 150rpx);
    }
    .right {
      .state {
        min-height: 60rpx;
        font-size: 26rpx;
        font-weight: 500;
        color: #666666;
        .err {
          color: #ff5e33;
        }
        .warm {
          color: $uni-color-primary;
        }
        .lable-left {
          flex-shrink: 0;
        }
        .lable-right {
          flex: 1;
          word-break: break-all;
          white-space: normal;
        }
      }
      .tips {
        font-size: 22rpx;
        font-weight: 500;
        color: #999999;
      }
      .btn-box {
        font-size: 22rpx;
        font-weight: 500;
        color: #3385ff;
        font-weight: 500;
        .iconjiantou1 {
          margin-left: 12rpx;
          font-size: 22rpx;
        }
      }
    }
  }
}
</style>
