<template>
  <view class="anti-fake-page flex flex-column" :style="{ 'background-color': pageBgColor }">
    <image v-if="bgUrl" :style="{ top: bgTop }" :src="bgUrl" mode="widthFix" class="bg" />
    <!-- #ifdef MP-WEIXIN -->
    <title-bar v-if="!loading" :bgcolor="bgcolor" :textcolor="textcolor" :title="title" />
    <!-- #endif -->
    <!-- 将内容放在一层，自定义导航和tabbar两端，否则ios页面上下拖动有异常 -->
    <view v-if="!loading" class="main flex-1" :style="top">
      <view class="flex-1">
        <view v-for="(item, index) in components" :key="index">
          <!-- 视频广告 -->
          <video-adv v-if="item.code === 'VideoAd'" :video-data="item.data" />
          <!-- 标题文本 -->
          <title-text v-if="item.code === 'TitleText'" :text-data="item.data" />
          <!-- 辅助分割 -->
          <blank-segmente v-if="item.code === 'BlankSegmente'" :blank-data="item.data" />
          <!-- 图片广告 -->
          <image-ad v-if="item.code === 'ImageAd'" :img-data="item.data" />
          <!-- 扫一扫 -->
          <scan-qr-code v-if="item.code === 'ScanTrace'" :info="item.data" :mode="3" @scanData="scanDataHandle" />
          <!-- 富文本 -->
          <custom-content v-if="item.code === 'CustomContent'" :value="item.data" />
          <navigate-mp v-if="item.code === 'NavigateMp'" :info="item.data" :params="otherParams" />
        </view>
      </view>
    </view>
    <bg-music v-if="showBgAudio && pageHide" ref="bgMusic" :src="bgMusic" :is-init-play="true" />
    <loading v-if="loading" use-default />
  </view>
</template>

<script>
/* #ifdef H5 */
import { apiHomeDecoration, apiGetFwScanUrl, apiGetWxConfig } from '@/api/home'
// #endif

import TitleBar from 'packages/components/title-bar/title-home.vue'
import VideoAdv from 'packages/design/basic/video-adv.vue'
import TitleText from 'packages/design/basic/title-text.vue'
import blankSegmente from 'packages/design/basic/blank-segmente.vue'
import ImageAd from 'packages/design/basic/image-ad.vue'
import CustomContent from 'packages/design/basic/custom-content.vue'
import ScanQrCode from 'packages/design/scan/scan-qr-code.vue'
import NavigateMp from 'packages/design/scan/navigate-mp.vue'

// #ifdef MP-WEIXIN
import { scanCbMixin } from 'packages/mixins/scan'
/* #endif */

import Loading from 'packages/components/loading/index.vue'

