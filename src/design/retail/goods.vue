<template>
  <view v-if="displayList.length > 0" class="menu-wrap br-10 bg-f ml-20 mr-20">
    <view v-if="showTitle" class="menu-title c-3 fs-28 fw-bold">{{ title }}</view>
    <view class="menu-inner">
      <view v-for="item in displayList" :key="item.number" class="item" @tap="handleNavigation(item)">
        <view class="menu-icon" :style="{ 'background-image': 'url(' + item.icon + ')' }" />
        <view v-if="showTag(item.number)" class="total">
          <view class="tag">{{ showData(item.number) }}</view>
        </view>
        <view class="tx-c mt-20">{{ item.name }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { digitShowFilter } from '@/filters'
export default {
  name: 'RetailGoods',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    homeData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    title() {
      return this.data.Title || '货品管理'
    },
    showTitle() {
      return this.data.IsShowTitle !== false
    },
    // 获取权限菜单配置
    permissionMenu() {
      const userMenuInfo = JSON.parse(uni.getStorageSync('userMenuInfo') || '{}')
      const homemenu = userMenuInfo.homemenu || []
      return homemenu.find(item => item.number === 997)
    },
    // 显示的菜单列表
    displayList() {
      const decorationMenuList = this.data.menuList || []
      if (!this.permissionMenu) return []

      const permissionSublist = this.permissionMenu.sublist || []

      // 合并装修配置和权限配置
      return decorationMenuList
        .filter(item => item.show)
        .map(item => {
          const permissionItem = permissionSublist.find(p => p.number === item.number)
          if (permissionItem && permissionItem.state === 1) {
            return {
              ...item,
              mplink: permissionItem.mplink
            }
          }
          return null
        })
        .filter(item => item !== null)
        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    }
  },
  methods: {
    handleNavigation(item) {
      if (item.mplink) {
        this.$emit('navigation', item.mplink, item.number)
      }
    },
    showTag(number) {
      // 商品签收显示待签收数量
      return number === 26 && this.homeData.staySignTotal > 0
    },
    showData(number) {
      if (number === 26) {
        return digitShowFilter(this.homeData.staySignTotal || 0)
      }
      return 0
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-wrap {
  box-sizing: border-box;
  .menu-title {
    padding: 30rpx 0 0 30rpx;
  }
}
.menu-inner {
  padding: 40rpx 0;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  grid-gap: 70rpx 0;
  border-radius: 0 0 10rpx 10rpx;
  .item {
    position: relative;
    width: 140rpx;
    margin: 0 auto;
    .total {
      position: absolute;
      left: 88rpx;
      top: -19rpx;
      .tag {
        position: relative;
        display: inline-block;
        border-radius: 5rpx;
        white-space: nowrap;
        line-height: 30rpx;
        height: 30rpx;
        padding: 0 4rpx;
        min-width: 36rpx;
        text-align: center;
        font-size: 24rpx;
        color: #fff;
        background: #ff6f52;
        border-radius: 10rpx;
        &::after {
          content: '';
          left: 6rpx;
          bottom: -6rpx;
          position: absolute;
          display: inline-block;
          width: 0;
          height: 0;
          border-right: 8rpx solid transparent;
          border-left: 4rpx solid transparent;
          border-left-color: transparent;
          border-top: 8rpx solid #ff6f52;
        }
      }
    }
  }
}
.menu-icon {
  width: 64rpx;
  height: 64rpx;
  background-size: 64rpx;
  margin: 0 auto;
  background-repeat: no-repeat;
  background-position: center;
}
</style>

