<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
    :mask-click-able="!isPrize"
    :zoom="false"
    z-index="100"
    @click="handleClose"
  >
    <view v-if="showDialog" class="prize-dialog flex flex-column flex-middle flex-center">
      <view class="title" :class="{ cj: [1, 2].includes(dialogType) }" style="animation-delay: 0.5s">
        <template v-if="dialogType === 1">
          <view class="fs-72">恭喜中奖</view>
          <view class="fs-48">获得一张「{{ lotteryConfig.cardname }}」</view>
        </template>
        <template v-if="dialogType === 2">
          <view class="fs-72">恭喜你</view>
          <view class="fs-48">已集齐 {{ userData.UnExchangePrizeCount }} 套卡牌</view>
        </template>
        <template v-if="dialogType === 3">
          <view>很遗憾</view>
          <view>你的抽卡次数不足</view>
        </template>
      </view>
      <view
        v-if="[1].includes(dialogType) && lotteryConfig.extrapoint"
        class="point-tips cj"
        style="animation-delay: 1.5s"
      >
        同时获得：{{ lotteryConfig.extrapoint }}积分
      </view>
      <view
        v-if="[1, 2].includes(dialogType)"
        class="card-box flex flex-column flex-middle flex-center cj"
        :style="{
          backgroundImage: `url(${PACKAGE_STATIC_URL}group-card/pupbg.png)`,
          animationDelay: dialogType === 1 ? '2s' : '1s'
        }"
      >
        <image
          v-if="dialogType === 1"
          mode="aspectFit"
          :src="lotteryConfig.cardimg"
          class="big-card cj"
          style="animation-delay: 1s"
        />
        <view v-if="dialogType === 2" class="card-list-box">
          <image
            v-for="(item, index) in cardList"
            :key="index"
            :style="[getStyle(index)]"
            :src="item.cardimg"
            class="card-list"
          />
        </view>
      </view>
      <view v-if="dialogType === 1 && lotteryConfig.realexpirydate" class="time-tips cj" style="animation-delay: 3s">
        {{ lotteryConfig.realexpirydate }}前有效
      </view>
      <template v-if="dialogType === 3">
        <image :src="PACKAGE_STATIC_URL + 'group-card/no-card.png'" class="no-card" />
        <view class="btn-box">
          <view class="tx-c btn-lable">一一 抽卡机会获取方式 一一</view>
          <view v-if="[0, 2].includes(actInfo.actType)" class="item-btn tx-c flex flex-middle flex-center flex-column">
            消耗{{ actInfo.Point }}积分参与一次
            <view class="tips">
              <template v-if="actInfo.DayLimit > 0 && actInfo.TotalLimit > 0">
                （每日最多参与{{ actInfo.DayLimit }}次，总共参与{{ actInfo.TotalLimit }}次）
              </template>
              <template v-else-if="actInfo.DayLimit > 0">（每日最多参与{{ actInfo.DayLimit }}次）</template>
              <template v-else-if="actInfo.TotalLimit > 0">总共最多参与{{ actInfo.TotalLimit }}次）</template>
            </view>
          </view>
          <view
            v-if="[1, 2].includes(actInfo.actType)"
            class="item-btn tx-c flex flex-middle flex-center flex-column"
            @click="$emit('scan')"
          >
            通过扫码获取
            <view class="next">去扫码 ></view>
          </view>
        </view>
      </template>
      <view v-if="dialogType === 1" class="btn cj" style="animation-delay: 4s" @click="handleShou">开 心 收 下</view>
      <view
        v-if="dialogType === 2"
        class="btn cj btn-receive"
        :style="{
          animationDelay: `${cardList.length * 0.5 + 3}s`
        }"
        @click="awardCard"
      >
        使用1套卡牌去抽奖
      </view>
      <view v-if="[2, 3].includes(dialogType)" class="iconfont icon-close2 close-btn" @click="close" />
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'

