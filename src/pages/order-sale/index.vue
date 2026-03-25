<template>
  <view :style="themeVars">
    <view v-if="pageLoaded" class="order-sale" :style="{ 'background-color': pageConfig.backcolor }">
      <TitleBar :title="info.title" textcolor="#fff" type="detail" show-nav-title is-transparent />

      <!-- 活动说明按钮 -->
      <view class="explain-btn" :style="{ top: explainTop }" @tap="handleShowExplain">
        <text class="iconfont icon-explain" />
        活动说明
      </view>

      <view class="content">
        <!-- 背景图 -->
        <image :src="pageConfig.bg" mode="widthFix" class="bg" />
        <view class="container">
          <view class="order-sale-wrap">
            <!-- 累计金额 -->
            <view class="award">
              <view class="amount">￥{{ info.totalawardamount | cashFixedTwo }}</view>
              <!-- #ifdef MP-RETAIL -->
              <view class="amount-desc">累计获得金额</view>
              <view class="red-packet-btn flex flex-middle flex-center" @tap="handleRedPacketRecord">红包获取记录</view>
              <!-- #endif -->
              <!-- #ifdef MP-DISTRIBUTION -->
              <view class="amount-desc">累计发放金额</view>
              <view class="red-packet-btn flex flex-middle flex-center" @tap="handleDrowRedPacketRecord">
                红包发放明细
              </view>
              <!-- #endif -->
            </view>

            <!-- 主要操作按钮 -->
            <!-- #ifdef MP-RETAIL -->
            <view class="action-buttons">
              <image :src="pics.soldBtnIcon" mode="widthFix" class="sold-btn-icon" @click="handleSaleVerification" />
              <view class="sub-buttons">
                <text class="sub-btn" @tap="handleMyOrders">我的订单</text>
                <text class="sub-btn" @tap="handleViewLeaderboard">查看排行榜</text>
              </view>
            </view>
            <!-- #endif -->
            <!-- #ifdef MP-DISTRIBUTION -->
            <view class="sub-round-buttons fs-28">
              <view class="sub-btn" @tap="handleViewLeaderboard">查看排行榜</view>
            </view>
            <!-- #endif -->
          </view>
        </view>

        <!-- 动销奖励表格 -->
        <view class="reward-table-container">
          <view class="reward-title">动销奖励</view>
          <view class="custom-table">
            <view class="table-header fs-32">
              <view class="col tx-l ml-20">商品信息</view>
              <view class="col">奖励条件</view>
              <view class="col">奖品</view>
            </view>
            <view v-for="(item, index) in rewardList" :key="index" class="table-row fs-24">
              <view class="col product-name tx-l ml-20">{{ item.goodsname }}</view>
              <view class="col condition">每售出一件</view>
              <view class="col reward">￥{{ item.unitreward | cashFixedTwo }} 红包</view>
            </view>
            <view v-if="rewardList.length === 0" class="no-data">暂无数据</view>
          </view>
        </view>

        <!-- 发奖时间说明 -->
        <view class="award-time c-0">发奖时间：{{ awardTimeText }}</view>
      </view>
    </view>

    <explain-info
      ref="explainInfo"
      v-model="showExplain"
      :top="top"
      :desc="descForExplain"
      :act-info="actInfoForExplain"
    />
    <sales-ranking-popup v-model="showSalesRanking" :activity-id="id" :act-info="descForExplain" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
