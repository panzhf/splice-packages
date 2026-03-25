<template>
  <view>
    <view v-if="isLoaded" class="page-turntable" :class="'skin-' + skin" :style="pageBg">
      <view class="main">
        <!-- 背景图 -->
        <image v-if="info.background" :src="info.background" mode="widthFix" class="bg" />
        <!-- 活动时间+抽奖限制 -->
        <view class="time-box text-center">
          <view class="time">{{ formatTime }}</view>
          <count-info v-if="![6, 7, 8].includes(skin)" :skin="skin" :info="countInfo" />
        </view>

        <view class="turntable-box mt-10 p-r">
          <!-- 大转盘 -->
          <base-turntable
            ref="baseTable"
            :skin="skin"
            :list="info.prizelist"
            :info="{ aid: actInfo.aid, ...timeInfo, ...drawInfo, coordinate }"
            :free-num.sync="info.freenum"
            :is-third-open="isThirdOpen"
            :btm-jump-html="btmJumpHtml"
            @success="onShowPrize"
            @refresh-location="getLocation"
          />
          <!-- #ifdef MP-WEIXIN -->
          <auth-button :mode="2" />
          <!-- #endif -->
        </view>
        <image v-if="skin !== 8" :src="bottomBg" class="bottom-bg" />
      </view>

      <count-info v-if="[6, 7, 8].includes(skin)" :skin="skin" :info="countInfo" />
      <!-- 奖项内容 -->
      <prize-list :skin="skin" :info="{ rule: info.rule, ...timeInfo }" :list="info.prizelist" />
      <!-- 中奖名单 -->
      <winner-list :skin="skin" :tip="info.companyname" :list="info.messagelist" />
      <md-copyright
        v-if="!isopendocking"
        :color="skin === 7 ? '#666' : '#fff'"
        bg-color="transparent"
        :member-login="actInfo.memberLogin"
      />

      <view class="footer-gap" />
      <!-- 底部按钮 -->
      <template v-if="btnInfo.IsShowBottomBtn && (btnInfo.IsShowUserCenter || btnInfo.IsShowMyPrizeBtn)">
        <view class="btn-group flex flex-middle flex-center p-r">
          <view v-if="btnInfo.IsShowMyPrizeBtn" class="icon">
            <custom-button
              :info="btnInfo.MyPrizeBtnItem"
              :width="320"
              :height="86"
              :is-third-open="isThirdOpen"
              @third-navigate="handleThirdNavigate"
            />
          </view>
          <view v-if="btnInfo.IsShowUserCenter" class="icon">
            <custom-button
              :info="btnInfo.UserCenterBtnItem"
              :width="320"
              :height="86"
              :is-third-open="isThirdOpen"
              @third-navigate="handleThirdNavigate"
            />
          </view>
          <!-- #ifdef MP-WEIXIN -->
          <auth-button :mode="2" />
          <!-- #endif -->
        </view>
      </template>
    </view>
    <prize-dialog v-model="isShowPrize" :info="prizeInfo" :is-third-open="isThirdOpen" />
    <!-- #ifdef MP-WEIXIN -->
    <loading v-if="!isLoaded" use-default />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import Loading from 'packages/components/loading/index.vue'
import { getUrlQuery } from 'packages/utils/function'
/* #endif */
import {
  /* #ifdef MP-WEIXIN */
  apiGetActID,
  /* #endif */
  /* #ifdef H5 */
  // 获取第三方小程序的appid百雀羚
  apiGetBaiQueLingMini,
  /* #endif */
  apiGetActivity
} from 'packages/api/activity'
import { apiGetwxdata } from 'packages/api/common'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { setTitleMixin } from 'packages/mixins/navigation'
import imgMixin from 'packages/mixins/img'
import { navigateMixin } from './mixins'
import { getPage } from 'packages/utils/index'

import BaseTurntable from './components/base-turntable.vue'
import PrizeList from './components/prize-list.vue'
import WinnerList from './components/winner-list.vue'
import CountInfo from './components/count-info.vue'
import PrizeDialog from './components/prize-dialog.vue'

import CustomButton from 'packages/components/bottom-btn/bottom-btn.vue'

