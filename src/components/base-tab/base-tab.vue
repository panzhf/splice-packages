<template>
  <view class="base-tab flex flex-middle flex-between">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      :class="{ active: currentTab === item.value }"
      :style="{ color: currentTab === item.value ? activeColor : inactiveColor }"
    >
      <view class="tab-name" @tap.stop="handleChange(item.value)">{{ item.label }}</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BaseTab',
  props: {
    value: {
      type: [Number, String],
      default: 0
    },
    tabList: {
      type: Array,
      default: () => []
    },
    activeColor: {
      type: String,
      default: '#ffefcb'
    },
    inactiveColor: {
      type: String,
      default: '#fff'
    }
  },
  data() {
    return {}
  },
  computed: {
    currentTab: {
      get() {
        return this.value
      },
      set(v) {
        this.$emit('input', v)
      }
    }
  },
  methods: {
    handleChange(v) {
      this.currentTab = v
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: base-tab;
.#{$prefix} {
  height: 90rpx;
  padding: 0 80rpx;
  line-height: 80rpx;
  position: relative;
  &::after {
    position: absolute;
    content: '';
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #fff;
    transform: scaleY(0.5);
  }
  .tab-item {
    position: relative;
    height: 100%;
    font-size: 32rpx;
    font-weight: 500;
    &::after {
      position: absolute;
      content: '';
      left: 50%;
      bottom: 0;
      width: 0;
      height: 4rpx;
      background-color: transparent;
      transform: translateX(-50%);
      transition: width 0.5s;
    }
    &.active {
      font-size: 36rpx;
      font-weight: bold;
      &::after {
        width: 100%;
        background-color: currentColor;
      }
    }
  }
}
</style>
