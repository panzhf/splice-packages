<template>
  <view class="article-page">
    <view class="article-body">
      <view class="article-body-title">{{ pageInfo.title }}</view>
      <view class="article-body-category">{{ pageInfo.catalogname }}</view>
      <u-parse class="article-body-text" :html="richText" :tag-style="parseStyle" />
      <join-activity
        :infos.sync="pageInfo"
        :authorizedrequest.sync="authorizedrequest"
        @setShareArticleInfo="handleSetShareArticleInfo"
        @openShare="handleopenShare"
        @updatePraise="handleUpdatePraise"
      />
    </view>
    <view class="article-body-margin" />
    <view class="article-comment safe-area-inset-bottom">
      <view class="article-comment-count">评论{{ totalcount }}条</view>
      <block v-if="totalcount > 0">
        <view v-for="item in reviewlist" :key="item.id" class="article-comment-item">
          <view class="article-comment-alpha">
            <image class="article-comment-photo" :src="item.headpath" />
          </view>
          <view class="article-comment-beta">
            <view class="article-comment-title">{{ item.nickname }}</view>
            <view class="article-comment-time">{{ item.reviewedtime }}</view>
            <view class="article-comment-content">{{ item.body }}</view>
          </view>
        </view>
        <load-more :is-loadend.sync="isLoadend" :is-loading.sync="isLoading" />
      </block>
      <view v-else class="article-no-comment">
        <image class="image" :src="comment" alt />
        <view class="txt">还没有评论？</view>
        <view class="txt">听说评论被精选能脱单~</view>
      </view>
      <md-copyright custom-style="margin-left: -30rpx;margin-right: -30rpx" />
    </view>
    <view class="article-user-comment safe-area-inset-bottom">
      <view v-if="authorizedrequest" class="article-user-img">
        <!-- <open-data type="userAvatarUrl"></open-data> -->
        <image class="image" :src="HeadPath" alt="" />
      </view>
      <view v-else class="article-user-img">
        <image class="image" :src="headpath" />
      </view>
      <view class="article-user-btn" @click="handlecomme(pageInfo)">我也说说</view>
      <auth-button />
    </view>
    <view v-show="tremsShow" class="roundProgress">
      <round-progress ref="handleprogress" @updateTimer="handleupdateTimer" />
    </view>
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
import vComment from './components/v-comment'
import userAuthHub from '@/utils/user-auth-hub'
import JoinActivity from './components/join-activity'
import RoundProgress from './components/round-progress'
import LoadMore from './components/load-more'
import ShareFriend from './components/share-friend'
import dayjs from 'dayjs'
import { apiBlogDetail, apiBlogReviewlist, apiBlogGetreadtime, apiBlogRead, apiBlogShare } from '../api/dynamic.js'
import { staticURL } from '@/config'
import { mapState } from 'vuex'
import { richText2Mixin } from 'packages/mixins/rich-text'
export default {
  components: {
    vComment,
    JoinActivity,
    LoadMore,
    RoundProgress,
    ShareFriend
  },
  mixins: [richText2Mixin],
  data() {
    return {
      comment: staticURL(true) + 'icon-no-comment.png',
      headpath: staticURL(true) + 'default-headpath.png',
      tremsShow: false,
      type: null,
      publishedTimeEnd: '',
      authorizedrequest: true,
      isLoading: false,
      isLoadend: false,
      richText: '',
      pageIndex: 0,
      pageInfo: {},
      shareInfo: {
        shareText: '分享好友', // 分享组件文案
        showPoster: true, // 海报显示
        showFriend: true // 分享好友显示
      },
      product: {},
      totalcount: 0,
      reviewlist: [],
      articleId: ''
    }
  },
  computed: {
    ...mapState(['HeadPath'])
  },
  onLoad(option) {
    if (option['id']) {
      this.articleId = Number(option['id'])
      this.handlefindArticleBody(this.articleId)
    } else if (option.scene) {
      // option.scene: id_source
      var params = decodeURIComponent(option.scene)
      let sceneArr = params.split('_')
      let articleId = Number(sceneArr[0])
      if (params) {
        this.articleId = articleId
        this.handlefindArticleBody(articleId)
      } else if (articleId) {
        this.handlefindArticleBody(articleId)
      }
    }
    if (option['type']) {
      this.type = option['type']
    }
  },
  onReady() {
    if (this.type) {
      setTimeout(() => {
        this.scrollPageComment()
      }, 700)
    }
    this.handlegetReadTime()
  },
  onUnload() {
    let pageInfo = this.pageInfo['id'] ? this.pageInfo : {}
    userAuthHub.notify({ pageInfo: pageInfo })
  },
  // 滚动到底部
  onReachBottom() {
    this.isLoading = true
    this.handlefindUserComment(this.articleId)
  },
  // 转发好友
  onShareAppMessage() {
    let title = this.pageInfo['title'] ? this.pageInfo['title'] : '转发好友'
    return {
      title: title,
      path: '/packages/src/dynamic/activity?source=2&id=' + this.articleId
    }
  },
  methods: {
    // 点击分享按钮
    handleSetShareArticleInfo(id, title) {
      this.shareArticleId = id
      this.shareArticleTitle = title
      this.$refs.shareFriend.showShare()
    },
    // 点击跳去评论
    handlecomme(e) {
      this.$refs.handlecomment.handleShowComment(e.id, e.title)
    },
    // 获取用户所有的精选评论
    handlefindUserComment(id) {
      let i = this.pageIndex + 1
      apiBlogReviewlist({
        pagesize: 10,
        pageindex: i,
        blogid: id,
        isonlyown: false,
        reviewedtimeend: this.publishedTimeEnd
      }).then(res => {
        this.isLoading = false
        if (this.$ck(res)) {
          if (res.return_data && res.return_data.results && res.return_data.results.length > 0) {
            this.pageIndex = i
            this.totalcount = res.return_data.totalcount
            this.reviewlist = this.reviewlist.concat(res.return_data.results)
          }
          if (res.return_data.totalcount > 0 && res.return_data.results.length === 0) {
            this.isLoadend = true
          }
        }
      })
    },
    // 获取阅读倒计时秒数
    handlegetReadTime() {
      apiBlogGetreadtime().then(res => {
        if (this.$ck(res)) {
          let downSeconds = res.return_data.times
          if (res.return_data.times !== 0) this.tremsShow = true
          this.$refs.handleprogress.drowProgress('runCanvas', 60, 60, 100, downSeconds)
        }
      })
    },
    // 获取文章详情
    handlefindArticleBody(id) {
      this.$loading.show()
      apiBlogDetail({
        id
      }).then(res => {
        if (this.$ck(res)) {
          this.$loading.hide()
          if (res.return_data) {
            let info = res.return_data
            // 新增字段记录是否刚点赞成功
            info.praisedSuccess = false
            this.pageInfo = info

            this.richText = res.return_data.body.replace(
              /<img src([^>\s]+)(([^>]+)\s?style="(.*?)"\s?)?\/>/gi,
              '<img src$1 style="max-width:100%;height:auto;vertical-align:middle;" />'
            )
            this.publishedTimeEnd = dayjs(res.return_data['timestamp'] * 1000).format('YYYY-MM-DD HH:mm:ss')
            this.handlefindUserComment(id)
          }
        }
      })
    },
    // 滚动到评论区域
    scrollPageComment() {
      const query = uni.createSelectorQuery()
      query.select('.article-comment').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function (res) {
        uni.pageScrollTo({
          scrollTop: res[0].top,
          duration: 300
        })
      })
    },
    // 新增文章阅读记录
    handleupdateTimer() {
      // this.tremsShow = false
      let blogid = this.articleId
      apiBlogRead({ blogid }).then(res => {
        if (this.$ck(res)) {
          // console.log('时间到')
        }
      })
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
            console.log(info)

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
    handleUpdatePraise(info) {
      this.pageInfo = info
    }
  }
}
</script>
<style lang='scss' scoped>
// @import '../styles/icon.css';
.article-page {
  padding: 0 0 120rpx;
  background: #fff;
  .roundProgress {
    position: fixed;
    top: 50%;
    right: 30px;
    z-index: 3;
  }
  .article-body {
    padding: 23rpx 32rpx 0;
    background: #fff;
    // overflow-x: hidden;
    .article-body-title {
      font-size: 36rpx;
      font-family: PingFang-SC-Bold;
      font-weight: bold;
      color: rgba(0, 0, 0, 1);
      width: 100%;
      word-wrap: break-word;
      padding-bottom: 30rpx;
    }
    .article-body-category {
      font-size: 26rpx;
      font-family: PingFang-SC-Medium;
      font-weight: 500;
      color: rgba(170, 170, 170, 1);
      padding-bottom: 50rpx;
    }
    .article-body-text {
      color: #333333;
      font-size: 30rpx;
      line-height: 170%;
      width: 100%;
      word-wrap: break-word;
    }
  }
  .article-body-margin {
    background: rgba(246, 246, 246, 1);
    height: 20rpx;
  }
  .article-comment {
    padding-top: 30rpx;
    padding-left: 30rpx;
    padding-right: 30rpx;
    background: #fff;
    .article-comment-count {
      padding-bottom: 40rpx;
      font-size: 26rpx;
      font-family: PingFang-SC-Medium;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
    }
    .article-comment-item {
      display: flex;
      padding: 0 0 40rpx;
      .article-comment-alpha {
        width: 80rpx;
        height: 80rpx;
        .article-comment-photo {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          overflow: hidden;
          background: #f5f5f5;
        }
      }
      .article-comment-beta {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 20rpx;
        .article-comment-title {
          font-size: 30rpx;
          font-family: PingFang-SC-Bold;
          font-weight: bold;
          color: rgba(0, 0, 0, 1);
          line-height: 44rpx;
        }
        .article-comment-time {
          font-size: 24rpx;
          font-family: PingFang-SC-Regular;
          font-weight: 400;
          color: rgba(170, 170, 170, 1);
          padding: 6rpx 0 14rpx;
        }
        .article-comment-content {
          font-size: 28rpx;
          font-family: PingFang-SC-Medium;
          font-weight: 500;
          color: rgba(51, 51, 51, 1);
          line-height: 42rpx;
          padding-bottom: 38rpx;
          border-bottom: 1rpx solid #eeeeee;
          word-break: break-all;
        }
      }
    }
    .article-no-comment {
      display: flex;
      flex-direction: column;
      align-items: center;
      .image {
        width: 140rpx;
        height: 140rpx;
        margin-bottom: 29rpx;
      }
      .txt {
        font-size: 26rpx;
        font-family: PingFang-SC-Medium;
        font-weight: 500;
        color: rgba(102, 102, 102, 1);
        line-height: 36rpx;
      }
    }
  }
  .article-user-comment {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    height: 120rpx;
    z-index: 4;
    display: flex;
    align-items: center;
    box-sizing: content-box;
    .article-user-img {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      overflow: hidden;
      margin-left: 30rpx;
      .image {
        width: 80rpx;
        height: 80rpx;
      }
    }
    .article-user-btn {
      flex: 1;
      height: 80rpx;
      background: rgba(246, 246, 246, 1);
      border-radius: 5rpx;
      margin: 0 30rpx;
      font-size: 28rpx;
      font-family: PingFang-SC-Medium;
      font-weight: 500;
      color: rgba(170, 170, 170, 1);
      display: flex;
      align-items: center;
      padding-left: 20rpx;
    }
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
}
</style>

