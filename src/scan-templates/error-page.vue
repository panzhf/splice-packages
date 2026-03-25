<template>
  <view v-if="!loading" class="err-page-container flex flex-column" :style="{ backgroundColor: pageBgColor }">
    <image v-if="bgUrl" :src="bgUrl" mode="widthFix" class="bg" :style="{ top: bgTop }" />
    <!-- #ifdef MP-WEIXIN -->
    <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
    <!-- #endif -->
    <view :style="{ paddingTop: top }" class="main flex-1">
      <view v-for="(item, index) in components" :key="index" class="component-item">
        <!-- 图片广告 -->
        <image-ad v-if="item.code === 'ImageAd'" :img-data="item.data" />
        <!-- 标题文本 -->
        <blank-segmente v-if="item.code === 'BlankSegmente'" :blank-data="item.data" />
        <!-- 辅助分割 -->
        <title-text v-if="item.code === 'TitleText'" :text-data="item.data" />
        <code-not-enabled v-if="item.code === 'CodeNotEnabled'" :info="item.data" :code-data="codeData" />
        <code-unknown v-if="item.code === 'CodeUnknown'" :info="item.data" :code-data="codeData" />
        <guide-disabled v-if="item.code === 'GuideDisabled'" :info="item.data" :followgzhurl="followgzhurl" />
      </view>
    </view>
    <md-copyright bg-color="transparent" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
/* #ifdef MP-WEIXIN */
import { getExtConfig } from '@/config/index'
/* #endif */
import defaultDesign from 'packages/utils/default-design.json'

import { getQuery } from 'packages/utils/function'
import TitleBar from 'packages/components/title-bar/title-home.vue'

