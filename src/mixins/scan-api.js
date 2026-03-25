/* #ifdef H5 */
import {
  apiGetPKZSaoMaErrorMsg,
  apiGetPKZSaoMaGuideInfo,
  apiGetPKZSaoMaPageInfo,
  apiSumbitAwardApply,
  apiGetAwardResult,
  apiGetAwardPageInfo,
  apiGetAwardForWaitList,
  apiGetActivityZJDataList,
  apiGetCodeCouponRecord,
  apiGetCouponRecord,
  apiCouponUnLock,
  apiSetSaoMaRecordWXLocation,
  apiJudgeValidVerifyCode,
  apiSavaStore,
  apiGetDxmCodeInfo,
  apiGetSaoMaoIdentity,
  apiSetSaoMaoIdentity,
  apiGetIsRegisterInfo
} from 'packages/api/scan'
import { isDevtool } from 'packages/utils'
/* #endif */
/* #ifdef MP-WEIXIN */
import { mapState } from 'vuex'

import {
  // 同名情况下使用别名以便开启ESLint
  apiGetPKZSaoMaErrorMsg as apiSaomaErrorMsg,
  apiGetPKZSaoMaGuideInfo as apiSaomaGuideInfo,
  apiMiniSaoMaInfo,
  apiSumbitawardApply,
  apiAwardpageInfo,
  apiGetAwardForWaitList as apiAwardWaitList,
  apiMiniSetSaomarecordwxLocation,
  apiMiniAwardreSultn,
  apiGetActivityZJDataList as apiActivityZJList,
  apiCouponUnlockResult,
  apiGetCouponRecord as apiCouponRecord,
  apiCouponUnlock,
  apiJudgeValidVerifyCode as apiVerifyCode,
  apiGetMiniSaoMaErrorPageInfo,
  apiSavaStore as apiSaveStore,
  apiGetDxmCodeInfo as apiDxmCodeInfo,
  apiGetSaoMaoIdentity as apiSaomaIdentity,
  apiSetSaoMaoIdentity as apiSetSaomaIdentity,
  apiGetIsRegisterInfo as apiGetSaoMaIsRegisterInfo
} from 'packages/api/scan'
import { getLocation } from 'packages/utils/getLocation'
/* #endif */
import { getQuery, getUrlQuery } from 'packages/utils/function'
import { apiGetMpInfo } from 'packages/api/common'
// #ifdef MP-WEIXIN
import { scanCbMixin } from 'packages/mixins/scan'
// #endif
const scanApiMixin = {
  // #ifdef MP-WEIXIN
  mixins: [scanCbMixin],
  // #endif
  data() {
    return {
      activityId: 0, // 活动id
      openId: '', // 扫码明细返回的openId
      ecodeId: '', // 加密的扫码记录ID
      codeId: '', // 扫码记录ID
      fwCode: '', // 防伪码
      title: '', // 页面标题
      textcolor: '#000', // 小程序标题颜色
      ruleInfo: {
        activityTitle: '', // 活动主题
        startTime: '', // 活动开始时间
        endTime: '', // 活动结束时间
        ruleContent: '' // 规则内容
      },
      prizeFontColor: '#fff', // 奖项内容字体颜色
      prizeList: [], // 奖项内容列表
      isStartWxLocation: false, // 是否需要获取定位
      isLimitArea: false, // 是否开启强制定位
      isRecord: false, // 是否开启强制定位
      isLoadWxLoaction: true, // 是否指定活动范围内
      isNeedVerifyCode: false, // 是否需要验证码领奖
      codeVisible: false, // 是否显示验证码领奖
      isShowVerifyCodeCloseIcon: true, // 是否显示验证码弹窗关闭按钮
      verifyCodeTips: '', // 验证码领奖提示
      verifyCode: '', // 验证码
      isOpenCoupon: false, // 是否开启待解锁红包券
      isShowWorkwxDialog: false, // 是否显示添加企微活码弹窗
      activityQrCode: '', // 企微活码链接
      isShowGzhDialog: false, // 是否显示添加公众号弹窗
      gzhQrCode: '', // 公众号链接
      isGetPrize: false, // 是否已被领奖
      isFristAward: false, // 是否首次领奖
      isShowWinDialog: false, // 是否显示中奖弹窗
      prizeInfo: {}, // 中奖信息
      isShowNowinDialog: false, // 是否显示不中奖弹窗
      nowinState: 0, // 不中奖状态 0：未中奖 1：奖品被领走 2：活动未开始 3：活动已结束 4：活动未开启
      notWinningMsg: '',
      firstScanCodeNickName: '', // 首次扫码人昵称
      firstScanCodeTime: '', // 首次扫码人时间
      awardId: 0, // 领奖id
      paramCode: '0', // 0未抽奖 1已抽奖 （字符串！）
      code: '', // 码（小程序用）
      codesegment: '', // 码段
      codebatch: '', // 批次
      fwinfo: '', // 扫码提示, 首次非首次
      scanCount: 0, // 码扫次数
      currentCollectMode: 0,
      isShowCollectDialog: false, // 是否显示收集资料弹窗
      collectConfig: {}, // 收集资料配置
      isShowDatePicker: false, // 是否显示日期选择
      dateIndex: 0, // 收集资料日期索引
      dateValue: '', // 收集资料日期值
      unlockVisible: false, // 是否显示待解锁红包券解锁成功弹窗
      unlockListVisible: false, // 是否显示待解锁红包列表弹窗
      unlockAmount: 0, // 单个红包解锁金额
      unlockCouponList: [], // 待解锁红包列表
      noUnlockListVisible: false, // 是否显示不能解锁红包券列表（指定商品，只能看，不能解锁）
      busy: false, // 防重复请求标识
      loop: {
        // 轮询设置
        pollingWaitSeconds: 700,
        totalSeconds: 700
      },
      contentJson: null,
      otherPageSetJson: null,
      options: null, // 小程序页面参数
      wxConfig: null, // H5微信配置
      unlockHbtype: 1, // 解锁红包类型
      unlockHbid: 0, // 解锁红包id
      memberAppID: '', // 会员小程序appid
      guidePageType: '', // 判断导购搜索的页面类型
      // 导购扫码，导购员信息
      guideInfo: {
        IsSaler: true,
        SalerState: 1
      },
      temptype: '',
      dgerrortype: '',
      isErrorDefalutModel: false,
      mpMap: {
        mp: 'wx5e946f6691f8d27e',
        cloudshop: 'wxb5d80c5ca26c0dce',
        guideassistant: 'wx19544f7e3fb8ac9c',
        retailassistant: 'wx3ce4190515c76ce2'
      },
      showStorePopup: false, // 显示选择门店列表
      dxmInfo: {
        noStoreMsg: ''
      },
      dxmRegisInfo: {
        // 动销码注册信息
        IsFrist: false,
        IsSelf: false,
        RegisSuccess: false,
        RegisTime: null,
        RelatedPrizeList: [],
        SharePrizeList: []
      },
      identityVisible: false, // 显示身份筛选弹窗
      isOpenIdentity: false, // 是否开启身份筛选
      storeRegisterUrl: '', // H5门店注册地址 或 小程序页面路径
      storeRegisterAppid: '', // 门店注册APPid
      identityResolve: null,
      bgMusic: '', // 背景音乐
      showBgAudio: false, // 是否显示背景音乐
      pageHide: false, // 页面隐藏
      fwproinfo: {}, // 商品信息
      scanDetailData: {}, // 追溯信息
      scanDealerInfoData: {}, // 经销商信息
      currentWxConfigUrl: '', // 当前wxconfig的url
      handleComponentsCallback: null, // 组件处理回调
      otherParams: {} // 带参跳转额外参数
    }
  },
  // #ifdef MP-WEIXIN
  computed: {
    ...mapState('scanAuth', ['needAuth'])
  },
  // #endif
  async onLoad(options) {
    this.options = options
    console.log('options:', this.options)
    /* #ifdef H5 */
    this.otherParams = {
      q: getQuery('code')
    }
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.otherParams = {
      q: this.options.code
    }
    /* #endif */
    // 动销码判断
    if (options.temptype === '28') {
      if (options.multistore) {
        // 多门店，先选门店
        return (this.showStorePopup = true)
      }
      await this.getDxmInfo()
    }

    await this.getDGPreScanInfo()
    /* #ifdef MP-WEIXIN */
    if (this.temptype === '27' && Number(this.options.ecode) === -4) {
      this.isErrorDefalutModel = true
      this.getSaoMaErrorPageInfo()
      return
    }
    /* #endif */
    this.getDetail()
  },
  methods: {
    endCoverCallFn() {
      this.handleComponentsCallback?.()
      this.handleComponentsCallback = null
    },
    // 选择完门店
    SelectStore(item) {
      let query = {
        code: this.options.code, // 码
        storeId: item.id // 门店id
      }
      let api
      /* #ifdef H5 */
      query.openId = getQuery('openId') || getQuery('openidN') || getQuery('openid')
      query.memberlogin = getQuery('m')
      /* #endif */
      // #ifdef H5
      api = apiSavaStore
      // #endif
      // #ifdef MP-WEIXIN
      api = apiSaveStore
      // #endif
      api(query).then(res => {
        if (this.$ck(res)) {
          this.showStorePopup = false
          /* #ifdef MP-WEIXIN */
          let code = uni.getStorageSync('scanCodeInfo')
          // 宝洁的码需完整二维码链接
          this.scanDataEvent(encodeURIComponent(code), 2)
          /* #endif */
          /* #ifdef H5 */
          location.replace(getQuery('RedirectUrl'))
          /* #endif */
        }
      })
    },
    // 获取小程序APPid
    getMpInfo() {
      return new Promise(resolve => {
        let query = {
          types: [0, 1, 2, 3, 14] // 0-会员小程序 1-云店小程序 2-导购小程序 3万能零售小程序
        }
        /* #ifdef H5 */
        query.m = getQuery('m')
        /* #endif */
        /* #ifdef MP-WEIXIN */
        query.m = this.options.m
        /* #endif */

        apiGetMpInfo(query).then(res => {
          const d = this.$toLowerKey(res, true)
          if (this.$ck(d, false)) {
            let arr = d.return_data || []
            this.mpMap.mp = arr.filter(item => item.type === 0)[0].appid
            this.mpMap.cloudshop = arr.filter(item => item.type === 1)[0].appid
            this.mpMap.guideassistant = arr.filter(item => item.type === 2)[0].appid
            this.mpMap.retailassistant = arr.filter(item => item.type === 3)[0].appid
            this.mpMap.retailspecial = arr.filter(item => item.type === 14)[0].appid
          }
          resolve()
        })
      })
    },
    // 设置标题
    setTitle() {
      uni.setNavigationBarTitle({
        title: this.title
      })
    },
    // 动销码信息获取
    getDxmInfo() {
      return new Promise(resolve => {
        let params = {}
        let api
        /* #ifdef H5 */
        let url = ''
        url = location.href
        params = {
          type: this.options.type,
          M: getQuery('m'),
          codeId: getQuery('codeID'),
          code: getQuery('code'),
          openid: getQuery('openidN') || getQuery('openid') || getQuery('openId'),
          EActivityID: getQuery('EActivityID') || '',
          curRequstUrl: url,
          TempType: this.options.temptype || '',
          segmentBatchCodeSerialNumbers: this.options.segmentBatchCodeSerialNumbers || 0
        }
        api = apiGetDxmCodeInfo
        /* #endif */
        /* #ifdef MP-WEIXIN */
        params = {
          type: this.options.type,
          codeId: this.options.codeID,
          code: this.options.code,
          EActivityID: this.options.EActivityID,
          TempType: this.options.temptype || '',
          segmentBatchCodeSerialNumbers: this.options.segmentBatchCodeSerialNumbers || 0
        }
        api = apiDxmCodeInfo
        /* #endif */
        api(params)
          .then(res => {
            if (this.$ck(res)) {
              const {
                ScanCount,
                FwQueryTip,
                DxmRegisInfo: dxmRegisInfo,
                NoStoreMsg: noStoreMsg,
                storessotoken
              } = res.return_data
              this.dxmInfo = {
                ScanCount,
                FwQueryTip,
                noStoreMsg
              }
              this.dxmRegisInfo = dxmRegisInfo
              uni.setStorageSync('storessotoken', storessotoken || '')
              resolve()
            } else {
              this.dropError({
                msg: res.return_msg || '接口异常'
              })
            }
          })
          .catch(res => {
            this.dropError({
              msg: res.return_msg || '接口异常'
            })
          })
      })
    },
    // 前置码信息获取
    async getDGPreScanInfo() {
      return new Promise(resolve => {
        /* #ifdef H5 */
        this.temptype = getQuery('temptype')
        this.dgerrortype = Number(getQuery('dgerrortype'))

        /* #endif */
        /* #ifdef MP-WEIXIN */
        this.temptype = this.options.temptype
        this.dgerrortype = Number(this.options.dgerrortype)
        /* #endif */

        if (this.temptype !== '27') {
          resolve()
          return
        }

        // let errorRes = {}
        // let guideInfoRes = {}
        let url = ''
        let api
        let params = {}
        // 获取导购员信息
        /* #ifdef H5 */
        url = location.href
        params = {
          M: getQuery('m'),
          codeId: getQuery('codeID'),
          code: getQuery('code'),
          openidN: getQuery('openidN') || getQuery('openid') || getQuery('openId'),
          noJoinActiveTip: getQuery('noJoinActiveTip'),
          EActivityID: getQuery('EActivityID') || '',
          TempType: this.temptype || '',
          segmentBatchCodeSerialNumbers: getQuery('segmentBatchCodeSerialNumbers') || 0,
          curRequstUrl: url,
          type: 27
        }
        api = apiGetPKZSaoMaGuideInfo
        /* #endif */
        /* #ifdef MP-WEIXIN */
        params = {
          codeId: this.options.codeID,
          code: this.options.code,
          noJoinActiveTip: this.options.noJoinActiveTip,
          EActivityID: this.options.EActivityID,
          TempType: this.temptype || '',
          segmentBatchCodeSerialNumbers: this.options.segmentBatchCodeSerialNumbers || 0,
          type: 27
        }
        api = apiSaomaGuideInfo
        /* #endif */

        // 非导购员获取导购员未激活跳转错误页面
        if (this.dgerrortype === 2) {
          let errData = {}
          // 导购员被禁用
          errData.msg = '啊哦，你的导购员身份被禁用了！'
          errData.code = params.code
          errData.pageType = 2
          this.dropError(errData)
          return
        }
        if (this.dgerrortype === 1) {
          // 导购员不存在不用查
          resolve()
          return
        }

        this.$loading.show()
        api(params)
          .then(guideInfoRes => {
            this.$loading.hide()
            if (this.$ck(guideInfoRes)) {
              let guideInfo = guideInfoRes.return_data
              this.openId = guideInfo.Openid
              uni.setStorageSync('openId', this.openId)
              const {
                IsSaler,
                SalerState,
                FollowGZHUrl,
                DGAwardMessage,
                DGAwardNonactivatedMsg,
                NoDGMessage,
                IsAwardByDerict,
                ScanCount,
                FwQueryTip,
                ssotoken
              } = guideInfo
              this.guideInfo = {
                IsSaler,
                SalerState,
                FollowGZHUrl,
                DGAwardMessage, // 关联领奖提示
                DGAwardNonactivatedMsg, // 码未激活提示
                NoDGMessage, // 非导购员
                ScanCount,
                FwQueryTip,
                IsAwardByDerict
              }
              // 非导购员获取导购员未激活跳转错误页面
              if (SalerState !== 1 && this.dgerrortype !== 3) {
                let errData = {}
                if (SalerState === 0 || SalerState === 4) {
                  // 导购员未激活
                  errData.msg = NoDGMessage || '啊哦，导购员账户未激活，不能参与活动！'
                } else if (SalerState === 2) {
                  // 导购员被禁用
                  errData.msg = '啊哦，你的导购员身份被禁用了！'
                  errData.pageType = 2
                }
                errData.code = params.code
                this.dropError(errData)
                return
              }
              uni.setStorageSync('guidessotoken', ssotoken || '')
              resolve()
            } else {
              this.handlerErrorData(guideInfoRes, params)
            }
          })
          .catch(err => {
            this.$loading.hide()
            this.handlerErrorData(err, params)
          })
      })
    },

    async handlerErrorData(err, params) {
      let strData = ''
      let errData = {}
      if (err.return_data) {
        strData = getUrlQuery(err?.return_data?.split('?')[1])
        let errorRes = {}
        // #ifdef H5
        errorRes = await apiGetPKZSaoMaErrorMsg({ ...params, ecode: strData.ecode })
        // #endif
        // #ifdef MP-WEIXIN
        errorRes = await apiSaomaErrorMsg({ ...params, ecode: strData.ecode })
        // #endif
        // 获取错误信息
        errData = errorRes.return_data || {
          msg: err.return_msg
        }
      } else {
        errData.msg = err.return_msg
      }
      errData.code = params.code
      this.dropError(errData)
    },

    // 跳转到错误页面
    dropError(errData) {
      let link
      let query = `?ecode=${errData.ECode}&code=${errData.code}&msg=${
        errData.msg || errData.content || errData.Content || ''
      }`
      query += `&pageType=${errData.pageType ? errData.pageType : -1}`
      /* #ifdef H5 */
      link = `/scan-templates/error-page${query}&pagetype=1&ETempID=${getQuery('ETempID')}&m=${getQuery('m')}`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      link = `/packages/src/scan-templates/error-page${query}`
      /* #endif */
      uni.redirectTo({
        url: link
      })
    },

    // 小程序获取错误的模版信息，导购默认模版
    /* #ifdef MP-WEIXIN */
    async getSaoMaErrorPageInfo() {
      apiGetMiniSaoMaErrorPageInfo({
        Type: this.options.type,
        CodeId: this.options.codeID,
        Code: this.options.code,
        OpenIdN: '',
        EActivityID: this.options.EActivityID,
        TempType: this.temptype || '',
        TempId: this.options.tempid || 0,
        Ecode: this.options.ecode || 0
      }).then(res => {
        if (this.$ck(res)) {
          let data = res.return_data || {}
          let templatemodel = data.templatemodel
          if (templatemodel) {
            this.contentJson = JSON.parse(templatemodel.contentjson)
            this.code = this.options.code
          }
        }
      })
    },
    /* #endif */
    // 选择身份信息回调
    identitySelect(type) {
      let query = {}
      let api
      /* #ifdef H5 */
      query = {
        activityid: this.activityId,
        memberlogin: getQuery('m'),
        openid: this.openId,
        type,
        codeid: getQuery('codeID'),
        code: getQuery('code')
      }
      api = apiSetSaoMaoIdentity
      /* #endif */
      /* #ifdef MP-WEIXIN */
      query = {
        activityid: this.activityId,
        type,
        codeid: this.options.codeID,
        code: this.options.code
      }
      api = apiSetSaomaIdentity
      /* #endif */

      api(query).then(res => {
        if (this.$ck(res)) {
          if (type === 1) {
            /* #ifdef H5 */
            location.replace(this.storeRegisterUrl)
            /* #endif */
            /* #ifdef MP-WEIXIN */
            uni.navigateTo({
              url: `/packages/src/store-action/register?m=${this.options.m}&x=${this.options.fcdealerid || 0}`
            })
            /* #endif */
          } else {
            this.identityVisible = false
            // 释放getData
            this.identityResolve()
          }
        }
      })
    },
    setScanDealerInfo(dealerinfo) {
      if (dealerinfo) {
        const data = this.$toLowerKey(dealerinfo)
        const { dealerarea, dealerleader, dealername, dealerno, dealerphonenum, storageouttime, dealerlv, dealerid } =
          data
        this.scanDealerInfoData = {
          dealerid,
          dealername: dealername,
          dealerno: dealerno,
          mobile: dealerphonenum,
          leader: dealerleader,
          area: dealerarea,
          dealerlevel: dealerlv,
          outtime: storageouttime
        }
        uni.setStorageSync('scanDealerInfoData', this.scanDealerInfoData)
      }
    },
    // 获取扫码信息
    async getDetail() {
      /* #ifdef H5 */
      let url = location.href
      if (!isDevtool() && uni.getSystemInfoSync().platform === 'ios' && uni.getStorageSync('firstUrl')) {
        url = uni.getStorageSync('firstUrl')
        uni.removeStorageSync('firstUrl')
      }
      this.currentWxConfigUrl = url
      apiGetPKZSaoMaPageInfo({
        type: getQuery('type'),
        memberlogin: getQuery('m'),
        codeId: getQuery('codeID'),
        code: getQuery('code'),
        openid: getQuery('openidN') || getQuery('openid') || getQuery('openId'),
        noJoinActiveTip: getQuery('noJoinActiveTip'),
        EActivityID: getQuery('EActivityID') || '',
        TempType: this.temptype || '',
        segmentBatchCodeSerialNumbers: getQuery('segmentBatchCodeSerialNumbers') || 0,
        curRequstUrl: url
      })
        .then(async res => {
          let data = res.return_data
          this.activityId = data.activityId
          this.openId = data.openId
          uni.setStorageSync('openId', this.openId)
          this.ecodeId = data.ECodeId
          this.fwCode = data.fwCode
          this.codesegment = data.CodeSegment
          this.codebatch = data.codeBatch
          this.codeId = getQuery('codeID')
          this.fwinfo = data.FwInfo
          this.scanCount = data.scanCount
          this.title = data.PageTitle
          this.ruleInfo.activityTitle = data.activityTitle
          this.ruleInfo.startTime = data.startTime
          this.ruleInfo.endTime = data.endTime
          this.ruleInfo.ruleContent = data.ruleContent
          this.prizeList = data.listSaoMaActivityPrize
          this.isStartWxLocation = data.isStartWxLocation
          this.isLimitArea = data.isLimitArea
          this.isRecord = data.isRecord
          this.isLoadWxLoaction = this.isLimitArea
          this.showPrizeListPosition = data.contentJson.showPrizeListPosition
          this.isNeedVerifyCode = data.IsNeedVerifyCode
          this.verifyCodeTips = data.VerifyCodeTips
          this.isOpenCoupon = data.IsOpenCoupon
          this.wxConfig = data.wxConfig
          this.awardId = data.awardId
          this.isGetPrize = data.isGetPrize
          this.memberAppID = data.memberAppID
          this.firstScanCodeTime = data.awardTime
          this.notWinningMsg = data.notWinningMsg
          this.isOpenIdentity = data.IsOpenIdentity
          // 商品信息
          this.fwproinfo = this.$toLowerKey(data.FwProInfo || {})
          this.fwproinfo.yundianwxid = data.YunDianWxId
          this.fwproinfo.yundianproductpath = data.YunDianProductPath
          // 追溯数据
          this.scanDetailData = data.ValidateCode || {}
          this.setScanDealerInfo(data.DealerInfo)
          // 处理附近门店链接，装修组件读缓存
          uni.setStorageSync('nearbyStoreUrl', data.nearbyStoreUrl || '')
          try {
            // 因每个模板contentJson和otherPageSetJson有差异，所以这里不做赋值，在每个对应模板赋值
            this.contentJson = JSON.parse(data.contentJsonStr)
            // 如果是导购的错误的不用执行接下来的操作
            if (this.temptype === '27' && [1, 2, 3, 4].includes(this.dgerrortype)) {
              return
            }
            this.otherPageSetJson = data.otherpagesetjson || ''
            let otherPageSetJson = this.otherPageSetJson
            // 是否开启了奖品领取提示
            if (otherPageSetJson && otherPageSetJson.IsShowAwardTipsDialog) {
              this.getAwardForWaitList()
            }

            // 启动页、领奖后自动跳转统一处理
            if (otherPageSetJson) {
              this.startPageBgImg = otherPageSetJson.WelcomePage?.PageBgImg
              this.startPageTime = otherPageSetJson.WelcomePage?.startPageTime
              this.startPageTitle = otherPageSetJson.WelcomePage?.PageTitle
              this.isShowStartPage = otherPageSetJson.WelcomePage?.IsStartWelcomePage === 1
              this.isAutoJump = otherPageSetJson.SaoMaResultAutoJumpPage?.IsSaoMaResultAutoJumpPage === 1
              this.autoJumpInfo.SaoMaResultAutoJumpPageText =
                otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPageText
              this.autoJumpInfo.SaoMaResultAutoJumpPageTime =
                otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPageTime
              this.autoJumpInfo.SaoMaResultAutoJumpPagePath =
                otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPagePath
            }
          } catch (error) {
            console.error(error)
          }

          // 是否开启身份筛选
          if (this.isOpenIdentity) {
            let identityInfo = await apiGetSaoMaoIdentity({
              activityid: data.activityId,
              memberlogin: getQuery('m'),
              openid: this.openId,
              codeid: getQuery('codeID'),
              code: getQuery('code')
            })
            if (this.$ck(identityInfo)) {
              if (identityInfo.return_data.type === 0) {
                this.storeRegisterUrl = identityInfo.return_data.mdurl
                await new Promise(resolve => {
                  this.identityVisible = true
                  this.identityResolve = resolve
                })
              }
            }
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

          this.setTitle()
        })
        .catch(err => {
          if (err.return_code === '-1') {
            return (location.href = err.return_data)
          }
        })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      let res = await apiMiniSaoMaInfo({
        Type: this.options.type,
        CodeId: this.options.codeID,
        Code: this.options.code,
        OpenIdN: '',
        EActivityID: this.options.EActivityID,
        TempType: this.temptype || '',
        segmentBatchCodeSerialNumbers: this.options.segmentBatchCodeSerialNumbers || 0
      })
      if (this.$ck(res, false)) {
        let data = res.return_data
        // 判断是否需要获取头像昵称
        this.$store.commit('scanAuth/setNeedAuth', !!data.gleannickname)

        this.activityId = data.activityid
        this.ecodeId = data.ecodeid
        this.codeId = data.codeid
        this.code = data.code
        this.codesegment = data.codesegment
        this.codebatch = data.codebatch
        this.fwinfo = data.fwinfo
        this.scanCount = data.scancount
        this.ruleInfo.activityTitle = data.activetitle
        this.ruleInfo.startTime = data.activetime && data.activetime.split('至')[0]
        this.ruleInfo.endTime = data.activetime && data.activetime.split('至')[1]
        this.ruleInfo.ruleContent = data.rulecontent
        this.prizeList = data.listsaomaactivityprize
        this.isStartWxLocation = data.isstartwxlocation
        this.isLimitArea = data.islimitarea
        this.isLoadWxLoaction = this.islimitarea
        this.showPrizeListPosition = data.showprizelistposition
        this.isNeedVerifyCode = data.isneedverifycode
        this.verifyCodeTips = data.verifycodetips
        this.isOpenCoupon = data.isopencoupon
        this.awardId = data.awardid
        this.isGetPrize = data.isgetprize
        this.firstScanCodeTime = data.awardtime
        this.isOpenIdentity = data.isopenidentity
        // 商品信息
        this.fwproinfo = data.fwproinfo || {}
        this.fwproinfo.yundianwxid = data.yundianwxid
        this.fwproinfo.yundianproductpath = data.yundianproductpath
        // 追溯数据
        this.scanDetailData = data.validatecode || {}
        this.setScanDealerInfo(data.dealerinfo)
        try {
          // 因每个模板contentJson和otherPageSetJson有差异，所以这里不做赋值，在每个对应模板赋值
          this.contentJson = JSON.parse(res.return_data.contentjson)
          // 如果是导购的错误的不用执行接下来的操作
          if (this.temptype === '27' && [1, 2, 3, 4].includes(this.dgerrortype)) {
            return
          }
          this.otherPageSetJson = data.otherpagesetjson ? JSON.parse(data.otherpagesetjson) : ''

          let otherPageSetJson = this.otherPageSetJson
          // 是否开启了奖品领取提示
          if (otherPageSetJson.IsShowAwardTipsDialog) {
            this.getAwardForWaitList()
          }
          // 领奖后自动跳转统一处理
          this.isAutoJump = otherPageSetJson.SaoMaResultAutoJumpPage?.IsSaoMaResultAutoJumpPage === 1
          this.autoJumpInfo.SaoMaResultAutoJumpPageText =
            otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPageText
          this.autoJumpInfo.SaoMaResultAutoJumpPageTime =
            otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPageTime
          this.autoJumpInfo.SaoMaResultAutoJumpPagePathSetting =
            otherPageSetJson.SaoMaResultAutoJumpPage?.SaoMaResultAutoJumpPagePathSetting
        } catch (error) {
          console.error(error)
        }
        // 是否开启身份筛选
        if (this.isOpenIdentity) {
          let identityInfo = await apiSaomaIdentity({
            activityid: data.activityid,
            codeid: data.codeid,
            code: data.code
          })
          if (this.$ck(identityInfo)) {
            if (identityInfo.return_data.type === 0) {
              this.storeRegisterUrl = identityInfo.return_data.mdurl
              this.storeRegisterAppid = identityInfo.return_data.appid
              await new Promise(resolve => {
                this.identityVisible = true
                this.identityResolve = resolve
              })
            }
          }
        }
        // 是否开启地理位置信息
        if (this.isStartWxLocation && !this.options.isboss) {
          // 非店老板不用获取
          this.getCity()
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
      } else {
        this.dropError({
          code: this.options.code,
          msg: res.return_msg
        })
      }
      /* #endif */
    },
    async handleRegisterAward() {
      let params = {}
      let data = {}
      /* #ifdef H5 */
      params = {
        memberlogin: getQuery('m'),
        code: this.fwCode,
        openid: this.openId
      }
      data = await apiGetIsRegisterInfo({
        ...params,
        activityid: this.activityId
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      params = {
        code: this.code,
        memberlogin: this.options.m
      }
      data = await apiGetSaoMaIsRegisterInfo({
        ...params,
        activityid: this.activityId
      })
      /* #endif */
      const collectConfig = data?.return_data || {}
      if (collectConfig.IsRegister && !collectConfig.isRegistered) {
        this.isShowCollectDialog = true
        this.currentCollectMode = 1
        this.collectConfig = collectConfig
        this.collectConfig.prizeid = this.awardId
        this.collectConfig.activityid = this.activityId
        this.collectConfig.codeid = this.codeId
        this.collectConfig.activitytitle = this.ruleInfo.activityTitle
      } else {
        this.saveRegisterAward()
      }
    },
    async saveRegisterAward() {
      this.$refs.winDialog?.handleReceive?.(true, true)
    },
    // 登记领奖
    async sumbitAwardApply(isCheckUserInfo = true) {
      // 验证码领奖 verifyCode不为空表示校验成功了
      if (this.isNeedVerifyCode && this.verifyCode === '') {
        this.codeVisible = true
        return
      }

      if (this.busy) return
      this.busy = true
      this.$loading.show()
      /* #ifdef H5 */
      apiSumbitAwardApply({
        M: getQuery('m'),
        ECodeId: this.ecodeId,
        Openid: this.openId,
        IsNeedCollectUserInfo: isCheckUserInfo,
        CodeType: getQuery('type'),
        IsNews: getQuery('IsNews') || undefined, // 已经关注从图文消息进入
        VerifyCode: this.verifyCode
      })
        .then(res => {
          this.busy = false
          // 结束动画状态
          this.isStartGame = false
          if (!res) {
            // 没有返回数据
            this.$loading.hide()
            this.$msg('系统繁忙，请联系客服！')
            return
          }
          const returnData = res.return_data
          if (returnData) {
            // 开启用户信息收集
            if (returnData.IsCheckUser) {
              this.$loading.hide()
              this.isShowCollectDialog = true
              this.collectConfig = returnData
              return
            }

            // 关注领奖 & 不是从关注从图文消息进入
            if (returnData.IsAwardByDirect === 0 && !getQuery('IsNews')) {
              this.$loading.hide()
              this.gzhQrCode = returnData.ActivityQrCode
              this.isShowGzhDialog = true
              return
            }

            // 导购员登记成功（关联导购码）
            if (returnData.ParamCode === '100') {
              // 已登记弹窗提示当是模版27的时候
              if (this.temptype === '27') {
                this.nowinState = 6
                this.isShowNowinDialog = true
                this.$loading.hide()
                return
              } else {
                location.href = `/SaoMa/SaoMaAwardResult?isdgmdj=1&activityID=${this.activityId}&m=${getQuery(
                  'm'
                )}&openid=${this.openId}`
                this.$loading.hide()
                return
              }
            }
          }
          const submitAwardApplyReturnData = res.return_data
          if (res.return_code === '0') {
            // 已经领过奖（此码已领奖，或正在处理中）
            if (submitAwardApplyReturnData && submitAwardApplyReturnData.AwardId > 0) {
              // 领奖成功
              this.awardId = submitAwardApplyReturnData.AwardId
              this.paramCode = submitAwardApplyReturnData.ParamCode
              if (this.paramCode === '1') {
                this.isFristAward = false
              }
              this.getAwardPageInfo()
            } else {
              // 如果有互动效果，开启
              if (this.$refs.gameRef) {
                this.$loading.hide()
                this.$refs.gameRef[0].startGame()
              }
              // 获取中奖结果
              this.getAwardResult(res)
            }
          }
        })
        .catch(err => {
          this.$loading.hide()
          // 结束动画状态
          this.isStartGame = false
          this.busy = false
          const returnData = err.return_data

          // 已登记弹窗提示当是模版27的时候
          if (returnData?.ParamCode === '100' && this.temptype === '27') {
            this.nowinState = 6
            this.isShowNowinDialog = true
            return
          }

          // 异常情况
          if (!returnData && err.return_code !== '209') {
            // this.$msg(err.return_msg)
            this.openDialog(decodeURIComponent(err.return_msg))
            return
          }
          // 活动未开启
          if (err.return_code === '4' && returnData.ParamCode === '4') {
            this.nowinState = 4
            this.isShowNowinDialog = true
            return
          }
          // 活动未开始
          if (err.return_code === '2' && returnData.ParamCode === '2') {
            this.nowinState = 2
            this.isShowNowinDialog = true
            return
          }
          // 活动已结束
          if (err.return_code === '2' && returnData.ParamCode === '0') {
            this.nowinState = 3
            this.isShowNowinDialog = true
            return
          }
          // 其他人扫码未抽奖（不是首次扫码人）
          if (err.return_code === '14' && returnData.ParamCode === '14') {
            // 是否开了首次扫码领奖限制
            // if (returnData.isprizerestrict) {
            this.nowinState = 5
            this.firstScanCodeNickName = returnData.FirstScanCodeNickName
            this.firstScanCodeTime = returnData.FirstScanCodeTime
            // } else {
            //   this.nowinState = 1
            //   this.firstScanCodeNickName = returnData.Nickname
            //   this.firstScanCodeTime = returnData.Addtime
            // }
            this.isShowNowinDialog = true
            return
          }
          // 未授权定位/未在指定地区
          if (err.return_code === '101' && returnData.ParamCode === '101') {
            uni.showToast({
              icon: 'none',
              title:
                '亲，该活动需要获取地理位置才能参与，请刷新页面后在弹出授权请求框中选择“允许”再重新领奖~(请确保手机微信定位权限已开启）'
            })
            return
          }
          // 企微跳转授权
          // console.log('企微跳转授权',err.return_code,returnData.RedirectUrl)
          if (err.return_code === '209') {
            location.href = returnData.RedirectUrl
          }

          // 未在指定地区
          if (err.return_code === '102' && returnData.ParamCode === '102') {
            this.openDialog(err.return_msg)
            return
          }
          // 需要添加企微活码
          if (err.return_code === '208') {
            this.activityQrCode = returnData.ActivityQrCode
            this.isShowWorkwxDialog = true
            return
          }

          if (['117', '94'].includes(returnData.ParamCode) && ['117', '94'].includes(err.return_code)) {
            this.$msg(decodeURIComponent(err.return_msg))
            return
          }

          if (
            ['16', '96', '97', '95'].includes(err.return_code) &&
            ['16', '96', '97', '95'].includes(err.return_code)
          ) {
            this.$msg(decodeURIComponent(err.return_msg))
            return
          }
          // 其他错误提示
          // this.$msg(err.return_msg)
          this.openDialog(decodeURIComponent(err.return_msg))
        })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      const data = {
        codetype: this.options.type,
        ctxid: this.options.ctxId,
        ecodeid: this.ecodeId,
        IsNeedCollectUserInfo: isCheckUserInfo,
        VerifyCode: this.verifyCode,
        isnews: this.options.isnews !== 'false'
      }
      let res = await apiSumbitawardApply(data, { loading: !!this.$refs.gameRef })
      // 结束动画状态
      this.isStartGame = false
      this.busy = false
      if (res.return_code === 0) {
        if (res.return_data && res.return_data.AwardId > 0) {
          // 领奖成功(重复领奖)
          this.awardId = res.return_data.AwardId
          // 活动ID
          this.activityId = res.return_data.ActivityID
          this.paramCode = res.return_data.ParamCode
          if (this.paramCode === '1') {
            this.isFristAward = false
          }
          this.getAwardPageInfo()
        } else if (res.return_data.IsCheckUser) {
          // 需要完善用户信息
          this.$loading.hide()
          this.isShowCollectDialog = true
          this.collectConfig = res.return_data
        } else if (res.return_data.IsAwardByDirect === 0) {
          this.$loading.hide()
          this.gzhQrCode = res.return_data.ActivityQrCode
          this.isShowGzhDialog = true
        } else {
          // 如果有互动效果
          if (this.$refs.gameRef) {
            this.$loading.hide()
            this.$refs.gameRef[0].startGame()
          } else {
            this.$loading.show('正在排队领取中')
          }

          this.isFristAward = true
          this.loop.pollingWaitSeconds = 700
          this.loop.totalSeconds = 700
          this.loopGetAwardId()
        }
      } else {
        // 已登记弹窗提示
        if (res.return_data?.ParamCode === '100' && this.temptype === '27') {
          this.nowinState = 6
          this.isShowNowinDialog = true
          this.$loading.hide()
          return
        }

        this.$loading.hide()
        switch (res.return_code) {
          case 208: // 添加企微领奖
            this.activityQrCode = res.return_data.ActivityQrCode
            this.isShowWorkwxDialog = true
            break
          case 101: // 未拿到经纬度
            this.getCity(true)
            break
          case 4: // 活动未开启
            this.nowinState = 4
            this.isShowNowinDialog = true
            break
          case 2: // 活动未开始 | 活动已结束
            this.nowinState = res.return_data.ParamCode === '2' ? 2 : 3
            this.isShowNowinDialog = true
            break
          case 14: // 其他人扫码未抽奖（不是首次扫码人）
            this.nowinState = 5
            this.firstScanCodeNickName = res.return_data.FirstScanCodeNickName
            // this.firstScanCodeNickName = res.return_data.isprizerestrict
            //   ? res.return_data.FirstScanCodeNickName
            //   : res.return_data.Nickname
            this.firstScanCodeTime = res.return_data.FirstScanCodeTime
            // this.firstScanCodeTime = res.return_data.isprizerestrict
            //   ? res.return_data.FirstScanCodeTime
            //   : res.return_data.Addtime
            this.isShowNowinDialog = true
            break
          case 117: // 活动参与限制
            this.openDialog(decodeURIComponent(res.return_msg))
            break
          case 600009: // 过期了重新走一遍流程
            uni.reLaunch({
              url: `/packages/src/scan-templates/transfer?q=${this.options.code}`
            })
            break
          default:
            this.openDialog(decodeURIComponent(res.return_msg))
        }
      }
      /* #endif */
    },
    /** 轮训查询 */
    async loopGetAwardId() {
      if (this.loop.totalSeconds > 3000 * 6) {
        // this.$loading.hide()
        // 执行6次,无结果,则断开请求
        this.openDialog('活动异常，请稍后重新扫码～')
        return false
      }
      let res = await apiMiniAwardreSultn({
        Code: this.code,
        ActivityID: this.activityId
      })
      if (res.return_code === 0 || res.return_code === 3) {
        // this.$loading.hide()
        // 中奖 || 未中奖（首次）
        this.awardId = res.return_data.AwardId
        this.isFristAward = true
        this.getAwardPageInfo({
          needAnimation: !!this.$refs.gameRef, // 是否需要动画，如需要，延时开启弹窗和动画
          gameRef: this.$refs.gameRef ? this.$refs.gameRef[0] : null // 游戏组件实例
        })
      } else if (res.return_code === -1000 || res.return_code === -1001) {
        // 领奖中
        setTimeout(() => {
          this.loop.pollingWaitSeconds += 600
          this.loop.totalSeconds += 600
          if (this.loop.pollingWaitSeconds > 3000) {
            this.loop.pollingWaitSeconds = 3000
          }
          this.loopGetAwardId() // 继续轮询
        }, this.loop.pollingWaitSeconds)
      } else {
        this.$loading.hide()
        this.openDialog('活动异常，请稍后重新扫码～')
      }
    },
    // 领奖结果
    getAwardResult(submitAwardApplyRes) {
      const config = {
        needAnimation: !!this.$refs.gameRef, // 是否需要动画，如需要，延时开启弹窗和动画
        gameRef: this.$refs.gameRef ? this.$refs.gameRef[0] : null // 游戏组件实例
      }
      /* #ifdef H5 */
      apiGetAwardResult({
        memberlogin: getQuery('m'),
        code: this.fwCode,
        ESaoMaRecordID: this.ecodeId,
        saoMaRecordID: this.ecodeId,
        openid: this.openId,
        saoMaType: getQuery('type'),
        activityId: this.activityId
      })
        .then(res => {
          this.isFristAward = true
          this.awardId = res.return_data.AwardId
          // 中奖结果id成功
          this.getAwardPageInfo(config)
        })
        .catch(err => {
          if (err.return_code === '3') {
            this.$loading.hide()
            // 未中奖
            this.isFristAward = true
            this.awardId = err.return_data.AwardId
            // 中奖结果id成功
            this.nowinState = 0
            config.gameRef?.successCb(-1)
            config.needAnimation
              ? setTimeout(() => {
                  this.isShowNowinDialog = true
                }, 5000)
              : (this.isShowNowinDialog = true)
            return
          }

          if (err.return_code === '-1000' || err.return_code === '-1001') {
            // 处理中，再次请求(请求中,还在队列申请处理中！)
            setTimeout(() => {
              this.getAwardResult(submitAwardApplyRes)
            }, 1000)
          } else {
            config.gameRef?.endGame() // 停止动画
            // 中奖结果id异常
            uni.showToast({
              icon: 'none',
              title: err.return_msg
            })
          }
        })
      /* #endif */
    },
    // 获奖结果
    getAwardPageInfo(
      config = {
        needAnimation: false, // 是否需要动画，如需要，延时开启弹窗和动画
        gameRef: null // 游戏组件实例
      }
    ) {
      !config.needAnimation && this.$loading.show()
      /* #ifdef H5 */
      apiGetAwardPageInfo({
        OpenId: this.openId,
        AwardID: this.awardId,
        ActivityID: this.activityId,
        m: getQuery('m'),
        IsDgmDj: getQuery('isdgmdj') || 0,
        CodeID: this.ecodeId,
        IsFrist: this.isFristAward || undefined
      }).then(res => {
        this.$loading.hide()
        // 上次领奖时间
        if (res.return_data.isprizerestrict) {
          this.firstScanCodeTime = res.return_data.FirstDateTime
        } else {
          this.firstScanCodeTime = res.return_data.Addtime
        }
        // 自己
        if (res.return_data.IsSelfStatus === 0) {
          // 未中奖
          if (res.return_data.IsWiningCode === 0) {
            this.nowinState = 0
            config.gameRef?.successCb(-1)
            config.needAnimation
              ? setTimeout(() => {
                  this.isShowNowinDialog = true
                }, 5000)
              : (this.isShowNowinDialog = true)
          } else {
            // 中奖
            this.prizeInfo = { ...res.return_data, activityId: this.activityId }
            config.gameRef?.successCb(res.return_data.SaoMaActivityPrizeID)
            config.needAnimation
              ? setTimeout(() => {
                  this.isShowWinDialog = true
                }, 5000)
              : (this.isShowWinDialog = true)
          }
        } else {
          // 结束旋转动画
          config.gameRef?.endGame()
          // 其他人
          this.prizeInfo = { ...res.return_data, activityId: this.activityId }
          this.nowinState = 1
          // 是否开了首次扫码领奖限制
          if (res.return_data.isprizerestrict) {
            this.firstScanCodeNickName = res.return_data.FirstNickName
            this.firstScanCodeTime = res.return_data.FirstDateTime
          } else {
            this.firstScanCodeNickName = res.return_data.Nickname
            this.firstScanCodeTime = res.return_data.Addtime
          }
          this.isShowNowinDialog = true
        }
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      // 获取中奖详情
      apiAwardpageInfo({
        AwardID: this.awardId,
        ActivityID: this.activityId,
        CodeID: this.codeId,
        IsFrist: this.isFristAward ? 1 : 0
      }).then(res => {
        this.$loading.hide()
        if (res.return_code === 0) {
          this.firstScanCodeTime = res.return_data.isprizerestrict
            ? res.return_data.FirstDateTime
            : res.return_data.Addtime

          if (res.return_data.IsSelfStatus === 0) {
            // 未中奖
            if (res.return_data.IsWiningCode === 0) {
              this.nowinState = 0
              this.notWinningMsg = res.return_data.NotWinningMsg
              config.gameRef?.successCb(-1)
              config.needAnimation
                ? setTimeout(() => {
                    this.isShowNowinDialog = true
                  }, 5000)
                : (this.isShowNowinDialog = true)
            } else {
              // 中奖
              let OtherPageSetJson = JSON.parse(res.return_data.OtherPageSetJson || '{}')
              this.prizeInfo = { ...res.return_data, OtherPageSetJson, activityId: this.activityId }
              config.gameRef?.successCb(res.return_data.SaoMaActivityPrizeID)
              config.needAnimation
                ? setTimeout(() => {
                    this.isShowWinDialog = true
                  }, 5000)
                : (this.isShowWinDialog = true)
            }
          } else {
            // 结束旋转动画
            config.gameRef?.endGame()
            // 其他人
            this.nowinState = 1
            this.prizeInfo = { ...res.return_data, activityId: this.activityId }
            this.firstScanCodeNickName = res.return_data.isprizerestrict
              ? res.return_data.FirstNickName
              : res.return_data.Nickname
            this.firstScanCodeTime = res.return_data.isprizerestrict
              ? res.return_data.FirstDateTime
              : res.return_data.Addtime
            this.isShowNowinDialog = true
          }
        } else if (res.return_code === 600009) {
          // 结束旋转动画
          config.gameRef?.endGame()
          uni.reLaunch({
            url: `/packages/src/scan-templates/transfer?q=${this.options.code}`
          })
        } else {
          // 结束旋转动画
          config.gameRef?.endGame()
          this.$msg(res.return_msg)
        }
      })
      /* #endif */
    },
    // 查询待领取的奖品列表
    getAwardForWaitList() {
      let params = {
        /* #ifdef H5 */
        memberlogin: getQuery('m'),
        openid: this.openId
        /* #endif */
      }
      let api
      // #ifdef H5
      api = apiGetAwardForWaitList
      // #endif
      // #ifdef MP-WEIXIN
      api = apiAwardWaitList
      // #endif
      api(params).then(res => {
        if (res.return_data && res.return_data.length > 0) {
          this.isShowAwardTipsDialog = true
          this.awardForWaitList = res.return_data
          this.isShowUnclaimedDialog = true
        }
      })
    },
    // 中奖名单
    getActivityZJDataList(pageSize, pageIndex) {
      let params = {
        /* #ifdef H5 */
        memberlogin: getQuery('m'),
        /* #endif */
        activityId: this.activityId,
        pageSize: pageSize || 10,
        pageIndex: pageIndex || 1
      }
      let api
      // #ifdef H5
      api = apiGetActivityZJDataList
      // #endif
      // #ifdef MP-WEIXIN
      api = apiActivityZJList
      // #endif

      api(params).then(res => {
        if (res.return_data && res.return_data.ymFwCodeAwardRecordZJList) {
          this.rankList = res.return_data.ymFwCodeAwardRecordZJList
        }
      })
    },
    /* 红包券 开始 */
    async initCoupon() {
      /* #ifdef H5 */
      try {
        this.$loading.show()
        const couponResult = await this.getCouponResult()
        this.$loading.hide()
        if (!['0', '1', '2', '100'].includes(couponResult.code)) {
          return this.openDialog(couponResult.msg)
        }
        this.$loading.show()
        const couponListRes = await this.getCouponList()
        this.$loading.hide()
        if (!['0', '34001'].includes(couponListRes.code)) {
          return this.openDialog(couponListRes.msg)
        }
        this.unlockCouponList = couponListRes.data.DataList || []
        const hasUnlockCoupon = couponListRes.data.IsHasCanCouponUnlock || false
        // 扫描商品与红包券指定商品是否一致
        if (hasUnlockCoupon) {
          if (couponResult.code === '100') {
            if (this.unlockCouponList.length === 1) {
              // 自动解锁红包
              this.unlockCoupon(this.unlockCouponList[0].CouponRecordID)
            } else if (this.unlockCouponList.length > 1) {
              this.unlockListVisible = true
            }
          }
        } else if (this.unlockCouponList.length > 0) {
          this.noUnlockListVisible = true
        }
      } catch (error) {
        this.openDialog('网络超时，请稍后重试！')
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
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
        // 扫描商品与红包券指定商品是否一致
        if (hasUnlockCoupon) {
          if (couponResult.code === 100) {
            if (this.unlockCouponList.length === 1) {
              // 自动解锁红包
              this.unlockCoupon(this.unlockCouponList[0].couponrecordid)
            } else if (this.unlockCouponList.length > 1) {
              this.unlockListVisible = true
            }
          }
        } else if (this.unlockCouponList.length > 0) {
          this.noUnlockListVisible = true
        }
      } catch (error) {
        console.log(error)
        this.openDialog('网络超时，请稍后重试！')
      }
      /* #endif */
    },
    // 获取当前码解锁红包券
    getCouponResult() {
      return new Promise(resolve => {
        /* #ifdef H5 */
        apiGetCodeCouponRecord({
          memberlogin: getQuery('m'),
          code: getQuery('code'),
          codeId: getQuery('codeID'),
          openid: this.openId
        })
          .then(res => {
            resolve({
              code: res.return_code, // 100可以往下获取待解锁记录，判断待解锁红包，0该码已被解锁，1该码已经领过奖，2非首次扫码人
              data: [res.return_data],
              msg: res.return_msg
            })
          })
          .catch(res => {
            resolve({
              code: res.return_code, // 100可以往下获取待解锁记录，判断待解锁红包，0该码已被解锁，1该码已经领过奖，2非首次扫码人
              data: [],
              msg: res.return_msg
            })
          })
        /* #endif */
        /* #ifdef MP-WEIXIN */
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
        /* #endif */
      })
    },
    // 获取待解锁红包券列表
    getCouponList() {
      return new Promise(resolve => {
        /* #ifdef H5 */
        apiGetCouponRecord({
          memberlogin: getQuery('m'),
          codeId: getQuery('codeID'),
          code: getQuery('code'),
          openid: this.openId
        })
          .then(res => {
            resolve({
              code: res.return_code, // 34001 无待解锁数据
              data: res.return_data || {
                ...res.return_data,
                datalist: []
              },
              msg: res.return_msg
            })
          })
          .catch(res => {
            resolve({
              code: res.return_code, // 34001 无待解锁数据
              data: res.return_data || {
                ...res.return_data,
                datalist: []
              },
              msg: res.return_msg
            })
          })
        /* #endif */
        /* #ifdef MP-WEIXIN */
        apiCouponRecord({
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
        /* #endif */
      })
    },
    // 解锁红包券
    unlockCoupon(CouponRecordID) {
      // #ifdef MP-WEIXIN
      this.$loading.show()
      // #endif
      return new Promise(resolve => {
        /* #ifdef H5 */
        this.$loading.show()
        apiCouponUnLock({
          memberlogin: getQuery('m'),
          openid: this.openId,
          codeId: getQuery('codeID'),
          code: getQuery('code'),
          CouponRecordID
        })
          .then(res => {
            this.$loading.hide()
            let data = this.$toLowerKey(res.return_data)
            this.unlockAmount = data.unlockamount
            this.unlockHbtype = data.hbtype
            this.unlockHbid = data.awardid
            this.unlockVisible = true
            resolve({
              code: res.return_code,
              msg: res.return_msg
            })
          })
          .catch(res => {
            this.$loading.hide()
            this.$msg(res.return_msg)
            resolve({
              code: res.return_code,
              msg: res.return_msg
            })
          })
        /* #endif */
        /* #ifdef MP-WEIXIN */
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
        /* #endif */
      })
    },
    async chooseUnlock(item) {
      let res = {}
      /* #ifdef H5 */
      res = await this.unlockCoupon(item.CouponRecordID)
      if (res.code === '0') {
        this.unlockListVisible = false
      } else {
        this.$msg(res.msg)
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      res = await this.unlockCoupon(item.couponrecordid)
      if (res.code === 0) {
        this.unlockListVisible = false
      } else {
        this.$msg(res.msg)
      }
      /* #endif */
    },
    /* 红包券 结束 */
    // 验证码领奖校验
    handleJudgeValidVerifyCode(code) {
      let params = {
        VerifyCode: code,
        /* #ifdef H5 */
        openId: this.openId,
        memberlogin: getQuery('m')
        /* #endif */
      }
      let api
      // #ifdef H5
      api = apiJudgeValidVerifyCode
      params.code = getQuery('code')
      // #endif
      // #ifdef MP-WEIXIN
      api = apiVerifyCode
      params.code = this.code
      // #endif
      api(params)
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
    // 显示日期选择
    handleShowDatePicker(index) {
      this.dateIndex = index
      this.isShowDatePicker = true
    },
    // 确定选择日期
    handleDatePickerConfirm(e) {
      this.dateValue = `${e.year}-${e.month}-${e.day}`
      this.$refs.collectDialog && this.$refs.collectDialog.dateConfirm(this.dateIndex, this.dateValue)
    },
    /* #ifdef MP-WEIXIN */
    /** 获取定位 */
    async getCity(isAward) {
      let Location = await getLocation()
      if (!Location.latitude || !Location.longitude) {
        uni.showToast({
          icon: 'none',
          title: '亲，该活动需要获取地理位置才能参与，请在点击开奖时“允许”地理位置授权～'
        })
        return
      }
      let res = await apiMiniSetSaomarecordwxLocation({
        Type: Number(this.options.type),
        codeId: this.codeId,
        LatLng: `${Location.latitude},${Location.longitude}`
      })
      if (this.$ck(res, true) && isAward) {
        this.sumbitAwardApply()
      }
    },
    /* #endif */
    /* #ifdef H5 */
    // 微信config配置
    initWXConfig(wxConfig) {
      this.$wechat.config({
        debug: false,
        appId: wxConfig.appId,
        timestamp: wxConfig.timestamp,
        nonceStr: wxConfig.nonceStr,
        signature: wxConfig.signature,
        jsApiList: ['getLocation', 'scanQRCode'],
        openTagList: ['wx-open-launch-weapp'] // 跳转小程序时必填
      })

      this.$wechat.ready(() => {
        this.$wechat.hideOptionMenu() // 隐藏分享菜单

        // 如需其他微信配置做的事在每个模板中实现（如跳转小程序）
        this.handleWxConfigReadyCallback && this.handleWxConfigReadyCallback()

        // 是否开启地理位置信息
        if (this.isStartWxLocation) {
          // 强制获取地理位置
          if (this.isLimitArea || this.isRecord) {
            this.isLoadWxLoaction = false
          }
          this.$loading.show('获取地理位置中')
          this.$wechat.getLocation({
            type: 'gcj02',
            success: res => {
              console.log('当前位置的经纬度：', res.longitude, res.latitude)
              let params = {
                m: getQuery('m'),
                codeID: getQuery('codeID'),
                latlng: res.latitude + ',' + res.longitude,
                qqLatLng: res.latitude + ',' + res.longitude,
                codeType: getQuery('type'),
                openId: this.openId
              }
              this.setSaoMaRecordWXLocation(params)
            },
            complete: () => {
              this.$loading.hide()
            }
          })
        }
      })
    },
    // 请求是否为指定活动区域内
    setSaoMaRecordWXLocation(params) {
      apiSetSaoMaRecordWXLocation(params)
        .then(res => {
          this.isLoadWxLoaction = true
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    }
    /* #endif */
  }
}

export default scanApiMixin
