<template>
  <view>
    <view v-if="!loading" class="page-banlance bg-gray" style="min-height: 100vh">
      <image class="bg-image" :src="images.bg" mode="widthFix" />
      <title-bar
        type="detail"
        show-nav-title
        :show-placeholder="true"
        :bgcolor="titleBgColor"
        :bg-pic="titleBg"
        title="我的零钱"
      />
      <view class="banlance bg-f center-middle">
        <view class="banlance-explain flex flex-end">
          <view class="fs-24 c-6 p-20 tip-icon" @tap="showWithdrawExplain = true">
            提现说明
            <text class="icon mdfont icon-explain fs-26 ml-10" />
          </view>
        </view>
        <view class="fs-28 c-6">可提现总额 (¥)</view>
        <view class="banlance-total c-2a">{{ outamount }}</view>
        <button
          class="primary-btn letter-sp-6 size-small banlance-button"
          :class="{ 'btn-disabled': !isenablewithdraw }"
          hover-class="button-action"
          :disabled="!isenablewithdraw"
          @tap="handleWithdrawal"
        >
          提现
        </button>
        <view class="c-6 fs-26 pt-30">
          累计总收入：
          <text class="c-2a">￥{{ inamount }}</text>
        </view>
      </view>
      <view class="form-container">
        <view class="form bg-f">
          <view
            class="form-item flex flex-middle bd-e"
            @tap="handleNavigation('/packages/src/personal/change/change-list')"
          >
            <text class="icon mdfont icon-shouzhimingxi pic" />
            <view class="key flex-1 ml-20">收支明细</view>
            <text class="icon mdfont icon-mdfont-more fs-24 c-2a" />
          </view>
          <view
            class="form-item flex flex-middle"
            @tap="handleNavigation('/packages/src/personal/change/withdraw-record')"
          >
            <text class="icon mdfont icon-tixianjilu pic" />
            <view class="key flex-1 ml-20">提现记录</view>
            <text class="icon mdfont icon-mdfont-more fs-24 c-2a" />
          </view>
        </view>
        <view class="form bg-f mt-30">
          <view class="form-item flex flex-middle" :class="{ 'no-padding-bottom': !mainopenid }">
            <view class="key">提现账户绑定</view>
            <view class="value flex-1" :class="{ 'edit-color-i': !mainopenid }" @tap="handleBind">
              {{ !mainopenid ? '立即绑定' : '已绑定' }}
            </view>
          </view>
          <template v-if="mainopenid">
            <view class="user_info">
              <view class="left">
                <image class="avatar" :src="userInfo.headpath || persoanalHeadDefault" />
                <text>{{ userInfo.nickname || '未知' }}</text>
              </view>
              <view v-if="!userInfo.nickname || !userInfo.headpath" class="edit-color-i" @tap="showAvatarPopup = true">
                授权头像昵称
              </view>
              <view v-else class="edit-color-i" @tap="handleChangeMainopenid">换绑</view>
            </view>
            <view v-if="userInfo.nickname && userInfo.headpath" class="bind-tips fs-22 c-6">
              此微信用于当前业务员账号的活动参与和收入提现，请谨慎换绑
            </view>
          </template>

          <view v-else class="bind-tips fs-22 c-6">绑定微信号用于个人收入提现，请谨慎绑定</view>
        </view>
        <withdraw-explain v-model="showWithdrawExplain" />
        <common-popup
          v-model="showPopup"
          :type="popupType"
          :title="popTitle"
          :content="popContent"
          :confirm-text="popConfirmText"
          :cancel-text="popCancelText"
          @confirm="handleConfirm"
        />
        <avatar-popup v-model="showAvatarPopup" @submit="handleAvatarSubmit" />
      </view>
    </view>
    <!-- 实名认证弹窗（提现页） -->
    <realname-auth-popup
      v-model="showRealnameAuthPopup"
      :mode="3"
      @confirm="handleRealnameAuthConfirm"
      @cancel="handleRealnameAuthCancel"
    />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { staticURL } from '@/config'
