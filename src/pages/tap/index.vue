<template>
  <view>
    <view v-if="isLoaded" class="page-tap" :style="{ 'background-color': info.activitybgcolor }">
      <!-- #ifdef MP-WEIXIN -->
      <TitleBar :title="info.title" textcolor="#fff" type="detail" show-nav-title is-transparent />
      <!-- #endif -->
      <!-- 背景图 -->
      <image :src="info.background" mode="widthFix" class="bg" />
      <view class="main flex flex-column">
        <!-- 活动规则 -->
        <image :src="info.tipimgpath" class="rule" @tap="handleShowDesc" />
        <!-- #ifdef MP-WEIXIN -->
        <!-- 分享 -->
        <button
          open-type="share"
          hover-class="none"
          class="share"
          :style="{ backgroundImage: `url(${info.shareimg})` }"
        />
        <!-- #endif -->
        <!-- 活动区域 -->
        <view class="count-box-placeholder" />
        <count-box
          ref="countBox"
          :info="{
            actId: actInfo.aid,
            desc: info.datetimecopy,
            textcolor: info.textcolor,
            clickimg: info.clickimg,
            stopimg: info.stopimg,
            credentials
          }"
          @prepare="handleShowScore"
          @success="successCb"
          @error="failCb"
        />
        <!-- 奖项内容 -->
        <view class="flex-1">
          <prize-list :show="info.isshowawardscontent" :bg-color="info.activitybgcolor" :list="prizeList" />
        </view>

        <!-- 底部按钮 -->
        <template v-if="btnInfo.IsShowBottomBtn && (btnInfo.IsShowUserCenter || btnInfo.IsShowMyPrizeBtn)">
          <!-- <view class="footer-gap"></view> -->
          <view class="btn-group flex flex-middle flex-center p-r">
            <view v-if="btnInfo.IsShowMyPrizeBtn" class="icon">
              <custom-button :info="btnInfo.MyPrizeBtnItem" :width="320" :height="86" />
            </view>
            <view v-if="btnInfo.IsShowUserCenter" class="icon">
              <custom-button :info="btnInfo.UserCenterBtnItem" :width="320" :height="86" />
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <auth-button :mode="2" />
            <!-- #endif -->
          </view>
        </template>
      </view>
    </view>

    <!-- 活动说明 | 已获奖品 -->
    <desc-dialog
      v-model="isShowDesc"
      :info="{
        actId: actInfo.aid,
        title: info.title,
        startTime: info.startdatetime,
        endTime: info.enddatetime,
        rule: info.rule
      }"
      :top="top"
    />
    <!-- 中奖名单 -->
    <winner-list :show="info.isshowwinningcontent && hasWin" :list="winningList" />
    <!-- 兑换 -->
    <score-dialog
      ref="scoreDialog"
      v-model="isShowScore"
      :info="{ actId: actInfo.aid, point: info.cost, daylimit: info.daylimit }"
      :join-mode="info.joinmarketmode"
      @tip="onTip"
      @success="onExchange"
    />
    <!-- 抽奖结果 -->
    <prize-dialog v-model="isShowPrize" :info="prizeInfo" @continue="handleReset" />
    <!-- #ifdef MP-WEIXIN -->
    <loading v-if="!isLoaded" use-default />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <md-follow-gzh ref="follow" :act-type="11" />
    <!-- #endif -->
    <common-popup v-model="showTip" confirm-text="知道了">
      <view class="fs-30">{{ tipMsg }}</view>
    </common-popup>

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import Loading from 'packages/components/loading/index.vue'
import { getUrlQuery } from 'packages/utils/function'
/* #endif */
import { apiGetwxdata } from 'packages/api/common'
import {
  /* #ifdef MP-WEIXIN */
  apiGetActID,
  /* #endif */
  apiGetActivity
} from 'packages/api/activity'
import { setTitleMixin } from 'packages/mixins/navigation'
import imgMixin from 'packages/mixins/img'

import CountBox from './components/count-box.vue'
import DescDialog from './components/desc-dialog.vue'
import ScoreDialog from './components/score-dialog.vue'
import PrizeDialog from './components/prize-dialog.vue'
import PrizeList from './components/prize-list.vue'
import WinnerList from 'packages/components/winner-list.vue'

