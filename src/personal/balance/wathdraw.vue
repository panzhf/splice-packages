<template>
  <view>
    <view v-if="!loading" class="page-withdrawal bg-gray" style="min-height: 100vh">
      <image class="bg-image" :src="images.bg" mode="widthFix" />
      <title-bar
        type="detail"
        show-nav-title
        :show-placeholder="true"
        :bgcolor="titleBgColor"
        :bg-pic="titleBg"
        title="提现"
      />
      <view class="withdrawal bg-f">
        <view class="tips fs-22">零钱达到1.00元或以上才可提现，且每次提现不高于500元。</view>
        <view class="withdrawal-tips tx-c fs-28">请输入提现金额</view>
        <view class="withdrawal-form flex flex-middle bd-a">
          <view class="fs-48 fw-bold">￥</view>
          <input
            :value="inputMoney"
            class="withdrawal-form__value fw-bold flex-1 tx-c"
            placeholder-class="placeholder"
            type="digit"
            maxlength="6"
            :focus="!isWithdrawSubmitted && inputFocus"
            :disabled="isWithdrawSubmitted"
            @input="handleInput"
          />
        </view>
        <view class="withdrawal-total c-0 fs-26">
          <text class="c-6">可提现余额：</text>
          ￥{{ outamount }}
        </view>
        <button class="primary-btn round mt-60 letter-sp-6" hover-class="button-action" @tap="handleCheck">提现</button>
      </view>
      <view class="account">
        <view class="account-item bd-a">
          <text class="key">提现到</text>
          <view class="value">{{ userInfo.nickname }}</view>
          <image
            class="avatar-48 ml-20"
            :src="userInfo.headpath ? userInfo.headpath : persoanalHeadDefault"
            mode="scaleToFill"
          />
        </view>
        <view class="account-item">
          <text class="key">入账方式</text>
          <view class="value">
            微信零钱
            <text class="icon mdfont icon-wechatChange success-color fs-48 ml-20" />
          </view>
        </view>
        <view class="withdrawal-tips fs-22">
          温馨提示：红包零钱提现成功后，直接到账您的【微信零钱】，微信支付将同步推送零钱入账通知。
        </view>
      </view>
      <common-popup
        v-model="showPopup"
        :type="popType"
        :title="popTitle"
        :content="popContent"
        :confirm-text="popConfirmText"
        :cancel-text="popCancelText"
        @confirm="handleConfirm"
      />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { staticURL } from '@/config'
