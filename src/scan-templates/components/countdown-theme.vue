<template>
  <view class="hbvoucher-countdown">
    <text v-if="countTimeItem.day > 0" class="hbvoucher-countdown-item">{{ countTimeItem.day }}</text>
    <text v-if="countTimeItem.day > 0" class="hbvoucher-countdown-colon">天</text>
    <text class="hbvoucher-countdown-item">{{ countTimeItem.newhour }}</text>
    <text class="hbvoucher-countdown-colon">:</text>
    <text class="hbvoucher-countdown-item">{{ countTimeItem.minute }}</text>
    <text class="hbvoucher-countdown-colon">:</text>
    <text class="hbvoucher-countdown-item">{{ countTimeItem.second }}</text>
    <text class="hbvoucher-countdown-colon">:</text>
    <text class="hbvoucher-countdown-item hbvoucher-countdown-item--last">{{ countTimeItem.millisecond }}</text>
    <text class="hbvoucher-countdown-tips">{{ tips }}</text>
  </view>
</template>

<script>
import dayjs from 'dayjs'
export default {
  props: {
    tips: {
      type: String,
      default: ''
    },
    startTime: {
      type: String,
      default: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    endTime: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      countTimeItem: {
        timeType: 0, // 0关闭 1 开始
        diff: 0,
        day: 0,
        hour: 0,
        newhour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      },
      countTag: -1
    }
  },
  computed: {
    time() {
      let { startTime, endTime } = this
      return { startTime, endTime }
    }
  },
  watch: {
    time: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val.startTime && val.endTime) {
          let t = dayjs(val.endTime)
          this.countTimeItem.diff = Math.floor(t.diff(val.startTime))
          this.countTimeItem.timeType = 1
          this.countDown()
        }
      }
    }
  },
  created() {
    this.countTimelist = []
    this.clearCount()
  },
  beforeDestroy() {
    this.countTimelist = []
    // 清除定时器
    this.clearCount()
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      // 倒计时处理
      if (this.startTime && this.endTime) {
        let t = dayjs(this.endTime)
        this.countTimeItem.diff = Math.floor(t.diff(this.startTime))
        this.countTimeItem.timeType = 1
        this.countDown()
      }
    },
    // 调起倒计时
    countDown() {
      this.countTag = setInterval(() => {
        if (this.countTimeItem.timeType === 1) {
          this.countTimeItem.diff = this.countTimeItem.diff - 100
          if (this.countTimeItem.diff > 0) {
            this.formatTime(this.countTimeItem)
          } else {
            this.countTimeItem.timeType = 0
            this.clearCount()
          }
        }
      }, 100)
    },
    // 清除倒计时
    clearCount() {
      clearInterval(this.countTag)
      this.countTag = null
    },
    // 计算倒计时
    formatTime(item) {
      this.countTimeItem.day = Math.floor(this.countTimeItem.diff / 1000 / (60 * 60 * 24))
      this.countTimeItem.newhour = this.padNum(Math.floor((this.countTimeItem.diff / 1000 / (60 * 60)) % 24))
      this.countTimeItem.hour = this.padNum(Math.floor(this.countTimeItem.diff / 1000 / (60 * 60)))
      this.countTimeItem.minute = this.padNum(parseInt((this.countTimeItem.diff / 1000 / 60) % 60))
      this.countTimeItem.second = this.padNum(parseInt((this.countTimeItem.diff / 1000) % 60))
      this.countTimeItem.millisecond = parseInt((this.countTimeItem.diff / 100) % 10)
    },
    // 计算数字
    padNum(v) {
      return v < 10 ? `0${v}` : `${v}`
    }
  }
}
</script>

<style lang="scss" scoped>
.hbvoucher-countdown {
  position: relative;
  // font-size: 0;
  color: #000;
  .hbvoucher-countdown-item {
    display: inline-block;
    width: 36rpx;
    height: 36rpx;
    line-height: 36rpx;
    border-radius: 6rpx;
    background-color: #000;
    text-align: center;
    font-size: 24rpx;
    color: #fff;
  }
  .hbvoucher-countdown-item--last {
    background-color: transparent;
    color: #000;
  }
  .hbvoucher-countdown-colon {
    margin-left: 4rpx;
    margin-right: 4rpx;
    font-size: 24rpx;
  }
  .hbvoucher-countdown-tips {
    // display: inline-block;
    margin-top: 10rpx;
    margin-left: 4rpx;
    font-size: 24rpx;
  }
}
</style>
