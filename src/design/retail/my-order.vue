<template>
  <view class="order-list bg-f br-10">
    <template v-if="!loading">
      <navigator
        v-for="(item, index) in displayList"
        :key="index"
        class="item flex flex-column flex-middle"
        :url="`/packages/src/order/list?type=${item.type}`"
      >
        <view v-if="item.value" class="quantity fs-22 fw-medium">{{ item.value > 99 ? '99+' : item.value }}</view>
        <text class="fs-36 fw-bold iconfont" :class="[item.icon]" />
        <view class="mt-10 fs-26 c-3 fw-medium">{{ item.name }}</view>
      </navigator>
    </template>
    <view v-else class="loading-row">
      <u-loading mode="flower" size="50" class="loading" />
    </view>
  </view>
</template>

<script>
import { apiGetOrderStatistics } from '@/api/order'

const ID_TO_TYPE = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 }

export default {
  name: 'RetailMyOrder',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      stats: { waitpaytotal: 0, waitdelivertotal: 0, waitreceipttotal: 0 }
    }
  },
  computed: {
    displayList() {
      const all = this.data.All || []
      return all
        .filter(item => item.Checked === 1)
        .map(item => {
          const type = ID_TO_TYPE[item.Id] ?? 0
          let value = item.Count ?? 0
          if (item.Id === 3) value = this.stats.waitpaytotal
          else if (item.Id === 4) value = this.stats.waitdelivertotal
          else if (item.Id === 5) value = this.stats.waitreceipttotal
          return {
            Id: item.Id,
            name: item.Name,
            icon: item.Icon || 'iconquanbuicon',
            type,
            value
          }
        })
    }
  },
  created() {
    uni.$on('pageMeOnShow', this.getData)
  },
  mounted() {
    this.getData()
  },
  beforeDestroy() {
    uni.$off('pageMeOnShow', this.getData)
  },
  methods: {
    getData() {
      this.loading = true
      apiGetOrderStatistics().then(res => {
        this.loading = false
        if (this.$ck(res) && res.return_data) {
          this.stats = {
            waitpaytotal: res.return_data.waitpaytotal || 0,
            waitdelivertotal: res.return_data.waitdelivertotal || 0,
            waitreceipttotal: res.return_data.waitreceipttotal || 0
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  min-height: 160rpx;
  .loading-row {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 160rpx;
  }
  .item {
    padding: 40rpx 0;
    position: relative;
    .quantity {
      position: absolute;
      top: 18rpx;
      right: 34rpx;
      min-width: 40rpx;
      height: 30rpx;
      background: $bg-color;
      border-radius: 15rpx 15rpx 15rpx 0;
      text-align: center;
      color: #ffffff;
      padding: 0 4rpx;
      box-sizing: border-box;
      line-height: 30rpx;
    }
  }
}
</style>
