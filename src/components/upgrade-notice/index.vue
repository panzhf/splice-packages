<template>
  <CommonPopup
    v-model="showPopup"
    title="功能升级公告"
    :confirm-text="operateInfo.confirmText"
    cancel-text="我知道了"
    type="confirm"
    @confirm="handleConfirm"
    @cancel="handleStopTipsChange"
  >
    <view class="upgrade-notice" :style="themeVars">
      <view class="text-left mb-20 pl-20 pr-20 fs-32">
        <view>尊敬的用户，您好！</view>
        <view class="content">
          <text>
            为了给您提供更优质的体验，我们对小程序进行了功能优化和升级。将{{ operateInfo.target }}原有的待报销
          </text> 
          <text class="hightlight">【{{ operateInfo.operateTarget || '提领券' }}】</text>
          <text>已全部转化为</text>
          <text class="hightlight">【返货券】</text>
          <text>，后续的报销将通过返货券进行。</text>
        </view>
      </view>
      <u-checkbox v-model="isStopTips" size="32" shape="circle" :active-color="checkboxActiveColor">
        <view class="ml-10 c-6 fs-24">下次不再提醒</view>
      </u-checkbox>
    </view>
  </CommonPopup>
</template>

<script>
import popupMixin from 'packages/mixins/popup'
import CommonPopup from 'packages/components/common-popup/common-popup'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif

export default {
  name: 'UpgradeNotice',
  components: { CommonPopup },
  mixins: [
    popupMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    uuid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isStopTips: false,
      stopUpdateTipsInfo: {},
      operateInfo: {},
      checkboxActiveColor: ''
    }
  },
  mounted() {
    // 初始化提示配置
    this.initOprateInfo()
    this.getUpgradeNoticeConfig()
  },
  methods: {
    initOprateInfo() {
      let info = {}
      // #ifdef MP-SALE
      info = {
        confirmText: '给下级报销',
        path: '/pagesA/sub-expense/index',
        target: '下级'
        // checkboxActiveColor: '#3246C3'
      }
      this.checkboxActiveColor = '#3246C3'
      // #endif
      // #ifdef MP-RETAIL
      info = {
        confirmText: '查看返货券',
        path: '/pages/return-coupon/index',
        target: '您',
        operateTarget: '实物'
        // checkboxActiveColor: '#FF7640'
      }
      // #endif
      // #ifdef MP-DISTRIBUTION
      info = {
        confirmText: '查看返货券',
        path: '/coupon/return-coupon/list',
        target: '您'
        // checkboxActiveColor: '#5D76FF'
      }
      this.checkboxActiveColor = '#5D76FF'
      // #endif
      this.operateInfo = info
    },
    getUpgradeNoticeConfig() {
      this.stopUpdateTipsInfo = this.getStopUpdateTipsInfo()
      if (this.stopUpdateTipsInfo[this.uuid]) {
        // 已经提示过，勾选过不再提示
        return
      }
      // 获取配置,看是否需要提示
      this.fetchAdConfig()
    },
    // 获取本地存储的提示信息
    getStopUpdateTipsInfo() {
      const storedInfo = uni.getStorageSync('stopUpdateTipsMap')
      return storedInfo ? JSON.parse(storedInfo) : {}
    },
    async fetchAdConfig() {
      const needUpgradeTip = await this.$store.dispatch('upgradeTip/updateNeedUpgradeTip')
      if (needUpgradeTip) {
        // #ifdef MP-RETAIL
        const transfertypename = this.$store.state.upgradeTip.transfertypename 
        if (transfertypename) {
          this.operateInfo.operateTarget = transfertypename
        }
        this.$nextTick(() => {
          this.checkboxActiveColor = this.themeInfo.color || '#FF7640'
        })
        // #endif
        this.showTips()
      }
    },

    handleConfirm() {
      // 跳转路径
      if (this.operateInfo.path) {
        uni.navigateTo({ url: this.operateInfo.path })
      }
      this.handleStopTipsChange()
      this.showPopup = false
    },
    handleStopTipsChange() {
      if (this.isStopTips) {
        this.stopUpdateTipsInfo[this.uuid] = true
        uni.setStorageSync('stopUpdateTipsMap', JSON.stringify(this.stopUpdateTipsInfo))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.upgrade-notice {
  margin-bottom: -20rpx;
  margin-top: -20rpx;
  .content {
    text-indent: 70rpx;
    display: inline-block;
  }
  .hightlight {
    // color: $uni-color-primary;
    color: var(--theme-color, $uni-color-primary);
  }
}
</style>
