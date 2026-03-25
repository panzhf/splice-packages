<template>
  <view>
    <view v-if="isLoaded" class="puzzle-page flex flex-column" :style="{ 'background-color': info.BgColor }">
      <!-- #ifdef MP-WEIXIN -->
      <TitleBar :title="info.Title" textcolor="#fff" type="detail" show-nav-title is-transparent />
      <!-- #endif -->
      <!-- 背景图 -->
      <image :src="info.BgImgPath" mode="widthFix" class="bg" />

      <view class="main flex flex-column flex-1">
        <!-- 活动规则 -->
        <image :src="info.TipImgPath" class="rule" :style="{ top: ruleTop }" @tap="handleShowDesc" />
        <!-- 拼图区域 -->
        <view class="puzzle-wrapper" :class="'skin' + skin">
          <view class="puzzle-content" :style="{ 'background-image': `url(${puzzleInfo.bg})` }">
            <view class="count flex flex-between fs-24">
              <!-- 优先展示获得的奖池，其次是期数 -->
              <view>{{ hadPrizePool }}</view>
              <view>已获得{{ newPuzzle.MyChanceNum || 0 }}张</view>
            </view>
            <view class="image-list" :style="layoutStyle">
              <view
                v-for="(item, index) in puzzleImgs"
                :key="index"
                class="image-item"
                :style="{
                  width: `${layoutInfo.width}rpx`,
                  height: `${layoutInfo.height}rpx`
                }"
              >
                <!-- 拼图一角 -->
                <view
                  v-if="item.state >= 1"
                  class="img-wrapper"
                  :style="{
                    width: pieceInfo.width + 'px',
                    height: pieceInfo.height + 'px',
                    transform: 'scale(' + scaleRatio + ')'
                  }"
                >
                  <image
                    :src="info.IntegratorImgPath"
                    :style="{
                      transform: `translate(-${item.x}px, -${item.y}px)`,
                      width: puzzleBgInfo.width + 'px',
                      height: puzzleBgInfo.height + 'px'
                    }"
                    class="img"
                  />
                </view>
                <!-- 奖池图标 -->
                <view
                  v-if="item.prizeStatus >= 1 && !!item.prizeIcon"
                  class="prize-icon-box flex flex-middle flex-center"
                  :class="{ 'animation-flash': item.prizeStatus === 1 }"
                >
                  <image :src="item.prizeIcon" class="icon" />
                </view>
                <!-- 未拼成封面 -->
                <image
                  v-if="item.state <= 1"
                  :src="info.SliceImgPath"
                  class="cover"
                  :class="{ 'animation-flip': item.state === 1 }"
                />
              </view>
            </view>
          </view>
        </view>
        <!-- 开奖时间 -->
        <view
          class="time-box fs-34 text-center"
          :class="'skin' + skin"
          :style="{ 'background-image': `url(${puzzleInfo.time})` }"
        >
          本期开奖：
          <text class="fs-36">{{ info.CurrentPeriodLotteryTime }}</text>
        </view>
        <!-- 积分兑换按钮 -->
        <view v-if="info.IsEnabledPointExchange" class="score-box">
          <image :src="pointBtn" class="score-btn" @tap="handleShowScore" />
          <!-- #ifdef MP-WEIXIN -->
          <auth-button :mode="2" />
          <!-- #endif -->
        </view>

        <!-- 中奖名单 -->
        <winner-list v-if="isShowWin" tip="上期获奖名单" :content="formatWinningList" />
        <!-- 奖池 -->
        <prize-pool v-if="info.IsShowPrizeList" :list="puzzlePoolList" />
        <!-- #ifdef MP-WEIXIN -->
        <!-- 百年糊涂定制模板有图片广告 -->
        <view v-if="adInfo.isShow" class="ad-container">
          <ad-swiper :list="adInfo.list" />
        </view>
        <!-- #endif -->
        <!-- 底部按钮 -->
        <template v-if="btnInfo.IsShowBottomBtn && (btnInfo.IsShowUserCenter || btnInfo.IsShowMyPrizeBtn)">
          <view class="footer-gap" />
          <view class="btn-group flex flex-middle flex-center">
            <view v-if="btnInfo.IsShowUserCenter" class="icon">
              <custom-button :info="btnInfo.UserCenterBtnItem" />
            </view>
            <view v-if="btnInfo.IsShowMyPrizeBtn" class="icon">
              <custom-button :info="btnInfo.MyPrizeBtnItem" />
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <auth-button :mode="2" />
            <!-- #endif -->
          </view>
        </template>
      </view>
      <view v-if="isShowCover" class="page-cover" @tap="handleShowLocation" />
    </view>
    <!-- 获得拼图 -->
    <remind-dialog v-model="isShowRemind" :mode="remindMode" :info="newPuzzle" @refresh="onRefreshPuzzle" />
    <!-- 活动说明 | 已获奖品 -->
    <desc-dialog
      v-model="isShowDesc"
      :info="{
        actId: actInfo.aid,
        Title: info.Title,
        StartTime: info.StartTime,
        EndTime: info.EndTime,
        Rule: info.Rule
      }"
      :top="top"
      :desc="descDialogTip"
    />
    <!-- 中奖 | 未中奖 -->
    <prize-dialog v-model="isShowPrize" :info="prizeInfo" :top="top" @refresh="updateNewPuzzle" />
    <!-- 积分兑换 -->
    <score-dialog
      v-model="isShowScore"
      :info="{ actId: actInfo.aid, periodId: curPeriod.Id, point: info.PointAmount }"
      @change="onReload(1)"
      @change-refresh="onReload(2)"
      @refresh="onReload(3)"
    />
    <!-- #ifdef MP-WEIXIN -->
    <loading v-if="!isLoaded" use-default />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <md-follow-gzh ref="follow" @status="handleChangeGzStatus" />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <common-popup
      v-model="isShowLocDialog"
      title="获取你的位置信息"
      type="confirm"
      confirm-text="去开启"
      @confirm="onLocation"
    >
      <text>亲，该活动需要获取地理位置才能参与\n（请确保手机微信定位权限已开启）</text>
    </common-popup>
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <common-popup
      v-model="isShowLocDialog"
      title="获取你的位置信息"
      confirm-text="立即刷新"
      custom-style="width: 640rpx"
      @close="onLocation"
    >
      <view>
        亲，该活动需要获取地理位置才能参与，请刷新页面后在弹出授权请求框中选择“允许”（请确保手机微信定位权限已开启）
      </view>
    </common-popup>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import subscribeMsg from 'packages/mixins/subscribe-msg'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import Loading from 'packages/components/loading/index.vue'
