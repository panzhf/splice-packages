<template>
  <view v-if="prizeList.length > 0" class="login-tip" catchtouchmove="preventMove">
    <view class="mask" @tap="hideToast"></view>
    <view :class="['content', random.length > 0 ? 'max-height' : '']">
      <view class="box">
        <view class="theme">{{ name }}</view>
        <view class="reward-type">
          <view class="tip">打开必得以下奖励：</view>
          <view class="reward-list">
            <view v-for="(item, index) in prizeList" :key="index">
              <view v-if="item.granttype === 0" class="item y-center">
                <image v-if="item.rewardtype === 1" class="base-img" :src="huoliPrize" />
                <image v-else-if="item.rewardtype === 2" class="base-img" :src="jifenPrize" />
                <image v-else-if="[3, 10].includes(item.rewardtype)" class="base-img" :src="hongbaoPrize" />
                <view class="message">
                  <view class="title">
                    {{ item.rewardcontent }}{{ [3, 10].includes(item.rewardtype) ? '元' : '' }}{{ item.name }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-if="random.length > 0" class="reward-type">
          <view class="tip">并有机会获得以下奖励之一：</view>
          <view class="reward-list">
            <view v-for="(ran, index) in random" :key="index">
              <view class="item y-center">
                <image v-if="ran.rewardtype === 1" class="base-img" :src="huoliPrize" />
                <image v-else-if="ran.rewardtype === 2" class="base-img" :src="jifenPrize" />
                <image v-else-if="[3, 10].includes(ran.rewardtype)" class="base-img" :src="hongbaoPrize" />
                <view class="message">
                  <view class="title">
                    {{ ran.rewardcontent }}{{ [3, 10].includes(ran.rewardtype) ? '元' : '' }}{{ ran.name }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="button base-btn xy-center" @tap="hideToast">知道了</view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  data() {
    return {
      jifenPrize: staticURL() + 'prize/jifen.png',
      huoliPrize: staticURL() + 'prize/huoli.png',
      hongbaoPrize: staticURL() + 'prize/hongbao.png',
      lgoinPrize: staticURL() + 'prize/login-success.png?v=2',
      prizeList: [],
      random: [],
      name: ''
    }
  },
  methods: {
    showToast(prizeList, name) {
      this.prizeList = prizeList
      var random = []
      for (let i = 0; i < prizeList.length; i++) {
        if (prizeList[i].granttype === 1) {
          random.push(prizeList[i])
        }
      }
      this.random = random
      this.name = name
    },
    hideToast() {
      this.prizeList = []
      this.random = []
    },
    preventMove() {}
  }
}
</script>

<style lang="scss" scoped>
.y-center {
  display: flex;
  align-items: center;
}

.xy-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-tip {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 101;
  }
  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500rpx;
    min-height: 475rpx;
    z-index: 102;
    background: #fff;
    // padding: 0 0 0;
    text-align: center;
    border-radius: 10rpx;
    display: flex;
    justify-content: center;
    .button {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 41rpx;
      width: 320rpx;
      height: 72rpx;
      border-radius: 36rpx;
    }
    .box {
      flex: 1;
      padding: 0 36rpx;
      .reward-type {
        padding-bottom: 20rpx;
        .tip {
          font-size: 26rpx;
          color: rgba(102, 102, 102, 1);
          padding: 0 10rpx 28rpx;
          text-align: left;
        }
        .reward-list {
          display: flex;
          flex-wrap: wrap;
          .item {
            display: flex;
            margin: 0 23rpx 20rpx 0;
            .message {
              display: flex;
              flex-direction: column;
              .title {
                font-size: 28rpx;
                font-family: PingFang-SC-Bold;
                font-weight: bold;
                color: rgba(51, 51, 51, 1);
              }
              .text {
                font-size: 24rpx;
                color: #999;
              }
            }
            .base-img {
              width: 46rpx;
              height: 42rpx;
              margin-right: 20rpx;
            }
          }
          .image {
            width: 394rpx;
            height: 176rpx;
          }
        }
      }
      .theme {
        font-size: 32rpx;
        font-family: PingFang-SC-Bold;
        font-weight: bold;
        color: rgba(51, 51, 51, 1);
        padding: 41rpx 0 48rpx;
      }
    }
  }
  .max-height {
    height: 660rpx;
  }
}
</style>
