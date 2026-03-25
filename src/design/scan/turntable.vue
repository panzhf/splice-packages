<template>
  <view class="base-turntable skin-0">
    <view class="wrapper">
      <view class="bg" :style="{ backgroundImage: `url(${config.bgUrl})` }" />
      <view class="prize-list" :animation="animationData" :style="{ transform: `rotate(${defaultrotate}deg)` }">
        <view
          v-for="(item, index) in list"
          :key="index"
          :style="{ transform: `rotate(${(index * 360) / listLength}deg)` }"
          class="prize-item flex flex-column flex-middle"
        >
          <text class="name fs-30 fw-bold" :style="{ color: config.prizeTextColor }">{{ item.prizename }}</text>
          <image :src="item.imgpath" class="icon mt-20" />
          <view class="line" :style="{ transform: `rotate(${180 / listLength}deg)`, background: config.lineColor }" />
        </view>
      </view>
      <view class="light">
        <view
          v-for="(item, index) in 24"
          :key="item"
          :style="{ transform: `rotate(${(index * 360) / 24}deg)` }"
          class="item"
        />
      </view>
    </view>
    <image :src="config.startUrl" class="play-btn" @click="handleClick" />
    <rank-list :position="1" :list="rankList" class="rank-list" custom-style="margin-left: 0" />
    <!-- #ifdef MP-WEIXIN -->
    <auth-button v-if="needAuth" :mode="2" @success="handleClick()" />
    <!-- #endif -->
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import { mapState } from 'vuex'
// #endif
// #ifndef H5-DECORATE
import { apiGetActivityZJDataList } from 'packages/api/scan'
// #endif
// #ifdef H5-DECORATE
import { winnerList } from '@/json/scan'
// #endif
import RankList from 'packages/components/rank-list'
import { getQuery } from 'packages/utils/function'
export default {
  name: 'TurnTable',
  components: {
    RankList
  },
  props: {
    prizeList: {
      type: Array,
      default: () => {
        return []
      }
    },
    activityId: {
      type: Number,
      default: 0
    },
    config: {
      type: Object,
      default: () => {
        return {
          audioUrl: '',
          showAudio: true,
          showWinner: true,
          bgUrl: '',
          startUrl: '',
          prizeTextColor: '',
          lineColor: '',
          thanksUrl: ''
        }
      }
    }
  },
  data() {
    return {
      isPlaying: false,
      round: 0, // 转数
      skin: 0,
      startTime: 0,
      animationData: {},
      rankList: [] // 中奖名单列表
    }
  },
  computed: {
    defaultrotate() {
      return 360 / this.listLength / 2
    },
    list() {
      let data = this.prizeList.map(item => {
        item = this.$toLowerKey(item, true)
        if (item.type === 1) {
          item.imgpath = this.config.thanksUrl
          item.prizename = '谢谢参与'
        }
        return item
      })
      return data
    },
    listLength() {
      return this.list.length
    },
    // #ifdef MP-WEIXIN
    ...mapState('scanAuth', ['needAuth'])
    // #endif
  },
  watch: {
    config: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.showWinner) this.getActivityZJDataList()
      }
    }
  },
  methods: {
    // 中奖名单
    getActivityZJDataList(pageSize, pageIndex) {
      // #ifndef H5-DECORATE
      let params = {
        /* #ifdef H5 */
        memberlogin: getQuery('m'),
        /* #endif */
        activityId: this.activityId,
        pageSize: pageSize || 10,
        pageIndex: pageIndex || 1
      }
      apiGetActivityZJDataList(params).then(res => {
        if (res.return_data && res.return_data.ymFwCodeAwardRecordZJList) {
          this.rankList = res.return_data.ymFwCodeAwardRecordZJList
        }
      })
      // #endif
      // #ifdef H5-DECORATE
      setTimeout(() => {
        this.rankList = winnerList
      }, 300)
      // #endif
    },
    handleClick() {
      if (this.isPlaying) return
      this.$emit('handleClick')
    },
    startGame() {
      if (this.isPlaying) return
      uni.vibrateLong()
      this.isPlaying = true
      this.startTime = new Date().getTime()
      if (this.config.showAudio) {
        let innerAudioContext = uni.createInnerAudioContext()
        innerAudioContext.src = this.config.audioUrl
        innerAudioContext.play()
      }

      uni.vibrateShort()
      if (!this.animation) {
        const animation = uni.createAnimation({
          duration: 400,
          timingFunction: 'ease'
        })
        this.animation = animation
      }

      this.animation.rotate(0).step({ duration: 20, timingFunction: 'step-start' })
      this.round = 0
      this.roundTimer = setInterval(() => {
        this.round++
        this.animation.rotate(360 * this.round).step({ duration: 400, timingFunction: 'linear' })
        this.animationData = this.animation.export()
      }, 400)
    },
    endGame() {
      this.animationData = this.animation.export()
      this.resetTimer('round')
    },
    async successCb(id) {
      //-1 为未中奖
      // // 若有扫码获得免费抽奖机会，同步更新数据
      // this.$emit('update:free-num', freeNum)
      // this.firstTime++
      const prizeIndex = this.list.findIndex(item => {
        if (id === -1) return item.type === 1
        return item.id === id
      })
      // let prizeInfo = this.list.find(item => item.id === prizeId)
      // prizeInfo = { ...prizeInfo, ...link }
      // if (this.info.usescenetype === 1) {
      //   // 线下领取增加个获奖时间
      //   prizeInfo.time = dayjs().format('YYYY-MM-DD HH:mm:ss')
      // }
      // const prizeIndex = 2
      const e = new Date().getTime()
      const diff = e - this.startTime
      // 保证至少6次转盘转动时间，否则按响应时间向上取整
      const round = diff < 400 * 6 ? Math.max(this.round, 6) : Math.ceil(diff / 400)
      // console.log('round', round)
      await this.sleep((round - this.round) * 400)
      this.resetTimer('round')
      // 转盘最终转动角度，加两圈使得有减速效果
      let angle = (-prizeIndex * 360) / this.listLength + 360 * (round + 2)
      // angle = this.getRandom(angle, 360 / this.listLength / 2 - 10)
      this.animation.rotate(angle).step({ duration: 2000, timingFunction: 'ease-out' })
      this.animationData = this.animation.export()
      setTimeout(() => {
        this.isPlaying = false
        // this.$emit('success', prizeInfo)
      }, 2000)
    },
    resetTimer(type) {
      if (type === 'round') {
        if (this.roundTimer) {
          clearInterval(this.roundTimer)
          this.roundTimer = null
        }
      } else {
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
      }
    },
    sleep(time) {
      return new Promise(resolve => {
        setTimeout(resolve, time)
      })
    },
    // 获取随机浮动数
    getRandom(value, floatRange) {
      const randomFloat = Math.round((Math.random() * 2 - 1) * floatRange)
      return Math.round(value + randomFloat)
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: base-turntable;
.#{$prefix} {
  position: relative;
  margin: 0 30rpx;
  padding: 30rpx 0;
  box-sizing: border-box;
  .wrapper {
    position: relative;
    margin: 0 auto;
    width: 690rpx;
    height: 690rpx;
  }
  .bg {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% auto;
  }
  .prize-list {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    .prize-item {
      position: absolute;
      top: 0;
      left: 50%;
      margin-left: -90rpx;
      width: 180rpx;
      height: 346rpx;
      transform-origin: center bottom;
    }
    .name {
      padding-top: 64rpx;
      color: #ff343b;
      text-align: center;
    }
    .icon {
      width: 60rpx;
      height: 60rpx;
    }
    .line {
      position: absolute;
      z-index: 1;
      width: 6rpx;
      top: 46rpx;
      left: 50%;
      bottom: 0;
      // margin-left: -1px;
      transform-origin: center bottom;
    }
  }
  .light {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    .item {
      position: absolute;
      top: 8rpx;
      left: 338rpx;
      width: 16rpx;
      height: 16rpx;
      transform-origin: center 336rpx;
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        box-shadow: 0 0 20rpx #fff;
        background-color: #fff;
      }
      &:nth-of-type(odd) {
        &::after {
          animation: lightAnimate 1s steps(1) infinite;
        }
      }
      &:nth-of-type(even) {
        &::after {
          animation: lightAnimate 1s steps(1) infinite 0.5s;
        }
      }
    }
  }
  .play-btn {
    position: absolute;
    z-index: 3;
    top: 48%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 184rpx;
    height: 210rpx;
    &.disabled {
      filter: grayscale(0.9);
    }
  }
  &.skin-0 {
    .line {
      background: #ff9a24;
    }
  }
}

@keyframes lightAnimate {
  0% {
    width: 12rpx;
    height: 12rpx;
    background: #fff;
    box-shadow: 0 0 20rpx #fff;
  }
  50% {
    width: 18rpx;
    height: 18rpx;
    background: #fb5b1c;
    box-shadow: 0 0 20rpx #fb5b1c;
  }
  100% {
    width: 12rpx;
    height: 12rpx;
    background: #fff;
    box-shadow: 0 0 20rpx #fff;
  }
}
.rank-list {
  position: absolute !important;
  width: 100rpx;
  height: 400rpx;
  z-index: 100;
  top: 0;
  left: 0;
  /* #ifdef H5 */
  left: 40% !important;
  /* #endif */
}
</style>