import ImageAd from 'packages/design/basic/image-ad.vue'
import TitleText from 'packages/design/basic/title-text.vue'
import blankSegmente from 'packages/design/basic/blank-segmente.vue'
import CodeNotEnabled from 'packages/design/scan/code-not-enabled.vue'
import CodeUnknown from 'packages/design/scan/code-unknown.vue'
import { apiGetPKZSaoMaErrorMsg, apiGetGzhCodeImg, apiErrorPageInfo } from 'packages/api/scan'
import GuideDisabled from 'packages/design/scan/guide-disabled.vue'
export default {
  components: {
    TitleBar,
    ImageAd,
    TitleText,
    blankSegmente,
    CodeNotEnabled,
    CodeUnknown,
    GuideDisabled
  },
  data() {
    return {
      icon: staticURL(true) + 'chb__error.png',
      content: '',
      errmsg: '',
      msg: '',
      code: '',
      companyname: '',
      components: [],
      loading: true,
      pageBgColor: '',
      bgcolor: '#fff',
      textcolor: '',
      title: '',
      bgUrl: '',
      showBack: false,
      hideElement: false,
      pageType: -1, // -1 异常 1 码未启用 2 导购员账户被禁用
      codeData: {},
      options: {},
      followgzhurl: ''
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
  async onLoad(options) {
    // 前端其他地方跳转页面传`pageType`，此外还可能从其他业务端跳转带参`pagetype`
    const { pageType, ...rest } = options
    const d = this.$toLowerKey(rest, true)
    d.m && (d.m = decodeURIComponent(d.m).trim()) // 部分链接memberlogin有空格

    this.options = d
    if ((pageType || d.msg || d.content || d.errmsg) && !['-3', '25'].includes(d.ecode)) {
      this.pageType = pageType ? Number(pageType) : -1
      this.codeData = {
        msg: decodeURIComponent(d.msg || d.content || d.errmsg)
      }
    } else {
      await this.getCodeInfo()
    }
    this.initData()
  },
  methods: {
    getCodeInfo() {
      return new Promise(resolve => {
        let query = {
          M: this.options.m,
          IsBoxCode: this.options.boxcode,
          Ecode: this.options.ecode,
          Type: this.options.type,
          Code: this.options.code || 0,
          SerialNumber: this.options.serialnumber || 0,
          Isbox: this.options.isbox,
          BatchId: this.options.batchid,
          FcNoQueryTip: this.options.fcnoquerytip,
          FcNoAuthTip: this.options.errmsg,
          Msg: this.options.msg ? decodeURIComponent(this.options.msg) : '',
          CodeInfo: this.options.codeinfo
        }
        apiGetPKZSaoMaErrorMsg(query).then(res => {
          const data = this.$toLowerKey(res, true).return_data
          if (data.ecode === '-3') {
            ////流水号批次没有启用或作废   1
            this.pageType = 1
            data.serialnumber = query.SerialNumber
            data.code = query.Code
            this.codeData = data
          } else if (data.ecode === '25') {
            //导购被禁用
            this.pageType = 2
            this.codeData = data
          } else {
            data.msg = data.content
            this.codeData = data
            this.pageType = -1
          }
          resolve()
        })
      })
    },
    // formatNumber(n) {
    //   n = n.toString()
    //   return n[1] ? n : '0' + n
    // },
    async initData() {
      let query = {}
      let data
      /* #ifdef H5 */
      query = {
        sourcetype: 6,
        memberlogin: getQuery('m').trim()
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      /* #ifdef MP-RETAIL */
      let { memberLogin } = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      /* #endif */
      query = {
        sourcetype: 5,
        memberlogin: this.$toLowerKey(getExtConfig()).memberlogin || memberLogin
      }
      /* #endif */
      /* #ifdef H5 */
      if (!getQuery('m')) {
        // H5 没有memberlogin 使用默认数据
        this.setData(defaultDesign)
        this.loading = false
        return
      }
      /* #endif */
      let res = await apiErrorPageInfo(query)
      data = this.$toLowerKey(res, true)?.return_data?.data || {}
      let designData = JSON.parse(data)
      this.setData(designData)
      this.loading = false
    },
    setData(designData) {
      let ketList = {
        '-1': 'CodeUnknown',
        1: 'CodeNotEnabled',
        2: 'GuideDisabled'
      }
      let components = designData[ketList[this.pageType]].page
      let dataList = []
      for (let item of components) {
        if (item.code === 'PageSetting') {
          const data = JSON.parse(item.data)
          this.title = data.Title
          this.bgcolor = data.BgColor
          this.textcolor = data.FrontColor
          this.pageBgColor = typeof data.PageBgColor === 'undefined' ? '#fff' : data.PageBgColor
          this.bgUrl = data.bgUrl
          /* #ifdef H5 */
          uni.setNavigationBarTitle({
            title: data.Title
          })
          /* #endif */
        } else if (item.code === 'Navigation') {
          const n = JSON.parse(item.data)
          this.tabBarData = n ? n.Navigation : []
          // 2022.3.7新增导航配色
          let { bgColor, selectedColor, color } = n
          if (typeof color === 'undefined') {
            bgColor = '#fff'
            selectedColor = '#ffa300'
            color = '#000'
          }
          this.$store.commit('setTabbarSetting', {
            bgColor,
            selectedColor,
            color
          })
        } else {
          item.data = JSON.parse(item.data)
          dataList.push(item)
        }
      }
      this.components = dataList
      if (this.pageType === 2) {
        this.getGzhCodeImg()
      }
    },
    getGzhCodeImg() {
      let query = {}
      /* #ifdef H5 */
      query = {
        memberlogin: getQuery('m').trim()
      }
      /* #endif */
      apiGetGzhCodeImg(query).then(res => {
        if (this.$ck(res)) {
          let data = this.$toLowerKey(res, true).return_data
          this.followgzhurl = data.qrcodeurl
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.error {
  line-height: 52rpx;
  text-align: center;
  font-size: 32rpx;
  color: #666;
}
.error-content {
  margin: 0 75rpx 32rpx;
}
.error-icon {
  margin: 0 auto;
  margin-top: 188rpx;
  margin-bottom: 40rpx;
  width: 237rpx;
  height: 172rpx;
}
.error-info {
  margin-top: 32rpx;
}
.err-page-container {
  position: relative;
  min-height: 100vh;
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
}
</style>
