<template>
  <view v-if="displayList.length > 0" class="menu-wrap br-10 bg-f">
    <view v-if="showTitle" class="menu-title c-3 fs-28 fw-bold">{{ title }}</view>
    <view class="menu-inner">
      <view v-for="item in displayList" :key="item.number" class="item" @tap="handleNavigation(item)">
        <view class="menu-icon" :style="{ 'background-image': 'url(' + item.icon + ')' }" />
        <view class="tx-c mt-20">{{ item.name }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'

export default {
  name: 'RetailStaffMgmt',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    title() {
      return this.data.Title || '人员管理'
    },
    showTitle() {
      return this.data.IsShowTitle !== false
    },
    // 获取权限菜单配置（用 data.number 匹配 mymenu 父级，如 992）
    permissionMenu() {
      const userMenuInfo = JSON.parse(uni.getStorageSync('userMenuInfo') || '{}')
      const mymenu = userMenuInfo.mymenu || []
      return mymenu.find(item => item.number === this.data.number && item.state === 1)
    },
    displayList() {
      const decorationMenuList = this.data.menuList || []
      if (!this.permissionMenu) return []

      const permissionSublist = this.permissionMenu.sublist || []

      return decorationMenuList
        .filter(item => item.show !== false)
        .map(item => {
          const permissionItem = permissionSublist.find(p => p.number === item.number)
          if (permissionItem && permissionItem.state === 1) {
            return {
              ...item,
              mplink: permissionItem.mplink,
              icon: item.icon || staticURL() + 'menu/my.png?v=3'
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
        uni.navigateTo({ url: item.mplink })
      }
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
