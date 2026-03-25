<template>
  <view class="guessing flex flex-column" :style="{ 'background-color': info.BgColor }">
    <!-- #ifdef MP-WEIXIN -->
    <TitleBar :title="info.Title" textcolor="#fff" type="detail" show-nav-title is-transparent />
    <!-- #endif -->
    <!-- 背景图 -->
    <image :src="info.BgImgPath" mode="widthFix" class="bg" />
    <!-- 活动规则 -->
    <image
      :src="`${PACKAGE_STATIC_URL}rebate/rule.png`"
      class="rule"
      :style="{ top: ruleTop }"
      @tap="isShowDesc = true"
    />
    <!-- 中奖名单 -->
    <view class="rank-list">
      <winner-list :show="info.IsShowWinningContent" :list="rankList" />
    </view>
    <view class="content" :style="{ marginTop: contentTop }">
      <view v-if="info.Status === 0" class="button-img p-r">
        <image :src="`${PACKAGE_STATIC_URL}rebate/detail.png`" class="button-img" @click="isShowUpdate = true" />
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>

      <view
        v-if="[4, 3, 2, 1].includes(info.Status)"
        :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}rebate/pause.png)` }"
        class="activity-state"
      >
        <template v-if="[2].includes(info.Status)">你来晚了，活动已结束</template>
        <template v-if="[3].includes(info.Status)">活动已暂停，请稍后再来</template>
        <template v-if="[4].includes(info.Status)">活动已被删除</template>
        <template v-if="[1].includes(info.Status)">
          <view class="tips-time">活动未开始</view>
          <view class="tips-time" style="margin-top: 10rpx">开始时间：{{ info.StartTime }}</view>
        </template>
      </view>
      <view class="content-box">
        <view class="button-box">
          <view class="button-bt" @click="isShowDemo = true">查看示例</view>
          <view class="button-bt two" @click="handleRecord">上传记录</view>
        </view>
        <view class="tips">{{ info.TipsCopyWriting }}</view>
        <view v-if="info.IsShowAwardsContent" class="awards-box">
          <view class="header-img" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}rebate/prize-title.png)` }">
            奖项内容
          </view>
          <view v-for="(item, index) in PrizesArr" :key="index" class="row">
            <image class="prize-icon" :src="`${PACKAGE_STATIC_URL}jihui.jpg`" mode="widthFix" />
            <view class="right">
              <view class="title">{{ item.PrizeName }}</view>
              <view class="awards">{{ item.RelateActTitle }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <md-copyright bg-color="transparent" />
    <!-- 底部按钮 -->
    <template v-if="btnInfo.IsShowBottomBtn && (btnInfo.IsShowUserCenter || btnInfo.IsShowMyPrizeBtn)">
      <view class="footer-gap" />
      <view class="btn-group flex flex-middle flex-center p-r">
        <view v-if="btnInfo.IsShowUserCenter" class="icon">
          <custom-button :info="btnInfo.UserCenterBtnItem" :width="320" />
        </view>
        <view v-if="btnInfo.IsShowMyPrizeBtn" class="icon">
          <custom-button :info="btnInfo.MyPrizeBtnItem" :width="320" />
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>
    </template>
    <desc-dialog
      v-model="isShowDesc"
      :info="{
        actId: actInfo.aid,
        MemberLogin: actInfo.memberLogin,
        Title: info.Title,
        StartTime: info.StartTime,
        EndTime: info.EndTime,
        Rule: info.Rule
      }"
      :top="top"
    />
    <update-dialog
      v-model="isShowUpdate"
      :info="{
        actId: actInfo.aid,
        MemberLogin: actInfo.memberLogin
      }"
      @handleSubmit="handleSubmit"
    />
    <demo-dialog v-model="isShowDemo" />
    <!-- #ifdef H5 -->
    <md-follow-gzh ref="follow" @status="handleChangeGzStatus" />
    <!-- #endif -->
    <loading v-if="loading" use-default />

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { getPage } from '@/utils/index'
import { setTitleMixin } from 'packages/mixins/navigation'
import Loading from 'packages/components/loading/index.vue'

import {
  /* #ifdef MP-WEIXIN */
  apiGetActID,
  apiGetSubscribeTemplateId,
  /* #endif */
  apiGetActivity,
  apiAddRecord,
  apiGetActivityPrizes,
  apiGetActivityAwardRecords,
  apiAddSubscribeRecord
} from 'packages/api/rebate'

