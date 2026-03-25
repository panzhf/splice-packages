<template>
  <view v-if="iscomment == true" class="activity-menu-comme">
    <view class="activity-menu-header">
      <span class="iconfont icon-close" @tap="iscomment = false"></span>
    </view>
    <form report-submit="true" @submit="handlebindFormSubmit">
      <view class="comment-page-body">
        <view class="comment-page-title">{{ title }}</view>
        <view class="comment-page-textarea">
          <textarea
            v-model="textareaContent"
            maxlength="500"
            :fixed="true"
            style="height: 335rpx; padding: 20rpx"
            placeholder="评论将由品牌筛选后显示，对所有人可见"
          />
        </view>

        <button form-type="submit" class="comment-page-shadow">评论</button>
      </view>
    </form>
    <!-- 如果有评论就显示 -->
    <view v-for="(item, index) in commentList" :key="index" class="comment-page-message">
      <view class="comment-page-phonto">
        <image class="comment-page-img" :src="item.headpath" />
      </view>
      <view class="beta">
        <view class="comment-page-username">
          <view class="title">{{ item.nickname }}</view>
          <view v-if="item.isrecommended" class="selected">精选</view>
        </view>
        <view class="comment-page-text">{{ item.body }}</view>
        <view v-if="!item.isrecommended" class="comment-page-remove" @click="handleremoveComment(item.id)">删除</view>
      </view>
    </view>
    <view v-if="commentList.length" class="comment-more" @click="handlefindMoreUserComment">查看全部</view>
  </view>
</template>

<script>
import { apiBlogReviewed, apiBlogReviewlist } from '../../api/dynamic.js'
import dayjs from 'dayjs'
export default {
  props: {},
  data() {
    return {
      textareaContent: '',
      iosBug: false,
      pageIndex: 0,
      commentList: [],
      commentEndTime: null,
      iscomment: false,
      title: '',
      blogid: ''
    }
  },
  onload() {},
  methods: {
    // 删除评论
    handleremoveComment(id) {
      // OperType （1=发表评论，2=删除评论）
      this.$loading.show()
      apiBlogReviewed({
        blogid: this.blogid,
        reviewid: id,
        opertype: 2
      }).then(res => {
        this.$loading.hide()
        if (this.$ck(res)) {
          this.iscomment = false
          this.textareaContent = ''
          this.pageIndex = 0
          this.commentList = []
          this.$msg('评论删除成功')
        }
      })
    },

    // 查看全部
    handlefindMoreUserComment() {
      this.findMYComment(this.blogid)
    },

    // 点击评论
    handlebindFormSubmit(e) {
      // OperType （1=发表评论，2=删除评论）
      let wxformid = e.detail.formId
      let content = this.textareaContent
      if (content.replace(/[ ]/g, '').length === 0) {
        this.$msg('评论不能为空')
        return
      }
      if (content && content.length > 0) {
        this.$loading.show()
        apiBlogReviewed({
          blogid: this.blogid,
          opertype: 1,
          review: content,
          wxformid
        }).then(res => {
          this.$loading.hide()
          if (this.$ck(res)) {
            this.$msg('评论成功')
            this.iscomment = false
            this.textareaContent = ''
            this.commentList = []
            this.pageIndex = 0
          }
        })
      } else {
        this.$msg('评论不能为空')
      }
    },

    // 调起评论
    handleShowComment(id, title) {
      this.commentList = []
      this.pageIndex = 0
      this.textareaContent = ''
      this.blogid = id
      this.title = title
      this.iscomment = true
      this.findMYComment(id)
    },

    // 获取自己的所有评论
    async findMYComment(id) {
      var index = this.pageIndex + 1
      var param = {
        pagesize: 10,
        pageindex: index,
        blogid: this.blogid,
        isonlyown: true
      }
      if (index > 1) {
        param['reviewedtimeend'] = this.commentEndTime
      }

      let res = await apiBlogReviewlist(param)
      if (this.$ck(res)) {
        if (res.return_data.results) {
          if (index === 1) {
            this.commentEndTime = dayjs(res.return_data.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
          }
          if (this.commentList.length > 0 && res.return_data.totalcount === this.commentList.length) {
            this.$msg('无更多评论')
          } else {
            this.pageIndex = index
            this.commentList = this.commentList.concat(res.return_data.results)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '../../styles/icon.css';
.activity-menu-comme {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;

  overflow: auto;

  width: 100%;
  height: 100%;
  padding: 30rpx 0;

  color: #222222;
  background: #f5f5f5;

  font-size: 32rpx;
  .activity-menu-header {
    text-align: right;
    .icon-close {
      font-size: 24rpx;
      padding: 20rpx 30rpx;
    }
  }
  .comment-page-body {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    margin-bottom: 82rpx;
    padding: 23rpx 32rpx 0;
    .comment-page-title {
      width: 100%;
      margin: 0 0 32rpx;

      word-wrap: break-word;

      color: #000000;

      font-family: PingFang-SC-Bold;
      font-size: 32rpx;
      font-weight: bold;
    }
    .comment-page-textarea {
      width: 100%;

      background-color: #fff;
      textarea {
        box-sizing: border-box;
        width: 100%;
        height: 336rpx;
        padding: 20px;
      }
    }
    .comment-page-shadow {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 400rpx;
      height: 80rpx;
      margin: 50rpx auto 0;

      color: #ffffff;
      border-radius: 40rpx;
      background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
      box-shadow: 0px 0px 8rpx #ffa200;

      font-size: 32rpx;
      font-weight: 500;
    }
  }
  .comment-page-message {
    display: flex;

    padding: 0 30rpx 40rpx;
    .comment-page-phonto {
      overflow: hidden;

      width: 80rpx;
      height: 80rpx;
      margin-right: 20rpx;

      border-radius: 50%;
      .comment-page-img {
        width: 80rpx;
        height: 80rpx;
      }
    }
    .beta {
      width: calc(100% - 130rpx);
      .comment-page-username {
        display: flex;
        .title {
          color: #000000;

          font-family: PingFang-SC-Bold;
          font-size: 30rpx;
          font-weight: bold;
        }
        .selected {
          padding: 7rpx 8rpx;

          transform: translateX(10rpx);

          color: #fff;
          border: 1rpx solid #ecb872;
          border-radius: 3rpx;
          background: #ecb872;

          font-size: 22rpx;
          font-weight: normal;
          line-height: 22rpx;
        }
      }
      .comment-page-text {
        padding: 10rpx 0 12rpx;

        word-break: break-all;

        color: #333333;

        font-family: PingFang-SC-Medium;
        font-size: 28rpx;
        font-weight: 500;
      }
      .comment-page-remove {
        color: #3e94dd;

        font-family: PingFang-SC-Medium;
        font-size: 26rpx;
        font-weight: 500;
      }
    }
  }
  .comment-more {
    padding: 0 0 30rpx;

    text-align: center;

    color: #999;

    font-size: 26rpx;
  }
}
</style>
