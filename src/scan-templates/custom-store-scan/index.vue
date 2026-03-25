<template>
  <view>
    <view
      v-if="!loading"
      class="custom-guide-scan-container flex flex-column"
      :style="{ backgroundColor: pageBgColor }"
    >
      <image v-if="bgUrl" :src="bgUrl" mode="widthFix" class="bg" :style="{ top: bgTop }" />
      <!-- #ifdef MP-WEIXIN -->
      <!-- #ifdef MP-RETAIL -->
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title"  type="custom" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
      <!-- #endif -->
      <!-- #endif -->
      <view :style="{ paddingTop: top }" class="main flex-1">
        <!-- <view class="flex-1"> -->
        <view v-for="(item, index) in components" :key="index" class="component-item">
          <!-- 图片广告 -->
          <image-ad v-if="item.code === 'ImageAd'" :img-data="item.data" />
          <!-- 标题文本 -->
          <blank-segmente v-if="item.code === 'BlankSegmente'" :blank-data="item.data" />
          <!-- 辅助分割 -->
          <title-text v-if="item.code === 'TitleText'" :text-data="item.data" />
          <award-entrance v-if="item.code === 'AwardEntrance'" :img-data="item.data" @get-award="handleAward" />
          <awards-info v-if="item.code === 'AwardsInfo'" :awards-data="item.data" :prize-list="prizeList" />
          <anti-fake-info
            v-if="item.code === 'AntiFakeInfo'"
            :is-first="dxmInfo.ScanCount === 1"
            :info="item.data"
            :code-data="codeData"
            :fw-tip="dxmInfo.FwQueryTip"
          />
          <referral-bonus v-if="item.code === 'ReferralBonus'" :info="item.data" :dxm-regis-info="dxmRegisInfo" />
          <scan-qr-code v-if="item.code === 'ScanQrCode'" :info="item.data" @scanData="scanDataEvent($event, 2)" />
          <no-store v-if="item.code === 'NoStore'" :info="item.data" :msg="dxmInfo.noStoreMsg" />
          <go-active-store
            v-if="item.code === 'GoActiveStore'"
            :info="item.data"
            :code-data="codeData"
            :mp-map-info="mpMap"
          />
          <go-register-store
            v-if="item.code === 'GoRegisterStore'"
            :info="item.data"
            :code-data="codeData"
            :mp-map-info="mpMap"
          />
          <continuous-scan v-if="item.code === 'ContinuousScan'" :info="item.data" :mp-map-info="mpMap" />
          <dealer-info
            v-if="item.code === 'DealerInfo' && scanDealerInfoData.dealername"
            :info="item.data"
            :dealer-data="scanDealerInfoData"
          />
        </view>
        <!-- </view> -->
      </view>

      <md-copyright color="#fff" bg-color="transparent" />

      <view class="rule-box" :style="{ top: rulesTop }">
        <view v-if="showRule && isScanPage && !isErrorDefalutModel" class="item" @click="handleClickRule">
          <view class="iconfont iconbangzhu" />
          活动说明
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <view v-if="showRecord" class="item" @click="handleClickRecord">
          <view class="iconfont iconjiangpai" />
          领奖记录
        </view>
        <!-- #endif -->
      </view>
      <!-- 底部按钮 -->
      <!-- #ifdef H5 -->
      <view v-show="isShowBottomBtns" class="bottom-btns">
        <template v-for="(item, index) in bottomBtns">
          <view :key="index">
            <image
              v-if="item.imageUrl && item.jumpType === 'h5'"
              class="bottom-btn"
              mode="widthFix"
              :src="item.imageUrl"
              @click="handleClickBottomBtn(item)"
            />
            <div
              v-if="item.imageUrl && (item.jumpType === 'mp' || item.sceneType === 'retailassistant' || item.sceneType === 'retailspecial')"
              class="bottom-btn"
              v-html="item.bottomBtnJumpWxHtml"
            />
          </view>
        </template>
      </view>
      <!-- #endif -->

      <!-- #ifdef MP-WEIXIN -->
      <view v-if="isShowBottomBtns" class="footer" />
      <view v-if="isShowBottomBtns" class="bottom-btns">
        <template v-for="(item, index) in bottomBtns">
          <image
            v-if="item.imageUrl"
            :key="index"
            class="bottom-btn"
            mode="widthFix"
            :src="item.imageUrl"
            @click="handleClickBottomBtn(item)"
          />
        </template>
      </view>
      <!-- #endif -->

      <!-- 中奖弹窗 -->
      <win-dialog
        ref="winDialog"
        :is-show.sync="isShowWinDialog"
        :is-frist-award="isFristAward"
        :prize-info.sync="prizeInfo"
        :activity-id="activityId"
        :custom-scan-configs="contentJson"
        is-custom-type="store"
        :memberlogin="codeData.memberlogin"
        :mp-map="mpMap"
        :custom-style="customStyle.winstyle"
        @open="openReceive"
        @qrcode="handleOpenQrcode"
      />

      <!-- 不中奖弹窗 -->
      <nowin-dialog
        :is-show.sync="isShowNowinDialog"
        :state="nowinState"
        :nickname="firstScanCodeNickName"
        :time="firstScanCodeTime"
        :is-get-prize.sync="isGetPrize"
        :prize-info.sync="prizeInfo"
        :not-winning-msg="notWinningMsg"
        :custom-scan-configs="contentJson"
        :is-new-custom="true"
      />

      <!-- 活动说明 -->
      <full-rule :is-show.sync="isShowFullRule" :rule-info="ruleInfo" :lable-custom-style="customStyle.rule" />

      <!-- 验证码 -->
      <code-dialog
        :is-show.sync="codeVisible"
        :tips="verifyCodeTips"
        :is-show-close="isShowVerifyCodeCloseIcon"
        @judge="handleJudgeValidVerifyCode"
      />

      <!-- 关注公众号 -->
      <follow-gzh :is-show.sync="isShowGzhDialog" :qr-code="gzhQrCode" />

      <!-- 添加企微活码 -->
      <follow-workwx :is-show.sync="isShowWorkwxDialog" :activity-qr-code="activityQrCode" />

      <!-- 收集资料 -->
      <collect-dialog
        ref="collectDialog"
        :is-show.sync="isShowCollectDialog"
        :info-config="collectConfig"
        :open-id="openId"
        @date="handleShowDatePicker"
        @success="sumbitAwardApply(false)"
      />

      <!-- 解锁成功 -->
      <unlock-dialog :is-show.sync="unlockVisible" :info="unlockAmount" :award-id="unlockHbid" :hbtype="unlockHbtype" />

      <!-- 待解锁红包列表 -->
      <unlock-list-dialog :is-show.sync="unlockListVisible" :info="unlockCouponList" @choose="chooseUnlock" />

      <!-- 待解锁红包不能解锁列表 -->
      <no-unlock-list-dialog :is-show.sync="noUnlockListVisible" :info="unlockCouponList" />

      <!-- 提示弹窗 -->
      <Dialog ref="Dialog" />

      <!-- 未领奖图标 显示条件：后台开启了奖品领取提示且未领取奖品数量大于零且前端没点关闭按钮 -->
      <view v-if="isShowAwardTipsDialog && isShowUnclaimedIcon" class="unclaimed-wrap">
        <view class="unclaimed-animation" @click="isShowUnclaimedDialog = true">
          <span class="unclaimed-count">{{ awardForWaitList.length }}</span>
          <u-image class="unclaimed-img" width="185rpx" height="100%" mode="widthFix" :src="unclaimedIcon" />
        </view>
        <view class="iconfont icon-close2 close-btn" @click="isShowUnclaimedIcon = false" />
      </view>
      <!-- 未领奖弹窗 -->
      <unclaimed-dialog :is-show.sync="isShowUnclaimedDialog" :list="awardForWaitList" />

      <!-- #ifdef MP-WEIXIN -->
      <!-- 实物奖品弹框 -->
      <receive-dialog ref="ReceiveDialog" />
      <save-qr ref="saveQr" z-index="30000" />
      <canvas class="canvas-code" canvas-id="myCanvas" />
      <!-- #endif -->
      <!-- 启动页 -->
      <start-page
        :is-show.sync="isShowStartPage"
        :bg-img="startPageBgImg"
        :time="startPageTime"
        :title="title"
        :old-title="title"
        @end="endCoverCallFn"
      />

      <!-- #ifdef H5 -->
      <!-- 日期选择 -->
      <u-picker v-model="isShowDatePicker" mode="time" @confirm="handleDatePickerConfirm">请选择</u-picker>
      <!-- #endif -->
    </view>
    <!-- 门店选择 -->
    <store-list v-model="showStorePopup" @SelectStore="SelectStore" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
