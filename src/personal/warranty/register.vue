<template>
  <view class="warranty-register-page">
    <view v-if="productInfo.code" class="form-container">
      <!-- 顶部产品信息展示 -->
      <view class="top-product-info">
        <view class="top-info-row">
          <text class="top-info-label">产品名称：</text>
          <text class="top-info-value">{{ productInfo | productNameFilter }}</text>
        </view>
        <view class="top-info-row">
          <text class="top-info-label">产品编号：</text>
          <text class="top-info-value">{{ productInfo | productNoFilter }}</text>
        </view>
        <view class="top-info-row">
          <text class="top-info-label">质保码ID：</text>
          <text class="top-info-value">{{ productInfo.codestr }}</text>
        </view>
      </view>

      <!-- 动态表单字段 -->
      <view class="form-section">
        <warranty-form ref="warrantyForm" :code-id="codeid" @form-ready="onFormReady" />
      </view>

      <!-- 底部留白，避免内容被固定按钮遮挡 -->
      <view class="bottom-footer-gap mt-30" />
    </view>

    <!-- 提交按钮（固定底部）：有表单字段时才显示 -->
    <view v-if="hasFormData" class="submit-btn-fixed-bar">
      <button class="submit-btn flex-1" @click="handleSubmit">提交登记</button>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import WarrantyForm from './components/warranty-form.vue'
import { apiGetWarrantyServiceInfo, apiSubmitWarranty } from 'packages/api/warranty'
import { productNameFilter, productNoFilter } from 'packages/mixins/warranty-product'

export default {
  name: 'WarrantyRegister',
  components: {
    WarrantyForm
  },
  filters: {
    productNameFilter,
    productNoFilter
  },
  data() {
    return {
      codeid: '', // 防伪码
      productInfo: {},
      hasFormData: false, // 是否有表单字段（无表单数据时隐藏提交按钮）
      formSubmitted: false // 是否已提交登记（用于返回拦截）
    }
  },
  onLoad(options) {
    // 获取防伪码参数
    this.codeid = options.codeid || ''
    if (this.codeid) {
      this.initData()
    } else {
      setTimeout(() => {
        this.handleBack(false)
      }, 1500)
    }
  },
  onShow() {
    this.updateBackIntercept()
  },
  onUnload() {
    this.disableBackIntercept()
  },
  methods: {
    // 表单加载完成回调（用于判断是否显示提交按钮）
    onFormReady({ hasFields }) {
      this.hasFormData = !!hasFields
      this.updateBackIntercept()
    },
    // 初始化数据
    initData() {
      apiGetWarrantyServiceInfo({ scanId: this.codeid }).then(res => {
        if (this.$ck(res, true)) {
          const d = this.$toLowerKey(res, true)
          this.productInfo = d.return_data || {}
        }
      }).catch(err => {
        this.$msg(err.return_msg)
      })
      
    },
    // 返回上一页
    handleBack(flag) {
      const scanOptions = uni.getStorageSync('scanOptions')
      if (scanOptions && flag) {
        // 如果存在扫码参数，返回扫码页
        const query = Object.entries(scanOptions)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
        uni.reLaunch({
          url: `/packages/src/scan-templates/transfer?${query}`
        })
      } else {
        // 否则正常返回上一页
        uni.navigateBack()
      }
    },
    // 提交表单
    async handleSubmit() {
      this.$refs.warrantyForm && (await this.$refs.warrantyForm.validate())
      this.submitRegister()
    },
    // 提交登记
    async submitRegister() {
      const formDataArray = this.$refs.warrantyForm.buildSubmitData()
      const params = {
        ScanID: parseInt(this.codeid) || 0,
        FormData: formDataArray
      }

      apiSubmitWarranty(params).then(res => {
        if (this.$ck(res, true)) {
          this.$msg('登记成功', { icon: 'success' })
          this.formSubmitted = true
          this.disableBackIntercept()
          setTimeout(() => {
            this.handleBack(true)
          }, 1500)
        }
      }).catch(err => {
        this.$msg(err.return_msg)
      })
    },
    // 更新返回拦截状态
    updateBackIntercept() {
      const shouldIntercept = this.hasFormData && !this.formSubmitted
      if (shouldIntercept) {
        this.enableBackIntercept()
      } else {
        this.disableBackIntercept()
      }
    },
    // 启用返回拦截
    enableBackIntercept() {
      uni.enableAlertBeforeUnload({
        message: '您的填写内容尚未提交，确认返回？'
      })
    },
    // 禁用返回拦截
    disableBackIntercept() {
      uni.disableAlertBeforeUnload()
    }
  }
}
</script>

<style lang="scss" scoped>
.warranty-register-page {
  min-height: 100vh;
  background-color: $uni-bg-color-grey; 
}

.form-container {
  padding: 20rpx;
}

.top-product-info {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .top-info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    .top-info-label {
      color: #666;
      flex-shrink: 0;
      width: 160rpx;
    }

    .top-info-value {
      color: #333;
      flex: 1;
      word-break: break-all;
      font-weight: 500;
    }
  }
}

.product-info-section {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.form-section {
  background-color: #fff;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-info-section {
  .info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: #666;
      flex-shrink: 0;
      width: 160rpx;
    }

    .info-value {
      color: #333;
      flex: 1;
      word-break: break-all;
    }
  }
}

/* 仅固定到底部，按钮样式保持原样 */
.submit-btn-fixed-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.submit-btn {
  height: 80rpx;
  background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  line-height: 80rpx;
  text-align: center;
  border: none;

  &::after {
    border: none;
  }
}
</style>
