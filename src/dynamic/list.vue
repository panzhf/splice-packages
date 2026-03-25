<template>
  <view class="page-activity-list flex flex-column">
    <v-tabs
      v-model="active"
      :tabs="tablist"
      color="#000"
      active-color="#000"
      line-color="#ffa200"
      line-height="6rpx"
      padding-item="10rpx 40rpx"
      line-scale="0.3"
      height="76rpx"
      style="width: 500rpx; display: block"
      fixed
      field="name"
      @change="handleChangeTab"
    />
    <!-- <text class="iconfont icon-menu"></text> -->
    <view class="activity-show-menu" @tap="handleShowMenu(true)">
      <view class="model" />
      <view class="box">
        <text class="iconfont icon-menu" />
      </view>
    </view>
    <view class="flex-1">
      <!-- 每个列表的内容 -->
      <template v-if="pageList && pageList.length > 0">
        <view v-for="(page, index) in pageList" :key="index">
          <view class="activity-list-item">
            <!-- 点击跳转到详情页面 -->
            <view @click="handlegoActivityDetail(page.id, index, 0)">
              <view class="activity-item-header">
                <image class="activity-item-userImg" :src="page.tenantinfo.wx_logo" alt />
                <view>
                  <view class="activity-user-name">
                    <view class="title">{{ page.tenantinfo.companyname }}</view>
                    <span v-if="page.istop" class="icon iconfont icon-placement base-txt" />
                  </view>
                  <view class="activity-user-update">{{ page.createdtime }}</view>
                </view>
              </view>
              <view class="activity-content-text">{{ page.catalogname }}</view>
              <!-- <view v-if="{{page.summary && page.summary.length > 0}}" class="activity-content-message">{{page.summary}}</view> -->
              <view v-if="page.summary && page.summary.length > 0" class="activity-content-message">
                <rich-text :nodes="page.summary" />
              </view>
              <view class="activity-content-info">
                <image mode="widthFix" class="activity-content-cover" :src="page.postpicture" />
                <view class="activity-content-title" />
                <view class="content ut-s2">{{ page.title }}</view>
              </view>
            </view>
            <view class="activity-thumbs-up">
              <join-activity
                :is-show-thumup.sync="isShowThumup"
                :infos="page"
                :authorizedrequest.sync="authorizedrequest"
                @setShareArticleInfo="handleSetShareArticleInfo"
                @praiseSuccess="handlePraiseSuccess"
              />
              <!-- <van-thumbs-up width="36" height="36" ></van-thumbs-up> -->
            </view>
            <view v-if="page.reviewlist.length > 0" class="activity-user-comment">
              <view class="activity-comment-info">
                <span class="activity-comment-username">{{ page.reviewlist[0]['nickname'] }}：</span>
                <span class="beta">{{ page.reviewlist[0]['body'] }}</span>
              </view>
              <view class="activity-comment-count" @click="handlegoActivityDetail(page.id, index, 1)">
                查看{{ page.totalreviews }}条评论
              </view>
            </view>
            <view class="activity-comment-add">
              <view v-if="authorizedrequest" class="activity-comment-host">
                <!-- <open-data type="userAvatarUrl"></open-data> -->
                <image class="head-Img" :src="HeadPath" alt="" />
              </view>
              <view v-else class="activity-comment-host">
                <image class="image" :src="headpath" />
              </view>
              <view class="activity-comment-text split-line" @tap="handlecomme(page)">我也说说</view>
              <auth-button />
            </view>
          </view>
          <view v-if="pageList.length > 1" class="activity-list-line" />
        </view>
        <load-more :is-loadend.sync="isLoadend" :is-loading.sync="isLoading" />
      </template>

      <NoneData
        v-else-if="pageList && pageList.length == 0 && totalcount == 0"
        :icon="notArticleIcon"
        icon-style="width: 306rpx;height:286rpx"
        msg="动态内容小编正在努力筹备中"
        msg-style="font-size: 26rpx"
      />
    </view>

    <!-- 所有栏目 -->
    <view v-if="isShowMenu" class="activity-menu-list">
      <view class="activity-menu-header">
        <view>栏目分类</view>
        <view @tap="hideMenu">
          <span class="iconfont iconfont icon-close" />
        </view>
      </view>
      <view class="activity-menu-content">
        <view v-for="(item, index) in tablist" :key="index" class="activity-menu-item" @tap="handleSeleteTab(index)">
          <view :class="['activity-menu-title', active == index ? 'activity-menu-active' : '']">{{ item.name }}</view>
        </view>
      </view>
    </view>

    <md-copyright />
    <!-- 底部导航 -->
    <tab-bar type-data="1" />
    <!-- <canvas id="myQrcode" canvas-id="myQrcode" class="share-canvas" catchtouchmove="true" /> -->
    <!-- 点击弹起评论 -->
    <v-comment ref="handlecomment" />
    <share-friend
      ref="shareFriend"
      :product.sync="product"
      :share-info.sync="shareInfo"
      @getShareData="handleopenShare"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCatlogList, apiBlogList, apiBlogShare } from '../api/dynamic.js'
