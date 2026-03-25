<template>
  <view>
    <tab
      v-if="showTab && info.showTopic"
      :tab="tab"
      :active-index.sync="activeIndex"
      :bg-color="info.bgColor"
      :active-color="info.activeColor"
      :inactive-color="info.inactiveColor"
      @change="handleTabChange"
    />
    <list :list.sync="list" :loading="loading" :has-more="hasMore" :bg-color="info.bgColor" @detail="handleDetail" />

    <movable-area class="menu-area" :style="{ top: `${moveInfo.top}px`, height: `${moveInfo.height}px` }">
      <movable-view direction="vertical" inertia x="650rpx" :y="`${moveInfo.y}px`" class="menu-view">
        <view class="handle-box" :class="{ slide: hideElement }">
          <view
            v-if="info.showUpload"
            class="btn flex flex-center flex-middle flex-column"
            @tap.stop="handleSkip('/packages/src/community/redact')"
          >
            <view class="icon iconfont iconshangchuan" />
            <view class="text">上传</view>
          </view>
          <view
            v-if="info.showMyUpload"
            class="btn flex flex-center flex-middle flex-column mt-30"
            @tap.stop="handleSkip('/packages/src/community/my')"
          >
            <view class="icon iconfont iconwodeshangchuan" />
            <view class="text">我的上传</view>
          </view>
          <auth-button :no-verify-mobile="true" @verifyMobile="userMobileVisible = true" />
        </view>
      </movable-view>
    </movable-area>
    <!-- #ifdef MP-MEMBER -->
    <mobile-auth v-model="userMobileVisible" />
    <!-- #endif -->
  </view>
</template>

<script>
import Tab from 'packages/components/tab/scroll.vue'
import List from './list.vue'
import { apiGetTopicList, apiGetContentCommunityList } from 'packages/api/community.js'
import { getExtConfig } from '@/config/index.js'
// #ifdef MP-MEMBER
import MobileAuth from '@/components/auth/mobile-auth.vue'
// #endif

export default {
  components: {
    Tab,
    List,
    // #ifdef MP-MEMBER
    MobileAuth
    // #endif
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    hideElement: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userMobileVisible: false,
      activeIndex: 0,
      tab: [],
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      maxid: 0,
      topicid: 0,
      showTab: false,
      Memberlogin: '',
      moveInfo: {
        top: 64,
        height: 554,
        y: 393 // 单位都是px
      }
    }
  },
  created() {
    try {
      const { statusBarHeight, windowHeight, system } = uni.getSystemInfoSync()
      const isIPhoneX = !!(system.toLowerCase().search('ios') + 1) && windowHeight >= 812
      this.moveInfo.top = statusBarHeight + 44
      // 滑动区域高度=屏幕高度-导航栏-tabbar
      this.moveInfo.height = windowHeight - 44 - statusBarHeight - (isIPhoneX ? 34 + 50 : 50)
      this.moveInfo.y = this.moveInfo.height - uni.upx2px(400)
    } catch (error) {
      console.log(error)
    }

    uni.$on('onReachBottom', () => {
      if (this.hasMore) {
        this.getData()
      }
    })
    // 获取品牌商编号的
    this.Memberlogin = this.$toLowerKey(getExtConfig()).memberlogin
    this.getTagList()
    this.getData()
  },
  beforeDestroy() {
    uni.$off('onReachBottom')
    uni.$off('setZan')
  },
  methods: {
    handleTabChange(e) {
      this.maxid = 0
      this.hasMore = true
      this.topicid = e.id
      this.list = []
      this.loading = true
      this.getData()
    },
    getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      apiGetContentCommunityList({
        m: this.Memberlogin,
        maxid: this.maxid,
        topicid: this.topicid
      })
        .then(res => {
          const result = (res.return_data || []).map(item => ({ ...item, istaped: false }))
          this.list = [...this.list, ...result]
          this.maxid = res.return_maxid
          // 判断加载完成
          this.hasMore = res.return_maxid !== 0
          this.busy = false
          this.loading = false
        })
        .catch(err => {
          this.$msg(err.return_msg)
          this.busy = false
          this.loading = false
        })
    },
    getTagList() {
      apiGetTopicList({
        m: this.Memberlogin
      }).then(res => {
        if (this.$ck(res)) {
          let { return_data: data } = res
          data.forEach(item => {
            item.name = '#' + item.topicname
            return item
          })
          data.unshift({
            name: '全部',
            id: 0
          })
          this.tab = data
          this.showTab = true
        }
      })
    },
    handleDetail(item) {
      uni.navigateTo({
        url: `/packages/src/community/detail?id=${item.communityid}`
      })
    },
    handleSkip(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>
<style lang="scss" scoped>
.menu-area {
  position: fixed;
  right: 0;
  width: 100rpx;
  z-index: 11;
  pointer-events: none; // 让area不触发底部点击
}
.menu-view {
  width: 100rpx;
  height: 230rpx;
  pointer-events: auto; // 恢复菜单点击
}
.handle-box {
  // position: fixed;
  // bottom: 200rpx;
  // right: 0;
  transition: transform 0.3s;
  position: relative;
  &.slide {
    transform: translateX(90%);
  }
  .btn {
    border: 1px solid #ddd;
    width: 100rpx;
    height: 100rpx;
    background: #fff;
    border-radius: 50%;
    box-sizing: border-box;
    .text {
      font-size: 22rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #2a2a2a;
    }
  }
}
</style>
