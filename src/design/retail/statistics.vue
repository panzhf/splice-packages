<template>
  <view v-if="displayData.length > 0" class="home-data data-preview bg-f">
    <view class="home-data__title flex flex-middle fs-28">
      <view class="flex-1">
        <text class="fw-bold">数据概览</text>
        <text class="iconfont icon-explain fs-28 primary-color ml-20" @tap="handleShowExplain" />
      </view>
      <view class="summary-title flex bg-f fs-24">
        <view
          v-for="(item, index) in summaryTitleList"
          :key="index"
          :class="['item', summaryActive === item.type ? 'on' : '']"
          @tap="handleSummaryTitle(item.type)"
        >
          {{ item.title }}
        </view>
      </view>
    </view>
    <view class="home-data__inner flex">
      <view
        v-for="(item, index) in displayData"
        :key="index"
        class="item"
        :class="loading ? 'dp-none-i' : ''"
        @tap="handleNavigation(item)"
      >
        <view class="item-num">{{ showDataValue(item.number) }}</view>
        <view class="item-text fs-24">{{ item.name }}</view>
      </view>
      <view v-if="loading" class="show-load flex flex-1 center-middle">
        <u-loading class="ml-10" color="#cccccc" mode="circle" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RetailStatistics',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      summaryTitleList: [
        { title: '今日', type: 1 },
        { title: '本月', type: 2 },
        { title: '累计', type: 3 }
      ],
      summaryActive: 1,
      loading: false,
      dataInfo: {
        unpackCout: 0,
        signCount: 0,
        writeCount: 0
      }
    }
  },
  computed: {
    // 获取权限菜单配置
    permissionMenu() {
      const userMenuInfo = JSON.parse(uni.getStorageSync('userMenuInfo') || '{}')
      const homemenu = userMenuInfo.homemenu || []
      return homemenu.find(item => item.number === 999 && item.state === 1)
    },
    // 显示的数据项
    displayData() {
      const decorationMenuList = this.data.menuList || []
      if (!this.permissionMenu) return []

      const permissionSublist = this.permissionMenu.sublist || []

      // 合并装修配置和权限配置
      return decorationMenuList
        .filter(item => item.show)
        .map(item => {
          const permissionItem = permissionSublist.find(p => p.number === item.number && p.state === 1)
          return permissionItem ? { ...item, mplink: permissionItem.mplink } : null
        })
        .filter(item => item !== null)
    }
  },
  mounted() {
    this.getScanData(this.summaryActive)
  },
  methods: {
    handleSummaryTitle(type) {
      if (this.summaryActive === type) return
      this.getScanData(type)
    },
    async getScanData(type) {
      if (this.loading) return
      this.loading = true

      try {
        // 调用父组件传递的方法或直接调用接口
        if (this.$parent && this.$parent.getScanData) {
          await this.$parent.getScanData(type)
          // 从父组件获取数据
          if (this.$parent.dataInfo) {
            this.dataInfo = { ...this.$parent.dataInfo }
            this.summaryActive = type
          }
        }
      } finally {
        this.loading = false
      }
    },
    showDataValue(number) {
      const mapping = {
        29: 'unpackCout',
        30: 'writeCount',
        31: 'signCount'
      }
      return this.dataInfo[mapping[number]] || 0
    },
    handleShowExplain() {
      this.$emit('show-explain', 2)
    },
    handleNavigation(item) {
      if (!item.mplink) return
      let url = item.mplink
      if ([29, 30].includes(item.number)) {
        url = `${url}?seachTimeType=${this.summaryActive}`
      }
      this.$emit('navigation', url, item.number)
    }
  }
}
</script>

<style lang="scss" scoped>
.home-data {
  margin: 0 20rpx;
  background: #fff;
  border-radius: 10rpx;
  &.data-preview {
    padding-top: 20rpx;
    margin: 0 20rpx;
    border-radius: 10rpx;
  }
  .summary-title {
    width: 240rpx;
    line-height: 45rpx;
    border: 1px solid var(--theme-color, $uni-color-primary);
    border-radius: 10rpx;
    color: #333;
    .item {
      flex: 1;
      text-align: center;
      position: relative;
      &:not(:last-child) {
        border-right: 1px solid var(--theme-color, $uni-color-primary);
      }
      &.on {
        background: var(--theme-color, $uni-color-primary);
        color: #fff;
      }
    }
  }
  &__title {
    color: #333;
    line-height: 35rpx;
    padding: 0 20rpx 0 30rpx;
  }
  &__inner {
    padding: 0 0 10rpx;
    position: relative;
    .item {
      width: 33%;
      text-align: center;
      padding: 25rpx 0;
      .item-num {
        color: var(--theme-color, $uni-color-primary);
        font-size: 34rpx;
        font-weight: bold;
      }
      .item-text {
        color: $uni-text-color-grey;
      }
    }
    .show-load {
      height: 124rpx;
    }
  }
}
</style>

