<template>
  <view class="container">
    <image :src="ThemeImageUrl" mode="widthFix" />
    <image
      v-if="HasRightToSalerCode"
      class="send-icon"
      :src="PACKAGE_STATIC_URL + 'lottery/sdjc/send-icon.png'"
      mode="widthFix"
      @click="handleJumpToSend"
    />
    <image
      class="my-prize-icon"
      :src="PACKAGE_STATIC_URL + 'lottery/sdjc/my-prize-icon.png'"
      mode="widthFix"
      @click="handleJumpToLink()"
    />
    <image
      class="desc-icon"
      :src="PACKAGE_STATIC_URL + 'lottery/sdjc/desc-icon.png'"
      mode="widthFix"
      @click="handleJumpToDesc"
    />
    <!-- 倒计时 -->
    <view
      class="countdown"
      style="transform: translateY(-66rpx)"
      :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/sdjc/countdown-bg.png)` }"
    >
      <view class="time-title">
        本期{{ titleMsg }}倒计时：
        <text v-if="seconds <= 0">活动已结束</text>
        <u-count-down
          v-else
          :timestamp="seconds"
          autoplay
          separator="zh"
          color="#ff4400"
          bg-color=""
          separator-color="#ff4400"
          font-size="24"
          separator-size="24"
        />
      </view>
      <!-- 活动期数 -->
      <scroll-view class="lotto-periods" scroll-x="true" :scroll-left="scrollLeftNum">
        <view
          v-for="(item, index) in PrizePoolPeriod"
          :key="index"
          class="lotto-period"
          :class="item.Id == activeId ? 'active' : ''"
          :style="{
            backgroundImage:
              item.Id == activeId
                ? `url(${PACKAGE_STATIC_URL}lottery/sdjc/period-active-bg.png)`
                : `url(${PACKAGE_STATIC_URL}lottery/sdjc/period-bg.png)`
          }"
          @click="handleChangePeriod(item)"
        >
          <view class="period-num">第{{ index + 1 }}期</view>
          <view class="period-time">{{ item.StartTime | formatTime }}-{{ item.EndTime | formatTime }}</view>
        </view>
      </scroll-view>
    </view>

    <!-- 抽奖次数 -->
    <view
      class="lotto-count"
      style="transform: translateY(-46rpx)"
      :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/sdjc/lotto-count.png)` }"
    >
      <view>
        本期{{ drawTitle }}：
        <text class="num">{{ periodRecordCount }}</text>
      </view>
      <view>
        我的{{ drawTitle }}：
        <text class="num">{{ customerRecordCount }}</text>
      </view>
    </view>

    <!-- 参与抽奖 -->
    <view v-show="seconds" class="participate-lotto">
      <view class="title-desc">马上参与抽大奖</view>
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/res-title.png'" mode="widthFix" />
      <view class="content">
        <image
          v-if="IsEnabledPointExchange && !IsEnabledCodeAward"
          :src="PACKAGE_STATIC_URL + 'lottery/sdjc/jifen1.png'"
          mode="widthFix"
          @click="handleExchange"
        />
        <image
          v-if="!IsEnabledPointExchange && IsEnabledCodeAward"
          :src="PACKAGE_STATIC_URL + 'lottery/sdjc/chanpin1.png'"
          mode="widthFix"
          @click="handleScanCode"
        />
        <image
          v-if="IsEnabledPointExchange && IsEnabledCodeAward"
          class="img"
          :src="PACKAGE_STATIC_URL + 'lottery/sdjc/jifen2.png'"
          mode="widthFix"
          @click="handleExchange"
        />
        <image
          v-if="IsEnabledPointExchange && IsEnabledCodeAward"
          class="img"
          :src="PACKAGE_STATIC_URL + 'lottery/sdjc/chanpin2.png'"
          mode="widthFix"
          @click="handleScanCode"
        />
      </view>
    </view>

    <!-- 抽奖结果 -->
    <view v-show="!seconds" class="result-wrap">
      <view class="title-desc">抽奖结果</view>
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/res-title.png'" mode="widthFix" />
      <view v-if="activePeriod && !activePeriod.IsShowAwardResult" class="content res-text">待开奖，请稍后再来~</view>
      <view v-else class="content">
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
        <view class="prize-list">
          <view class="prize-content">
            <view v-for="(item, index) in awardStatistics" :key="index" class="prize-item">
              <text class="prize-name">{{ item.Name }}</text>
              <text class="prize-count">发放{{ item.AwardCount }}份</text>
            </view>
          </view>
        </view>
        <view v-show="customerRecordCount > 0 && CustomerAwardRecord" class="tips">
          <text class="tips-text">
            温馨提示：若您获取的是实物奖品，需点击
            <text class="look">去领取</text>
            填写收货地址，才能正常发货
          </text>
        </view>
      </view>
    </view>

    <!-- 中奖记录 -->
    <view v-if="seconds && showPrizeList.length > 0" class="prize-list">
      <view class="title-desc">超多大奖等你拿</view>
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/res-title.png'" mode="widthFix" />
      <view class="content">
        <view v-for="item in showPrizeList" :key="item.Id" class="prize-item">
          <u-image
            width="90rpx"
            height="90rpx"
            border-radius="5"
            :src="item.PrizeImageUrl || PACKAGE_STATIC_URL + 'lottery/sdjc/default-prize.png'"
          />
          <view class="prize-name">{{ item.Name }}</view>
        </view>
      </view>
    </view>

    <!-- 中奖记录 -->
    <view v-else class="win-record">
      <view class="title-desc">看看是谁中大奖</view>
      <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/sdjc/res-title.png'" mode="widthFix" />
      <view class="content">
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
              <u-image class="avatar" width="48rpx" height="48rpx" :src="danmu.avatar" shape="circle" />
              {{ danmu.username }}获得了
              <text class="prizename">{{ danmu.prizename }}</text>
            </view>
          </template>
        </vue-danmaku>
        <!-- #endif -->
      </view>
    </view>

    <!-- #ifdef H5 -->
    <!-- 关注公众号 -->
    <md-follow-gzh />
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
import dayjs from 'dayjs'
import {
  apiGetActivity,
  apiGetAcivityParticipationCount,
  apiGetActivityAwardRecords,
  apiGetPeriodAwardStatistics,
  apiGetFirstAwardTipsByAwardId,
  apiGetShowPoolPrize
} from 'packages/api/prizePool'

