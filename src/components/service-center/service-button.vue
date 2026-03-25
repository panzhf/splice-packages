<template>
  <view>
    <view v-if="showCustomerCenter && showBtn" @tap="show">
      <slot />
    </view>
    <u-popup v-model="showPopup" mode="bottom" border-radius="30" @close="close">
      <view class="service fs-30 c-2 tx-c">
        <view v-if="info.expertphone" class="item" @tap="handleCall">官方服务热线：{{ info.expertphone }}</view>
        <view v-if="info.expertlink" class="item" @tap="handleWebview">远程系统专家</view>
        <view class="blank" />
        <view class="cancel c-6 fs-32" @tap="close">取消</view>
      </view>
    </u-popup>
  </view>
</template>
<script>
import { apiServiceConfig } from 'packages/api/service.js'
export default {
  props: {
    showBtn: {
      //是否需要显示按钮
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showPopup: false, //是否显示弹窗
      info: {}, //客服中心信息
      showCustomerCenter: false //接口返回是否显示客服中心
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      let res = await apiServiceConfig()
      if (this.$ck(res, true)) {
        const { showcustomercenter, customercenterinfo } = res.return_data
        this.showCustomerCenter = showcustomercenter
        this.showCustomerCenter && (this.info = customercenterinfo)
        this.$emit('returnInfo', this.showCustomerCenter)
      }
    },
    handleWebview() {
      uni.setStorageSync('webViewPath', this.info.expertlink || '')
      uni.navigateTo({
        url: '/packages/src/rule/webview'
      })
      this.close()
    },
    handleCall() {
      uni.makePhoneCall({
        phoneNumber: this.info.expertphone
      })
      this.close()
    },
    show() {
      this.showPopup = true
    },
    close() {
      this.showPopup = false
    }
  }
}
</script>

<style lang="scss" scoped>
.service {
  padding: 10rpx 0;
  background-color: #fff;
  .item {
    margin: 0 30rpx;
    padding: 40rpx;
    &:nth-child(2) {
      // #ifdef MP-MEMBER
      border-top: 1rpx solid #e4e4e4;
      // #endif
      // #ifndef MP-MEMBER
      @include border-top(#e4e4e4);
      // #endif
    }
  }
  .cancel {
    margin: 0 30rpx;
    padding: 30rpx;
  }
  .blank {
    height: 20rpx;
    background: #f5f5f5;
  }
}
</style>

