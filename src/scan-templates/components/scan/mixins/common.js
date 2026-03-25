import { apiGetHbState, apiGetAwardGrantState } from 'packages/api/scan'
/* #ifdef H5 */
import { apiGetCouponExplain } from 'packages/api/scan'
import { getQuery } from 'packages/utils/function'
/* #endif */
/* #ifdef MP-WEIXIN */
import { apiCouponExplain } from 'packages/api/scan'
import navigateToMP from '@/utils/navigate-mp'
import { getQuery as getQueryMp } from '@/utils'
/* #endif */
import dayjs from 'dayjs'
import { staticURL } from '@/config'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { showAdMixin, showScanImgMixin } from 'packages/scan-templates/components/scan/mixins/show-ad'
// #ifdef MP-MEMBER
import { subscribePrizeMixin, subscribePrizeJudgeMixin } from 'packages/mixins/subscribe-prize'
// #endif
export const commonMixin = {
  filters: {
    volumeType(val) {
      if (val.VolumeType === 0) {
        return '元购物券'
      } else if (val.VolumeType === 3) {
        let amount = val.PrizeVolumeCouponType === 0 ? val.PrizeVolumeAmount : val.PrizeVolumeUnlockAmount
        return `${amount}元${val.VolumeTitle}`
      } else {
        return val.VolumeTitle
      }
    }
  },
  mixins: [
    packageStaticMixin,
    showAdMixin,
    showScanImgMixin,
    // #ifdef MP-MEMBER
    subscribePrizeMixin,
    subscribePrizeJudgeMixin
    // #endif
  ],
  props: {
    zIndex: {
      type: Number,
      default: 20000
    },
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 是否首次领奖
    isFristAward: {
      type: Boolean,
      default: false
    },
    // 奖项信息
    prizeInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    customScanConfigs: {
      type: Object,
      default() {
        return {
          WinningPage: {},
          ReuseWinningPage: {}
        }
      }
    },
    // 奖项id
    activityId: {
      type: Number,
      default: 0
    },
    // 模版类型 guide store customer
    isCustomType: {
      type: String,
      default: ''
    },
    mpMap: {
      type: Object,
      default: () => {}
    },
    customStyle: {
      type: Object,
      default: () => ({
        itemBg: '',
        btnBg: ''
      })
    },
    memberlogin: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      hbLoading: staticURL(true) + 'scan/hb-loading.gif',

      itemBg: staticURL(true) + 'scan/win-item-bg.png',
      btnBg: staticURL(true) + 'scan/win-btn.png',

      hongImg: staticURL(true) + 'hong.jpg',
      kaquanImg: staticURL(true) + 'kaquan.jpg',
      suohongImg: staticURL(true) + 'suohongbao.jpg',
      jfImg: staticURL(true) + 'jifengIcon.jpg',
      chanceImg: staticURL(true) + 'jihui.jpg',
      unlockExplainImg: staticURL(true) + 'scan/hb-voucher__unlock-explain-pop__process.jpg',
      countTimeItem: {
        timeType: 0, // 0关闭 1 开始
        diff: 0,
        day: 0,
        newhour: 0,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      },
      prizeVolumeEndTimeInfo: {}, // 定额待解锁红包过期时间
      countTag: -1,
      autoJumpPageTimer: null, // 自动跳转定时器
      autoJumpPageTime: 1, // 自动跳转时间
      lockGuide: {
        isVisible: false,
        title: '红包券解锁攻略',
        content: ''
      },
      requestCountOfUnionCard: 7,
      requestCountOfVirtual: 7,
      showJump: true
    }
  },
  computed: {
    // 卡券是否自定义待解锁红包样式
    isCustomUnlockHbStyle() {
      return this.theme === 2 && this.isCustomType === 'customer' && this.prizeInfo.VolumeType === 3
    },
    // 底部间距
    contentPaddingStyle() {
      const winningPageInfo = this.baseWinPageSetting || {}
      return winningPageInfo.theme === 1
        ? { paddingBottom: `${(winningPageInfo.winContentBottomPadding || 0) * 2}rpx` }
        : {}
    },
    // 弹窗宽度
    contentSizeStyle() {
      const winningPageInfo = this.baseWinPageSetting || {}
      return winningPageInfo.theme === 1 ? { width: `${winningPageInfo.winContentSize || 630}rpx` } : {}
    },
    customImg() {
      // 奖项1按钮的样式
      const { pizeWinItemBg, pizeWinItemBtn } = this.baseWinPageSetting
      let s = {
        itemBg: staticURL(true) + 'scan/win-item-bg.png',
        btnBg: staticURL(true) + 'scan/win-btn.png'
      }
      if (pizeWinItemBg || this.customStyle.itemBg) {
        s.itemBg = pizeWinItemBg || this.customStyle.itemBg
      }
      if (pizeWinItemBtn || this.customStyle.btnBg) {
        s.btnBg = pizeWinItemBtn || this.customStyle.btnBg
      }
      return s
    },
    // 标准样式1中奖弹窗同步的样式
    baseWinPageSetting() {
      const config = this.initWiningPageData(this.customScanConfigs)
      return config.WinningPage || {}
    },
    winPageSetting() {
      const config = this.initWiningPageData(this.customScanConfigs)
      return this.isFristAward ? config.WinningPage : config.ReuseWinningPage
    },
    autoJumpInfo() {
      return this.winPageSetting?.jumpInfo || {}
    },
    isAutoJump() {
      return this.winPageSetting?.isAutoJump
    },

    // 背景图片
    popBg() {
      if (!this.winPageSetting) return ''
      return this.winPageSetting.winBgImg
    }
  },
  watch: {
    prizeInfo: {
      handler(val) {
        if (JSON.stringify(val) !== '{}') {
          if (val.IsGetVolume && val.VolumeType === 3) {
            if (this.isCustomUnlockHbStyle && val.PrizeVolumeCouponType !== 1) {
              // 定制待解锁样式定额不用开启倒计时
              let t = dayjs(val.PrizeVolumeEffectiveEndTime)
              this.prizeVolumeEndTimeInfo = {
                dayDesc: t.format('YYYY年MM月DD日'),
                hour: this.padNum(t.hour()),
                minute: this.padNum(t.minute()),
                second: this.padNum(t.second())
              }
            } else {
              let startTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
              let t = dayjs(val.PrizeVolumeEffectiveEndTime)
              this.countTimeItem.diff = Math.floor(t.diff(startTime))
              this.countTimeItem.timeType = 1
              this.countDown()
            }
          }
          if (
            val.IsGetHb &&
            ['发放中', '发放成功（待到账）'].includes(val.HbSendResult) &&
            this.requestCountOfUnionCard !== 0
          ) {
            this.requestCountOfUnionCard = 7
            this.getHbState(val.AwardId)
          }
          // 联盟卡券轮询
          if (
            val.IsProduct &&
            val.IsVirtual === 2 &&
            (!val.ProductSendResult || [0, 3].includes(val.ProductSendResult))
          ) {
            this.requestCountOfVirtual = 7
            this.getVirtualState(val.AwardId)
          }
          // #ifdef MP-MEMBER
          // 消息订阅
          this.initTemplateSetting(val)
          // #endif
        }
      },
      immediate: true
    },
    isShow(val) {
      if (val && this.isAutoJump) {
        this.showJump = true
        this.handleAutoJumpPage()
      }
      if (val) {
        this.requestCountOfUnionCard = 7
        // 判断广告位
        this.setShowAdImg(this.winPageSetting)
        // 判断扫一扫
        this.setShowScanImg(this.winPageSetting)
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.autoJumpPageTimer)
    // 清除定时器
    this.clearCount()
  },
  methods: {
    initWiningPageData() {
      let config = this.customScanConfigs
      const pages = ['WinningPage', 'ReuseWinningPage']
      // 兼容主题1中奖弹窗样式
      if (config?.WinningPage?.theme === 1) {
        // 配置样式1的默认值
        pages.forEach(item => {
          let defaultPrizeConfig = {}
          if (item === 'WinningPage') {
            defaultPrizeConfig = {
              prizeTipColor: '#e8422c',
              prizeTipFontSize: 15,
              prizeBaseColor: '#ffffff',
              prizeBaseFontSize: 15,
              prizeBaseBgColor: '#e8422c',
              pizeWinItemBg: staticURL(true) + 'scan/win-item-bg.png',
              pizeWinItemBtn: staticURL(true) + 'scan/win-btn.png',
              winContentSize: 630,
              winContentBottomPadding: 20
            }
          }
          if (item === 'ReuseWinningPage') {
            defaultPrizeConfig = {
              joinTimeBaseColor: '#d5a39c',
              joinTimeBaseFontSize: 12
            }
          }
          // 使用提取的配置
          Object.entries(defaultPrizeConfig).forEach(([key, value]) => {
            // 如果没有配置，则使用默认值
            !config[item][key] && this.$set(config[item], key, value)
          })
        })
      } else {
        // 样式2配置，初始化
        const defaultPrizeConfig = {
          commandText: '', // 指令文字
          commandTextColor: '#E90E15', // 指令文字颜色
          commandTextTopGap: 20,
          unlockReceiveBtnText: '如何解锁',
          prizeNameTextTopGap: 30,
          customPrizeContentBg: staticURL(true) + 'scan/prize-content-bg.png'
        }
        pages.forEach(item => {
          // 使用提取的配置
          Object.entries(defaultPrizeConfig).forEach(([key, value]) => {
            // 如果没有配置，则使用默认值
            !config[item][key] && this.$set(config[item], key, value)
          })
        })
      }
      return config
    },
    handleJumpAd() {
      /* #ifdef MP-WEIXIN */
      let { appid: appId, link, sceneType: scene, type } = this.winPageSetting.imgInfo
      navigateToMP({
        appId,
        path: link,
        scene,
        type
      })
      /* #endif */
      /* #ifdef H5 */
      // 跳转H5
      if (this.winPageSetting.imgInfo.link) {
        location.href = this.winPageSetting.imgInfo.link
      }
      /* #endif */
    },
    // 如果是导航的对应跳转按钮
    getDrowConfigInfo(type) {
      if (this.isCustomType === 'guide') {
        let path = ''
        let tipsText = ''
        const ssoToken = uni.getStorageSync('guidessotoken')
        switch (type) {
          case 'hb':
            path = `/pages/transfer/index?token=${ssoToken}&url=${encodeURIComponent('/balance/index')}`
            if (this.prizeInfo.HbType === 1) {
              tipsText = this.prizeInfo.prizeHbReceiveDescText
            } else if (this.prizeInfo.HbSendResult === '发放失败') {
              tipsText = '联系客服'
            }
            break
          case 'point':
            path = `/pages/transfer/index?token=${ssoToken}&url=${encodeURIComponent('/packages/src/integral/index')}`
            tipsText = '去兑换'
            break
          case 'lp':
            // 跳去礼品详情
            path = `/pages/transfer/index?token=${ssoToken}&url=${encodeURIComponent(
              this.prizeInfo.IsVirtual === 2
                ? '/packages/src/union-card/list'
                : `/functions/prize/prize-detail?awardId=${this.prizeInfo.AwardId}&type=3`
            )}`
            tipsText = this.prizeInfo.IsVirtual === 2 ? '去使用' : '去领取'
            break
        }
        return {
          path,
          tipsText,
          appid: this.mpMap.guideassistant,
          width: '22px',
          height: '70px'
        }
      }
      if (this.isCustomType === 'store') {
        let path = ''
        let tipsText = ''
        let appid = this.mpMap.retailassistant
        /* #ifdef MP-RETAIL */
        // 在万能零售里直接跳转就行
        appid = ''
        /* #endif */
        const ssoToken = uni.getStorageSync('storessotoken')
        switch (type) {
          case 'hb':
            /* #ifndef MP-RETAIL */
            path = `/pages/transfer/index?token=${ssoToken}&url=${encodeURIComponent(
              '/packages/src/personal/change/index'
            )}`
            /* #endif */
            /* #ifdef MP-RETAIL */
            path = '/packages/src/personal/change/index'
            /* #endif */
            if (this.prizeInfo.HbType === 1) {
              tipsText = this.prizeInfo.prizeHbReceiveDescText
            } else if (this.prizeInfo.HbSendResult === '发放失败') {
              tipsText = '联系客服'
            }
            break
          case 'point':
            path = '/packages/src/integral/index'
            tipsText = '去兑换'
            appid = this.mpMap.mp
            break
          case 'lp':
            // 跳去礼品详情
            path =
              this.prizeInfo.IsVirtual === 2
                ? `/packages/src/union-card/list`
                : `/packages/src/integral/detail?type=2&id=${this.prizeInfo.AwardId}&activityprizeid=${this.prizeInfo.SaoMaActivityPrizeID}&subcategory=6&actid=${this.activityId}`
            tipsText = this.prizeInfo.IsVirtual === 2 ? '去使用' : '去领取'
            appid = this.mpMap.mp
            break
          case 'card':
            /* #ifndef MP-RETAIL */
            path = `/pages/transfer/index?token=${ssoToken}&url=${encodeURIComponent(
              this.prizeInfo.VolumeType === 2 ? '/pages/cash-coupon/index' : '/pages/return-coupon/index'
            )}`
            /* #endif */
            /* #ifdef MP-RETAIL */
            path = this.prizeInfo.VolumeType === 2 ? '/pages/cash-coupon/index' : '/pages/return-coupon/index'
            /* #endif */
            tipsText = '去使用'
            break
        }
        return {
          path,
          tipsText,
          appid,
          width: '22px',
          height: '70px'
        }
      }
    },

    // 跳转到小程序的对应页面
    drowPath(flag) {
      let info = this.getDrowConfigInfo(flag)
      if (!info) return
      navigateToMP({
        appId: info.appid,
        path: info.path
      })
    },

    getHbState(AwardId) {
      if (!this.isShow) return
      if (this.requestCountOfUnionCard <= 0) {
        let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
        prizeInfo.HbSendResult = '发放中'
        prizeInfo.PrizeHbReceiveDesc =
          prizeInfo.HbType === 1 ? '发放中，稍后可到“我的奖品”中查看' : '红包已发出，稍后可到“微信钱包”查收~'
        this.$emit('update:prizeInfo', prizeInfo)
        return false
      }
      let query = {
        AwardId
      }
      /* #ifdef H5 */
      query.Memberlogin = getQuery('m')
      /* #endif */
      apiGetHbState(query).then(res => {
        if (this.$ck(res)) {
          if (['发放失败'].includes(res.return_data.HbSendResult)) {
            let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
            prizeInfo.HbSendResult = '发放失败'
            prizeInfo.PrizeHbReceiveDesc = res.return_data.HbRemark || '抱歉，红包发放失败，请联系客服进行补发'
            this.$emit('update:prizeInfo', prizeInfo)
          } else if (['发放中', '发放中（待到账）'].includes(res.return_data.HbSendResult)) {
            setTimeout(() => {
              this.requestCountOfUnionCard--
              this.getHbState(AwardId)
            }, 3000)
          } else {
            let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
            prizeInfo.HbSendResult = '发放成功'
            prizeInfo.PrizeHbReceiveDesc =
              prizeInfo.HbType === 1
                ? '已到账，请到“个人中心-我的零钱”中查看提现'
                : prizeInfo.HbType === 0
                ? '已到账，请返回微信(公众号/服务通知)领取(24小时内有效)'
                : '已到账，请到“微信钱包”中查看'
            this.$emit('update:prizeInfo', prizeInfo)
          }
        }
      })
    },

    getVirtualState(AwardId) {
      if (this.requestCountOfVirtual <= 0) {
        return false
      }
      let query = {
        AwardId
      }
      /* #ifdef H5 */
      query.m = getQuery('m')
      /* #endif */
      apiGetAwardGrantState(query).then(res => {
        if (this.$ck(res)) {
          if ([0, 3].includes(res.return_data.ProductSendResult)) {
            setTimeout(() => {
              this.requestCountOfVirtual--
              this.getVirtualState(AwardId)
            }, 3000)
          } else {
            let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
            prizeInfo.ProductSendResult = res.return_data.ProductSendResult
            this.$emit('update:prizeInfo', prizeInfo)
          }
        }
      })
    },

    // 点击遮罩
    handleClickMask() {
      // this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    },
    // 调起倒计时
    countDown() {
      if (this.countTag) {
        this.clearCount()
      }
      this.countTag = setInterval(() => {
        if (this.countTimeItem.timeType === 1) {
          this.countTimeItem.diff = this.countTimeItem.diff - 100
          if (this.countTimeItem.diff > 0) {
            this.formatTime(this.countTimeItem)
          } else {
            this.countTimeItem.timeType = 0
            this.clearCount()
          }
        }
      }, 100)
    },
    // 计算倒计时
    formatTime() {
      this.countTimeItem.day = Math.floor(this.countTimeItem.diff / 1000 / (60 * 60 * 24))
      this.countTimeItem.newhour = this.padNum(Math.floor((this.countTimeItem.diff / 1000 / (60 * 60)) % 24))
      this.countTimeItem.hour = this.padNum(Math.floor(this.countTimeItem.diff / 1000 / (60 * 60)))
      this.countTimeItem.minute = this.padNum(parseInt((this.countTimeItem.diff / 1000 / 60) % 60))
      this.countTimeItem.second = this.padNum(parseInt((this.countTimeItem.diff / 1000) % 60))
      this.countTimeItem.millisecond = parseInt((this.countTimeItem.diff / 100) % 10)
    },
    // 计算数字
    padNum(v) {
      return v < 10 ? `0${v}` : `${v}`
    },
    // 清除倒计时
    clearCount() {
      clearInterval(this.countTag)
      this.countTag = null
    },
    /** 去使用券 */
    async handleVolume() {
      if (this.isCustomType === 'store') {
        /* #ifdef MP-WEIXIN */
        // 现金卡券/返货券
        this.drowPath('card')
        /* #endif */
        return
      }

      /* #ifdef H5 */
      location.href = this.prizeInfo.PrizeVolumeReceiveDescLink
      /* #endif */
      /* #ifdef MP-WEIXIN */
      let url
      if (this.prizeInfo.VolumeType === 0) {
        // 购物券
        url = '/personal/coupon/list'
      } else if (this.prizeInfo.VolumeType === 1) {
        // 第三方卡券
        let { id } = getQueryMp(this.prizeInfo.ThirdCardDetailUrl)
        url = `/personal/prize/third-voucher?id=${id}&type=1`
      } else if (this.prizeInfo.VolumeType === 2) {
        // 提领券
        url = '/personal/bring-coupon/list'
      } else if (this.prizeInfo.VolumeType === 3) {
        // 红包券
        url = '/personal/my-voucher/list'
      }
      if (this.prizeInfo.VolumeType === 2) {
        /* #ifdef MP-MEMBER */
        await this.requestSubscribeMsg(this.noticeTempList)
        /* #endif */
      }
      uni.navigateTo({
        url
      })
      /* #endif */
    },
    // 如何解锁待解锁红包券
    handleGetCouponExplain() {
      /* #ifdef H5 */
      apiGetCouponExplain({
        MemberLogin: getQuery('m'),
        CouponId: this.prizeInfo.PrizeVolumeCouponId // 券id
      })
        .then(res => {
          this.handleOpenLockGuide(res.return_data.Explain)
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      apiCouponExplain({
        CouponId: this.prizeInfo.PrizeVolumeCouponId // 券id
      }).then(res => {
        if (res.return_code === 0) {
          this.handleOpenLockGuide(res.return_data.explain)
        } else {
          this.$msg(res.return_msg)
        }
      })
      /* #endif */
    },
    handleOpenLockGuide(content) {
      this.lockGuide.isVisible = true
      let str = content
      str = str.replace(
        /<img src([^>\s]+)(([^>]+)\s?style="(.*?)"\s?)?\/>/gi,
        '<img src$1 style="max-width:100%;height:auto;vertical-align:middle;" />'
      )
      this.lockGuide.content = str
    },
    /** 联盟卡券跳转 */
    handleGoCard(isOpened) {
      // 开启了礼品领取说明
      if (this.prizeInfo.ProductGetRemark !== '' && !isOpened) {
        this.$refs.CardDialog.open({
          content: decodeURI(this.prizeInfo.ProductGetRemark),
          btns: [
            {
              text: '我知道了'
            }
          ]
        })
        return
      }

      // 导购判断
      // 处理导购扫码、门店下的跳转逻辑
      if (this.isCustomType === 'guide' || this.isCustomType === 'store') {
        /* #ifdef MP-WEIXIN */
        // 跳转提现
        this.drowPath('lp')
        /* #endif */
        return
      }

      /* #ifdef H5 */
      location.href = this.prizeInfo.AwardURL
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: '/packages/src/union-card/list'
      })
      /* #endif */
    },
    // 去提现
    handlewithdraw(link) {
      // 处理导购扫码下的跳转逻辑
      if (this.isCustomType === 'guide' || this.isCustomType === 'store') {
        /* #ifdef MP-WEIXIN */
        // 跳转提现
        this.drowPath('hb')
        /* #endif */
        return
      }
      /* #ifdef H5 */
      location.href = link
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: '/personal/change/index'
      })
      /* #endif */
    },
    // 前往积分商城
    handlePoint(link, redirectInfo = {}) {
      // 处理导购扫码下的跳转逻辑
      if (this.isCustomType === 'guide' || this.isCustomType === 'store') {
        /* #ifdef MP-WEIXIN */
        // 跳转提现
        this.drowPath('point')
        /* #endif */
        return
      }
      /* #ifdef H5 */
      // #ifndef H5-DECORATE
      location.href = link
      // #endif
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (redirectInfo.IsRedirectToCustomMiniProgram) {
        navigateToMP({
          appId: redirectInfo.CustomMiniProgramUserName,
          path: redirectInfo.CustomMiniProgramPath
        })
      } else {
        uni.navigateTo({
          url: '/packages/src/integral/index'
        })
      }
      /* #endif */
    },
    // 参与机会抽奖
    handleDraw(link) {
      /* #ifdef H5 */
      location.href = link
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (this.prizeInfo.DrawMpUrl) {
        uni.navigateTo({
          url: '/' + this.prizeInfo.DrawMpUrl
        })
      } else {
        this.$emit('qrcode', this.prizeInfo.DrawCenterUrl)
      }
      /* #endif */
    },
    // 礼品
    async handleReceive(isOpened, isCollect = false) {
      // 开启了礼品领取说明
      if (this.prizeInfo.ProductGetRemark !== '' && !isOpened) {
        this.$refs.ReceiveDialog.open({
          content: decodeURIComponent(this.prizeInfo.ProductGetRemark),
          btns: [
            {
              text: '我知道了'
            }
          ]
        })
        return
      }

      // 处理导购扫码下的跳转逻辑礼品是否需要区分线下线上的，这里做一下判断
      if (this.isCustomType === 'guide') {
        /* #ifdef MP-WEIXIN */
        this.drowPath('lp')
        /* #endif */
        return
      }

      if (this.isCustomType === 'customer' && this.prizeInfo.IsVirtual === 0 && !isCollect) {
        this.$emit('register')
        return
      }
      this.receiveDrow()
    },
    receiveDrow() {
      /* #ifdef H5 */
      this.receiveH5()
      /* #endif */

      /* #ifdef MP-WEIXIN */
      this.receiveMp()
      /* #endif */
    },
    // #ifdef H5
    async receiveH5() {
      if (this.prizeInfo.IsVirtual === 0) {
        if (this.prizeInfo.ProductGetType === 0) {
          //邮寄方式
          location.href = this.prizeInfo.GetAwardByKuaiDiUrl
        } else if (this.prizeInfo.ProductGetType === 1) {
          //线下门店领取
          location.href = this.prizeInfo.GetAwardByDealerUrl
        } else {
          uni.showActionSheet({
            itemList: ['快递邮寄', '线下门店领取'],
            success: res => {
              if (res.tapIndex === 0) {
                location.href = this.prizeInfo.GetAwardByKuaiDiUrl
              } else {
                location.href = this.prizeInfo.GetAwardByDealerUrl
              }
            }
          })
        }
      } else if (this.prizeInfo.IsVirtual === 2) {
        //联盟卡券
        location.href = this.prizeInfo.AwardURL
      } else {
        //虚拟票券 或直冲类（1||3）
        location.href = this.prizeInfo.GetAwardByKuaiDiUrl
      }
    },
    // #endif
    // #ifdef MP-WEIXIN
    async receiveMp() {
      // 首次领奖联盟卡券
      if (this.prizeInfo.IsVirtual === 2) {
        this.handleGoCard(true)
        return
      }

      /* #ifdef MP-MEMBER */
      await this.requestSubscribeMsg(this.noticeTempList)
      /* #endif */
      // ProductGetType  0：邮寄，1：线下，2：两种
      let productGetType = this.prizeInfo.ProductGetType
      /* #ifdef MP-RETAIL */
      // 万能零售下只有一种方式
      productGetType = 0
      /* #endif */
      if (productGetType === 0) {
        uni.redirectTo({
          url: `/packages/src/integral/detail?type=2&id=${this.prizeInfo.AwardId}&activityprizeid=${this.prizeInfo.SaoMaActivityPrizeID}&subcategory=6&actid=${this.activityId}`
        })
      } else if (productGetType === 1) {
        uni.redirectTo({
          url: `/packages/src/integral/settle?type=4&id=${this.prizeInfo.AwardId}&ordersourcetype=2`
        })
      } else {
        this.$emit('open')
      }
    },
    // #endif
    // 领奖自动跳转
    handleAutoJumpPage() {
      this.autoJumpPageTime = Number(this.autoJumpInfo.autoJumpPageTime)
      this.autoJumpPageTimer = setInterval(() => {
        let pages = getCurrentPages()
        const page = `/${pages[pages.length - 1].route}`
        if (!page.includes('/scan-templates/')) {
          this.showJump = false
          return clearInterval(this.autoJumpPageTimer)
        }
        if (this.autoJumpPageTime <= 0) {
          clearInterval(this.autoJumpPageTimer)
          /* #ifdef H5 */
          let path = this.autoJumpInfo.link.includes('http') ? this.autoJumpInfo.link : '//' + this.autoJumpInfo.link
          location.href = path
          /* #endif */
          /* #ifdef MP-WEIXIN */
          this.handleCloseDialog()
          let { appid: appId, link, sceneType: scene, type } = this.autoJumpInfo
          navigateToMP({
            appId,
            path: link,
            scene,
            type
          })
          /* #endif */
          return
        }
        this.autoJumpPageTime--
      }, 1000)
    },
    clearAutoJumpPage() {
      clearInterval(this.autoJumpPageTimer)
      this.handleCloseDialog()
    },
    /* #ifdef H5 */
    // 联系客服
    handleContactUs() {
      location.href = this.prizeInfo.ContactUs.ButtonLink
    },
    // 红包的联系客服
    handleHbContactUs(url) {
      location.href = url
    }
    /* #endif */
  }
}
