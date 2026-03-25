<template>
  <!-- 零钱提现页 -->
  <view class="bgc-f4" :style="themeVars">
    <view class="container">
      <view class="change-tips fs-24 c-red pl-30">零钱达到1元以上才可提现，且每次提现不高于500元。</view>
      <view class="bg-f get-change">
        <view class="split-line">
          <view class="c-6 fs-26 change-name">提现金额</view>
          <view class="change-input ub ub-pj ub-pc ub-ac">
            <view class="fs-36 c-0">￥</view>
            <view class="ub-f1">
              <input :value="inputMoney" class="input" type="digit" :focus="!isWithdrawSubmitted" :disabled="isWithdrawSubmitted" maxlength="6" @input="handleInput" />
            </view>
          </view>
        </view>
        <view class="allow-tips c-9 fs-24">
          可提现金额 ¥{{ total | cashFixedTwo }}
          <text v-if="total" class="edit-color ml-40" @tap="inputMoney = total">全部提现</text>
        </view>
      </view>
      <!-- 点击后要加loading，避免重复点击  disabled-->
      <button :class="['change-buttton', inputMoney === '' || !allow ? 'disabled' : '']" @tap="handleSubmit">
        预计24小时内到账，确认提现
      </button> 

      <view class="get-tips c-9 fs-24 tx-c">
        <view>红包零钱提现成功后，将会直接到账您的【微信零钱】</view>
        请注意查收~
      </view>
    </view>
    <copyright />
  </view>
</template>

<script>
import { apiNewWithdraw } from 'packages/api/change.js'
import { cashFixedTwo } from 'packages/filters'
import { generateUniqueId } from 'packages/utils'
import merchantTransferMixin from 'packages/mixins/merchant-transfer'
// #ifdef MP-RETAIL
import subscribeMsgMixin, { noticeMixin, noticeMixin2 } from 'packages/mixins/subscribe-msg'
// #endif
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  filters: {
    cashFixedTwo
  },
  // #ifdef MP-RETAIL
  mixins: [
    merchantTransferMixin,
    subscribeMsgMixin,
    noticeMixin,
    noticeMixin2
  ],
  // #endif
  // #ifndef MP-RETAIL
  mixins: [
    merchantTransferMixin,
    notThemeMixin
  ],
  // #endif
  data() {
    return {
      inputMoney: '',
      total: 0,
      allow: false,
      savedReturnData: null, // 保存的 return_data
      isWithdrawSubmitted: false // 是否已提交提现（用于禁用输入框）
    }
  },
  async onLoad(option) {
    this.total = option.total
    this.allow = option.allow === '1'
    // #ifdef MP-RETAIL
    this.subscribeSettings = await this.initNotice(543)
    this.subscribeSettings.isopen && this.fetchNotice(6)
    // #endif
  },
  methods: {
    handleInput(e) {
      let v = e.detail.value
      let num = v.toString()
      if (num.indexOf('.') === 0) {
        //第一位就是 .
        num = '0' + num
      }
      num = num.replace(/[^\d.]/g, '') //清除“数字”和“.”以外的字符
      num = num.replace(/\.{2,}/g, '.') //只保留第一个. 清除多余的
      num = num.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
      num = num.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') //只能输入两个小数
      if (num.indexOf('.') < 0 && num !== '') {
        num = parseFloat(num)
      }
      this.inputMoney = num
      return num
    },
    async handleSubmit() {
      if (this.inputMoney === '' || !this.allow) return
      
      // 如果已有保存的 return_data，直接使用，不再调用 API
      if (this.savedReturnData) {
        this.requestMerchantTransfer(this.savedReturnData)
        return
      }
      
      let value = this.inputMoney - 0
      if (value > 500) {
        return this.$msg('每次提现不能大于500元')
      } else if (value < 1) {
        return this.$msg('每次提现不能小于1元')
      }
      // #ifdef MP-RETAIL
      let subscriberesult = {}
      if (this.subscribeSettings.isopen) {
        subscriberesult = await this.requestSubscribeMsg([this.noticeTempId])
      }
      this.withdraw(subscriberesult)
      // #endif

      // #ifndef MP-RETAIL
      this.withdraw()
      // #endif
    },
    async withdraw(subscriberesult) {  
      try { 
        this.$loading.show()
        let amount = parseFloat(this.inputMoney)
        // 生成唯一业务单号
        const outTradeNo = generateUniqueId()
        let res = await apiNewWithdraw({ amount: amount, OutTradeNo: outTradeNo })
        this.$loading.hide()
        if (this.$ck(res)) {
          // 保存 return_data
          this.savedReturnData = res.return_data
          // 标记已提交，禁用输入框
          this.isWithdrawSubmitted = true
          
          // #ifdef MP-RETAIL
          this.reportNotice({
            subscriberesult,
            type: 6
          })
          // #endif
          
          // 检查是否需要调用微信支付确认收款 
          this.requestMerchantTransfer(res.return_data)
        } else {
          this.$log && this.$log.info({ type: 'asset', desc: '零钱提现', data: JSON.stringify(res || {}) })
        }
      } catch (error) { 
        this.$loading.hide()
        this.$log && this.$log.error({ type: 'asset', desc: '零钱提现', data: JSON.stringify(error || {}) })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/change.scss';
.change-tips {
  background: #fef1f1;
  color: #ff5e33;
  line-height: 70rpx;
  .icon-jingao {
    font-size: 28rpx;
  }
}
.get-change {
  padding: 0 20rpx;
}
.allow-tips {
  line-height: 90rpx;
}
.change-name {
  padding: 26rpx 0 30rpx;
}
.change-input {
  line-height: 108rpx;
  .input {
    height: 108rpx;
    color: #000;
    font-size: 48rpx;
    &:disabled {
      color: #999;
      opacity: 0.6;
    }
  }
}
.change-buttton {
  line-height: 90rpx;
  margin: 60rpx auto 100rpx;
  width: 710rpx;
  height: 90rpx;
  color: #fff;
  // #ifdef MP-MEMBER || MP-CLOUDSHOP
  width: 690rpx;
  background: linear-gradient(90deg, rgba(255, 162, 0, 1) 0%, rgba(255, 212, 97, 1) 100%);
  box-shadow: 0 0 15px rgba(253, 178, 53, 0.5);
  // #endif
  // #ifdef MP-RETAIL
  background: var(--theme-color, $uni-bg-color-primary);
  // #endif
  border-radius: 45rpx;
  &.disabled {
    background: linear-gradient(90deg, rgba(213, 213, 213, 1) 0%, rgba(224, 224, 224, 1) 100%) !important;
    box-shadow: none !important;
  }
  /* #ifdef MP-CLOUDSHOP */
  &::after {
    border: none;
  }
  /* #endif */
}
.get-tips {
  line-height: 36rpx;
}
// #ifdef MP-RETAIL
.split-line {
  @include border-bottom(#e5e5e5);
}
// #endif
</style>
