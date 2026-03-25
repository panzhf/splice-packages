<template>
  <view class="home flex flex-column" :style="pageStyle">
    <template v-if="!loading && !isExpires">
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
      <image v-if="bgUrl" :src="bgUrl" mode="widthFix" class="bg" />

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

          <gift v-if="item.code === 'gift'" :gift-data="item.data" />
          <my-point v-if="item.code === 'MyPoint'" :value="item.data" />
        </view>
      </view>
      <md-copyright v-if="components.length > 0" />
      <!-- 底部导航 -->
      <TabBar show-placeholder />
    </template>
    <!-- #ifdef MP-GUIDE -->
    <view v-if="isExpires" class="home flex flex-column">
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
      <overdue :overdue-data="overdueData" />
      <TabBar />
    </view>
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiHomeDecoration } from 'packages/api/integral.js'
import TitleBar from 'packages/components/title-bar/title-home.vue'
import MdCopyright from 'packages/components/easycom/md-copyright.vue'
import AnnounceNotice from 'packages/design/basic/announce-notice.vue'
import VideoAdv from 'packages/design/basic/video-adv.vue'
import TitleText from 'packages/design/basic/title-text.vue'
import blankSegmente from 'packages/design/basic/blank-segmente.vue'
import ImageCube from 'packages/design/basic/image-cube.vue'
import PictureNavigation from 'packages/design/basic/picture-navigation.vue'
import ImageAd from 'packages/design/basic/image-ad.vue'
import CombineCarousel from 'packages/design/basic/combine-carousel.vue'
import CustomContent from 'packages/design/basic/custom-content.vue'
import Gift from 'packages/design/integral/produc-recommend.vue'
import MyPoint from 'packages/design/integral/my-point.vue'
// #ifdef MP-GUIDE
import Overdue from 'packages/components/overdue/index.vue'
// #endif

import TabBar from '@/components/tab-bar/index.vue'
export default {
  components: {
    TitleBar,
    AnnounceNotice,
    VideoAdv,
    TitleText,
    blankSegmente,
    ImageCube,
    PictureNavigation,
    ImageAd,
    MdCopyright,
    CombineCarousel,
    CustomContent,
    Gift,
    MyPoint,
    TabBar,
    // #ifdef MP-GUIDE
    Overdue
    // #endif
  },
  data() {
    return {
      loading: true,
      bgcolor: '#fff',
      textcolor: '#000',
      pageBgColor: '',
      bgUrl: '',
      title: '',
      showBack: false,
      components: [],
      // #ifdef MP-GUIDE
      overdueData: {
        companyName: '',
        link: ''
      },
      // #endif
      isExpires: 0 // 0：商户未过期 1：过期
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
    },
    pageStyle() {
      const s = []
      let bg = this.pageBgColor
      // #ifdef MP-GUIDE
      !this.isExpires && (bg = '#f5f5f5')
      // #endif
      s.push(`background-color: ${bg}`)
      return s.join(';')
    }
  },
  onLoad() {
    // 是否有后续页面，允许返回
    const currentPages = getCurrentPages()
    this.showBack = currentPages.length > 1
  },
  async onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
    // #ifdef MP-GUIDE
    // 导购积分商城增加打烊显示
    this.isExpires = this.$store.state.isExpires || 0
    if (this.isExpires) {
      this.loading = false
      this.title = '积分商城'
      const currentBrandInfo = JSON.parse(uni.getStorageSync('currentBrandInfo') || '{}')
      this.overdueData = {
        companyName: currentBrandInfo.memberloginname,
        link: '/pages/me/index'
      }
      return
    }
    // #endif

    await this.getHomeDetail()
  },
  onShareAppMessage() {
    return {
      title: this.title,
      path: `/packages/src/integral/index`
    }
  },
  methods: {
    errCallback() {
      uni.redirectTo({
        url: '/packages/src/integral/list'
      })
    },
    async getHomeDetail() {
      let res = await apiHomeDecoration({ sourcetype: 2 })
      if (this.$ck(res)) {
        if (!res.return_data || !res.return_data.components) return this.errCallback()
        this.components = []
        let dataList = []
        for (let item of res.return_data.components || []) {
          if (item.code === 'PageSetting') {
            const data = JSON.parse(item.data)
            this.title = data.Title
            this.bgcolor = data.BgColor
            this.textcolor = data.FrontColor
            this.pageBgColor = typeof data.PageBgColor === 'undefined' ? '#fff' : data.PageBgColor
            this.bgUrl = data.bgUrl
            // 装修中心新增状态栏配色
            const pages = getCurrentPages()
            const page = pages[pages.length - 1]
            if (
              (data.statusColor || ['#000000', '#ffffff'].includes(data.FrontColor)) &&
              page.route === 'packages/src/integral/index'
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
          } else if (item.code === 'Category') {
            // 存产品类型显示样式
            const data = JSON.parse(item.data)
            this.$store.commit('integral/setGiftCategory', data)
          } else {
            item.data = JSON.parse(item.data)
            dataList.push(item)
          }
        }
        this.components = [...dataList]
        this.loading = false
        // #ifdef MP-MEMBER
        this.$store.commit('setIsFirst', false)
        // #endif
      } else {
        this.errCallback()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  min-height: 100%;
}
.bg {
  position: absolute;
  width: 100%;
  /* #ifdef H5 */
  max-width: 960rpx;
  /* #endif */
}
.component-item {
  position: relative;
}
</style>
