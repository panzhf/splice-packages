<template>
  <view class="confirm bg-f">
    <view class="confirm-header">
      <view class="icon iconfont icon-duihuan-fail" />
      <view class="text">确认注销该账号吗？</view>
    </view>
    <view class="form">
      <!-- #ifdef MP-MEMBER -->
      <view class="form-item bd-c">
        <input
          v-model.trim="confirmText"
          class="form-value"
          maxlength="16"
          placeholder-class="placeholder"
          placeholder="请输入“确认注销”"
        />
      </view>
      <!-- #endif -->
      <!-- #ifdef MP-GUIDE -->
      <view class="form-item bd-c">
        <view class="form-key">手机号</view>
        <view class="form-value">
          {{ mobile }}
        </view>
      </view>
      <view class="form-item bd-c">
        <view class="form-key">验证码</view>
        <view class="flex">
          <input
            v-model.trim="code"
            class="form-value"
            type="number"
            :maxlength="6"
            placeholder-class="placeholder-mid"
            placeholder="请输入验证码"
            @focus="toggleBlur(0)"
            @blur="toggleBlur(1)"
          />
          <view class="code-tips">
            <verify-code :mobile="mobile" auth />
          </view>
        </view>
      </view>
      <CodeTip :value="code" :is-blur="isCodeBlur" />
      <!-- #endif -->
    </view>
    <view class="safe-btns flex">
      <button class="safe-btn back-btn" @tap="handleGiveup">放弃</button>
      <button class="safe-btn continue-btn" :disabled="disabled" @tap="handleComfirm">确认注销</button>
    </view>
    <view class="blank-height" />
    <u-popup v-model="show" mode="bottom" border-radius="30">
      <view class="remind">
        <view class="remind-title">温馨提示</view>
        <view class="remind-content">
          <view class="li">账号注销申请是由您本人操作</view>
          <view class="li">
            您确认您在当前品牌系统中的红包零钱、积分、卡券等资产均已提现和使用，并于品牌商不存在纠纷
          </view>
          <view class="li">您确认您在品牌系统中的订单均已完成交易，实体商品已完成交付，并与店铺不存在纠纷</view>
          <view class="li">账号注销后您将丢失您在当前品牌系统中的账号信息，包含但不限于微信H5、微信小程序、PC端等</view>
          <view class="li">注销账号属于不可恢复操作，请确保已妥善处理与账号相关的服务</view>
          <!-- #ifdef  MP-GUIDE -->
          <view class="fw-bold fs-26 mb-10">你的帐号将从以下品牌系统中注销：</view>
          <view v-for="(item, index) in brands" :key="index" class="li logoff ml-20">
            {{ item.memberloginname }}
            <text class="fs-24 c-6 ml-10">({{ item.companyname }})</text>
          </view>
          <!-- #endif -->
        </view>
      </view>
      <view class="safe-btns flex">
        <view class="safe-btn back-btn" @tap="show = false">我再想想</view>
        <view class="safe-btn continue-btn" @tap="handleLogoff">注销</view>
      </view>
    </u-popup>
  </view>
</template>

