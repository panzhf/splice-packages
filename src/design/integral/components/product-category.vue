<template>
  <view class="product-category">
    <scroll-view class="tab-list" scroll-x enhanced :show-scrollbar="false">
      <view
        v-for="(item, index) in tabList"
        :key="index"
        class="tab-item"
        :class="{ active: item === currentTab }"
        :style="{ color: item === currentTab ? activeColor : inactiveColor }"
        @tap.stop="handleChange(item)"
      >
        {{ item }}
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'ProductCategory',
  props: {
    tabList: {
      type: Array,
      default: () => []
    },
    activeColor: {
      type: String,
      default: '#333'
    },
    inactiveColor: {
      type: String,
      default: '#999'
    }
  },
  data() {
    return {
      currentTab: '全部'
    }
  },
  methods: {
    handleChange(v) {
      if (this.currentTab === v) return
      this.currentTab = v
      this.$emit('change', v)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: product-category;
.#{$prefix} {
  position: relative;
  padding: 0 30rpx;
  @include lh(88rpx, 80rpx);
  &::after {
    position: absolute;
    bottom: 4rpx;
    left: 0;
    width: 100%;
    height: 1px;
    content: '';
    background-color: #eee;
  }
  .tab-list {
    white-space: nowrap;
    .tab-item {
      position: relative;
      z-index: 1;
      display: inline-block;
      border-bottom: 2px solid transparent;
      & + .tab-item {
        margin-left: 40rpx;
      }
      &.active {
        font-weight: bold;
        border-bottom-color: currentColor;
      }
    }
  }
}
</style>
