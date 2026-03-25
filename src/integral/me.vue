<template>
  <view class="container">
    <view class="integral flex flex-column">
      <view class="info" :style="{ 'background-image': 'url(' + integralBg + ')' }">
        <view class="integral-sm">
          <view class="title" @tap="handleGetPointsExplain">积分说明</view>
          <view class="iconfont iconbangzhu" @tap="handleGetPointsExplain" />
        </view>
        <view class="integral-num" :style="{ marginTop: 'integralNumMtCls' }">
          <text class="iconfont iconintegral-solid" />
          <text>{{ totalPoint }}</text>
        </view>
        <view v-if="hasInMall" class="inMall-link ub ub-pc" @tap="clikJump">
          <view class="ub ub-ac">
            <view>积分商城</view>
            <view class="iconfont iconjiantou1" />
          </view>
        </view>
      </view>
      <view class="overview ub">
        <view class="ub-f1 ub ub-ver ub-ac">
          <view class="num">{{ revenuePoint }}</view>
          <view class="type">今日获得</view>
        </view>
        <view class="ub-f1 ub ub-ver ub-ac">
          <view class="num">{{ expensePoint }}</view>
          <view class="type">今日消耗</view>
        </view>
      </view>
      <view class="years-select ub">
        <view class="ub-f1">
          <picker mode="multiSelector" :value="[yearValue, monthValue]" :range="definedDate" @change="bindPickerChange">
            <view class="years ub ub-ac">
              <view>
                {{ currentYear }}年
                <test v-if="currenMonth">{{ currenMonth }}月</test>
                <test v-else>全部</test>
              </view>
              <view class="iconfont iconjiantou1" />
            </view>
          </picker>
        </view>
        <view class="income-detail">
          <view>收入：{{ income }}</view>
          <view>支出：{{ expenditure }}</view>
        </view>
      </view>
      <view class="flex-1">
        <view v-if="bgStae === false" class="list">
          <view class="header ub">
            <view class="ub-f1">时间</view>
            <view class="ub-f1">类型</view>
            <view style="width: 240rpx">事项</view>
            <view class="ub-f1">积分</view>
          </view>
          <view class="content">
            <view v-for="(item, index) in integralDetail" :key="index" class="ub">
              <view class="time ub-f1 ub ub-ver ub-ac ub-pc">
                <view>{{ item.timepoint }}</view>
                <view>{{ item.datepoint }}</view>
              </view>
              <view class="type ub-f1 ub ub-ac ub-pc">
                <view>{{ item.source }}</view>
              </view>
              <view class="matter ub ub-ac ub-pc" style="width: 240rpx; word-break: break-all">{{ item.explain }}</view>
              <view v-if="item.type === 1" class="point ub-f1 ub ub-ac ub-pc">+ {{ item.point }}</view>
              <view v-if="item.type === 0" class="reduce-point ub-f1 ub ub-ac ub-pc">- {{ item.point }}</view>
            </view>
          </view>
        </view>
        <none-data v-if="!integralDetail.length && bgStae" />
        <load-more v-if="bgStae === false" :has-more="hasMore" />
      </view>
      <!-- #ifdef MP-MEMBER || MP-CLOUDSHOP -->
      <md-copyright />
      <!-- #endif -->
    </view>
    <popup ref="explainPopup" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetPointInfo, apiPointDetail, apiGetMall, apiGetPointsExplain } from '../api/my.js'
