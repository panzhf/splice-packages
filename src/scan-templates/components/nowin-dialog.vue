<template>
  <view v-if="isShow" class="nowin-dialog-container">
    <view class="mask" @click="handleClickMask" />
    <view class="content">
      <image v-if="state === 0" class="main-img" :src="notWinImg" mode="widthFix" />
      <image v-if="state === 1 || state === 5" class="main-img" :src="byCollectImg" mode="widthFix" />
      <image v-if="state === 2" class="main-img" :src="notStartImg" mode="widthFix" />
      <image v-if="state === 3" class="main-img" :src="endImg" mode="widthFix" />
      <image v-if="state === 4" class="main-img" :src="notOpenImg" mode="widthFix" />
      <view v-if="state === 5 && nickname && time" class="scan-info">
        <view>扫码人：{{ nickname }}</view>
        <view>扫码时间：{{ time }}</view>
      </view>
      <image
        v-if="state === 2 || state === 4"
        class="btn-img"
        :src="waitBtn"
        mode="widthFix"
        @click="handleCloseDialog"
      />
      <image v-else class="btn-img" :src="knowBtn" mode="widthFix" @click="handleCloseDialog" />
      <view v-if="isAutoJump && (state === 0 || state === 1) && showJump" class="auto-jump-text">
        <text class="auto-jump-time">{{ autoJumpPageTime }}</text>
        秒后即将跳转
        <text v-if="autoJumpInfo.SaoMaResultAutoJumpPageText !== ''">
          ，{{ autoJumpInfo.SaoMaResultAutoJumpPageText }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { packageStaticMixin } from 'packages/mixins/static-url'
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
export default {
  mixins: [packageStaticMixin],
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 不中奖状态 0：未中奖 1：奖品被领走 2：活动未开始 3：活动已结束 4：活动未开启
    state: {
      type: Number,
      default: 0
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
    // 是否自动跳转
    isAutoJump: {
      type: Boolean,
      default: false
    },
    // 自动跳转信息
    autoJumpInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      autoJumpPageTime: 1, // 自动跳转时间
      byCollectImg: staticURL(true) + 'scan/by-collect-img.png', // 奖品被领走
      endImg: staticURL(true) + 'scan/end-img.png', // 活动已结束
      notOpenImg: staticURL(true) + 'scan/not-open-img.png', // 活动未开启
      notStartImg: staticURL(true) + 'scan/not-start-img.png', // 活动未开始
      notWinImg: staticURL(true) + 'scan/not-win-img.png', // 未中奖
      knowBtn: staticURL(true) + 'scan/know-btn.png', // 知道了
      waitBtn: staticURL(true) + 'scan/wait-btn.png', // 等会再来
      showJump: true
    }
  },
  watch: {
    isShow(val) {
      if (val && this.isAutoJump && (this.state === 0 || this.state === 1)) {
        this.showJump = true
        this.handleAutoJumpPage()
      }
    }
  },
  methods: {
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
      this.autoJumpPageTime = Number(this.autoJumpInfo.SaoMaResultAutoJumpPageTime)
      let timer = setInterval(() => {
        let pages = getCurrentPages()
        const page = `/${pages[pages.length - 1].route}`
        if (!page.includes('/scan-templates/')) {
          this.showJump = false
          return clearInterval(timer)
        }
        if (this.autoJumpPageTime <= 0) {
          clearInterval(timer)
          /* #ifdef H5 */
          let path = this.autoJumpInfo.SaoMaResultAutoJumpPagePath.includes('http')
            ? this.autoJumpInfo.SaoMaResultAutoJumpPagePath
            : '//' + this.autoJumpInfo.SaoMaResultAutoJumpPagePath
          location.href = path
          /* #endif */
          /* #ifdef MP-WEIXIN */
          console.log('微信自动跳转', this.autoJumpInfo.SaoMaResultAutoJumpPagePathSetting)
          this.handleCloseDialog()
          const current = this.autoJumpInfo.SaoMaResultAutoJumpPagePathSetting
          if (current.JumpType === 1 || current.JumpType === 2) {
            uni.navigateTo({
              url: current.JumpType === 2 ? '/' + current.Link : current.Link
            })
            return
          }
          if (current.JumpType === 3) {
            if (current.MpAppID === '') {
              navigateToMP({
                path: current.Link
              })
            } else {
              navigateToMP({
                appId: current.MpAppID,
                path: current.Link,
                onlyMp: true
              })
            }
            return
          }
          if (current.JumpType === 4) {
            navigateToMP({
              path: current.Link,
              type: 7
            })
            return
          }
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
.nowin-dialog-container {
  position: fixed;
  z-index: 20000;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;
    z-index: 200;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .scan-info {
      margin-bottom: 10rpx;
      font-size: 26rpx;
      text-align: center;
      color: #fff4b7;
    }

    .main-img {
      width: 700rpx;
    }
    .btn-img {
      width: 300rpx;
    }
  }

  .auto-jump-text {
    position: absolute;
    bottom: -100rpx;
    left: 0;
    right: 0;
    font-size: 30rpx;
    font-weight: 700;
    color: #fff;
    text-align: center;
  }
  .auto-jump-time {
    font-size: 40rpx;
    color: #ffd70f;
  }
}
</style>
