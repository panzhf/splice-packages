<template>
  <view class="safe">
    <view v-if="showLogout" class="item bd-e flex flex-middle" @tap="handleNavigation">
      <view class="flex-1 name">账号注销</view>
      <u-icon name="arrow-right" color="#999" size="24" />
    </view>
    <view class="item bd-e flex flex-middle" @tap="handleLinkRule(userRuleNo)">
      <view class="flex-1 name">用户协议</view>
      <u-icon name="arrow-right" color="#999" size="24" />
    </view>
    <view class="item bd-e flex flex-middle" @tap="handleLinkRule(privacyRuleNo)">
      <view class="flex-1 name">隐私政策</view>
      <u-icon name="arrow-right" color="#999" size="24" />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
// #ifdef MP-MEMBER
import { getExtConfig } from '@/config'
import { specialLogout } from 'packages/config/custom'
// #endif
import ruleConfigMixin from 'packages/utils/rules-config'
export default {
  mixins: [ruleConfigMixin],
  data() {
    return {
      showLogout: true
    }
  },
  // #ifdef MP-MEMBER
  onLoad() {
    this.showLogout = !specialLogout.includes(this.$toLowerKey(getExtConfig()).memberlogin)
  },
  // #endif
  onShow() {
    if (!uni.getStorageSync('token')) {
      let url = '/pages/login/index'
      // #ifdef MP-MEMBER
      url = '/pages/index/index'
      // #endif
      uni.reLaunch({
        url
      })
    }
  },
  methods: {
    // 跳转规则页面
    handleLinkRule(applyNo) {
      uni.navigateTo({
        url: `/packages/src/rule/webview?pageType=rule&applyNo=` + applyNo
      })
    },
    handleNavigation() {
      let url = `/packages/src/personal/safe/logoff`
      uni.navigateTo({
        url
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/safe.scss';
.safe {
  background-color: #fff;
  font-size: 30rpx;
  .item {
    height: 120rpx;
    margin-left: 30rpx;
    padding-right: 30rpx;
    .name {
      color: #2a2a2a;
      font-weight: 500;
    }
  }
}
</style>
