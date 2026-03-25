<template>
  <view class="sales-verification" :style="themeVars">
    <!-- 顶部提示 -->
    <view class="container-header bg-tip">
      <view class="warm-tip fs-24">订单提交成功并审核通过后，红包金额将直接打到当前登录微信钱包</view>
    </view>

    <!-- 进度条 -->
    <ProgressSteps
      :current-step="currentStep"
      :forward-to-group="hasForwardToGroup"
      :orderstatus="orderInfo.orderstatus"
    />
    <view v-if="orderInfo.orderstatus === 4" class="award-wrapper">
      <view class="flex flex-middle mb-10 fw-bold">
        获得红包：
        <text class="primary-color total-amount flex-1 fs-32">￥{{ orderInfo.totalamount | cashFixedTwo }}</text>
      </view>
      <view class="c-6 fs-24">
        <text>审核时间：</text>
        <text>{{ orderInfo.audittime }}</text>
      </view>
      <view v-if="orderInfo.awardsendtime" class="c-6 fs-24">
        <text>奖励发放时间：</text>
        <text>{{ orderInfo.awardsendtime }}</text>
      </view>
    </view>
    <view v-if="orderInfo.orderstatus === 5" class="award-wrapper">
      <view class="flex flex-middle fw-bold">
        审核详情：
        <text class="error-color total-amount flex-1">不通过</text>
      </view>
      <view class="c-6 fs-24">
        <text>原因：</text>
        <text>{{ orderInfo.failreason }}</text>
      </view>
      <view class="c-6 fs-24">
        <text>审核时间：</text>
        <text>{{ orderInfo.audittime }}</text>
      </view>
    </view>
    <view class="step-content">
      <!-- 产品选择 -->
      <OrderItem class="mb-20" :order="orderInfo" :mode="currentStep === 1 ? 'edit' : 'sold'" @change="handleChange">
        <view slot="head-left" class="fs-30 product-header fw-bold">
          <template v-if="currentStep === 1">
            <text class="required">*</text>
            选择售出商品
          </template>
          <template v-else>
            <text>售出商品</text>
          </template>
        </view>
      </OrderItem>

      <!-- 上传凭证 -->
      <UploadVoucher
        v-if="currentStep === 1"
        v-model="voucherImages"
        :required="activityInfo.uploadproof === 2"
        :max-length="3"
      />
    </view>

    <!-- 底部占位 -->
    <view :style="{ height: currentStep !== 1 ? '190rpx' : '130rpx' }" />

    <!-- 底部操作栏 -->
    <view v-if="![4, 5].includes(orderInfo.orderstatus)" class="bottom-bar">
      <view v-if="currentStep !== 1" class="order-info bg-tip flex flex-middle pl-30 pr-30">
        <view class="estimated-income flex-1 fs-28 fw-bold">
          预计收入：
          <text class="primary-color fs-28">￥{{ orderInfo.totalamount | cashFixedTwo }}</text>
        </view>
        <view class="submit-time fs-24">提交时间: {{ orderInfo.addtime }}</view>
      </view>
      <view class="flex operate-wrap bg-white flex flex-middle">
        <template v-if="currentStep === 1">
          <text class="c-3 fs-28 fw-bold">红包总金额：</text>
          <text class="primary-color total-amount flex-1">￥{{ totalAmount | cashFixedTwo }}</text>
        </template>
        <button v-if="currentStep === 1" class="primary-btn round" @click="handleSubmit">提交</button>
        <button v-else-if="orderInfo.orderstatus === 1" class="primary-btn round flex-1" @click="handleShowShare">
          转发到微信群聊
        </button>
        <button v-else-if="orderInfo.orderstatus === 3" class="primary-btn disabled round flex-1">审核中</button>
      </view>
    </view>

    <!-- 分享弹窗 -->
    <share-popup
      v-model="showSharePopup"
      :img-src="shareShowImgSrc"
      :order-info="orderInfo"
      @share="handleGetShareAward"
    />
    <!-- 分享画布 -->
    <canvas
      id="shareCanvas"
      canvas-id="shareCanvas"
      class="share-canvas"
      :style="{
        borderRadius: '10rpx 10rpx 0 0',
        height: canvasHeight,
        width: canvasWidth
      }"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import ProgressSteps from './comps/progress-steps.vue'
import UploadVoucher from './comps/upload-voucher.vue'
import OrderItem from './comps/order-item.vue'
import SharePopup from './comps/share-popup.vue'
import {
  apiStoreSalesGiftGetOrderDetail,
  apiStoreSalesGiftSubmitOrder,
  apiStoreSalesGiftGetStoreGoodsStocks
} from 'packages/api/StoreSalesGift'
import shareOrderMixin from './mixins/share-order'
import subscribeMsgMixin, { noticeMixin, noticeMixin2 } from 'packages/mixins/subscribe-msg'
import { cashFixedTwo } from 'packages/filters'