/* #ifdef MP-WEIXIN */
import subscribeMsg from 'packages/mixins/subscribe-msg'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { getUrlQuery } from 'packages/utils/function'
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
/* #ifdef H5 */
import { apiGetwxdata } from 'packages/api/common'
/* #endif */
import WinnerList from 'packages/components/winner-list.vue'
import CustomButton from 'packages/components/bottom-btn/bottom-btn.vue'
import DescDialog from './components/desc-dialog.vue'
import UpdateDialog from './components/update-dialog.vue'
import DemoDialog from './components/demo-dialog.vue'
import { packageStaticMixin } from 'packages/mixins/static-url'
import imgMixin from 'packages/mixins/img'
export default {
  components: {
    /* #ifdef MP-WEIXIN */
    TitleBar,
    /* #endif */
    CustomButton,
    Loading,
    DescDialog,
    UpdateDialog,
    DemoDialog,
    WinnerList
  },
  mixins: [
    setTitleMixin,
    packageStaticMixin,
    imgMixin,
    /* #ifdef MP-WEIXIN */
    subscribeMsg
    /* #endif */
  ],
  data() {
    return {
      showPrizeListPosition: 0, // 中奖名单显示位置 0：左侧 1：中间
      rankList: [], // 中奖名单列表
      loading: true,
      /* #ifdef H5 */
      wxConfig: {},
      /* #endif */
      firstInit: true,
      isShowDesc: false, // 活动说明
      isShowUpdate: false, // 上传
      isShowDemo: false, // 示例
      isShowVote: false, // 竞猜
      btnInfo: {}, // 底部按钮组
      actInfo: {
        aid: '', // 活动id
        memberLogin: '' // 品牌商编号
      },
      info: {
        Title: '',
        BgColor: '#000',
        BgImgPath: '', //背景图片
        Rule: '',
        ShareImgPath: '',
        ShareRemark: '',
        ShareTitle: '',
        TipsCopyWriting: '', //提示文案
        IsShowWinningContent: false, //是否显示奖品
        IsShowAwardsContent: false, //是否显示奖项内容
        IsOpenShare: true
      },
      matchesList: [],
      myInfo: {
        TotalBetNumberLeft: 0,
        TotalAmount: 0
      },
      voteData: {
        Ranks: []
      },
      timeList: [],
      timeActiveIndex: -1,
      isSubscribed: false, // 订阅本期活动/关注公众号
      PrizesArr: [] //奖项内容
    }
  },
  computed: {
    baseStaticUrl() {
      return this.temaleteType === 2
        ? this.PACKAGE_STATIC_URL + 'guessing'
        : this.PACKAGE_STATIC_URL + 'guessing/bainian'
    },
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
      style = `140rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 40rpx)`
      /* #endif */
      return style
    },
    contentTop() {
      let style = ''
      /* #ifdef H5 */
      style = `820rpx`
      /* #endif */
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 840rpx)`
      /* #endif */
      return style
    },
    /* #ifdef MP-WEIXIN */
    shareIconStyle() {
      let s = []
      s.push(`top: calc(${this.top} + 378rpx)`)
      s.push('right: 0')
      s.push('width: 149rpx; height: 118rpx')
      return s.join(';')
    },
    sharePageInfo() {
      return {
        title: this.info.ShareRemark || this.info.Title,
        imageUrl: this.info.ShareImgPath,
        path: `/packages/src/pages/guessing/index?scene=${this.scene}`
      }
    }
    /* #endif */
  },
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
    /* #endif */
    if (this.firstInit) {
      const isValid = await this.getInfo()
      if (!isValid) return
      /* #ifdef H5 */
      await this.initWxConfig()
      /* #endif */
      // 分享有礼
      /* #ifdef MP-WEIXIN */
      this.getSubscribeTemplateId()
      /* #endif */
    }

    /* #ifdef H5 */
    if (!this.firstInit && !this.isSubscribed) {
      if (process.env.NODE_ENV === 'production') {
        this.$refs.follow.getGzStatus()
      }
    }
    /* #endif */
    await this.getActivityPrizes()
    await this.getRankList()
    this.loading = false
    this.firstInit = false
  },
  /* #ifdef MP-WEIXIN */
  onShareAppMessage() {
    return {
      title: this.info.ShareRemark || this.info.Title,
      imageUrl: this.info.ShareImgPath,
      path: `/packages/src/pages/rebate/index?scene=${this.scene}`
    }
  },
  /* #endif */
  methods: {
    getRankList() {
      return new Promise(resolve => {
        apiGetActivityAwardRecords({ aid: this.actInfo.aid })
          .then(res => {
            let rankList = res.return_data || []
            this.rankList = rankList.map(item => {
              return {
                headimg: item.Headpath,
                customernickname: item.NickName,
                remark: item.PrizeName,
                text: '获得了' + item.PrizeName
              }
            })
            resolve()
          })
          .catch(err => {
            this.$msg(err.return_msg)
          })
      })
    },
    getActivityPrizes() {
      return new Promise(resolve => {
        apiGetActivityPrizes({ aid: this.actInfo.aid })
          .then(res => {
            this.PrizesArr = res.return_data
            resolve()
          })
          .catch(err => {
            this.$msg(err.return_msg)
          })
      })
    },
    handleRecord() {
      /* #ifdef H5 */
      uni.navigateTo({
        url: `/pages/rebate/record?aid=${this.actInfo.aid}`
      })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/packages/src/pages/rebate/record?aid=${this.actInfo.aid}`
      })
      /* #endif */
    },
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
            if ([-1, -2, 30001].includes(err.return_code)) {
              // 活动不存在
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page'
              })
              resolve()
            }
          })
      })
    },
    async handleSubscribeMessage() {
      const res = await this.requestSubscribeMsg(this.noticeTempId)
      if (res && res[this.noticeTempId] === 'accept') {
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    },
    getSubscribeTemplateId() {
      return new Promise(resolve => {
        apiGetSubscribeTemplateId({
          m: this.actInfo.memberLogin
        }).then(res => {
          this.noticeTempId = [res.return_data]
        })
      })
    },
    /* #endif */
    /* #ifdef H5 */
    handleChangeGzStatus(status) {
      // 关注公众号状态 0：未关注  1：关注中  2：已取消关注
      this.isSubscribed = status === 1
    },
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
              jsApiList: ['getLocation', 'updateAppMessageShareData', 'chooseImage', 'uploadImage', 'hideOptionMenu'],
              openTagList: ['wx-open-launch-weapp']
            })

            this.$wechat.ready(() => {
              if (this.info.IsOpenShare) {
                // 分享
                this.$wechat.updateAppMessageShareData({
                  title: this.info.Title,
                  desc: this.wxConfig.sharetext,
                  link: this.wxConfig.sharelink,
                  imgUrl: this.wxConfig.shareimg
                })
              } else {
                this.$wechat.hideOptionMenu()
              }

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
    /* #endif */
    async handleSubmit(query) {
      try {
        let res = await apiAddRecord(query)
        if (!this.isSubscribed) {
          /* #ifdef MP-WEIXIN */
          if (res.return_data.ID) {
            // 未订阅先订阅弹窗
            await this.handleSubscribeMessage()
            await apiAddSubscribeRecord({
              aid: this.actInfo.aid,
              recordId: res.return_data.ID
            })
          }
          /* #endif */
          /* #ifdef H5 */
          // 未关注先点亮后弹二维码
          setTimeout(() => {
            this.$refs.follow.handleFollow()
          }, 1000)
          /* #endif */
        }
        this.isShowUpdate = false
        this.$msg('上传成功')
        this.isShowVote = false
        this.tipsType = 1
      } catch (err) {
        this.$msg(err.return_msg)
      }
    },
    handleVote(item) {
      let voteData = JSON.parse(JSON.stringify(item))
      voteData.Ranks.forEach(item => {
        item.BetNum = ''
      })
      this.voteData = voteData
      this.isShowVote = true
    },
    getInfo() {
      return new Promise(resolve => {
        apiGetActivity({ aid: this.actInfo.aid })
          .then(res => {
            let { Title, Status, StartTime, EndTime, ThemeImageUrl, ShareImgPath, ShareRemark, ContentJson, Rule } =
              res.return_data
            this.setTitle(Title)
            let {
              BackColor,
              BottomBtnModular,
              IsShowWinningContent,
              TipsCopyWriting,
              IsOpenShare,
              IsShowAwardsContent
            } = JSON.parse(ContentJson) || {}
            this.info = {
              Title,
              IsShowWinningContent,
              IsShowAwardsContent,
              BgColor: BackColor,
              BgImgPath: ThemeImageUrl,
              TipsCopyWriting,
              Status,
              StartTime,
              EndTime,
              Rule,
              IsOpenShare,
              ShareRemark,
              ShareImgPath: this.formatImg(ShareImgPath)
            }
            // isShowPrizeList
            this.btnInfo = BottomBtnModular
            /* #ifdef MP-WEIXIN */
            if (!IsOpenShare) {
              uni.hideShareMenu({
                menus: ['shareAppMessage', 'shareTimeline']
              })
            }
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

    handleNavigate() {
      /* #ifdef H5 */
      if (!this.btnInfo.UserCenterBtnItem.H5.JumpUrl) return
      location.href = this.btnInfo.UserCenterBtnItem.H5.JumpUrl
      /* #endif */
      /* #ifdef MP-WEIXIN */
      navigateToMP({
        appId: '',
        path: '/personal/prize/list'
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>

