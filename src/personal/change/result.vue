<template>
  <view class="bg-f page-result" :style="themeVars">
    <view class="change-header tx-c">
      <view class="primary-icon">
        <i class="icon iconfont iconpack-gou" />
      </view>
      <view class="c-0 fs-36 fw-bold primary-tips">提现申请成功</view>
      <view class="c-9 fs-30 dec-tips">
        预计24小时内到账，请查收【微信支付】收款通知
        <view>如提现失败则原路退回~</view>
      </view>
    </view>
    <view class="change-detail bg-f">
      <view class="item flex flex-middle fs-26 bd-e">
        <view class="c-6 ub-f1">提现金额：</view>
        <view class="c-3">¥ {{ amount | cashFixedTwo }}</view>
      </view>
      <view class="item flex flex-middle fs-26 bd-e">
        <view class="c-6 ub-f1">提现时间：</view>
        <view class="c-3">
          {{ date }}
        </view>
      </view>
    </view>
    <button class="change-buttton bgc-primary" @tap="back">确定</button>
  </view>
</template>
<script>
import { cashFixedTwo } from 'packages/filters'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  filters: {
    cashFixedTwo
  },
  // #ifndef MP-RETAIL
  mixins: [notThemeMixin],
  // #endif
  data() {
    return {
      date: '',
      amount: ''
    }
  },
  async onLoad(option) {
    this.date = decodeURIComponent(option.date)
    this.amount = option.amount
  },
  methods: {
    back() {
      uni.navigateBack()
    }
  }
}
</script>
<style lang="scss" scoped>
@import './styles/change.scss';
.page-result {
  min-height: 100vh;
}
.change-buttton {
  margin: 60rpx auto 100rpx;
  width: 520rpx;
  height: 90rpx;
  line-height: 90rpx;
  color: #fff;
  border-radius: 45rpx;
  font-weight: 700;
}
.change-detail {
  padding-top: 50rpx;
  .item {
    height: 105rpx;
    margin: 0 30rpx;
  }
}
.change-header {
  .primary-icon {
    padding-top: 80rpx;
    .iconfont.iconpack-gou {
      font-size: 100rpx;
      color: #3daf35;
    }
  }
  .primary-tips {
    padding-top: 50rpx;
  }
  .dec-tips {
    line-height: 40rpx;
    padding: 30rpx 0;
  }
}
</style>
