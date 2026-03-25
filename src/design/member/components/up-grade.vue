<template>
  <view v-if="membergrade.value" class="upgrade" catchtouchmove="preventMove">
    <view class="upgrade-mask"></view>
    <view
      class="upgrade-body"
      :style="{ top: `${titleBarHeight}px + calc(${(3 - membergrade.membergraderewards.length) * 10}%)` }"
    >
      <image class="badge-circle" :src="upgrade['circle']" />
      <image class="badge-circle2" :src="upgrade['circle']" />
      <image class="badge-line" :src="upgrade['badgeLine']" />
      <image class="badge-line line2" :src="upgrade['badgeLine']" />
      <image class="badge-line line3" :src="upgrade['badgeLine']" />
      <image class="badge-line line4" :src="upgrade['badgeLine']" />
      <image class="badge-body" :src="upgrade.vipBadge" />
      <image class="badge-light" :src="upgrade['whiteBall']" />
      <image class="badge-small-ball small1" :src="upgrade['smallCircle']" />
      <image class="badge-small-ball small2" :src="upgrade['smallCircleYellow']" />
      <image class="badge-small-ball small3" :src="upgrade['smallCircle']" />
      <image class="badge-small-ball small4" :src="upgrade['smallCircleYellow']" />
      <image class="badge-small-ball small5" :src="upgrade['smallCircle']" />
      <image class="badge-small-ball small6" :src="upgrade['smallCircle']" />
      <view class="grade-box">
        <view class="grade-text">
          恭喜升级为{{ membergrade.name }}
          <text v-if="membergrade.membergraderewards.length > 0">，</text>
          <view v-if="membergrade.membergraderewards.length > 0">获得以下奖励：</view>
        </view>
        <block v-for="(item, index) in membergrade.membergraderewards" :key="index">
          <view
            v-if="item.rewardtype == 5"
            class="prize-item coupon"
            :style="{ backgroundImage: `url(${memberPlan.level_prize_bg})` }"
          >
            <view class="alpha">
              <view class="icon-box shrink-0">
                <view class="icon iconfont icon-weixin-coupon"></view>
              </view>
              <view class="title ut-s">{{ item.rewardname }}</view>
            </view>
            <view class="beta" @tap.stop="useCoupon(item)">立即使用</view>
          </view>
          <view
            v-if="item.rewardtype == 3 || item.rewardtype == 10"
            class="prize-item money"
            :style="{ backgroundImage: `url(${memberPlan.level_prize_bg})` }"
          >
            <view class="alpha">
              <view class="icon-box shrink-0">
                <view class="icon iconvip iconviphongbaolingqian"></view>
              </view>
              <view>
                <view class="title ut-s">
                  {{ item.rewardvalue }}元{{ item.rewardtype == 3 ? '红包零钱' : '微信红包' }}
                </view>
                <view v-if="item.rewardtype == 3" class="desc fs-24 mt-20">
                  已到账，请到【个人中心-红包零钱】查看提现
                </view>
                <view v-else class="desc fs-24 mt-20">
                  红包已发出，请到微信上查阅
                  <text class="fs-22">（若未到账请联系客服补发）</text>
                </view>
              </view>
            </view>
            <view v-if="item.rewardtype == 3" class="beta" @tap.stop="pocketMoney">前往提现</view>
          </view>
          <view
            v-if="item.rewardtype == 2"
            class="prize-item score"
            :style="{ backgroundImage: `url(${memberPlan.level_prize_bg})` }"
          >
            <view class="alpha">
              <view class="icon-box shrink-0">
                <view class="icon iconvip iconvipjifen"></view>
              </view>
              <view>
                <view class="title ut-s">{{ item.rewardvalue }}{{ item.rewardname }}</view>
                <view class="desc fs-24 mt-20">可用于礼品兑换</view>
              </view>
            </view>
          </view>
        </block>
      </view>
    </view>
    <view class="icon iconfont icon-close2" @tap.stop="hideToast"></view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    membergrade: {
      type: Object,
      default: () => {
        return {
          number: -1,
          name: '',
          membergraderewards: [],
          value: false
        }
      }
    }
  },
  data() {
    return {
      upgrade: {
        circle: staticURL() + `upgrade/circle.png`,
        smallCircle: staticURL() + `upgrade/small-circle.png`,
        smallCircleYellow: staticURL() + `upgrade/small-circle-yellow.png`,
        whiteBall: staticURL() + `upgrade/white-ball.png`,
        badgeLine: staticURL() + `upgrade/badge-line.png`,
        newUpgradeList: [
          staticURL() + `upgrade/newgrades/0.png`,
          staticURL() + `upgrade/newgrades/1.png`,
          staticURL() + `upgrade/newgrades/2.png`,
          staticURL() + `upgrade/newgrades/3.png`,
          staticURL() + `upgrade/newgrades/4.png`,
          staticURL() + `upgrade/newgrades/5.png`,
          staticURL() + `upgrade/newgrades/6.png`,
          staticURL() + `upgrade/newgrades/7.png`,
          staticURL() + `upgrade/newgrades/8.png`,
          staticURL() + `upgrade/newgrades/9.png`,
          staticURL() + `upgrade/newgrades/10.png`
        ],
        vipBadge: staticURL() + `upgrade/newgrades/vip.png`
      },
      memberPlan: {
        level_bg: staticURL() + `level/level-bg.png`,
        level_circle_bg: staticURL() + `level/level-circle-bg.png?v=2`,
        level_content: staticURL() + `level/level-content.png`,
        level_explain: staticURL() + `level/level-explain.png`,
        level_plan: staticURL() + `level/level-plan.jpg`,
        level_plan_poster: staticURL() + `level/level-plan-poster.png`,
        level_prize_bg: staticURL() + `level/level-prize-bg.png`,
        level_tip: staticURL() + `level/level-tip.png`,
        level_title: staticURL() + `level/level-title.png`,
        level_upgrade: staticURL() + `level/level-upgrade.png?v=2`,
        level_noObtained: staticURL() + `level/noObtained.png`
      }
    }
  },
  computed: {
    titleBarHeight() {
      /**
       * 顶部适配
       */
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight + 44
    }
  },
  methods: {
    hideToast() {
      this.$emit('closeUpgrade', false)
    },
    preventMove() {},
    useCoupon(couponinfo) {
      this.$emit('onUseCoupon', couponinfo)
    },
    pocketMoney() {
      uni.navigateTo({
        url: '/personal/change/index'
      })
      this.$emit('closeUpgrade', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.upgrade {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  .upgrade-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10001;
    background: rgba(0, 0, 0, 0.8);
  }
  .upgrade-body {
    position: fixed;
    z-index: 10002;
    top: 12%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    .badge-circle {
      position: absolute;
      top: 90rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 320rpx;
      height: 320rpx;
      animation: scale 1s 1s infinite;
      opacity: 0;
    }
    .badge-circle2 {
      position: absolute;
      top: 10rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 448rpx;
      height: 448rpx;
      animation: scale2 1s 1.3s infinite;
      opacity: 0;
    }
    .badge-header {
      position: absolute;
      top: 0;
      left: 0;
      width: 273rpx;
      height: 79rpx;
      // animation: headAnimation 1s 1;
    }
    .badge-body {
      position: absolute;
      top: 20rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 314rpx;
      height: 369rpx;
      // animation: bodyAnimation 1s 1s 1;
    }
    .badge-light {
      position: absolute;
      top: 70rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 274rpx;
      height: 274rpx;
      opacity: 0;
      animation: light 1s 1s linear infinite;
    }
    .badge-line {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 17rpx;
      height: 500rpx;
      transform: rotate(-15deg);
      animation: rotate 1s 1s linear infinite;
      opacity: 0;
    }
    .line2 {
      transform: rotate(75deg);
      animation: rotate2 1s 1s linear infinite;
    }
    .line3 {
      top: -40rpx;
      left: 50%;
      margin-left: 20rpx;
      transform: rotate(30deg);
      animation: rotate3 1s 1s linear infinite;
    }
    .line4 {
      top: -40rpx;
      left: 50%;
      margin-left: 20rpx;
      transform: rotate(-60deg);
      animation: rotate4 1s 1s linear infinite;
    }
    .badge-small-ball {
      position: absolute;
      top: 400rpx;
      left: 0;
      width: 41rpx;
      height: 43rpx;
      opacity: 0;
    }
    .small1 {
      left: -10%;
      animation: move 1.1s 1.1s infinite;
    }
    .small2 {
      top: 420rpx;
      left: 10%;
      animation: move 1.8s 1.2s infinite;
    }
    .small3 {
      top: 380rpx;
      left: 30%;
      animation: move 1.4s 1.3s infinite;
    }
    .small4 {
      top: 410rpx;
      left: 50%;
      animation: move 2s 1.4s infinite;
    }
    .small5 {
      top: 360rpx;
      left: 70%;
      animation: move 1.6s 1.5s infinite;
    }
    .small6 {
      top: 360rpx;
      left: 95%;
      animation: move 1.2s 1.5s infinite;
    }
    .grade-box {
      position: absolute;
      top: 430rpx;
      left: 50%;
      transform: translateX(-50%);
      .prize-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 660rpx;
        height: 160rpx;
        border-radius: 20rpx;
        background-size: 100% auto;
        & + .prize-item {
          margin-top: 20rpx;
        }
        &.coupon {
          background-color: #09bb07;
          .icon-box {
            box-shadow: 0px 6rpx 6rpx 0px rgba(15, 151, 14, 0.3);
          }
          .icon {
            color: #1ac019;
          }
          .beta {
            color: #5fad48;
          }
        }
        &.money {
          background-color: #f05531;
          .icon-box {
            box-shadow: 6rpx 6rpx 6rpx 0 rgba(150, 58, 36, 0.3);
          }
          .icon {
            color: #f05531;
          }
          .beta {
            color: #f05531;
          }
        }
        &.score {
          background-color: #f0a131;
          .icon-box {
            box-shadow: 6px 6px 6px 0px rgba(205, 129, 22, 0.3);
          }
          .icon {
            color: #f1a63c;
          }
        }
        .alpha {
          display: flex;
          flex: 1;
          align-items: center;
          .icon-box {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 110rpx;
            height: 110rpx;
            background: rgba(255, 255, 255, 1);
            border-radius: 55rpx;
            margin: 0 0 0 20rpx;
            .icon {
              font-size: 52rpx;
            }
          }
          .title {
            display: flex;
            align-items: center;
            font-size: 32rpx;
            color: #fff;
            margin-left: 14rpx;
            flex: 1;
          }
          .desc {
            margin: 14rpx 14rpx 0 14rpx;
            color: #fff;
          }
        }
        .beta {
          width: 160rpx;
          height: 60rpx;
          line-height: 60rpx;
          background: rgba(255, 255, 255, 1);
          border-radius: 30rpx;
          font-size: 26rpx;
          text-align: center;
          margin: 0 20rpx 0 0;
        }
      }
    }
    .grade-text {
      font-size: 30rpx;
      color: #fff;
      text-align: center;
      white-space: nowrap;
      padding: 0 0 40rpx;
    }
    .grade-btn {
      margin-top: 64rpx;
      width: 320rpx;
      height: 72rpx;
      line-height: 72rpx;
      color: #fff;
      font-weight: 700;
      font-size: 30rpx;
      background: linear-gradient(90deg, #ffa200, #ffd461);
      border: none;
      border-radius: 40rpx;
      text-align: center;
    }
  }
  .icon-close2 {
    position: absolute;
    top: 14%;
    right: 10%;
    z-index: 10002;
    font-size: 70rpx;
    color: #fff;
  }
}
// 头部动画
@keyframes headAnimation {
  0% {
    height: 10rpx;
    opacity: 0;
  }
  100% {
    height: 79rpx;
    opacity: 1;
  }
}
// 徽章主体动画
@keyframes bodyAnimation {
  0% {
    top: 10rpx;
  }
  50% {
    top: 20rpx;
    transform: scale(1);
  }
  75% {
    top: 20rpx;
    transform: scale(1.1);
  }
  100% {
    top: 20rpx;
    transform: scale(1);
  }
}
@keyframes light {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
  }
}
@keyframes rotate {
  0% {
    opacity: 0;
    transform: rotate(-15deg) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: rotate(60deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(120deg) scale(0.9);
  }
}
@keyframes rotate2 {
  0% {
    opacity: 0;
    transform: rotate(75deg) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: rotate(135deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(195deg) scale(0.9);
  }
}
@keyframes rotate3 {
  0% {
    opacity: 0;
    transform: rotate(30deg) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: rotate(90deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(120deg) scale(0.9);
  }
}
@keyframes rotate4 {
  0% {
    opacity: 0;
    transform: rotate(-60deg) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: rotate(30deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(60deg) scale(0.9);
  }
}
@keyframes scale {
  0% {
    transform: translateX(-50%) scale(0.3);
    opacity: 0;
  }
  50% {
    transform: translateX(-50%) scale(1);
    opacity: 0.3;
  }
  100% {
    transform: translateX(-50%) scale(1.2);
    opacity: 0;
  }
}
@keyframes scale2 {
  0% {
    transform: translateX(-50%) scale(0.3);
    opacity: 0;
  }
  50% {
    transform: translateX(-50%) scale(1);
    opacity: 0.3;
  }
  100% {
    transform: translateX(-50%) scale(1.2);
    opacity: 0;
  }
}
@keyframes move {
  0% {
    opacity: 1;
    // top: 400rpx;
  }
  100% {
    opacity: 0;
    top: 50rpx;
  }
}
</style>
