<template>
  <text class="time-show-wrap" :class="highLight ? 'time-show-highlight' : 'time-show-normal'">
    <template v-if="info[dayKey]">
      <text class="time-item" :style="customStyle">
        {{ info[dayKey] }}
      </text>
      <text class="time-colon">天</text>
    </template>
    <text class="time-item" :style="customStyle">
      {{ info[hourKey] }}
    </text>
    <text class="time-colon">时</text>
    <text class="time-item" :style="customStyle">{{ info[minuteKey] }}</text>
    <text class="time-colon">分</text>
    <text class="time-item" :style="customStyle">{{ info[secondKey] }}</text>
    <text class="time-colon">秒</text>
  </text>
</template>

<script>
export default {
  props: {
    highLight: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => ({})
    },
    styleInfo: {
      type: Object,
      default: () => ({})
    },
    dayKey: {
      type: String,
      default: 'day'
    },
    hourKey: {
      type: String,
      default: 'hour'
    },
    minuteKey: {
      type: String,
      default: 'minute'
    },
    secondKey: {
      type: String,
      default: 'second'
    }
  },
  data() {
    return {}
  },

  computed: {
    customStyle() {
      const { color, background } = this.styleInfo
      let styleStr = ''
      if (color) {
        styleStr += `color: ${color};`
      }
      if (background) {
        styleStr += `background: ${background};`
      }
      return styleStr
    }
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
.time-show-highlight {
  .time-item {
    height: 42rpx;
    line-height: 42rpx;
    padding: 0 4rpx;
    border-radius: 4rpx;
    margin: 0 6rpx;
    &:first-child {
      margin-left: 0;
    }
  }
}
.time-show-normal {
  color: #fc6e48;
}
</style>
