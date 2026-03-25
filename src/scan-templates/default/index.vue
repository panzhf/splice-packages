<template>
  <view>
    <view v-if="bgImg" class="default-container">
      <image :src="bgImg" mode="widthFix" class="bg" />
      <title-bar :textcolor="textcolor" :title="title" type="detail" :is-show-inform="false" show-nav-title />
      <image
        v-if="IsShowDesc"
        mode="widthFix"
        class="desc"
        :style="{ top: menuButtonInfo.bottom + 19 + 'px' }"
        :src="descImg"
        @click="handleClickDesc"
      />
      <image
        v-if="awardBtnImg"
        mode="widthFix"
        class="award-btn"
        :style="{ bottom: awardBtnBottom + 'rpx' }"
        :src="awardBtnImg"
        @click="sumbitAwardApply()"
      />

      <save-qr ref="saveQr" z-index="30000" />
      <canvas class="canvas-code" canvas-id="myCanvas" />
      <!-- 活动说明 -->
      <full-rule :is-show.sync="isShowDescDialog" :rule-info="ruleInfo" />
      <!-- 完善信息 -->
      <collect-dialog
        :is-show.sync="isShowCollectDialog"
        :info-config="infoConfig"
        :mode="currentCollectMode"
        @collect="saveRegisterAward"
        @success="sumbitAwardApply(false)"
      />
      <!-- 奖励提示 -->
      <tips-dialog :is-show.sync="tipsDialogVisible" :info="tipsInfo" />
      <!-- 扫码有礼提示 -->
      <jackpot-dialog
        ref="jackpotDialog"
        :is-show.sync="jackpotVisible"
        :info.sync="jackpotInfo"
        :is-frist="activity.isFrist"
        :is-auto-jump="isAutoJump"
        :activity-id="activity.id"
        :auto-jump-info="autoJumpInfo"
        @register="handleRegisterAward"
        @open="openReceive"
        @qrcode="handleOpenQrcode"
      />
      <!-- 解锁成功 -->
      <unlock-dialog :is-show.sync="unlockVisible" :info="unlockAmount" :award-id="unlockHbid" :hbtype="unlockHbtype" />
      <!-- 待解锁红包列表 -->
      <unlock-list-dialog :is-show.sync="unlockListVisible" :info="unlockCouponList" @choose="chooseUnlock" />
      <!-- 验证码 -->
      <!-- 验证码 -->
      <code-dialog
        :is-show.sync="codeVisible"
        :tips="verifyCodeTips"
        :is-show-close="isShowVerifyCodeCloseIcon"
        @judge="handleJudgeValidVerifyCode"
      />
      <Dialog ref="Dialog" :info="jackpotInfo" />
      <!-- 实物奖品弹框 -->
      <receive-dialog ref="ReceiveDialog" />
      <!-- 添加企微活码 -->
      <follow-workwx :is-show.sync="isShowWorkwxDialog" :activity-qr-code="activityQrCode" />
      <!-- 关注公众号 -->
      <follow-gzh :is-show.sync="isShowGzhDialog" :qr-code="gzhQrCode" />
      <!-- #ifdef MP-WEIXIN -->
      <auth-button v-if="needAuth" :mode="2" @success="sumbitAwardApply()" />
      <!-- #endif -->
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiMiniSaoMaInfo,
  apiSumbitawardApply,
  apiAwardpageInfo,
  apiMiniSetSaomarecordwxLocation,
  apiMiniAwardreSultn,
  apiCouponUnlockResult,
  apiGetCouponRecord,
  apiCouponUnlock,
  apiJudgeValidVerifyCode,
  apiGetIsRegisterInfo
} from '../../api/scan'

