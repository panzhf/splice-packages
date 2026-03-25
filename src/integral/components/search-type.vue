<template>
  <view>
    <u-tabs
      v-if="mode === 1"
      :list="tabs"
      :current="activeIndex"
      font-size="28"
      active-color="#FFA83A"
      nactive-color="#333"
      bar-width="80"
      bar-height="4"
      @change="handleSelectClass"
    />

    <scroll-view v-if="mode === 2" :scroll-y="true" :show-scrollbar="false" scroll-with-animation class="tab-box">
      <view
        v-for="(item, index) in tabs"
        :key="item.value"
        class="tab-item"
        :class="['tab-item', index === activeIndex ? 'active-tab' : '']"
        @click="handleTabClick(index)"
      >
        {{ item.name }}
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    paging: {
      type: Object,
      default: () => {}
    },
    mode: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      activeIndex: 0,
      tabs: []
    }
  },
  watch: {
    list: {
      handler(val) {
        this.generateTabs(val)
      },
      immediate: true
    }
  },

  methods: {
    // 生成 Tabs 数据
    generateTabs(list) {
      const baseTabs = list.map(item => ({
        name: item.typename,
        value: item.id
      }))
      this.tabs = [{ name: '全部', value: 0 }, ...baseTabs]
    },
    handleTabClick(index) {
      if (index === this.activeIndex) return
      // 选中
      this.handleSelectClass(index)
    },
    handleSelectClass(index) {
      this.activeIndex = index
      const item = this.tabs[index]
      const query = { ...this.paging, categoryId: item.value }
      this.$emit('query', query)
      this.$emit('submit')
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-box {
  height: 100vh;
  overflow: hidden;
  .tab-item {
    padding: 24rpx 16rpx;
    line-height: 32rpx;
    font-size: 26rpx;
    text-align: center;
  }
  .active-tab {
    background: $bg-color;
  }
}
</style>
