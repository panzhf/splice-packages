<template>
  <view>
    <view v-if="pageConfig.showPage" class="group-card" :style="{ 'background-color': pageConfig.bgColor }">
      <TitleBar :title="pageConfig.title" textcolor="#fff" type="detail" show-nav-title is-transparent />
      <view class="content">
        <image :src="pageConfig.bg" mode="widthFix" class="bg" />
        <view :style="{ height: top }" />

        <view class="receive-view">
          <image :src="componentContent.ruleimg" mode="widthFix" class="icon explain" @tap="isShowDesc = true" />

          <button open-type="share" hover-class="button-action" class="icon share">
            <image :src="componentContent.shareimg" mode="widthFix" @tap="handleReceive" />
          </button>
          <image
            v-if="componentContent.isshowscan"
            :src="componentContent.scanimg"
            mode="widthFix"
            class="icon scan"
            :style="{ top: scanTop }"
            @click="handleScan"
          />
          <view
            class="amount"
            :class="{ 'v-h': !userData.CompleteSuitPersonCount && !componentContent.isshowawardscontent }"
            :style="{ color: componentContent.awardtextcolor, backgroundColor: componentContent.awardTextBgColor }"
          >
            已有{{ userData.CompleteSuitPersonCount }}人集齐
          </view>
          <card-swiper mode="single" :data="cardList" field="cardimg" />
          <view class="card-list flex mt-20">
            <scroll-view scroll-x="true" style="white-space: nowrap" enhanced :show-scrollbar="false">
              <view>
                <view style="height: 20rpx" />
                <view class="card-item" :class="{ 'w-174': cardList.length === 3 }">
                  <view
                    class="flex flex-center card-item-bg"
                    :class="{ grayscale: !userData.UnExchangePrizeCount }"
                    @click="draw()"
                  >
                    <image class="card-img" :src="PACKAGE_STATIC_URL + 'group-card/jiang.png'" mode="aspectFit" />
                    <view v-if="userData.UnExchangePrizeCount" class="num">{{ userData.UnExchangePrizeCount }}</view>
                  </view>
                  <view
                    class="card-name"
                    :style="{
                      color: componentContent.cardtextcolor,
                      backgroundColor: componentContent.cardtextbgcolor
                    }"
                  >
                    集齐抽奖
                  </view>
                </view>
                <view
                  v-for="(item, index) in cardList"
                  :key="index"
                  class="card-item"
                  :class="{ 'w-174': cardList.length === 3 }"
                >
                  <view
                    class="flex flex-center card-item-bg"
                    :class="{ grayscale: !item.count }"
                    @click="handleCardDetail()"
                  >
                    <image class="card-img" :src="item.cardimg" mode="aspectFit" />
                    <view v-if="item.count" class="num">{{ item.count }}</view>
                  </view>
                  <view
                    class="card-name"
                    :style="{
                      color: componentContent.cardtextcolor,
                      backgroundColor: componentContent.cardtextbgcolor
                    }"
                  >
                    {{ item.cardname }}
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>
          <view class="btn-receive">
            <image class="btn-receive-img" :src="componentContent.drawcardbtnimg" mode="widthFix" @click="drawCard()" />
            <view v-if="userData.UserChance" class="num">{{ userData.UserChance }}</view>
            <view v-else-if="[0, 2].includes(actInfo.actType)" class="num point-text">
              消耗{{ actInfo.Point }}积分抽1次
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <auth-button :mode="2" />
            <!-- #endif -->
          </view>
          <awards-info
            v-if="componentContent.isshowawards"
            :awards-data="{
              color: componentContent.awardcontenttextcolor,
              gap: 20,
              titleImg: componentContent.awardtopimg,
              bgUrl: componentContent.awardcontentimg
            }"
            :prize-list="prizeList"
          />
        </view>
        <md-copyright color="#fff" bg-color="transparent" />
        <view style="height: 160rpx" />
      </view>
      <view v-if="btnArr.length" class="flex btn-footer">
        <image
          v-for="(item, index) in btnArr"
          :key="index"
          :src="item.btnimgpath"
          mode="widthFix"
          class="btn"
          @tap="handleNav(item)"
        />
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>
    </view>
    <common-popup v-model="showTip" :confirm-text="confirmText" @cancel="handleCancel">
      <view class="fs-30">{{ tipMsg }}</view>
      <view v-if="status === 1 && actStatus === 1" class="fs-28">开始时间：{{ pageConfig.starttime }}</view>
    </common-popup>
    <common-popup
      v-model="affirmInfo.show"
      :content="affirmInfo.content"
      type="confirm"
      confirm-text="确定"
      @confirm="affirmConfirm"
    />
    <loading v-if="!pageConfig.showPage" use-default />
    <prize-dialog
      v-model="showPrizeDialog"
      :act-info="actInfo"
      :lottery-config="lotteryConfig"
      :user-data="userData"
      :dialog-type="dialogType"
      :card-list="cardList"
      :info="prizeInfo"
      @scan="handleScan"
      @awardCard="handleReceive"
      @handleShou="handleShou"
    />
    <awards-dialog v-model="isShowAward" :info="awardInfo" />
    <desc-dialog v-model="isShowDesc" :info="pageConfig" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiCollectCardDrawCard,
  apiGetCardactivity,
  apiGetUserJoinData,
  apiGetActStatisticsData,
  apiExchangePrize
} from 'packages/api/group-card'
import CardSwiper from './comps/swiper.vue'
import { packageStaticMixin } from 'packages/mixins/static-url'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { getUrlQuery } from 'packages/utils/function'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import Loading from 'packages/components/loading/index.vue'
import { redirectToMp } from 'packages/utils/function.js'
import AwardsInfo from './comps/awards.vue'
import PrizeDialog from './comps/prize-dialog'
import DescDialog from './comps/desc-dialog.vue'
import AwardsDialog from './comps/awards-dialog.vue'
export default {
  components: {
    Loading,
    TitleBar,
    CommonPopup,
    CardSwiper,
    AwardsInfo,
    PrizeDialog,
    DescDialog,
    AwardsDialog
  },
  mixins: [packageStaticMixin],
  data() {
    return {
      options: null,
      prizeList: [],
      cardList: [],
      userData: {
        UnExchangePrizeCount: 0, //用户已集齐但未兑奖数量
        UserChance: 0, //扫码获得的参与次数
        CompleteSuitPersonCount: 0
      },
      loading: true,
      prizeInfo: {}, // 奖项信息
      isShowAward: false,
      isShowDesc: false,
      showPrizeDialog: false, // 显示奖项弹窗
      status: 0, //status 0：禁用；1：启用；2：删除
      actStatus: 0, //actstatus 1-未开始；2-进行中；3-已禁用；4-已过期；
      showTip: false, // 显示提示
      tipMsg: '', // 提示文案
      confirmText: '知道了',
      tipType: 0, // 1:仅首次添加的用户才能参与
      btnArr: [], // 页脚按钮
      dialogType: 1,
      actInfo: {
        id: 0,
        actid: 0,
        actType: 0, //0：常规活动1：扫码活动2：全部
        Point: 0, //消耗积分
        DayLimit: 1, //日参与次数
        TotalLimit: 1 //总参与次数
      },
      scanImg: '',
      pageConfig: {
        actid: 0,
        id: 0,
        showPage: false,
        bg: '', // 背景图片
        bgColor: '', // 背景颜色
        title: '',
        starttime: '',
        endtime: '',
        ruleText: '',
        shareImg: ''
      },
      awardInfo: {
        name: '',
        productname: '',
        prizetype: 0,
        awardpicture: '',
        receivedays: 0,
        mpturntablelink: '',
        awardid: '',
        eid: ''
      },
      componentContent: {
        ruleimg: '',
        shareimg: '',
        scanimg: '',
        isshowswards: true, // 奖项内容
        isshowawardscontent: true, // 中奖内容
        isshowscan: true // 扫一扫
      },
      lotteryConfig: {}, // 卡牌信息
      affirmInfo: {
        show: false,
        content: '',
        type: 1 // 1抽卡 2 抽奖
        // `确定使用${actInfo.Point}积分抽1次卡吗？`
      },
      affirmcontent: ''
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      let style = `${44 + this.statusBarHeight}px`
      return style
    },
    scanTop() {
      let style = `calc(${this.top} + 680rpx)`
      return style
    },
    rulesTop() {
      let style = `calc(${this.top} + 20rpx)`
      return style
    },
    bgTop() {
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 80rpx)`
      /* #endif */
      return style
    }
  },
  async onLoad(options) {
    this.options = options
    if (!options.scene) return this.$msg('链接格式不正确')
    const { a } = getUrlQuery(decodeURIComponent(options.scene))
    a && (this.actInfo.id = Number(a))
    this.getInfo()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  onShareAppMessage() {
    let imgSrc = this.pageConfig.shareImg?.startsWith('//')
      ? 'https:' + this.pageConfig.shareImg
      : this.pageConfig.shareImg
    return {
      title: this.pageConfig.sharetitle,
      imageUrl: imgSrc,
      path: `/packages/src/pages/group-card/index?scene=${this.options.scene}`
    }
  },

  methods: {
    draw() {
      if (!this.userData.UnExchangePrizeCount) return
      this.handleAffirm(2)
    },
    handleAffirm(val = 1) {
      const tips =
        val === 1
          ? `确定使用${this.actInfo.Point}积分抽1次卡吗？`
          : '确定使用1套卡牌去抽奖？使用后，卡牌的数量将会减少。'
      this.affirmInfo = {
        show: true,
        content: tips,
        type: val // 1抽卡 2 抽奖
        // `确定使用${actInfo.Point}积分抽1次卡吗？`
      }
    },
    drawCard() {
      if (this.userData.UserChance === 0 && [0, 2].includes(this.actInfo.actType)) return this.handleAffirm()
      this.handleAwardCard()
    },
    affirmConfirm() {
      this.affirmInfo.show = false
      if (this.affirmInfo.type === 1) this.handleAwardCard()
      if (this.affirmInfo.type === 2) this.handleReceive()
    },
    handleShou() {
      if (this.lotteryConfig.isexchangeprize === 1) {
        this.dialogType = 2
        setTimeout(() => {
          this.showPrizeDialog = true
        }, 200)
      }
    },
    handleCardDetail() {
      uni.navigateTo({ url: `/packages/src/pages/group-card/record?actid=${this.actInfo.actid}` })
    },
    pointAffirm() {
      this.showTip = true
    },
    handleScan() {
      uni.navigateTo({ url: '/packages/src/member/scan' })
    },
    async handleReceive() {
      // 领奖
      if (this.loading) return
      this.loading = true
      this.$loading.show('正在抽奖')
      apiExchangePrize({
        actid: this.actInfo.actid
      })
        .then(d => {
          this.loading = false
          this.$loading.hide()
          const res = this.$toLowerKey(d, true)
          if (this.$ck(res)) {
            const data = res.return_data
            this.awardInfo = {
              name: data.prizename,
              productname: data.productname,
              awardpicture: data.prizeimage,
              winstatus: data.winstatus,
              prizetype: data.prizetype,
              receivedays: data.receivedays,
              mpturntablelink: data.mplink,
              eid: data.eid,
              awardid: data.awardid
            }
            this.isShowAward = true
            this.getCardInfo()
          }
        })
        .catch(err => {
          this.loading = false
          this.$loading.hide()
          if (err.return_code === 30071) {
            // '前往首页看看其它活动'
            this.confirmText = '前往首页看看其它活动'
            this.tipType = 1
          }
          this.tipMsg = err.return_msg || '网络开小差'
          this.showTip = true
        })
    },
    getInfo() {
      apiGetCardactivity({ id: this.actInfo.id, actid: this.actInfo.actid })
        .then(d => {
          const res = this.$toLowerKey(d, true)
          if (this.$ck(res)) {
            this.loading = false
            let {
              title,
              actid,
              starttime,
              endtime,
              status,
              actstatus,
              ruletext,
              backcolor,
              themeimage,
              componentcontent,
              sharetitle,
              shareimgpath,
              type,
              point,
              daylimit,
              totallimit,
              cardprobs,
              id
            } = res.return_data
            // 页面设置

            // 活动状态
            this.status = status
            this.actStatus = actstatus
            this.prizeList = res.return_data.prizes
            // 底部按钮
            let componentContent = JSON.parse(componentcontent || '{}')
            if (componentContent) {
              componentContent = this.$toLowerKey(componentContent, true)
              this.componentContent = componentContent
              const {
                isshowbottombtn: showAll,
                isshowusercenter: showMy,
                isshowmyprizebtn: showPrize,
                usercenterbtnitem,
                myprizebtnitem
              } = componentContent?.bottombtnmodular
              this.pageConfig = {
                id,
                showPage: true,
                bg: themeimage,
                bgColor: backcolor,
                title,
                starttime,
                endtime,
                actid,
                sharetitle,
                shareImg: shareimgpath,
                ruleText: ruletext.replace(/[\r\n]/g, '<br>')
              }
              this.actInfo.Point = point
              this.actInfo.DayLimit = daylimit
              this.actInfo.TotalLimit = totallimit
              this.actInfo.actType = type
              this.actInfo.actid = actid
              showAll && showMy && this.btnArr.push(usercenterbtnitem?.mp)
              showAll && showPrize && this.btnArr.push(myprizebtnitem?.mp)
              this.cardList = cardprobs.map(item => ({
                cardname: item.name,
                cardimg: item.img,
                count: 0,
                id: item.id
              }))
            }
            // 活动异常提示
            if (this.status !== 1 || this.actStatus !== 2) {
              //  [status 0：禁用；1：启用；2：删除 ][actstatus 1-未开始；2-进行中；3-已禁用；4-已过期；]
              const actStatusText = {
                1: '活动未开始',
                3: '活动已暂停，请联系品牌商',
                4: '很遗憾，你来晚了'
              }
              this.tipMsg = this.status === 2 ? '很遗憾，你来晚了' : actStatusText[this.actStatus]
              this.showTip = true
              // return
            }
            // 已参与活动
            // if (joinrecord) {
            //   // 没有中奖
            //   if (joinrecord.winstatus !== 1) return
            //   // 中奖，展示奖项
            //   this.prizeInfo = { ...joinrecord, isFirst: false }
            //   this.isFirst = false
            //   this.showPrizeDialog = true
            //   return
            // }
            // 未参与活动, 去领奖
            this.getCardInfo()
            this.getStatisticsData()
          } else {
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        })
        .catch(err => {
          this.$loading.hide()
          this.tipMsg = err.return_msg || '网络开小差'
          this.showTip = true
        })
    },
    getCardInfo() {
      apiGetUserJoinData({ id: this.actInfo.id, actid: this.actInfo.actid })
        .then(d => {
          const res = this.$toLowerKey(d, true)
          if (this.$ck(res)) {
            const { cardstatistics, userchance, unexchangeprizecount } = res.return_data
            this.userData.UserChance = userchance
            this.userData.UnExchangePrizeCount = unexchangeprizecount
            cardstatistics &&
              cardstatistics.forEach(item => {
                this.cardList.forEach(child => {
                  if (child.id === item.cardid) child.count = item.count
                })
              })
          }
        })
        .catch(err => {
          this.$loading.hide()
          this.tipMsg = err.return_msg || '网络开小差'
          this.showTip = true
        })
    },
    getStatisticsData() {
      apiGetActStatisticsData({ id: this.actInfo.id, actid: this.actInfo.actid })
        .then(d => {
          const res = this.$toLowerKey(d, true)
          if (this.$ck(res)) {
            this.userData.CompleteSuitPersonCount = res.return_data.completesuitpersoncount
          }
        })
        .catch(err => {
          this.$loading.hide()
          this.tipMsg = err.return_msg || '网络开小差'
          this.showTip = true
        })
    },
    handleNav(item) {
      if (item.appid) {
        redirectToMp({ appId: item.appid, path: item.jumpurl })
      } else {
        uni.navigateTo({
          url: item.jumpurl
        })
      }
    },
    handleCancel() {
      if (this.tipType === 1) {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
      this.confirmText = '知道了'
      this.tipType = 0
    },
    handleAwardCard() {
      // 领奖
      if (this.loading) return
      this.loading = true
      this.$loading.show('正在抽卡')
      apiCollectCardDrawCard({
        actid: this.actInfo.actid
      })
        .then(d => {
          this.loading = false
          this.$loading.hide()
          const res = this.$toLowerKey(d, true)
          if (this.$ck(res)) {
            // this.dialogType = isexchangeprize + 1
            this.dialogType = 1
            this.lotteryConfig = res.return_data
            this.showPrizeDialog = true
            this.getCardInfo()
          }
        })
        .catch(err => {
          this.loading = false
          this.$loading.hide()
          // 今日参与次数限制-30041
          // 总参与次数限制-30064
          // 积分不足-30049
          // 抽奖次数用完-30048
          if ([30041, 30064, 30048].includes(err.return_code)) {
            this.dialogType = 3
            this.showPrizeDialog = true
            return
          }
          if (err.return_code === 30071) {
            // '前往首页看看其它活动'
            this.confirmText = '前往首页看看其它活动'
            this.tipType = 1
          }
          this.tipMsg = err.return_msg || '网络开小差'
          this.showTip = true
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
.explain {
  word-break: break-all;
}
</style>
