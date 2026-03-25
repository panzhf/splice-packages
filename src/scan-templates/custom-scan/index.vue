<template>
  <view>
    <view v-if="!loading" class="custom-scan-container flex flex-column" :style="{ backgroundColor: pageBgColor }">
      <image v-if="bgUrl" :style="{ top: bgTop }" :src="bgUrl" mode="widthFix" class="bg" />
      <!-- #ifdef MP-WEIXIN -->
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
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
          <awardsInfo v-if="item.code === 'AwardsInfo'" :awards-data="item.data" :prize-list="prizeList" />
          <writeoff-info v-if="item.code === 'WriteoffInfo'" :writeoff-data="item.data" :code-data="codeData" />
          <turntable
            v-if="item.code === 'TurnTable'"
            ref="gameRef"
            :config="item.data"
            :prize-list="prizeList"
            :activity-id="activityId"
            @handleClick="handleAward"
          />
          <!-- 防伪信息 -->
          <anti-fake-info
            v-if="item.code === 'AntiFakeInfo'"
            :is-first="scanCount === 1"
            :info="item.data"
            :code-data="codeData"
            :fw-tip="fwinfo"
          />
          <scan-qr-code v-if="item.code === 'ScanQrCode'" :info="item.data" @scanData="scanDataEvent($event, 2)" />
          <!-- 公告 -->
          <announce-notice v-if="item.code === 'AnnounceNotice'" :notice-data="item.data" />
          <!-- 视频广告 -->
          <video-adv v-if="item.code === 'VideoAd'" :video-data="item.data" />
          <!-- 魔方 -->
          <image-cube v-if="item.code === 'ImageCube'" :image-data="item.data" />
          <picture-navigation v-if="item.code === 'PictureNavigation'" :nav-data="item.data" />
          <!-- 追溯信息 -->
          <trace-info v-if="item.code === 'TraceInfo'" :info="item.data" :trace-data="scanDetailData" />
          <!-- 经销商信息组件 -->
          <dealer-info
            v-if="item.code === 'DealerInfo' && scanDealerInfoData.dealername"
            :info="item.data"
            :dealer-data="scanDealerInfoData"
          />
          <!-- 商品信息组件 -->
          <product-info
            v-if="item.code === 'ProductInfo' && fwproinfo && fwproinfo.goodsid"
            :config="item.data"
            :fw-info="fwproinfo"
          />
          <!-- 质保服务组件 -->
          <!-- #ifdef MP-WEIXIN -->
          <warranty-service
            v-if="item.code === 'WarrantyService' && fwproinfo && fwproinfo.goodsid"
            :info="item.data"
            :fw-info="fwproinfo"
            :code-id="codeId"
          />
          <!-- #endif -->
          <navigate-mp v-if="item.code === 'NavigateMp'" :mode="2" :info="item.data" :params="otherParams" />
          <nearby-store v-if="item.code === 'NearbyStore'" :info="item.data" />
        </view>
        <!-- </view> -->
      </view>

      <md-copyright color="#fff" bg-color="transparent" />

      <view v-if="showRule" class="rule-icon" mode="widthFix" :style="{ top: rulesTop }" @click="handleClickRule">
        <view class="iconfont iconbangzhu" />
        活动说明
      </view>
      <bg-music v-if="showBgAudio && pageHide" ref="bgMusic" :src="bgMusic" />

      <!-- 底部按钮 -->
      <view v-if="isShowBottomBtns" class="footer" />
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
            <div v-if="item.imageUrl && item.jumpType === 'mp'" class="bottom-btn" v-html="item.bottomBtnJumpWxHtml" />
          </view>
        </template>
      </view>
      <!-- #endif -->

      <!-- #ifdef MP-WEIXIN -->
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
        is-custom-type="customer"
        :z-index="isShowCollectDialog ? 99 : 20000"
        @register="handleRegisterAward"
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
      />

      <!-- 活动说明 -->
      <full-rule :is-show.sync="isShowFullRule" :rule-info="ruleInfo" />

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
        :mode="currentCollectMode"
        @collect="saveRegisterAward"
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
      <!-- 身份筛选弹窗 -->
      <identity-dialog :is-show.sync="identityVisible" @select="identitySelect" />

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
      <u-picker v-model="isShowDatePicker" mode="time" :z-index="20003" @confirm="handleDatePickerConfirm">
        请选择
      </u-picker>

      <!-- #endif -->
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
// 引入组件
import TitleBar from 'packages/components/title-bar/title-home.vue'

