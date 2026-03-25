<template>
  <view class="container">
    <view class="input-check-wrap">
      <view class="input-content mb-30">
        <input
          v-model.trim="queryCode"
          class="input-check"
          type="text"
          maxlength="50"
          placeholder="请输入SN码或质保码ID"
          placeholder-class="placeholder"
          :class="{ 'input-check-empty': !queryCode }"
        />
        <text
          v-show="queryCode"
          class="iconfont icon-close-circle input-clear c-9 fs-40"
          @click.stop="queryCode = ''"
        />
        <text class="iconfont icon-saoyisaoicon icon-border-wrap" @click="handleScan"></text>
      </view>
      <view class="check-btn" @click="() => doQuery(false)">查询</view>
    </view>

    <view v-if="queryResult" class="info-content">
      <view class="block block--single">
        <!-- 标签替换提示条 -->
        <view v-if="queryResult.haslabelreplacement" class="label-replace-tip">
          <text class="label-replace-tip__text">该产品曾补发新标签，已为您匹配当前有效标签信息。</text>
        </view>
        <view v-if="queryResult.codestr" class="section">
          <view class="title bg mb-30">产品信息</view>
          <view
            v-for="(row, idx) in productInfoFields"
            :key="'product-' + idx"
            class="row flex fsz-28"
            :class="{ 'mt-20': idx > 0 }"
          >
            <view class="left">{{ row.label }}</view>
            <view class="right flex flex-1">{{ queryResult[row.prop] || '-' }}</view>
          </view>
        </view>

        <view
          v-if="queryResult.isinstock"
          class="section section--sep"
          :class="{ 'mt-30 pt-30 bd-t-e': queryResult.codestr }"
        >
          <view class="title bg mb-30">质保状态</view>
          <view
            v-for="(row, idx) in warrantyStatusFields"
            :key="'warranty-' + idx"
            class="row flex fsz-28"
            :class="{ 'mt-20': idx > 0 }"
          >
            <view class="left">{{ row.label }}</view>
            <view class="right flex flex-1 right--cell">
              <template v-if="row.prop === 'warrantyRange'">
                <text :class="{ 'error-color': queryResult.isexpired }">{{ getWarrantyRangeText() }}</text>
              </template>
              <text v-else-if="row.prop === 'remainingDays'">
                {{ getRemainingDaysText() }}
              </text>
              <view v-else-if="row.prop === 'exchangedWarrantyRange'">
                <view class="right__value">{{ getWarrantyRangeText() }}</view>
                <view class="right__note">(保修权益已转移至新产品)</view>
              </view>
              <view v-else :class="row.className" class="flex-1">
                {{ queryResult[row.prop] || '-' }}
              </view>
               <view
                  v-if="row.prop === 'warrantystatusdesc' && showSupplementRegisterBtn"
                  class="register-status-link flex flex-middle shrink-0"
                  @tap.stop="goSupplementRegister"
                >
                  <text>去登记</text>
                  <text class="iconfont icon-arrow-right register-status-link__icon"></text>
                </view>
            </view>
          </view>
        </view>

        <view v-if="queryResult.warrantystatus === 2" class="section section--sep bd-t-e mt-30 pt-30">
          <view class="title bg mb-30">换新记录</view>
          <view
            v-for="(row, idx) in exchangeRecordFields"
            :key="'exchange-' + idx"
            class="row flex fsz-28"
            :class="{ 'mt-20': idx > 0 }"
          >
            <view class="left" style="width: 220rpx">{{ row.label }}</view>
            <view class="right flex flex-1">{{ queryResult[row.prop] || '-' }}</view>
          </view>
        </view>

        <view
          v-if="queryResult.errorprompt"
          class="tip-row tip-row--bottom"
          :class="{ 'mt-40': queryResult.isinstock }"
        >
          <i class="iconfont icon-shibaiicon fs-40 mb-20"></i>
          {{ queryResult.errorprompt }}
        </view>

        <view
          v-if="queryResult.warrantystatus === 1"
          class="exchange-btn"
          :class="{ disabled: !queryResult.canexchange }"
          @tap="queryResult.canexchange && goExchange()"
        >
          发起售后换新
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiQueryWarrantyByCode } from 'packages/api/warranty'