import WithdrawExplain from '../components/common-change-explain.vue'
import { apiGetMyPocket, apiBindWithdrawOpenid, apiAuthorizedAvatar } from 'packages/api/balance'
import userAuthHub from 'packages/utils/user-auth-hub'
import AvatarPopup from 'packages/components/avatar-popup/index.vue'
import RealnameAuthPopup from 'packages/components/realname-auth-popup/index.vue'
import { realnameAuthPopupSimpleMixin, realnameAuthNavigationMixin } from 'packages/mixins/realname-auth'
export default {
  components: {
    TitleBar,
    WithdrawExplain,
    AvatarPopup,
    RealnameAuthPopup
  },
  mixins: [realnameAuthPopupSimpleMixin, realnameAuthNavigationMixin],
  data() {
    return {
      showAvatarPopup: false,
      titleBgColor: 'transparent', // 标题栏背景色
      images: {
        bg: staticURL(true) + 'personal/personal-bg.png' //背景
        // withdrawal: staticURL() + 'balance/withdrawal.png?v=202112' //提现记录
      },
      showWithdrawExplain: false,
      showPopup: false,
      popupType: 'tip', // 弹窗类型：tip-提示，confirm-确认
      popupAction: '', // 弹窗操作标识：verify-mobile-验证手机号，bind-绑定账户等
      popTitle: '温馨提示', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '',
      popCancelText: '',
      isWithdrawFailed: false, // 是否提现失败
      outamount: '0.00', // 可提现总额
      inamount: '0.00', // 累计总收入
      persoanalHeadDefault: staticURL(true) + 'default-avatar.png',
      bindType: 1, // 1.绑定 2.换绑
      loaded: false,
      mainopenid: null, // 控制是否显示绑定状态，null表示未绑定
      userInfo: {
        nickname: '',
        headpath: ''
      },
      newOpenid: '',
      isCompareOpenid: 0,
      isVerifyMobile: false,
      mobile: '',
      isVerifyWithdrawal: false,
      isWithdrawalAuthor: false,
      // showAvatarDialog: false
      targeturl: '', // 静默授权链接
      isenablewithdraw: true, // 是否可以提现
      loading: true
    }
  },
  async onLoad() {},
  async onShow() {
    // 获取零钱信息
    await this.fetchMyPocketData()

    // 检查是否有提现失败标记
    const withdrawFailed = uni.getStorageSync('withdrawFailed')
    if (withdrawFailed) {
      // 清空缓存
      uni.removeStorageSync('withdrawFailed')
      // 标记为提现失败提示
      this.isWithdrawFailed = true
      this.$loading.hide()
      // 显示提现失败提示
      this.showPopup = true
      this.showTip('您的资金将在24小时内自动退回原账户', {
        title: '提现失败'
      })
      return
    }

    // 检测是否需要在验证手机号后进行绑定
    const needBindAfterVerify = uni.getStorageSync('needBindAfterVerify')
    const verification = uni.getStorageSync('verification')

    if (needBindAfterVerify && verification) {
      // 调用绑定方法
      this.handleBindOpenid(verification)
    }
  },
  methods: {
    async handleAvatarSubmit(e) {
      try {
        const res = await apiAuthorizedAvatar({
          ...e,
          openid: this.newOpenid
        })

        if (this.$ck(res)) {
          // 接口返回成功后，关闭弹窗
          this.showAvatarPopup = false
          // 重新请求详情数据
          await this.fetchMyPocketData()
        }
      } catch (error) {
        this.$msg(error.return_msg || '绑定失败，请重试')
        // eslint-disable-next-line no-console
        console.error('授权头像昵称失败:', error)
      }
    },
    // 获取零钱数据
    async fetchMyPocketData() {
      try {
        const res = await apiGetMyPocket()
        if (this.$ck(res)) {
          const data = res.return_data
          // 赋值数据
          this.outamount = data.total ? data.total.toFixed(2) : '0.00'
          this.inamount = data.totalincome ? data.totalincome.toFixed(2) : '0.00'
          this.mainopenid = data.openid || null
          this.userInfo.nickname = data.nickname || ''
          this.userInfo.headpath = data.headpath || ''
          this.targeturl = data.targeturl || ''
          this.isenablewithdraw = data.isenablewithdraw !== false // 默认为true
          if (!this.newOpenid) {
            uni.setStorageSync('authorizeUrl', this.targeturl)
            let authInfo = await new Promise(resolve => {
              userAuthHub.subscribe(resolve)
              uni.navigateTo({
                url: `/packages/src/rule/auth`
              })
            })
            this.newOpenid = authInfo.openid
          }
          this.loading = false
        }
      } catch (error) {
        this.$msg(error.return_msg || '获取零钱信息失败')
      }
    },
    // 提现
    async handleWithdrawal(needAuth = true) {
      if (needAuth) {
        const checkAuthResult = await this.preHandleWithdraw()
        if (!checkAuthResult) return
      }
      if (!this.mainopenid) {
        this.showTip('为保证账户安全，请进行手机号验证', {
          type: 'confirm',
          confirmText: '立即验证',
          cancelText: '取消',
          action: 'verify-mobile'
        })
      } else if (this.newOpenid !== this.mainopenid) {
        this.showTip('你不是当前业务员账号拥有者，没有提现权限')
      } else {
        this.handleNavigation(`/packages/src/personal/balance/wathdraw`)
      }
    },
    async preHandleWithdraw() {
      // 仅经销商业务员需要检查实名认证状态
      const userinfo = this.$store?.state?.userinfo || {}
      if (userinfo.dealerid > 0) {
        const needAuth = await this.checkRealnameAuthStatus()
        if (needAuth) {
          // 未认证，显示实名弹窗
          this.showRealnameAuthPopup = true
          return false
        }
      }
      return true
    },
    handleVerifyMobile() {
      const info = JSON.parse(uni.getStorageSync('accountinfo') || '{}')
      // 设置标识，表示验证完成后需要绑定
      uni.setStorageSync('needBindAfterVerify', true)
      // 验证手机号
      uni.navigateTo({
        url: `/pages/my/mobile/verify-mobile?mobile=${info.mobile}`
      })
    },
    // 绑定
    handleBind() {
      this.showTip('为保证账户安全，请进行手机号验证', {
        type: 'confirm',
        confirmText: '立即验证',
        cancelText: '取消',
        action: 'verify-mobile'
      })
    },
    // 换绑
    handleChangeMainopenid() {
      if (this.newOpenid === this.mainopenid) {
        return this.showTip('当前微信与绑定微信一致，不可以换绑')
      }
      this.handleBind()
    },
    // 绑定提现账户
    async handleBindOpenid(verification) {
      try {
        // 调用绑定接口
        const res = await apiBindWithdrawOpenid({
          mainopenid: this.newOpenid,
          verification: verification
        })

        // 清除缓存标识
        uni.removeStorageSync('needBindAfterVerify')
        uni.removeStorageSync('verification')

        if (this.$ck(res)) {
          // 绑定成功
          uni.showToast({
            title: '绑定成功',
            icon: 'success'
          })
          // 刷新页面数据
          await this.fetchMyPocketData()
        } else {
          // 绑定失败，显示错误信息
          uni.showToast({
            title: res.return_msg || '绑定失败',
            icon: 'none'
          })
        }
      } catch (error) {
        // 清除缓存标识
        uni.removeStorageSync('needBindAfterVerify')
        uni.removeStorageSync('verification')
        this.$msg(error.return_msg || '绑定失败，请重试')
      }
    },
    // 弹窗确定
    handleConfirm() {
      this.showPopup = false

      // 根据不同的弹窗操作标识执行不同的操作
      switch (this.popupAction) {
        case 'verify-mobile':
          this.handleVerifyMobile()
          break
        case 'bind':
          // 绑定账户
          this.handleBind()
          break
        default:
          break
      }
      // 清空标识
      this.popupAction = ''
    },
    handleNavigation(url) {
      uni.navigateTo({
        url
      })
    },
    showTip(content, options = {}) {
      // 显示提示信息
      // options: { type: 'tip' | 'confirm', confirmText: '确定', cancelText: '取消', action: '操作标识', title: '标题' }
      const { type = 'tip', confirmText = '确定', cancelText = '取消', action = '', title = '温馨提示' } = options
      this.popupType = type
      this.popupAction = action
      this.popTitle = title
      this.popContent = content
      this.popCancelText = cancelText
      this.popConfirmText = confirmText
      this.showPopup = true
    }
  }
}
</script>

