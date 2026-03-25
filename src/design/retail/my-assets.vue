<template>
  <view v-if="displayList.length" class="home-overview" :style="{ backgroundImage: `url(${assetsBgUrl})` }">
    <view class="key fw-normal fs-30 pl-30 flex flex-middle flex-between mr-40 pr-20 pt-30" style="line-height: 36rpx">
      <view>
        <text class="fs-28 fw-bold c-3">我的资产</text>
        <u-loading v-if="!assetsInfo.isGetData" class="ml-10" color="#cccccc" mode="circle" />
      </view>
      <view
        :class="['pl-10 pr-20', 'iconfont', assets ? 'icon-show-asset fs-24' : 'icon-hide-asset fs-20']"
        @click.stop="handleAssets"
      />
      <view class="iconfont icon-explain fw-normal tx-r flex-1 fs-28 primary-color ml-20" @tap="handleShowExplain" />
    </view>
    <view class="flex-wrap pt-20 pl-40 fs-24 c-3">
      <view
        v-for="(item, index) in displayList"
        :key="index"
        :style="[0, 2].includes(index) ? 'width: 380rpx' : ''"
        class="flex flex-middle tx-l data-item"
        @tap="handleNavAssets(item)"
      >
        <text class="c-6 shrink-0 mr-20">{{ item.name }}</text>
        <text class="fs-36 primary-color fw-bold">
          <text v-if="assets && item.type === 0" class="fs-24">￥</text>
          {{ assets ? item.data : '*' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'RetailAssets',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      assets: false
    }
  },
  computed: {
    ...mapState(['assetsInfo', 'storeInfo']),
    assetsBgUrl() {
      return this.data.bgUrl || ''
    },
    roleType() {
      const storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      return parseInt(storeSettingInfo.roleType || -1)
    },
    // 获取权限菜单配置
    permissionMenu() {
      const userMenuInfo = JSON.parse(uni.getStorageSync('userMenuInfo') || '{}')
      const homemenu = userMenuInfo.homemenu || []
      return homemenu.find(item => item.number === 10003 && item.state === 1)
    },
    // 显示的资产列表
    displayList() {
      const { loosechange, pointscount, vouchercount, totalrevenue } = this.assetsInfo || {}
      let allList = [
        {
          name: '红包零钱',
          data: (loosechange || 0).toFixed(2),
          type: 0,
          url: '/packages/src/personal/change/index',
          number: 12
        },
        {
          name: '积分',
          data: pointscount || 0,
          type: 1,
          url: '',
          number: -1
        },
        {
          name: '云店收入',
          data: (totalrevenue || 0).toFixed(2),
          type: 0,
          url: '/pages/store-revenue/index',
          number: -2
        },
        {
          name: '返货券',
          data: vouchercount || 0,
          type: 2,
          url: '/pages/return-coupon/index',
          number: -3
        }
      ]

      // 获取装修配置的菜单列表
      const decorationMenuList = this.data.menuList || []

      // 如果是店员
      if (this.roleType === 3) {
        const permissionSublist = this.permissionMenu ? this.permissionMenu.sublist || [] : []
        allList = allList.filter(item => {
          // 检查装修配置
          const decorationItem = decorationMenuList.find(d => d.name === item.name && d.show)
          if (!decorationItem) return false

          // 红包零钱（number=12）需要同时检查权限和装修
          if (item.number === 12) {
            const permissionItem = permissionSublist.find(p => p.number === 12 && p.state === 1)
            return !!permissionItem
          }

          // 其他项（积分、云店收入、返货券）店员不显示（因为接口没有返回权限）
          return false
        })
      } else {
        // 负责人
        const permissionSublist = this.permissionMenu ? this.permissionMenu.sublist || [] : []
        allList = allList.filter(item => {
          // 检查装修配置
          const decorationItem = decorationMenuList.find(d => d.name === item.name && d.show)
          if (!decorationItem) return false

          // 红包零钱（number=12）需要同时检查权限和装修
          if (item.number === 12) {
            const permissionItem = permissionSublist.find(p => p.number === 12 && p.state === 1)
            return !!permissionItem
          }

          // 其他项（积分、云店收入、返货券）只根据装修配置显示
          return true
        })
      }

      return allList
    }
  },
  mounted() {
    this.assets = uni.getStorageSync('assets')
  },
  methods: {
    handleAssets() {
      uni.setStorageSync('assets', !this.assets)
      this.assets = uni.getStorageSync('assets')
    },
    handleShowExplain() {
      this.$emit('show-explain', 1)
    },
    handleNavAssets(item) {
      if (item.type === 1) {
        this.$emit('show-point')
      } else if (item.url) {
        uni.navigateTo({ url: item.url })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home-overview {
  // margin: 20rpx 20rpx 25rpx;
  margin: 0 20rpx;
  text-align: center;
  height: 222rpx;
  background-size: 710rpx 222rpx;
  background-repeat: no-repeat;
  background-position: center;
  .data-item {
    line-height: 50rpx;
  }
}
</style>

