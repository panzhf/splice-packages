<template>
  <view class="container">
    <!-- #ifdef MP-WEIXIN -->
    <title-bar textcolor="#000" type="detail" />
    <!-- #endif -->
    <image class="theme-image" :src="ThemeImageUrl" mode="widthFix" />
    <view class="my-prize">
      <image
        class="my-prize-icon"
        :src="PACKAGE_STATIC_URL + 'lottery/lotto/my-prize-icon.png'"
        mode="widthFix"
        @click="handleJumpToLink()"
      />
      <!-- #ifdef MP-WEIXIN -->
      <auth-button :mode="2" />
      <!-- #endif -->
    </view>
    <view class="desc-icon" @click="handleJumpToDesc">活动说明</view>

    <view class="bg-gradient">
      <!-- 倒计时 -->
      <view class="countdown" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/countdown-bg.png)` }">
        <view class="time-title">
          本期{{ titleMsg }}倒计时
          <text v-if="seconds <= 0">：活动已结束</text>
          <u-count-down
            v-else
            :timestamp="seconds"
            autoplay
            separator="zh"
            color="#E5250C"
            bg-color="#ffe2ac"
            separator-color="#FFEBB3"
            font-size="30"
            separator-size="32"
          />
        </view>
      </view>

      <!-- 开奖提醒 -->
      <image
        v-if="isShowLotteryRemind"
        class="lottery-remind"
        :src="PACKAGE_STATIC_URL + 'lottery/lotto/lottery-remind-icon.png'"
        mode="widthFix"
        @click="handleLotteryRemind"
      />

      <!-- 活动期数 -->
      <view class="lotto-periods">
        <image class="period-bg-left" :src="PACKAGE_STATIC_URL + 'lottery/lotto/period-bg-left.png'" mode="widthFix" />
        <view
          class="period-bg-right"
          :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/period-bg-right.png)` }"
        >
          <image
            v-show="isShowRightArrow"
            class="arrow-right"
            :src="PACKAGE_STATIC_URL + 'lottery/lotto/arrow-right.png'"
            mode="widthFix"
          />
        </view>
        <scroll-view class="period-wrap" scroll-x="true" :scroll-left="scrollLeftNum" @scroll="handlePeriodScroll">
          <view
            v-for="(item, index) in PrizePoolPeriod"
            :key="index"
            class="lotto-period"
            :class="item.Id == activeId ? 'active' : ''"
            @click="handleChangePeriod(item)"
          >
            <view class="period-num">第{{ index + 1 }}期</view>
            <view class="period-time">{{ item.StartTime | formatTime }}-{{ item.EndTime | formatTime }}</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 抽奖次数 -->
    <view class="lotto-count">
      <view class="period-record-count">
        本期{{ drawTitle }}：
        <u-count-to
          v-if="isEnableCountTo"
          :start-val="0"
          :end-val="periodRecordCount"
          :autoplay="true"
          duration="3000"
          color="#e5250c"
          font-size="26"
          bold
        />
        <text v-else class="num">{{ periodRecordCount }}</text>
      </view>
      <view>
        我的{{ drawTitle }}：
        <u-count-to
          v-if="isEnableCountTo"
          :start-val="0"
          :end-val="customerRecordCount"
          :autoplay="true"
          duration="3000"
          color="#e5250c"
          font-size="26"
          bold
        />
        <text v-else class="num">{{ customerRecordCount }}</text>
      </view>
    </view>

    <!-- 参与抽奖 -->
    <view v-if="seconds" class="participate-lotto">
      <image class="bd-top" :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/lotto/participate-title.png'" mode="widthFix" />
      <view class="content p-r" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/bd-mid.png)` }">
        <image
          v-if="IsEnabledPointExchange && !IsEnabledCodeAward"
          :src="PACKAGE_STATIC_URL + 'lottery/lotto/jifen1.gif'"
          mode="widthFix"
          @click="handleExchange"
        />
        <image
          v-if="!IsEnabledPointExchange && IsEnabledCodeAward"
          :src="PACKAGE_STATIC_URL + 'lottery/lotto/chanpin1.gif'"
          mode="widthFix"
          @click="handleScanCode"
        />
        <image
          v-if="IsEnabledPointExchange && IsEnabledCodeAward"
          class="img"
          :src="PACKAGE_STATIC_URL + 'lottery/lotto/jifen2.gif'"
          mode="widthFix"
          @click="handleExchange"
        />
        <image
          v-if="IsEnabledPointExchange && IsEnabledCodeAward"
          class="img"
          :src="PACKAGE_STATIC_URL + 'lottery/lotto/chanpin2.gif'"
          mode="widthFix"
          @click="handleScanCode"
        />
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>
      <image class="bd-bottom" :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-bottom.png'" mode="widthFix" />
    </view>

    <!-- 抽奖结果 -->
    <view v-else class="res-wrap">
      <image :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/lotto/res-title.png'" mode="widthFix" />
      <view
        v-if="activePeriod && !activePeriod.IsShowAwardResult"
        class="content res-text"
        :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/bd-mid.png)` }"
      >
        待开奖，请稍后再来~
      </view>
      <view v-else class="content" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/bd-mid.png)` }">
        <view class="current-prize">
          <text v-if="customerRecordCount == 0">好可惜，您没有参与~</text>
          <view v-if="customerRecordCount > 0 && CustomerAwardRecord" class="flex flex-middle flex-center overflow-h">
            <text class="ellipsis">恭喜您获得了：{{ CustomerAwardRecord.AwardName }}</text>
            <text class="lookbtn shrink-0 fs-24" @click="handleJumpToLink(CustomerAwardRecord.ID)">
              去{{ CustomerAwardRecord.PrizeType === 0 ? '领取' : '查看' }}
            </text>
          </view>
          <text v-if="customerRecordCount > 0 && !CustomerAwardRecord">很遗憾，您没有中奖~</text>
        </view>
        <view v-if="awardStatistics.length > 0" class="prize-list">
          <view class="prize-content">
            <view v-for="(item, index) in awardStatistics" :key="index" class="prize-item">
              <text class="prize-name">{{ item.Name }}</text>
              <text class="prize-count">发放{{ item.AwardCount }}份</text>
            </view>
          </view>
        </view>
        <view v-show="customerRecordCount > 0 && CustomerAwardRecord" class="tips">
          <text class="tips-text">温馨提示：若您获取的是实物奖品，需点击去领取填写收货地址，才能正常发货</text>
        </view>
      </view>
      <image class="bd-bottom" :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-bottom.png'" mode="widthFix" />
    </view>

    <!-- 奖项展示 -->
    <view v-if="seconds && showPrizeList.length > 0" class="prize-list">
      <image class="bd-top" :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/lotto/prize-list-title.png'" mode="widthFix" />
      <view class="content" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/bd-mid.png)` }">
        <view v-for="item in showPrizeList" :key="item.Id" class="prize-item">
          <u-image
            width="90rpx"
            height="90rpx"
            border-radius="5"
            :src="item.PrizeImageUrl || PACKAGE_STATIC_URL + 'lottery/lotto/default-prize.png'"
          />
          <view class="prize-name">{{ item.Name }}</view>
        </view>
      </view>
      <image class="bd-bottom" :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-bottom.png'" mode="widthFix" />
    </view>

    <!-- 中奖记录 -->
    <view v-else class="win-record">
      <image class="bd-top" :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/lotto/win-record-bg.png'" mode="widthFix" />
      <view class="content" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/bd-mid.png)` }">
        <!-- #ifdef H5 -->
        <vue-danmaku
          ref="danmaku"
          :danmus="barrageList"
          use-slot
          :top="12"
          :right="100"
          :speeds="50"
          :speed="20"
          :debounce="500"
          :channels="3"
          :loop="true"
        >
          <template slot="dm" slot-scope="{ danmu }">
            <view class="custom-item">
              <u-image class="avatar" width="30rpx" height="30rpx" :src="danmu.avatar" shape="circle" />
              {{ danmu.username }}获得了
              <text class="prizename">{{ danmu.prizename }}</text>
            </view>
          </template>
        </vue-danmaku>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="dm-wrap">
          <view v-for="(item, index) in barrageList" :key="index" class="dm" :class="isMove ? 'move' : 'pause'">
            <view class="custom-item">
              <u-image class="avatar" width="30rpx" height="30rpx" :src="item.avatar" shape="circle" />
              {{ item.username }}获得了
              <text class="prizename">{{ item.prizename }}</text>
            </view>
          </view>
        </view>
        <!-- #endif -->
      </view>
      <image class="bd-bottom" :src="PACKAGE_STATIC_URL + 'lottery/lotto/bd-bottom.png'" mode="widthFix" />
    </view>
    <md-copyright bg-color="transparent" />

    <!-- 积分兑换弹窗 -->
    <view v-show="isShowPointsPopup" class="points-popup-wrap">
      <u-image
        v-show="isShowPointsPopup"
        class="close-icon"
        width="60rpx"
        height="60rpx"
        :src="PACKAGE_STATIC_URL + 'lottery/lotto/close-icon.png'"
        mode="widthFix"
        @click="isShowPointsPopup = false"
      />
      <u-popup
        v-model="isShowPointsPopup"
        class="points-popup"
        mode="bottom"
        height="756rpx"
        z-index="1000"
        border-radius="20"
      >
        <image class="points-top" :src="PACKAGE_STATIC_URL + 'lottery/lotto/points-top-bg.png'" mode="widthFix" />
        <view class="points-wrap">
          <view class="my-points">
            我的积分
            <view class="my-points-count">{{ myPoints }}</view>
          </view>
          <view
            class="change-btn"
            :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/change-btn.png)` }"
            @click="handleChange"
          />
          <view class="desc">每{{ pointAmount }}积分可兑换一次{{ drawTitle }}</view>
          <view class="tips">
            * {{ drawTitle }}越多，中奖几率越大！查看详细
            <text class="detail" @click="handleJumpToDesc">活动说明</text>
          </view>
        </view>
        <image class="points-bottom" :src="PACKAGE_STATIC_URL + 'lottery/lotto/explain-bottom.jpg'" mode="widthFix" />
      </u-popup>
    </view>

    <!-- 获得机会弹窗 -->
    <lotto-popup
      :is-show="isShowPopup"
      :popup-title="popupTitle"
      :info="popupInfo"
      :count="lotteryCount"
      :is-show-btn="isShowPopupBtn"
      :draw-title="drawTitle"
      @submit="handleClosePopup"
    />

    <!-- #ifdef H5 -->
    <!-- 关注公众号 -->
    <md-follow-gzh ref="follow" @status="handleChangeGzStatus" />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <!-- <auth-button :mode="2" /> -->
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
/* #ifdef H5 */
import vueDanmaku from 'vue-danmaku'
/* #endif */
/* #ifdef MP-WEIXIN */
import subscribeMsg from 'packages/mixins/subscribe-msg' // 消息订阅
import TitleBar from 'packages/components/title-bar/title-bar.vue'
/* #endif */
import { apiGetwxdata } from 'packages/api/common'
import LottoPopup from '../components/LottoPopup'
import dayjs from 'dayjs'
import {
  apiGetActivity,
  apiGetAcivityParticipationCount,
  apiGetActivityAwardRecords,
  apiGetPeriodAwardStatistics,
  apiGetFirstAwardTipsByAwardId,
  apiGetShowPoolPrize,
  apiGetSubscribeTemplateId,
  apiAddSubscribeRecord,
  apiGetPointAmount,
  apiWinActivityChanceByPoint,
  apiGetActChanceIsNew
} from 'packages/api/prizePool'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { setTitleMixin } from 'packages/mixins/navigation'