<style lang="scss" scoped>
.page-banlance {
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
  .tip-icon {
    color: #3246c3;
  }
  .banlance {
    margin: 0 auto;
    width: 690rpx;
    height: 450rpx;
    padding-bottom: 35rpx;
    border-radius: 20rpx;
    position: relative;
    &-total {
      padding: 30rpx 0;
      font-size: 60rpx;
      font-weight: bold;
    }
    &-button {
      width: 380rpx;
      &.btn-disabled {
        opacity: 0.5;
        background: #ccc !important;
        color: #999 !important;
      }
    }
    .banlance-explain {
      width: 100%;
      text-align: right;
      margin-bottom: -10rpx;
    }
  }
  .form-container {
    padding: 0 30rpx;
    background: #f6f7fc;
    .form {
      margin-top: 30rpx;
      padding: 10rpx 30rpx;
      background: #fff;
      border-radius: 10rpx;
      .form-title {
        @include primary-title(32rpx, #000);
      }
      &-item {
        padding: 30rpx 0;
        font-size: 30rpx;
        .key {
          color: $uni-text-color-black;
        }
        .value {
          margin-left: 30rpx;
          text-align: right;
          color: #666;
        }
        .pic {
          margin-right: 15rpx;
          width: 28rpx;
          height: 28rpx;
        }
        &.no-padding-bottom {
          padding-bottom: 0;
        }
      }
      .bind-tips {
        margin-top: 20rpx;
        display: block;
        padding: 10rpx 6rpx;
        line-height: 34rpx;
        background: #fff5e7;
        color: #ff6955;
        border-radius: 5rpx;
        margin-bottom: 20rpx;
      }
      .user_info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .left {
          display: flex;
          align-items: center;
          .avatar {
            width: 60rpx;
            height: 60rpx;
            border-radius: 50%;
          }
          text {
            margin-left: 20rpx;
          }
        }
      }
    }
  }
}
.edit-color-i {
  font-size: 30rpx;
}
</style>
