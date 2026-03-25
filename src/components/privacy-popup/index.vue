<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    :mask-click-able="false"
    :zoom="false"
    :duration="0"
    z-index="99999"
  >
    <view class="privacy-popup flex flex-middle flex-center">
      <view class="privacy-container">
        <view class="title fs-30 fw-bold text-center">温馨提示</view>
        <view class="content fs-28 fw-medium">
          为给您提供更好的服务，请允许我们在必要场景下，合理使用您的个人信息。请您仔细阅读
          <text class="link" @tap="handleLink">{{ linkName }}</text>
          。如您同意以上全部内容，请点击"同意"开始使用我们的服务！
        </view>
        <view class="footer flex flex-middle">
          <button id="disagree-btn" class="btn flex-1 fs-32" @tap="hanldeDisagree">拒 绝</button>
          <button
            id="agree-btn"
            open-type="agreePrivacyAuthorization"
            class="btn active flex-1 ml-30 fs-32"
            @agreeprivacyauthorization="hanldeAgree"
          >
            同 意
          </button>
        </view>
      </view>
    </view>
  </u-mask>
</template>

<script>
// 基础库 2.32.3 开始支持隐私接口
let privacyHandler
let privacyResolves = new Set()
let closeOtherPagePopUpHooks = new Set()

if (wx.onNeedPrivacyAuthorization) {
  wx.onNeedPrivacyAuthorization(resolve => {
    if (typeof privacyHandler === 'function') {
      privacyHandler(resolve)
    }
  })
}

const closeOtherPagePopUp = closePopUp => {
  closeOtherPagePopUpHooks.forEach(hook => {
    if (closePopUp !== hook) {
      hook()
    }
  })
}
// 放在页面顶层view的末尾即可，确保顶层view一开始可见，即view不存在动态渲染指令（v-if/v-show）
// 常规使用：<PrivacyPopup />
// 特殊使用：<PrivacyPopup ref="privacyPopup" />，搭配refresh方法，见注释说明
export default {
  name: 'PrivacyPopup',
  data() {
    return {
      showDialog: false,
      linkName: '《隐私保护指引》',
      closePopUp: () => {}
    }
  },
  mounted() {
    this.initPrivacy()
  },
  beforeDestroy() {
    closeOtherPagePopUpHooks.delete(this.closePopUp)
  },
  methods: {
    initPrivacy() {
      this.getPrivacyName()
      this.registerHandler()
    },
    getPrivacyName() {
      wx.getPrivacySetting &&
        wx.getPrivacySetting({
          success: res => {
            this.linkName = res.privacyContractName
          }
        })
    },
    registerHandler() {
      const closePopUp = () => {
        this.disPopUp()
      }
      privacyHandler = resolve => {
        privacyResolves.add(resolve)
        this.popUp()
        // 额外逻辑：当前页面的隐私弹窗弹起的时候，关掉其他页面的隐私弹窗
        closeOtherPagePopUp(closePopUp)
        // 防止部分loading遮挡
        uni.hideLoading()
      }

      this.closePopUp = closePopUp
      closeOtherPagePopUpHooks.add(this.closePopUp)
    },
    refresh() {
      /* 1. 一级页面有隐私，二级页面也有，但在二级页面显示弹窗时，直接返回，会导致一级页面无法再次弹窗
        在一级页面的onShow需再次调用才能弹窗 `this.$refs.privacyPopup.refresh()`
        2. 页面存在隐私组件，也需显示调用。（一开始无需如此，后来不知何时开始，组件无法正常调起隐私）如：
        <camera />、昵称填写<input type="nickname">、头像<button open-type="chooseAvatar">等
        3. 其他特殊情况，若页面存在隐私组件和api无法调起弹窗，可使用该方法
      */
      if (this.closePopUp) {
        privacyHandler = resolve => {
          privacyResolves.add(resolve)
          this.popUp()
          closeOtherPagePopUp(this.closePopUp)
          uni.hideLoading()
        }
      }
    },
    hanldeAgree() {
      this.disPopUp()
      privacyResolves.forEach(resolve => {
        resolve({
          event: 'agree',
          buttonId: 'agree-btn'
        })
      })
      privacyResolves.clear()
    },
    hanldeDisagree() {
      this.disPopUp()
      privacyResolves.forEach(resolve => {
        resolve({
          event: 'disagree'
        })
      })
      privacyResolves.clear()
      uni.exitMiniProgram()
    },
    popUp() {
      // if (!this.showDialog) {
      //   this.showDialog = true
      // }
      this.showDialog = true
    },
    disPopUp() {
      // if (this.showDialog) {
      //   this.showDialog = false
      // }
      this.showDialog = false
    },
    handleLink() {
      wx.openPrivacyContract && wx.openPrivacyContract()
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: privacy-popup;
.#{$prefix} {
  height: 100%;
  .privacy-container {
    width: 540rpx;
    padding: 40rpx;
    background-color: #fff;
    border-radius: 15rpx;
    box-sizing: border-box;
  }
  .content {
    margin: 36rpx 0;
    line-height: 42rpx;
    color: #000;
  }
  .link {
    color: #3b7aff;
  }
  .footer {
    margin: 0 10rpx;
  }
  .btn {
    height: 80rpx;
    line-height: 78rpx;
    background-color: #fff;
    color: #333;

    border: 1px solid #aaa;
    border-radius: 40rpx;
    &.active {
      background-color: #00b95b;
      color: #fff;
      border-color: #00b95b;
    }
  }
}
</style>