import ImageAd from 'packages/design/basic/image-ad.vue'
import TitleText from 'packages/design/basic/title-text.vue'
import blankSegmente from 'packages/design/basic/blank-segmente.vue'
import awardEntrance from 'packages/design/scan/award-entrance.vue'
import awardsInfo from 'packages/design/scan/awards-info.vue'
import turntable from 'packages/design/scan/turntable.vue'
// 添加核销组件
import writeoffInfo from 'packages/design/scan/writeoff-info.vue'
// 防伪组件
import AntiFakeInfo from 'packages/design/scan/anti-fake-info.vue'
import ScanQrCode from 'packages/design/scan/scan-qr-code.vue'
import AnnounceNotice from 'packages/design/basic/announce-notice.vue'
import ImageCube from 'packages/design/basic/image-cube.vue'
import PictureNavigation from 'packages/design/basic/picture-navigation.vue'
import VideoAdv from 'packages/design/basic/video-adv.vue'

// 追溯信息组件
import TraceInfo from 'packages/design/scan/trace-info'
// 经销商信息组件
import DealerInfo from 'packages/design/scan/dealer-info'
// 商品信息组件
import ProductInfo from 'packages/design/scan/product-info.vue'
// 质保服务组件
import WarrantyService from 'packages/design/scan/warranty-service.vue'
// 带参跳转
import NavigateMp from 'packages/design/scan/navigate-mp.vue'
import NearbyStore from 'packages/design/member/nearby-store.vue'

import StartPage from '../components/start-page'
/* #ifdef MP-WEIXIN */
import ReceiveDialog from '../components/receive-dialog'
import navigateToMP from '@/utils/navigate-mp'
import generateQrMixin from '@/mixins/generate-qr'
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