export default {
  name: 'WarrantyQuery',
  data() {
    return {
      queryCode: '',
      queryResult: null,
      querying: false
    }
  },
  computed: {
    productInfoFields() {
      return [
        { label: '产品名称', prop: 'goodsname' },
        { label: '产品编码', prop: 'goodsno' },
        { label: 'SN码', prop: 'smallserialnumber' },
        { label: '质保码ID', prop: 'codestr' }
      ]
    },
    showSupplementRegisterBtn() {
      const r = this.queryResult
      if (!r) return false 
      return !!(r.cansupplyregister && !r.isregistered)
    },
    warrantyStatusFields() {
      if (!this.queryResult) return []
      const s = this.queryResult.warrantystatus
      const base = [
        {
          label: '登记状态',
          prop: 'warrantystatusdesc',
          className: !this.queryResult.isregistered ? 'error-color' : ''
        }
      ]
      if (s === 1) {
        return base.concat({ label: '保修期', prop: 'warrantyRange' }, { label: '剩余保修期', prop: 'remainingDays' })
      }
      if (s === 2) {
        return base.concat({ label: '原保修期', prop: 'exchangedWarrantyRange' })
      }
      return base.filter(item => item.prop === 'warrantystatusdesc' || this.queryResult.isinstock)
    },
    exchangeRecordFields() {
      return [
        { label: '服务单号', prop: 'exchangedorderno' },
        { label: '服务时间', prop: 'exchangedtime' },
        { label: '新产品质保码ID', prop: 'newproductcodestr' }
      ]
    }
  },
  methods: {
    /** 由父页面 store-exchange onShow 调用：补登记成功后带回质保码并自动查询 */
    applySupplementSuccessFromStorage() {
      const code = uni.getStorageSync('WARRANTY_SUPPLEMENT_SUCCESS_CODE')
      if (!code) return
      uni.removeStorageSync('WARRANTY_SUPPLEMENT_SUCCESS_CODE')
      this.queryCode = code
      this.doQuery(false, code)
    },
    getWarrantyRangeText() {
      if (!this.queryResult) return ''
      return this.queryResult.isexpired
        ? '已过期'
        : (this.queryResult.warrantystarttime || '') + '~' + (this.queryResult.warrantyendtime || '')
    },
    getRemainingDaysText() {
      const days = this.queryResult && this.queryResult.remainingdays != null ? this.queryResult.remainingdays : 0
      return Math.max(0, Number(days)) + '天'
    },
    handleScan() {
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode'],
        success: res => {
          const result = (res.result || '').trim()
          if (!result) return this.$msg('扫码失败，请重试')
          this.doQuery(true, result)
        },
        fail: () => this.$msg('扫码失败，请重试')
      })
    },
    async doQuery(fromScan, scanResult = '') {
      const code = fromScan ? (scanResult || '').trim() : this.queryCode.trim()
      if (!code) return this.$msg('请输入SN码或质保码ID')
      this.querying = true
      this.queryResult = null
      try {
        const res = await apiQueryWarrantyByCode({ code })
        const d = this.$toLowerKey(res, true)
        if (this.$ck(res, true)) {
          let data = d.return_data || {}
          this.queryResult = data
          if (fromScan) {
            this.queryCode = data && data.codestr ? data.codestr : scanResult
          }
        }
      } finally {
        this.querying = false
      }
    },
    goExchange() {
      if (!this.queryResult || this.queryResult.isexpired) return
      uni.setStorageSync('WARRANTY_EXCHANGE_OLD_PRODUCT', JSON.stringify(this.queryResult))
      uni.navigateTo({
        url: `/packages/src/personal/warranty/exchange-operation`
      })
    },
    goSupplementRegister() {
      if (!this.queryResult) return
      uni.setStorageSync(
        'WARRANTY_SUPPLEMENT_PRODUCT',
        JSON.stringify(this.queryResult)
      )
      uni.navigateTo({
        url: `/packages/src/personal/warranty/supplement-register`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/warranty-common.scss';

.input-check-wrap {
  margin: 35rpx 50rpx 20rpx;
}

.info-content {
  border-radius: 10rpx;
  padding-bottom: 50rpx;
}

.row .right {
  &__value {
    word-break: break-all;
  }

  &__note {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #999999;
  }
}

/* 与 exchange-btn、扫码图标一致：主题色（项目蓝） */
.register-status-link {
  color: $uni-color-edit;
  font-size: 28rpx;
  font-weight: 500;
  margin-left: auto;

  &__icon {
    margin-left: 6rpx;
    font-size: 24rpx;
    color: inherit;
  }
}

.exchange-btn {
  margin-top: 30rpx;
}
.check-btn {
  width: 540rpx;
  margin: 0 auto;
}
</style>