import dayjs from 'dayjs'
import VTabs from '../components/v-tabs'
import vComment from './components/v-comment'
import JoinActivity from './components/join-activity'
import userAuthHub from '@/utils/user-auth-hub'
import ShareFriend from './components/share-friend'
import LoadMore from './components/load-more'
import TabBar from '@/components/tab-bar/index.vue'
import NoneData from 'packages/components/none-data/index.vue'
import { staticURL } from '@/config'
import { mapState } from 'vuex'
export default {
  components: {
    VTabs,
    vComment,
    JoinActivity,
    ShareFriend,
    LoadMore,
    TabBar,
    NoneData
  },
  data() {
    return {
      headpath: staticURL(true) + 'default-headpath.png',
      shareImg: staticURL(true) + 'dynamic-share.png',
      isReflesh: false,
      isShowThumup: false, //是否开启点赞
      isLoadend: false,
      isLoading: false,
      isHaveUserInfo: false,
      pageindex: 0,
      pagesize: 5,
      publishedTimeEnd: null,
      newInfoTimeEnd: null,
      active: 0,
      columnId: -1,
      current: 0,
      isShowMenu: false,
      shareArticleId: null,
      shareArticleTitle: null,
      notArticleIcon: staticURL(true) + 'no-article.gif',
      authorizedrequest: true,
      product: {},
      shareInfo: {
        shareText: '分享好友', // 分享组件文案
        showPoster: true, // 海报显示
        showFriend: true // 分享好友显示
      },
      pageList: null,
      totalcount: null,
      tablist: []
    }
  },
  computed: {
    ...mapState(['HeadPath'])
  },
  onLoad() {
    uni.hideHomeButton()
    this.handleFindTabList()
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.handleInitData()
    this.handleFindTabList()
  },
  // 上拉刷新
  onReachBottom() {
    if (!this.isLoadend) {
      this.handlefindArticleLIst(this.tabId)
    }
  },
  // 转发好友
  onShareAppMessage(res) {
    if (res.from === 'button') {
      return {
        title: this.shareArticleTitle,
        path: '/packages/src/dynamic/activity?source=2&id=' + this.shareArticleId,
        imageUrl: this.shareImg
      }
    } else {
      return {
        title: '品牌动态',
        path: '/packages/src/dynamic/list',
        imageUrl: this.shareImg
      }
    }
  },
  methods: {
    handleChangeTab(index) {
      this.handleInitData()
      this.active = index
      this.current = index
      const tabId = this.tablist[index].id
      this.publishedTimeEnd = this.newInfoTimeEnd
      this.tabId = tabId
      this.handlefindArticleLIst(tabId)
    },
    /** 查找分类 */
    async handleFindTabList() {
      let res = await apiCatlogList({
        pagesize: 100,
        pageindex: 1
      })

      if (this.$ck(res, true)) {
        if (res.return_data.results) {
          this.tablist = res.return_data.results
          let time = dayjs(res.return_data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
          this.publishedTimeEnd = time
          this.newInfoTimeEnd = time
          let i = this.tablist[this.active].id
          this.handlefindArticleLIst(i)
          uni.stopPullDownRefresh()
        }
      }
      this.tabs = res.return_data.results || []
    },
    handleSeleteTab(index) {
      this.handleInitData()
      this.active = index
      this.current = index
      this.isShowMenu = false
      this.handlefindArticleLIst(this.tablist[index].id)
    },

    handleInitData() {
      this.totalcount = null
      this.pageList = []
      this.pageindex = 0
      this.isLoading = false
      this.isLoadend = false
    },
    handleShowMenu() {
      this.isShowMenu = true
    },
    hideMenu() {
      this.isShowMenu = false
    },
    // 查询某一类文章列表
    handlefindArticleLIst(id) {
      this.isLoading = true
      let i = this.pageindex + 1
      this.$loading.show()
      let endTime = i > 1 ? this.publishedTimeEnd : this.newInfoTimeEnd
      apiBlogList({
        pagesize: this.pagesize,
        pageindex: i,
        catagoryid: id,
        publishedTimeEnd: endTime
      }).then(res => {
        this.isLoading = false
        this.$loading.hide()
        // this.authorizedrequest = res.authorizedrequest
        if (this.$ck(res, true)) {
          this.pageindex = i
          this.isLoadend = i * this.pagesize > res.return_data.totalcount
          let list = res.return_data.results || []
          for (let i = 0; i < list.length; i++) {
            list[i]['summary'] = list[i]['summary'].replace(/[\r\n]/g, '<br>')
            // 新增一个字段，记录是否刚点赞成功了
            list[i].praisedSuccess = false
          }
          this.pageList = this.pageList && this.pageList.length > 0 ? this.pageList.concat(list) : list
          this.totalcount = res.return_data.totalcount
        }
      })
    },
    // 点击跳去评论
    handlecomme(e) {
      // e.id ,e.title
      this.$refs.handlecomment.handleShowComment(e.id, e.title)
    },

    // 跳转去详情
    async handlegoActivityDetail(id, index, type) {
      let that = this
      // 文章id  文章在列表中的索引   1（查看文章评论） 0(普通浏览)
      let params = await new Promise((resolve, reject) => {
        userAuthHub.subscribe(resolve)
        uni.navigateTo({
          // url: `./activity.vue?id=${id}&type=${type}`
          url: `./activity?id=${id}&type=${type}`
        })
      })
      // 从文章详情页面点赞成功，返回到动态列表页面，更新列表页面的文章数据
      if (params.pageInfo && params.pageInfo.praisedSuccess) {
        params.pageInfo.tenantinfo = that.pageList[index].tenantinfo
        that.pageList[index] = params.pageInfo
        that.$set(that, 'pageList', that.pageList)
        that.$forceUpdate()
      }
    },
    // 获取生成海报的信息
    findPosterInfo() {
      return new Promise(resolve => {
        this.$loading.show()
        apiBlogShare({ id: this.shareArticleId }).then(res => {
          this.$loading.hide()
          if (this.$ck(res)) {
            let info = res.return_data
            info['shareTime'] = dayjs(res.return_data['timestamp'] * 1000).format('YYYY-MM-DD HH:mm')
            // 将海报配置告知父组件
            if (info['qrcodeurl'] && info['postpicture']) {
              resolve(info)
            } else {
              this.$msg('海报信息获取异常')
            }
          }
        })
      })
    },
    // 点击分享
    handleopenShare() {
      this.findPosterInfo().then(res => {
        this.product = res
        setTimeout(() => {
          this.$refs.shareFriend.setShareInfo()
        }, 300)
      })
    },

    // 点击分享按钮
    handleSetShareArticleInfo(id, title) {
      this.shareArticleId = id
      this.shareArticleTitle = title
      this.$refs.shareFriend.showShare()
    },

    handlePraiseSuccess(timestamp) {
      let time = dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
      this.newInfoTimeEnd = time
    }
  }
}
</script>
<style lang="scss" scoped>
.page-activity-list {
  min-height: 100vh;
  background: #fff;
}
.activity-menu-list {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 40rpx 0 30rpx;
  background: #fff;
  color: #222222;
  font-size: 32rpx;
  z-index: 9999;
  overflow: auto;
  .activity-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx 40rpx 30rpx;
    .icon-close {
      font-size: 20rpx;
      padding: 20rpx;
    }
  }
  .activity-menu-content {
    display: flex;
    flex-wrap: wrap;
    padding: 0 30rpx 40rpx;
  }
  .activity-menu-item {
    width: 25%;
    margin-bottom: 20rpx;
  }
  .activity-menu-title {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 157rpx;
    height: 70rpx;
    color: #000000;
    font-size: 28rpx;
    background: rgba(255, 255, 255, 1);
    border: 1px solid rgba(221, 221, 221, 1);
    border-radius: 35px;
  }
  .activity-menu-active {
    color: #ffa200;
    border: 1px solid #ffa200;
  }
}
.activity-show-menu {
  z-index: 9990 !important;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  .box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 36px;
    margin-top: 1px;
    background: #fff;
  }
  .model {
    width: 47rpx;
    height: 42rpx;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 1) 100%);
  }
}