import CustomButton from 'packages/components/bottom-btn/bottom-btn.vue'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'

import { getPage } from 'packages/utils/index'

export default {
  name: 'Tap',
  components: {
    /* #ifdef MP-WEIXIN */
    TitleBar,
    Loading,
    /* #endif */
    CountBox,
    DescDialog,
    ScoreDialog,
    PrizeDialog,
    PrizeList,
    WinnerList,
    CustomButton,
    CommonPopup
  },
  mixins: [setTitleMixin, imgMixin],
  data() {
    return {
      /* #ifdef MP-WEIXIN */
      scene: '', // 小程序参数，需decode
      /* #endif */
      actInfo: {
        aid: '', // 活动id
        memberLogin: '' // 品牌商编号
      },
      info: {
        title: '',
        joinmarketmode: 0
      }, // 基础信息
      isShowDesc: false, // 活动说明弹窗
      isShowScore: false, // 兑换弹窗
      credentials: '', // 兑换凭证
      btnInfo: {}, // 底部按钮组
      winningList: [], // 中奖名单
      prizeList: [], // 奖项数据
      prizeInfo: {}, // 中奖信息
      isShowPrize: false,
      showTip: false, // 提示
      tipMsg: '',
      wxConfig: {},
      isLoaded: false, // 加载标记 防止页面展示不全
      firstInit: true
    }
  },
  computed: {
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
    hasWin() {
      return this.winningList.length > 0
    }
  },
  onLoad(options) {},
  async onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif

    let page = getPage()
    const options = page.query
    /* #ifdef MP-WEIXIN */
    // 兼容两种链接形式：1、id&m, 2、scene
    if (!((options.id && options.m) || options.scene)) return this.$msg('链接格式不正确')
    if (this.firstInit) {
      let params = {}
      if (options.id && options.m) {
        params = options
        this.scene = encodeURIComponent(`id=${options.id}&m=${options.m}`)
      } else {
        params = getUrlQuery(decodeURIComponent(options.scene))
        this.scene = options.scene
      }
      let aid = await this.exchangeActId(params)
      if (!aid) return
      this.actInfo.aid = aid
      this.actInfo.memberLogin = params.m
    }
    /* #endif */

    /* #ifdef H5 */
    if (!options.aid) return this.$msg('链接格式不正确')
    this.actInfo.aid = options.aid
    this.actInfo.memberLogin = options.memberlogin
    /* #endif */
    if (this.firstInit) {
      await this.getInfo()
      this.initWxConfig()
    }
    this.isLoaded = true
    this.firstInit = false
  },
  async onPullDownRefresh() {
    await this.getInfo()
    uni.stopPullDownRefresh()
  },
  /* #ifdef MP-WEIXIN */
  onShareAppMessage() {
    return {
      title: this.info.shareremark || this.info.title,
      imageUrl: this.info.shareimgpath,
      path: `/packages/src/pages/tap/index?scene=${this.scene}`
    }
  },
  /* #endif */
  methods: {
    getInfo() {
      return new Promise(resolve => {
        apiGetActivity({ aid: this.actInfo.aid })
          .then(res => {
            const d = this.$toLowerKey(res, true)
            const {
              title,
              status,
              startdatetime,
              enddatetime,
              background,
              datetimecopy,
              activityclicksetting,
              cost,
              daylimit,
              joinmarketmode,
              limitexplain,
              ismembers,
              messagelist,
              prizelist
            } = d.return_data
            const { clickbegintime, clickendtime, contentjson, rule } = activityclicksetting
            const {
              textcolor,
              activitybgcolor,
              tipimgpath,
              clickimg,
              stopimg,
              shareimg,
              isshowawardscontent,
              isshowwinningcontent,
              bottombtnmodular,
              shareremark,
              shareimgpath
            } = this.$toLowerKey(JSON.parse(contentjson) || {})
            /* #ifdef MP-WEIXIN */
            if (status === 0) {
              // 禁用
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page'
              })
              return
            }
            if (+new Date(enddatetime.replace(/-/g, '/')) < +new Date()) {
              // 已结束
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page?msg=抱歉，活动已经结束了呢~'
              })
              return
            }
            /* #endif */
            this.info = {
              title,
              status,
              startdatetime,
              enddatetime,
              background,
              datetimecopy,
              cost,
              daylimit,
              joinmarketmode,
              limitexplain,
              ismembers,
              clickbegintime,
              clickendtime,
              rule,
              textcolor,
              activitybgcolor,
              tipimgpath,
              clickimg,
              stopimg,
              shareimg,
              isshowawardscontent,
              isshowwinningcontent,
              shareremark,
              shareimgpath: this.formatImg(shareimgpath)
            }
            this.btnInfo = bottombtnmodular
            this.winningList = messagelist
            this.prizeList = prizelist

            this.setTitle(title)
            resolve()
          })
          .catch(err => {
            /* #ifdef MP-WEIXIN */
            // H5已有其他逻辑判断
            if ([-1, 30001].includes(err.return_code)) {
              // 活动不存在
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page'
              })
            }
            resolve()
            /* #endif */
          })
      })
    },
    handleShowScore() {
      if (+new Date().getTime() < +new Date(this.info.startdatetime.replace(/-/g, '/')).getTime()) {
        this.tipMsg = '活动未开始'
        this.showTip = true
        return
      }
      if (this.info.ismembers === 0) {
        // 会员是否有资格参加活动: 0不符合 1符合
        this.tipMsg = this.info.limitexplain
        this.showTip = true
        return
      }
      // this.isShowScore = true
      this.$refs.scoreDialog.start()
    },
    onTip(msg) {
      this.tipMsg = msg
      this.showTip = true
    },
    onExchange(key) {
      this.credentials = key
      this.$refs.countBox.init()
    },
    successCb({ prizeId, link, finalTime }) {
      let prizeInfo = this.prizeList.find(item => item.id === prizeId)
      prizeInfo = { ...prizeInfo, ...link, finalTime }
      this.prizeInfo = prizeInfo
      this.$nextTick(() => {
        this.isShowPrize = true
      })
    },
    failCb({ code, msg }) {
      if (code === 30061) {
        // 活动限制
        this.tipMsg = this.info.limitexplain
        this.showTip = true
        return
      }
      // 其他异常
      this.tipMsg = msg
      this.showTip = true
    },
    handleReset() {
      this.$refs.countBox.reset()
    },
    handleShowDesc() {
      this.isShowDesc = true
    },
    initWxConfig() {
      return new Promise(resolve => {
        let url = ''
        /* #ifdef H5 */
        if (process.env.NODE_ENV === 'development') {
          return resolve()
        }
        url = location.href
        /* #endif */
        /* #ifdef MP-WEIXIN */
        url = 'packages/src/pages/tap/index'
        /* #endif */
        apiGetwxdata({
          aid: this.actInfo.aid,
          url
        }).then(res => {
          const d = this.$toLowerKey(res, true)
          this.wxConfig = d.return_data // 存储微信配置，ready使用
          /* #ifdef MP-WEIXIN */
          resolve()
          /* #endif */
          /* #ifdef H5 */
          this.$wechat.config({
            debug: false,
            appId: d.return_data.appid,
            timestamp: d.return_data.timestamp,
            nonceStr: d.return_data.noncestr,
            signature: d.return_data.signature,
            jsApiList: ['updateAppMessageShareData'],
            openTagList: ['wx-open-launch-weapp']
          })

          this.$wechat.ready(() => {
            // 分享
            this.$wechat.updateAppMessageShareData({
              title: this.info.title,
              desc: this.info.shareremark || this.info.title,
              link: this.wxConfig.sharelink,
              imgUrl: this.info.shareimgpath
            })
            resolve()
          })
          /* #endif */
        })
      })
    },
    /* #ifdef MP-WEIXIN */
    exchangeActId({ id, m }) {
      return new Promise(resolve => {
        apiGetActID({ id, m })
          .then(res => {
            // 转化小程序链接上的id为actId
            resolve(res.return_data)
          })
          .catch(err => {
            if ([-1, 30001].includes(err.return_code)) {
              // 活动不存在
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page'
              })
              resolve()
            }
          })
      })
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