import UnclaimedDialog from '../components/unclaimed-dialog'
import FollowWorkwx from '../components/follow-workwx'
import FollowGzh from '../components/follow-gzh'
import UnlockDialog from '../components/unlock-dialog'
import UnlockListDialog from '../components/unlock-list-dialog'
import NoUnlockListDialog from '../components/no-unlock-list-dialog'
import IdentityDialog from '../components/identity-dialog'
import BgMusic from 'packages/components/bg-music'
/* #ifdef H5 */
// import { apiGetMpInfo } from 'packages/api/common'
/* #endif */
import { getQuery } from 'packages/utils/function'
export default {
  components: {
    TitleBar,
    ImageAd,
    TitleText,
    blankSegmente,
    awardEntrance,
    awardsInfo,
    writeoffInfo,
    AntiFakeInfo,
    ScanQrCode,
    AnnounceNotice,
    ImageCube,
    PictureNavigation,
    VideoAdv,
    TraceInfo,
    DealerInfo,
    ProductInfo,
    WarrantyService,
    NavigateMp,
    NearbyStore,
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
    IdentityDialog,
    turntable,
    BgMusic,
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
    generateQrMixin
    /* #endif */
  ],
  data() {
    return {
      // mpMap: {
      //   memberclub: 'wx5e946f6691f8d27e',
      //   cloudshop: 'wxb5d80c5ca26c0dce'
      // },
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
      codeData: {}
    }
  },
  computed: {
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
      style = `-30rpx`
      /* #endif */
      return style
    },
    rulesTop() {
      let style = ''
      /* #ifdef H5 */
      style = `30rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 46rpx)`
      /* #endif */
      return style
    }
  },
  watch: {
    contentJson(val) {
      let data = val
      this.loading = false
      if (data) {
        // 处理启动页
        this.startPageBgImg = data.StartPage?.StartPageImg
        this.startPageTime = data.StartPage?.PollingTime ?? 0
        this.isShowStartPage = data.StartPage?.StartPage
        // 写入扫码页处理回调，封面打开时，暂停页面渲染（如背景音乐那些）
        this.handleComponentsCallback = () => this.handleComponents(data.ScanPage)
        const callback = this.isShowStartPage
          ? () => setTimeout(this.endCoverCallFn, this.startPageTime * 1000)
          : this.handleComponentsCallback
        callback()

        /* #ifdef H5 */
        if (this.wxConfig) {
          this.initWXConfig(this.wxConfig)
        }
        /* #endif */
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
    /* #ifdef H5 */
    if (this.wxConfig && location.href !== this.currentWxConfigUrl) {
      // 扫码页如果有扫一扫，重复执行会导致config失败
      location.reload()
    }
    /* #endif */
    this.pageHide = true
  },
  onHide() {
    /* #ifdef MP-WEIXIN */
    if (this.isAutoJump) {
      this.$refs.winDialog.clearAutoJumpPage()
    }
    /* #endif */
    this.pageHide = false
  },
  onUnload() {
    // uni.offAccelerometerChange()
    if (this.bgMusic && this.showBgAudio && this.$refs.bgMusic) {
      this.$refs.bgMusic.closeMusic()
    }
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
    /* #ifdef H5 */
    // 处理按钮点击时使用
    // getMpInfo() {
    //   apiGetMpInfo({
    //     types: [0, 1] // 0-会员小程序 1-云店小程序
    //   }).then(res => {
    //     const d = this.$toLowerKey(res, true)
    //     if (this.$ck(d, false)) {
    //       this.mpMap.memberclub = d.return_data.filter(item => item.type === 0)[0].AppId
    //       this.mpMap.cloudshop = d.return_data.filter(item => item.type === 1)[0].AppId
    //     }
    //   })
    // },
    // #endif
    handleComponents(components) {
      this.components = []
      let dataList = []

      let hasWriteoffInfo = components.find(item => item.code === 'WriteoffInfo')
      let hasAntiFakeInfo = components.find(item => item.code === 'AntiFakeInfo')
      if (hasWriteoffInfo || hasAntiFakeInfo) {
        // 有核销组件去获取是否已核销，有则请求接口
        /* #ifdef H5 */
        this.codeData = {
          memberlogin: getQuery('m'),
          code: this.fwCode,
          codesegment: this.codesegment,
          codebatch: this.codebatch
        }
        /* #endif */
        /* #ifdef MP-WEIXIN */
        this.codeData = {
          code: this.code,
          codesegment: this.codesegment,
          codebatch: this.codebatch,
          memberlogin: this.options.m
        }
        /* #endif */
      }

      for (let item of components || []) {
        if (item.code === 'PageSetting') {
          const data = item.data ? JSON.parse(item.data) : {}
          this.title = data.Title
          this.bgcolor = data.BgColor
          this.bgUrl = data.bgUrl
          this.textcolor = data.FrontColor
          this.pageBgColor = typeof data.PageBgColor === 'undefined' ? '#fff' : data.PageBgColor
          this.showRule = data.showRule
          this.isShowBottomBtns = data.isShowBottomBtns && data.bottomBtns && data.bottomBtns.length
          this.bottomBtns = (data.bottomBtns || []).map(item => ({ ...item, bottomBtnJumpWxHtml: '' }))
          /* #ifdef H5 */
          this.setTitle()
          // #endif
          this.showBgAudio = data.showBgAudio
          if (data.showBgAudio) {
            this.bgMusic = data.audioUrl
          }
        } else {
          item.data = item.data ? JSON.parse(item.data) : {}
          dataList.push(item)
        }
      }
      this.components = JSON.parse(JSON.stringify(dataList))
    },

    // 点击领奖
    handleAward() {
      this.isCanClickAward = true
      // 已经被领奖
      if (this.isGetPrize) {
        this.getAwardPageInfo({
          needAnimation: false
        })
      } else {
        this.sumbitAwardApply()
      }
    },
    // 点击活动规则
    handleClickRule() {
      this.isShowFullRule = true
    },
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
      console.log('初始化wxhtml')
      // 小程序只有会员小程序
      if (item.sceneType !== '') item.appid = this.memberAppID
      let imgSrc = item.imageUrl?.startsWith('//') ? 'https:' + item.imageUrl : item.imageUrl
      // item.appid = this.mpMap[item.sceneType] || item.appid
      item.bottomBtnJumpWxHtml = `<wx-open-launch-weapp id="launch-btn" appid="${item.appid}" path="${item.link}">
        <template>
          <style>
            .img {
              width: 173px;
              height: 48px;
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