export default {
  components: {
    ProgressSteps,
    UploadVoucher,
    OrderItem,
    SharePopup
  },
  filters: {
    cashFixedTwo
  },
  mixins: [shareOrderMixin, subscribeMsgMixin, noticeMixin, noticeMixin2],
  data() {
    return {
      activityid: '',
      orderNo: '',
      currentStep: 1,
      selectedProducts: [],
      voucherImages: [],
      orderInfo: {},
      showSharePopup: false,
      shareShowImgSrc: '',
      templateIds: '',
      activityInfo: uni.getStorageSync('currentActivityInfo') || {}
    }
  },
  computed: {
    totalAmount() {
      return (
        this.orderInfo?.orderdetails
          ?.filter(p => p.isChecked)
          .reduce((total, product) => {
            const reward = parseFloat(product.unitreward) || 0
            const quantity = product.quantity || 0
            return total + reward * quantity
          }, 0)
          .toFixed(2) || 0
      )
    },
    hasForwardToGroup() {
      return this.activityInfo.forwardtogroup || this.orderInfo.forwardtime || this.orderInfo.orderstatus === 1
    }
  },
  async onLoad(options) {
    // 当 activityid 有值的时候，请求门店可提交商品列表
    if (options.activityid) {
      this.currentStep = 1
      uni.setNavigationBarTitle({
        title: '售出核销'
      })
      this.activityid = options.activityid
      this.getStoreGoodsStocks(options.activityid)
      this.subscribeSettings = await this.initNotice(550)
      this.subscribeSettings.isopen && this.fetchNotice(10)
    } else if (options.orderno) {
      this.orderNo = options.orderno
      uni.setNavigationBarTitle({
        title: '订单详情'
      })
      this.getOrderDetail()
    }
  },
  onUnload() {
    uni.removeStorageSync('currentActivityInfo')
  },
  methods: {
    handleChange(val, index, prop) {
      this.orderInfo.orderdetails[index][prop] = val
    },
    // 获取订单详情
    async getOrderDetail() {
      const res = await apiStoreSalesGiftGetOrderDetail({ orderno: this.orderNo })
      if (this.$ck(res)) {
        const data = res.return_data
        this.orderInfo = data
        this.orderDetails = data.orderdetails || []
        // 1-待转发、3-待审核、4-审核通过、5-审核不通过
        const stepMap = !this.hasForwardToGroup
          ? {
              3: 2,
              4: 3,
              5: 3
            }
          : {
              1: 2,
              3: 3,
              4: 4,
              5: 4
            }
        this.currentStep = stepMap[data.orderstatus] || 1
      }
    },

    // 获取门店可提交商品及库存列表
    async getStoreGoodsStocks(activityId) {
      const res = await apiStoreSalesGiftGetStoreGoodsStocks({ activityid: activityId })
      if (this.$ck(res)) {
        let orderdetails = res.return_data.results || []
        orderdetails = orderdetails.map(item => {
          item.isChecked = false
          item.quantity = 0
          return item
        })
        this.orderInfo = {
          orderdetails
        }
      }
    },

    // 显示提示信息
    showToast(connect) {
      uni.showToast({
        title: connect,
        duration: 1500,
        mask: true,
        icon: 'none'
      })
    },
    async handleSubmit() {
      // 验证必填项 - 按照指定顺序：是否勾选产品 → 是否选择数量 → 是否上传销售凭证

      // 1. 检查是否勾选产品
      const hasCheckedProduct = this.orderInfo.orderdetails?.some(item => item.isChecked)
      if (!hasCheckedProduct) {
        this.showToast('请选择售出商品')
        return
      }

      // 2. 检查是否选择数量
      const hasInvalidQuantity = this.orderInfo.orderdetails?.some(item => item.isChecked && !item.quantity)
      if (hasInvalidQuantity) {
        this.showToast('请选择商品数量')
        return
      }

      // 3. 检查是否上传销售凭证
      if (this.voucherImages.length === 0 && this.activityInfo.uploadproof === 2) {
        this.showToast('请上传销售凭证')
        return
      }

      // 构建提交数据
      const submitData = {
        activityid: this.activityid,
        orderno: this.orderNo,
        orderdetails: this.orderInfo.orderdetails.filter(item => item.isChecked),
        proofimages: this.voucherImages
      }
      // 消息订阅
      let subscriberesult = {}
      if (this.subscribeSettings.isopen) {
        subscriberesult = await this.requestSubscribeMsg([this.noticeTempId])
      }

      const res = await apiStoreSalesGiftSubmitOrder(submitData)
      if (this.$ck(res)) {
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        })
        // 进入下一步
        this.orderNo = res.return_data.orderno
        this.reportNotice({
          subscriberesult,
          type: 10,
          orderid: this.orderNo
        })
        // 重新获取订单详情
        uni.setNavigationBarTitle({
          title: '订单详情'
        })
        this.getOrderDetail()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-verification {
  min-height: 100vh;
  padding-top: 60rpx;

  background-color: $uni-bg-color-grey;
}
.bg-tip {
  background: #fff5f1;
}
.container-header {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;

  width: 100%;
  .warm-tip {
    padding: 15rpx 0;

    text-align: center;

    color: #ff5e33;
    background: #fff5f1;

    font-weight: 500;
    line-height: 40rpx;
  }
}

.alert-banner {
  padding: 20rpx 30rpx;

  text-align: center;

  color: #fff;
  background: #ff5235;
}

.award-wrapper {
  margin: 0 20rpx 20rpx;
  padding: 20rpx 30rpx;

  border-radius: 10rpx;
  background: #fff;
  line-height: 1.8;
}

.step-content {
  .product-header {
    margin-bottom: -10rpx;
  }
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  .order-info {
    height: 60rpx;
  }

  .operate-wrap {
    height: 130rpx;
    padding: 0 30rpx;
    .total-amount {
      font-size: 48rpx;
    }

    button {
      min-width: 200rpx;
    }
  }
}

.share-canvas {
  position: fixed;
  z-index: -1;
  left: -99999px;

  width: 620px;

  pointer-events: none;

  opacity: 0;
  border: 1px solid #c3c3c3;
}
.required {
  margin-right: 4rpx;

  color: #ff5235;
}
</style>