export default {
  name: 'Turntable',
  components: {
    /* #ifdef MP-WEIXIN */
    Loading,
    /* #endif */
    BaseTurntable,
    PrizeList,
    WinnerList,
    CountInfo,
    PrizeDialog,
    CustomButton
  },
  mixins: [packageStaticMixin, setTitleMixin, imgMixin, navigateMixin],
  data() {
    return {
      /* #ifdef MP-WEIXIN */
      scene: '', // 小程序参数，需decode
      /* #endif */
      skin: 0,
      info: {},
      actInfo: {
        aid: '', // 活动id
        memberLogin: '' // 品牌商编号
      },
      isLoaded: false,
      firstInit: true,
      isShowPrize: false,
      prizeInfo: {}, // 中奖信息
      wxConfig: {},
      coordinate: '', // 经纬度
      btnInfo: {}, // 底部按钮组
      isWxFlag: false, // 小程序嵌套H5
      isopendocking: false, // 第三方对接标记
      /* #ifdef H5 */
      btmJumpHtml: ''
      /* #endif */
    }
  },
  computed: {
    isThirdOpen() {
      return this.isWxFlag && this.isopendocking
    },
    formatTime() {
      return [6, 7, 8].includes(this.skin) ? this.info.datetimecopy.replace(/活动时间：/, '') : this.info.datetimecopy
    },
    timeInfo() {
      // 活动说明
      const { status, startdatetime, enddatetime, timestartdatetime, timeenddatetime, title, actid } = this.info
      return {
        status,
        startdatetime,
        enddatetime,
        timestartdatetime,
        timeenddatetime,
        title,
        actid,
        isThirdOpen: this.isThirdOpen
      }
    },
    drawInfo() {
      // 大转盘抽奖
      const { ismembers, limitexplain, usescenetype, personallink, pointlink } = this.info
      return { ismembers, limitexplain, usescenetype, personallink, pointlink }
    },
    countInfo() {
      // 抽奖机会
      const { joinmarketmode, freenum, cost, daylimit } = this.info
      return { joinmarketmode, freenum, cost, daylimit }
    },
    pageBg() {
      let style = []
      if ([4, 8].includes(this.skin)) {
        style.push(`background-image: url(${this.PACKAGE_STATIC_URL}turntable/${this.skin}/bg.png)`)
      }
      return style.join(';')
    },
    bottomBg() {
      return `${this.PACKAGE_STATIC_URL}turntable/${this.skin}/cloud.png`
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
    /* #endif */
    await this.getInfo()

    if (this.firstInit) {
      await this.initWxConfig()
    }

    /* #ifdef H5 */
    this.getWxFlag()
    /* #endif */
    if (this.info.usescenetype === 1) {
      // 线下门店，需要授权地理位置
      this.getLocation()
    }
    this.isLoaded = true
    this.firstInit = false
  },
  async onPullDownRefresh() {
    await this.getInfo()
    this.$refs.baseTable.init()
    uni.stopPullDownRefresh()
  },
  /* #ifdef MP-WEIXIN */
  onShareAppMessage() {
    return {
      title: this.info.shareremark || this.wxConfig.sharetitle,
      imageUrl: this.info.shareimgpath || this.wxConfig.shareimg,
      path: `/packages/src/pages/turntable/index?scene=${this.scene}`
    }
  },
  /* #endif */
  methods: {
    getInfo() {
      return new Promise(resolve => {
        apiGetActivity({ aid: this.actInfo.aid })
          .then(res => {
            const { BottomBtnModular, ...rest } = res.return_data
            const d = this.$toLowerKey(rest, true)
            const { status, backgroundtemplate, enddatetime, isopendocking, memberlogin } = d
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
            // #ifdef H5
            this.actInfo.memberLogin = memberlogin
            // #endif
            // 模板
            this.skin = +backgroundtemplate || 0
            const { ShareRemark, ShareImgPath, ...btnInfo } = BottomBtnModular || {}
            this.info = { shareremark: ShareRemark, shareimgpath: this.formatImg(ShareImgPath), ...d }
            this.isopendocking = !!isopendocking
            this.btnInfo = btnInfo

            this.setTitle(this.info.title)
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
        url = 'packages/src/pages/turntable/index'
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
            jsApiList: ['updateAppMessageShareData', 'scanQRCode', 'getLocation'],
            openTagList: ['wx-open-launch-weapp']
          })

          this.$wechat.ready(() => {
            // 分享
            this.$wechat.updateAppMessageShareData({
              title: this.info.title,
              desc: this.info.shareremark || this.wxConfig.sharetitle,
              link: this.wxConfig.sharelink,
              imgUrl: this.info.shareimgpath || this.wxConfig.shareimg
            })
            resolve()
          })
          /* #endif */
        })
      })
    },
    getLocation() {
      /* #ifdef MP-WEIXIN */
      uni.getLocation({
        type: 'gcj02',
        success: ({ longitude, latitude }) => {
          this.coordinate = `${latitude},${longitude}`
        }
      })
      /* #endif */
      /* #ifdef H5 */
      if (process.env.NODE_ENV === 'development') {
        this.coordinate = '23.1288877474089,113.37376345608519'
        return
      }
      this.$wechat.getLocation({
        type: 'gcj02',
        success: ({ longitude, latitude }) => {
          this.coordinate = `${latitude},${longitude}`
        }
      })
      /* #endif */
    },
    onShowPrize(prize) {
      this.prizeInfo = prize
      this.prizeInfo.usescenetype = this.info.usescenetype
      this.isShowPrize = true
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
    },
    /* #endif */
    handleThirdNavigate(info) {
      // 第三方跳转
      /* #ifdef H5 */
      this.$wechat.miniProgram.navigateTo({
        url: info.JumpUrl
      })
      /* #endif */
    },
    /* #ifdef H5 */
    getWxFlag() {
      this.isWxFlag = !!navigator.userAgent.match(/miniProgram/)
      if (this.isopendocking && !this.isWxFlag) {
        this.initThirdConfig()
      }
    },
    // h5跳小程序
    initThirdConfig() {
      apiGetBaiQueLingMini().then(res => {
        if (this.$ck(res)) {
          const appid = res.return_data.miniappid
          this.btmJumpHtml = this.initWxOpenLaunchWeappHtml({
            appid,
            link: 'pages/home/home'
          })
        }
      })
    },
    // 初始化H5跳小程序标签代码
    initWxOpenLaunchWeappHtml(item) {
      if (process.env.NODE_ENV === 'production') {
        return `<wx-open-launch-weapp id="launch-btn" appid="${item.appid}" path="${item.link}">
        <template>
          <style>
            .primary-btn {
              color: #fff;
              width: 170px;
              height: 34px;
              display: inline-block;
              color: #fff;
              text-align: center;
              font-size: 13px;
              line-height: 34px;
              background-color: #ffa200;
              box-sizing: border-box;
              border-radius: 18px;
            }
          </style>
          <view class="primary-btn">确认</view>
        </template>
      </wx-open-launch-weapp>`
      } else {
        return `<view style="width: 170px;height: 34px;display: inline-block;
                height: 34px;
                color: #fff;
                text-align: center;
                font-size: 13px;
                line-height: 34px;
                background-color: #ffa200;
                border-radius: 18px;
                box-sizing: border-box; " class="mock-btn">wx-open模拟</view>`
      }
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
