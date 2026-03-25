<template>
  <view class="page-video" :class="noData ? 'flex flex-middle flex-center' : ''">
    <TitleBar title="看视频" textcolor="#fff" type="detail" show-nav-title is-transparent icon-mode="1" />
    <view v-show="showTimeCount" class="progress" :style="topStyle">
      <u-circle-progress
        inactive-color="#666"
        bg-color="#000"
        active-color="#fff"
        :percent="percent"
        border-width="6"
        :width="60"
        :duration="0"
        style="position: relative"
      >
        <view class="fs-26">
          {{ timeCount }}
        </view>
      </u-circle-progress>
    </view>
    <template v-if="videoList.length !== 0">
      <swiper
        :vertical="true"
        :direction="'vertical'"
        :interval="3000"
        :current="currentIndex"
        class="swiper-height"
        @change="showNextVideo"
      >
        <swiper-item v-for="(item, index) in videoList" :key="item.contentId" class="swiper-height">
          <view class="flex flex-column flex-between swiper-height">
            <view class="video-prize flex" :style="prizeStyle">
              <block v-if="item.activityInfo">
                <view class="video-circle">
                  <view
                    class="circle flex flex-middle flex-center"
                    :class="item.taskCompleteType === 0 || (prizeBusy && item.taskCompleteType === 1) ? 'hidden' : ''"
                  >
                    <view
                      class="ok mdfont"
                      :class="
                        item.taskCompleteType === 2 ? 'icon-gou' : item.taskCompleteType === 3 ? 'icon-tanhao' : ''
                      "
                    />
                  </view>
                  <u-loading
                    v-if="prizeBusy && item.taskCompleteType === 1"
                    size="20"
                    mode="circle"
                    class="load"
                    color="#000"
                  />
                </view>
                <view class="flex-1 fs-28 video-task">
                  <view v-if="item.taskCompleteType === 2">
                    任务完成，已获得
                    <text class="num-text">{{ item.activityInfo.point }}</text>
                    积分
                  </view>
                  <view v-else-if="item.taskCompleteType === 3" class="flex flex-middle">
                    领奖失败
                    <view class="receive-btn" @tap="receivePrize(item.contentId, item.activityInfo.actid)">
                      重新领取
                    </view>
                  </view>
                  <view v-else>
                    看
                    <text class="num-text">{{ item.activityInfo.watchtime }}</text>
                    秒视频，可获得
                    <text class="num-text">{{ item.activityInfo.point }}</text>
                    积分
                  </view>
                </view>
              </block>
            </view>
            <view class="video-item">
              <channel-video
                v-if="currentIndex === index"
                :finder-user-name="item.finderUserName"
                :feed-id="item.feedId"
                :object-fit="contain"
                :autoplay="true"
                :loop="true"
                :muted="true"
                @error="onError"
              />
            </view>
            <view class="video-name flex flex-middle">{{ item.name }}</view>
          </view>
        </swiper-item>
      </swiper>
      <view class="next-btn iphoneX" @tap="handleNext">
        {{ btnText[btnType] || '' }}
        <text v-if="btnType !== 1" class="iconfont iconjiantou1" />
      </view>
    </template>
    <view v-if="noData" class="none-box">
      <view class="icon mdfont icon-shipinqueshengicon" />
      <view class="fs-28 c-4 text">{{ noData ? '品牌商未发布视频呢' : '正在加载视频...' }}</view>
    </view>
  </view>
</template>

