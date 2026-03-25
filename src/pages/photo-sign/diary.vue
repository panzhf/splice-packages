<template>
  <view class="sign-diary">
    <TitleBar title="打卡日记" textcolor="#000" bgcolor="#fff" type="detail" show-nav-title />
    <view class="main flex flex-column" :style="{ 'padding-top': top }">
      <view class="tab-wrapper" :style="{ top }">
        <ScrollTab
          :tab="tabs"
          :active-index.sync="activeIndex"
          active-color="#2A2A2A"
          inactive-color="#666666"
          active-bag-color="#FF5C53"
          :is-loading="busy"
          @change="refresh"
        />
      </view>
      <view class="list-wrapper">
        <SignItem v-for="(item, index) in list" :key="index" :info="item" :aid="actInfo.aid" />
        <none-data v-if="showNoneData" />
        <load-more v-if="!loading && list.length" :has-more="hasMore" />
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <view class="auth-button-wrapper">
        <auth-button ref="authButton" :mode="2" />
      </view>
      <privacy-popup ref="privacyPopup" />
      <!-- #endif -->
    </view>
    <md-copyright />
    <movable-area class="menu-area" :style="{ top, height: `${moveInfo.height}px` }">
      <movable-view direction="vertical" inertia x="630rpx" :y="`${moveInfo.y}px`" class="menu-view">
        <view class="menu-box" :class="{ slide: !isShowExample }">
          <image
            :src="PACKAGE_STATIC_URL + 'photo-sign/sidebar-sign.png'"
            class="menu-icon"
            @tap="handleNavigate('sign')"
          />
          <view class="menu-icon p-r">
            <image
              :src="PACKAGE_STATIC_URL + 'photo-sign/sidebar-rank.png'"
              class="menu-icon"
              @tap="handleNavigate('rank')"
            />
          </view>
        </view>
      </movable-view>
    </movable-area>

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import ScrollTab from 'packages/components/tab/scroll.vue'
import NoneData from 'packages/components/none-data/index.vue'
import LoadMore from 'packages/components/load-more/index.vue'
import SignItem from './components/sign-item'
import loadMoreMixin from 'packages/mixins/load-more'
import { packageStaticMixin } from 'packages/mixins/static-url'
import { commonMixin } from './mixins'
import { apiGetDiaries, apiGetDiaryDetail } from 'packages/api/photo-sign'
export default {
  name: 'SignDiary',
  components: {
    TitleBar,
    ScrollTab,
    NoneData,
    LoadMore,
    SignItem
  },
  mixins: [loadMoreMixin, packageStaticMixin, commonMixin],
  data() {
    return {
      actInfo: {
        aid: '',
        detailId: '' // 从分享链接进入有值，需优先显示该数据，后续显示最新发布数据
      },
      tabs: [
        {
          value: 0,
          name: '最新'
        },
        {
          value: 1,
          name: '最热'
        }
      ],
      activeIndex: 0,
      loading: true,
      pageLoding: false
    }
  },
  computed: {
    moveInfo() {
      const d = {
        height: 603,
        y: 388 // 单位都是px
      }
      d.height = this.windowHeight - 44 - this.statusBarHeight
      // 430=菜单整体高度260+距离底部170
      d.y = d.height - uni.upx2px(430)
      return d
    }
  },
  onLoad(options) {
    options.aid && (this.actInfo.aid = options.aid)
    options.detailid && (this.actInfo.detailId = options.detailid)
    this.refresh()
    this.isShowExample = true
  },
  onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
  },
  onPullDownRefresh() {
    this.refresh()
    uni.stopPullDownRefresh()
  },
  onPageScroll() {
    clearTimeout(this.timer)
    this.isShowExample = false
    this.timer = setTimeout(() => {
      this.isShowExample = true
    }, 500)
  },
  onShareAppMessage(options) {
    const DEFAULT_TITLE = '拍照打卡，记录美好生活~'
    if (options.from === 'button') {
      const { detailid, content, image } = options.target.dataset
      return {
        title: content || DEFAULT_TITLE,
        imageUrl: image,
        path: `/packages/src/pages/photo-sign/diary?aid=${this.actInfo.aid}&detailid=${detailid}`
      }
    }
    return {
      title: DEFAULT_TITLE,
      path: `/packages/src/pages/photo-sign/diary?aid=${this.actInfo.aid}`
    }
  },
  methods: {
    async refresh() {
      // 防止tab切换和下刷新同时触发
      if (this.pageLoding) return
      this.pageLoding = true
      await this.resetData()
      if (this.actInfo.detailId) {
        const res = await this.getDetail()
        const d = this.$toLowerKey(res)
        this.list = d.return_data ? [{ ...d.return_data, detailid: this.actInfo.detailId }] : []
      }
      await this.getData()
      this.pageLoding = false
    },
    getDetail() {
      return new Promise(resolve => {
        apiGetDiaryDetail({
          aid: this.actInfo.aid,
          detailid: this.actInfo.detailId
        })
          .then(res => {
            const d = this.$toLowerKey(res, true)
            resolve(d)
          })
          .catch(() => {
            resolve()
          })
      })
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      try {
        const res = await apiGetDiaries({
          aid: this.actInfo.aid,
          type: this.activeIndex,
          expectid: this.actInfo.detailId,
          pageindex: nextPage,
          pagesize: this.paging.pageSize
        })
        const d = this.$toLowerKey(res, true)
        if (this.$ck(d)) {
          this.dealRes({ res: d, nextPage, mode: 2 })
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    handleNavigate(type) {
      switch (type) {
        case 'sign':
          uni.navigateTo({ url: `/packages/src/pages/photo-sign/index?aid=${this.actInfo.aid}&type=1` })
          break
        case 'rank':
          // #ifdef MP-MEMBER
          this.handleLogin()
          // #endif
          // #ifndef MP-MEMBER
          uni.navigateTo({ url: `/packages/src/pages/photo-sign/rank?id=${this.actInfo.aid}` })
          // #endif
          break

        default:
          break
      }
    },
    handleLogin() {
      if (this.$refs.authButton) {
        this.$refs.authButton
          .handleLogin()
          .then(() => {
            uni.navigateTo({ url: `/packages/src/pages/photo-sign/rank?id=${this.actInfo.aid}` })
          })
          .catch(() => {
            // 登录失败或需要授权，auth-button 内部已处理
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: sign-diary;
.#{$prefix} {
  .tab-wrapper {
    position: fixed;
    z-index: 10;
    left: 0;
    width: 100%;
  }
  ::v-deep {
    .tab-box {
      .scroll-view-item {
        height: 90rpx;
        line-height: 72rpx;
      }
      .active-bar {
        top: 68rpx;
      }
    }
  }
  .main {
    min-height: 90vh;
  }
  .list-wrapper {
    padding: 110rpx 20rpx 0 20rpx;
  }
  .menu-area {
    position: fixed;
    right: 0;
    width: 100rpx;
    z-index: 11;
    pointer-events: none; // 让area不触发底部点击
  }
  .menu-view {
    width: 100rpx;
    height: 260rpx;
    pointer-events: auto; // 恢复菜单点击
  }
  .menu-box {
    transition: transform 0.3s;
    &.slide {
      transform: translateX(90%);
    }
    .menu-icon {
      display: block;
      width: 100rpx;
      height: 110rpx;
      & + .menu-icon {
        margin-top: 40rpx;
      }
    }
  }
  .auth-button-wrapper {
    z-index: 999;
    position: fixed;
    left: -9999px;
    top: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
}
</style>