import { getLocation } from '../../utils/getLocation'
import FullRule from '../components/full-rule'
import CollectDialog from 'packages/components/scan/collect-dialog'
import TipsDialog from './components/tips-dialog'
import JackpotDialog from './components/jackpot-dialog'
import ReceiveDialog from '../components/receive-dialog'
import UnlockDialog from '../components/unlock-dialog'
import UnlockListDialog from '../components/unlock-list-dialog'
import CodeDialog from '../components/code-dialog'
import TitleBar from '../components/title-bar'
import Dialog from '../components/dialog'
import FollowWorkwx from '../components/follow-workwx'
import FollowGzh from '../components/follow-gzh'
import generateQrMixin from '@/mixins/generate-qr'
/* #ifdef MP-WEIXIN */
import { mapState } from 'vuex'
/* #endif */
export default {
  name: 'DefaultTemp',
  components: {
    FullRule,
    CollectDialog,
    TipsDialog,
    JackpotDialog,
    UnlockDialog,
    UnlockListDialog,
    CodeDialog,
    TitleBar,
    Dialog,
    ReceiveDialog,
    FollowWorkwx,
    FollowGzh
  },
  mixins: [generateQrMixin],
  data() {
    return {
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      isShowDescDialog: false,
      tipsDialogVisible: false,
      jackpotVisible: false,
      isShowCollectDialog: false,
      bgImg: '', // 背景图
      descImg: '', // 活动说明图
      awardBtnImg: '', // 领奖图
      // bgImg: 'https://stati.t.miduonet.com/images/mini-default-bg.jpg', // 背景图
      // descImg: 'https://stati.t.miduonet.com/images/desc.png', // 活动说明图
      // awardBtnImg: 'https://stati.t.miduonet.com/images/award-btn.png', // 领奖图
      menuButtonInfo: uni.getMenuButtonBoundingClientRect(), // 小程序胶囊信息
      options: {},
      IsShowDesc: 1, //是否显示活动说明
      title: '',
      textcolor: '#000',
      ecodeid: '',
      activity: {
        id: 0, // 活动id
        type: 0, // 码类型
        code: '', // 原始码
        codeId: 0, // 扫码记录ID
        ecodeId: 0, // 扫码记录加密ID
        ctxId: 0, // 扫码标识
        isFrist: 0, // 是否首次领奖
        AwardId: 0, // 奖项ID
        status: 0,
        location: {
          isGet: false,
          isAuth: true,
          isEnable: true,
          isNeed: false
        },
        isFirstPlay: false,
        statusTxt: '',
        loop: {
          // 轮询设置
          pollingWaitSeconds: 700,
          totalSeconds: 700
        }
      },
      /* 红包券 开始 */
      unlockVisible: false,
      unlockListVisible: false,
      isOpenCoupon: 0, // 是否开启解锁红包
      unlockAmount: 0, // 单个红包解锁金额
      unlockHbtype: 0, // 单个红包解锁类型
      unlockHbid: 0, //解锁红包id
      unlockCouponList: [], // 待解锁红包列表
      /* 红包券 结束 */
      tipsInfo: {
        state: 1,
        tips: ''
      },
      jackpotInfo: {},
      infoConfig: {},
      pageConfig: {},
      isShowWorkwxDialog: false, // 是否显示添加企微活码弹窗
      activityQrCode: '', // 企微活码链接
      isShowGzhDialog: false, // 是否显示添加公众号弹窗
      gzhQrCode: '', // 公众号链接
      isAutoJump: false, // 是否领奖后自动跳转
      autoJumpInfo: {}, // 自动跳转信息
      isNeedVerifyCode: false, // 是否需要验证码领奖
      codeVisible: false, // 是否显示验证码领奖
      isShowVerifyCodeCloseIcon: true, // 是否显示验证码弹窗关闭按钮
      verifyCodeTips: '', // 验证码领奖提示
      verifyCode: '', // 验证码
      currentCollectMode: 0
    }
  },
  computed: {
    // 领奖图底部距离计算
    awardBtnBottom() {
      const SYSTEMINFO = uni.getSystemInfoSync()
      // 高宽比
      const proportion = SYSTEMINFO.screenHeight / SYSTEMINFO.screenWidth
      if (proportion < 1.9) {
        return 0
      }
      return proportion > 2.1 ? 140 * proportion : 100 * proportion
    },
    ruleInfo() {
      const { activetitle: activityTitle, activetime = '', rulecontent: ruleContent } = this.pageConfig
      const [startTime, endTime] = activetime.split('至')
      return {
        activityTitle,
        startTime,
        endTime,
        ruleContent
      }
    },
    // #ifdef MP-WEIXIN
    ...mapState('scanAuth', ['needAuth'])
    // #endif
  },
  onLoad(options) {
    this.options = options
    this.getDetail()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  onUnload() {
    /* #ifdef MP-WEIXIN */
    if (this.isAutoJump) {
      this.$refs.jackpotDialog.clearAutoJumpPage()
    }
    /* #endif */
  },
  onHide() {
    /* #ifdef MP-WEIXIN */
    if (this.isAutoJump) {
      this.$refs.jackpotDialog.clearAutoJumpPage()
    }
    /* #endif */
  },
  methods: {
    async handleRegisterAward() {
      let params = {}
      let data = {}
      params = {
        code: this.options.code,
        memberlogin: this.options.m
      }
      data = await apiGetIsRegisterInfo({
        ...params,
        activityid: this.activity.id
      })
      const collectConfig = data?.return_data || {}
      if (collectConfig.IsRegister && !collectConfig.isRegistered) {
        this.isShowCollectDialog = true
        this.currentCollectMode = 1
        this.infoConfig = collectConfig
        this.infoConfig.prizeid = this.activity.AwardId
        this.infoConfig.activityid = this.activity.id
        this.infoConfig.codeid = this.options.codeID
      } else {
        this.saveRegisterAward()
      }
    },
    async saveRegisterAward() {
      this.$refs.jackpotDialog?.handleReceive?.(true, true)
    },
    async getDetail() {
      let res = await apiMiniSaoMaInfo({
        Type: this.options.type,
        CodeId: this.options.codeID,
        Code: this.options.code,
        OpenIdN: '',
        EActivityID: this.options.EActivityID
      })
      if (this.$ck(res)) {
        let contentjson = JSON.parse(res.return_data.contentjson)
        let otherPageSetJson = JSON.parse(res.return_data.otherpagesetjson)
        this.descImg = contentjson.DescImg
        this.bgImg = contentjson.BgImg
        this.awardBtnImg = contentjson.AwardImg
        this.IsShowDesc = contentjson.IsShowDesc
        this.title = contentjson.Title
        this.textcolor = contentjson.TitleColor === 1 ? '#000' : '#fff'
        this.pageConfig = res.return_data
        // 策略
        const returnData = res.return_data
        // #ifdef MP-WEIXIN
        this.$store.commit('scanAuth/setNeedAuth', !!returnData.gleannickname)
        // #endif
        this.activity.ecodeId = returnData.ecodeid
        this.activity.id = returnData.activityid
        this.activity.codeId = returnData.codeid
        this.activity.code = returnData.code
        this.isOpenCoupon = returnData.isopencoupon
        this.activity.location.isEnable = returnData.isstartwxlocation // 是否开启获取地理位置
        this.activity.location.isNeed = returnData.isstartwxlocation && returnData.islimitarea // 是否强制获取地理位置
        this.isNeedVerifyCode = returnData.isneedverifycode
        this.verifyCodeTips = returnData.verifycodetips
        // 领奖后自动跳转统一处理
        this.isAutoJump = otherPageSetJson.SaoMaResultAutoJumpPage?.IsSaoMaResultAutoJumpPage === 1
        this.autoJumpInfo.SaoMaResultAutoJumpPageText =
          otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPageText
        this.autoJumpInfo.SaoMaResultAutoJumpPageTime =
          otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPageTime
        this.autoJumpInfo.SaoMaResultAutoJumpPagePathSetting =
          otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPagePathSetting

        if (this.activity.location.isNeed) {
          // 强制获取地理位置
          uni.getSetting({
            success: res => {
              // 未受过权为undefined
              this.activity.location.isAuth =
                typeof res.authSetting['scope.userLocation'] === 'undefined' || res.authSetting['scope.userLocation'] // 是否授权过地理位置
            }
          })
        }
        // 是否开启待解锁红包券
        if (this.isOpenCoupon) {
          // 是否验证码领奖
          if (this.isNeedVerifyCode) {
            this.isShowVerifyCodeCloseIcon = false
            this.codeVisible = true
          } else {
            this.initCoupon()
          }
        }
      }
    },
    // 点击活动说明
    handleClickDesc() {
      this.isShowDescDialog = true
    },
    handleJudgeValidVerifyCode(code) {
      let params = {
        VerifyCode: code,
        code: this.activity.code
      }
      apiJudgeValidVerifyCode(params)
        .then(res => {
          this.busy = false
          if (res.return_code === 0 || res.return_code === '0') {
            this.verifyCode = code
            this.codeVisible = false
            if (this.isOpenCoupon) {
              this.initCoupon()
            } else {
              this.sumbitAwardApply()
            }
          } else {
            this.$msg(res.return_msg)
          }
        })
        .catch(err => {
          this.busy = false
          this.$msg(err.return_msg)
        })
    },
    // 点击领奖
    async sumbitAwardApply(NeedInfo = true) {
      // 验证码领奖 verifyCode不为空表示校验成功了
      if (this.isNeedVerifyCode && this.verifyCode === '') {
        this.codeVisible = true
        return
      }
      if (this.busy) return
      this.busy = true
      this.$loading.show()
      const data = {
        codetype: this.options.type,
        ctxid: this.options.ctxId,
        ecodeid: this.activity.ecodeId,
        IsNeedCollectUserInfo: NeedInfo,
        isnews: this.options.isnews !== 'false',
        VerifyCode: this.verifyCode
      }
      let res = await apiSumbitawardApply(data)
      this.$loading.hide()
      this.busy = false
      if (res.return_code === 0) {
        if (res.return_data && res.return_data.AwardId > 0) {
          // 领奖成功(重复领奖)
          this.activity.AwardId = res.return_data.AwardId
          // 活动ID
          this.activity.id = res.return_data.ActivityID
          this.getAwardPageInfo({
            awardId: res.return_data.AwardId
          })
        } else if (res.return_data.IsCheckUser) {
          // 需要完善用户信息
          this.isShowCollectDialog = true
          this.infoConfig = res.return_data
        } else if (res.return_data.IsAwardByDirect === 0) {
          this.gzhQrCode = res.return_data.ActivityQrCode
          this.isShowGzhDialog = true
        } else {
          this.$loading.show('正在排队领取中')
          this.activity.isFrist = 1
          this.activity.loop.pollingWaitSeconds = 700
          this.activity.loop.totalSeconds = 700
          this.loopGetAwardId()
        }
      } else if (res.return_code === 94) {
        // 窜货不允许参与活动
        if (res.return_data && res.return_data.ParamCode === '94') {
          res.return_msg = decodeURIComponent(res.return_msg)
        }
        this.tipsInfo.state = 2
        this.tipsInfo.tips = res.return_msg
        this.tipsDialogVisible = true
      } else {
        switch (res.return_code) {
          case 208: // 添加企微领奖
            this.activityQrCode = res.return_data.ActivityQrCode
            this.isShowWorkwxDialog = true
            break
          case 101: // 未拿到经纬度
            // this.submitAwardError({
            //   code: res.return_code,
            //   msg: '亲，该活动需要获取地理位置才能参与，请在点击开奖时“允许”地理位置授权～'
            // })
            this.getCity()
            break
          case 117: // 活动参与限制
            this.submitAwardError({
              code: res.return_code,
              msg: res.return_msg,
              link: `/packages/src/scan-templates/error-page?ecode=17&msg=${res.return_msg}&pageType=-1`
            })
            break
          case 103: // 指定用户参与
            this.submitAwardError({
              code: res.return_code,
              msg: res.return_msg
            })
            break
          case 102: // 仅限区域内参与
            this.submitAwardError({
              code: res.return_code,
              msg: res.return_msg
            })
            break
          case 104: // 队列消耗慢阻止加入队列，并给出友好提示
            this.submitAwardError({
              code: res.return_code,
              msg: res.return_msg
            })
            break
          case 7:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = '查询扫码记录不存在'
            this.tipsDialogVisible = true
            break
          case 10002:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = res.return_msg
            this.tipsDialogVisible = true
            break
          case 4:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = res.return_msg
            this.tipsDialogVisible = true
            break
          case 2:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = res.return_msg
            this.tipsDialogVisible = true
            break
          case 16:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = '红包达到上线'
            this.tipsDialogVisible = true
            break
          case 96:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = '临额红包过期'
            this.tipsDialogVisible = true
            break
          case 97:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = '联盟卡券过期'
            this.tipsDialogVisible = true
            break
          case 95:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = '参与机会活动过期'
            this.tipsDialogVisible = true
            break
          case 14:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = res.return_msg
            this.tipsDialogVisible = true
            break
          case 600009: //过期了重新走一遍流程
            uni.reLaunch({
              url: `/packages/src/scan-templates/transfer?q=${this.options.code}`
            })
            break
          default:
            this.tipsInfo.state = 2
            this.tipsInfo.tips = res.return_msg
            this.tipsDialogVisible = true
        }
      }
    },
    getAwardPageInfo(data) {
      // 获取中奖详情
      apiAwardpageInfo({
        AwardID: data.awardId,
        ActivityID: this.activity.id,
        CodeID: this.activity.codeId,
        IsFrist: this.activity.isFrist
      }).then(res => {
        if (res.return_code === 0) {
          if (res.return_data.IsSelfStatus === 0) {
            // 自己
            if (res.return_data.IsWiningCode === 0) {
              // 未中奖
              this.tipsInfo.state = 2
              this.tipsInfo.tips = '很遗憾~ \n你没有获得奖励，再接再厉'
              this.tipsDialogVisible = true
            } else {
              this.jackpotInfo = { ...res.return_data, activityId: this.activity.id }
              this.jackpotVisible = true
            }
          } else {
            // 其他人
            this.tipsInfo.state = 2
            this.tipsInfo.tips = '啊哦，该码已经被扫描过啦~'
            this.tipsDialogVisible = true
          }
        } else {
          // 添加企微领奖
          if (res.return_code === 208) {
            this.activityQrCode = res.return_data.ActivityQrCode
            this.isShowWorkwxDialog = true
            return
          }
          this.$msg(res.return_msg)
        }
      })
    },
    netError() {
      this.activity.status = 0
    },
    // 未中奖
    notWin(res) {
      this.activity.isFirstPlay = this.getIsFirst() // 获取是否首次领奖
      this.stopActivityTpl()
      this.openNotWinLayer(res.data)
      if (!this.activity.isFirstPlay) {
        this.activity.statusTxt = 'self-repeat-notwin'
      }
    },
    getIsFirst() {
      return this.activity.isFrist === 1
    },
    stopActivityTpl() {
      this.activity.status = 0
    },
    /** 提交领奖申请失败 */
    submitAwardError(res) {
      if (res.link) {
        uni.navigateTo({
          url: res.link
        })
      } else {
        this.openDialog(res.msg)
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
    /** 获取定位 */
    async getCity() {
      let Location = await getLocation()
      if (!Location.latitude || !Location.longitude) {
        return this.submitAwardError({
          code: 101,
          msg: '亲，该活动需要获取地理位置才能参与，请在点击开奖时“允许”地理位置授权～'
        })
      }
      let res = await apiMiniSetSaomarecordwxLocation({
        Type: Number(this.options.type),
        codeId: this.activity.codeId,
        LatLng: `${Location.latitude},${Location.longitude}`
      })
      if (this.$ck(res, true)) {
        this.sumbitAwardApply()
      }
    },
    /** 轮训查询 */
    async loopGetAwardId() {
      if (this.activity.loop.totalSeconds > 3000 * 6) {
        this.$loading.hide()
        // 执行6次,无结果,则断开请求
        this.openDialog('活动异常，请稍后重新扫码～')
        return false
      }
      let res = await apiMiniAwardreSultn({
        Code: this.activity.code,
        ActivityID: this.activity.id
      })
      if (res.return_code === 0 || res.return_code === 3) {
        this.$loading.hide()
        // 中奖 || 未中奖（首次）
        this.activity.isFrist = 1
        this.activity.AwardId = res.return_data.AwardId
        this.getAwardPageInfo({
          awardId: res.return_data.AwardId
        })
      } else if (res.return_code === -1000 || res.return_code === -1001) {
        // 领奖中
        setTimeout(() => {
          this.activity.loop.pollingWaitSeconds += 600
          this.activity.loop.totalSeconds += 600
          if (this.activity.loop.pollingWaitSeconds > 3000) {
            this.activity.loop.pollingWaitSeconds = 3000
          }
          this.loopGetAwardId() // 继续轮询
        }, this.activity.loop.pollingWaitSeconds)
      } else {
        this.$loading.hide()
        this.openDialog('活动异常，请稍后重新扫码～')
      }
    },
    /* 红包券 开始 */
    async initCoupon() {
      try {
        this.$loading.show()
        const couponResult = await this.getCouponResult()
        this.$loading.hide()
        if (![0, 1, 2, 100].includes(couponResult.code)) {
          return this.openDialog(couponResult.msg)
        }
        this.$loading.show()
        const couponListRes = await this.getCouponList()
        this.$loading.hide()
        if (![0, 34001].includes(couponListRes.code)) {
          return this.openDialog(couponListRes.msg)
        }
        this.unlockCouponList = couponListRes.data.datalist || []
        const hasUnlockCoupon = couponListRes.data.ishascancouponunlock || false
        if (hasUnlockCoupon) {
          if (couponResult.code === 100) {
            if (this.unlockCouponList.length === 1) {
              // 自动解锁红包
              this.unlockCoupon(this.unlockCouponList[0].couponrecordid)
            } else if (this.unlockCouponList.length > 1) {
              this.unlockListVisible = true
            }
          }
        }
      } catch (error) {
        this.openDialog('网络超时，请稍后重试！')
      }
    },
    getCouponResult() {
      return new Promise(resolve => {
        apiCouponUnlockResult({
          CodeID: this.options.codeID,
          Code: this.options.code
        }).then(res => {
          resolve({
            code: res.return_code, // 100可以往下获取待解锁记录，判断待解锁红包，0该码已被解锁，1该码已经领过奖，2非首次扫码人
            data: res.return_code === 0 ? [res.return_data] : [],
            msg: res.return_msg
          })
        })
      })
    },
    getCouponList() {
      return new Promise(resolve => {
        apiGetCouponRecord({
          CodeID: this.options.codeID,
          Code: this.options.code
        }).then(res => {
          resolve({
            code: res.return_code, // 34001 无待解锁数据
            data: res.return_data || {
              ...res.return_data,
              datalist: []
            },
            msg: res.return_msg
          })
        })
      })
    },
    unlockCoupon(CouponRecordID) {
      return new Promise(resolve => {
        this.$loading.show()
        apiCouponUnlock({
          CodeID: this.options.codeID,
          Code: this.options.code,
          CouponRecordID
        }).then(res => {
          this.$loading.hide()
          if (this.$ck(res)) {
            this.unlockAmount = res.return_data.unlockamount
            this.unlockHbtype = res.return_data.hbtype
            this.unlockHbid = res.return_data.awardid
            this.unlockVisible = true
          }
          resolve({
            code: res.return_code,
            msg: res.return_msg
          })
        })
      })
    },
    async chooseUnlock(item) {
      const res = await this.unlockCoupon(item.couponrecordid)
      if (res.code === 0) {
        this.unlockListVisible = false
      }
    },
    /* 红包券 结束 */
    // 实物奖品打开弹框
    openReceive() {
      this.$refs.ReceiveDialog.open(this.jackpotInfo)
    },
    // 参与机会二维码弹窗
    handleOpenQrcode(url) {
      this.generateQr({ text: url })
    }
  }
}
</script>

<style lang="scss" scoped>
.default-container {
  width: 100vw;
  // height: 100vh;
  min-height: 100vh;
  background-size: 100%;
  .bg {
    // min-height: 100vh;
    width: 100%;
  }
  .desc {
    position: absolute;
    top: 150rpx;
    right: 0;
    width: 145rpx;
  }

  .award-btn {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 390rpx;
  }
}
.canvas-code {
  width: 150px;
  height: 150px;
  position: fixed;
  left: -999px;
}
</style>
