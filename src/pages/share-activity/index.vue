<template>
  <view class="page-share-activity" :style="{ 'background-color': info.backgroundcolor }">
    <TitleBar title="邀请好友助力" textcolor="#fff" type="detail" show-nav-title is-transparent />
    <!-- 背景图 -->
    <image :src="info.backgroundurl" mode="widthFix" class="bg" />
    <view class="content">
      <view class="placeholder" />
      <PrizeProgress v-if="info.isenableloading" :info="ProgressInfo" :count="countInfo" />
      <FriendList v-if="info.isshowsharedetail" :list="friendList" :total="totalCount" :finished="finished" />
      <view class="footer-gap" />
      <button open-type="share" hover-class="button-action" class="share-btn">
        <image :src="info.sharebtnurl" class="img" />
      </button>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { apiGetShareRecords, apiGetShareAwardStat } from 'packages/api/share-activity'
import PrizeProgress from './components/prize-progress'
import FriendList from './components/friend-list'
export default {
  name: 'ShareActivity',
  components: {
    TitleBar,
    PrizeProgress,
    FriendList
  },
  mixins: [packageStaticMixin],
  data() {
    return {
      options: {},
      info: {},
      countInfo: {
        totalwinnum: 0,
        themaxaawrdnum: 0,
        isreachdatelimit: false
      },
      friendList: [],
      pageInfo: {
        pageindex: 0,
        pagesize: 20
      },
      totalCount: 0,
      finished: false,
      busy: false
    }
  },
  computed: {
    ProgressInfo() {
      return {
        awardperiodnum: this.info.awardperiodnum,
        winnumperperiod: this.info.winnumperperiod,
        customchancetext: this.info.customchancetext,
        totalCount: this.totalCount
      }
    }
  },
  onLoad(options) {
    this.options = options
    // 隐藏原生分享，只使用按钮分享
    uni.hideShareMenu()
    const s = uni.getStorageSync('shareActivity')
    this.info = s
    this.init()
    uni.setBackgroundColor({
      backgroundColor: s.backgroundcolor,
      backgroundColorTop: s.backgroundcolor,
      backgroundColorBottom: s.backgroundcolor
    })
  },
  onPullDownRefresh() {
    this.resetData()
    this.init()
    uni.stopPullDownRefresh()
  },
  onReachBottom() {
    if (!this.finished) {
      this.getFriends()
    }
  },
  onShareAppMessage() {
    let origin = uni.getStorageSync('sharePage')
    let path = `${origin.path}&shareId=${this.options.id}&shareUser=${this.options.user}&t=${this.options.t}`
    if (process.env.NODE_ENV === 'development') {
      console.log(path)
    }
    return {
      ...origin,
      path
    }
  },
  methods: {
    init() {
      const { isenableloading, isshowsharedetail } = this.info
      if (isenableloading) {
        this.getProgress()
      }
      if (isshowsharedetail) {
        this.getFriends()
      }
    },
    getProgress() {
      apiGetShareAwardStat({
        aid: this.info.actId,
        actType: this.info.actType
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        this.countInfo = d.return_data
      })
    },
    getFriends() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.pageInfo.pageindex + 1
      apiGetShareRecords({
        shareid: this.info.shareId,
        pindex: nextPage
      })
        .then(res => {
          const d = this.$toLowerKey(res, true)
          let r = (d.return_data || []).map(item => {
            return {
              assistornickname: item.assistornickname || '未知',
              headpath: item.customer?.headpath || `${this.PACKAGE_STATIC_URL}share-activity/default-avatar.png`
            }
          })

          this.friendList = [...this.friendList, ...r]
          this.totalCount = d.return_count || 0
          r.length > 0 && (this.pageInfo.pageindex = nextPage)
          this.finished = this.friendList.length >= this.totalCount
          this.busy = false
        })
        .catch(() => {
          this.busy = false
        })
    },
    resetData() {
      this.friendList = []
      this.pageInfo.pageindex = 0
      this.finished = false
      this.busy = false
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: page-share-activity;
.#{$prefix} {
  min-height: 100vh;
  .bg {
    position: absolute;
    width: 100%;
    top: 0;
  }
  .main {
    position: relative;
  }
  .content {
    position: relative;
    // padding-top: 830rpx;
  }
  .placeholder {
    position: relative;
    height: 830rpx;
  }
  .footer-gap {
    width: 100%;
    height: 135rpx;
  }
  .share-btn {
    position: fixed;
    right: 30rpx;
    left: 30rpx;
    bottom: 30rpx;
    z-index: 30;
    height: 80rpx;
    background-color: transparent;
    .img {
      width: 100%;
      height: 100%;
    }
  }
}
.button-action {
  transform: scale(0.98) !important;
}
</style>
