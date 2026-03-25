<template>
  <view v-if="isShow" class="nowin-dialog-container" :class="themeStyleClass || 'theme-base-style'">
    <view class="mask" @click="handleClickMask" />
    <view class="content" :style="unWinContentStyle">
      <view class="pop__content" :style="bgWrapStyle">
        <image v-if="isReuseUnwin" class="pop__bg-top-img" :src="popTitleImg" mode="widthFix" />
        <!-- 导购背景 -->
        <image
          v-if="popBg && isBgFillHeight"
          :style="bgImageStyle"
          class="pop__bg-top-bg"
          :src="popBg"
          mode="widthFix"
        />
        <view
          class="iconfont icon-close2 close-btn"
          :style="{ top: isReuseUnwin ? '-216rpx' : '-100rpx' }"
          @click="clearAutoJumpPage"
        />
        <view ref="contentShow" class="pop__content-show" :style="contentStyle">
          <template v-if="isReuseUnwin">
            <view class="reuse-text">{{ notWinningMsg || '很遗憾，您没有获得奖励，再接再厉' }}</view>
            <view class="reuse-time">参与时间：{{ time }}</view>
          </template>
          <template v-else>
            <!-- <image
              v-if="topIcon"
              class="top-icon"
              :style="{ paddingTop: topIconPaddingTop }"
              :src="topIcon"
              mode="widthFix"
            /> -->
            <view>
              <!-- 不中奖状态 0：未中奖 1：奖品被领走 2：活动未开始 3：活动已结束 4：活动未开启 -->
              <view v-if="state === 0" class="tips-text">
                {{ notWinningMsg || '很遗憾，您没有获得奖励，再接再厉' }}
              </view>
              <view v-if="state === 1" class="tips-text">该码已被扫描过啦！</view>
              <view v-if="state === 5" class="tips-text">哦噢，您不是首次扫码人，不能参与领奖哦</view>
              <view
                v-if="state === 1"
                class="scan-info"
                :style="{ color: noWinPageSetting.tipsColor, fontWeight: 'normal' }"
              >
                <view v-if="showScanInfo">
                  <view>扫码人：{{ nickname }}</view>
                  <view>扫码时间：{{ time }}</view>
                </view>
                <award-info
                  v-show="showPrizeInfo"
                  ref="awardInfo"
                  :prize-info.sync="prizeInfo"
                  :style="{ background: '' }"
                />
              </view>
              <view v-if="[2, 3, 4].includes(state)" class="tips-text">{{ tipsText }}</view>
              <!-- 登记 -->
              <view v-if="state === 6" class="tips-text">
                <!-- 要换成自定义的 -->
                <view>恭喜你，信息登记成功</view>
                <view :style="{ color: noWinPageSetting.tipsColor, fontWeight: 'normal' }" class="fs-28 mt-20">
                  {{ registerAwardMsg || '当消费者购买并扫码时，活动奖励会自动发放给你，请注意查收！' }}
                </view>
              </view>
            </view>
          </template>
        </view>

        <view class="auto-jump-text">
          <image
            v-if="showAdImg"
            :src="adImg"
            mode="widthFix"
            class="ad-img"
            show-menu-by-longpress
            @click.stop="handleJumpAd"
          />
          <view v-if="showScanImg" :style="scanStyle">
            <image :src="scanImg" mode="widthFix" class="ad-img" @tap.stop="handleScan(2)" />
          </view>

          <view v-if="isAutoJump && showJump" class="mt-20">
            <text class="auto-jump-time">{{ autoJumpPageTime }}</text>
            秒后即将跳转
            <text v-if="autoJumpInfo.autoJumpPageText !== ''">，{{ autoJumpInfo.autoJumpPageText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import { showAdMixin, showScanImgMixin } from 'packages/scan-templates/components/scan/mixins/show-ad'
import { scanCbMixin, scanStyle1Mixin, scanQrcodeMixin } from 'packages/mixins/scan'
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */

import AwardInfo from './award-info'
export default {
  components: { AwardInfo },
  mixins: [packageStaticMixin, showAdMixin, showScanImgMixin, scanCbMixin, scanStyle1Mixin, scanQrcodeMixin],
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 不中奖状态 0：未中奖 1：奖品被领走 2：活动未开始 3：活动已结束 4：活动未开启 5非首次扫码人
    // undo需要增加已登记先暂定为6
    state: {
      type: Number,
      default: 0
    },
    notWinningMsg: {
      type: String,
      default: ''
    },
    registerAwardMsg: {
      type: String,
      default: ''
    },
    // 扫码人昵称
    nickname: {
      type: String,
      default: ''
    },
    // 首次扫码时间
    time: {
      type: String,
      default: ''
    },
    customScanConfigs: {
      type: Object,
      default() {
        return {
          WinningPage: {},
          ReuseWinningPage: {}
        }
      }
    },
    isGetPrize: {
      type: Boolean,
      default: false
    },
    // 奖项信息
    prizeInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      autoJumpPageTime: 1, // 自动跳转时间
      autoJumpPageTimer: null, // 自动跳转定时器
      showJump: true
    }
  },

  computed: {
    isBgFillHeight() {
      return this.state !== 1
    },
    // 主题
    theme() {
      return this.customScanConfigs.WinningPage.theme
    },
    isCustomTheme() {
      return this.theme === 2 && this.isReuseUnwin
    },
    themeStyleClass() {
      if (!this.isCustomTheme) return ''
      switch (this.theme) {
        case 2:
          return 'theme-style-second'
        default:
          return ''
      }
    },
    bgImageStyle() {
      // 开发者工具不方便调试，用字符串拼接
      let styleStr = `border-radius:${this.isReuseUnwin ? '0 0 18rpx 18rpx' : '18rpx'};`
      if (this.state !== 1) {
        styleStr += `max-height:600rpx; min-height: 500rpx;`
      }
      return styleStr
    },
    // 内容样式
    contentStyle() {
      let s = []
      if (!this.isBgFillHeight) {
        // 已领奖的采用根据内容撑开不根据背景来
        s.push('position:relative;')
      } else {
        if (this.noWinPageSetting.PaddingTop) {
          s.push(`top: ${this.noWinPageSetting.PaddingTop}`)
        } else if (this.isReuseUnwin) {
          s.push(`top: -80rpx; bottom: 0;justify-content: center;`)
        } else if (this.popBg) {
          if (this.noWinPageSetting.align === 'top') {
            s.push(`top: 60rpx;`)
          } else if (this.noWinPageSetting.align === 'center') {
            s.push(`top: 0;bottom: 0;display: flex; align-items: center;justify-content: center;`)
          } else if (this.noWinPageSetting.align === 'bottom') {
            // 未中奖会低一点
            if (this.state === 0 && !this.isGetPrize) {
              s.push(`top: 472rpx;`)
            } else {
              s.push(`top: 380rpx;`)
            }
          } else {
            s.push(`top: 380rpx;`)
          }
        } else if (!this.popBg) {
          s.push(`justify-content: center;`)
        }
        if (!this.popBg && !this.isReuseUnwin) {
          s.push(`background:linear-gradient(0deg, #FFFFFF 0%, #FFF8EC 100%); border-radius: 18rpx; height: 100%;`)
        }
      }

      if (this.noWinPageSetting.color) {
        s.push(`color: ${this.noWinPageSetting.color}`)
      }
      if (this.noWinPageSetting.fontSize) {
        s.push(`font-size: ${this.noWinPageSetting.fontSize * 2}rpx`)
      }
      if (this.noWinPageSetting.fontWeight) {
        s.push(`font-weight: ${this.noWinPageSetting.fontWeight}`)
      }

      return s.join(';')
    },
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    unWinContentStyle() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      if (this.isCustomTheme) {
        let top = `${44 + this.statusBarHeight}px`
        style = `margin-top: ${top};height: calc(100vh - ${top});`
      }
      /* #endif */
      return style
    },
    popContentMarginTop() {
      // 顶部适配
      let style = ''
      if (this.isCustomTheme) {
        let paddingTop
        /* #ifdef MP-WEIXIN */
        if (this.showAdImg) {
          paddingTop = 120
        } else {
          paddingTop = 260
        }
        style = `${paddingTop}rpx`
        /* #endif */
        /* #ifdef H5 */
        if (this.showAdImg) {
          paddingTop = 200
        } else {
          paddingTop = 300
        }
        style = `${paddingTop}rpx`
        /* #endif */
      }
      return style
    },
    // 背景颜色
    bgWrapStyle() {
      // 开发者工具不方便调试，用字符串拼接
      let styleStr = `border-radius:${this.isReuseUnwin ? '0 0 18rpx 18rpx' : '18rpx'};`
      if (this.isCustomTheme && this.popContentMarginTop) {
        styleStr += `margin-top: ${this.popContentMarginTop};`
      }
      if (!this.isBgFillHeight) {
        // 已领奖的采用撑开的
        styleStr += `padding-bottom: ${this.state === 1 ? '50rpx' : '110rpx'};`
        styleStr += `background-image:url(${this.popBg});`
        styleStr += `background-size:100% auto;`
        styleStr += `background-repeat: no-repeat;`
        styleStr += `background-color: ${this.popBgColor};`
        styleStr += `padding-top: 372rpx;`
      } else if (!this.popBg) {
        // 配置最小高度
        switch (this.state) {
          case 0:
            styleStr += `min-height: ${this.isReuseUnwin ? '600rpx' : '400rpx'};`
            break
          case 6:
            styleStr += `min-height: 580rpx;`
            break
          case 2:
          case 3:
          case 4:
          case 5:
          default:
            styleStr += `min-height: 480rpx;`
            break
        }
      }

      return styleStr
    },
    topIconPaddingTop() {
      if (this.isReuseUnwin) {
        return '90rpx'
      } else if (!this.isGetPrize && this.state === 2) {
        return '70rpx'
      } else {
        return '110rpx'
      }
    },
    isReuseUnwin() {
      //是否是重复领奖
      return this.state === 0 && this.isGetPrize
    },
    noWinPageSetting() {
      // 不中奖状态 0：未中奖 1：奖品被领走 2：活动未开始 3：活动已结束 4：活动未开启 5:非首次 6已登记
      switch (this.state) {
        case 0:
          return this.isReuseUnwin ? this.customScanConfigs.ReuseWinningPage : this.customScanConfigs.NoWinningPage
        case 1:
          return this.customScanConfigs.TakePage
        case 2:
          return this.customScanConfigs.UnplayedPage
        case 3:
          return this.customScanConfigs.OverPage
        case 4:
          return this.customScanConfigs.NotOpenPage
        case 6:
          return this.customScanConfigs.HaveRegisteredPage
        default:
          return {}
      }
    },
    // 顶部图标
    // 没有中奖，并且第二次扫，用重复中奖的样式
    popTitleImg() {
      return this.isCustomTheme ? this.noWinPageSetting.winTopImg2 : this.noWinPageSetting.winTopImg
    },
    // 背景图片
    popBg() {
      if (this.isCustomTheme) return ''
      if (!this.noWinPageSetting) return ''
      let bgUrl = this.noWinPageSetting.winBgImg || this.noWinPageSetting.bg
      if (!bgUrl) {
        // 默认数据填充
        if (this.state === 0) bgUrl = this.PACKAGE_STATIC_URL + 'scan/default/popup-bg.png'
        if (this.state === 1) bgUrl = this.PACKAGE_STATIC_URL + 'scan/default/win-state-bg.png'
        if (this.state === 2) bgUrl = this.PACKAGE_STATIC_URL + 'scan/default/win-state-bg.png'
        if (this.state === 3) bgUrl = this.PACKAGE_STATIC_URL + 'scan/default/win-state-bg.png'
        if (this.state === 4) bgUrl = this.PACKAGE_STATIC_URL + 'scan/default/win-state-bg.png'
      }
      return bgUrl
    },
    // 背景颜色
    popBgColor() {
      if (!this.noWinPageSetting) return ''
      let bgColor = this.noWinPageSetting.winBgColor || this.noWinPageSetting.bgColor
      if (!bgColor) {
        // 默认数据填充
        // if (this.state === 0) bgColor = '#fff'
        if (this.state === 1) bgColor = '#fff'
        // if (this.state === 2) bgColor = this.PACKAGE_STATIC_URL + 'scan/default/win-state-bg.png'
        // if (this.state === 3) bgColor = this.PACKAGE_STATIC_URL + 'scan/default/win-state-bg.png'
        // if (this.state === 4) bgColor = this.PACKAGE_STATIC_URL + 'scan/default/win-state-bg.png'
      }
      return bgColor
    },
    autoJumpInfo() {
      return this.noWinPageSetting?.jumpInfo || {}
    },
    isAutoJump() {
      return !!this.noWinPageSetting?.isAutoJump
    },
    showScanInfo() {
      return this.noWinPageSetting?.showScanInfo
    },
    showPrizeInfo() {
      return this.noWinPageSetting?.showPrizeInfo
    },
    tipsText() {
      return this.noWinPageSetting.tipsText || ''
    }
  },

  watch: {
    isShow(val) {
      if (val && this.isAutoJump) {
        this.showJump = true
        this.handleAutoJumpPage()
      }
      if (!val && this.state === 0 && !this.isGetPrize) {
        this.$emit('update:isGetPrize', true)
      }
      if (val) {
        // 判断广告位
        this.setShowAdImg(this.noWinPageSetting)
        // 判断扫一扫
        this.setShowScanImg(this.noWinPageSetting)
      }
    }
  },

  methods: {
    handleJumpAd() {
      /* #ifdef MP-WEIXIN */
      let { appid: appId, link, sceneType: scene, type } = this.noWinPageSetting?.imgInfo || {}
      navigateToMP({
        appId,
        path: link,
        scene,
        type
      })
      /* #endif */
      /* #ifdef H5 */
      if (this.noWinPageSetting?.imgInfo?.link) {
        location.href = this.noWinPageSetting.imgInfo.link
      }
      /* #endif */
    },
    clearAutoJumpPage() {
      clearInterval(this.autoJumpPageTimer)
      this.handleCloseDialog()
    },
    // 点击遮罩
    handleClickMask() {
      this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    },
    // 领奖自动跳转
    handleAutoJumpPage() {
      this.autoJumpPageTime = Number(this.autoJumpInfo.autoJumpPageTime)
      this.autoJumpPageTimer = setInterval(() => {
        let pages = getCurrentPages()
        const page = `/${pages[pages.length - 1].route}`
        if (!page.includes('/scan-templates/')) {
          this.showJump = false
          return clearInterval(this.autoJumpPageTimer)
        }
        if (this.autoJumpPageTime <= 0) {
          clearInterval(this.autoJumpPageTimer)
          /* #ifdef H5 */
          let path = this.autoJumpInfo.link.includes('http') ? this.autoJumpInfo.link : '//' + this.autoJumpInfo.link
          location.href = path
          /* #endif */
          /* #ifdef MP-WEIXIN */
          this.handleCloseDialog()
          let { appid: appId, link, sceneType: scene, type } = this.autoJumpInfo
          navigateToMP({
            appId,
            path: link,
            scene,
            type
          })
          /* #endif */
          return
        }
        this.autoJumpPageTime--
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/user-unwin-theme2.scss';
.nowin-dialog-container {
  position: fixed;
  z-index: 20000;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  overflow: hidden auto;

  .mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;
    /* #ifdef MP-WEIXIN */
    // top: 100rpx;

    animation: tanchuang 0.4s ease-in-out;
    /* #endif */

    .pop__bg-top-img {
      width: 620rpx;
      transform: translateY(-100%);
      position: absolute !important;
      top: 1px;
      left: 0;
    }
    .pop__bg-top-bg {
      width: 620rpx;
      max-height: 800rpx;
      border-radius: 18rpx;
      background-size: 100% 100%;
    }
    .pop__content {
      position: relative;

      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      width: 620rpx;
      border-radius: 18rpx;
      background-size: 100% 100%;
      .pop__content-show {
        position: absolute;
        top: 0;

        display: flex;
        align-items: center;
        flex-direction: column;

        width: 100%;
        padding: 0 55rpx 0;

        font-family: PingFang SC;
        font-size: 32rpx;
        font-weight: bold;
      }
    }

    .close-btn {
      position: absolute;
      right: 0rpx;
      top: -328rpx;
      color: #fff;
      font-size: 74rpx;
    }
    .top-icon {
      width: 371rpx;
      height: 300rpx;
    }
    .top-icon-bg {
      width: 100%;
      height: 500rpx;
      border-radius: 18rpx 18rpx 0 0;
    }
    .tips-text {
      text-align: center;
    }
    .scan-info {
      margin-top: 30rpx;

      text-align: center;

      color: #999999;

      font-size: 28rpx;
      line-height: 40rpx;
    }
    .reuse-text {
      margin-top: 150rpx;

      text-align: center;

      color: #e8422c;

      font-size: 30rpx;
      font-weight: bold;
    }
    .reuse-time {
      margin: 20rpx 0 140rpx 0;

      color: #d5a39c;

      font-size: 24rpx;
      font-weight: 500;
    }
  }

  .auto-jump-text {
    position: absolute;
    right: 0;
    top: 100%;
    left: 0;
    padding-bottom: 30rpx;
    text-align: center;
    color: #fff;
    font-size: 30rpx;
    font-weight: 700;
    .ad-img {
      margin-top: 20rpx;
    }
  }
  .auto-jump-time {
    color: #ffd70f;
    font-size: 40rpx;
  }
}

@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
