<template>
  <view class="guessing flex flex-column" :style="{ 'background-color': info.BgColor }">
    <!-- #ifdef MP-WEIXIN -->
    <TitleBar :title="info.Title" textcolor="#fff" type="detail" show-nav-title is-transparent />
    <!-- #endif -->
    <!-- 背景图 -->
    <image :src="info.BgImgPath" mode="widthFix" class="bg" />
    <!-- 活动规则 -->
    <image
      v-if="baseStaticUrl"
      :src="`${baseStaticUrl}/rule.png`"
      class="rule"
      :style="{ top: ruleTop }"
      @tap="isShowDesc = true"
    />
    <!-- 我的奖品 -->
    <view v-if="baseStaticUrl" class="my-prize-box p-r" :style="{ top: ruleTop }">
      <image :src="`${baseStaticUrl}/my-prize.png`" class="my-prize" @tap="handleNavigate" />
      <!-- #ifdef MP-WEIXIN -->
      <auth-button :mode="2" />
      <!-- #endif -->
    </view>

    <!-- 查看记录 -->
    <image
      v-if="baseStaticUrl"
      :src="`${baseStaticUrl}/look-record.png`"
      class="look-record"
      :style="{ top: recordTop }"
      @tap="handleShowRecord"
    />
    <!-- #ifdef MP-WEIXIN -->
    <!-- 分享有礼 -->
    <ShareEntrance :info="shareIconInfo" :custom-style="shareIconStyle" :share-page="sharePageInfo" />
    <!-- #endif -->
    <view class="content" :style="{ marginTop: contentTop }">
      <view class="data-record flex">
        <view
          v-if="baseStaticUrl"
          class="data-item flex-1 flex"
          :style="{ backgroundImage: `url(${baseStaticUrl}/data-bg.png)` }"
        >
          <view v-if="!infoLoading" class="num">
            {{ myInfo.TotalBetNumberLeft }}
          </view>
          <u-loading v-else mode="circle" />

          <!-- 百年文案不同 -->
          <view v-if="temaleteType === 1" class="text">剩余竞猜机会</view>
          <view v-else class="text">未竞猜数</view>
        </view>
        <view
          v-if="baseStaticUrl"
          class="data-item flex-1 flex"
          :style="{ backgroundImage: `url(${baseStaticUrl}/data-bg.png)` }"
        >
          <view v-if="!infoLoading" class="num">
            {{ myInfo.TotalAmount }}
          </view>
          <u-loading v-else mode="circle" />
          <view class="text">累计获得奖金(¥)</view>
        </view>
      </view>
      <date-tab
        v-model="timeActiveIndex"
        :list="timeList"
        :base-static-url="baseStaticUrl"
        @handleChange="getMathchList"
      />
      <the-list
        :strategy="strategy"
        :list="matchesList"
        :base-static-url="baseStaticUrl"
        :temalete-type="temaleteType"
        @Vote="handleVote"
      />
      <view v-if="adInfo.isShow" class="ad-container">
        <ad-swiper :list="adInfo.list" />
      </view>
    </view>
    <!-- 底部按钮 -->
    <template v-if="btnInfo.IsShowBottomBtn && (btnInfo.IsShowUserCenter || btnInfo.IsShowMyPrizeBtn)">
      <view class="footer-gap" />
      <view class="btn-group flex flex-middle flex-center p-r">
        <view v-if="btnInfo.IsShowUserCenter" class="icon">
          <custom-button :info="btnInfo.UserCenterBtnItem" :width="320" />
        </view>
        <view v-if="btnInfo.IsShowMyPrizeBtn" class="icon">
          <custom-button :info="btnInfo.MyPrizeBtnItem" :width="320" />
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>
    </template>
    <desc-dialog
      v-model="isShowDesc"
      :base-static-url="baseStaticUrl"
      :info="{
        actId: actInfo.aid,
        MemberLogin: actInfo.memberLogin,
        Title: info.Title,
        StartTime: info.StartTime,
        EndTime: info.EndTime,
        Rule: info.Rule,
        Matches: info.Matches
      }"
      :top="top"
    />
    <record-dialog v-model="isShowRecord" :info="actInfo" :top="top" :base-static-url="baseStaticUrl" />
    <vote-dialog
      v-model="isShowVote"
      :base-static-url="baseStaticUrl"
      :info="{
        voteData: voteData,
        aid: actInfo.aid,
        usable: myInfo.TotalBetNumberLeft,
        MemberLogin: actInfo.memberLogin
      }"
      @handleVoteMatches="handleVoteMatches"
    />
    <tips-dialog v-model="isShowTips" :type="tipsType" :info="tipsData" :base-static-url="baseStaticUrl" />
    <!-- #ifdef H5 -->
    <md-follow-gzh ref="follow" @status="handleChangeGzStatus" />
    <!-- #endif -->
    <loading v-if="loading" use-default />

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { getPage } from '@/utils/index'
import { setTitleMixin } from 'packages/mixins/navigation'
import Loading from 'packages/components/loading/index.vue'
import {
  /* #ifdef MP-WEIXIN */
  apiGetActID,
  apiAddSubscribeRecord,
  /* #endif */
  apiGetActivity,
  apiGetAcivityParticipationStat,
  apiGetGetMatchTime,
  apiGetMatchStatistics,
  apiMatchBeRanks,
  apiGetIsAwardNotice
} from 'packages/api/guessing'