import { packageStaticMixin } from 'packages/mixins/static-url'
import { setTitleMixin } from 'packages/mixins/navigation'

export default {
  components: {
    /* #ifdef H5 */
    vueDanmaku
    /* #endif */
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
      pid: '', // 中奖通知进来的分期id
      awardId: '', // 参与机会首次获奖
      scansuccess: '', // 时效派发：1成功
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
      shareFlagCount: 10, // 分享请求次数标识
      scrollLeftNum: 0 // 期数初始化滚动大小
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
  onLoad(option) {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    this.pid = this.$route.query.pid || ''
    this.scansuccess = this.$route.query.scansuccess || ''
    this.awardId = this.$route.query.awardId || ''
    this.apiGetwxdata()
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    this.pid = option.pid || ''
    this.scansuccess = option.scansuccess || ''
    this.awardId = option.awardId || ''
    /* #endif */
    this.getFirstAwardTipsByAwardId()

    let isClick = uni.getStorageSync('isSuccess')
    if (this.scansuccess == 1 && isClick) {
      uni.showModal({
        title: '提示',
        content: '恭喜你获得本期抽奖机会\n中奖通知请关注底部公众号',
        showCancel: false,
        success: ({ confirm, cancel }) => {
          uni.removeStorageSync('isSuccess')
        }
      })
    }
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif

    this.apiGetActivity()
  },
  onHide() {
    this.barrageList = []
    // #ifdef H5
    this.$refs.danmaku && this.$refs.danmaku.stop()
    // #endif
  },
  methods: {
    // 修改倒计时提示语
    titleMsgFn() {
      this.titleMsg = '开始'
    },
    // 获取活动详细信息
    apiGetActivity() {
      apiGetActivity({ aid: this.aid })
        .then(res => {
          this.malllink = res.return_malllink
          let data = res.return_data
          this.setTitle(data.Title)
          this.PrizePoolPeriod = data.PrizePoolPeriod
          this.CurrentPeriod = data.CurrentPeriod
          this.StartTime = data.StartTime
          this.IsEnabledPointExchange = data.IsEnabledPointExchange
          this.IsEnabledCodeAward = data.IsEnabledCodeAward
          this.activeId = this.pid != '' && this.pid != 'undefined' ? Number(this.pid) : data.CurrentPeriod.Id
          this.drawTitle = data.IsCustomLotteryDrawTitle ? data.LotteryDrawTitle : '抽奖机会'
          this.HasRightToSalerCode = data.HasRightToSalerCode
          this.ThemeImageUrl = data.ThemeImageUrl

          uni.setStorageSync('Rule', data.Rule)
          uni.setStorageSync('PointAmount', data.PointAmount)
          uni.setStorageSync('DrawTitle', this.drawTitle)
          uni.setStorageSync('SalerQrCodeExpireMinutes', data.SalerQrCodeExpireMinutes)

          let requestId = this.pid ? this.pid : this.CurrentPeriod.Id
          this.getAcivityParticipationCount(requestId)
          this.getActivityAwardRecords(requestId)
          this.getPeriodAwardStatistics(requestId)
          this.scrollLeftFn()
          this.seconds > 0 && this.getShowPoolPrize(requestId)
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
        let value = 210 * (num - 1)
        this.scrollLeftNum = value
      })
    },
    // 获取奖项展示列表
    getShowPoolPrize(periodId) {
      let params = {
        aid: this.aid,
        periodId
      }
      apiGetShowPoolPrize(params).then(res => {
        this.showPrizeList = res.return_data
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
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/2/points?aid=${this.aid}&memberlogin=${this.m}&skin=2`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/2/points?aid=${this.aid}&memberlogin=${this.m}&skin=2`
      })
      /* #endif */
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
    // 跳转活动说明
    handleJumpToDesc() {
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/2/explain?aid=${this.aid}&memberlogin=${this.m}&skin=2`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/2/explain?aid=${this.aid}&memberlogin=${this.m}&skin=2`
      })
      /* #endif */
    },
    // 跳转派发
    handleJumpToSend() {
      let isChange = dayjs(this.StartTime).isBefore(dayjs())
      if (!isChange) return
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/lotto/2/payout?aid=${this.aid}&memberlogin=${this.m}&skin=2`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/lotto/2/payout?aid=${this.aid}&memberlogin=${this.m}&skin=2`
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
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  background-color: #ffeecd;
  // background-color: #ff4348;

  .my-prize-icon,
  .desc-icon,
  .send-icon {
    position: absolute;
    z-index: 10;
    width: 105rpx;
  }

  .my-prize-icon {
    right: 30rpx;
    top: 344rpx;
  }
  .desc-icon {
    right: 30rpx;
    top: 208rpx;
  }
  .send-icon {
    left: 30rpx;
    top: 208rpx;
  }

  .countdown {
    position: relative;
    margin: 0 auto;
    width: 100%;
    height: 237rpx;
    padding: 30rpx 30rpx 0;
    display: flex;
    justify-content: center;
    background-repeat: no-repeat;
    background-size: 100%;
    color: #f2383d;
    font-weight: bold;
    overflow: hidden;
    .time-title {
      position: absolute;
      font-weight: 700;
      color: #ff4400;
      font-size: 24rpx;
    }
  }

  .title-img {
    position: absolute !important;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    width: 272rpx;
    height: 78rpx !important;
  }
  .title-desc {
    position: absolute;
    top: -7rpx;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    width: 272rpx;
    text-align: center;
    font-weight: 800;
    letter-spacing: -1px;
    color: #ac510a;
  }
  .lotto-count {
    display: flex;
    justify-content: space-between;
    font-size: 24rpx;
    font-weight: 500;
    color: #7c3600;
    padding: 0 112rpx;
    background: no-repeat center;
    background-size: 100%;
    .num {
      color: #7c3600;
    }
  }

  .lotto-periods {
    height: 150rpx;
    margin-top: 38rpx;
    padding: 26rpx 0;
    white-space: nowrap;
    box-sizing: border-box;

    &::-webkit-scrollbar {
      display: none;
    }

    .lotto-period {
      display: inline-block;
      width: 308rpx;
      height: 84rpx;
      padding: 8rpx 0;
      margin: 0 5rpx;
      text-align: center;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      color: #ac510a;
      font-weight: bold;
      box-sizing: border-box;

      &.active {
        color: #ffffff;
        .period-time {
          color: #ffd6ba;
        }
      }

      .period-num {
        font-size: 30rpx;
      }

      .period-time {
        font-size: 22rpx;
        font-weight: normal;
        letter-spacing: -1rpx;
        color: #e89b5f;
      }
    }
  }

  .participate-lotto {
    position: relative;
    margin: 48rpx auto 0;
    width: 670rpx;
    .content {
      display: flex;
      padding: 60rpx 21rpx 40rpx;
      margin: 0 auto;
      background: linear-gradient(0deg, #fff7ea 0%, #ffffff 100%);
      border: 2rpx solid #fce8cf;
      border-radius: 15rpx;
      .img {
        flex: 1;
      }
      & > .img:first-child {
        margin-right: 30rpx;
      }
    }
  }

  .result-wrap {
    position: relative;
    margin: 50rpx 0 84rpx;
    padding: 0 40rpx;
    text-align: center;
    color: #fedea3;

    .content {
      padding-top: 30rpx;
      opacity: 0.8;
      background: linear-gradient(0deg, #fff7ea 0%, #ffffff 100%);
      border: 2rpx solid #fce8cf;
      border-radius: 20rpx;
      &.res-text {
        padding: 130rpx 0 100rpx;
        font-size: 28rpx;
        color: #000000;
      }

      .current-prize {
        margin-bottom: 20rpx;
        padding: 16rpx;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        color: #ff4400;
        font-size: 28rpx;
        font-weight: bold;

        .lookbtn {
          margin-left: 18rpx;
          padding: 5rpx 26rpx;
          color: #ff4400;
          border-radius: 25rpx;
          font-weight: 500;
          border: 1px solid currentColor;
        }
      }

      .tips {
        padding: 14rpx 45rpx 10rpx;
        background-color: rgba($color: #ffc76a, $alpha: 0.5);
        border-radius: 0 0 20rpx 20rpx;

        .tips-text {
          color: #ac510a;
          opacity: 1;

          .look {
            color: #ff4400;
          }
        }
      }

      .prize-list {
        padding: 0 20rpx;
        margin-bottom: 20rpx;
        color: #000000;
        .prize-content {
          background-size: 100%;
          background-repeat: repeat-y;

          .prize-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 60rpx;
          }
          .prize-item:nth-of-type(odd) {
            background-image: linear-gradient(to left, #fdf0de, #fffaf3, #fdf0de);
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
    margin-top: 84rpx;
    padding-bottom: 67rpx;

    .content {
      margin: 0 auto;
      padding-top: 50rpx;
      padding-bottom: 10rpx;
      width: 670rpx;
      min-height: 300rpx;
      background: linear-gradient(0deg, #fff7ea 0%, #ffffff 100%);
      border: 2rpx solid #fce8cf;
      border-radius: 20rpx;

      .prize-item {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 128rpx;
        padding-left: 62rpx;

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
            rgba($color: #fedea3, $alpha: 0.8) 10%,
            rgba($color: #fedea3, $alpha: 0.8) 90%,
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
          color: #000;
        }
      }
    }
  }

  .win-record {
    position: relative;
    height: 456rpx;
    margin-top: 84rpx;

    .content {
      margin: 0 auto;
      padding-top: 60rpx;
      width: 670rpx;
      height: 300rpx;
      opacity: 0.8;
      background: linear-gradient(0deg, #fff7ea 0%, #ffffff 100%);
      border: 2rpx solid #fce8cf;
      border-radius: 20rpx;
      overflow: hidden;

      .vue-danmaku {
        height: 100%;
      }

      .custom-item {
        display: flex;
        align-items: center;
        width: fit-content;
        padding-right: 20rpx;
        border-radius: 40rpx;
        font-size: 22rpx;
        font-weight: bold;
        background-image: linear-gradient(to right, #fef2dc, #ffffff);
        color: #333333;

        .avatar {
          display: inline-block;
          margin-right: 10rpx;
        }
        .prizename {
          color: #333333;
        }
      }
    }

    .home-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
    }
  }
}
</style>
