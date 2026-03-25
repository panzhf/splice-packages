<template>
  <view class="calendar fs-28 text-center pb-10">
    <view class="tick left" />
    <view class="tick right" />
    <view class="week flex flex-middle">
      <view v-for="(item, index) in weekDay" :key="index" class="week-day fs-28 flex-1">{{ item }}</view>
    </view>

    <view :class="{ fold: !monthOpen }" class="content" :style="{ height: height }">
      <view :style="{ top: positionTop + 'rpx' }" class="days flex-wrap flex-middle">
        <view v-for="(item, index) in dates" :key="index" class="item">
          <view class="day" :class="{ nolm: !item.lm, active: isChecked(item.year, item.month + 1, item.date) }">
            {{ item.date }}
          </view>
        </view>
      </view>
    </view>

    <image :src="toggleIcon" class="toggle-icon" @tap="trgWeek" />
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  name: 'SignCalendar',
  mixins: [packageStaticMixin],
  props: {
    // 第一列星期几 1-7,7代表星期日
    weekstart: {
      type: Number,
      validator(v) {
        return /[1-7]/.test(v)
      },
      default: 7
    },
    // 选中的日期
    checkedList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      text: {
        year: '年',
        month: '月',
        week: ['一', '二', '三', '四', '五', '六', '日'],
        today: '今'
      },
      y: new Date().getFullYear(), // 年
      m: new Date().getMonth(), // 月
      dates: [], // 当前月日期集合
      positionTop: 0,
      monthOpen: true,
      choose: ''
    }
  },
  computed: {
    // 顶部星期栏目
    weekDay() {
      return this.text.week.slice(this.weekstart - 1).concat(this.text.week.slice(0, this.weekstart - 1))
    },
    height() {
      return (this.dates.length / 7) * 80 + 'rpx'
    },
    toggleIcon() {
      return `${this.PACKAGE_STATIC_URL}photo-sign/${this.monthOpen ? 'arrow-up.png' : 'arrow-down.png'}`
    }
  },
  created() {
    this.dates = this.monthDay(this.y, this.m)
    this.trgWeek()
  },
  mounted() {
    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth()
    let d = date.getDate()
    this.choose = `${y}-${m + 1}-${d}`
  },
  methods: {
    // 获取当前月份天数
    monthDay(y, m) {
      let firstDayOfMonth = new Date(y, m, 1).getDay() // 当月第一天星期几
      let lastDateOfMonth = new Date(y, m + 1, 0).getDate() // 当月最后一天
      let lastDayOfLastMonth = new Date(y, m, 0).getDate() // 上一月的最后一天
      let dates = [] // 所有渲染日历
      let weekstart = this.weekstart == 7 ? 0 : this.weekstart // 方便进行日期计算，默认星期从0开始
      let startDay = (() => {
        // 周初有几天是上个月的
        if (firstDayOfMonth == weekstart) {
          return 0
        } else if (firstDayOfMonth > weekstart) {
          return firstDayOfMonth - weekstart
        } else {
          return 7 - weekstart + firstDayOfMonth
        }
      })()
      let endDay = 7 - ((startDay + lastDateOfMonth) % 7) // 结束还有几天是下个月的
      for (let i = 1; i <= startDay; i++) {
        dates.push({
          date: lastDayOfLastMonth - startDay + i,
          day: weekstart + i - 1 || 7,
          month: m - 1 >= 0 ? m - 1 : 12,
          year: m - 1 >= 0 ? y : y - 1
        })
      }
      for (let j = 1; j <= lastDateOfMonth; j++) {
        dates.push({
          date: j,
          day: (j % 7) + firstDayOfMonth - 1 || 7,
          month: m,
          year: y,
          lm: true
        })
      }
      for (let k = 1; k <= endDay; k++) {
        dates.push({
          date: k,
          day: (lastDateOfMonth + startDay + weekstart + k - 1) % 7 || 7,
          month: m + 1 <= 11 ? m + 1 : 0,
          year: m + 1 <= 11 ? y : y + 1
        })
      }
      return dates
    },
    // 选中处理
    isChecked(y, m, d) {
      let flag = false
      for (let i = 0; i < this.checkedList.length; i++) {
        let dy = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
        if (this.checkedList[i] == dy) {
          flag = true
          break
        }
      }
      return flag
    },
    isToday(y, m, d) {
      let date = new Date()
      return y == date.getFullYear() && m == date.getMonth() && d == date.getDate()
    },
    // 切换成周模式
    trgWeek() {
      this.monthOpen = !this.monthOpen
      if (this.monthOpen) {
        this.positionTop = 0
      } else {
        let index = -1
        this.dates.forEach((i, x) => {
          this.isToday(i.year, i.month, i.date) && (index = x)
        })
        this.positionTop = -((Math.ceil((index + 1) / 7) || 1) - 1) * 80
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
.calendar {
  position: relative;
  color: #333;
  .tick {
    position: absolute;
    top: -20rpx;
    background: linear-gradient(0deg, #ffc399 0%, #ffffff 100%);
    border-radius: 4rpx;
    @include wh(10rpx, 40rpx);
    &.left {
      left: 68rpx;
    }
    &.right {
      right: 68rpx;
    }
  }
  .week {
    @include lh(80rpx);
    background-color: var(--theme-color);
    border-radius: 30rpx 30rpx 0 0;
    .week-day {
      color: #fff;
    }
  }

  .content {
    position: relative;
    overflow: hidden;
    transition: height 0.4s ease;

    .days {
      transition: top 0.3s;
      position: relative;

      .item {
        position: relative;
        @include lh(80rpx);
        width: calc(100% / 7);

        .day {
          position: relative;
          display: inline-block;
          vertical-align: middle;
          @include whl(60rpx);
          overflow: hidden;
          border-radius: 50%;

          &.active {
            background-color: var(--theme-color);
            color: #fff;
            &::after {
              position: absolute;
              bottom: 10rpx;
              left: 50%;
              transform: translateX(-50%) rotate(-35deg);
              content: '';
              @include wh(24rpx, 10rpx);
              border-left: 4rpx solid #fff;
              border-bottom: 4rpx solid #fff;
              border-radius: 0 0 0 6rpx;
            }
          }

          &.nolm {
            color: #aaa;
          }
        }
      }
    }
  }

  .fold {
    height: 80rpx !important;
  }

  .toggle-icon {
    @include wh(610rpx, 34rpx);
    padding: 14rpx 0;
    margin: 20rpx auto 0;
  }
}
/* #ifdef MP-CLOUDSHOP */
// 兼容云店
view {
  box-sizing: border-box;
}
image {
  display: block;
}
/* #endif */
</style>
