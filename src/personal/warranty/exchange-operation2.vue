<template>
  <view class="container">
    <!-- 旧产品信息（仅上一页携带有效数据时展示） -->
    <view v-if="oldProduct.codestr" class="info-content">
      <view class="block block--single">
        <view class="section">
          <view class="title bg mb-30">
            旧产品信息
            <text class="primary-color fw-normal">（待换新）</text>
          </view>
          <view v-for="(row, idx) in oldProductFields" :key="'old-' + idx" class="row flex fs-28 mt-20">
            <view class="left">{{ row.label }}</view>
            <view class="right flex flex-1" :class="row.className">{{ getFieldValue(oldProduct, row.prop) }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 新产品信息 -->
    <view v-if="oldProduct.codestr" class="info-content mb-50">
      <view class="block block--single">
        <view class="section mt-10">
          <view class="flex flex-middle">
            <view class="input-content input-content-border">
              <input
                v-model.trim="newCode"
                class="input-check"
                :class="{ 'input-check-empty': !newCode }"
                type="text"
                placeholder="请输入SN码或质保码ID" 
                maxlength="50"  
              />
              <text
                v-show="newCode"
                class="iconfont icon-close-circle input-clear c-9 fs-40"
                @click.stop="newCode = ''"
              />
              <text class="iconfont icon-saoyisaoicon" @click="handleScan"></text>
            </view>
            <view class="check-btn ml-20" @click="validateNewProduct(false)">查询</view>
          </view>

          <!-- 新产品校验结果 -->
          <view
            v-if="validateResult && validateResult.newproduct && validateResult.newproduct.codestr"
            class="validate-result mt-40"
          >
            <view class="section section--sep">
              <view class="flex flex-middle mb-30 mt-30 fs-32">
                <view class="title bg">新产品校验结果</view>
                <view v-if="canExchange" class="success-color ml-10">（可换新）</view>
              </view>
              <view v-if="validateResult.newproduct.haslabelreplacement" class="label-replace-tip mt-30 mb-30">
                <text class="label-replace-tip__text">该产品曾补发新标签，已为您匹配当前有效标签信息。</text>
              </view>
              <view v-for="(row, idx) in validateResultFields" :key="'validate-' + idx" class="row flex fs-28 mt-20">
                <view class="left">{{ row.label }}</view>
                <view class="right flex flex-1 right--cell" :class="row.className">
                  <text>{{ getFieldValue(validateResult.newproduct, row.prop) }}</text>
                </view>
              </view>
            </view>
            <!-- 换新须知 -->
            <view v-if="canExchange" class="block--notice br-10 fs-24 mt-30">
              <view class="notice-title flex flex-middle mb-10">
                <i class="iconfont fs-22 icon-shibaiicon mr-10"></i>
                <view class="fw-bold">换新须知</view>
              </view>
              <view class="notice-item">1.换新后新产品营销码将失效（无法领奖）</view>
              <view class="notice-item">2.质保期将沿用旧产品的保修记录</view>
              <view class="notice-item">3.换新操作不可撤销</view>
            </view>
          </view>
          <!-- 错误提示（有新产品数据但不可换新时） -->
          <view v-if="validateResult.errorprompt && !canExchange" class="tip-row tip-row--bottom mt-40">
            <i class="iconfont icon-shibaiicon fs-40 mb-20"></i>
            {{ validateResult.errorprompt }}
          </view>
        </view>
      </view>
    </view>

    <!-- 底部留白，避免内容被固定按钮遮挡 -->
    <view class="bottom-footer-gap mt-30"></view>

    <!-- 确认换新按钮（固定底部） -->
    <button
      class="primary-btn fixed-bottom fixed-wide"
      :class="{ disabled: !canSubmit }"
      hover-class="button-action"
      @tap="canSubmit && confirmExchange()"
    >
      确认换新
    </button>

    <common-popup
      v-model="showConfirmPopup"
      type="confirm"
      title="确认换新"
      confirm-text="确定"
      cancel-text="取消"
      @confirm="onConfirmExchange"
    >
      <view class="confirm-popup-content">
        {{ `确认将旧产品【${oldProduct.codestr}】换新为新产品【${validateResult.newproduct.codestr}】？` }}
        <view class="block--notice mt-30 p-20">换新后新产品营销码将失效，质保期沿用旧产品记录，操作不可撤销。</view>
      </view>
    </common-popup>
  </view>
</template>

<script>
import { apiValidateNewProduct, apiExecuteExchange } from 'packages/api/warranty'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'

const STORAGE_KEY_OLD_PRODUCT = 'WARRANTY_EXCHANGE_OLD_PRODUCT'
const STORAGE_KEY_EXCHANGE_SUCCESS = 'WARRANTY_EXCHANGE_SUCCESS_RESULT'
const v = val => val || '-'

export default {
  name: 'ExchangeOperation2',
  components: { CommonPopup },
  data() {
    return {
      oldProduct: {},
      newCode: '',
      validateResult: null,
      submitting: false,
      showConfirmPopup: false
    }
  },
  computed: {
    oldProductFields() {
      return [
        { label: '产品名称', prop: 'goodsname' },
        { label: '产品编码', prop: 'goodsno' },
        { label: 'SN码', prop: 'smallserialnumber' },
        { label: '质保码ID', prop: 'codestr' },
        { label: '保修期', prop: 'warrantyrange' },
        { label: '剩余保修期', prop: 'remainingdays', className: 'primary-color' }
      ]
    },
    validateResultFields() {
      return [
        { label: '产品名称', prop: 'goodsname' },
        { label: '产品编码', prop: 'goodsno' },
        { label: 'SN码', prop: 'smallserialnumber' },
        { label: '质保码ID', prop: 'codestr' },
        { label: '扫码状态', prop: 'isscanned', className: 'fw-bold' }
      ]
    },
    canExchange() {
      return !!(this.validateResult && this.validateResult.canexchange)
    },
    canSubmit() {
      return this.canExchange && !this.submitting
    }
  },
  onLoad() {
    const raw = uni.getStorageSync(STORAGE_KEY_OLD_PRODUCT)
    if (raw) {
      const data = JSON.parse(raw)
      uni.removeStorageSync(STORAGE_KEY_OLD_PRODUCT)
      this.oldProduct = { ...data }
    } else {
      uni.navigateBack()
    }
  },
  onHide() {
    uni.removeStorageSync(STORAGE_KEY_OLD_PRODUCT)
  },
  methods: {
    warrantyrange(data) {
      const s = data.warrantystarttime
      const e = data.warrantyendtime
      if (!s && !e) return '-'
      return (s || '') + '~' + (e || '')
    },
    getFieldValue(data, prop) {
      const val = data[prop]
      switch (prop) {
        case 'isscanned':
          return val ? '已扫码' : '未扫码'
        case 'remainingdays':
          return (val ?? 0) + '天'
        case 'warrantyrange':
          return this.warrantyrange(data)
        default:
          return v(val)
      }
    },
    handleScan() {
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode'],
        success: res => {
          const result = (res.result || '').trim()
          if (!result) return this.$msg('扫码失败，请重试')
          this.validateNewProduct(true, result)
        },
        fail: () => this.$msg('扫码失败，请重试')
      })
    },
    async validateNewProduct(fromScan, scanResult = '') {
      const newCode = fromScan ? (scanResult || '').trim() : this.newCode.trim()
      if (!newCode) return this.$msg('请输入新产品的SN码或质保码ID')
      this.validateResult = null
      const res = await apiValidateNewProduct({
        oldcode: this.oldProduct.smallserialnumber || '',
        newcode: newCode
      })
      if (res.return_code === 0 && res.return_data) {
        const d = this.$toLowerKey(res, true)
        const data = d.return_data
        this.validateResult = data
        if (fromScan) {
          const codestr = data && data.newproduct && data.newproduct.codestr
          this.newCode = codestr || scanResult
        }
      }
    },
    confirmExchange() {
      if (!this.canSubmit) return
      this.showConfirmPopup = true
    },
    async onConfirmExchange() {
      const oldSn = this.oldProduct.smallserialnumber || ''
      const newSn = this.validateResult.newproduct.smallserialnumber || ''
      this.showConfirmPopup = false
      this.submitting = true
      try {
        const apiRes = await apiExecuteExchange({
          oldcode: oldSn,
          newcode: newSn
        })
        if (this.$ck(apiRes, true)) {
          this.$msg('换新成功', { icon: 'success' })
          const d = this.$toLowerKey(apiRes, true)
          const data = d.return_data || {}
          uni.setStorageSync(STORAGE_KEY_EXCHANGE_SUCCESS, JSON.stringify(data))
          setTimeout(() => {
            uni.reLaunch({
              url: '/packages/src/personal/warranty/exchange-success2'
            })
          }, 1500)
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/warranty-common.scss';

.info-content {
  padding-bottom: 0;
}

.block--notice {
  background: #f5f5f5;
  color: #666666;
  padding: 20rpx;

  .notice-item {
    margin-bottom: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.primary-btn {
  border-radius: 45px;
}
.check-btn {
  width: 160rpx;
  height: 100rpx;
  border-radius: 50rpx;
}
</style>