<script>
import { apiGetNextContent, apiGetPrize } from 'packages/api/video'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { setTitleColorMixin } from 'packages/mixins/navigation'
import log from 'packages/utils/wx-log'
export default {
  name: 'ChannelVideo',
  components: { TitleBar },
  mixins: [setTitleColorMixin],
  data() {
    return {
      isIPhoneX: false,
      noData: false,
      showTimeCount: false,
      timeCount: 0, // 倒数秒数
      timer: null, // 定时器
      prizeBusy: false, // 请求奖项
      busy: false, // 加载视频内容
      currentIndex: 0, // 当前视频
      maxId: 0, //加载下一条要传
      hasMore: true, // 能加载一条
      videoList: [], // 视频列表
      btnText: {
        // 按钮文案
        0: '看下一个视频',
        1: '真厉害，视频都看完了',
        2: '看下一个视频'
      }
    }
  },
  computed: {
    topStyle() {
      const s = []
      s.push(`top: ${this.isIPhoneX ? 44 + 100 : 100}px`)
      return s.join(';')
    },
    prizeStyle() {
      const s = []
      s.push(`margin-top:${this.isIPhoneX ? 44 + 100 : 100}px`)
      return s.join(';')
    },
    btnType() {
      let type = 0
      if (this.videoList.length - 1 === this.currentIndex && !this.hasMore) {
        // 最后一个视频，并且没有更多了
        type = 1
      } else if (this.videoList.length - 1 === this.currentIndex && this.hasMore) {
        // 没有顺利加载下一个视频的特殊情况（最后一个视频，但是有更多）
        type = 2
      }
      return type
    },
    percent() {
      if (!this.videoList.length) return 0
      let p = 0
      const { activityInfo } = this.videoList[this.currentIndex]
      if (activityInfo) {
        p = (activityInfo.watchtime - this.timeCount) / activityInfo.watchtime
        p = p < 0 ? 0 : p
      }
      return p * 100
    }
  },
  watch: {
    currentIndex(v) {
      if (v === this.videoList.length - 1) {
        this.getNextVideo()
      }
    }
  },
  mounted() {
    this.setTitleColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff'
    })
    const sys = uni.getSystemInfoSync()
    const ios = !!(sys.system.toLowerCase().search('ios') + 1)
    this.isIPhoneX = ios && sys.screenHeight >= 812
  },
  onShow() {
    if (!this.videoList.length) {
      this.getData(1)
    } else {
      this.showNextVideo()
    }
  },
  onUnload() {
    this.clearCountDown()
  },
  onHide() {
    this.clearCountDown()
  },
  methods: {
    getNextVideo() {
      if (this.hasMore) {
        this.getData()
      }
    },
    async getData(type = 0) {
      // return_data会出现null
      if (this.busy) return
      this.busy = true
      type && this.$loading.show()

      try {
        const res = await apiGetNextContent({ maxid: this.maxid, contenttype: 11 })
        const d = this.$toLowerKey(res, true)
        this.busy = false
        uni.hideLoading()
        if (this.$ck(d)) {
          if (!res.return_data) {
            this.hasMore = false
            type === 1 && (this.noData = true)
            return
          }
          const {
            contentid,
            name,
            msg: feedId,
            relationusername: finderUserName,
            isexistsnext,
            activityinfo
          } = d.return_data

          let video = {
            feedId,
            finderUserName,
            name,
            contentId: contentid,
            taskCompleteType: 0, // 0未看视频  1已完成看视频  2已成功领奖 3发放失败
            isExistsNext: isexistsnext,
            activityInfo: null
          }
          this.hasMore = isexistsnext
          this.maxid = contentid
          if (activityinfo) {
            video.activityInfo = activityinfo
          }
          this.videoList.push(video)
          if (type === 1) {
            this.getNextVideo()
            video.activityInfo && this.startCountdown(video.activityInfo.watchtime)
          }
        }
      } finally {
        this.busy = false
      }
    },
    async receivePrize(contentid, actid) {
      if (!contentid || !actid) return
      if (this.prizeBusy) return
      this.prizeBusy = true
      const foundItem = this.videoList.find(item => item.contentId === contentid)
      apiGetPrize({ contentid, actid })
        .then(res => {
          foundItem.taskCompleteType = 2
          this.prizeBusy = false
        })
        .catch(err => {
          uni.showToast({
            title: err.return_msg || '网络开小差了',
            icon: 'none',
            duration: 2000
          })
          foundItem.taskCompleteType = 3
          this.prizeBusy = false
          this.uploadLog(err || { err: '网络开小差了' })
        })
    },
    uploadLog(data) {
      log.info({
        type: 'content-marketing',
        desc: 'video',
        data: JSON.stringify(data || {})
      })
    },
    startCountdown(seconds) {
      if (this.timer) return
      let item = this.videoList[this.currentIndex]
      this.timeCount = seconds + 1
      this.timer = setInterval(() => {
        if (this.timeCount > 0) {
          this.timeCount--
          if (this.timeCount === seconds) this.showTimeCount = true
        } else {
          this.clearCountDown()
          const { activityInfo, contentId } = item
          item.taskCompleteType = 1
          // 请求获奖接口
          this.receivePrize(contentId, activityInfo.actid)
        }
      }, 1000)
    },
    clearCountDown() {
      clearInterval(this.timer)
      this.timer = null
      this.timeCount = 0
      this.showTimeCount = false
    },
    handleNext() {
      if (this.btnType === 1) return
      if (this.btnType === 2) return this.getData(2)
      this.currentIndex++
    },
    showNextVideo(e) {
      e && (this.currentIndex = e.detail.current)
      this.clearCountDown()
      let { activityInfo, taskCompleteType } = this.videoList[this.currentIndex]
      if (activityInfo && activityInfo.watchtime && taskCompleteType === 0) {
        this.startCountdown(activityInfo.watchtime)
      }
    },
    onError() {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-video {
  color: #fff;
  background-color: #000;
  height: 100vh;
}
.swiper-height {
  height: calc(100vh - 120rpx);
}
.video-item {
  background-color: rgba(255, 255, 255, 0.08);
  channel-video {
    width: 100%;
  }
}
.receive-btn {
  width: 130rpx;
  line-height: 46rpx;
  height: 46rpx;
  border-radius: 24rpx;
  border: 1px solid #ff4b40;
  color: #ff4b40;
  margin-left: 50rpx;
  text-align: center;
  font-size: 24rpx;
}
.video-prize {
  color: #fff;
  text-align: left;
  margin-left: 30rpx;
  font-size: 28rpx;
  flex: 1;
  .video-task {
    margin-left: 10rpx;
    font-weight: 700;
    line-height: 60rpx;
    .num-text {
      color: #ff4b40;
      margin: 0 5rpx;
    }
  }
  .video-circle {
    position: relative;
    background-color: #000;
    width: 54rpx;
    height: 54rpx;
    margin-right: 10rpx;
    .circle {
      width: 54rpx;
      height: 54rpx;
      border: 6rpx solid #fff;
      border-radius: 50%;
      text-align: center;
      box-sizing: border-box;
      &.hidden {
        opacity: 0;
      }
    }
    .load {
      position: absolute;
      z-index: 1;
      left: 10rpx;
      top: 5rpx;
    }
    .ok {
      font-size: 20rpx;
    }
  }
}
.progress {
  position: fixed;
  left: 30rpx;
  z-index: 1;
}
.next-btn {
  text-align: center;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  line-height: 104rpx;
  color: #888;
  font-size: 28rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #000;
  .iconjiantou1 {
    font-size: 24rpx;
  }
}
.video-name {
  word-break: break-all;
  margin: 0 45rpx;
  padding-bottom: 20rpx;
  font-size: 30rpx;
  line-height: 180%;
  flex: 1.5;
}
.none-box {
  height: 422rpx;
  background: #ccc;
  width: 750rpx;
  text-align: center;
  .icon-shipinqueshengicon {
    padding-top: 144rpx;
    font-size: 80rpx;
    color: #eee;
  }
  .text {
    margin-top: 30rpx;
    font-weight: 500;
  }
}
</style>