// 引入组件
/* #ifdef MP-RETAIL */
import TitleBar from 'packages/components/title-bar/title-bar'
/* #endif */
/* #ifndef MP-RETAIL */
import TitleBar from 'packages/components/title-bar/title-home.vue'
/* #endif */

import ImageAd from 'packages/design/basic/image-ad.vue'
import TitleText from 'packages/design/basic/title-text.vue'
import blankSegmente from 'packages/design/basic/blank-segmente.vue'
import awardEntrance from 'packages/design/scan/award-entrance.vue'
import awardsInfo from 'packages/design/scan/awards-info.vue'
import AntiFakeInfo from 'packages/design/scan/anti-fake-info.vue'
import ReferralBonus from 'packages/design/scan/referral-bonus.vue'
import ScanQrCode from 'packages/design/scan/scan-qr-code.vue'
import GoActiveStore from 'packages/design/scan/go-active-store.vue'
import NoStore from 'packages/design/scan/no-store.vue'
import GoRegisterStore from 'packages/design/scan/go-register-store.vue'
import ContinuousScan from 'packages/design/scan/continuous-scan.vue'
// 经销商信息组件
import DealerInfo from 'packages/design/scan/dealer-info'
import StartPage from '../components/start-page'

/* #ifdef H5 */
import { formatPath } from 'packages/utils/utils'
/* #endif */
/* #ifdef MP-WEIXIN */
import ReceiveDialog from '../components/receive-dialog'
import navigateToMP from '@/utils/navigate-mp'
import generateQrMixin from '@/mixins/generate-qr'
import { getExtConfig } from '@/config'
/* #endif */
import { staticURL } from '@/config'
import { packageStaticMixin } from 'packages/mixins/static-url'
import scanApiMixin from 'packages/mixins/scan-api'
import { scanCbMixin } from 'packages/mixins/scan'

