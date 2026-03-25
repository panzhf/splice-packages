<template>
  <view>
    <view class="ball-container" :style="{ backgroundColor: bgColor }" @click.once="handlePlayBgm">
      <!-- #ifdef MP-WEIXIN -->
      <title-bar :textcolor="textcolor" :title="title" type="custom" :is-show-inform="false" show-nav-title />
      <!-- #endif -->
      <!-- 背景图 -->
      <image class="bg-img" mode="widthFix" :src="bgImg" />
      <!-- 守门员动画 -->
      <view class="role-box" :style="{ top: roleTop }">
        <view class="role">
          <image class="role-two" :src="SkewerImgUrl1" mode="heightFix" />
          <image class="role-two2" :src="SkewerImgUrl2" mode="heightFix" />
        </view>
      </view>
      <!-- 球 -->
      <view class="ball-box" :style="{ top: ballTop }">
        <image :class="['ball', isStartGame ? 'tap-ball' : '']" mode="widthFix" :src="SkewerImgUrl4" />
        <image hover-class="hover-button" class="but" mode="widthFix" :src="SkewerImgUrl3" @click="handleAward" />
      </view>
      <image class="rule-img" mode="widthFix" :src="ruleImg" :style="{ top: rolesTop }" @click="handleClickRule" />
      <view v-if="isShowBgm" class="bgm">
        <image
          v-show="isPlayBgm"
          class="audio-icon dzp-audio-on"
          :src="PACKAGE_STATIC_URL + 'scan/audio-on.png'"
          @click="handleToggleBgm"
        />
        <image
          v-show="!isPlayBgm"
          class="audio-icon dzp-audio-off"
          :src="PACKAGE_STATIC_URL + 'scan/audio-off.png'"
          @click="handleToggleBgm"
        />
      </view>

      <!-- 底部按钮 -->
      <!-- #ifdef H5 -->
      <view v-if="isShowBottomBtns" class="footer" />
      <view v-if="isShowBottomBtns" class="bottom-btns">
        <image
          v-if="isShowBottomBtn1 && bottomBtnJumpType1 === 0"
          class="bottom-btn"
          mode="widthFix"
          :src="bottomBtnImg1"
          @click="handleClickBottomBtn(1)"
        />
        <div v-if="isShowBottomBtn1 && bottomBtnJumpType1 === 1" v-html="bottomBtnJumpWxHtml1" />
        <image
          v-if="isShowBottomBtn2 && bottomBtnJumpType2 === 0"
          class="bottom-btn"
          mode="widthFix"
          :src="bottomBtnImg2"
          @click="handleClickBottomBtn(2)"
        />
        <div v-if="isShowBottomBtn2 && bottomBtnJumpType2 === 1" class="bottom-btn" v-html="bottomBtnJumpWxHtml2" />
      </view>
      <!-- #endif -->
      <!-- 中奖名单 -->
      <view v-if="isShowPrizeList" class="rank-list">
        <rank-list :position="showPrizeListPosition" :list="rankList" />
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <view v-if="isShowBottomBtns" class="footer" />
      <view v-if="isShowBottomBtns" class="bottom-btns">
        <image
          v-if="isShowBottomBtn1"
          class="bottom-btn"
          :class="isShowGuideBtn ? 'show-guide btn1' : ''"
          mode="widthFix"
          :src="bottomBtnImg1"
          @click="handleClickBottomBtn(1)"
        />
        <image
          v-if="isShowGuideBtn"
          class="guide-btn"
          mode="widthFix"
          :src="guideBtnConfig.ImgPath"
          @click="handleClickGuideBtn"
        />
        <image
          v-if="isShowBottomBtn2"
          class="bottom-btn"
          :class="isShowGuideBtn ? 'show-guide btn2' : ''"
          mode="widthFix"
          :src="bottomBtnImg2"
          @click="handleClickBottomBtn(2)"
        />
      </view>
      <!-- #endif -->

      <!-- 中奖弹窗 -->
      <win-dialog
        ref="winDialog"
        :is-show.sync="isShowWinDialog"
        :is-frist-award="isFristAward"
        :is-auto-jump="isAutoJump"
        :auto-jump-info="autoJumpInfo"
        :prize-info.sync="prizeInfo"
        :win-page="otherPageSetJson.WinPage"
        :activity-id="activityId"
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
        :is-auto-jump="isAutoJump"
        :auto-jump-info="autoJumpInfo"
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
      <unlock-dialog :is-show.sync="unlockVisible" :award-id="unlockHbid" :info="unlockAmount" :hbtype="unlockHbtype" />

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

      <!-- #ifdef H5 -->
      <!-- 启动页 -->
      <start-page
        :is-show.sync="isShowStartPage"
        :bg-img="startPageBgImg"
        :time="startPageTime"
        :title="startPageTitle"
        :old-title="title"
      />

      <!-- 日期选择 -->
      <u-picker v-model="isShowDatePicker" mode="time" @confirm="handleDatePickerConfirm">请选择</u-picker>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <auth-button v-if="needAuth" :mode="2" @success="handleAward()" />
      <!-- #endif -->
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
/* #ifdef H5 */
import StartPage from '../components/start-page'
/* #endif */
/* #ifdef MP-WEIXIN */
import TitleBar from '../components/title-bar'
import ReceiveDialog from '../components/receive-dialog'
import navigateToMP from '@/utils/navigate-mp'
import generateQrMixin from '@/mixins/generate-qr'
/* #endif */
import { staticURL } from '@/config'
import { packageStaticMixin } from 'packages/mixins/static-url'
import scanApiMixin from 'packages/mixins/scan-api'
import Dialog from '../components/dialog'
import FullRule from '../components/full-rule'
import WinDialog from '../components/ball/win-dialog'
import NowinDialog from '../components/ball/nowin-dialog'
import UnclaimedDialog from '../components/unclaimed-dialog'
import FollowWorkwx from '../components/follow-workwx'
import FollowGzh from '../components/follow-gzh'
import CollectDialog from 'packages/components/scan/collect-dialog'
import UnlockDialog from '../components/unlock-dialog'
import UnlockListDialog from '../components/unlock-list-dialog'
import NoUnlockListDialog from '../components/no-unlock-list-dialog'
import CodeDialog from '../components/code-dialog'
import RankList from '../../components/rank-list'
export default {
  components: {
    Dialog,
    RankList,
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
    TitleBar,
    ReceiveDialog,
    /* #endif */
    /* #ifdef H5 */
    StartPage
    /* #endif */
  },
  mixins: [
    packageStaticMixin,
    scanApiMixin,
    /* #ifdef MP-WEIXIN */
    generateQrMixin
    /* #endif */
  ],
  data() {
    return {
      bgImg: '', // 背景图
      // bgImg: 'https://stati.t.miduonet.com/activity-packages/ball/bg.jpg', // 背景图
      bgColor: '', // 背景颜色
      ruleImg: staticURL(true) + 'ball/rule.png', // 活动说明图
      isShowFullRule: false, // 是否显示活动说明
      isShowBgm: false, // 是否显示背景音乐
      isPlayBgm: false, // 是否播放背景音乐
      bgmLink: '', // 背景音乐链接
      innerAudioContext: null, // 音频上下文
      prizeTitleImg: '', // 奖项内容标题图片
      isShowBottomBtns: true, // 是否显示底部按钮
      isShowBottomBtn1: true, // 是否显示底部按钮
      isShowBottomBtn2: true, // 是否显示底部按钮
      bottomBtnImg1: '', // 底部按钮1图片
      bottomBtnImg2: '', // 底部按钮2图片
      bottomBtnJumpType1: 0, // 底部按钮1跳转类型（0：H5 1：小程序）
      bottomBtnJumpType2: 0, // 底部按钮2跳转类型（0：H5 1：小程序）
      bottomBtnPath1: '', // 底部按钮1H5路径或者小程序页面路径
      bottomBtnPath2: '', // 底部按钮2H5路径或者小程序页面路径
      bottomBtnAppid1: '', // 底部按钮1跳转的小程序原始ID或者小程序Appid
      bottomBtnAppid2: '', // 底部按钮2跳转的小程序原始ID或者小程序Appid
      bottomBtnJumpWxHtml1: '', // 底部按钮1跳小程序html代码
      bottomBtnJumpWxHtml2: '', // 底部按钮2跳小程序html代码
      isShowGuideBtn: false, // 是否显示底部引流按钮
      guideBtnConfig: {}, // 底部引流按钮配置
      isCanClickAward: true, // 是否可以点击领奖
      isStartGame: false, // 是否开始摇签
      skewerImgUrlList: [], // 摇签图片列表
      isAutoJump: false, // 是否领奖后自动跳转
      autoJumpInfo: {}, // 自动跳转信息
      isShowAwardTipsDialog: false, // 是否开启奖品领取提示且待领取奖品数量大于0
      isShowUnclaimedIcon: true, // 是否显示奖品领取图标
      isShowUnclaimedDialog: false, // 是否显示奖品领取提示弹窗
      awardForWaitList: [], // 奖品领取提示弹窗列表
      unclaimedIcon: staticURL(true) + 'scan/unclaimed-icon.png', // 奖品领取提示图标
      /* #ifdef H5 */
      isShowStartPage: false, // 是否显示启动页
      startPageBgImg: '', // 启动页背景图
      startPageTime: 3, // 启动页倒计时时间
      startPageTitle: '', // 启动页标题
      /* #endif */
      shakeAudio: staticURL(true) + 'ball/shoot-ball.wav', // 踢球音频
      SkewerImgUrl1: '', //守门
      SkewerImgUrl2: '', //接球
      SkewerImgUrl3: '', //按钮
      SkewerImgUrl4: '', //球
      isShowPrizeList: false, // 是否显示中奖名单
      rankList: [] // 中奖名单列表
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
    roleTop() {
      let style = ''
      /* #ifdef H5 */
      style = `660rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 610rpx)`
      /* #endif */
      return style
    },
    ballTop() {
      let style = ''
      /* #ifdef H5 */
      style = `950rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 960rpx)`
      /* #endif */
      return style
    },
    rolesTop() {
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
      if (val) {
        let contentJson = this.contentJson
        this.bgImg = contentJson.BackgImgPath
        this.bgColor = '#' + contentJson.BgColor
        this.isShowBottomBtns = contentJson.IsShowUnderBottom === 1
        this.isShowBottomBtn1 = contentJson.IsShowMyActivityBottom === 1
        this.isShowBottomBtn2 = contentJson.IsShowMyDataBottom === 1
        this.bottomBtnImg1 = contentJson.MyActivityNameBtnImg
        this.bottomBtnImg2 = contentJson.MyDataNameBtnImg
        this.bottomBtnJumpType1 = contentJson.MyActivityJumpType
        this.bottomBtnJumpType2 = contentJson.MyDataNameJumpType
        this.bottomBtnPath1 = contentJson.MyActivityPath
        this.bottomBtnPath2 = contentJson.MyDataPath
        this.bottomBtnAppid1 = contentJson.MyActivityToAppId
        this.bottomBtnAppid2 = contentJson.MyDataPathToAppId
        this.prizeTitleImg = contentJson.ActivityPrizeModular.HeaderImgPath
        this.prizeFontColor = '#' + contentJson.ActivityPrizeModular.TitleFontColor
        this.isShowBgm = contentJson.isShowBgAudio === 1
        this.SkewerImgUrl1 = contentJson.SkewerBuilkImg.SkewerImgUrl1
        this.SkewerImgUrl2 = contentJson.SkewerBuilkImg.SkewerImgUrl2
        this.SkewerImgUrl3 = contentJson.SkewerBuilkImg.SkewerImgUrl3
        this.SkewerImgUrl4 = contentJson.SkewerBuilkImg.SkewerImgUrl4
        this.bgmLink =
          (contentJson.changeBgAudioPath.startsWith('//')
            ? 'https:' + contentJson.changeBgAudioPath
            : contentJson.changeBgAudioPath) || contentJson.defaultBgAudioPath
        this.isShowPrizeList = contentJson.IsShowPrizeList === 1
        /* #ifdef H5 */
        if (this.wxConfig) {
          this.initWXConfig(this.wxConfig)
        }
        // 是否开启背景音乐且是苹果手机
        if (this.isShowBgm && uni.getSystemInfoSync().platform === 'ios') {
          this.handlePlayBgm()
        }
        /* #endif */
        /* #ifdef MP-WEIXIN */
        this.title = contentJson.Tital
        this.textcolor = '#' + contentJson.TitleColor
        this.isShowGuideBtn = contentJson.GuideBtn?.IsShow === 1
        this.guideBtnConfig = contentJson.GuideBtn?.ImgAdList[0]
        this.setTitle()
        // 是否有背景音乐
        if (this.isShowBgm) {
          this.handlePlayBgm()
        }
        /* #endif */
        // 是否展示中奖名单
        if (this.isShowPrizeList) {
          this.getActivityZJDataList()
        }
      }
    }
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif

    if (this.isShowBgm && this.innerAudioContext) {
      this.isPlayBgm = true
      this.innerAudioContext.play()
    }
  },
  onHide() {
    if (this.isShowBgm && this.innerAudioContext) {
      this.isPlayBgm = false
      this.innerAudioContext.pause()
    }
    /* #ifdef MP-WEIXIN */
    if (this.isAutoJump) {
      this.$refs.winDialog.clearCount()
    }
    /* #endif */
  },
  onUnload() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop()
      this.innerAudioContext = null
    }
    // uni.offAccelerometerChange()
  },
  methods: {
    // 点击领奖
    handleAward() {
      this.startGame()
    },
    // 开始
    startGame() {
      if (!this.isCanClickAward) return
      this.isCanClickAward = false
      this.isStartGame = true
      let innerAudioContext = uni.createInnerAudioContext()
      innerAudioContext.src = this.shakeAudio
      /* #ifdef H5 */
      if (uni.getSystemInfoSync().platform === 'ios') {
        // eslint-disable-next-line no-undef
        WeixinJSBridge.invoke('getNetworkType', {}, e => {
          innerAudioContext.play()
        })
      } else {
        innerAudioContext.play()
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      innerAudioContext.play()
      /* #endif */
      uni.vibrateShort()
      setTimeout(() => {
        this.isCanClickAward = true
        // 已经被领奖
        if (this.isGetPrize) {
          this.getAwardPageInfo()
        } else {
          this.sumbitAwardApply()
        }
      }, 2000)
    },
    // 背景音乐播放/暂停切换
    handleToggleBgm() {
      if (this.isPlayBgm) {
        this.innerAudioContext.pause()
      } else {
        this.innerAudioContext.play()
      }
      this.isPlayBgm = !this.isPlayBgm
    },
    // 播放背景音乐
    handlePlayBgm() {
      if (!this.isShowBgm) return // 未开启背景音乐
      if (this.isPlayBgm) return // 已经在播放
      this.innerAudioContext = uni.createInnerAudioContext()
      this.innerAudioContext.src = this.bgmLink
      this.innerAudioContext.loop = true
      this.innerAudioContext.obeyMuteSwitch = false
      /* #ifdef MP-WEIXIN */
      this.innerAudioContext.autoplay = true
      uni.setInnerAudioOption({
        obeyMuteSwitch: false
      })
      /* #endif */
      /* #ifdef H5 */
      if (uni.getSystemInfoSync().platform === 'ios') {
        this.innerAudioContext.autoplay = true
        // 解决苹果自动播放没声音问题
        // eslint-disable-next-line no-undef
        WeixinJSBridge.invoke('getNetworkType', {}, e => {
          this.innerAudioContext.play()
        })
      } else {
        this.innerAudioContext.play()
      }
      /* #endif */
      this.isPlayBgm = true
    },
    // 点击活动规则
    handleClickRule() {
      this.isShowFullRule = true
    },
    // 点击底部按钮
    async handleClickBottomBtn(n) {
      /* #ifdef H5 */
      // 跳转H5
      if (this['bottomBtnJumpType' + n] === 0) {
        location.href = this['bottomBtnPath' + n]
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      // 不设置默认跳我的奖品
      // if (n === 1 && this.bottomBtnAppid1 === '') {
      //   uni.navigateTo({
      //     url: '/personal/prize/list'
      //   })
      //   return
      // }
      // if (n === 2 && this.bottomBtnAppid2 === '') {
      //   uni.navigateTo({
      //     url: '/pages/me/index'
      //   })
      //   return
      // }
      // if (this['bottomBtnAppid' + n] === '') {
      //   uni.navigateTo({
      //     url: this['bottomBtnPath' + n]
      //   })
      // } else {
      //   await navigateToMP({
      //     appId: this['bottomBtnAppid' + n],
      //     path: this['bottomBtnPath' + n],
      //     onlyMp: true
      //   })
      // }
      navigateToMP({
        appId: this['bottomBtnAppid' + n],
        path: this['bottomBtnPath' + n]
      })
      /* #endif */
    },
    // 点击引流按钮
    handleClickGuideBtn() {
      const current = this.guideBtnConfig
      if (current.JumpType === 1 || current.JumpType === 2) {
        uni.navigateTo({
          url: current.JumpType === 2 ? '/' + current.Link : current.Link
        })
        return
      }
      if (current.JumpType === 3) {
        if (current.MpAppID === '') {
          navigateToMP({
            path: current.Link
          })
        } else {
          navigateToMP({
            appId: current.MpAppID,
            path: current.Link,
            onlyMp: true
          })
        }
        return
      }
      if (current.JumpType === 4) {
        navigateToMP({
          path: current.Link,
          type: 7
        })
        return
      }
    },
    openDialog(content) {
      this.$refs.Dialog.open({
        content: content,
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
      if (this.bottomBtnJumpType1 === 1) {
        this.initWxOpenLaunchWeappHtml(1)
      }
      if (this.bottomBtnJumpType2 === 1) {
        this.initWxOpenLaunchWeappHtml(2)
      }
    },
    // 初始化H5跳小程序标签代码
    initWxOpenLaunchWeappHtml(type) {
      let imgSrc = this['bottomBtnImg' + type].startsWith('//')
        ? 'https:' + this['bottomBtnImg' + type]
        : this['bottomBtnImg' + type]
      this['bottomBtnJumpWxHtml' + type] = `<wx-open-launch-weapp id="launch-btn" username="${
        this['bottomBtnAppid' + type]
      }" path="${this['bottomBtnPath' + type]}">
        <template>
          <style>
            .img {
              width: 100%;
              max-width: 140px;
              max-height: 40px;
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
// image {
//   will-change: transform;
// }
.ball-container {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  .bg-img {
    width: 100%;
    height: 1305rpx;
    position: absolute;
    left: 0;
    top: 0;
    /* #ifdef H5 */
    top: -150rpx;
    /* #endif */
  }

  .rule-img {
    position: absolute;
    right: 0;
    /* #ifdef MP-WEIXIN */
    top: 190rpx;
    /* #endif */
    /* #ifdef H5 */
    top: 70rpx;
    /* #endif */
    max-width: 150rpx;
  }
  .bgm {
    position: absolute;
    right: 20rpx;
    /* #ifdef MP-WEIXIN */
    top: 260rpx;
    /* #endif */
    /* #ifdef H5 */
    top: 140rpx;
    /* #endif */
    width: 60rpx;
    height: 60rpx;

    @keyframes audio-on-rotate {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    .dzp-audio-on {
      animation: audio-on-rotate 2s linear infinite;
    }

    .audio-icon {
      width: 60rpx;
      height: 60rpx;
    }
  }

  .modular {
    padding: 40rpx 0;
    &.modular {
      padding-bottom: 0;
    }
  }
  /* #ifdef H5 */
  .rank-list ::v-deep .bnht-rank-list {
    position: absolute !important;
    top: 828rpx !important;
    left: 38% !important;
    .prizetit {
      width: 400rpx !important;
      .icontxt {
        width: 200rpx !important;
      }
    }
  }
  /* #endif */
  .footer {
    height: 160rpx;
  }
  .bottom-btns {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 160rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 46rpx;

    .bottom-btn {
      width: 100%;
      max-width: 140px;
      max-height: 40px;

      &.show-guide {
        position: absolute;
        bottom: 58rpx;
        max-width: 210rpx;
      }

      &.btn1 {
        left: 70rpx;
      }
      &.btn2 {
        right: 70rpx;
      }
    }

    .guide-btn {
      position: absolute;
      bottom: 26rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 128rpx;
    }
  }

  .skewer-container {
    position: fixed;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: 20000;

    .mask {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.7);
    }

    .light-bg {
      position: absolute;
      top: 30%;
      z-index: 1;
      animation: light 10s linear infinite;

      @keyframes light {
        0% {
          transform: rotate(0deg) translateZ(-1200px);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        60% {
          opacity: 0;
        }
        100% {
          transform: rotate(360deg) translateZ(-1200px);
        }
      }
    }

    .skewer-img {
      position: relative;
      z-index: 100;
      animation: skewer 4s ease-in-out;

      @keyframes skewer {
        0% {
          transform: scale(0) rotateY(360deg);
        }
        50%,
        60% {
          transform: scale(1) rotateY(0deg);
        }
        100% {
          transform: scale(0) rotateY(360deg);
        }
      }
    }
  }

  .unclaimed-wrap {
    position: fixed;
    z-index: 10;
    right: 20rpx;
    top: 70%;

    .unclaimed-img {
      width: 185rpx;
    }
    .unclaimed-count {
      display: inline-block;
      position: absolute;
      top: 20rpx;
      left: 30rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40rpx;
      height: 40rpx;
      background-image: linear-gradient(#ff744f, #fb0c15);
      border: 4rpx solid #fff;
      border-radius: 50%;
      font-size: 24rpx;
      font-weight: bold;
      color: #fff;
    }
    .close-btn {
      position: absolute;
      top: -10rpx;
      right: 0;
      font-size: 33rpx;
    }

    .unclaimed-animation {
      animation: zoomAndShake 1.5s infinite ease-out;
    }

    @keyframes zoomAndShake {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      60% {
        transform: rotate(5deg);
      }
      70% {
        transform: rotate(-5deg);
      }
      80% {
        transform: rotate(5deg);
      }
      90% {
        transform: rotate(-5deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }
  }
}
.canvas-code {
  width: 150px;
  height: 150px;
  position: fixed;
  left: -999px;
}
</style>