import { staticURL } from '@/config'
import Popup from '../components/popup/explain-popup.vue'
// #ifdef MP-CLOUDSHOP
import NoneData from '@/components/none-data/none-data.vue'
import LoadMore from '@/components/Loadmore/Loadmore.vue'
// #endif
// #ifndef MP-CLOUDSHOP
import NoneData from '@/components/none-data/index.vue'
import LoadMore from '@/components/load-more/index.vue'
// #endif
export default {
  components: {
    Popup,
    NoneData,
    LoadMore
  },
  data() {
    return {
      integralBg: staticURL(true) + 'integral-bg.jpg',
      hasInMall: true, // 是否显示积分商城
      integralDetail: [],
      bgStae: false, // 是否显示缺省页
      hasMore: true, // 加载 false表示不需要加载 ， true表示继续显示加载
      totalPoint: 0, // 总积分
      revenuePoint: 0, // 今日收入
      expensePoint: 0, // 今日支出
      pagePoint: 1, // 积分默认页数
      textArray: ['您还没有相应记录'],
      // iconW: '290',
      currentYear: new Date().getFullYear(),
      currenMonth: new Date().getMonth() + 1,
      income: 0,
      expenditure: 0,
      definedDate: [[], []], // 自定义日期 用于多列选择器 年月
      yearValue: 0, // 年下标  用于聚焦picker年份
      monthValue: 0 // 月下标  用于聚焦picker月份
    }
  },
  computed: {
    integralNumMtCls() {
      return this.hasInMall ? undefined : '60rpx'
    }
  },
  methods: {
    handleGetPointsExplain() {
      apiGetPointsExplain().then(res => {
        if (this.$ck(res, true)) {
          this.$refs.explainPopup.showToast({
            title: '积分说明',
            explain: res.return_data.integralexplain
          })
        }
      })
    },
    clikJump() {
      uni.navigateTo({
        url: `/packages/src/integral/index`
      })
    },
    pointData() {
      apiGetPointInfo({
        year: this.currentYear,
        month: this.currenMonth
      }).then(res => {
        if (res.return_code !== 0) this.bgStae = true
        if (this.$ck(res)) {
          let { totalpoint, revenuepoint, expensepoint, yearrevenuepoint, yearexpensepoint } = res.return_data
          this.totalPoint = totalpoint
          this.revenuePoint = revenuepoint
          this.expensePoint = expensepoint
          this.income = yearrevenuepoint
          this.expenditure = yearexpensepoint
        }
      })
    },
    handlePointDetail() {
      apiPointDetail({
        page: this.pagePoint,
        year: this.currentYear,
        month: this.currenMonth
      })
        .then(res => {
          let resList = res.return_data.list
          // 根据后端返回总条列数判断显示缺省页
          this.bgStae = res.return_data.totalcount === 0
          let tempPoint = []
          let list = resList.map(ele => {
            tempPoint = ele.addtime.split(' ')
            ele = {
              ...ele,
              datepoint: tempPoint[0],
              timepoint: tempPoint[1]
            }
            return ele
          })
          this.integralDetail = [...this.integralDetail, ...list]
          this.pagePoint++
          if (this.integralDetail.length === res.return_data.totalcount) {
            this.hasMore = false
          }
        })
        .catch(err => {
          if (err.return_code === 600001) {
            this.bgStae = true
          }
        })
    },
    getMall() {
      // 商城基本信息接口
      apiGetMall().then(res => {
        this.hasInMall = res.return_data.isshowmall
      })
    },
    bindPickerChange(ev) {
      let year = this.definedDate[0][ev.detail.value[0]] // 年
      let month = this.definedDate[1][ev.detail.value[1]] // 月
      this.currentYear = year
      switch (month) {
        case '01月':
          this.currenMonth = 1
          break
        case '02月':
          this.currenMonth = 2
          break
        case '03月':
          this.currenMonth = 3
          break
        case '04月':
          this.currenMonth = 4
          break
        case '05月':
          this.currenMonth = 5
          break
        case '06月':
          this.currenMonth = 6
          break
        case '07月':
          this.currenMonth = 7
          break
        case '08月':
          this.currenMonth = 8
          break
        case '09月':
          this.currenMonth = 9
          break
        case '10月':
          this.currenMonth = 10
          break
        case '11月':
          this.currenMonth = 11
          break
        case '12月':
          this.currenMonth = 12
          break
        default:
          this.currenMonth = 0 // 全部
          break
      }
      this.hasMore = true
      this.pagePoint = 1
      this.integralDetail = []
      this.handlePointDetail()
      this.pointData()
    },
    definedDateFn() {
      // 自定义时间选择器
      let beginDate = 2014
      let newYear = new Date().getFullYear()
      const year = new Date().getFullYear()
      let newMonth = new Date().getMonth() + 1
      if (newMonth.length <= 1) {
        newMonth = `0` + newMonth
      }
      newMonth = newMonth + `月`
      let dateYear = []
      let month = [
        '01月',
        '02月',
        '03月',
        '04月',
        '05月',
        '06月',
        '07月',
        '08月',
        '09月',
        '10月',
        '11月',
        '12月',
        '全部'
      ]
      for (let i = 0; i < 100; i++) {
        if (newYear >= beginDate) {
          dateYear.unshift(newYear)
          newYear--
        } else {
          break
        }
      }
      this.definedDate[0] = dateYear
      this.definedDate[1] = month
      this.yearValue = this.definedDate[0].indexOf(year)
      this.monthValue = this.definedDate[1].indexOf(newMonth)
    }
  },
  async onLoad() {
    uni.setBackgroundColor({
      backgroundColor: '#789782',
      backgroundColorTop: '#789782'
    })
    this.pointData()
    this.getMall()
    this.handlePointDetail()
    this.definedDateFn()
  },
  onReachBottom() {
    if (this.hasMore) {
      // this.pagePoint++
      this.handlePointDetail()
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  .integral {
    min-height: 100vh;
    .info {
      height: 290rpx;
      background-size: cover;
      overflow: hidden;
      .integral-sm {
        margin-top: 20rpx;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: #fff;
        .title {
          font-size: 25rpx;
          font-weight: 500;
          margin-right: 15rpx;
        }
        .iconbangzhu {
          font-size: 34rpx;
          margin-right: 20rpx;
        }
      }
    }
    .integral-num {
      margin-top: -20rpx;
      font-size: 80rpx;
      color: #fff;
      text-align: center;
      .iconfont {
        font-size: 36rpx;
        color: #fff;
        line-height: 1;
        vertical-align: 2px;
        margin-right: 10rpx;
      }
    }
    .inMall-link {
      width: 170rpx;
      height: 50rpx;
      margin: 12rpx auto 0;
      background: #ffa200;
      border-radius: 25rpx;
      // border: 1px solid #d1a560;
      font-size: 24rpx;
      color: #fff;
      text-align: center;
      line-height: 50rpx;
      .iconfont {
        margin-left: 6rpx;
        font-size: 14rpx;
        color: #fff;
      }
    }
    .overview {
      box-sizing: border-box;
      width: 710rpx;
      height: 120rpx;
      margin: -60rpx auto 0;
      padding: 18rpx;
      background: #fff;
      box-shadow: 0rpx 0rpx 7rpx 0rpx rgba(0, 0, 0, 0.05);
      border-radius: 20rpx;
      text-align: center;
      .num {
        font-size: 36rpx;
        line-height: 50rpx;
        color: #ffa200;
      }
      .type {
        font-size: 26rpx;
        line-height: 37rpx;
        color: #000;
      }
    }
    .years-select {
      padding: 20rpx 50rpx;
      font-size: 24rpx;
      color: #999;
      .iconfont {
        margin-left: 14rpx;
        font-size: 18rpx;
        color: #999;
        transform: rotate(90deg);
      }
      .years {
        font-size: 28rpx;
        color: #666;
      }
      & > view {
        &:last-child {
          margin-left: 30rpx;
        }
      }
    }
    .list {
      box-sizing: border-box;
      overflow: hidden;
      min-height: 764rpx;
      margin: 0 20rpx;
      padding: 0 20rpx;
      box-shadow: 0rpx 0rpx 7rpx 0rpx rgba(0, 0, 0, 0.05);
      border-radius: 20rpx 20rpx 0rpx 0rpx;
      background: #fff;
      .header {
        padding: 40rpx 0 26rpx;
        font-size: 26rpx;
        line-height: 37rpx;
        color: #666666;
        text-align: center;
        & > view {
          border-right: 1px solid #eee;
          &:last-child {
            border-right: none;
          }
        }
      }
      .content {
        font-size: 24rpx;
        line-height: 33rpx;
        color: #666666;
        view {
          text-align: center !important;
        }
        & > view {
          width: 100%;
          padding-top: 18rpx;
          padding-bottom: 16rpx;
          border-bottom: 1rpx solid #eee;
        }
        .time {
          view:last-child {
            color: #999999;
          }
        }
        .point {
          color: #d7a068;
        }
        .reduce-point {
          color: #666666;
        }
      }
    }
  }
}

.ub-f1 {
  display: flex;
  flex-direction: column;
}

.ub-ac {
  display: flex;
  justify-content: center;
  width: 100%;
}
.income-detail {
  display: flex;
  flex: 1;
  justify-content: space-around;
}
</style>
