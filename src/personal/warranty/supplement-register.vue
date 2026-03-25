<template>
  <view class="container" :style="themeVars">
    <view class="info-content">
      <view class="block block--single">
        <view class="section">
          <view class="title bg mb-30">产品信息</view>
          <view
            v-for="(row, idx) in productFields"
            :key="'p-' + idx"
            class="row flex fs-28"
            :class="{ 'mt-20': idx > 0 }"
          >
            <view class="left">{{ row.label }}</view>
            <view class="right flex flex-1">{{ getValue(product, row.prop) }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="info-content info-content--form mb-30">
      <view class="block block--single">
        <view class="section">
          <view class="title bg">补登记信息</view>
          <view class="form-box">
            <info-cell :verify-color="themeInfo.color" is-middle is-link :is-needed="true">
              <view slot="left" class="c-6 left-wrap">购买日期</view>
              <picker
                slot="right"
                class="date-picker"
                mode="date"
                :value="form.purchasedate"
                :end="today"
                @change="onPickDate"
              >
                <view class="flex">
                  <view class="flex-1 ellipsis-2 tx-l c-3" :class="{ 'c-6': !form.purchasedate }">
                    {{ form.purchasedate || '选择日期' }}
                  </view>
                </view>
              </picker>
            </info-cell>

            <info-cell
              :verify-color="themeInfo.color"
              is-middle
              is-input
              :is-needed="true"
              cell-style="padding-right:0;"
            >
              <view slot="left" class="c-6 left-wrap">保修天数</view>
              <view slot="right" class="flex flex-middle c-3">
                <input
                  v-model.trim="form.warrantydays"
                  type="number"
                  class="input flex-1"
                  maxlength="3"
                  placeholder="请输入"
                  placeholder-class="placeholder"
                />
              </view>
            </info-cell>

            <info-cell :verify-color="themeInfo.color" is-middle is-input :is-needed="true">
              <view slot="left" class="c-6 left-wrap">姓名</view>
              <input
                slot="right"
                v-model.trim="form.username"
                type="text"
                class="input"
                maxlength="8"
                placeholder="请输入"
                placeholder-class="placeholder"
              />
            </info-cell>

            <info-cell :verify-color="themeInfo.color" is-middle is-input :is-needed="true">
              <view slot="left" class="c-6 left-wrap">手机号</view>
              <input
                slot="right"
                v-model.trim="form.mobile"
                type="number"
                class="input"
                maxlength="11"
                placeholder="请输入"
                placeholder-class="placeholder"
              />
            </info-cell>

            <info-cell
              :verify-color="themeInfo.color"
              :is-middle="false"
              :is-needed="false"
              :is-show-line="false"
              cell-style="align-items: flex-start; padding-top: 28rpx; padding-bottom: 28rpx;"
            >
              <view slot="left" class="c-6 left-wrap">购买凭证</view>
              <view slot="right" class="upload-wrap upload-wrap--inline">
                <UploadImages v-model="form.voucherimageurls" :max-length="3" :size="120" multiple />
              </view>
            </info-cell>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-footer-gap mt-30"></view>

    <button
      class="primary-btn fixed-bottom fixed-wide"
      :class="{ disabled: !canSubmit }"
      hover-class="button-action"
      @tap="canSubmit && submit()"
    >
      提交补登记
    </button>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import InfoCell from 'packages/components/info-cell/info-cell'
import UploadImages from 'packages/components/upload/upload'
import { apiSupplementRegister } from 'packages/api/warranty'

const STORAGE_KEY_PRODUCT = 'WARRANTY_SUPPLEMENT_PRODUCT'

export default {
  name: 'WarrantySupplementRegister',
  components: { InfoCell, UploadImages },
  data() {
    return {
      product: {},
      submitting: false,
      form: {
        purchasedate: '',
        warrantydays: '',
        username: '',
        mobile: '',
        voucherimageurls: []
      }
    }
  },
  computed: {
    today() {
      return dayjs().format('YYYY-MM-DD')
    }, 
    productFields() {
      return [
        { label: '产品名称', prop: 'goodsname' },
        { label: '产品编码', prop: 'goodsno' },
        { label: '流水号', prop: 'smallserialnumber' },
        { label: '质保码ID', prop: 'codestr' }
      ]
    },
    canSubmit() {
      return !this.submitting
    }
  },
  onLoad() {
    const raw = uni.getStorageSync(STORAGE_KEY_PRODUCT)
    if (!raw) return uni.navigateBack()
    const data = JSON.parse(raw)
    uni.removeStorageSync(STORAGE_KEY_PRODUCT)
    this.product = { ...data } 
    // rulewarrantydays 过大时仅展示到 999（输入框只允许最多 3 位）
    const ruleDays = Number(this.product.rulewarrantydays)
    this.form.warrantydays = Number.isFinite(ruleDays) && ruleDays > 0 ? Math.min(ruleDays, 999) : 365
  },
  onHide() {
    uni.removeStorageSync(STORAGE_KEY_PRODUCT)
  },
  methods: {
    getValue(obj, prop) {
      const v = obj && obj[prop]
      return v || '-'
    },
    onPickDate(e) {
      this.form.purchasedate = e.detail.value
    },
    validate() {
      const { purchasedate, warrantydays, username, mobile } = this.form
      if (!purchasedate) return '请选择购买日期'
      if (dayjs(purchasedate).isAfter(dayjs(), 'day')) return '购买日期不可晚于当前日期'

      const days = Number(warrantydays)
      if (!Number.isFinite(days) || days <= 0) return '请输入正确的保修天数'
      const maxDays = Number(this.product.maxsupplyregisterdays)
      if (maxDays > 0 && days > maxDays) return `保修天数不得超过${maxDays}天`

      if (!String(username).trim()) return '请输入姓名'
      const phone = String(mobile).trim()
      if (!phone) return '请输入手机号'
      if (this.$u?.test?.mobile && !this.$u.test.mobile(phone)) return '手机号格式错误'
      return ''
    },
    async submit() {
      const err = this.validate()
      if (err) return this.$msg(err)

      this.submitting = true
      try {
        const payload = {
          ...this.form, 
          code: this.product.smallserialnumber,
        } 
        const res = await apiSupplementRegister(payload)
        if (this.$ck(res, true)) {
          this.$msg('补登记成功')
          uni.setStorageSync('WARRANTY_SUPPLEMENT_SUCCESS_CODE', this.product.codestr)
          setTimeout(() => {
            uni.navigateBack()
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

.form-box {
  border-radius: 20rpx;

  .input {
    height: 108rpx;
    text-align: left;
    color: #333;
    line-height: 108rpx;
    font-size: 30rpx;
  }

  .placeholder {
    color: #aaaaaa;
  }

  .date-picker {
    width: 100%;
  }
}

.upload-wrap {
  margin-left: -20rpx;
  margin-right: -10rpx;
  margin-bottom: 20rpx;
  padding: 20rpx 20rpx 20rpx 0;

  &--inline {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 0;
    flex: 1;
    min-width: 0;
    text-align: left;
  }
}

.left-wrap {
  max-width: 160rpx;
}

.info-content--form {
  padding-top: 0;
}

.primary-btn {
  border-radius: 45px;
}
::v-deep .cell-line {
  padding-right: 0 !important;
}
</style>
