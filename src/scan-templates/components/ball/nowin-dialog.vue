<template>
  <view v-if="isShow" class="nowin-dialog-container">
    <view class="mask" @click="handleClickMask" />
    <view class="content">
      <image class="ball" :src="ballPng" mode="widthFix" />
      <view v-if="state === 0" class="tips-text">哦噢！您没有获得奖励，再接再厉！</view>
      <view v-if="state === 1" class="tips-text">哦噢，该码已经被扫描过啦！</view>
      <view v-if="state === 1" class="scan-info">
        <view>扫码人：{{ nickname }}</view>
        <view>扫码时间：{{ time }}</view>
      </view>
      <view v-if="state === 2" class="tips-text">哦噢，活动未开始哦！</view>
      <view v-if="state === 3" class="tips-text">哦噢，您来晚啦，活动已结束了！</view>
      <view v-if="state === 4" class="tips-text">哦噢，活动未开启！</view>
      <view v-if="state === 5" class="tips-text">哦噢，您不是首次扫码人，不能参与领奖哦</view>
      <view class="close-button" @click="handleCloseDialog">知道了</view>
      <view v-if="isAutoJump && (state === 0 || state === 1)" class="auto-jump-text">
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
    // 不中奖状态 0：未中奖 1：奖品被领走 2：活动未开始 3：活动已结束 4：活动未开启 5非首次扫码人
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
      ballPng: staticURL(true) + 'ball/ball.png'
    }
  },
  watch: {
    isShow(val) {
      if (val && this.isAutoJump && (this.state === 0 || this.state === 1)) {
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
        if (this.autoJumpPageTime <= 0) {
          clearInterval(timer)
          /* #ifdef H5 */
          let path = this.autoJumpInfo.SaoMaResultAutoJumpPagePath.includes('http')
            ? this.autoJumpInfo.SaoMaResultAutoJumpPagePath
            : '//' + this.autoJumpInfo.SaoMaResultAutoJumpPagePath
          location.href = path
          /* #endif */
          /* #ifdef MP-WEIXIN */
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
    width: 540rpx;
    background-color: #fff;
    border-radius: 10rpx;
    .ball {
      width: 134rpx;
      height: 133rpx;
      margin-top: 100rpx;
      margin-bottom: 70rpx;
    }
    .tips-text {
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: bold;
    }
    .scan-info {
      margin-top: 30rpx;
      font-size: 28rpx;
      text-align: center;
      color: #666666;
    }
    .close-button {
      width: 340rpx;
      height: 80rpx;
      border-radius: 40rpx;
      background: linear-gradient(0deg, #ff3766 0%, #cf0037 100%);
      font-size: 32rpx;
      font-family: PingFang SC;
      font-weight: bold;
      text-align: center;
      line-height: 80rpx;
      margin: 50rpx 0;
      color: #fff;
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