/* #ifdef MP-WEIXIN */
import subscribeMsg from 'packages/mixins/subscribe-msg'
import shareMixin from 'packages/mixins/share-activity'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import AdSwiper from 'packages/components/ad-swiper/ad-swiper.vue'
import ShareEntrance from 'packages/components/share-entrance/index.vue'
import { getUrlQuery } from 'packages/utils/function'
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
/* #ifdef H5 */
import { apiGetwxdata } from 'packages/api/common'
/* #endif */
import CustomButton from 'packages/components/bottom-btn/bottom-btn.vue'
import DateTab from './components/date-tab.vue'
import TheList from './components/the-list.vue'
import DescDialog from './components/desc-dialog.vue'
import RecordDialog from './components/record-dialog.vue'
import VoteDialog from './components/vote-dialog.vue'
import TipsDialog from './components/tips-dialog.vue'
import { packageStaticMixin } from 'packages/mixins/static-url'
import imgMixin from 'packages/mixins/img'
export default {
  components: {
    /* #ifdef MP-WEIXIN */
    TitleBar,
    AdSwiper,
    ShareEntrance,
    /* #endif */
    CustomButton,
    Loading,
    DescDialog,
    RecordDialog,
    VoteDialog,
    TipsDialog,
    DateTab,
    TheList
  },
  mixins: [
    setTitleMixin,
    packageStaticMixin,
    imgMixin,
    /* #ifdef MP-WEIXIN */
    subscribeMsg,
    shareMixin
    /* #endif */
  ],
  data() {
    return {
      infoLoading: false,
      temaleteType: 2, //1百年 2默认
      loading: true,
      /* #ifdef H5 */
      wxConfig: {},
      /* #endif */
      firstInit: true,
      isShowDesc: false, // 活动说明
      isShowRecord: false, // 记录
      isShowVote: false, // 竞猜
      isShowTips: false, // 竞猜提示
      btnInfo: {}, // 底部按钮组
      actInfo: {
        aid: '', // 活动id
        memberLogin: '' // 品牌商编号
      },
      strategy: {
        IsShowAmount: false, //显示金额
        IsShowBetNum: true //显示竞猜数
      },
      adInfo: {
        isShow: false,
        list: [] // 图片广告
      },
      info: {
        Title: '',
        BgColor: '#000',
        BgImgPath: '', //背景图片
        TipImgPath: '', //活动规则图标
        IntegratorImgPath: '', // 拼成图
        SliceImgPath: '', // 封面图
        JigsawCount: '',
        Rule: '',
        ShareImgPath: '',
        ShareRemark: '',
        ShareTitle: '',
        Matches: []
      },
      matchesList: [],
      myInfo: {
        TotalBetNumberLeft: 0,
        TotalAmount: 0
      },
      voteData: {
        Ranks: []
      },
      timeList: [],
      timeActiveIndex: -1,
      isSubscribed: false, // 订阅本期活动/关注公众号
      tipsType: 1,
      tipsData: {}
    }
  },
  computed: {
    baseStaticUrl() {
      return this.temaleteType === 2
        ? this.PACKAGE_STATIC_URL + 'guessing'
        : this.PACKAGE_STATIC_URL + 'guessing/bainian'
    },
    /* #ifdef MP-WEIXIN */
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    /* #endif */
    top() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `${44 + this.statusBarHeight}px`
      /* #endif */
      return style
    },
    ruleTop() {
      let style = ''
      /* #ifdef H5 */
      style = `52rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 40rpx)`
      /* #endif */
      return style
    },
    recordTop() {
      let style = ''
      /* #ifdef H5 */
      style = `200rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 150rpx)`
      /* #endif */
      return style
    },
    contentTop() {
      let style = ''
      /* #ifdef H5 */
      style = `600rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 500rpx)`
      /* #endif */
      return style
    },
    /* #ifdef MP-WEIXIN */
    shareIconInfo() {
      return {
        actId: this.actInfo.aid,
        actType: 22,
        isenableentrance: this.shareInfo.isenableentrance,
        isenableshareaward: this.shareInfo.isenableshareaward,
        entranceiconurl: this.shareInfo.entranceiconurl
      }
    },
    shareIconStyle() {
      let s = []
      s.push(`top: calc(${this.top} + 378rpx)`)
      s.push('right: 0')
      s.push('width: 149rpx; height: 118rpx')
      return s.join(';')
    },
    sharePageInfo() {
      return {
        title: this.info.ShareRemark || this.info.Title,
        imageUrl: this.info.ShareImgPath,
        path: `/packages/src/pages/guessing/index?scene=${this.scene}`
      }
    }
    /* #endif */
  },
  async onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif

    let page = getPage()
    const options = page.query
    /* #ifdef MP-WEIXIN */
    if (!options.scene) return this.$msg('链接格式不正确')
    if (this.firstInit) {
      this.scene = options.scene
      let { id, m } = getUrlQuery(decodeURIComponent(options.scene))
      let aid = await this.exchangeActId({ id, m })
      this.actInfo.aid = aid
      this.actInfo.memberLogin = m
    }
    // 分享有礼
    this.initShare(options)
    /* #endif */
    /* #ifdef H5 */
    if (!options.aid) return this.$msg('链接格式不正确')
    this.actInfo.aid = options.aid
    this.actInfo.memberLogin = options.memberlogin
    /* #endif */
    if (this.firstInit) {
      /* #ifdef H5 */
      await this.initWxConfig()
      /* #endif */
      const isValid = await this.getInfo()
      if (!isValid) return
      // 分享有礼
      /* #ifdef MP-WEIXIN */
      this.getShareInfo({ actId: this.actInfo.aid, actType: 22 })
      /* #endif */
    }

    /* #ifdef H5 */
    if (!this.firstInit && !this.isSubscribed) {
      if (process.env.NODE_ENV === 'production') {
        this.$refs.follow.getGzStatus()
      }
    }
    /* #endif */
    await this.getMathchTime()
    await this.getMathchList()
    this.loading = false
    this.firstInit = false
    this.getGetIsAwardNotice()
    this.getParticipationStat()
  },
  /* #ifdef MP-WEIXIN */
  onShareAppMessage() {
    return {
      title: this.info.ShareRemark || this.info.Title,
      imageUrl: this.info.ShareImgPath,
      path: `/packages/src/pages/guessing/index?scene=${this.scene}`
    }
  },
  /* #endif */
  methods: {
    /* #ifdef MP-WEIXIN */
    exchangeActId({ id, m }) {
      return new Promise(resolve => {
        apiGetActID({ id, m })
          .then(res => {
            // 因装修是拼装链接，可能不是实时的
            this.skin = Number(res.return_skin) || 0
            // 转化小程序链接上的id为actId
            resolve(res.return_data)
          })
          .catch(err => {
            if ([-1, -2, 30001].includes(err.return_code)) {
              // 活动不存在
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page'
              })
              resolve()
            }
          })
      })
    },
    async handleSubscribeMessage() {
      const res = await this.requestSubscribeMsg([this.noticeTempId])
      if (res && res[this.noticeTempId] === 'accept') {
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    },
    AddSubscribeRecord(aid, matchId) {
      return new Promise(resolve => {
        apiAddSubscribeRecord({
          aid,
          matchId
        }).then(() => {
          resolve()
        })
      })
    },
    /* #endif */
    /* #ifdef H5 */
    handleChangeGzStatus(status) {
      // 关注公众号状态 0：未关注  1：关注中  2：已取消关注
      this.isSubscribed = status === 1
    },
    initWxConfig() {
      return new Promise(resolve => {
        if (process.env.NODE_ENV === 'production') {
          apiGetwxdata({
            aid: this.actInfo.aid,
            url: location.href
          }).then(res => {
            const d = res.return_data
            this.wxConfig = d // 存储微信配置，ready使用
            this.$wechat.config({
              debug: false,
              appId: d.appid,
              timestamp: d.timestamp,
              nonceStr: d.noncestr,
              signature: d.signature,
              jsApiList: ['getLocation', 'updateAppMessageShareData'],
              openTagList: ['wx-open-launch-weapp']
            })

            this.$wechat.ready(() => {
              // 分享
              this.$wechat.updateAppMessageShareData({
                title: this.wxConfig.sharetitle,
                desc: this.wxConfig.sharetext,
                link: this.wxConfig.sharelink,
                imgUrl: this.wxConfig.shareimg
              })
              resolve()
            })
          })
        } else {
          setTimeout(() => {
            resolve()
          }, 200)
        }
      })
    },
    /* #endif */
    async handleVoteMatches(query) {
      try {
        let res = await apiMatchBeRanks(query)
        if (!this.isSubscribed) {
          /* #ifdef MP-WEIXIN */
          this.noticeTempId = res.return_data.CloudTemplateId
          if (!res.return_data.IsMpSubscribed && res.return_data.CloudTemplateId) {
            // 未订阅先订阅弹窗
            await this.handleSubscribeMessage()
            await this.AddSubscribeRecord(query.ActId, query.MatchId)
          }
          /* #endif */
          /* #ifdef H5 */
          // 未关注先点亮后弹二维码
          setTimeout(() => {
            this.$refs.follow.handleFollow()
          }, 1000)
          /* #endif */
        }
        await this.getParticipationStat()
        await this.getMathchList()
        this.isShowVote = false
        this.tipsType = 1
        this.isShowTips = true
      } catch (err) {
        this.$msg(err.return_msg)
      }
    },
    getGetIsAwardNotice() {
      apiGetIsAwardNotice({ aid: this.actInfo.aid })
        .then(res => {
          this.tipsType = 2
          this.tipsData = res.return_data
          this.isShowTips = true
        })
        .catch(() => {
          //nothing
        })
    },
    handleVote(item) {
      let voteData = JSON.parse(JSON.stringify(item))
      voteData.Ranks.forEach(item => {
        item.BetNum = ''
      })
      this.voteData = voteData
      this.isShowVote = true
    },
    getParticipationStat() {
      this.infoLoading = true
      return new Promise(resolve => {
        apiGetAcivityParticipationStat({ aid: this.actInfo.aid })
          .then(res => {
            this.myInfo = res.return_data
            this.infoLoading = false
            resolve()
          })
          .catch(err => {
            this.infoLoading = false
            this.myInfo = {
              TotalBetNumberLeft: '-',
              TotalAmount: '-'
            }
            this.$msg(err.return_msg)
          })
      })
    },
    getInfo() {
      return new Promise(resolve => {
        apiGetActivity({ aid: this.actInfo.aid })
          .then(res => {
            this.temaleteType = Number(res.return_skin)
            let {
              Title,
              Status,
              StartTime,
              EndTime,
              ShareImgPath,
              ShareRemark,
              ShareTitle,
              ContentJson,
              JigsawCount,
              IsEnabledPointExchange,
              Rule,
              IsGetLocation,
              CurrentPeriod,
              Matches,
              StrategyJson
            } = res.return_data
            this.setTitle(Title)

            let { BgColor, JigsawImgModular, BottomBtnModular, ImageAdsModular = {} } = JSON.parse(ContentJson) || {}
            this.info = {
              Title,
              Status,
              StartTime,
              EndTime,
              ShareImgPath: this.formatImg(ShareImgPath),
              ShareRemark,
              ShareTitle,
              JigsawCount,
              Matches,
              IsEnabledPointExchange,
              Rule,
              BgColor,
              IsGetLocation,
              ...JigsawImgModular
            }
            this.strategy = JSON.parse(StrategyJson)
            this.curPeriod = CurrentPeriod
            this.btnInfo = BottomBtnModular
            /* #ifdef MP-WEIXIN */
            this.adInfo.isShow = !!ImageAdsModular.IsShow
            this.adInfo.list = ImageAdsModular.ImgAdList || []
            /* #endif */
            resolve(true)
          })
          .catch(err => {
            /* #ifdef MP-WEIXIN */
            // H5已有其他逻辑判断
            if (err.return_code === 30001) {
              // 活动不存在
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page'
              })
              resolve(false)
            }
            /* #endif */
          })
      })
    },
    /** 获取比赛日期 */
    getMathchTime() {
      return new Promise((resolve, reject) => {
        apiGetGetMatchTime({ aid: this.actInfo.aid }).then(res => {
          if (this.$ck(res)) {
            let active = -1
            res.return_data.forEach((item, index) => {
              item.MatchDate = item.MatchDate.split(' ')[0]
              if (item.IsDefault) active = index
            })
            this.timeList = res.return_data
            if (active === -1) {
              this.$msg('未匹配到最近的比赛日期')
              reject()
            } else {
              this.timeActiveIndex = active
              resolve()
            }
          }
        })
      })
    },
    /** 返回样式 */
    setStyleData({ number, showText, backgroundColor, color }) {
      return {
        number,
        showText,
        style: {
          backgroundColor,
          color,
          textAlign: 'center',
          fontSize: '20rpx',
          lineHeight: '20rpx',
          borderRadius: '10rpx'
        }
      }
    },
    /** 获取比赛 */
    getMathchList() {
      return new Promise((resolve, reject) => {
        apiGetMatchStatistics({ aid: this.actInfo.aid, matchid: this.timeList[this.timeActiveIndex].MatchIds })
          .then(res => {
            let { return_data: list } = res
            list.forEach(item => {
              item.EstimatePrizeTime = item.EstimatePrizeTime && item.EstimatePrizeTime.split(' ')[0]
              let Ranks = item.Ranks.filter(child => !child.IsEquality)
              let row = item.Ranks.filter(child => child.IsEquality)
              if (row.length) Ranks.splice(1, 0, row[0])
              // 如果只有双方队伍时，添加一项空的中间占位置
              if (Ranks.length === 2) Ranks.splice(1, 0, {})
              item.Ranks = Ranks
              // // 进度条处理
              // let sumBetNum = Ranks.reduce((val, row) => val + row.BetNum, 0)
              // let voteState = item.Ranks.every(child => !child.PersonalBetNum)
              // let bgc = Ranks.length === 3 ? ['#E3003D', '#3965BE', '#FFF28F'] : ['#E3003D', '#FFF28F']
              // item.processData = Ranks.map((child, j) => {
              //   return this.setStyleData({
              //     number: voteState ? parseInt(100 / Ranks.length) : (child.PersonalBetNum / sumBetNum) * 100,
              //     showText: !voteState,
              //     backgroundColor: bgc[j],
              //     color: j === Ranks.length - 1 ? '#E3003D' : '#fff'
              //   })
              // })
            })
            this.matchesList = list
            resolve()
          })
          .catch(err => {
            this.$msg(err.return_msg)
            reject()
          })
      })
    },
    handleNavigate() {
      /* #ifdef H5 */
      if (!this.btnInfo.UserCenterBtnItem.H5.JumpUrl) return
      location.href = this.btnInfo.UserCenterBtnItem.H5.JumpUrl
      /* #endif */
      /* #ifdef MP-WEIXIN */
      navigateToMP({
        appId: '',
        path: '/personal/prize/list'
      })
      /* #endif */
    },
    handleShowRecord() {
      this.isShowRecord = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>

