<template>
  <view>
    <view class="ssq-container" :style="{ backgroundColor: bgColor }" @click.once="handlePlayBgm">
      <!-- #ifdef MP-WEIXIN -->
      <title-bar :textcolor="textcolor" :title="title" type="custom" :is-show-inform="false" show-nav-title />
      <!-- #endif -->

      <image class="bg-img" mode="widthFix" :src="bgImg" @click="handleAward" />
      <image class="rule-img" mode="widthFix" :src="ruleImg" @click="handleClickRule" />
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

      <!-- 中奖名单 -->
      <view v-if="isShowPrizeList" class="rank-list">
        <rank-list :position="showPrizeListPosition" :list="rankList" />
      </view>

      <view v-for="(item, index) in controlNameList" :key="index" class="modular">
        <!-- 奖项内容 -->
        <view v-if="item === 'ActivityPrizeModular' && isShowPrizeModular">
          <prize-list :prize-title-img="prizeTitleImg" :font-color="prizeFontColor" :prize-list="prizeList" />
        </view>
        <!-- 图片广告 -->
        <view v-if="item === 'ImageAdsModular' && isShowAdModular">
          <ad-swiper :list="adList" />
        </view>
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

      <!-- 摇签动画 -->
      <view v-if="isStartGame" class="skewer-container">
        <view class="mask" />
        <image
          class="light-bg"
          style="width: 700rpx; height: 700rpx"
          mode="scaleToFill"
          :src="PACKAGE_STATIC_URL + 'scan/light-bg-img.png'"
        />
        <!-- #ifdef MP-WEIXIN -->
        <image class="skewer-img" style="width: 160rpx; height: 100%" mode="widthFix" :src="randomSkewerImg" />
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <image class="skewer-img" style="width: 160rpx; height: 100%" mode="aspectFit" :src="randomSkewerImg" />
        <!-- #endif -->
      </view>

      <!-- 中奖弹窗 -->
      <win-dialog
        ref="winDialog"
        :is-show.sync="isShowWinDialog"
        :is-frist-award="isFristAward"
        :is-auto-jump="isAutoJump"
        :auto-jump-info="autoJumpInfo"
        :prize-info.sync="prizeInfo"
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
      <auth-button v-if="needAuth" ref="authTpl" :mode="2" @success="handleAward()" />
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
import WinDialog from '../components/win-dialog'
import NowinDialog from '../components/nowin-dialog'
import UnclaimedDialog from '../components/unclaimed-dialog'
import FollowWorkwx from '../components/follow-workwx'
import FollowGzh from '../components/follow-gzh'
import CollectDialog from 'packages/components/scan/collect-dialog'
import UnlockDialog from '../components/unlock-dialog'
import UnlockListDialog from '../components/unlock-list-dialog'
import NoUnlockListDialog from '../components/no-unlock-list-dialog'
import CodeDialog from '../components/code-dialog'
import RankList from '../../components/rank-list'
import PrizeList from '../components/prize-list'
import AdSwiper from 'packages/components/ad-swiper/ad-swiper'
export default {
  components: {
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
    RankList,
    PrizeList,
    AdSwiper,
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
      isHidePage: false, // 是否隐藏页面
      bgImg: '', // 背景图
      bgColor: '', // 背景颜色
      ruleImg: '', // 活动说明图
      isShowFullRule: false, // 是否显示活动说明
      isShark: false, // 是否在摇一摇中
      isShowBgm: false, // 是否显示背景音乐
      isPlayBgm: false, // 是否播放背景音乐
      bgmLink: '', // 背景音乐链接
      innerAudioContext: null, // 音频上下文
      controlNameList: [], // 功能模块设置顺序数组
      isShowPrizeModular: true, // 是否显示奖项内容模块
      prizeTitleImg: '', // 奖项内容标题图片
      isShowAdModular: false, // 是否显示图片广告
      adList: [], // 图片广告列表
      showPrizeListPosition: 0, // 中奖名单显示位置 0：左侧 1：中间
      isShowPrizeList: false, // 是否显示中奖名单
      rankList: [], // 中奖名单列表
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
      shakeAudio: staticURL(true) + 'scan/shake-audio.mp3', // 摇签音频
      skewerImgUrlList: [], // 摇签图片列表
      randomSkewerImg: '', // 随机摇签图片
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
      startPageTitle: '' // 启动页标题
      /* #endif */
    }
  },
  watch: {
    contentJson(val) {
      if (val) {
        let contentJson = this.contentJson
        this.bgImg = contentJson.BackgImgPath
        this.bgColor = '#' + contentJson.BgColor
        this.ruleImg = contentJson.SkewerBuilkImg.ActivityRemarkImgUrl
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
        this.controlNameList = contentJson.ControlNameList
        this.isShowPrizeModular = contentJson.ActivityPrizeModular.IsShow === 1
        this.prizeTitleImg = contentJson.ActivityPrizeModular.HeaderImgPath
        this.prizeFontColor = '#' + contentJson.ActivityPrizeModular.TitleFontColor
        this.isShowAdModular = contentJson.ImageAdsModular.IsShow === 1
        this.adList = contentJson.ImageAdsModular.ImgAdList
        this.isShowBgm = contentJson.isShowBgAudio === 1
        this.bgmLink =
          (contentJson.changeBgAudioPath.startsWith('//')
            ? 'https:' + contentJson.changeBgAudioPath
            : contentJson.changeBgAudioPath) || contentJson.defaultBgAudioPath
        this.isShowPrizeList = contentJson.IsShowPrizeList === 1
        this.skewerImgUrlList.push(contentJson.SkewerBuilkImg.SkewerImgUrl1)
        this.skewerImgUrlList.push(contentJson.SkewerBuilkImg.SkewerImgUrl2)
        this.skewerImgUrlList.push(contentJson.SkewerBuilkImg.SkewerImgUrl3)
        contentJson.SkewerBuilkImg.SkewerImgUrl4 && this.skewerImgUrlList.push(contentJson.SkewerBuilkImg.SkewerImgUrl4)
        contentJson.SkewerBuilkImg.SkewerImgUrl5 && this.skewerImgUrlList.push(contentJson.SkewerBuilkImg.SkewerImgUrl5)
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
  onLoad(options) {
    this.bindshake()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif

    this.isHidePage = false
    if (this.isShowBgm && this.innerAudioContext) {
      this.innerAudioContext.play()
    }
  },
  onHide() {
    this.isHidePage = true
    if (this.isShowBgm && this.innerAudioContext) {
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
    uni.offAccelerometerChange()
  },
  methods: {
    bindshake() {
      /* #ifdef H5 */
      if (window.DeviceMotionEvent) {
        //iOS 13+ 需要授权
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          uni.showModal({
            title: '提示',
            content:
              '亲，基于您的手机系统权限控制要求严格，需要您授权同意方可参与，请关闭该弹窗后在授权请求框中选择“允许”~',
            success: res => {
              if (res.confirm) {
                DeviceMotionEvent.requestPermission()
                  .then(state => {
                    if (state === 'granted') {
                      window.addEventListener(
                        'devicemotion',
                        uni.onAccelerometerChange(this.onAccelerometerChange),
                        false
                      )
                    } else {
                      alert('apply permission state: ' + state)
                    }
                  })
                  .catch(function (err) {
                    alert('error: ' + err)
                  })
              } else if (res.cancel) {
                this.$msg('亲，由于您未同意授权，无法进行游戏，请重新启动微信后重试～')
              }
            }
          })
        } else {
          // 监听摇一摇事件
          uni.onAccelerometerChange(this.onAccelerometerChange)
        }
      } else {
        uni.onAccelerometerChange(this.onAccelerometerChange)
        // this.$msg('抱歉，您的手机不支持摇一摇')
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.onAccelerometerChange(this.onAccelerometerChange)
      /* #endif */
    },
    // 点击领奖
    handleAward() {
      this.startGame()
    },
    // 开始摇签
    startGame() {
      if (!this.isCanClickAward) return
      this.isCanClickAward = false
      this.randomSkewerImg = this.skewerImgUrlList[parseInt(this.skewerImgUrlList.length * Math.random())]
      let innerAudioContext = uni.createInnerAudioContext()
      innerAudioContext.src = this.shakeAudio
      /* #ifdef H5 */
      if (uni.getSystemInfoSync().platform === 'ios') {
        // eslint-disable-next-line no-undef
        // WeixinJSBridge.invoke('getNetworkType', {}, e => {
        //   innerAudioContext.play()
        // })
        this.$wechat.ready(() => {
          this.$wechat.getNetworkType({
            success: () => {
              innerAudioContext.play()
            }
          })
        })
      } else {
        innerAudioContext.play()
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      innerAudioContext.play()
      /* #endif */
      setTimeout(() => {
        this.isStartGame = true
      }, 1000)
      setTimeout(() => {
        this.isStartGame = false
        this.isCanClickAward = true
        // 已经被领奖
        if (this.isGetPrize) {
          this.getAwardPageInfo()
        } else {
          this.sumbitAwardApply()
        }
      }, 4000)
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
        // WeixinJSBridge.invoke('getNetworkType', {}, e => {
        //   this.innerAudioContext.play()
        // })
        this.$wechat.ready(() => {
          this.$wechat.getNetworkType({
            success: () => {
              this.innerAudioContext.play()
            }
          })
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
    // 加速度变化回调
    async onAccelerometerChange(acceleration) {
      // 有弹窗没关闭禁止摇一摇
      if (
        this.isHidePage ||
        this.isShowStartPage ||
        this.isShowWinDialog ||
        this.isShowNowinDialog ||
        this.isShowFullRule ||
        this.codeVisible ||
        this.isShowGzhDialog ||
        this.isShowWorkwxDialog ||
        this.isShowUnclaimedDialog ||
        this.unlockListVisible ||
        this.noUnlockListVisible ||
        this.unlockVisible
      ) {
        return
      }
      let x = acceleration.x // 获取x轴数值
      let y = acceleration.y // 获取y轴数值
      let z = acceleration.z // 获取z轴数值
      let isMeetCondition = false
      /* #ifdef H5 */
      isMeetCondition = x > 50 || y > 50 || z > 50
      /* #endif */
      /* #ifdef MP-WEIXIN */
      isMeetCondition = x > 1 || y > 1 || z > 1
      /* #endif */
      if (!this.isShark && isMeetCondition) {
        // 新用户弹窗验证
        /* #ifdef MP-WEIXIN */
        if (this.needAuth) {
          await this.$refs.authTpl.handleLogin()
        }
        /* #endif */
        console.log('摇一摇x, y, z数据：', acceleration)
        this.isShark = true
        uni.stopAccelerometer()
        uni.vibrateLong()
        this.startGame()
        setTimeout(() => {
          uni.startAccelerometer()
          this.isShark = false
        }, 3000)
      }
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
image {
  will-change: transform;
}
.ssq-container {
  position: relative;
  width: 100vw;
  min-height: 100vh;

  .bg-img {
    width: 100%;
    height: 1305rpx;
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