<script>
// #ifdef  MP-GUIDE
import verifyCode from '@/components/verify-code'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import { codeTipMixin } from 'packages/mixins/phone-verify'
import { apiValidateCode } from '@/api/common'
import { removeStorage } from '@/utils/set-mp'
// #endif
import { apiLogoff } from 'packages/api/logoff.js'
export default {
  name: 'Confirm',
  components: {
    // #ifdef  MP-GUIDE
    verifyCode,
    CodeTip
    // #endif
  },
  // #ifdef  MP-GUIDE
  mixins: [codeTipMixin],
  // #endif
  props: {
    brands: {
      type: Array,
      default: () => []
    },
    reason: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      show: false,
      confirmText: '',
      mobile: '', // 手机号
      code: '', // 验证码
      busy: false,
      logoffMemberlogins: []
    }
  },

  computed: {
    disabled() {
      return this.code === '' && this.confirmText === ''
    }
  },
  mounted() {
    // #ifdef  MP-GUIDE
    this.mobile = JSON.parse(uni.getStorageSync('personalInfo') || '{}').mobile || ''
    // #endif
  },
  methods: {
    async handleLogoff() {
      if (this.busy) return
      this.busy = true
      let param = {
        logoffreason: this.reason
      }
      // #ifdef  MP-GUIDE
      // 要注销的品牌账号
      const memberlogins = this.brands.map(item => item.memberlogin)
      param = { ...param, memberlogins }
      // #endif
      const res = await apiLogoff(param)
      if (res) {
        if (res.return_code === 0) {
          // #ifdef  MP-GUIDE
          removeStorage()
          // #endif
          //  #ifdef MP-MEMBER
          this.$store.commit('resetState')
          const excludeKeys = ['TestFlag', 'systemInfo'] // 不清除的数据
          const allKeys = uni.getStorageInfoSync() // 获取所有的key
          const removeKeys = allKeys.keys.filter(item => !excludeKeys.includes(item))
          removeKeys.forEach(key => uni.removeStorageSync(key))
          // #endif
        }
        this.$emit('getResult', res)
        this.$emit('setStep', 5)
        if (res.return_code !== 0) {
          // #ifdef  MP-GUIDE
          this.$uploadLog({
            type: 'account',
            desc: '注销',
            data: res || {},
            extend: { logoffMemberlogins: memberlogins }
          })
          // #endif
          // #ifdef MP-MEMBER
          this.$log.warn({
            api: apiLogoff,
            desc: '注销',
            data: JSON.stringify(res || {})
          })
          // #endif
        }
      }
      this.busy = false
    },
    handleGiveup() {
      const pages = getCurrentPages()
      let targetPageIndex = -1
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].route === 'packages/src/personal/safe/index') {
          targetPageIndex = i
          break
        }
      }
      uni.navigateBack({ delta: pages.length - targetPageIndex })
    },
    async handleComfirm() {
      //  #ifdef MP-MEMBER
      if (this.confirmText === '' || this.confirmText !== '确认注销') return this.$msg('请输入’确认注销’！')
      // #endif
      // #ifdef  MP-GUIDE
      if (this.code === '') return this.$msg('验证码不能为空！')
      if (this.code.length < 6) return this.$msg('请输入6位验证码！')
      if (this.busy) return
      this.busy = true
      // 验证码码校验
      const v = await apiValidateCode({
        mobile: this.mobile,
        checkcode: this.code
      })
      if (!this.$ck(v)) return (this.busy = false)
      // #endif
      this.show = true
      this.busy = false
    }
  }
}
</script>
<style lang="scss" scoped>
.confirm {
  .form {
    padding: 0 75rpx;
  }
  .confirm-header {
    text-align: center;
    padding: 150rpx 0;
    .icon-duihuan-fail {
      font-size: 80rpx;
      margin-bottom: 30rpx;
    }
    .text {
      line-height: 48rpx;
      font-weight: 700;
      font-size: 40rpx;
    }
  }

  .form-item {
    color: #000;
    font-size: 30rpx;
    .form-key {
      margin-right: 30rpx;
      font-weight: 500;
      color: #222;
    }
    .form-value {
      line-height: 100rpx;
      height: 100rpx;
      flex: 1;
      font-size: 36rpx;
      color: #000;
    }
    &:not(:nth-child(1)) {
      padding-top: 80rpx;
    }
    .code-tips {
      width: 193rpx;
    }
  }
}
.remind {
  height: 840rpx;
  .remind-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    padding: 50rpx 0;
    background-color: #fff;
    position: fixed;
    width: 100%;
    height: 120rpx;
    z-index: 10;
    top: 0;
  }
  .remind-content {
    font-size: 26rpx;
    margin: 0 30rpx;
    padding: 130rpx 30rpx 150rpx 60rpx;
    border-radius: 10rpx;
    .li {
      position: relative;
      font-size: 26rpx;
      color: #333;
      margin-bottom: 20rpx;
      line-height: 140%;
      text-align: justify;
      &::before {
        position: absolute;
        width: 10rpx;
        height: 10rpx;
        background: #000000;
        border-radius: 50%;
        left: -25rpx;
        top: 12rpx;
        content: '';
      }
      &.logoff {
        line-height: 140%;
        margin-bottom: 10rpx;
        &::before {
          width: 6rpx;
          height: 6rpx;
          content: '';
        }
      }
    }
  }
}
</style>