import AdSwiper from 'packages/components/ad-swiper/ad-swiper.vue'
import { getUrlQuery } from 'packages/utils/function'
/* #endif */
/* #ifdef H5 */
import { apiGetwxdata } from 'packages/api/common'
/* #endif */
import {
  /* #ifdef MP-WEIXIN */
  apiGetActID,
  /* #endif */
  apiGetActivity,
  apiGetActChanceIsNew,
  apiGetIsAwardNotice,
  apiGetActivityAwardRecords,
  apiGetSubscribeTemplateId,
  apiAddSubscribeRecord,
  apiGetJigsawpuzzlePrize,
  apiGetAcivityParticipationCount,
  apiSetLocation
} from 'packages/api/prizePool'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { setTitleMixin } from 'packages/mixins/navigation'
import imgMixin from 'packages/mixins/img'
import RemindDialog from './components/remind-dialog.vue'
import DescDialog from './components/desc-dialog.vue'
import PrizeDialog from './components/prize-dialog.vue'
import ScoreDialog from './components/score-dialog.vue'
import WinnerList from './components/winner-list.vue'
import PrizePool from './components/prize-pool.vue'
import CustomButton from 'packages/components/bottom-btn/bottom-btn.vue'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'

import { getPage } from '@/utils/index'

export default {
  name: 'Puzzle',
  components: {
    /* #ifdef MP-WEIXIN */
    TitleBar,
    Loading,
    AdSwiper,
    /* #endif */
    RemindDialog,
    DescDialog,
    PrizeDialog,
    ScoreDialog,
    CustomButton,
    WinnerList,
    PrizePool,
    CommonPopup
  },
  mixins: [
    packageStaticMixin,
    setTitleMixin,
    imgMixin,
    /* #ifdef MP-WEIXIN */
    subscribeMsg
    /* #endif */
  ],
  data() {
    return {
      /* #ifdef MP-WEIXIN */
      scene: '', // 小程序参数，需decode
      subscribeInfo: {
        isAlways: false, // 总是保持选择
        isAccept: false // 总是允许
      }, // 订阅消息
      adInfo: {
        isShow: false,
        list: [] // 图片广告
      },
      /* #endif */
      /* #ifdef H5 */
      wxConfig: {},
      /* #endif */
      skin: 0, // 0：默认 1：百年糊涂
      actInfo: {
        aid: '', // 活动id
        memberLogin: '' // 品牌商编号
      },
      info: {
        Title: '',
        BgColor: '',
        BgImgPath: '', //背景图片
        TipImgPath: '', //活动规则图标
        IntegratorImgPath: '', // 拼成图
        SliceImgPath: '', // 封面图
        JigsawCount: 9,
        CurrentPeriodLotteryTime: '',
        IsShowPrizeList: true,
        Rule: '',
        ShareImgPath: '',
        ShareRemark: '',
        ShareTitle: ''
      }, // 基础信息
      curPeriod: {}, // 当前期信息
      btnInfo: {}, // 底部按钮组
      puzzleImgs: [], // 拼图数据集
      puzzleBgInfo: {
        width: 0,
        height: 0
      }, // 完整图宽高
      pieceInfo: {
        width: 0,
        height: 0
      }, // 拼图每一块宽高
      isShowPrize: false, // 中奖
      prizeInfo: {}, // 中奖信息
      isShowDesc: false, // 活动说明
      isShowRemind: false, // 获得拼图弹窗
      newPuzzle: {}, // 获得新拼图
      winningList: [], // 中奖名单
      puzzlePoolList: [], // 奖池信息
      formatPoolList: [], // 奖池最小值和图标集合
      isShowScore: false, // 积分兑换弹窗
      isSubscribed: false, // 订阅本期活动/关注公众号
      isLoaded: false, // 加载标记 防止页面展示不全
      downloadImgCount: 5,
      isShowCover: false, // 页面遮罩，用于任意点击弹窗询问位置授权
      coordinate: '', // 经纬度信息`${latitude},${longitude}`
      isShowLocDialog: false, // 自定义提示授权弹窗
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
    ruleTop() {
      let style = ''
      /* #ifdef H5 */
      style = this.skin === 1 ? `94rpx` : `46rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = this.skin === 1 ? `calc(${this.top} + 68rpx)` : `calc(${this.top} + 20rpx)`
      /* #endif */
      return style
    },
    hadPrizePool() {
      return this.info.Status === 0
        ? this.newPuzzle.CurrentJackpotName
          ? `恭喜进入${this.newPuzzle.CurrentJackpotName}`
          : `第${this.curPeriod.Order}期活动`
        : this.info.StatusDesc
    },
    puzzleInfo() {
      return {
        bg: `${this.PACKAGE_STATIC_URL}puzzle/puzzle-bg.png`,
        time: `${this.PACKAGE_STATIC_URL}puzzle/time-bg.png`,
        prize: `${this.PACKAGE_STATIC_URL}puzzle/prize-icon.png`
      }
    },
    pointBtn() {
      return `${this.PACKAGE_STATIC_URL}puzzle/${this.info.Status === 0 ? 'btn-active.png' : 'btn-disabled.png'}`
    },
    layoutInfo() {
      const o = {
        6: { row: 2, col: 3, width: 202, height: 306 },
        9: { row: 3, col: 3, width: 202, height: 202 },
        12: { row: 4, col: 3, width: 202, height: 150 },
        16: { row: 4, col: 4, width: 150, height: 150 }
      }
      return o[this.info.JigsawCount]
    },
    scaleRatio() {
      // 拼图缩放比例
      let previewWidth = uni.upx2px(this.layoutInfo.width)
      let originWidth = this.pieceInfo.width
      return (previewWidth / originWidth).toFixed(3)
    },
    layoutStyle() {
      // 宫格布局
      let style = []
      style.push(`grid-template-rows: repeat(${this.layoutInfo.row}, 1fr)`)
      style.push(`grid-template-columns: repeat(${this.layoutInfo.col}, 1fr)`)
      return style.join(';')
    },
    formatWinningList() {
      // 拼接中奖文本
      const list = this.winningList.map(val => ` ${val.CustomerNickName} 获得${val.PrizeName} `)
      return list.join('    ')
    },
    isShowWin() {
      return this.winningList.length > 0
    },
    descDialogTip() {
      // 用于活动说明
      return this.info.Status === 0 && this.curPeriod.Order > 0 ? ` - 第${this.curPeriod.Order}期` : ''
    },
    remindMode() {
      let t = false
      /* #ifdef MP-WEIXIN */
      // 总是保持选择 || 已订阅
      t = this.subscribeInfo.isAlways || this.isSubscribed
      /* #endif */
      /* #ifdef H5 */
      t = this.isSubscribed
      /* #endif */
      return t ? 1 : 0
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
    if (!options.scene) return this.$msg('链接格式不正确')
    if (this.firstInit) {
      this.scene = options.scene
      let { id, m } = getUrlQuery(decodeURIComponent(options.scene))
      let aid = await this.exchangeActId({ id, m })
      this.actInfo.aid = aid
      this.actInfo.memberLogin = m
    }
    /* #endif */

    /* #ifdef H5 */
    if (!options.aid) return this.$msg('链接格式不正确')
    this.actInfo.aid = options.aid
    this.actInfo.memberLogin = options.memberlogin
    this.skin = Number(options.skin) || 0
    /* #endif */
    if (this.firstInit) {
      const isValid = await this.getInfo()
      if (!isValid) return
      await this.calcPuzzleImgs()
      await this.fetchPoolList()
      this.initPoolIcon()
    }
    this.isLoaded = true
    if (this.firstInit) {
      /* #ifdef H5 */
      await this.initWxConfig()
      /* #endif */
      if (this.info.IsGetLocation) {
        // 开启地区限制才授权
        await this.getLocation()
        this.updateCover()
      }
    }

    let prize = await this.fetchNewPrize()
    if ([-1, 0].includes(prize.code)) {
      // 中奖 | 未中奖
      this.prizeInfo = prize.data
      this.isShowPrize = true
    } else {
      // 判断新增拼图
      this.updateNewPuzzle()
    }

    if (this.firstInit) {
      this.fetchWinningList()
      /* #ifdef MP-WEIXIN */
      await this.fetchSubscribe()
      /* #endif */
    }
    /* #ifdef MP-WEIXIN */
    this.judgeSetting()
    /* #endif */
    /* #ifdef H5 */
    if (!this.firstInit && !this.isSubscribed) {
      if (process.env.NODE_ENV === 'production') {
        this.$refs.follow.getGzStatus()
      }
    }
    /* #endif */
    this.firstInit = false
  },
  /* #ifdef MP-WEIXIN */
  onShareAppMessage() {
    return {
      title: this.info.ShareRemark || this.info.ShareTitle,
      imageUrl: this.info.ShareImgPath,
      path: `/packages/src/pages/puzzle/index?scene=${this.scene}`
    }
  },
  /* #endif */
  methods: {
    getInfo() {
      return new Promise(resolve => {
        apiGetActivity({ aid: this.actInfo.aid })
          .then(res => {
            let {
              Title,
              Status,
              StatusDesc,
              StartTime,
              EndTime,
              ShareImgPath,
              ShareRemark,
              ShareTitle,
              ContentJson,
              JigsawCount,
              IsEnabledCodeAward,
              IsEnabledPointExchange,
              IsFollow,
              PointAmount,
              Rule,
              CurrentPeriodLotteryTime,
              IsGetLocation,
              CurrentPeriod
            } = res.return_data
            this.setTitle(Title)
            let {
              BgColor,
              IsShowPrizeList,
              JigsawImgModular,
              BottomBtnModular,
              ImageAdsModular = {}
            } = JSON.parse(ContentJson) || {}
            this.info = {
              Title,
              Status,
              StatusDesc,
              StartTime,
              EndTime,
              ShareImgPath: this.formatImg(ShareImgPath),
              ShareRemark,
              ShareTitle,
              JigsawCount,
              IsEnabledCodeAward,
              IsEnabledPointExchange,
              PointAmount,
              IsFollow,
              Rule,
              CurrentPeriodLotteryTime,
              IsShowPrizeList,
              BgColor,
              IsGetLocation,
              ...JigsawImgModular
            }
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
    async calcPuzzleImgs() {
      let { width: wholeWidth, height: wholeHeight } = await this.getImgInfo(this.info.IntegratorImgPath)
      this.puzzleBgInfo.width = wholeWidth
      this.puzzleBgInfo.height = wholeHeight
      let { row, col } = this.layoutInfo
      let pieceWidth = Math.floor(wholeWidth / col)
      let pieceHeight = Math.floor(wholeHeight / row)
      this.pieceInfo.width = pieceWidth
      this.pieceInfo.height = pieceHeight
      let r = []
      // 计算横纵坐标，以左上角为（0, 0）
      for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
          let item = {
            x: j * pieceWidth,
            y: i * pieceHeight,
            state: 0 // 封面图动画 0：未点亮 1：进行中 2：已点亮
          }
          r.push(item)
        }
      }

      this.puzzleImgs = r
    },
    fetchNewPuzzle() {
      return new Promise(resolve => {
        apiGetActChanceIsNew(
          {
            aid: this.actInfo.aid,
            periodId: this.curPeriod.Id,
            timesc: new Date().getTime()
          },
          { loading: false }
        )
          .then(res => {
            const r = res.return_data
            // 原先拼图数
            r.originCount = r.MyChanceNum - r.AddChanceNum
            this.newPuzzle = r
            resolve()
          })
          .catch(() => {
            this.newPuzzle = {}
            resolve()
          })
      })
    },
    showNewPuzzle() {
      // 增加数、总数
      let { AddChanceNum, originCount } = this.newPuzzle
      let min = Math.min(originCount, this.info.JigsawCount)
      for (let i = 0; i < min; i++) {
        // 展示已集拼图效果
        this.puzzleImgs[i].state = 2
        // 展示已进入的奖池
        if ([0, 1].includes(this.puzzleImgs[i].prizeStatus)) {
          this.puzzleImgs[i].prizeStatus = 2
        }
      }

      if (AddChanceNum > 0) {
        setTimeout(() => {
          this.isShowRemind = true
        }, 300)
      }
    },
    flashNewPuzzle() {
      let { AddChanceNum, originCount } = this.newPuzzle
      // 新增拼图且没超过有效拼图，需点亮对应数量拼图
      if (AddChanceNum > 0 && originCount < this.info.JigsawCount) {
        // 取新增数量和有效拼图与已集拼图差值最小值
        let delta = Math.min(this.info.JigsawCount - originCount, AddChanceNum)
        for (let i = 0; i < delta; i++) {
          this.puzzleImgs[originCount + i].state = 1
          // 动画完成后修改状态
          setTimeout(() => {
            this.puzzleImgs[originCount + i].state = 2
          }, 1000)
          if (this.puzzleImgs[originCount + i].prizeStatus === 0) {
            this.puzzleImgs[originCount + i].prizeStatus = 1
          }
        }
      } else {
        // 无新增，展示已集拼图
        let min = Math.min(originCount, this.info.JigsawCount)
        for (let i = 0; i < min; i++) {
          this.puzzleImgs[i].state = 2
          if ([0, 1].includes(this.puzzleImgs[i].prizeStatus)) {
            this.puzzleImgs[i].prizeStatus = 2
          }
        }
      }
    },
    async updateNewPuzzle() {
      // 第一次进入 | 兑换后，刷新拼图效果
      await this.fetchNewPuzzle()
      this.showNewPuzzle()
      this.recordLocation()
    },
    async onRefreshPuzzle() {
      /* #ifdef MP-WEIXIN */
      if (this.subscribeInfo.isAlways) {
        // 消息订阅勾选不再询问
        this.flashNewPuzzle()
        if (this.subscribeInfo.isAccept) {
          this.handleAddSubscribeRecord()
        }
        return
      }
      /* #endif */
      if (!this.isSubscribed) {
        /* #ifdef MP-WEIXIN */
        // 未订阅先订阅弹窗
        await this.handleSubscribeMessage()
        this.flashNewPuzzle()
        /* #endif */
        /* #ifdef H5 */
        // 未关注先点亮后弹二维码
        this.flashNewPuzzle()
        setTimeout(() => {
          this.$refs.follow.handleFollow()
        }, 1000)
        /* #endif */
      } else {
        this.flashNewPuzzle()
      }
    },
    async onReload(type) {
      if (type === 2 || type === 3) {
        await this.getInfo()
        await this.calcPuzzleImgs()
        await this.fetchPoolList()
        this.initPoolIcon()
      }
      if (type === 1 || type === 2) {
        this.updateNewPuzzle()
      }
    },
    initPoolIcon() {
      this.formatPoolList.forEach(item => {
        this.$set(this.puzzleImgs[item.min - 1], 'prizeStatus', 0)
        this.$set(this.puzzleImgs[item.min - 1], 'prizeIcon', item.icon)
      })
    },
    fetchNewPrize() {
      return new Promise(resolve => {
        apiGetIsAwardNotice({
          aid: this.actInfo.aid
        })
          .then(res => {
            // code = 0：中奖 -1：未中奖 -2：无
            resolve({
              code: res.return_code,
              data: res.return_data
            })
          })
          .catch(err => {
            // 若接口报错，不弹窗
            resolve({
              code: err.return_code === -1 ? -1 : -2,
              data: err.return_data
            })
          })
      })
    },
    fetchWinningList() {
      // 上期中奖名单
      return new Promise(resolve => {
        apiGetActivityAwardRecords({
          aid: this.actInfo.aid
        })
          .then(res => {
            this.winningList = res.return_data || []
            resolve()
          })
          .catch(() => {
            resolve()
          })
      })
    },
    fetchPoolList() {
      // 当期奖池
      const formatRes = res => {
        const r = res.return_data || []
        this.puzzlePoolList = r
          .map(item => ({
            JackpotName: item.JackpotName,
            MinCount: Number(item.MinCount),
            ImgPath: item.ImgPath,
            PrizeList: item.PrizeList.map(i => ({ Name: i.Name, PrizeImageUrl: i.PrizeImageUrl, Remark: i.Remark }))
          }))
          .sort((a, b) => a.MinCount - b.MinCount)
        // 准备奖池的最小值和图标
        this.formatPoolList = this.puzzlePoolList.map(item => ({ min: item.MinCount, icon: item.ImgPath }))
      }
      return new Promise(resolve => {
        apiGetJigsawpuzzlePrize({
          aid: this.actInfo.aid,
          periodId: this.curPeriod.Id
        })
          .then(res => {
            formatRes(res)
            resolve()
          })
          .catch(err => {
            formatRes(err)
            resolve()
          })
      })
    },
    getLocation() {
      return new Promise(resolve => {
        /* #ifdef MP-WEIXIN */
        uni.getLocation({
          type: 'gcj02',
          success: ({ longitude, latitude }) => {
            this.coordinate = `${latitude},${longitude}`
          },
          fail() {
            if (!uni.getStorageSync('locationPopupCount')) {
              uni.setStorageSync('locationPopupCount', 1)
            }
          },
          complete() {
            resolve()
          }
        })
        /* #endif */
        /* #ifdef H5 */
        if (process.env.NODE_ENV === 'development') {
          this.coordinate = '23.1288877474089,113.37376345608519'
          return resolve()
        }
        this.$wechat.getLocation({
          type: 'gcj02',
          success: ({ longitude, latitude }) => {
            this.coordinate = `${latitude},${longitude}`
          },
          fail() {
            if (!uni.getStorageSync('locationPopupCount')) {
              uni.setStorageSync('locationPopupCount', 1)
            }
          },
          cancel() {
            if (!uni.getStorageSync('locationPopupCount')) {
              uni.setStorageSync('locationPopupCount', 1)
            }
          },
          complete() {
            resolve()
          }
        })
        /* #endif */
      })
    },
    recordLocation() {
      // 没开启地区限制 || 开启地区限制，但获取不到经纬度
      if (!this.info.IsGetLocation || (this.info.IsGetLocation && !this.coordinate)) return
      // 没有新增拼图
      if (!this.newPuzzle.AddChanceNum) return
      apiSetLocation({
        aid: this.actInfo.aid,
        periodId: this.curPeriod.Id,
        latlng: this.coordinate
      })
    },
    updateCover() {
      if (this.info.IsGetLocation && uni.getStorageSync('locationPopupCount') === 1) {
        // 自定义提示弹窗只弹一次
        this.isShowCover = true
      }
    },
    onLocation() {
      /* #ifdef MP-WEIXIN */
      this.isShowLocDialog = false
      uni.openSetting()
      /* #endif */
      /* #ifdef H5 */
      location.reload()
      /* #endif */
    },
    handleShowLocation() {
      this.isShowCover = false
      this.isShowLocDialog = true
      uni.setStorageSync('locationPopupCount', 2)
    },
    getImgInfo(t) {
      let u = this.formatImg(t)
      return new Promise(resolve => {
        uni.getImageInfo({
          src: u,
          success: res => {
            this.downloadImgCount = 5
            resolve(res)
          },
          fail: () => {
            if (this.downloadImgCount < 5) {
              this.downloadImgCount--
              return this.getImgInfo(u)
            }
          }
        })
      })
    },
    handleShowDesc() {
      this.isShowDesc = true
    },
    handleShowScore() {
      if (this.info.Status !== 0) return
      this.isShowScore = true
    },
    handleShowPrize() {
      this.isShowPrize = true
    },
    /* #ifdef H5 */
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
    handleChangeGzStatus(status) {
      // 关注公众号状态 0：未关注  1：关注中  2：已取消关注
      this.isSubscribed = status === 1
    },
    /* #endif */
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
    fetchSubscribe() {
      if (this.info.Status !== 0) {
        // 非进行中活动无需订阅
        return Promise.resolve()
      }
      return new Promise(resolve => {
        apiGetAcivityParticipationCount({
          aid: this.actInfo.aid,
          periodId: this.curPeriod.Id
        })
          .then(async res => {
            const { isMpSubscribed } = res.return_data
            if (!isMpSubscribed) {
              await this.fetchSubscribeTemplate()
            }
            // 小程序订阅本期消息 | 未开启订阅，都当成已订阅处理
            this.isSubscribed = (!!this.noticeTempId && isMpSubscribed) || !this.noticeTempId
            resolve()
          })
          .catch(() => {
            resolve()
          })
      })
    },
    fetchSubscribeTemplate() {
      return new Promise(resolve => {
        apiGetSubscribeTemplateId({ m: this.actInfo.memberLogin })
          .then(res => {
            this.noticeTempId = res.return_data
            resolve()
          })
          .catch(() => {
            resolve()
          })
      })
    },
    judgeSetting() {
      return new Promise(resolve => {
        uni.getSetting({
          withSubscriptions: true,
          success: ({ subscriptionsSetting }) => {
            let { itemSettings = {} } = subscriptionsSetting
            this.subscribeInfo.isAlways = !!itemSettings[this.noticeTempId]
            this.subscribeInfo.isAccept = itemSettings[this.noticeTempId] === 'accept'
          },
          complete() {
            resolve()
          }
        })
      })
    },
    async handleSubscribeMessage() {
      const res = await this.requestSubscribeMsg([this.noticeTempId])
      this.judgeSetting()
      if (res && res[this.noticeTempId] === 'accept') {
        await this.handleAddSubscribeRecord()
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    },
    // 订阅授权回写,避免重复弹窗授权
    handleAddSubscribeRecord() {
      return new Promise(resolve => {
        let params = {
          aid: this.actInfo.aid,
          periodId: this.curPeriod.Id
        }
        apiAddSubscribeRecord(params, { loading: false })
          .then(res => {
            this.isSubscribed = true
            resolve()
          })
          .catch(() => {
            resolve()
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
