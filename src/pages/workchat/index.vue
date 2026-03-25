<template>
  <view>
    <view v-if="pageConfig.showPage" class="workchat" :style="{ 'background-color': pageConfig.bgColor }">
      <TitleBar :title="pageConfig.title" textcolor="#fff" type="detail" show-nav-title is-transparent />
      <view class="content">
        <!-- 背景图从后台设置来的-->
        <image :src="pageConfig.bg" mode="widthFix" class="bg" />
        <view :style="{ height: bgTop }" />

        <view class="receive-view">
          <image
            v-if="canReceive"
            :src="PACKAGE_STATIC_URL + 'workchat/receice.png'"
            mode="widthFix"
            class="btn-receive"
            @tap="handleReceive"
          />
          <image
            v-else
            :src="PACKAGE_STATIC_URL + 'workchat/receice-disabled.png'"
            mode="widthFix"
            class="btn-receive"
          />
          <!-- #ifdef MP-WEIXIN -->
          <auth-button v-if="canReceive" :mode="2" />
          <!-- #endif -->
        </view>
        <box>
          <view slot="content">
            <scroll-view style="height: 220rpx" scroll-y="true" class="scroll-Y" :show-scrollbar="false">
              <u-parse
                class="explain"
                :html="pageConfig.ruleText"
                :tag-style="parseStyle"
                :show-with-animation="true"
              />
            </scroll-view>
          </view>
        </box>
        <view :style="{ height: btnArr.length ? '160rpx' : '40rpx' }" />
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
      </view>
    </view>
    <prize-dialog v-model="showPrizeDialog" :info="prizeInfo" />
    <common-popup v-model="showTip" :confirm-text="confirmText" @cancel="handleCancel">
      <view class="fs-30">{{ tipMsg }}</view>
      <view v-if="status === 1 && actStatus === 1" class="fs-28">开始时间：{{ pageConfig.starttime }}</view>
    </common-popup>
    <loading v-if="!pageConfig.showPage" use-default />

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiWorkchatGetactivity, apiWorkchatReceivePrize } from 'packages/api/workchat'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { richText2Mixin } from 'packages/mixins/rich-text'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { getUrlQuery } from 'packages/utils/function'
import box from './comps/box'
import PrizeDialog from './comps/prize-dialog'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import Loading from 'packages/components/loading/index.vue'
import { uniLogin as getJsCode } from 'packages/utils/login.js'
import { getExtConfig } from '@/config'
import { redirectToMp } from 'packages/utils/function.js'
export default {
  components: {
    Loading,
    TitleBar,
    box,
    PrizeDialog,
    CommonPopup
  },
  mixins: [packageStaticMixin, richText2Mixin],
  data() {
    return {
      loading: true,
      prizeInfo: {}, // 奖项信息
      goReceive: false,
      showPrizeDialog: false, // 显示奖项弹窗
      status: 0, //status 0：禁用；1：启用；2：删除
      actStatus: 0, //actstatus 1-未开始；2-进行中；3-已禁用；4-已过期；
      showTip: false, // 显示提示
      tipMsg: '', // 提示文案
      confirmText: '知道了',
      tipType: 0, // 1:仅首次添加的用户才能参与
      btnArr: [], // 页脚按钮
      actInfo: {
        actid: 0,
        channelcodeid: 0
      },
      pageConfig: {
        showPage: false,
        bg: '', // 背景图片
        bgColor: '', // 背景颜色
        title: '',
        starttime: '',
        ruleText: ''
      }
    }
  },
  computed: {
    canReceive() {
      return this.status === 1 && this.actStatus === 2 && this.goReceive
    },
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      let style = `${44 + this.statusBarHeight}px`
      return style
    },
    rulesTop() {
      let style = `calc(${this.top} + 20rpx)`
      return style
    },
    bgTop() {
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `calc(${this.top} + 780rpx)`
      /* #endif */
      return style
    }
  },
  async onLoad(options) {
    //  console.log(encodeURIComponent(`a=10491&m=74`))
    // /packages/src/pages/workchat/index?scene=a%3D10491%26c%3D74`

    if (!options.scene) return this.$msg('链接格式不正确')
    // console.log(options.scene)
    const { a, c } = getUrlQuery(decodeURIComponent(options.scene))
    a && (this.actInfo.actid = Number(a))
    c && (this.actInfo.channelcodeid = Number(c))

    this.getInfo()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  methods: {
    async handleReceive() {
      // 领奖
      if (this.loading) return
      this.loading = true
      this.$loading.show('正在领奖')
      const extConfig = this.$toLowerKey(getExtConfig() || {}, true)
      apiWorkchatReceivePrize({
        actid: this.actInfo.actid,
        channelcodeid: this.actInfo.channelcodeid,
        appid: extConfig.appid,
        jscode: await getJsCode()
      })
        .then(d => {
          this.loading = false
          this.$loading.hide()
          const res = this.$toLowerKey(d, true)
          if (this.$ck(res)) {
            this.prizeInfo = { ...res.return_data, isFirst: true }
            this.goReceive = false
            this.showPrizeDialog = true
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
          this.goReceive = false
        })
    },
    getInfo() {
      apiWorkchatGetactivity(this.actInfo)
        .then(d => {
          const res = this.$toLowerKey(d, true)
          if (this.$ck(res)) {
            this.loading = false
            let { title, starttime, status, actstatus, ruletext, backcolor, themeimage, joinrecord, componentcontent } =
              res.return_data
            // 页面设置
            this.pageConfig = {
              showPage: true,
              bg: themeimage,
              bgColor: backcolor,
              title,
              starttime,
              ruleText: ruletext.replace(/[\r\n]/g, '<br>')
            }
            // 活动状态
            this.status = status
            this.actStatus = actstatus
            // 底部按钮
            let componentContent = JSON.parse(componentcontent || '{}')
            if (componentContent) {
              componentContent = this.$toLowerKey(componentContent, true)
              const {
                isshowbottombtn: showAll,
                isshowusercenter: showMy,
                isshowmyprizebtn: showPrize,
                usercenterbtnitem,
                myprizebtnitem
              } = componentContent?.bottombtnmodular
              showAll && showMy && this.btnArr.push(usercenterbtnitem?.mp)
              showAll && showPrize && this.btnArr.push(myprizebtnitem?.mp)
              // console.log('this.btnArr', this.btnArr)
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
              return
            }
            // 已参与活动
            if (joinrecord) {
              // 没有中奖
              if (joinrecord.winstatus !== 1) return
              // 中奖，展示奖项
              this.prizeInfo = { ...joinrecord, isFirst: false }
              this.isFirst = false
              this.showPrizeDialog = true
              return
            }
            // 未参与活动, 去领奖
            this.goReceive = true
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
