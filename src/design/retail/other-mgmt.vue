<template>
  <view v-if="displayList.length > 0" class="menu-lines c-0 fs-28 bg-f br-10">
    <template v-for="item in displayList">
      <view
        v-if="item.id !== 3"
        :key="item.id"
        class="item flex flex-middle"
        :class="{ 'bd-e': !item.isLast }"
        @tap="handleNav(item)"
      >
        <view :class="['icon', item.iconClass, 'fs-34']" />
        <view class="flex-1 ml-30">{{ item.name }}</view>
        <view class="icon iconfont icon-more fs-14 c-6" />
      </view>
      <ServiceButton v-else :key="'svc-' + item.id">
        <view class="item flex flex-middle" :class="{ 'bd-e': !item.isLast }">
          <view :class="['icon', item.iconClass, 'fs-28']" />
          <view class="flex-1 ml-30">{{ item.name }}</view>
          <view class="icon iconfont icon-more fs-14 c-6" />
        </view>
      </ServiceButton>
    </template>
  </view>
</template>

<script>
import ServiceButton from 'packages/components/service-center/service-button'

const ID_CONFIG = {
  1: { path: '/packages/src/address/list', iconClass: 'iconfont icondizhi' },
  2: { path: '/scans/prize/list', iconClass: 'iconfont icon-wodejiangpinicon' },
  3: { path: '', iconClass: 'mdfont icon-servicecenter', isService: true }
}

const DEFAULT_ITEMS = [
  { Id: 1, Name: '收货地址', Show: true, Sort: 0 },
  { Id: 2, Name: '我的奖品', Show: true, Sort: 1 },
  { Id: 3, Name: '客服中心', Show: true, Sort: 2 }
]

export default {
  name: 'RetailOtherMgmt',
  components: { ServiceButton },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    displayList() {
      const items = this.data.Items || DEFAULT_ITEMS
      const filtered = items.filter(item => item.Show !== false).sort((a, b) => (a.Sort || 0) - (b.Sort || 0))

      return filtered.map((item, idx) => {
        const cfg = ID_CONFIG[item.Id] || {}
        return {
          id: item.Id,
          name: item.Name,
          path: cfg.path,
          iconClass: cfg.iconClass || 'iconfont icondizhi',
          isLast: idx === filtered.length - 1
        }
      })
    }
  },
  methods: {
    handleNav(item) {
      if (item.path) {
        this.$navPage(item.path)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-lines {
  font-weight: 500;
  padding: 0 30rpx;
  .item {
    height: 100rpx;
  }
}
</style>
