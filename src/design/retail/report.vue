<template>
  <view v-if="displayList.length > 0" class="menu-wrap br-10 bg-f ml-20 mr-20">
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
export default {
  name: 'RetailReport',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    title() {
      return this.data.Title || '报表'
    },
    showTitle() {
      return this.data.IsShowTitle !== false
    },
    // 获取权限菜单配置
    permissionMenu() {
      const userMenuInfo = JSON.parse(uni.getStorageSync('userMenuInfo') || '{}')
      const homemenu = userMenuInfo.homemenu || []
      return homemenu.find(item => item.number === 995)
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

