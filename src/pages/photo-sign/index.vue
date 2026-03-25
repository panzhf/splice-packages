<template>
  <view
    :style="{
      '--theme-color': info.themecolor,
      '--sidebtn-bg': globalTheme.sideBtnBg,
      '--confirmbtn-bg': globalTheme.confirmBtnBg,
      '--arrow-center': globalTheme.arrowCenter
    }"
  >
    <view v-if="isLoaded" class="photo-sign" :style="{ 'background-color': info.backgroundcolor }">
      <TitleBar :title="info.title" textcolor="#fff" type="detail" show-nav-title is-transparent />
      <!-- 背景图 -->
      <image :src="info.backgroundimg" mode="widthFix" class="bg" />
      <view class="main flex flex-column">
        <!-- 活动规则 -->
        <view class="rule text-center fs-26 fw-bold" :style="{ top: ruleTop }" @tap="isShowDesc = true">活动规则</view>
        <!-- 占位 -->
        <view class="placeholder" />
        <view class="calendar-wrapper">
          <!-- 日历 -->
          <sign-calendar :checked-list="signedList" />
          <!-- 拍照区 -->
          <photo-area
            :info="{
              actId: actInfo.aid,
              status: info.status,
              audittype: info.audittype,
              lastsignstatus: info.lastsignstatus,
              leftsignnum: info.leftsignnum,
              photomode: info.photomode,
              signedimg: info.signedimg,
              begintime: info.begintime
            }"
            @rule="isShowExample = true"
            @success="onShowPrize"
          />
        </view>
        <!-- 奖项区 -->
        <prize-list v-if="info.isshowawardscontent" :list="prizeList" />

        <md-copyright bg-color="transparent" />
        <!-- 底部按钮 -->
        <template v-if="btnInfo.IsShowBottomBtn && (btnInfo.IsShowUserCenter || btnInfo.IsShowMyPrizeBtn)">
          <view class="footer-gap" />
          <view class="btn-group flex flex-middle flex-center p-r">
            <view v-if="btnInfo.IsShowMyPrizeBtn" class="icon">
              <!-- #ifdef MP-CLOUDSHOP -->
              <custom-button :info="btnInfo.MyPrizeBtnItem" :mp-info="mpInfo" navigate-mp :width="320" :height="80" />
              <!-- #endif -->
              <!-- #ifdef MP-MEMBER -->
              <custom-button :info="btnInfo.MyPrizeBtnItem" :width="320" :height="80" />
              <!-- #endif -->
            </view>
            <view v-if="btnInfo.IsShowUserCenter" class="icon">
              <custom-button :info="btnInfo.UserCenterBtnItem" :width="320" :height="80" />
            </view>
            <!-- #ifdef MP-WEIXIN -->
            <auth-button :mode="2" />
            <!-- #endif -->
          </view>
        </template>
      </view>
    </view>
    <!-- 拍照规则 -->
    <rule-dialog v-model="isShowExample" :content="info.photorule" />
    <!-- 中奖结果 -->
    <prize-dialog v-model="isShowPrize" :info="prizeInfo" :mp-info="mpInfo" />
    <!-- 活动规则 -->
    <desc-dialog
      v-model="isShowDesc"
      :info="{
        actId: actInfo.aid,
        title: info.title,
        startTime: info.begintime,
        endTime: info.endtime,
        rule: info.rule
      }"
      :mp-info="mpInfo"
      :top="top"
    />
    <loading v-if="!isLoaded" use-default />

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import { getExtConfig } from '@/config/index'
// #endif
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import Loading from 'packages/components/loading/index.vue'
import CustomButton from 'packages/components/bottom-btn/bottom-btn.vue'
import SignCalendar from './components/sign-calendar'
import PhotoArea from './components/photo-area'
import PrizeList from './components/prize-list'
import RuleDialog from './components/rule-dialog'
import PrizeDialog from './components/prize-dialog.vue'
import DescDialog from './components/desc-dialog.vue'
import { setBgColorMixin } from 'packages/mixins/navigation'
import imgMixin from 'packages/mixins/img'
import { commonMixin } from './mixins'
import { apiGetActID, apiHasDiary, apiGetActivity, apiGetSigned, apiGetSignedImg } from 'packages/api/photo-sign'
import { apiGetMpInfo } from 'packages/api/common'
import { getPage, hex2rgb } from 'packages/utils/index'
import { getUrlQuery } from 'packages/utils/function'

