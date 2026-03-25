<template>
  <view class="countdown-wrapper" :style="{ '--theme-rgb': themeRgbValue }">
    <!-- 标题区域 -->
    <view v-if="title" class="countdown-title">
      <view class="title-line"></view>
      <text class="title-text">{{ title }}</text>
      <view class="title-line"></view>
    </view>
    
    <!-- 倒计时容器 -->
    <view class="countdown-container">
      <!-- 天数 -->
    <template v-if="showDay && day && day !== '0' && day !== '00'">
      <view class="countdown-item-wrapper">
        <view class="countdown-box countdown-box-day">
          <text class="countdown-number">{{ formatDay(day) }}</text>
        </view>
        <text class="countdown-unit">天</text>
      </view>
    </template>
    
    <!-- 时 -->
    <view class="countdown-item-wrapper">
      <view class="countdown-box">
        <text class="countdown-number">{{ hour || '00' }}</text>
      </view>
      <text class="countdown-separator">:</text>
    </view>
    
    <!-- 分 -->
    <view class="countdown-item-wrapper">
      <view class="countdown-box">
        <text class="countdown-number">{{ minute || '00' }}</text>
      </view>
      <text class="countdown-separator">:</text>
    </view>
    
    <!-- 秒 -->
    <view class="countdown-item-wrapper">
      <view class="countdown-box">
        <text class="countdown-number">{{ second || '00' }}</text>
      </view>
    </view>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import timesMixin from 'packages/mixins/times'

export default {
  name: 'CountdownTimer',
  mixins: [timesMixin],
  props: {
    // 开始时间
    startTime: {
      type: String,
      default: ''
    },
    // 结束时间
    endTime: {
      type: String,
      default: ''
    },
    // 是否显示天数
    showDay: {
      type: Boolean,
      default: true
    },
    // 倒计时结束回调
    onEnd: {
      type: Function,
      default: null
    },
    // 标题文本，传入则显示标题
    title: {
      type: String,
      default: ''
    },
    // 主题色，支持 "rgb(255, 128, 0)" 或 "#111"/"#ffffff"，用于替换 rgba 中的 rgb 部分
    themeRgb: {
      type: String,
      default: 'rgb(0, 0, 0)'
    }
  },
  computed: {
    // 从 rgb(x,y,z) 或 #111/#ffffff 解析出 "x,y,z" 供 CSS 变量使用
    themeRgbValue() {
      const val = (this.themeRgb || '').trim()
      // rgb(x,y,z) 格式
      const rgbMatch = val.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)
      if (rgbMatch) {
        return `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`
      }
      // #111 或 #ffffff 格式
      const hexMatch = val.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      if (hexMatch) {
        let hex = hexMatch[1]
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        return `${r}, ${g}, ${b}`
      }
      return '0, 0, 0'
    }
  },
  mounted() {
    // 组件加载时初始化倒计时
    this.initCountdown()
  },
  methods: {
    // 初始化倒计时
    initCountdown() {
      if (this.endTime) {
        // 如果没有传入开始时间，使用当前时间
        const startTime = this.startTime || dayjs().format('YYYY-MM-DD HH:mm:ss')
        // 调用重写的 timeCount 方法
        this.timeCount({
          StartTime: startTime,
          EndTime: this.endTime
        })
      }
    },
    // 重写 mixin 的 timeCount 方法，避免调用 endTime 方法（与 prop 冲突）
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
          // 调用外部传入的回调，而不是调用 endTime 方法（避免与 prop 冲突）
          if (this.onEnd && typeof this.onEnd === 'function') {
            this.onEnd()
          }
        }
      }, 1000)
    },
    // 格式化天数（天数不需要补零，直接显示）
    formatDay(day) {
      const dayNum = parseInt(day)
      return dayNum > 0 ? dayNum.toString() : '0'
    }
  }
}
</script>

<style lang="scss" scoped>
.countdown-wrapper {
  width: 100%; 
  border-top: 1rpx solid rgba(var(--theme-rgb, 0, 0, 0), 0.2);
}

.countdown-title {
  display: flex;
  align-items: center;
  justify-content: center; 
  padding-top: 40rpx;
  border-radius: 16rpx 16rpx 0 0;
  
  .title-line {
    flex: 1;
    height: 2rpx;
    max-width: 120rpx;
    border-radius: 1rpx;
    
    // 左边的线条：从透明到实色（从右到左）
    &:first-child {
      background: linear-gradient(90deg, rgba(var(--theme-rgb, 0, 0, 0), 0) 0%, rgba(var(--theme-rgb, 0, 0, 0), 1) 100%);
    }
    
    // 右边的线条：从实色到透明（从左到右）
    &:last-child {
      background: linear-gradient(270deg, rgba(var(--theme-rgb, 0, 0, 0), 0) 0%, rgba(var(--theme-rgb, 0, 0, 0), 1) 100%);
    }
  }
  
  .title-text {
    font-size: 28rpx;
    color: rgba(var(--theme-rgb, 0, 0, 0), 1);
    font-weight: 500;
    margin: 0 24rpx;
    white-space: nowrap;
  }
}

.countdown-container {
  display: flex;
  align-items: center;
  justify-content: center; 
  padding-top: 30rpx;  
}

.countdown-item-wrapper {
  display: flex;
  align-items: center;
  
  &:not(:last-child) {
    margin-right: 4rpx;
  }
}

.countdown-box {
  background-color: rgba(var(--theme-rgb, 0, 0, 0), 0.2);
  border-radius: 10rpx;
  padding: 10rpx 16rpx;
  backdrop-filter: blur(6rpx);
  -webkit-backdrop-filter: blur(6rpx);
  min-width: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.countdown-box-day {
    min-width: auto;
    padding: 10rpx 20rpx;
  }
}

.countdown-number {
  font-size: 42rpx;
  font-weight: bold;
  color: rgba(var(--theme-rgb, 0, 0, 0), 1);
  line-height: 1.2;
  letter-spacing: 0;
}

.countdown-unit {
  font-size: 28rpx;
  color: rgba(var(--theme-rgb, 0, 0, 0), 0.7);
  margin: 0 12rpx;
  font-weight: normal;
  line-height: 1;
}

.countdown-separator {
  font-size: 28rpx;
  color: rgba(var(--theme-rgb, 0, 0, 0), 0.7);
  margin: 0 12rpx;
  font-weight: normal;
  line-height: 1;
}
</style>