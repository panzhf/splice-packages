<template>
  <scroll-view
    v-if="baseStaticUrl"
    :scroll-left="toIndex"
    scroll-x
    scroll-with-animation
    class="tab-time"
    :style="{ backgroundImage: `url(${baseStaticUrl}/time-bg.png)` }"
  >
    <view
      v-for="(item, index) in list"
      :key="index"
      class="time-item"
      :class="[index === active ? 'active' : '']"
      :style="{ backgroundImage: index === active ? `url(${baseStaticUrl}/time-dq.png)` : '' }"
      @tap="
        e => {
          handleChecked(e, index)
        }
      "
    >
      <view class="time">{{ item.MatchDate }}</view>
      <view class="name">比赛时间</view>
    </view>
  </scroll-view>
</template>

<script>
import { getDomInfo } from 'packages/utils/function'
export default {
  props: {
    baseStaticUrl: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: -1
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      toIndex: 0
    }
  },
  computed: {
    active: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('input', v)
      }
    }
  },
  watch: {
    list(val) {
      this.setDefaultWidth()
    }
  },
  methods: {
    async setDefaultWidth() {
      setTimeout(async () => {
        let itemDom = await getDomInfo('.time-item', this)
        const itemWeight = itemDom.width // 子元素宽度
        this.toIndex = itemWeight * this.value
      }, 500)
    },
    async handleChecked(e, index) {
      if (index === this.active) return
      this.active = index
      const onheadactive = e.currentTarget.offsetLeft // 元素距离左侧的位置
      let itemDom = await getDomInfo('.time-item', this)
      const itemWeight = itemDom.width // 子元素宽度
      this.toIndex = onheadactive - itemWeight
      this.$emit('handleChange')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
.tab-time {
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 140rpx;
  width: 100%;
  margin: 40rpx auto 0;
  padding: 18rpx 40rpx;
  @include box();
  white-space: nowrap; // scroll-view横向滑动需要
  .time-item {
    width: 33.33%;
    height: 108rpx;
    // height: 100%;
    display: inline-block;
    text-align: center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    .time,
    .name {
      font-size: 30rpx;
      font-family: PingFang SC;
      color: #83b381;
      margin-top: 17rpx;
    }
    .name {
      font-size: 24rpx;
      margin-top: 0rpx;
    }
  }
  .active {
    .time,
    .name {
      color: #fff;
    }
  }
}
</style>