export default {
  name: 'PhotoSign',
  components: {
    TitleBar,
    Loading,
    SignCalendar,
    PhotoArea,
    PrizeList,
    RuleDialog,
    PrizeDialog,
    DescDialog,
    CustomButton
  },
  mixins: [commonMixin, setBgColorMixin, imgMixin],
  data() {
    return {
      scene: '', // 小程序参数，需decode
      actInfo: {
        id: '', // 原始id
        aid: '', // 活动id
        memberLogin: '' // 品牌商编号
      },
      type: 0, // 0.默认 1.从打卡日记页进入
      info: {
        title: '',
        status: '', // -1已删除 0未开始 1进行中 2已结束 3已禁用
        audittype: '', // 0无需审核 1人工审核
        lastsignstatus: '', // -1初始状态 0未审核 1审核通过 2审核不通过
        leftsignnum: '' // 剩余上传打卡次数
      },
      isShowDesc: false, // 活动说明弹窗
      btnInfo: {}, // 底部按钮组
      prizeList: [], // 奖项数据
      signedList: [], // 已打卡数据
      isShowPrize: false,
      prizeInfo: {}, // 中奖信息
      isLoaded: false, // 加载标记 防止页面展示不全
      firstInit: true,
      mpInfo: {
        type: 0,
        appid: '',
        ishasminiprogram: false
      },
      isOpenDiary: false
    }
  },
  computed: {
    globalTheme() {
      return {
        sideBtnBg: hex2rgb(this.info.themecolor, 0.1),
        confirmBtnBg: hex2rgb(this.info.themecolor, 0.7),
        arrowCenter: hex2rgb(this.info.themecolor, 0.4)
      }
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
    let aid = ''
    // 兼容链接形式：1、id&m, 2、scene 3、aid （& type）
    if (!(options.id || options.scene || options.aid)) return this.$msg('链接格式不正确')
    if (this.firstInit) {
      let params = {}
      if (options.id) {
        params = options
        // this.scene = encodeURIComponent(`id=${options.id}`)
        this.actInfo.id = options.id
      } else if (options.aid) {
        // 能获取aid，后续不用调转化接口
        aid = options.aid
        options.type && (this.type = +options.type)
      } else {
        params = getUrlQuery(decodeURIComponent(options.scene))
        // this.scene = options.scene
        this.actInfo.id = params.id
      }

      if (!aid) {
        aid = await this.exchangeActId(params)
      }
      if (!aid) return
      this.actInfo.aid = aid

      if (this.type === 0) {
        await this.judgeOpenDiary()
        if (this.isOpenDiary) {
          uni.redirectTo({ url: `/packages/src/pages/photo-sign/diary?aid=${this.actInfo.aid}` })
          return
        }
      }

      await this.getInfo()
      this.getSignedList()
      // #ifdef MP-CLOUDSHOP
      this.getMpInfo()
      // #endif
    }

    this.isLoaded = true
    this.firstInit = false
  },
  onPullDownRefresh() {
    this.getInfo()
    this.getSignedList()
    uni.stopPullDownRefresh()
  },
  onShareAppMessage() {
    let params = `aid=${this.actInfo.aid}&type=${this.type}`
    // if (this.scene) {
    //   params = `scene=${this.scene}`
    // } else {
    //   params = `aid=${this.actInfo.aid}`
    // }
    return {
      title: this.info.sharetitle || this.info.title,
      imageUrl: this.info.shareico,
      path: `/packages/src/pages/photo-sign/index?${params}`
    }
  },
  methods: {
    getInfo() {
      return new Promise(resolve => {
        apiGetActivity({ aid: this.actInfo.aid }).then(res => {
          const d = this.$toLowerKey(res, true)
          const {
            title,
            activitystatus: status,
            begintime,
            endtime,
            backgroundimg,
            cententjson,
            sharetitle,
            shareico,
            registrationremark: rule,
            rule: prizes,
            audittype,
            leavesignnum: leftsignnum,
            lasttodaysigntype: lastsignstatus,
            photomode
          } = d.return_data
          const { themecolor, backgroundcolor, photorule, isshowawardscontent, bottombtnmodular } = this.$toLowerKey(
            JSON.parse(cententjson) || {}
          )

          this.info = {
            title,
            status,
            begintime,
            endtime,
            backgroundimg,
            themecolor,
            backgroundcolor,
            photorule,
            isshowawardscontent,
            rule,
            sharetitle,
            shareico: this.formatImg(shareico),
            audittype,
            leftsignnum,
            lastsignstatus,
            photomode
          }
          this.btnInfo = bottombtnmodular
          this.calcPrizeList(prizes) // 拼装奖项数据
          // 待审核、审核通过需获取当前已上传图片（无需审核模式下当成通过）
          status === 1 && [0, 1].includes(lastsignstatus) && this.getHasSignedImg()
          this.setBackgroundColor({ backgroundColor: backgroundcolor })
          resolve()
        })
      })
    },
    getSignedList() {
      let date = new Date()
      const curMonth = `${date.getFullYear()}-${this.padNum(date.getMonth() + 1)}`
      apiGetSigned({
        aid: this.actInfo.aid,
        days: curMonth
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        this.signedList = (d.return_data || []).map(item => item.days)
      })
    },
    padNum(v) {
      return v < 10 ? `0${v}` : `${v}`
    },
    calcPrizeList(list = []) {
      // 0实物 1积分 2购物券 3红包
      const prizeList = list.map(({ day, prizeinfo: [{ prizetype, amount, name }] }) => ({
        day,
        prizetype,
        content: prizetype === 1 ? `${amount}${name}` : undefined
      }))
      this.prizeList = prizeList
    },
    getHasSignedImg() {
      apiGetSignedImg({ aid: this.actInfo.aid }).then(res => {
        const signedimg = res.return_data || ''
        this.info = { ...this.info, signedimg }
      })
    },
    onShowPrize(prize) {
      this.prizeInfo = prize
      this.isShowPrize = true
      if (this.info.audittype === 0) {
        // 打卡后更新状态
        this.info.lastsignstatus = 1
        // 更新打卡日历
        this.getSignedList()
        // 更新打卡统计
        this.$store.dispatch('photoSign/updatePhotoSign', { mpid: this.actInfo.id })
      } else {
        this.info.lastsignstatus = 0
        this.info.leftsignnum--
      }
    },
    exchangeActId({ id }) {
      return new Promise(resolve => {
        apiGetActID({ mpid: id })
          .then(res => {
            // 转化小程序链接上的id为actId
            resolve(res.return_data)
          })
          .catch(err => {
            if ([-2].includes(err.return_code)) {
              // 活动不存在，注意已删除、已结束、已禁用等状态也需要正常获取数据
              uni.redirectTo({
                url: '/packages/src/pages/lotto/error-page'
              })
              resolve()
            }
          })
      })
    },
    async judgeOpenDiary() {
      try {
        const res = await apiHasDiary({ aid: this.actInfo.aid })
        this.isOpenDiary = res.return_data
      } catch (e) {
        // 异常
      }
    },
    // #ifdef MP-WEIXIN
    getMpInfo() {
      const m = this.$toLowerKey(getExtConfig()).memberlogin
      apiGetMpInfo({
        m,
        types: [0] // 0-会员小程序 1-云店小程序
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        if (this.$ck(d, false)) {
          d.return_data?.length > 0 && (this.mpInfo = d.return_data[0])
        }
      })
    }
    // #endif
  }
}
</script>
<style lang="scss" scoped>
@import './styles/index.scss';
</style>