import BgMusic from 'packages/components/bg-music'
export default {
  components: {
    TitleBar,
    VideoAdv,
    TitleText,
    blankSegmente,
    CustomContent,
    ImageAd,
    ScanQrCode,
    NavigateMp,
    Loading,
    BgMusic
  },

  mixins: [
    // #ifdef MP-WEIXIN
    scanCbMixin
    /* #endif */
  ],
  data() {
    return {
      id: 0,
      loading: true,
      bgcolor: '#fff',
      textcolor: '#fff',
      pageBgColor: '',
      // #ifdef MP-WEIXIN
      title: '防伪查询页面',
      // #endif
      bgUrl: '',
      components: [],
      bgMusic: '', //背景音乐
      showBgAudio: false, //是否显示背景音乐
      pageHide: false, //页面隐藏
      otherParams: {
        miduo_code: '' // 带参跳小程序，二维码
      }
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      style = `${44 + this.statusBarHeight}px`
      /* #endif */
      return style
    },
    bgTop() {
      // 顶部适配
      let style = ''
      /* #ifdef H5 */
      style = `${42 + this.statusBarHeight}px`
      /* #endif */
      return style
    }
  },
  onLoad(options) {
    if (options.code) {
      const code = decodeURIComponent(options.code)
      // #ifdef MP-WEIXIN
      this.otherParams.miduo_code = code
      // #endif
      // #ifdef H5
      sessionStorage.setItem('miduo_code', code)
      // 宝洁：One Code码源是完整二维码。当code存在?或者=时，页面重定向
      if (code.indexOf('?') > -1 || code.indexOf('=') > -1) {
        location.href = location.href.replace(/&code=[^&]*/, '')
        return
      }
      // #endif
    }
    // #ifdef H5
    const miduo_code = sessionStorage.getItem('miduo_code')
    if (miduo_code) {
      this.otherParams.miduo_code = miduo_code
    }
    // #endif
    /* #ifdef H5 */
    this.getHomeDetail()
    /* #endif */
  },
  onShow() {
    this.pageHide = true
  },
  onHide() {
    this.pageHide = false
  },
  onUnload() {
    if (this.bgMusic && this.showBgAudio && this.$refs.bgMusic) {
      this.$refs.bgMusic.closeMusic()
    }
  },
  // #ifdef MP-WEIXIN
  onShareAppMessage() {
    return {
      title: this.title,
      path: `/packages/src/anti-fake-page/index`
    }
  },
  // #endif
  methods: {
    /* #ifdef H5 */
    // 微信config配置
    async initWXConfig() {
      let params = {
        memberlogin: this.$route.query.m || this.$route.query.memberlogin,
        currentUrl: encodeURIComponent(location.href)
      }
      let res = await apiGetWxConfig(params)
      let wxConfig = res.return_data?.config
      wxConfig &&
        this.$wechat.config({
          debug: false,
          appId: wxConfig.appId,
          timestamp: wxConfig.timestamp,
          nonceStr: wxConfig.nonceStr,
          signature: wxConfig.signature,
          jsApiList: ['scanQRCode'],
          openTagList: ['wx-open-launch-weapp']
        })
    },
    /* #endif */
    /** 扫码处理回调  */
    scanDataHandle(val) {
      if (!val) {
        return
      }
      // 百雀羚的扫一扫要特殊处理
      /* #ifdef H5 */
      apiGetFwScanUrl({
        url: val,
        memberlogin: this.$route.query.m || this.$route.query.memberlogin
      }).then(res => {
        if (this.$ck(res)) {
          let { return_data: data } = res
          if (data.url) {
            location.href = data.url
          }
        }
      })
      /* #endif */
      // #ifdef MP-WEIXIN
      this.scanDataEvent(val, 2)
      /* #endif */
    },
    async getHomeDetail() {
      let res = await apiHomeDecoration({
        memberlogin: this.$route.query.m || this.$route.query.memberlogin,
        pageid: this.$route.query.id || this.$route.query.pageid,
        sourcetype: 7,
        pagetype: 2
      })
      if (this.$ck(res)) {
        this.components = []
        let dataList = []
        for (let item of res.return_data.components || []) {
          if (item.code === 'PageSetting') {
            const data = JSON.parse(item.data)
            // #ifdef H5
            document.title = data.Title
            // #endif
            // #ifdef MP-WEIXIN
            this.title = data.Title
            // #endif
            this.bgcolor = data.BgColor
            this.bgUrl = data.bgUrl
            this.textcolor = data.FrontColor
            this.pageBgColor = typeof data.PageBgColor === 'undefined' ? '#fff' : data.PageBgColor
            // 背景音乐
            this.showBgAudio = data.showBgAudio
            if (data.showBgAudio) {
              this.bgMusic = data.audioUrl
            }
          } else {
            item.data = JSON.parse(item.data)
            dataList.push(item)
          }
        }
        // 初始化微信配置
        /* #ifdef H5 */
        let hasWxApi = dataList.find(item => ['ScanTrace', 'NavigateMp'].includes(item.code))
        if (hasWxApi || this.bgMusic) {
          this.initWXConfig()
        }
        /* #endif */

        this.components = [...dataList]
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.anti-fake-page {
  position: relative;
  min-height: 100%;
  height: auto;
  // width: 100%;
  overflow: hidden scroll;
  .bg {
    position: absolute;
    width: 100%;
    /* #ifdef H5 */
    max-width: 960rpx;
    margin-bottom: -100rpx;
    transform: translateY(-100rpx);
    /* #endif */
  }
  .main {
    position: relative;
    .component-item {
      position: relative;
    }
  }
}
</style>
