import dayjs from 'dayjs'
export default {
  // 倒计时
  data() {
    return {
      countTag: -1,
      day: '',
      hour: '',
      minute: '',
      second: '',
      timer: null // 轮询定时器
    }
  },
  onUnload() {
    this.clearCount()
  },
  onHide() {
    this.clearCount()
  },
  methods: {
    timeCount(info) {
      this.hour = ''
      this.minute = ''
      this.second = ''
      let t1 = dayjs(info.StartTime)
      let t2 = dayjs(info.EndTime)
      let s = Math.floor(t2.diff(t1) / 1000)
      if (s > 0) {
        this.formatTime(s)
      }
      clearInterval(this.countTag)
      this.countTag = setInterval(() => {
        s--
        if (s >= 0) {
          this.formatTime(s)
        } else {
          this.clearCount()
          this.endTime && this.endTime()
        }
      }, 1000)
    },
    formatTime(s) {
      if (this.showDay) {
        // 显示天数
        this.day = this.padNum(Math.floor(s / (60 * 60 * 24)))
        this.hour = this.padNum(Math.floor((s / (60 * 60)) % 24))
      } else {
        this.hour = this.padNum(parseInt(s / (60 * 60)))
      }
      this.minute = this.padNum(parseInt((s / 60) % 60))
      this.second = this.padNum(parseInt(s % 60))
    },
    padNum(v) {
      return v < 10 ? `0${v}` : `${v}`
    },
    clearCount() {
      this.day = '0'
      this.hour = '00'
      this.minute = '00'
      this.second = '00'
      clearInterval(this.countTag)
      this.countTag = -1
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