.activity-thumbs-up {
  // display: flex;
  width: 100%;
}
.activity-nav .van-tabs--line .van-tabs__wrap {
  padding-right: 40px;
}
.activity-nav .van-hairline--top-bottom::after {
  border-top: none;
}

.icon {
  padding-right: 14rpx;
}
.activity-list-item {
  padding: 40rpx 31rpx 38rpx;
  background-color: #fff;
}
.activity-list-line {
  height: 20rpx;
  background: rgba(246, 246, 246, 1);
}
.activity-item-header {
  display: flex;
}
.activity-item-userImg {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #f6f6f6;
}
.activity-user-name {
  display: flex;
  align-items: center;
  margin-bottom: 4rpx;
  .title {
    font-size: 32rpx;
    color: #000;
    font-weight: bold;
    margin-right: 10rpx;
  }
  .icon {
    color: #ffa200;
    font-size: 26rpx;
  }
}
.activity-user-update {
  color: #aaaaaa;
  font-size: 24rpx;
}
.activity-content-text {
  font-size: 26rpx;
  // font-family: PingFang-SC-Medium;
  // font-weight: 500;
  color: rgba(170, 170, 170, 1);
  padding: 29rpx 0 27rpx;
}
.activity-content-message {
  font-size: 34rpx;
  // font-family: PingFang-SC-Medium;
  // font-weight: 500;
  color: rgba(0, 0, 0, 1);
  line-height: 42rpx;
  margin: 0 0 30rpx;
}
.activity-content-info {
  position: relative;
  .content {
    position: absolute;
    left: 20rpx;
    bottom: 21rpx;
    font-size: 38rpx;
    word-wrap: break-word;
    width: calc(100% - 40rpx);
    // font-family: PingFang-SC-Medium;
    font-weight: 500;
    color: rgba(255, 255, 255, 1);
    line-height: 120%;
    z-index: 2;
  }
}
.activity-content-title {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 0;
  width: 100%;
  height: 124rpx;
  background: linear-gradient(0deg, rgba(3, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
  opacity: 0.6;
  z-index: 1;
}
.activity-content-cover {
  width: 100%;
  vertical-align: top;
}

.activity-user-comment {
  background: rgba(246, 246, 246, 1);
  padding: 32rpx;
  margin-bottom: 30rpx;
}
.activity-comment-info {
  // display: flex;
  font-size: 26rpx;
  font-family: PingFang-SC-Bold;
  color: rgba(1, 1, 1, 1);
  .beta {
    // flex: 1;
    word-wrap: break-wrap;
    word-break: break-all;
  }
}
.activity-comment-username {
  font-weight: bold;
  white-space: nowrap;
}
.activity-comment-count {
  font-size: 26rpx;
  // font-family: PingFang-SC-Medium;
  font-weight: 500;
  color: rgba(62, 148, 221, 1);
  padding: 10rpx 0 0;
}
.activity-comment-add {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 0 20rpx;
  margin-top: 40rpx;
  .head-Img {
    width: 100%;
    height: 100%;
  }
}
.activity-comment-host {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #dddddd;
  .image {
    width: 68rpx;
    height: 68rpx;
  }
}
.activity-comment-text {
  display: flex;
  align-items: center;
  flex: 1;
  height: 68rpx;
  font-size: 26rpx;
  // font-family: PingFang-SC-Medium;
  font-weight: 500;
  color: rgba(170, 170, 170, 1);
  margin-left: 30rpx;
  // border-bottom: 1px solid #dddddd;
}

.comment-page-content .van-field__body--textarea {
  height: 275rpx;
}
.comment-page-content .van-field__input {
  height: 275rpx;
  font-size: 28rpx;
  padding: 0 10px;
}
.comment-page-content .van-cell {
  padding: 30rpx 0;
  border-radius: 5rpx;
  line-height: 40rpx;
}
</style>