/* #ifdef MP-WEIXIN */
import { getUrlQuery } from 'packages/utils/function'
/* #endif */
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import ExplainInfo from './comps/explain-info.vue'
import { apiStoreSalesGiftGetActivityDetail } from 'packages/api/StoreSalesGift'
import SalesRankingPopup from './comps/sales-ranking-popup.vue'
import { cashFixedTwo } from 'packages/filters'
export default {
  components: {
    TitleBar,
    ExplainInfo,
    SalesRankingPopup
  },
  filters: {
    cashFixedTwo
  },
  data() {
    return {
      id: 0,
      info: {
        title: '',
        themeimage: '',
        totalawardamount: 0,
        ruletext: '',
        starttime: '',
        endtime: '',
        awardtime: ''
      },
      showExplain: false,
      showSalesRanking: false,
      salesRankingData: [],
      pics: {
        bg: staticURL(true) + 'order-sale/bg.jpg', // 背景图
        soldBtnIcon: staticURL(true) + 'order-sale/button.png' // 售出核销按钮图
      },
      pageConfig: {
        bg: '',
        bgColor: ''
      },
      rewardList: [], // 动销奖励列表
      pageLoaded: false
    }
  },
  computed: {
    descForExplain() {
      return {
        title: this.info.title,
        rule: this.info.ruletext,
        starttime: this.info.starttime,
        endtime: this.info.endtime
      }
    },
    actInfoForExplain() {
      return {
        activityid: this.id
      }
    },
    awardTimeText() {
      // 如果有活动信息中的发奖时间，则使用活动信息中的
      if (this.info.awardtime) {
        return this.info.awardtime
      }

      // 如果有活动开始时间，可以显示更具体的时间
      if (this.info.starttime) {
        return `活动开始后订单审核通过即发奖`
      }

      // 默认显示
      return '订单审核通过后发奖'
    },
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      let style = `${44 + this.statusBarHeight}px`
      return style
    },
    explainTop() {
      let style = `calc(${this.top} + 20rpx)`
      return style
    }
  },
  async onLoad(options) {
    if (!options.id && !options.scene) return this.$msg('链接格式不正确')
    const query = options.scene ? getUrlQuery(decodeURIComponent(options.scene)) : options
    this.id = Number(query.id)

    this.getActInfo()
    // let res = wx.getSystemInfoSync()
    // if (res.screenHeight === 812 || res.screenHeight === 896) {
    //   this.topStyle = 'height: 58rpx;bottom: 1048rpx;line-height:58rpx'
    // }
  },
  onShow() {},
  methods: {
    async getActInfo() {
      let res = await apiStoreSalesGiftGetActivityDetail({ activityid: this.id })
      if (this.$ck(res, true)) {
        this.pageLoaded = true
        let { salesrewardrules, ...info } = res.return_data
        this.info = info
        this.rewardList = salesrewardrules || []

        // 设置页面配置
        this.pageConfig = {
          bg: info.themeimage || this.pics.bg,
          bgColor: info.backcolor || '#ff6b35'
        }
      }
    },
    handleShowExplain() {
      this.showExplain = true
    },
    // 红包发放明细
    handleDrowRedPacketRecord() {
      uni.navigateTo({
        url: './award-send-list?activityid=' + this.id
      })
    },
    // 红包获取记录
    handleRedPacketRecord() {
      this.showExplain = true
      // 延迟一下确保弹窗打开后再切换tab
      this.$nextTick(() => {
        if (this.$refs.explainInfo) {
          this.$refs.explainInfo.currentTab = 1
        }
      })
    },
    // 售出核销
    handleSaleVerification() {
      if (this.info.actstatus !== 2) {
        const msgMap = {
          1: '未开始',
          3: '已禁用',
          4: '已结束'
        }
        this.$msg('活动' + msgMap[this.info.actstatus])
        return
      }
      // 缓存当前活动信息
      uni.setStorageSync('currentActivityInfo', this.info)

      uni.navigateTo({
        url: './order-detail?activityid=' + this.id
      })
    },
    // 我的订单
    handleMyOrders() {
      uni.navigateTo({
        url: './my-orders?activityid=' + this.id
      })
    },
    // 查看排行榜 - 简化调用
    handleViewLeaderboard() {
      this.showSalesRanking = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/table.scss';
.order-sale {
  position: relative;
  z-index: 1;

  min-height: 100vh;

  .bg {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;

    width: 100%;
  }
}

// 活动说明按钮
.explain-btn {
  position: absolute;
  right: 0;

  display: flex;
  align-items: center;
  z-index: 100;

  height: 60rpx;
  padding: 0 20rpx 0 24rpx;

  color: #fff;
  border-radius: 40rpx 0rpx 0rpx 40rpx;
  background: linear-gradient(0deg, #f59e6e 0%, #ff5c2c 100%);

  font-family: PingFang SC;
  font-size: 28rpx;
  font-weight: bold;

  .iconfont {
    margin-right: 10rpx;

    font-size: 28rpx;
  }
}

.content {
  width: 100%;
}

.order-sale-wrap {
  position: relative;
  padding-top: 740rpx;
  padding-bottom: 34rpx;

  color: #fff;

  // 大标题文字
  .main-title {
    position: absolute;
    top: 120rpx;
    left: 0;

    width: 100%;

    text-align: center;

    .title-line {
      margin-bottom: 10rpx;

      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.3);

      font-size: 72rpx;
      font-weight: bold;
      line-height: 1.2;
    }
  }

  .award {
    text-align: center;
    .amount {
      margin-bottom: 15rpx;

      color: #fff;

      font-size: 64rpx;
      font-weight: bold;
    }

    .amount-desc {
      margin-bottom: 40rpx;

      color: #fff;

      font-size: 30rpx;
    }

    .red-packet-btn {
      width: 228rpx;
      height: 58rpx;
      margin: 0 auto 15rpx;

      color: #ff282c;
      border-radius: 30rpx;
      background: #fff000;
      box-shadow: inset 0px 0px 30px 0px #ffffff;

      font-size: 28rpx;
      font-weight: bold;
    }
  }
}

// 操作按钮区域
.sub-round-buttons {
  margin: 220rpx auto 0rpx;

  color: #fff;
  .sub-btn {
    width: 220rpx;
    margin: 0 auto;
    padding: 5rpx 0;

    text-align: center;

    border: 1px solid #fff;
    border-radius: 26rpx;
  }
}
.action-buttons {
  margin: 200rpx auto 20rpx;

  text-align: center;

  .sold-btn-icon {
    width: 628rpx;
    margin: 0 auto;
  }

  .sub-buttons {
    display: flex;

    margin-top: 20rpx;
    padding: 0 180rpx;

    color: #fff;

    .sub-btn {
      display: flex;
      align-items: center;
      flex: 1;
      justify-content: center;

      color: #fff;

      font-size: 30rpx;
    }
  }
}

// 动销奖励表格样式
.reward-table-container {
  margin: 0 30rpx;
  padding: 10px 30rpx;

  text-align: center;

  border-radius: 20rpx;
  background: #ffffff;

  // 动销奖励表格
  .reward-title {
    display: block;

    width: 414rpx;
    height: 36rpx;
    margin: 0 auto 26rpx;

    text-align: center;

    color: #333;

    font-size: 32rpx;
    font-weight: bold;
  }
}

// 发奖时间说明
.award-time {
  margin: 0 30rpx;
  padding: 30rpx 0;

  text-align: center;

  font-size: 28rpx;
  font-weight: 500;
}
</style>
