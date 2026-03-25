<template>
  <view class="activity-user-join">
    <view class="activity-user-alpha">
      <view v-if="info.totalpraises > 0" class="activity-user-box">
        <!-- 刚点赞成功 插入微信头像 -->
        <view v-if="info.praisedSuccess" class="activity-user-img">
          <!-- <open-data type="userAvatarUrl"></open-data> -->
          <image class="image" :src="HeadPath" alt="" />
        </view>
        <view class="activity-user-imgList" :style="{ transform: `translateX(-${info.praisedSuccess ? 10 : 0}rpx)` }">
          <block v-for="(praise, index) in info.praiselist" :key="index">
            <image
              v-if="info.praisedSuccess ? index < 5 : index < 6"
              :style="{ transform: `translateX(-${index * 10}rpx)` }"
              class="activity-user-img"
              :src="praise.headpath"
            />
          </block>
        </view>
        <view
          class="activity-user-count"
          :style="{ transform: `translateX(-${info.praiselist.length} * 10 + 20 + rpx)` }"
        >
          {{ info.totalpraises }}人点赞
        </view>
      </view>
    </view>
    <view class="activity-user-beta">
      <view class="activity-user-btn" @click="showShre(info)">
        <span class="icon iconfont icon-share" />
        分享
      </view>
      <view
        v-if="isShowThumup"
        :class="['activity-user-btn', info.ispraised ? 'base-txt' : 'base-start']"
        @click="thumbsUp(info.id)"
      >
        <span class="icon iconfont icon-thumbs-up" />
        {{ info.totalpraises || 0 }}
      </view>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import { apiBlogShare, apiBlogPraiselist, apiBlogPraised } from '../../api/dynamic.js'
import { mapState } from 'vuex'
export default {
  props: {
    isShowThumup: {
      type: Boolean,
      default: true
    },
    infos: {
      type: Object,
      default() {
        return {
          praiselist: [],
          totalpraises: 0,
          ispraised: false
        }
      }
      // twoWay: true
    },
    authorizedrequest: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      info: {}
    }
  },
  computed: {
    ...mapState(['HeadPath'])
  },
  watch: {
    infos: {
      handler(v) {
        this.info = v
      },
      immediate: true,
      deep: true
    }
  },
  onload() {},
  methods: {
    // arr.slice(0,5)最多展示6个用户头像
    async thumbsUp(id) {
      if (this.authorizedrequest) {
        if (this.info && !this.info.ispraised) {
          this.thumbsUpArticle(id)
        }
      }
    },

    async showShre(info) {
      // 实际调用接口
      this.$emit('setShareArticleInfo', info['id'], info['title'])
      // this.findPosterInfo(this.info['id'])
    },
    //  点赞
    thumbsUpArticle(id) {
      apiBlogPraised({ opertype: 1, blogid: id }).then(res => {
        if (this.$ck(res)) {
          this.$msg('点赞成功')
          if (this.info) {
            this.info.ispraised = true
            this.info['totalpraises'] = this.info['totalpraises'] + 1
            this.info.praisedSuccess = true
            this.$emit('updatePraise', this.info)
          }
        }
      })
    },
    // 查询点赞列表接口
    findPraiseList(blogid) {
      apiBlogPraiselist({ pageindex: 1, pagesize: 10, blogid: blogid }).then(res => {
        if (this.$ck(res)) {
          this.info['praiselist'] = res.return_data['list']
          this.info['totalpraises'] = res.return_data['totalcount']
          this.$emit('praiseSuccess', res.return_data['timestamp'])
        } else {
          this.$msg(res.return_cmsg)
        }
      })
    },
    // 获取生成海报的信息
    findPosterInfo(id) {
      this.$loading.show()
      apiBlogShare({ id }).then(res => {
        this.$loading.hide()
        if (this.$ck(res)) {
          let info = res.return_data
          info['shareTime'] = dayjs(res.return_data['timestamp'] * 1000).format('YYYY-MM-DD HH:mm')
          // 将海报配置告知父组件
          if (info['qrcodeurl'] && info['postpicture']) {
            this.$emit('openShare', info)
          } else {
            this.$msg('海报信息获取异常')
          }
        }
      })

      this.$emit('openShare', {})
    }
  }
}
</script>

<style lang="scss" scoped>
// @import '../../styles/icon.css';
.activity-user-join {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  flex: 1;
  position: relative;
  min-height: 70rpx;
  width: 100%;
  .activity-user-box {
    display: flex;
    align-items: center;
    .activity-user-imgList {
      display: flex;
    }
    .activity-user-img {
      width: 42rpx;
      height: 42rpx;
      border-radius: 50%;
      border: 1px solid #fff;
      background: #f5f5f5;
      overflow: hidden;
      .image {
        width: 100%;
        height: 100%;
      }
    }
    .activity-user-count {
      font-size: 24rpx;
      font-family: PingFang-SC-Medium;
      font-weight: 500;
      color: rgba(170, 170, 170, 1);
      line-height: 44rpx; // padding-left:  20rpx;
      white-space: nowrap;
    }
  }
  .activity-user-beta {
    display: flex;
    position: absolute;
    top: 30rpx;
    right: 0;
    z-index: 101;
    .activity-user-btn {
      display: flex;
      align-items: center;
      // padding-right: 30rpx;
      font-size: 26rpx;
      font-family: PingFang-SC-Medium;
      font-weight: 500;
      // color: rgba(51, 51, 51, 1);
      line-height: 44rpx;
      & + .activity-user-btn {
        margin-left: 30rpx;
      }
      .icon {
        padding-right: 14rpx;
        font-size: 36rpx;
      }
    }
  }
}
</style>
