<template>
  <view class="realname-auth-page" :style="themeVars">
    <!-- 认证完成结果页 -->
    <view v-if="showSuccess" class="auth-success-page">
      <view class="icon iconfont iconpack-gou success-color fs-110" />
      <view class="c-0 fs-36 fw-bold mt-50">实名认证完成</view>
    </view>

    <!-- 表单内容区 -->
    <view v-else>
      <!-- 未授权状态提示块 -->
      <view v-if="authStatus === 2" class="auth-tip-block">
        <view class="tip-text">
          您在米多平台中已有实名认证信息。
          <view>是否要授权给【{{ brandName }}】为您提供个税代缴服务？</view>
        </view>
      </view>

      <!-- 表单内容区 -->
      <view class="form-box">
        <view class="form-title">实名认证信息</view>
        <!-- 姓名 -->
        <info-cell :is-middle="true" :is-input="authStatus === 0" :is-needed="true">
          <view slot="left">姓名</view>
          <view slot="right">
            <input
              v-if="authStatus === 0"
              v-model.trim="formData.name"
              type="text"
              class="input"
              :maxlength="20"
              placeholder="请输入姓名"
            />
            <view v-else class="masked-text">{{ maskedName }}</view>
          </view>
        </info-cell>

        <!-- 身份证 -->
        <info-cell :is-middle="true" :is-input="authStatus === 0" :is-needed="true">
          <view slot="left">身份证</view>
          <view slot="right">
            <input
              v-if="authStatus === 0"
              v-model.trim="formData.idCard"
              type="idcard"
              class="input"
              :maxlength="18"
              placeholder="请输入身份证号"
            />
            <view v-else class="masked-text">{{ maskedIdCard }}</view>
          </view>
        </info-cell>
      </view>

      <!-- 固定底部：协议和按钮 -->
      <view v-if="authStatus !== 1" class="fixed-bottom">
        <!-- 协议复选框 -->
        <view class="protocol-checkbox">
          <view class="flex flex-middle flex-center fs-24" @tap="formData.agreeProtocol = !formData.agreeProtocol">
            <view v-if="formData.agreeProtocol" class="iconfont iconpack-gou fs-28 mr-5 primary-color" />
            <view v-else class="iconfont icon-uncheck fs-28 c-9 mr-5" />
            勾选表示已阅读并同意
            <text class="protocol-link" @tap.stop="handleViewProtocol">《实名认证协议》</text>
          </view>
        </view>
        <!-- 提交按钮 -->
        <view class="submit-btn-wrapper">
          <button
            :class="['primary-btn round', { disabled: !canSubmit }]"
            hover-class="button-action"
            @tap="handleSubmit"
          >
            {{ authStatus === 2 ? '确认授权' : '提交认证' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiGetRealnameAuthStatus, apiSubmitRealnameAuth } from 'packages/api/realname-auth'
import { getAuthStatus, getRealnameAuthParams } from 'packages/mixins/realname-auth'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme'
// #endif
import { encrypt, decrypt } from 'packages/utils/crypto-aes'

/**
 * 姓名脱敏：保留最后一个字，前面用*号
 * 使用 Array.join 替代 repeat，提高兼容性
 */
const maskName = name => {
  if (!name || name.length <= 1) return name
  const starCount = name.length - 1
  const stars = new Array(starCount + 1).join('*')
  return stars + name.slice(-1)
}

/**
 * 身份证脱敏：保留前1位和后1位，中间用*号
 * 使用 Array.join 替代 repeat，提高兼容性
 */
const maskIdCard = idCard => {
  if (!idCard || idCard.length <= 2) return idCard
  const starCount = idCard.length - 2
  const stars = new Array(starCount + 1).join('*')
  return idCard[0] + stars + idCard.slice(-1)
}

/**
 * 身份证格式验证（18位或15位）
 */
const validateIdCard = idCard => {
  if (!idCard) return false
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

export default {
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      authStatus: 0, // 0-未认证, 1-已认证, 2-未授权
      showSuccess: false, // 是否显示认证完成页面
      formData: {
        name: '',
        idCard: '',
        agreeProtocol: false
      },
      authInfo: {
        name: '',
        idCard: ''
      },
      brandName: '',
      memberlogin: '', // 品牌商账号
      mobile: '' // 手机号
    }
  },
  computed: {
    maskedName() {
      return maskName(this.authInfo.name)
    },
    maskedIdCard() {
      return maskIdCard(this.authInfo.idCard)
    },
    canSubmit() {
      if (this.authStatus === 0) {
        // 未认证状态：姓名、身份证必填，且需同意协议（不校验格式，格式校验在点击时进行）
        return this.formData.name.trim() && this.formData.idCard.trim() && this.formData.agreeProtocol
      } else if (this.authStatus === 2) {
        // 未授权状态：只需同意协议
        return this.formData.agreeProtocol
      }
      return false
    }
  },
  async onLoad() {
    await this.fetchAuthStatus()
  },
  methods: {
    async fetchAuthStatus() {
      // 通过公共方法获取手机号、品牌商信息
      const { mobile, memberlogin, brandName } = getRealnameAuthParams()
      this.mobile = mobile
      this.memberlogin = memberlogin
      this.brandName = brandName

      // 获取认证状态（传入 mobile、memberlogin，与 mixin 保持一致）
      try {
        const res = await apiGetRealnameAuthStatus({
          mobile: this.mobile,
          memberlogin: this.memberlogin
        })
        if (this.$ck(res, true)) {
          const data = res.return_data
          // 根据name和iscertificate判断状态
          this.authStatus = getAuthStatus(data)
          if (data.name) {
            // 解密姓名
            try {
              this.authInfo.name = decrypt(data.name)
            } catch (error) {
              this.$uploadLog({
                logType: 'error',
                type: 'realname-auth',
                desc: '解密姓名失败',
                data: {
                  name: data.name
                }
              })
              this.authInfo.name = data.name
            }
          }
          // 接口返回的字段是 identitycard，不是 idCard
          if (data.identitycard) {
            // 解密身份证
            try {
              this.authInfo.idCard = decrypt(data.identitycard)
            } catch (error) {
              this.$uploadLog({
                logType: 'error',
                type: 'realname-auth',
                desc: '解密身份证失败',
                data: {
                  identitycard: data.identitycard
                }
              })
              this.authInfo.idCard = data.identitycard
            }
          }
        }
      } catch (error) {
        // 业务帮帮
      }
    },
    handleViewProtocol() {
      // 跳转到协议页面，不同端对应不同的协议编号
      let applyNo = ''
      // #ifdef MP-RETAIL
      applyNo = '100000040' // 零售端
      // #endif
      // #ifdef MP-GUIDE
      applyNo = '100000039' // 导购端
      // #endif
      // #ifdef MP-SALE
      applyNo = '100000042' // 业务端
      // #endif
      // #ifdef MP-DISTRIBUTION
      applyNo = '100000041' // 经销商端
      // #endif
      uni.navigateTo({
        url: `/packages/src/rule/webview?pageType=rule&applyNo=${applyNo}`
      })
    },
    async handleSubmit() {
      if (!this.canSubmit) {
        return
      }

      // 根据认证状态获取姓名和身份证号
      let name, idCard
      if (this.authStatus === 0) {
        // 提交认证：从表单获取
        name = this.formData.name.trim()
        idCard = this.formData.idCard.trim()

        // 点击时校验输入内容
        if (!name) {
          return this.$msg('请输入姓名')
        }
        if (!idCard) {
          return this.$msg('请输入身份证号')
        }
        if (!validateIdCard(idCard)) {
          return this.$msg('请输入正确的身份证号')
        }
      } else if (this.authStatus === 2) {
        // 确认授权：从已有认证信息获取
        name = this.authInfo.name
        idCard = this.authInfo.idCard
      }

      // 加密姓名和身份证
      const encryptedName = encrypt(name)
      const encryptedIdCard = encrypt(idCard)

      // 提交认证/授权
      try {
        const res = await apiSubmitRealnameAuth({
          name: encryptedName,
          identitycard: encryptedIdCard,
          memberlogin: this.memberlogin,
          mobile: this.mobile
        })

        if (this.$ck(res, true)) {
          this.showSuccess = true
        }
      } catch (error) {
        // 处理接口调用失败
        this.$msg(error.return_msg || '提交失败，请重试')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.realname-auth-page {
  min-height: 100vh;
  /* #ifdef MP-SALE */
  background-color: $uni-bg-color-light-grey;
  overflow: hidden;
  /* #endif */
  padding-bottom: 200rpx; // 为固定底部留出空间
}

.auth-tip-block {
  padding: 20rpx 30rpx;
  /* #ifndef MP-SALE */
  margin: 20rpx;
  border-radius: 10rpx;
  /* #endif */
  /* #ifdef MP-DISTRIBUTION */
  color: #fff;
  background-color: $uni-color-primary;
  /* #endif */
  /* #ifdef MP-SALE */
  color: $uni-color-warning;
  background-color: rgba($uni-color-checked, 0.1);
  /* #endif */
  /* #ifdef MP-GUIDE */
  color: $uni-color-primary;
  background-color: rgba($uni-color-primary, 0.1);
  /* #endif */
  /* #ifdef MP-RETAIL */
  color: $uni-color-primary;
  background-color: #fff5f1;
  /* #endif */
  .tip-text {
    /* #ifndef MP-SALE */
    text-align: center;
    /* #endif */
    font-weight: medium;
    font-size: 24rpx;
    line-height: 40rpx;
  }
}

.form-box {
  margin: 20rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #fff;
  .form-title {
    position: relative;
    margin: 15rpx 0;
    color: #000;
    font-size: 32rpx;
    font-weight: 700;
  }
}

.input {
  line-height: 108rpx;
  height: 108rpx;
  color: #666;
  text-align: left;
}

.masked-text {
  color: #666;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.protocol-checkbox {
  padding: 0 30rpx;
  padding-top: 20rpx;
  .protocol-link {
    color: $uni-color-edit;
    padding: 24rpx 0;
  }
}

.submit-btn-wrapper {
  padding: 0 30rpx 30rpx;
  .primary-btn {
    width: 100%;
  }
}

.auth-success-page {
  padding: 120rpx 50rpx 0;
  min-height: 100vh;
  background-color: #fff;
  text-align: center;
}
</style>
