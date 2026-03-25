<template>
  <view class="order-item" :style="themeVars" @tap="handleDetail">
    <view class="flex">
      <image class="img shrink-0" :src="info.productimg" mode="scaleToFill" />
      <view class="ml-20 flex-1 fs-28">
        <view class="flex flex-middle">
          <view class="lable">单号</view>
          <view class="info flex flex-1 flex-middle flex-between">
            <view class="value">{{ info.orderno }}</view>
          </view>
        </view>
        <view class="flex flex-middle mt-10">
          <view class="lable">提报时间</view>
          <view class="info flex-1">{{ info.addtime }}</view>
        </view>
        <view class="flex flex-middle mt-10">
          <view class="lable">数量</view>
          <view class="info">{{ info.totaldeliveryamount }}</view>
        </view>
      </view>
    </view>

    <!-- #ifdef MP-RETAIL -->
    <view class="iconfont iconjiantou1 fs-20" />
    <!-- #endif -->
    <!-- #ifdef MP-SALE -->
    <view class="iconfont iconjiantou fs-20 ml-10" />
    <!-- #endif -->
    <view class="footer mt-30 flex flex-middle flex-between">
      <view class="status">
        状态：
        <text :class="{ wait: [0, 1, 4].includes(info.orderstatus), err: info.orderstatus === 3 }">
          {{ info.orderstatus | statusFilter }}
        </text>
      </view>
      <view class="flex flex-middle">
        <button v-if="info.orderstatus === 0" class="primary-btn plain round size-mini" @tap.stop="handleCancel">
          取 消
        </button>
        <!-- #ifdef MP-SALE -->
        <!-- 厂家业务员才有权限 -->
        <template v-if="isSale && info.orderstatus === 1">
          <button class="primary-btn size-mini plain" @tap.stop="handleAudit(0)">审核不通过</button>
          <button class="primary-btn size-mini ml-10" @tap.stop="handleAudit(1)">审核通过</button>
        </template>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>
<script>
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
import { statusFilterMixin } from '../mixins'
export default {
  mixins: [
    statusFilterMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  // #ifdef MP-SALE
  computed: {
    isSale() {
      // 厂家业务员
      return this.$store.state.userinfo.dealerid === 0
    }
  },
  // #endif
  methods: {
    handleAudit(state) {
      this.$emit('audit', state, {
        orderno: this.info.orderno,
        activityid: this.info.activityid,
        storeid: this.info.storeid
      })
    },
    handleDetail() {
      if (this.info.orderstatus === 0) {
        // 待提交订单 跳转到申请页面
        let params = `activityid=${this.info.activityid}&orderno=${this.info.orderno}`
        // #ifdef MP-SALE
        params += `&storeid=${this.info.storeid}&storename=${encodeURIComponent(this.info.storename)}`
        // #endif
        this.$navPage(`/packages/src/pages/group-buy/apply?${params}`)
        return
      }
      let params = `orderno=${this.info.orderno}`
      // #ifdef MP-SALE
      params += `&storeid=${this.info.storeid}`
      // #endif
      this.$navPage(`/packages/src/pages/group-buy/order-detail?${params}`)
    },
    handleCancel() {
      let params = {
        orderno: this.info.orderno,
        activityid: this.info.activityid
      }
      // #ifdef MP-SALE
      params.storeid = this.info.storeid
      // #endif
      this.$emit('cancel', params)
    }
  }
}
</script>
<style lang="scss" scoped>
.order-item {
  position: relative;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  padding: 30rpx 20rpx 24rpx 20rpx;
  /* #ifdef MP-SALE */
  box-shadow: 0 0 6rpx 0 rgba(50, 70, 195, 0.1);
  /* #endif */
  .iconfont {
    position: absolute;
    right: 20rpx;
    top: 100rpx;
  }
  .img {
    width: 120rpx;
    height: 120rpx;
  }
  .lable {
    width: 140rpx;
    color: #666;
  }
  .info {
    color: #333;
  }
  .wait {
    /* #ifdef MP-RETAIL */
    color: var(--theme-color, $uni-color-primary);
    /* #endif */
    /* #ifdef MP-SALE */
    color: #ff960d;
    /* #endif */
  }
  .err {
    color: #ff5c53;
  }
  .footer {
    padding-top: 24rpx;
    /* #ifdef MP-SALE */
    border-top: 1rpx solid #e4e8fe;
    /* #endif */
    /* #ifdef MP-RETAIL */
    border-top: 1rpx solid #e5e5e5;
    /* #endif */
  }
}
</style>