// 自定义
import WinDialog from '../components/scan/win-dialog'
import NowinDialog from '../components/scan/nowin-dialog'
import FullRule from '../components/full-rule'

import Dialog from '../components/dialog'
import CollectDialog from 'packages/components/scan/collect-dialog'
import CodeDialog from '../components/code-dialog'

import StoreList from 'packages/components/scan/store-list.vue'

import UnclaimedDialog from '../components/unclaimed-dialog'
import FollowWorkwx from '../components/follow-workwx'
import FollowGzh from '../components/follow-gzh'
import UnlockDialog from '../components/unlock-dialog'
import UnlockListDialog from '../components/unlock-list-dialog'
import NoUnlockListDialog from '../components/no-unlock-list-dialog'
import { getQuery } from 'packages/utils/function'
import { specialRegisterStyle } from 'packages/config/custom'
import openLinkMixin from '@/mixins/open-link'

export default {
  components: {
    TitleBar,
    ImageAd,
    TitleText,
    blankSegmente,
    awardEntrance,
    awardsInfo,
    AntiFakeInfo,
    ReferralBonus,
    ScanQrCode,
    GoActiveStore,
    NoStore,
    GoRegisterStore,
    ContinuousScan,
    DealerInfo,

    StoreList,
    Dialog,
    WinDialog,
    NowinDialog,
    UnclaimedDialog,
    FullRule,
    FollowWorkwx,
    FollowGzh,
    CollectDialog,
    UnlockDialog,
    UnlockListDialog,
    NoUnlockListDialog,
    CodeDialog,

    /* #ifdef MP-WEIXIN */
    ReceiveDialog,
    /* #endif */
    StartPage
  },
  mixins: [
    packageStaticMixin,
    scanApiMixin,
    scanCbMixin,
    /* #ifdef MP-WEIXIN */
    generateQrMixin,
    openLinkMixin
    /* #endif */
  ],
  data() {
    return {
      isScanPage: false,
      components: [],
      loading: true,
      pageBgColor: '',
      bgcolor: '#fff',
      textcolor: '',
      title: '',
      bgUrl: '',
      showBack: false,
      hideElement: false,
      timer: null,
      // 底部按钮
      bottomBtns: [],
      bgImg: '', // 背景图
      bgColor: '', // 背景颜色
      showRule: false, // 是否有活动说明
      // #ifdef MP-WEIXIN
      showRecord: false, // 领奖记录入口
      // #endif
      isShowFullRule: false, // 是否显示活动说明
      isShowBottomBtns: true, // 是否显示底部按钮

      isCanClickAward: true, // 是否可以点击领奖
      isAutoJump: false, // 是否领奖后自动跳转
      autoJumpInfo: {}, // 自动跳转信息
      isShowAwardTipsDialog: false, // 是否开启奖品领取提示且待领取奖品数量大于0
      isShowUnclaimedIcon: true, // 是否显示奖品领取图标
      isShowUnclaimedDialog: false, // 是否显示奖品领取提示弹窗
      awardForWaitList: [], // 奖品领取提示弹窗列表
      unclaimedIcon: staticURL(true) + 'scan/unclaimed-icon.png', // 奖品领取提示图标

      isShowStartPage: false, // 是否显示启动页
      startPageBgImg: '', // 启动页背景图
      startPageTime: 3, // 启动页倒计时时间
      startPageTitle: '', // 启动页标题

      isShowPrizeList: false, // 是否显示中奖名单
      rankList: [], // 中奖名单列表
      codeData: {},
      autoJumped: false
    }
  },
  computed: {
    isCustom() {
      // 是否定制样式
      return specialRegisterStyle.includes(this.options?.m)
    },
    winningPagetheme() {
      // 中奖弹窗主题
      return this.contentJson?.WinningPage?.theme || 1
    },
    customStyle() {
      let obj = {
        rule: '',
        winstyle: {
          itemBg: '',
          btnBg: ''
        }
      }
      // 定制样式
      if (this.isCustom) {
        let s = []
        s.push(`color: #fff`)
        s.push(`background-image: linear-gradient(to right, #026dcc, #01a2ef, #1b67b2)`)
        obj.rule = s.join(';')
        if (this.winningPagetheme === 1) {
          obj.winstyle.itemBg = staticURL(true) + 'scan/win-item-bj-bg.png'
          obj.winstyle.btnBg = staticURL(true) + 'scan/win-btn-bj.png'
        }
      }
      return obj
    },
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `${44 + this.statusBarHeight}px`
      /* #endif */
      return style
    },
    bgTop() {
      // 顶部适配
      let style = ''
      /* #ifdef H5 */
      style = `${42 + this.statusBarHeight}px`
      /* #endif */
      return style
    },
    rulesTop() {
      let style = ''
      /* #ifdef H5 */
      style = `30rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 10rpx)`
      /* #endif */
      return style
    }
  },
  watch: {
    contentJson(val) {
      let data = val
      /* #ifdef H5 */
      this.codeData = {
        memberlogin: getQuery('m'),
        code: this.fwCode,
        codesegment: this.codesegment,
        codebatch: this.codebatch,
        fcdealerid: getQuery('fcdealerid')
      }
      this.loading = false
      /* #endif */
      /* #ifdef MP-WEIXIN */
      this.codeData = {
        code: this.code,
        codesegment: this.codesegment,
        codebatch: this.codebatch,
        memberlogin: this.options.m,
        fcdealerid: this.options.fcdealerid
      }

      // 配置自动调整,只有门店小程序模版有
      if (data.StartPage && data.StartPage.isScanAutoJump && data.StartPage?.jumpInfo?.Link && !this.autoJumped) {
        this.autoJumped = true
        const jumpInfo = data.StartPage?.jumpInfo
        const { Appid, SceneType } = jumpInfo
        const c = this.$toLowerKey(getExtConfig())
        const canDrop = !Appid || Appid === c.appid
        // 判断path的连接符，如果path有?则需要加上&，否则需要加上?
        const join = jumpInfo.Link?.includes('?') ? '&' : '?'
        jumpInfo.Link = `${jumpInfo.Link}${join}fromtype=scan`
        /* #ifdef MP-RETAIL */
        this.handleOpenLink({ ...jumpInfo, isReLanuch: true })
        /* #endif */
        /* #ifndef MP-RETAIL */
        if (!SceneType && canDrop) {
          this.handleOpenLink({ ...jumpInfo, isReLanuch: true })
        }
        /* #endif */
        setTimeout(() => {
          this.loading = false
        }, 3000)
      } else {
        this.loading = false
      }
      /* #endif */
      console.log('data', data)

      if (data) {
        // 根据扫码的不同状态取值
        // 扫码页处理
        this.isScanPage = false
        // 非店老板
        if (this.options.isboss) {
          // 非导购员
          /* #ifdef H5 */
          this.isStartWxLocation = false
          if (this.wxConfig) {
            this.initWXConfig(this.wxConfig)
          }
          /* #endif */
          this.getMpInfo().then(() => {
            /* #ifdef H5 */
            // if (this.wxConfig) {
            //   this.initWXConfig(this.wxConfig)
            // }
            /* #endif */
          })
          this.handleComponents(data.NotStorePage.page)
        } else {
          this.isScanPage = true
          // if (this.wxConfig) {
          //   this.initWXConfig(this.wxConfig)
          // }
          this.getMpInfo().then(() => {
            /* #ifdef H5 */
            if (this.wxConfig) {
              this.initWXConfig(this.wxConfig)
            }
            /* #endif */
          })
          // 处理启动页
          this.startPageBgImg = data.StartPage?.StartPageImg
          this.startPageTime = data.StartPage?.PollingTime ?? 0
          this.isShowStartPage = data.StartPage?.StartPage
          // 写入扫码页处理回调，封面打开时，暂停页面渲染（如背景音乐那些）
          this.handleComponentsCallback = () => this.handleComponents(data.ScanPage.page)
          const callback = this.isShowStartPage
            ? () => setTimeout(this.endCoverCallFn, this.startPageTime * 1000)
            : this.handleComponentsCallback
          callback()
        }
      }
    }
  },

  created() {
    /**
     * 是否有后续页面，允许返回
     */
    const currentPages = getCurrentPages()
    this.showBack = currentPages.length > 1
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  onHide() {
    /* #ifdef MP-WEIXIN */
    if (this.isAutoJump) {
      this.$refs.winDialog.clearAutoJumpPage()
    }
    /* #endif */
  },
  onUnload() {
    // uni.offAccelerometerChange()
  },
  onReachBottom() {
    uni.$emit('onReachBottom')
  },
  onPageScroll() {
    clearTimeout(this.timer)
    this.hideElement = true
    this.timer = setTimeout(() => {
      this.hideElement = false
    }, 500)
  },

  methods: {
    handleComponents(components) {
      this.components = []
      let dataList = []

      for (let item of components || []) {
        if (item.code === 'PageSetting') {
          const data = item.data ? JSON.parse(item.data) : {}
          this.title = data.Title
          this.bgcolor = data.BgColor
          this.bgUrl = data.bgUrl
          this.textcolor = data.FrontColor
          this.pageBgColor = typeof data.PageBgColor === 'undefined' ? '#fff' : data.PageBgColor
          this.showRule = data.showRule
          // #ifdef MP-WEIXIN
          this.showRecord = data.showRecord
          // #endif
          this.isShowBottomBtns = data.isShowBottomBtns && data.bottomBtns && data.bottomBtns.length
          this.bottomBtns = (data.bottomBtns || []).map(item => ({ ...item, bottomBtnJumpWxHtml: '' }))
          this.bottomBtns.forEach(item => {
            if (item.sceneType === 'retailassistant' || item.sceneType === 'retailspecial') {
              // 扫码奖品路径，自动带上当前活动id跳转
              if (item.link.indexOf('scans/record/index') !== -1) {
                item.link = item.link + this.activityId
              }
            }
          })
          /* #ifdef H5 */
          this.setTitle()
          /* #endif */
        } else {
          item.data = item.data ? JSON.parse(item.data) : {}
          if (item.data) dataList.push(item)
        }
      }
      this.components = JSON.parse(JSON.stringify(dataList))
    },

    // 点击领奖
    handleAward() {
      if (this.isErrorDefalutModel) {
        this.openDialog(`此码没有参与活动!（${this.code}）`)
        return
      }
      this.isCanClickAward = true
      // 已经被领奖
      if (this.isGetPrize) {
        this.getAwardPageInfo()
      } else {
        this.sumbitAwardApply()
      }
    },
    // 点击活动规则
    handleClickRule() {
      this.isShowFullRule = true
    },
    // #ifdef MP-WEIXIN
    handleClickRecord() {
      /* #ifdef MP-RETAIL */
      uni.navigateTo({
        url: `/scans/prize/list`
      })
      /* #endif */
      /* #ifndef MP-RETAIL */
      uni.navigateTo({
        url: `/personal/prize/list`
      })
      /* #endif */

    },
    // #endif
    // 点击底部按钮
    async handleClickBottomBtn(item) {
      /* #ifdef H5 */
      // 跳转H5
      if (item.jumpType === 'h5') {
        location.href = item.link
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (item.jumpType === 'mp') {
        await navigateToMP({
          appId: item.appid,
          path: item.link,
          scene: item.sceneType
        })
      }
      /* #endif */
    },
    openDialog(content) {
      this.$refs.Dialog &&
        this.$refs.Dialog.open({
          content,
          btns: [
            {
              text: '我知道了'
            }
          ]
        })
    },
    /* #ifdef MP-WEIXIN */
    // 实物奖品打开弹框
    openReceive() {
      this.$refs.ReceiveDialog.open(this.prizeInfo)
    },
    // 参与机会二维码弹窗
    handleOpenQrcode() {
      this.generateQr({ text: this.prizeInfo.DrawCenterUrl })
    },
    /* #endif */
    /* #ifdef H5 */
    // 微信配置ready状态时执行
    handleWxConfigReadyCallback() {
      this.bottomBtns.forEach(item => {
        this.initWxOpenLaunchWeappHtml(item)
      })
    },
    // 初始化H5跳小程序标签代码
    initWxOpenLaunchWeappHtml(item) {
      // 小程序
      if (item.sceneType !== '') {
        item.appid = this.mpMap[item.sceneType] || item.appid
      }
      let imgSrc = item.imageUrl?.startsWith('//') ? 'https:' + item.imageUrl : item.imageUrl
      let path = formatPath({ path: item.link, scene: item.sceneType })
      const w = uni.upx2px(330)
      const h = uni.upx2px(88)
      item.bottomBtnJumpWxHtml = `<wx-open-launch-weapp id="launch-btn" appid="${item.appid}" path="${path}">
        <template>
          <style>
            .img {
              width: ${w}px;
              height: ${h}px;
            }
          </style>
          <img class="img" src="${imgSrc}" alt="">
        </template>
      </wx-open-launch-weapp>`
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
