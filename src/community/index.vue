<template>
  <view>
    <view v-if="!loading" class="home flex flex-column" :style="{ backgroundColor: pageBgColor }">
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
      <view :style="top" class="flex-1">
        <view v-for="(item, index) in components" :key="index" class="component-item">
          <announce-notice v-if="item.code === 'AnnounceNotice'" :notice-data="item.data" />
          <video-adv v-if="item.code === 'VideoAd'" :video-data="item.data" />
          <title-text v-if="item.code === 'TitleText'" :text-data="item.data" />
          <blank-segmente v-if="item.code === 'BlankSegmente'" :blank-data="item.data" />
          <image-cube v-if="item.code === 'ImageCube'" :image-data="item.data" />
          <picture-navigation v-if="item.code === 'PictureNavigation'" :nav-data="item.data" />
          <image-ad v-if="item.code === 'ImageAd'" :img-data="item.data" />
          <custom-content v-if="item.code === 'CustomContent'" :value="item.data" />
          <combine-carousel v-if="item.code === 'CombineCarousel'" :info="item.data" />
          <community v-if="item.code === 'Community'" :info="item.data" :hide-element="hideElement" />
        </view>
      </view>
      <md-copyright />
    </view>
    <!-- #ifdef MP-CLOUDSHOP -->
    <view class="tabbar-footer-gap" />
    <!-- #endif -->
    <TabBar />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiHomeDecoration } from 'packages/api/community'
import TabBar from '@/components/tab-bar/index.vue'
import TitleBar from 'packages/components/title-bar/title-home.vue'
import Community from './design/community.vue'

import ImageAd from 'packages/design/basic/image-ad.vue'
import AnnounceNotice from 'packages/design/basic/announce-notice.vue'
import VideoAdv from 'packages/design/basic/video-adv.vue'
import TitleText from 'packages/design/basic/title-text.vue'
import blankSegmente from 'packages/design/basic/blank-segmente.vue'
import ImageCube from 'packages/design/basic/image-cube.vue'
import PictureNavigation from 'packages/design/basic/picture-navigation.vue'
import CombineCarousel from 'packages/design/basic/combine-carousel.vue'
import CustomContent from 'packages/design/basic/custom-content.vue'
export default {
  components: {
    TabBar,
    TitleBar,
    Community,
    ImageAd,
    AnnounceNotice,
    VideoAdv,
    TitleText,
    blankSegmente,
    ImageCube,
    PictureNavigation,
    CombineCarousel,
    CustomContent
  },
  data() {
    return {
      components: [],
      loading: true,
      pageBgColor: '',
      bgcolor: '#fff',
      textcolor: '',
      title: '',
      showBack: false,
      hideElement: false,
      timer: null
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    top() {
      // 顶部适配
      const style = `padding-top:${44 + this.statusBarHeight}px;`
      return style
    }
  },
  created() {
    // 是否有后续页面，允许返回
    const currentPages = getCurrentPages()
    this.showBack = currentPages.length > 1
    this.getHomeDetail()
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  onReachBottom() {
    uni.$emit('onReachBottom')
  },
  onPageScroll() {
    clearTimeout(this.timer)
    this.hideElement = true
    this.timer = setTimeout(() => {
      this.hideElement = false
    }, 500)
  },
  onShareAppMessage() {
    return {
      title: '快来看看朋友发布的种草内容吧~',
      path: '/packages/src/community/index'
    }
  },
  methods: {
    async getHomeDetail() {
      let res = await apiHomeDecoration({ sourcetype: 4 })
      if (this.$ck(res)) {
        this.components = []
        let dataList = []
        for (let item of res.return_data.components || []) {
          if (item.code === 'PageSetting') {
            const data = JSON.parse(item.data)
            this.title = data.Title
            this.bgcolor = data.BgColor
            this.textcolor = data.FrontColor
            this.pageBgColor = typeof data.PageBgColor === 'undefined' ? '#fff' : data.PageBgColor
            // 装修中心新增状态栏配色
            const pages = getCurrentPages()
            const page = pages[pages.length - 1]
            if (
              (data.statusColor || ['#000000', '#ffffff'].includes(data.FrontColor)) &&
              page.route === 'packages/src/community/index'
            ) {
              uni.setNavigationBarColor({
                frontColor: data.statusColor || data.FrontColor,
                backgroundColor: data.BgColor
              })
            }
          } else if (item.code === 'Navigation') {
            // const n = JSON.parse(item.data)
            // this.tabBarData = n ? n.Navigation : []
            // getApp().globalData.tabBar = this.tabBarData
          } else {
            item.data = JSON.parse(item.data)
            dataList.push(item)
          }
        }
        this.components = [...dataList]
        this.loading = false
      }
    }
  }
}
</script>