export default {
  components: {
    // #ifdef H5
    vueDanmaku,
    // #endif
    // #ifdef MP-WEIXIN
    TitleBar,
    // #endif
    LottoPopup
  },
  filters: {
    formatTime(v) {
      return dayjs(v).format('MM.DD HH:mm')
    }
  },
  mixins: [
    packageStaticMixin,
    setTitleMixin,
    /* #ifdef MP-WEIXIN */
    subscribeMsg
    /* #endif */
  ],
  data() {
    return {
      aid: '', // 活动aid
      id: 0, // 活动id
      m: '', // 品牌商
      skin: 0, // 模板
      pid: '', // 中奖通知进来的分期id
      activeId: '', // 当前选中期数Id
      IsEnabledPointExchange: false, // 是否开启积分兑换获取机会
      IsEnabledCodeAward: false, // 是否开启扫码活动获取机会
      ThemeImageUrl: '', // 背景图
      drawTitle: '', // 抽奖名称
      PrizePoolPeriod: [], // 所有周期列表
      CurrentPeriod: {}, // 当前周期
      barrageList: [], // 中奖列表
      showPrizeList: [], // 展示奖项列表
      periodRecordCount: 0, // 总机会数
      customerRecordCount: 0, // 个人机会数
      CustomerAwardRecord: null, // 个人中奖记录
      awardStatistics: [], // 奖项中奖情况
      malllink: '', // 我的奖品跳转链接
      wxConfig: null, // 微信配置
      titleMsg: '结束', // 倒计时提示语
      StartTime: '', // 未开始的时间
      shareFlagCount: 10, // 分享请求次数标识
      scrollLeftNum: 0, // 期数初始化滚动大小
      isShowLotteryRemind: false, // 是否显示开奖提醒
      GzStatus: 1, // H5关注公众号状态
      isShowPointsPopup: false, // 是否显示积分兑换弹窗
      myPoints: 0, // 我的积分
      pointAmount: 0, // 每次兑换消耗积分数
      lotteryCount: 0, // 获得抽奖机会数
      isShowPopup: false, // 是否显示弹窗
      isShowPopupBtn: false, // 是否显示弹窗按钮
      popupTitle: '', // 弹窗标题
      popupInfo: '', // 弹窗内容
      isEnableCountTo: false, // 抽奖机会是否要数字滚动
      isShowRightArrow: true, // 是否显示期数右箭头
      /* #ifdef MP-WEIXIN */
      isMpSubscribed: false, // 是否订阅了模板消息
      tmplId: '', // 订阅消息模板id
      isMove: false, // 弹幕是否移动
      moveTimer: null // 弹幕定时器
      /* #endif */
    }
  },
  computed: {
    // 本期结束倒计时时间，单位：秒 = 当前选中期数 - 当前时间
    seconds() {
      if (!this.CurrentPeriod.EndTime) {
        return 0
      }
      let index = this.PrizePoolPeriod.findIndex(item => {
        return this.activeId == item.Id
      })
      let seconds = dayjs(this.PrizePoolPeriod[index].EndTime).unix() - dayjs().unix()
      let beginSeconds = dayjs(this.StartTime).unix() - dayjs().unix()
      if (beginSeconds > 0) {
        seconds = beginSeconds
        this.titleMsgFn()
      }
      return seconds <= 0 ? 0 : seconds
    },
    // 当前选中期数
    activePeriod() {
      let index = this.PrizePoolPeriod.findIndex(item => {
        return this.activeId == item.Id
      })
      let activePeriod = this.PrizePoolPeriod[index]
      return activePeriod
    }
  },
  watch: {
    /* #ifdef MP-WEIXIN */
    barrageList(newVal, oldVal) {
      this.moveTimer && clearInterval(this.moveTimer)
      if (newVal.length > 0) {
        // 每隔一段时间会重置轮播弹幕， 3 为轨道数， 5000 为每组时间
        let time = Math.ceil(newVal.length / 3) * 5000
        this.isMove = true
        this.moveTimer = setInterval(() => {
          this.isMove = false
          setTimeout(() => {
            this.isMove = true
          }, 500)
        }, time)
      }
    }
    /* #endif */
  },
  onLoad(option) {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    this.pid = this.$route.query.pid || ''
    this.awardId = this.$route.query.awardId || ''
    this.apiGetwxdata()
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    this.pid = option.pid || ''
    this.awardId = option.awardId || ''
    this.initShare()
    /* #endif */
    this.getFirstAwardTipsByAwardId()
    this.getPointAmount()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif

    this.apiGetActivity()
  },
  onHide() {
    /* #ifdef H5 */
    this.barrageList = []
    this.$refs.danmaku && this.$refs.danmaku.stop()
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.moveTimer && clearInterval(this.moveTimer)
    /* #endif */
  },
  /* #ifdef MP-WEIXIN */
  onShareAppMessage() {
    return {
      title: this.wxConfig.sharetext,
      imageUrl: this.wxConfig.shareimg,
      path: `/packages/src/pages/lotto/index?scene=id%3D${this.id}%26m%3D${this.m}%26skin%3D0`
    }
  },
  /* #endif */
  methods: {
    // 判断抽奖机会是否有增加
    getActChanceIsNew() {
      let params = {
        aid: this.aid,
        periodId: this.CurrentPeriod.Id
      }
      apiGetActChanceIsNew(params).then(res => {
        if (res.return_data.AddChanceNum > 0) {
          this.lotteryCount = res.return_data.AddChanceNum
          this.popupTitle = res.return_data.IsFirstAddChance ? '参与活动成功' : `恭喜获得本期${this.drawTitle}`
          this.popupInfo = res.return_data.IsFirstAddChance ? `恭喜获得本期${this.drawTitle}` : '中奖几率又增加啦~'
          this.isShowPopupBtn = true
          this.isShowPopup = true
        }
      })
    },
    // 参与弹窗点击好的
    handleClosePopup() {
      this.isShowPopup = false
      setTimeout(() => {
        this.isEnableCountTo = true
      }, 2000)
      setTimeout(() => {
        this.isEnableCountTo = false
      }, 5000)
    },
    // 关注公众号状态
    handleChangeGzStatus(status) {
      this.isShowLotteryRemind = status !== 1
    },
    // 获取活动详细信息
    apiGetActivity() {
      apiGetActivity({ aid: this.aid })
        .then(async res => {
          this.malllink = res.return_malllink
          let data = res.return_data
          this.setTitle(data.Title)
          this.id = data.Id
          this.PrizePoolPeriod = data.PrizePoolPeriod
          if (this.PrizePoolPeriod.length < 4) {
            this.isShowRightArrow = false
          }
          this.CurrentPeriod = data.CurrentPeriod
          this.StartTime = data.StartTime
          this.IsEnabledPointExchange = data.IsEnabledPointExchange
          this.IsEnabledCodeAward = data.IsEnabledCodeAward
          this.activeId = this.pid != '' && this.pid != 'undefined' ? Number(this.pid) : data.CurrentPeriod.Id
          this.drawTitle = data.IsCustomLotteryDrawTitle ? data.LotteryDrawTitle : '抽奖机会'
          this.ThemeImageUrl = data.ThemeImageUrl
          this.pointAmount = data.PointAmount

          uni.setStorageSync('Rule', data.Rule)
          uni.setStorageSync('PointAmount', data.PointAmount)
          uni.setStorageSync('DrawTitle', this.drawTitle)

          let requestId = this.pid ? this.pid : this.CurrentPeriod.Id
          this.getAcivityParticipationCount(requestId)
          this.getActivityAwardRecords(requestId)
          this.getPeriodAwardStatistics(requestId)
          this.scrollLeftFn()
          await this.getShowPoolPrize(requestId)
          this.getActChanceIsNew()
        })
        .catch(err => {
          /* #ifdef MP-WEIXIN */
          if (err.return_code === 30001) {
            uni.redirectTo({
              url: '/packages/src/pages/lotto/error-page'
            })
          }
          /* #endif */
        })
    },
    // 初始化数据滚动位置
    scrollLeftFn() {
      let num
      this.PrizePoolPeriod.forEach((item, index) => {
        if (this.activeId === item.Id) {
          num = index
        }
      })
      this.$nextTick(() => {
        if (num === 0) return
        let value = 160 * (num - 1)
        this.scrollLeftNum = value
      })
    },
    // 获取奖项展示列表
    getShowPoolPrize(periodId) {
      return new Promise((resolve, reject) => {
        let params = {
          aid: this.aid,
          periodId
        }
        apiGetShowPoolPrize(params)
          .then(res => {
            this.showPrizeList = res.return_data
            resolve()
          })
          .catch(() => {
            reject()
          })
      })
    },
    // 获取统计数据
    getAcivityParticipationCount(periodId) {
      let params = {
        aid: this.aid,
        periodId
      }
      apiGetAcivityParticipationCount(params).then(res => {
        let data = res.return_data
        this.customerRecordCount = data.customerRecordCount
        this.periodRecordCount = data.periodRecordCount
        /* #ifdef MP-WEIXIN */
        this.isMpSubscribed = data.isMpSubscribed
        this.isShowLotteryRemind = !data.isMpSubscribed
        // 未订阅且未开奖
        if (this.isMpSubscribed === false && this.seconds > 0) {
          this.getSubscribeTemplateId()
        }
        /* #endif */
      })
    },
    /* #ifdef MP-WEIXIN */
    // 查询商户的订阅小程序模板ID
    getSubscribeTemplateId() {
      apiGetSubscribeTemplateId({ m: this.m }).then(res => {
        this.tmplId = res.return_data
      })
    },
    // 消息订阅
    async handleSubscribeMessage() {
      if (this.tmplId === '') {
        return
      }
      await this.requestSubscribeMsg([this.tmplId]).then(res => {
        if (res[this.tmplId] === 'accept') {
          uni.showToast({
            title: '订阅成功',
            icon: 'none',
            mask: true
          })
          this.handleAddSubscribeRecord()
        }
      })
    },
    // 订阅授权回写,避免重复弹窗授权
    handleAddSubscribeRecord() {
      let params = {
        aid: this.aid,
        periodId: this.CurrentPeriod.Id
      }
      apiAddSubscribeRecord(params).then(res => {
        console.log('已订阅')
      })
    },
    /* #endif */
    // 获取活动当前的中奖
    getActivityAwardRecords(periodId) {
      let params = {
        aid: this.aid,
        periodId
      }
      apiGetActivityAwardRecords(params).then(res => {
        this.barrageList = res.return_data.map(item => {
          return {
            id: item.ID,
            avatar: item.CustomerHeadPath,
            username: item.CustomerNickName,
            prizename: item.PrizeName
          }
        })
        /* #ifdef H5 */
        this.$refs.danmaku && this.$refs.danmaku.show()
        this.$refs.danmaku && this.$refs.danmaku.play()
        /* #endif */
      })
    },
    // 获取活动当前的参与统计， 总统计和个人统计
    getPeriodAwardStatistics(periodId) {
      this.CustomerAwardRecord = null
      this.awardStatistics = []
      let params = {
        aid: this.aid,
        periodId
      }
      apiGetPeriodAwardStatistics(params).then(res => {
        this.CustomerAwardRecord = res.return_data.CustomerAwardRecord
        this.awardStatistics = res.return_data.awardStatistics
      })
    },
    // 更改期数
    handleChangePeriod(item) {
      if (item.Id === this.activeId) {
        return
      }
      let currentPeriodTime = this.CurrentPeriod.StartTime
      if (dayjs(currentPeriodTime).isBefore(item.StartTime)) {
        uni.showToast({
          title: '活动未开始~',
          icon: 'none',
          mask: true
        })
      } else {
        /* #ifdef H5 */
        this.$refs.danmaku && this.$refs.danmaku.stop()
        /* #endif */
        this.activeId = item.Id
        this.getAcivityParticipationCount(item.Id)
        this.getActivityAwardRecords(item.Id)
        this.getPeriodAwardStatistics(item.Id)
      }
    },
    // 积分兑换
    async handleExchange() {
      let isChange = dayjs(this.StartTime).isBefore(dayjs())
      if (!isChange) return

      /* #ifdef MP-WEIXIN */
      if (!this.isMpSubscribed && this.seconds > 0) {
        await this.handleSubscribeMessage()
      }
      /* #endif */
      this.isShowPointsPopup = true
    },
    // 扫码
    async handleScanCode() {
      let isChange = dayjs(this.StartTime).isBefore(dayjs())
      if (!isChange) return
      /* #ifdef H5 */
      this.$wechat.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ['qrCode'], // 可以指定扫二维码还是一维码，默认二者都有
        success: res => {
          var result = res.resultStr // 当needResult 为 1 时，扫码返回的结果
          location.href = result
        },
        fail: () => {}
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (!this.isMpSubscribed && this.seconds > 0) {
        await this.handleSubscribeMessage()
      }
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode'],
        success: res => {
          let { result } = res
          result = result.trim()
          uni.navigateTo({
            url: `/packages/src/scan-templates/transfer?q=${encodeURIComponent(result)}`
          })
        }
      })
      /* #endif */
    },
    // 参与机会首次获奖提示
    getFirstAwardTipsByAwardId() {
      if (!Number(this.awardId)) {
        return
      }
      let params = {
        aid: this.aid,
        awardId: Number(this.awardId)
      }
      apiGetFirstAwardTipsByAwardId(params).then(res => {
        if (res.return_data > 0) {
          uni.showModal({
            title: '提示',
            content: res.return_msg,
            showCancel: false,
            success: ({ confirm, cancel }) => {}
          })
        }
      })
    },
    // 活动期数滚动
    handlePeriodScroll(e) {
      let width = 500
      let scrollWidth = e.detail.scrollWidth
      let scrollLeft = e.detail.scrollLeft
      if (scrollWidth - scrollLeft >= width) {
        this.isShowRightArrow = true
      } else {
        this.isShowRightArrow = false
      }
    },
    // 获取用户积分余额
    getPointAmount() {
      apiGetPointAmount({ aid: this.aid }).then(res => {
        this.myPoints = res.return_data
      })
    },
    // 兑换抽奖机会
    handleChange() {
      let params = {
        latlng: '',
        qqLatLng: ''
      }
      uni.showLoading({
        title: '加载中',
        mask: true
      })
      apiWinActivityChanceByPoint(this.aid, params)
        .then(res => {
          this.lotteryCount = 1
          this.isShowPopupBtn = false
          this.popupTitle = '兑换成功'
          this.popupInfo = `获得本期${this.drawTitle}`
          this.isShowPopup = true
          uni.hideLoading()
          this.getPointAmount()
          this.getAcivityParticipationCount(this.CurrentPeriod.Id)
          setTimeout(() => {
            this.isShowPopup = false
          }, 3000)
        })
        .catch(err => {
          uni.showToast({
            title: err.return_msg,
            icon: 'none',
            mask: true,
            duration: 3000
          })
        })
    },
    // 开奖提醒
    handleLotteryRemind() {
      /* #ifdef H5 */
      this.$refs.follow.handleFollow()
      /* #endif */
      /* #ifdef MP-WEIXIN */
      this.handleSubscribeMessage()
      /* #endif */
    },
    // 跳转活动说明
    async handleJumpToDesc() {
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/0/explain?aid=${this.aid}&memberlogin=${this.m}&skin=0`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (!this.isMpSubscribed && this.seconds > 0) {
        await this.handleSubscribeMessage()
      }
      uni.navigateTo({
        url: `/packages/src/pages/lotto/0/explain?aid=${this.aid}&memberlogin=${this.m}&skin=0`
      })
      /* #endif */
    },
    // 我的奖品跳转
    async handleJumpToLink(id) {
      /* #ifdef H5 */
      let u = 't.miduonet.com'
      if (location.host.includes('weixin12315.com')) {
        u = 'weixin12315.com'
      }
      location.href = id ? `https://n.${u}/Member/zedit.aspx?m=${this.m}&source=yxPrize&eid=${id}` : this.malllink
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (!this.isMpSubscribed && this.seconds > 0) {
        await this.handleSubscribeMessage()
      }
      uni.navigateTo({ url: id ? `/personal/prize/prize-detail?id=${id}&type=0` : '/personal/prize/list?tab=1' })
      /* #endif */
    },
    // 修改倒计时提示语
    titleMsgFn() {
      this.titleMsg = '开始'
    },
    /* #ifdef H5 */
    // 获取微信配置信息
    apiGetwxdata(firstUrl) {
      let url = firstUrl || location.href
      console.log('获取微信配置url', url)
      let params = {
        aid: this.aid,
        url
      }
      apiGetwxdata(params).then(res => {
        this.wxConfig = res.return_data
        this.$wechat.config({
          debug: false, // 开启调试模式
          appId: this.wxConfig.appid, // 必填，公众号的唯一标识
          timestamp: this.wxConfig.timestamp, // 必填，生成签名的时间戳
          nonceStr: this.wxConfig.noncestr, // 必填，生成签名的随机串
          signature: this.wxConfig.signature, // 必填，签名
          jsApiList: ['scanQRCode', 'updateAppMessageShareData', 'getLocation']
        })

        this.$wechat.ready(() => {
          // 分享
          this.$wechat.updateAppMessageShareData({
            title: this.wxConfig.sharetitle, // 分享标题
            desc: this.wxConfig.sharetext, // 分享描述
            link: this.wxConfig.sharelink, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: this.wxConfig.shareimg, // 分享图标
            success: () => {
              // 设置成功
              this.shareFlagCount = 10
            },
            fail: () => {
              if (process.env.NODE_ENV === 'development') {
                console.log('开发环境')
              } else {
                if (this.shareFlagCount > 0) {
                  let firstUrl = uni.getStorageSync('firstUrl')
                  this.apiGetwxdata(firstUrl)
                }
                this.shareFlagCount--
              }
            }
          })
        })
      })
    },
    /* #endif */
    /* #ifdef MP-WEIXIN */
    initShare() {
      let params = {
        aid: this.aid,
        url: 'packages/src/pages/lotto/0/index'
      }
      apiGetwxdata(params).then(res => {
        this.wxConfig = res.return_data
      })
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/skin-0.scss';
</style>
