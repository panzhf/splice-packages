<template>
  <view class="container">
    <image :src="ThemeImageUrl" mode="widthFix" />
    <!-- 酒瓶收进主页瓶子 -->
    <image v-if="isShowBottle" class="bottle" :src="PACKAGE_STATIC_URL + 'lottery/bnht/bottle3.png'" mode="widthFix" />
    <image
      class="my-prize-icon"
      :src="PACKAGE_STATIC_URL + 'lottery/bnht/my-prize-icon.png'"
      mode="widthFix"
      @click="handleJumpToLink()"
    />
    <image
      class="desc-icon"
      :src="PACKAGE_STATIC_URL + 'lottery/bnht/desc-icon.png'"
      mode="widthFix"
      @click="handleJumpToDesc"
    />
    <image
      v-if="HasRightToSalerCode"
      class="send-icon"
      :src="PACKAGE_STATIC_URL + 'lottery/bnht/send-icon.png'"
      mode="widthFix"
      @click="handleJumpToSend"
    />

    <!-- 倒计时 -->
    <view
      class="countdown"
      :style="{
        backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/countdown-bg.png)`
      }"
    >
      本期{{ titleMsg }}倒计时：
      <text v-if="seconds <= 0">活动已结束</text>
      <u-count-down
        v-else
        :timestamp="seconds"
        autoplay
        separator="zh"
        show-border
        border-color="#F2383D"
        color="#FFF9F3"
        bg-color="#FF6B6F"
        separator-color="#F2383D"
        font-size="24"
      />
      <image
        v-if="GzStatus !== 1"
        class="lottery-remind"
        :src="PACKAGE_STATIC_URL + 'lottery/bnht/lottery-remind-icon.png'"
        mode="widthFix"
        @click="handleLotteryRemind"
      />
    </view>

    <!-- 活动期数 -->
    <view
      ref="parent"
      class="lotto-periods"
      :style="{
        backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/periods-bg.jpg)`
      }"
    >
      <scroll-view class="period-wrap" scroll-x="true" :scroll-left="scrollLeftNum">
        <view
          v-for="(item, index) in PrizePoolPeriod"
          :key="index"
          class="lotto-period"
          :class="item.Id == activeId ? 'active' : ''"
          :style="{
            backgroundImage:
              item.Id == activeId
                ? `url(${PACKAGE_STATIC_URL}lottery/bnht/period-active-bg.png)`
                : `url(${PACKAGE_STATIC_URL}lottery/bnht/period-bg.png)`
          }"
          @click="handleChangePeriod(item)"
        >
          <view class="period-num">第{{ index + 1 }}期</view>
          <view class="period-time">{{ item.StartTime | formatTime }}-{{ item.EndTime | formatTime }}</view>
        </view>
      </scroll-view>
    </view>

    <!-- 抽奖次数 -->
    <view class="lotto-count">
      <view>
        本期{{ drawTitle }}：
        <u-count-to
          v-if="isEnableCountTo"
          :start-val="0"
          :end-val="periodRecordCount"
          :autoplay="true"
          duration="3000"
          color="#ffeaaa"
          font-size="30"
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
          color="#ffeaaa"
          font-size="30"
          bold
        />
        <text v-else class="num">{{ customerRecordCount }}</text>
      </view>
    </view>

    <!-- 参与抽奖 -->
    <view v-if="seconds" class="participate-lotto">
      <image class="bd-top" :src="PACKAGE_STATIC_URL + 'lottery/bnht/bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/bnht/now-lotto-title.png'" mode="widthFix" />
      <view
        class="content"
        :style="{
          backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/bd-mid.png)`
        }"
      >
        <image
          v-if="IsEnabledPointExchange && !IsEnabledCodeAward"
          :src="PACKAGE_STATIC_URL + 'lottery/bnht/jifen1.gif'"
          mode="widthFix"
          @click="handleExchange"
        />
        <image
          v-if="!IsEnabledPointExchange && IsEnabledCodeAward"
          :src="PACKAGE_STATIC_URL + 'lottery/bnht/chanpin1.gif'"
          mode="widthFix"
          @click="handleScanCode"
        />
        <image
          v-if="IsEnabledPointExchange && IsEnabledCodeAward"
          class="img"
          :src="PACKAGE_STATIC_URL + 'lottery/bnht/jifen2.gif'"
          mode="widthFix"
          @click="handleExchange"
        />
        <image
          v-if="IsEnabledPointExchange && IsEnabledCodeAward"
          class="img"
          :src="PACKAGE_STATIC_URL + 'lottery/bnht/chanpin2.gif'"
          mode="widthFix"
          @click="handleScanCode"
        />
      </view>
      <image class="bd-bottom" :src="PACKAGE_STATIC_URL + 'lottery/bnht/bd-bottom.png'" mode="widthFix" />
    </view>

    <!-- 抽奖结果 -->
    <view v-else class="result-wrap">
      <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/bnht/res-title.png'" mode="widthFix" />
      <view
        v-if="activePeriod && !activePeriod.IsShowAwardResult"
        class="content res-text"
        :style="{
          backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/bd-mid.png)`
        }"
      >
        待开奖，请稍后再来~
      </view>
      <view
        v-else
        class="content"
        :style="{
          backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/bd-mid.png)`
        }"
      >
        <view
          class="current-prize"
          :style="{
            backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/res-bg.png)`
          }"
        >
          <text v-if="customerRecordCount == 0">好可惜，您没有参与~</text>
          <view v-if="customerRecordCount > 0 && CustomerAwardRecord" class="flex flex-middle flex-center overflow-h">
            <text class="ellipsis">恭喜您获得了：{{ CustomerAwardRecord.AwardName }}</text>
            <text class="lookbtn shrink-0" @click="handleJumpToLink(CustomerAwardRecord.ID)">
              去{{ CustomerAwardRecord.PrizeType === 0 ? '领取' : '查看' }}
            </text>
          </view>
          <text v-if="customerRecordCount > 0 && !CustomerAwardRecord">很遗憾，您没有中奖~</text>
        </view>
        <view class="prize-list">
          <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/prize-top-bg.png'" mode="widthFix" />
          <view
            class="prize-content"
            :style="{
              backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/prize-mid-bg.png)`
            }"
          >
            <view v-for="(item, index) in awardStatistics" :key="index" class="prize-item">
              <text class="prize-name">{{ item.Name }}</text>
              <text class="prize-count">发放{{ item.AwardCount }}份</text>
            </view>
          </view>
          <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/prize-bottom-bg.png'" mode="widthFix" />
        </view>
        <view class="tips">注意：若您获取的是实物奖品，需点击去领取填写收货地址，才能正常发货</view>
      </view>
      <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/bd-bottom.png'" mode="widthFix" />
    </view>

    <!-- 奖项展示 -->
    <view v-if="seconds && showPrizeList.length > 0" class="prize-list">
      <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/win-bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/bnht/prize-list-title.png'" mode="widthFix" />
      <view
        class="content"
        :style="{
          backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/bd-mid.png)`
        }"
      >
        <view v-for="item in showPrizeList" :key="item.Id" class="prize-item">
          <u-image
            width="90rpx"
            height="90rpx"
            border-radius="5"
            :src="item.PrizeImageUrl || PACKAGE_STATIC_URL + 'lottery/bnht/default-prize.png'"
          />
          <view class="prize-name">{{ item.Name }}</view>
        </view>
      </view>
      <image class="bd-bottom" :src="PACKAGE_STATIC_URL + 'lottery/bnht/bd-bottom.png'" mode="widthFix" />
    </view>

    <!-- 中奖记录 -->
    <view v-else class="win-record">
      <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/win-bd-top.png'" mode="widthFix" />
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/bnht/win-record-bg.png'" mode="widthFix" />
      <view class="content">
        <!-- #ifdef H5 -->
        <vue-danmaku
          ref="danmaku"
          :danmus="barrageList"
          use-slot
          :top="10"
          :right="100"
          :speeds="50"
          :speed="20"
          :debounce="500"
          :channels="1"
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
        <view class="qw-qrcode-wrap">
          <image class="qw-qrcode" :src="PACKAGE_STATIC_URL + 'lottery/bnht/qw-qrcode.jpg'" mode="widthFix" />
          <view class="qw-qrcode-text">
            <text>扫码添加客服</text>
            <text>获取更多优惠</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 企微二维码 -->
    <view v-if="seconds && showPrizeList.length > 0" class="qw-qrcode-wrap bottom-qw-qrcode">
      <image class="qw-qrcode" :src="PACKAGE_STATIC_URL + 'lottery/bnht/qw-qrcode.jpg'" mode="widthFix" />
      <view class="qw-qrcode-text">
        <text>扫码添加客服</text>
        <text>获取更多优惠</text>
      </view>
    </view>
    <image class="home-bottom" :src="PACKAGE_STATIC_URL + 'lottery/bnht/home-bottom-bg.png'" mode="widthFix" />

    <!-- 下滑指引 -->
    <image
      v-show="isShowBottomArrow"
      class="bottom-arrow"
      :src="PACKAGE_STATIC_URL + 'lottery/bnht/bottom-arrow-icon.png'"
      mode="widthFix"
    />

    <!-- 积分兑换弹窗 -->
    <u-popup
      v-model="isShowPointsPopup"
      class="points-popup"
      mode="bottom"
      height="737rpx"
      z-index="1000"
      border-radius="20"
    >
      <image
        class="close-icon"
        :src="PACKAGE_STATIC_URL + 'lottery/bnht/close-icon.png'"
        mode="widthFix"
        @click="isShowPointsPopup = false"
      />
      <image class="points-top" :src="PACKAGE_STATIC_URL + 'lottery/bnht/points-top-bg2.png'" mode="widthFix" />
      <view class="points-wrap">
        <view class="my-points">我的积分：{{ myPoints }}</view>
        <view
          class="change-btn"
          :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/btn-bg.png)` }"
          @click="handleChange"
        >
          马上兑换
        </view>
        <view class="desc">每{{ pointAmount }}积分可兑换一次{{ drawTitle }}</view>
        <view class="tips">
          * {{ drawTitle }}越多，中奖几率越大！查看详细
          <text class="detail" @click="handleJumpToDesc">活动说明</text>
          。
        </view>
      </view>
      <image class="points-bottom" :src="PACKAGE_STATIC_URL + 'lottery/bnht/explain-bottom.png'" mode="widthFix" />
    </u-popup>

    <!-- 获得机会弹窗 -->
    <bnht-popup
      :is-show="isShowPopup"
      :popup-title="popupTitle"
      :info="popupInfo"
      :count="lotteryCount"
      :is-show-btn="isShowPopupBtn"
      :draw-title="drawTitle"
      @submit="handleClosePopup"
    />

    <!-- 关注公众号 -->
    <!-- #ifdef H5 -->
    <md-follow-gzh ref="follow" />
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
import { apiGetwxdata } from 'packages/api/common'
/* #endif */
import BnhtPopup from '../components/BnhtPopup'
import dayjs from 'dayjs'
import {
  apiGetActivity,
  apiGetAcivityParticipationCount,
  apiGetActivityAwardRecords,
  apiGetPeriodAwardStatistics,
  apiGetShowPoolPrize,
  apiGetPointAmount,
  apiWinActivityChanceByPoint,
  apiGetActChanceIsNew
} from 'packages/api/prizePool'

import { packageStaticMixin } from 'packages/mixins/static-url'
import { setTitleMixin } from 'packages/mixins/navigation'

export default {
  components: {
    /* #ifdef H5 */
    vueDanmaku,
    /* #endif */
    BnhtPopup
  },
  filters: {
    formatTime(v) {
      return dayjs(v).format('MM.DD HH:mm')
    }
  },
  mixins: [packageStaticMixin, setTitleMixin],
  data() {
    return {
      aid: '', // 活动id
      m: '', // 品牌商
      skin: 0, // 模板
      pid: '', // 中奖通知进来的分期id
      scansuccess: '', // 时效派发：1成功
      title: '', // 标题
      activeId: '', // 当前选中期数Id
      IsEnabledPointExchange: false, // 是否开启积分兑换获取机会
      IsEnabledCodeAward: false, // 是否开启扫码活动获取机会
      HasRightToSalerCode: false, // 是否显示派发
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
      periodId: 0, // 当前活动的id
      shareFlagCount: 10, // 分享请求次数标识
      scrollLeftNum: 0, // 期数初始化滚动大小
      GzStatus: 1, // 是否显示开奖提醒
      isShowPointsPopup: false, // 是否显示积分兑换弹窗
      myPoints: 0, // 我的积分
      pointAmount: 0, // 每次兑换消耗积分数
      lotteryCount: 0, // 获得抽奖机会数
      isShowPopup: false, // 是否显示弹窗
      isShowPopupBtn: false, // 是否显示弹窗按钮
      popupTitle: '', // 弹窗标题
      popupInfo: '', // 弹窗内容
      firstPrizeName: '', // 顺序为1的奖项名称
      isShowBottomArrow: true, // 是否显示下滑指引
      isShowBottle: false, // 是否显示酒瓶收进主页瓶子
      isEnableCountTo: false // 抽奖机会是否要数字滚动
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
  mounted() {
    /* #ifdef H5 */
    this.apiGetwxdata()
    /* #endif */
  },
  onLoad(option) {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    this.pid = this.$route.query.pid || ''
    this.scansuccess = this.$route.query.scansuccess || ''
    this.awardId = this.$route.query.awardId || ''
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    this.pid = option.pid || ''
    this.scansuccess = option.scansuccess || ''
    this.awardId = option.awardId || ''
    /* #endif */

    this.getPointAmount()
    this.GzStatus = uni.getStorageSync('GzStatus')
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif

    this.apiGetActivity()
    this.isShowBottle = false
  },
  onHide() {
    this.barrageList = []
    // #ifdef H5
    this.$refs.danmaku && this.$refs.danmaku.stop()
    // #endif
  },
  // 触底事件
  onReachBottom() {
    this.isShowBottomArrow = false
  },
  // 页面滚动事件
  onPageScroll(e) {
    if (!this.isShowBottomArrow && e.scrollTop <= 100) {
      this.isShowBottomArrow = true
    }
  },
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
          this.popupTitle = '参与成功'
          this.popupInfo = `最高赢取${this.firstPrizeName}`
          this.isShowPopupBtn = true
          this.isShowPopup = true
        }
      })
    },
    // 参与弹窗点击去参与
    handleClosePopup() {
      this.isShowPopup = false
      this.isShowBottle = true
      setTimeout(() => {
        this.isEnableCountTo = true
      }, 2000)
      setTimeout(() => {
        this.isEnableCountTo = false
      }, 5000)
    },
    // 获取活动详细信息
    apiGetActivity() {
      apiGetActivity({ aid: this.aid })
        .then(async res => {
          this.malllink = res.return_malllink
          let data = res.return_data
          this.setTitle(data.Title)
          this.title = data.Title
          this.PrizePoolPeriod = data.PrizePoolPeriod
          this.StartTime = data.StartTime
          this.CurrentPeriod = data.CurrentPeriod
          this.IsEnabledPointExchange = data.IsEnabledPointExchange
          this.IsEnabledCodeAward = data.IsEnabledCodeAward
          this.activeId = this.pid != '' && this.pid != 'undefined' ? Number(this.pid) : data.CurrentPeriod.Id
          this.drawTitle = data.IsCustomLotteryDrawTitle ? data.LotteryDrawTitle : '抽奖机会'
          this.HasRightToSalerCode = data.HasRightToSalerCode
          this.ThemeImageUrl = data.ThemeImageUrl
          this.pointAmount = data.PointAmount
          uni.setStorageSync('Rule', data.Rule)
          uni.setStorageSync('drawTitle', this.drawTitle)
          uni.setStorageSync('SalerQrCodeExpireMinutes', data.SalerQrCodeExpireMinutes)

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
        let value = 200 * (num - 1)
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
            if (res.return_data.length > 0) {
              this.firstPrizeName = res.return_data[0].Name
            }
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
        this.customerRecordCount = res.return_data.customerRecordCount
        this.periodRecordCount = res.return_data.periodRecordCount
      })
    },
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
        // #ifdef H5
        this.$refs.danmaku && this.$refs.danmaku.show()
        this.$refs.danmaku && this.$refs.danmaku.play()
        // #endif
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
        // #ifdef H5
        this.$refs.danmaku && this.$refs.danmaku.stop()
        // #endif
        this.activeId = item.Id
        this.getAcivityParticipationCount(item.Id)
        this.getActivityAwardRecords(item.Id)
        this.getPeriodAwardStatistics(item.Id)
      }
    },
    // 积分兑换
    handleExchange() {
      let isChange = dayjs(this.StartTime).isBefore(dayjs())
      if (!isChange) return

      this.isShowPointsPopup = true
    },
    // 扫码
    handleScanCode() {
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
          this.popupInfo = `最高赢取${this.firstPrizeName}`
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
    },
    // 跳转活动说明
    handleJumpToDesc() {
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/1/explain?aid=${this.aid}&memberlogin=${this.m}&skin=1`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/1/explain?aid=${this.aid}&memberlogin=${this.m}&skin=1`
      })
      /* #endif */
    },
    // 跳转派发
    handleJumpToSend() {
      let isChange = dayjs(this.StartTime).isBefore(dayjs())
      if (!isChange) return
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/1/payout?aid=${this.aid}&memberlogin=${this.m}&skin=1`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/1/payout?aid=${this.aid}&memberlogin=${this.m}&skin=1`
      })
      /* #endif */
    },
    // 我的奖品跳转
    handleJumpToLink(id) {
      /* #ifdef H5 */
      let u = 't.miduonet.com'
      if (location.host.includes('weixin12315.com')) {
        u = 'weixin12315.com'
      }
      location.href = id ? `https://n.${u}/Member/zedit.aspx?m=${this.m}&source=yxPrize&eid=${id}` : this.malllink
      /* #endif */
      /* #ifdef MP-WEIXIN */
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
          jsApiList: ['scanQRCode', 'updateAppMessageShareData']
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
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  padding-bottom: 36rpx;
  background-color: #ff4348;

  .my-prize-icon,
  .desc-icon,
  .send-icon {
    position: absolute;
    z-index: 10;
    width: 127rpx;
  }

  .my-prize-icon {
    left: 0;
    top: 17rpx;
  }
  .desc-icon {
    right: 0;
    top: 17rpx;
  }
  .send-icon {
    right: 0;
    top: 137rpx;
  }

  .countdown {
    position: absolute;
    top: 720rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 671rpx;
    height: 86rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-repeat: no-repeat;
    background-size: 100%;
    color: #f2383d;
    font-weight: bold;

    .lottery-remind {
      position: absolute;
      top: -28rpx;
      right: -42rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 88rpx;
    }
  }

  .title-img {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    width: 257rpx;
  }

  .lotto-count {
    display: flex;
    justify-content: space-between;
    margin-top: 50rpx;
    margin-bottom: 70rpx;
    padding: 0 40rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #fff9f3;

    .num {
      color: #ffeaaa;
    }
  }

  .lotto-periods {
    height: 150rpx;
    margin-top: 38rpx;
    padding: 26rpx 0;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    white-space: nowrap;
    box-sizing: border-box;

    &::-webkit-scrollbar {
      display: none;
    }

    .period-wrap {
      white-space: nowrap;
    }

    .lotto-period {
      display: inline-block;
      width: 343rpx;
      height: 100rpx;
      padding-top: 16rpx;
      text-align: center;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      color: #ffe497;
      font-weight: bold;
      box-sizing: border-box;

      &.active {
        color: #fa3030;
      }

      .period-num {
        font-size: 32rpx;
      }

      .period-time {
        font-size: 24rpx;
        font-weight: normal;
        letter-spacing: -1rpx;
      }
    }
  }

  .participate-lotto {
    position: relative;
    margin: 52rpx auto 0;
    width: 670rpx;

    .content {
      display: flex;
      padding: 30rpx 21rpx 0;
      background-size: 100% 100%;
      background-repeat: repeat-y;

      .img {
        flex: 1;
      }
      & > .img:first-child {
        margin-right: 8rpx;
      }
    }
  }

  .result-wrap {
    position: relative;
    margin: 84rpx 0;
    padding: 0 40rpx;
    text-align: center;
    color: #fedea3;

    .content {
      padding: 30rpx 21rpx 0;
      background-size: 100% 100%;
      background-repeat: repeat-y;

      &.res-text {
        padding: 50rpx 0;
        font-size: 36rpx;
        font-weight: bold;
      }

      .current-prize {
        margin-bottom: 20rpx;
        padding: 16rpx;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        color: #ffffff;
        font-size: 28rpx;
        font-weight: bold;

        .lookbtn {
          margin-left: 26rpx;
          color: #ffe2a5;
        }
      }

      .prize-list {
        margin: 0 0 20rpx;
        width: 628rpx;

        .prize-content {
          background-size: 100%;
          background-repeat: repeat-y;

          .prize-item {
            display: flex;
            justify-content: space-between;
          }
          .prize-name {
            flex: 3;
          }
          .prize-count {
            flex: 2;
            text-align: left;
          }
        }
      }
    }
  }

  .prize-list {
    position: relative;
    margin: 84rpx auto 0;
    padding-bottom: 32rpx;
    width: 670rpx;

    .content {
      padding: 30rpx 21rpx 0;
      background-size: 100% 100%;
      background-repeat: repeat-y;

      .prize-item {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 134rpx;
        padding-left: 40rpx;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2rpx;
          background-image: linear-gradient(
            to left,
            rgba($color: #fedea3, $alpha: 0.1) 0%,
            rgba($color: #fedea3, $alpha: 0.5) 10%,
            rgba($color: #fedea3, $alpha: 0.5) 90%,
            rgba($color: #fedea3, $alpha: 0.1) 100%
          );
        }

        &:last-child::before {
          display: none;
        }

        .prize-name {
          flex: 1;
          margin-left: 30rpx;
          font-size: 30rpx;
          color: #fedea3;
        }
      }
    }
  }

  .win-record {
    position: relative;
    height: 542rpx;
    margin-top: 84rpx;
    margin-bottom: -36rpx;

    .content {
      padding-top: 30rpx;
      height: 300rpx;

      .vue-danmaku {
        height: 60rpx;
      }

      .custom-item {
        display: flex;
        align-items: center;
        width: fit-content;
        padding: 10rpx 20rpx;
        border-radius: 40rpx;
        font-size: 22rpx;
        font-weight: bold;
        color: #fff;
        background-color: rgba($color: #610000, $alpha: 0.3);

        .avatar {
          display: inline-block;
          margin-right: 10rpx;
        }
        .prizename {
          color: #fedea3;
        }
      }
    }
  }

  .home-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .qw-qrcode-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    width: 394rpx;
    height: 190rpx;
    padding: 16rpx;
    margin-top: 68rpx;
    border: 1px solid #fedca1;

    .qw-qrcode {
      width: 156rpx;
      height: 156rpx;
      margin-right: 36rpx;
    }

    .qw-qrcode-text {
      display: flex;
      flex-direction: column;
      font-size: 24rpx;
      color: #ffe7ba;
    }

    &.bottom-qw-qrcode {
      margin-top: 36rpx;
      margin-bottom: 120rpx;
    }
  }

  .bottle {
    position: absolute;
    top: 480rpx;
    right: calc(50% - 50rpx);
    z-index: 100;
    width: 100rpx;
    animation: bottleAni 2s ease-in-out forwards;
  }
  @keyframes bottleAni {
    0% {
      width: 100rpx;
      opacity: 1;
      top: 480rpx;
      right: calc(50% - 50rpx);
    }
    10% {
      width: 100rpx;
      opacity: 1;
      top: 480rpx;
      right: calc(50% - 50rpx);
      transform: rotate(10deg);
    }
    20% {
      width: 100rpx;
      opacity: 1;
      top: 480rpx;
      right: calc(50% - 50rpx);
      transform: rotate(-10deg);
    }
    30% {
      width: 100rpx;
      opacity: 1;
      top: 480rpx;
      right: calc(50% - 50rpx);
      transform: rotate(10deg);
    }
    40% {
      width: 100rpx;
      opacity: 1;
      top: 480rpx;
      right: calc(50% - 50rpx);
      transform: rotate(-10deg);
    }
    50% {
      width: 100rpx;
      opacity: 1;
      top: 480rpx;
      right: calc(50% - 50rpx);
      transform: rotate(0);
    }
    100% {
      opacity: 0;
      width: 0;
      top: 1100rpx;
      right: 20rpx;
    }
  }

  .bottom-arrow {
    position: fixed;
    bottom: 40rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    width: 60rpx;
    height: 100%;
    animation: opacityAni 1s linear infinite alternate;
  }
  @keyframes opacityAni {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .points-popup {
    ::v-deep .u-drawer-content {
      color: #ffe497;
      background-image: linear-gradient(#ff4348, #ff3131);
      border-top: 2rpx solid #ffe497;
      overflow: visible !important;

      .uni-scroll-view {
        overflow: visible !important;
      }
    }

    .close-icon {
      position: absolute;
      top: -70rpx;
      right: 10rpx;
      z-index: 1000;
      width: 60rpx;
      height: 60rpx;
    }

    .points-top {
      position: absolute;
      top: 0;
      left: 0;
    }

    .points-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      padding-top: 140rpx;

      .my-points {
        font-size: 40rpx;
        font-weight: bold;
      }

      .change-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 291rpx;
        height: 74rpx;
        margin: 80rpx 0 30rpx;
        font-size: 30rpx;
        font-weight: bold;
        background-size: 100% 100%;
        background-repeat: no-repeat;
      }

      .desc {
        font-size: 24rpx;
      }

      .tips {
        position: relative;
        z-index: 1001;
        margin-top: 200rpx;
        font-size: 22rpx;
        color: #fff;

        .detail {
          margin-left: 8rpx;
          padding: 8rpx 0;
          text-decoration: underline;
        }
      }
    }

    .content {
      max-height: 600rpx;
      padding: 0 24rpx 2rpx;
      font-size: 26rpx;
      color: #ffe497;
      background-size: 100%;
      background-repeat: repeat-y;
      overflow-y: auto;
    }

    .points-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
    }
  }
}
</style>
