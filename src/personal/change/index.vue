<template>
  <view class="page-change flex flex-column" :style="themeVars">
    <view :style="bgStyle" class="bg">
      <title-bar
        type="detail"
        show-nav-title
        :show-placeholder="true"
        :bgcolor="titleBgColor"
        :bg-pic="titleBg"
        title="我的零钱"
      />
      <view class="change-top flex flex-column flex-middle">
        <view class="explain" @tap="showExplain">
          <text class="icon iconfont iconbangzhu fs-28 pr-10 fw-bold" />
          零钱说明
        </view>
        <view class="number">￥{{ listData.total | cashFixedTwo }}</view>
        <view class="text">零钱金额</view>
        <view v-if="!listData.isenablewithdraw" class="button fw-bold disabled">提现</view>
        <view v-if="listData.isenablewithdraw" class="button fw-bold" @tap="jumpGetChange">提现</view>
      </view>
    </view>
    <view class="change-today bgc-primary flex flex-middle flex-center c-f tx-c" :style="barOpacity">
      <view class="income flex-1">
        <view class="fs-30">￥{{ listData.income | cashFixedTwo }}</view>
        <view class="fs-24">今日收入</view>
      </view>
      <view class="pay flex-1">
        <view class="fs-30">￥{{ listData.expense | cashFixedTwo }}</view>
        <view class="fs-24">今日支出</view>
      </view>
    </view>
    <view class="flex-1">
      <view class="change-nav bg-f">
        <view v-for="(item, index) in changeNavList" :key="index" class="item flex flex-middle bd-e">
          <view :style="item.style" :class="[item.icon, 'nav-icon icon iconfont c-f flex flex-center flex-middle']" />
          <view class="c-3 fs-30 fw-bold ub-f1 ml-30" @tap="handleNav(item.path)">{{ item.name }}</view>
          <view class="icon iconfont icon-more" />
        </view>
      </view>
      <!-- #ifdef MP-RETAIL -->
      <bind-account ref="bindAccount" class="block mt-20" />
      <!-- #endif -->
    </view>

    <!-- #ifdef MP-MEMBER || MP-CLOUDSHOP -->
    <md-copyright />
    <!-- #endif -->
    <change-explain ref="ChangeExplain" />
    <common-popup
      v-model="showPopup"
      type="tip"
      :title="popTitle"
      :content="popContent"
      :cancel-text="popCancelText"
      @close="handleCloseDialog"
    />
    <!-- #ifdef MP-RETAIL -->
    <common-popup
      v-model="showCommonPopup.show"
      type="confirm"
      :title="showCommonPopup.title"
      :content="showCommonPopup.content"
      cancel-text="知道了"
      confirm-text="换绑微信"
      @confirm="handlCommonPopupCallback"
    />
    <!-- #endif -->
    <!-- 实名认证弹窗 -->
    <realname-auth-popup
      v-model="showRealnameAuthPopup"
      :mode="3"
      @confirm="handleRealnameAuthConfirm"
      @cancel="handleRealnameAuthCancel"
    />
  </view>
</template>


