<template>
  <view class="coupon-head">
    <view class="current-wrap flex flex-middle" :style="bgStyle">
      <view class="coupon-num">
        <view class="f-28">{{ headConfig.current.label }}券数（张）</view>
        <view class="fw-bold num">{{ voucherCount }}</view>
      </view>

      <view v-if="headConfig.others" class="second-menu" :style="secondMenuStyle">
        <view
          v-for="(item, index) in headConfig.others"
          :key="index"
          class="flex flex-middle mb-20 operate-btn fs-22"
          :style="{ background: calcOperateBgColor }"
          @tap="dropCouponList(item)"
        >
          {{ item.label }}
          <i class="iconfont fs-20 ml-10 mr-10" :class="arrowIcon" />
        </view>
      </view>
    </view>
    <tab
      :tab="activeTab"
      :draw-height="2"
      :draw-width="70"
      :active-index.sync="activeTabIndex"
      :active-color="calcActiveColor"
      :active-bag-color="calcActiveColor"
      :has-border-line="false"
      :tab-bg="headConfig.tabBg"
      class="tab-wrap"
      @change="handleTabChange"
    />
  </view>
</template>

<script>
import Tab from 'packages/components/tab/index.vue'
import { activeColor, operateBgColor, couponHeadBg, arrowIcon } from 'packages/utils/default-picture'
// #ifdef MP-RETAIL
import { mapState } from 'vuex'
import { hex2rgb } from 'packages/utils'
// #endif

export default {
  name: 'ReturnCouponHead',
  components: { Tab },
  props: {
    value: {
      type: Number, // 0 待返货 1 已返货 2 已过期
      default: 0
    },
    voucherCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      arrowIcon,
      activeColor,
      operateBgColor,
      couponHeadBg,
      activeTab: [
        {
          name: '来源',
          value: 0
        },
        {
          name: '产品',
          value: 1
        }
      ],
      activeTabIndex: 0
    }
  },
  computed: {
    // #ifdef MP-RETAIL
    ...mapState(['isSpecialMp']),
    // #endif
    headConfig() {
      let path, tabBg
      /* #ifdef MP-RETAIL */
      path = '/pages/return-coupon/invalid'
      /* #endif */
      /* #ifdef MP-DISTRIBUTION */
      path = '/coupon/return-coupon/invalid-list'
      tabBg = '#F0F0F0'
      /* #endif */
      /* #ifdef MP-SALE */
      path = '/pagesA/coupon/return-coupon/invalid-list'
      /* #endif */
      const maps = [
        {
          current: { label: '待返货' },
          others: [
            { label: '已返货', path: `${path}?tab=1` },
            { label: '已过期', path: `${path}?tab=2` }
          ]
        },
        {
          current: { label: '已返货' }
        },
        {
          current: { label: '已过期' }
        }
      ]
      const config = maps[this.value] || maps[0]
      return {
        tabBg,
        ...config
      }
    },
    bgStyle() {
      let style = []
      // #ifdef MP-SALE || MP-DISTRIBUTION
      style.push(`background-image: url(${this.couponHeadBg})`)
      // #endif
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      style.push(`background-color: ${hex2rgb(this.themeInfo.color, 0.8)}`)
      style.push(`width: 700rpx`)
      style.push(`height: 230rpx`)
      style.push(`margin: 10rpx auto 0`)
      // } else {
      //   style.push(`background-image: url(${this.couponHeadBg})`)
      // }
      // #endif
      return style.join(';')
    },
    calcActiveColor() {
      let color = this.activeColor
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      color = this.themeInfo.color
      // }
      // #endif
      return color
    },
    calcOperateBgColor() {
      let color = this.operateBgColor
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      color = this.themeInfo.color
      // }
      // #endif
      return color
    },
    secondMenuStyle() {
      let style = []
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      style.push(`right: 0`)
      // }
      // #endif
      return style.join(';')
    }
  },
  mounted() {
    // 默认产品
    this.activeTabIndex = 1
  },
  methods: {
    // 切换来源
    handleTabChange() {
      const value = this.activeTab[this.activeTabIndex].value
      this.$emit('change', value)
    },
    dropCouponList(info) {
      if (info.path) {
        uni.navigateTo({ url: info.path })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon-head {
  position: relative;
  // background-size: 724rpx auto;
  // background-repeat: no-repeat;
  // background-position: center top;
  .current-wrap {
    position: relative;
    z-index: 1;
    width: 724rpx;
    height: 240rpx;
    margin: 0 auto;
    background-size: 100% 100%;
    color: #fff;
    overflow: hidden;
    border-radius: 20rpx;
    .coupon-num {
      // padding: 54rpx 78rpx;
      padding-left: 70rpx;
      .num {
        line-height: 90rpx;
        font-size: 60rpx;
      }
    }
  }
  .second-menu {
    position: absolute;
    right: 15rpx;
    top: 54rpx;
    .operate-btn {
      border-radius: 24rpx 0rpx 0rpx 24rpx;
      height: 48rpx;
      padding-left: 20rpx;
    }
  }
}
</style>