export default {
  name: 'PrizeDialog',
  mixins: [packageStaticMixin, dialogMixin],
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    actInfo: {
      type: Object,
      default: () => {}
    },
    lotteryConfig: {
      type: Object,
      default: () => ({
        extrapoint: 0, //额外奖励积分
        completesuitcount: 0, //已集齐数量(包括未兑奖的)
        cardname: '',
        cardimg: '',
        isexchangeprize: 0
      })
    },
    userData: {
      type: Object,
      default: () => ({
        UnExchangePrizeCount: 0, //用户已集齐但未兑奖数量
        UserChance: 0, //扫码获得的参与次数
        CompleteSuitPersonCount: 0
      })
    },
    cardList: {
      type: Array,
      default: () => []
    },
    dialogType: {
      // 1 中奖得一张卡（未集齐）2 中奖得一张卡（已集齐）  3 机会用完
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      overlap: 50 // 可以调整的重叠间距
    }
  },
  computed: {
    isPrize() {
      return this.info.winstatus === 1
    }
  },
  methods: {
    getStyle(index) {
      return {
        left: `calc(${(380 / (this.cardList.length - 1)) * index}rpx + 60rpx)`,
        top: `288rpx`,
        animationDelay: `${(index + 1) * 0.4 + 2}s`
      }
    },
    handleGoChange() {
      uni.reLaunch({
        url: '/packages/src/integral/index'
      })
    },
    handleView() {
      this.handleClose()
      uni.navigateTo({ url: this.info.mplink })
    },
    handleClose() {
      // this.close()
    },
    awardCard() {
      this.showDialog = false
      this.$emit('awardCard')
    },
    handleShou() {
      this.showDialog = false
      this.$emit('handleShou')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: prize-dialog;
.#{$prefix} {
  height: 100%;
  .title {
    // background: -webkit-linear-gradient(#ff7e4e 100%, #f83600 100%);
    // -webkit-text-fill-color: transparent;
    // -webkit-background-clip: text;
    // background-clip: text;
    font-weight: bold;
    font-size: 60rpx;
    text-align: center;
    color: #ff7e4e;
  }
  .no-card {
    margin-top: 48rpx;
    width: 560rpx;
    height: 530rpx;
  }
  .btn-box {
    .btn-lable {
      font-size: 32rpx;
      color: #ffffff;
    }
    .item-btn {
      margin-top: 30rpx;
      border-radius: 60rpx;
      border: 2rpx solid #ffffff;
      color: #fff;
      width: 560rpx;
      height: 120rpx;
      .tips {
        opacity: 0.5;
        font-size: 24rpx;
      }
      .next {
        font-size: 24rpx;
        color: #ffce88;
      }
    }
  }
  .icon-close2 {
    color: #fff;
    font-size: 70rpx;
    margin-top: 40rpx;
  }
  .point-tips {
    margin-top: 50rpx;
    background: #f9532d;
    border-radius: 24rpx;
    color: #fff;
    height: 48rpx;
    line-height: 48rpx;
    padding: 0 40rpx;
  }
  .card-box {
    width: 100%;
    height: 850rpx;
    background-size: 100% 100%;
    margin-top: -60rpx;
    .card-list-box {
      // display: flex;
      width: 100%;
      height: 100%;
      position: relative;
      .card-list {
        position: absolute;
        width: 249rpx;
        height: 332rpx;
        opacity: 0;
        transform: scale(0);
        animation: expand 1s ease-in-out forwards;
      }
    }
  }
  .time-tips {
    font-size: 28rpx;
    color: #ffffff;
    margin-top: -70rpx;
  }
  .btn {
    margin-top: 40rpx;
    width: 420rpx;
    height: 86rpx;
    background: linear-gradient(90deg, #ff7e4e, #f83600);
    box-shadow: 2rpx 2rpx 11rpx 0rpx rgba(248, 59, 5, 0.63);
    border-radius: 43rpx;
    font-size: 32rpx;
    color: #fefefe;
    line-height: 86rpx;
    text-align: center;
  }
  .btn-receive {
    margin-top: -50rpx;
  }
  .cj {
    opacity: 0;
    transform: scale(0);
    animation: expand 1s ease-in-out forwards;
  }
}
.fs-72 {
  font-size: 72rpx;
}
.fs-48 {
  font-size: 48rpx;
}

@keyframes expand {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
