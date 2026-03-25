<template>
  <view v-if="prizeList.length > 0" class="login-tip" @touchmove.stop="preventMove">
    <view class="mask" @tap="hideToast"></view>
    <view class="content flex flex-column">
      <view class="box flex-1">
        <image class="image" :src="type === 1 ? signPrize : receivePrize" />
        <view class="tip">恭喜获得以下奖励</view>
        <view v-for="(item, index) in prizeList" :key="index" class="prize-list">
          <view class="item y-center">
            <image v-if="item.rewardtype === 1" class="base-img" :src="huoliPrize" />
            <image v-else-if="item.rewardtype === 2" class="base-img" :src="jifenPrize" />
            <image v-else-if="[3, 10].includes(item.rewardtype)" class="base-img" :src="hongbaoPrize" />
            <view class="message">
              <view class="title">
                {{ item.rewardcontent }}{{ [3, 10].includes(item.rewardtype) ? '元' : '' }}{{ item.name }}
              </view>
              <view v-if="item.rewardtype === 3" class="text">已存入【我的-红包零钱】</view>
              <view v-if="item.rewardtype === 10" class="text">
                红包已发出，请到微信上查阅
                <text class="fs-22">（若未到账请联系客服补发）</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 签到: 新增按钮配置 -->
      <view v-if="type === 1 && info.length > 0" class="xy-center btn-group" :class="'btns-' + btns">
        <template v-for="(item, index) in info">
          <view
            v-if="item.isShow"
            :key="index"
            class="base-btn xy-center"
            :class="'btn-' + index"
            @tap="handleNavigate(item)"
          >
            {{ item.text }}
          </view>
        </template>
      </view>
      <!-- 其他任务 -->
      <view v-else class="xy-center btn-group btns-1">
        <view class="base-btn xy-center" @tap="hideToast">知道了</view>
      </view>
    </view>
  </view>
</template>

<script>
import openLinkMixin from '@/mixins/open-link'
import { staticURL } from '@/config'
export default {
  mixins: [openLinkMixin],
  props: {
    info: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      jifenPrize: staticURL() + 'prize/jifen.png',
      huoliPrize: staticURL() + 'prize/huoli.png',
      hongbaoPrize: staticURL() + 'prize/hongbao.png',
      signPrize: staticURL() + 'prize/login-success.png',
      receivePrize: staticURL() + 'prize/receive-success.png',
      prizeList: [],
      type: 2,
      membergrade: {}
    }
  },
  computed: {
    btns() {
      return this.info.filter(item => item.isShow).length
    }
  },
  methods: {
    showToast(prizeList, type, membergrade) {
      this.type = type
      this.prizeList = prizeList
      this.membergrade = membergrade
    },
    hideToast() {
      this.prizeList = []
      this.$emit('LevelUpgrade', this.membergrade)
    },
    preventMove() {},
    handleNavigate(item) {
      this.hideToast()
      this.handleOpenLink(item)
    }
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
    min-height: 650rpx;
    z-index: 102;
    background: #fff;
    text-align: center;
    border-radius: 10rpx;
    .tip {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 40rpx;
    }
    .prize-list {
      margin-left: 50rpx;
    }
    .item {
      margin: 0 0 20rpx;
      .message {
        display: flex;
        flex-direction: column;
        text-align: left;
        .title {
          font-size: 30rpx;
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
        width: 90rpx;
        height: 90rpx;
        margin-right: 20rpx;
        flex-shrink: 0;
      }
    }
    .image {
      width: 394rpx;
      height: 176rpx;
      margin: -60rpx auto 0;
    }
    .btn-group {
      margin-top: 20rpx;
      margin-bottom: 30rpx;
      padding: 0 30rpx;
      .base-btn {
        height: 72rpx;
        border-radius: 36rpx;
      }
      &.btns-1 {
        .base-btn {
          width: 320rpx;
          height: 72rpx;
        }
      }
      &.btns-2 {
        .base-btn {
          flex: 1;
          box-shadow: none;
          & + .base-btn {
            margin-left: 30rpx;
          }
        }
        .btn-0 {
          background: #fff;
          color: #333;
          border: 1px solid #ccc;
        }
        // .btn-1 {
        //   background: #fdbf01;
        // }
      }
    }
  }
}
</style>