<script>
import { apiGetExchange } from 'packages/api/change.js'
import ChangeExplain from '../components/change-explain.vue'
import TitleBar from 'packages/components/title-bar/title-bar.vue'
import { changeIndexBg } from 'packages/utils/default-picture'
import CommonPopup from 'packages/components/common-popup/common-popup'
import popupMixin from 'packages/mixins/popup'
import { cashFixedTwo } from 'packages/filters'
// #ifdef MP-RETAIL
import { mapState } from 'vuex'
import { uniLogin } from 'packages/utils/login.js'
import BindAccount from '@/components/bind-account'
import RealnameAuthPopup from 'packages/components/realname-auth-popup/index.vue'
import { realnameAuthPopupSimpleMixin, realnameAuthNavigationMixin } from 'packages/mixins/realname-auth'
// #endif
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    ChangeExplain,
    TitleBar,
    CommonPopup,
    // #ifdef MP-RETAIL
    RealnameAuthPopup,
    BindAccount
    // #endif
  },
  filters: {
    cashFixedTwo
  },
  mixins: [
    popupMixin,
    // #ifndef MP-RETAIL
    notThemeMixin,
    // #endif
    // #ifdef MP-RETAIL
    realnameAuthPopupSimpleMixin,
    realnameAuthNavigationMixin
    // #endif
  ],
  data() {
    return {
      // #ifdef MP-RETAIL
      showCommonPopup: {
        show: false,
        title: '温馨提示',
        content: '当前门店账号绑定的微信账号与当前登录微信账号不一致，无法提现红包零钱至微信。',
        cancelText: '确定'
      },
      // #endif
      changeNavList: [
        {
          name: '收支明细',
          icon: 'icon-mingxi',
          path: '/packages/src/personal/change/change-list',
          style: 'background: linear-gradient(90deg, #39A4FF 0%, #84DAFF 100%);font-size: 34rpx'
        },
        {
          name: '提现记录',
          icon: 'icon-money',
          path: '/packages/src/personal/change/withdraw-record',
          style: 'background: linear-gradient(90deg, #FF7640 0%, #FFB375 100%);font-size: 37rpx'
        }
      ],
      loading: true,
      busy: false,
      bgPic: changeIndexBg,
      listData: {},
      authState: 0, // 1 授权状态
      authCount: 0,
      isWithdrawFailed: false // 是否是提现失败提示
    }
  },
  computed: {
    // #ifdef MP-RETAIL
    ...mapState(['userOpenid', 'isSpecialMp']),
    leaderOpenid() {
      return uni.getStorageSync('leaderOpenid')
    },
    // #endif
    titleBg() {
      let style = ''
      // #ifdef MP-MEMBER || MP-CLOUDSHOP
      style = this.bgPic
      // #endif
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      style = ''
      // } else {
      //   style = this.bgPic
      // }
      // #endif
      return style
    },
    titleBgColor() {
      let style = ''
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      style = this.themeInfo.color
      // }
      // #endif
      return style
    },
    bgStyle() {
      let style = []
      // #ifdef MP-MEMBER || MP-CLOUDSHOP
      style.push(`background-image: url(${this.bgPic})`)
      // #endif
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      style.push(`background-color: var(--theme-color)`)
      // } else {
      //   style.push(`background-image: url(${this.bgPic})`)
      // }
      // #endif
      return style.join(';')
    },
    barOpacity() {
      let opacity = 1
      // #ifdef MP-RETAIL
      // if (this.isSpecialMp) {
      opacity = 0.9
      // }
      // #endif
      return `opacity: ${opacity}`
    }
  },
  onShow() {
    if (this.authState === 1) {
      this.authState = 0
      setTimeout(() => {
        this.fetchData()
      }, 200)
    } else {
      this.fetchData()
    }
    // 检查是否有提现失败标记
    const withdrawFailed = uni.getStorageSync('withdrawFailed')
    if (withdrawFailed) {
      // 清空缓存
      uni.removeStorageSync('withdrawFailed')
      // 标记为提现失败提示
      this.isWithdrawFailed = true
      this.$loading.hide()
      // 显示提现失败提示
      this.popTitle = '提现失败'
      this.popContent = '您的资金将在24小时内自动退回原账户！'
      this.showPopup = true
    }
  },
  methods: {
    // #ifdef MP-RETAIL
    handlCommonPopupCallback() {
      this.showCommonPopup.show = false
      this.$refs.bindAccount.handleBindWx()
    },
    // #endif
    async fetchData() {
      this.$loading.show()
      await this.getData()
      this.$loading.hide()
    },
    handleNav(url) {
      uni.navigateTo({
        url: url
      })
    },
    handleCloseDialog() {
      this.showPopup = false
      // 如果是提现失败提示，不返回上一页；其他情况保持原有逻辑
      if (!this.isWithdrawFailed) {
        uni.navigateBack()
      } else {
        // 重置标记
        this.isWithdrawFailed = false
      }
    },
    async jumpGetChange() {
      // #ifdef MP-RETAIL
      if (this.leaderOpenid !== this.userOpenid) {
        this.showCommonPopup.show = true
        return
      }
      // 检查实名认证状态
      const needCheckAuth = await this.checkRealnameAuthStatus()
      if (needCheckAuth) {
        // 未认证，显示弹窗
        this.showRealnameAuthPopup = true
        return
      }
      // #endif
      // 已认证，继续提现流程
      let total = this.listData.total
      let allow = !!this.listData.isenablewithdraw
      uni.navigateTo({
        url: `./withdraw?total=${total}&allow=${+allow}`
      })
    },
    showExplain() {
      this.$refs.ChangeExplain.show()
    },
    async getData() {
      if (this.busy) return
      this.busy = true

      let param = {}
      // #ifdef MP-RETAIL
      param = { js_code: await uniLogin() }
      // #endif

      let res = await apiGetExchange(param)
      this.busy = false

      // #ifdef MP-RETAIL
      if (!this.userOpenid && res.return_data?.authurl) {
        this.listData = res.return_data
        this.loading = false
        return this.mdAuthorize(2, res.return_data.authurl)
      }
      // #endif

      if (res.return_code === 0) {
        this.listData = res.return_data
        this.loading = false
      } else if (res.return_code === 30008) {
        let mdChangeCode = res.return_data.code
        let url = res.return_data.targeturl
        uni.setStorageSync('mdChangeCode', mdChangeCode)
        this.authCount++
        if (this.authCount > 2) {
          this.authCount = 0
          return this.$msg('绑定openid失败，请重试！')
        }
        this.mdAuthorize(1, url)
      } else {
        this.$msg(res.return_msg)
      }
    },
    async mdAuthorize(type, url) {
      uni.setStorageSync('mdChangeTargeturl', url)
      this.authState = 1
      await new Promise(() => {
        uni.navigateTo({ url: `/packages/src/personal/auth?type=${type}` })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/change.scss';
.page-change {
  min-height: 100vh;
  .bg {
    background-repeat: no-repeat;
    background-size: 750rpx 100%;
    padding-bottom: 20rpx;
  }
  .change-top {
    height: 400rpx;
    position: relative;
    .number {
      font-size: 72rpx;
      font-weight: 700;
      padding: 100rpx 0 20rpx;
      color: #fff;
    }
    .text {
      font-size: 28rpx;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
    }
    .explain {
      position: absolute;
      font-weight: 500;
      font-size: 26rpx;
      color: #fff;
      padding: 25rpx;
      right: 0;
      top: 0;
    }
    .button {
      margin: 40rpx auto 0;
      width: 302rpx;
      height: 72rpx;
      line-height: 72rpx;
      font-size: 32rpx;
      background: rgba(255, 255, 255, 1);
      border-radius: 36rpx;
      text-align: center;
      /* #ifdef MP-RETAIL */
      color: var(--theme-color, $uni-color-primary);
      /* #endif */
      /*  #ifdef MP-MEMBER || MP-CLOUDSHOP  */
      background-color: #fff;
      color: #ffa200;
      /*  #endif  */
      &.disabled {
        background: linear-gradient(90deg, rgba(213, 213, 213, 1) 0%, rgba(224, 224, 224, 1) 100%);
        border-radius: 45px;
        color: #fafafa;
      }
    }
  }
  .change-today {
    height: 110rpx;
    .pay {
      @include border-left(#e5e5e5, 100rpx, 0, 10rpx);
    }
  }
  .change-nav {
    margin-top: 20rpx;
    .item {
      margin: 0 40rpx 0 30rpx;
      padding: 40rpx 0 40rpx 0;
      .nav-icon {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
      }
      .icon-more {
        color: #333;
        font-size: 20rpx;
      }
    }
  }
}
.block {
  display: block;
  padding: 0 20rpx;
}
</style>