import { apiGetMyPocket, apiNewWithdraw  } from 'packages/api/balance'
import { generateUniqueId } from 'packages/utils'
import merchantTransferMixin from 'packages/mixins/merchant-transfer'
import userAuthHub from 'packages/utils/user-auth-hub'
export default {
  components: {
    TitleBar
  },
  mixins: [merchantTransferMixin],
  data() {
    return {
      titleBgColor: 'transparent', // 标题栏背景色
      images: {
        bg: staticURL(true) + 'personal/personal-bg.png' //背景
      },
      inputMoney: '', // 提现金额
      inputFocus: false, // input 聚焦状态
      persoanalHeadDefault: staticURL(true) + 'default-avatar.png', // 默认图片
      headpath: '', //用户头像
      outamount: 0, // 可提现总额
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '', // 弹窗确认按钮文案
      popCancelText: '', // 弹窗取消按钮文案
      newOpenid: '', // 静默授权获取的openid
      mdtargeturl: '', // 授权链接
      userInfo: {
        nickname: '',
        headpath: ''
      },
      loading: true,
      savedReturnData: null,
      isWithdrawSubmitted: false // 是否已提交提现（用于禁用输入框）
    }
  },
  computed: {
    mainopenid() {
      return this.$store.state.mainopenid
    },
    openid() {
      return this.$store.state.openid
    }
  },
  async onLoad() {
    // 获取零钱信息
    try {
      const res = await apiGetMyPocket()
      if (this.$ck(res)) {
        const data = res.return_data
        // 保存可提现余额
        this.outamount = data.total ? data.total.toFixed(2) : '0.00'
        // 保存授权链接
        this.mdtargeturl = data.mdtargeturl || ''
        // 保存用户头像和昵称
        this.userInfo.nickname = data.nickname || ''
        this.userInfo.headpath = data.headpath || ''

        // 如果还没有获取openid，进行静默授权
        if (!this.newOpenid && this.mdtargeturl) {
          // 存储授权链接到storage
          uni.setStorageSync('authorizeUrl', this.mdtargeturl)

          // 订阅授权结果
          let authInfo = await new Promise(resolve => {
            userAuthHub.subscribe(resolve)
            uni.navigateTo({
              url: `/packages/src/rule/auth`
            })
          })

          // 保存获取到的openid
          this.newOpenid = authInfo.openid
        }
        this.loading = false
      }
    } catch (error) {
      this.$msg(error.return_msg || '获取零钱信息失败')
    }
  },
  onShow() {
    // 每次页面显示时重新聚焦 input
    this.inputFocus = false
    this.$nextTick(() => {
      this.inputFocus = true
    })
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
    showTips(content) {
      // 显示提示信息
      this.popType = 'tip'
      this.popTitle = '温馨提示'
      this.popContent = content
      this.popConfirmText = '确定'
      this.showPopup = true
    },
    async handleCheck() {
      // 如果已有保存的 return_data，直接使用，不再调用 API
      if (this.savedReturnData) {
        this.requestMerchantTransfer(this.savedReturnData)
        return
      }
      if (Number(this.inputMoney < 1)) {
        this.showTips('金额不足1元，请重新输入提现金额。')
        return
      } else if (Number(this.inputMoney > 500)) {
        this.showTips('金额最多单次提现500元。')
      } else if (Number(this.inputMoney > this.outamount)) {
        this.showTips('提现余额不足。')
      } else {
        try {
          // 生成唯一业务单号
          const outTradeNo = generateUniqueId()
          let res = await apiNewWithdraw({
            amount: Number(this.inputMoney),
            mainOpenID: this.newOpenid, // 使用静默授权获取的openid
            OutTradeNo: outTradeNo // 新增业务单号
          })
          if (this.$ck(res)) {
            // 保存 return_data
            this.savedReturnData = res.return_data
            // 标记已提交，禁用输入框
            this.isWithdrawSubmitted = true

            // 检查是否需要调用微信支付确认收款
            this.requestMerchantTransfer(res.return_data)
          }
        } catch (error) {
          this.$msg(error.return_msg || '提现失败')
        }
      }
    },
    handleNavigation(url) {
      if (!url) return
      uni.redirectTo({
        url: url
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-withdrawal {
  background: #f6f7fc;
  padding: 40rpx 0 0 0;
  position: relative;
  .bg-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    z-index: 0;
  }
}
.withdrawal {
  margin: 0 30rpx;
  padding: 20rpx 30rpx 60rpx 30rpx;
  border-radius: 20rpx;
  position: relative;
  .tips {
    margin-top: 20rpx;
    display: block;
    padding: 10rpx 14rpx;
    line-height: 34rpx;
    background: #fff5e7;
    color: #ff6955;
    border-radius: 5rpx;
    margin-bottom: 40rpx;
  }
  &-tips {
    padding-bottom: 50rpx;
  }
  &-total {
    padding-top: 26rpx;
  }
  &-form {
    &__value {
      line-height: 180rpx;
      height: 180rpx;
      font-size: 80rpx;
    }
  }
}
.account {
  margin: 30rpx 30rpx 0 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 0rpx 30rpx 30rpx 30rpx;
  position: relative;
  .withdrawal-tips {
    background: #f6f7fc;
    padding: 10rpx 20rpx;
  }
  &-item {
    display: flex;
    align-items: center;
    height: 124rpx;
    font-size: 30rpx;
    .value {
      flex: 1;
      color: $uni-text-color-grey;
      text-align: right;
    }
  }
}
</style>
