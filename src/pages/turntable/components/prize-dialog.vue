<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    :mask-click-able="isThirdOpen"
    :zoom="false"
    @click="close"
  >
    <view v-if="isOfflineProduct" class="product-dialog flex flex-column flex-middle flex-center">
      <view class="product-wrapper">
        <view
          class="header fs-36 text-center fw-bold"
          :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}turntable/xsl-title.png)` }"
        >
          <view>{{ exchangeTitle }}</view>
        </view>
        <view class="content">
          <view class="prize-title fs-30 text-center fw-bold">恭喜获得：{{ info.name }}，奖励如下：</view>
          <view class="prize-info flex fs-26">
            <image :src="info.awardpicture" class="prize-icon shrink-0" />
            <view class="flex-1 ml-20">
              <view class="prize-name mb-10">{{ info.productname }}</view>
              <view>×1</view>
            </view>
          </view>
          <view class="fs-30 text-center fw-medium">中奖时间：{{ info.time }}</view>
          <view class="exchange-box">
            <image v-if="isChanged" :src="PACKAGE_STATIC_URL + 'turntable/xsl-success.png'" class="result" />
            <template v-else>
              <image :src="PACKAGE_STATIC_URL + 'turntable/xsl-btn.gif'" class="btn" @tap="handleExchange" />
              <view class="tip fs-28">
                提示：请出示此页面给门店老板，门店老板凭此页面兑奖。未领到奖品前，请勿关闭此页面。
              </view>
            </template>
          </view>
        </view>
        <view v-if="isChanged" class="close-btn flex flex-center">
          <view class="iconfont icon-close2 fw-bold" @tap.stop="close" />
        </view>
      </view>
    </view>
    <view v-else class="prize-dialog flex flex-column flex-middle flex-center">
      <view class="title-box flex flex-middle">
        <image :src="PACKAGE_STATIC_URL + 'puzzle/title-left.png'" class="title-icon" />
        <view class="title">{{ isPrize ? '恭喜中奖' : '很遗憾，您未中奖' }}</view>
        <image :src="PACKAGE_STATIC_URL + 'puzzle/title-right.png'" class="title-icon" />
      </view>
      <template v-if="isPrize">
        <view class="prize-box">
          <image :src="PACKAGE_STATIC_URL + 'puzzle/loading.png'" class="bg loading" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star left-center" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star left-top" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star right-top" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star right-center" />
          <image :src="info.awardpicture" class="prize-icon" />
        </view>
        <view class="sub-title fs-26">{{ info.name }}</view>
        <view class="prize-name">{{ info.productname }}</view>
        <view v-if="info.prizetype === 0 && info.receivedays" class="date fs-26">
          （请在{{ info.receivedays }}天内领取，过期无效）
        </view>
        <view class="btn-group">
          <view class="btn active" @tap="handleView">查看奖品</view>
          <view v-if="!isThirdOpen" class="btn plain" @tap="close">继续参与</view>
        </view>
      </template>
      <template v-else>
        <view class="prize-box">
          <image :src="PACKAGE_STATIC_URL + 'puzzle/loading.png'" class="bg" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/no-prize.png'" class="prize-icon fail" />
        </view>
        <view class="btn-group">
          <view v-if="!isThirdOpen" class="btn active" @tap="close">继续参与</view>
        </view>
      </template>
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
    isThirdOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isChanged: false
    }
  },
  computed: {
    isPrize() {
      return !!this.info.id
    },
    isOfflineProduct() {
      // 线下实物领取
      return this.info.usescenetype === 1 && this.info.prizetype === 0 && this.info.receivetype === 2
    },
    exchangeTitle() {
      return this.isChanged ? '兑奖成功' : '恭喜中奖'
    }
  },
  watch: {
    value(v) {
      v && (this.isChanged = false)
    }
  },
  methods: {
    handleView() {
      this.close()
      /* #ifdef H5 */
      if (this.isThirdOpen) {
        // 跳转到第三方的奖品列表
        this.$wechat.miniProgram.navigateTo({
          url: this.info.prizetype === 1 ? '/pages/integralMall/pointsDetail/index' : '/pages/myCard/myCard'
        })
      } else {
        location.href = this.info.h5turntablelink
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({ url: this.info.mpturntablelink })
      /* #endif */
    },
    handleExchange() {
      this.isChanged = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: prize-dialog;
.#{$prefix} {
  height: 100%;
  .title-box {
    .title-icon {
      @include wh(74rpx, 15rpx);
    }
    .title {
      margin: 0 36rpx;
      color: #fff4db;

      font-size: 44rpx;
      font-weight: bold;
    }
  }
  .prize-box {
    position: relative;
    @include wh(352rpx);
    margin-top: 53rpx;
    .bg {
      position: absolute;
      left: 0;
      top: 0;
      @include wh(100%);
      &:not(.loading) {
        opacity: 0.8;
      }
      &.loading {
        animation: rotate 3s 1s linear infinite;
      }
    }
    .prize-icon {
      position: absolute;
      @include hv-cen();
      @include wh(180rpx, 180rpx);
      &.fail {
        top: 42%;
        @include wh(212rpx, 222rpx);
      }
    }
    .star {
      position: absolute;
      animation-name: scale;
      animation-timing-function: linear;
      animation-duration: 1s;
      animation-iteration-count: infinite;
      &.left-center {
        top: 128rpx;
        left: 10rpx;
        animation-delay: 0s;
        @include wh(26rpx, 40rpx);
      }
      &.left-top {
        top: 0;
        left: 60rpx;
        animation-delay: 0.4s;
        @include wh(20rpx, 27rpx);
      }
      &.right-top {
        top: 40rpx;
        right: 42rpx;
        animation-delay: 0.3s;
        @include wh(34rpx, 47rpx);
      }
      &.right-center {
        top: 208rpx;
        right: 28rpx;
        animation-delay: 0.6s;
        @include wh(15rpx, 20rpx);
        opacity: 0.8;
      }
    }
  }
  .sub-title {
    margin-bottom: 14rpx;
    color: #ffe2b5;
  }
  .prize-name {
    max-width: 640rpx;
    font-size: 30rpx;
    color: #ffe2b5;
    font-weight: 500;
  }
  .date {
    margin-top: 12rpx;
    color: #fff;
  }
  .btn-group {
    margin-top: 128rpx;
    .btn {
      font-size: 30rpx;
      text-align: center;
      @include whl(300rpx, 75rpx, 73rpx);
      @include round(38rpx);
      & + .btn {
        margin-top: 40rpx;
      }
      &.active {
        background-color: #fff4db;
        color: #000;
      }
      &.plain {
        color: #fff4db;
        border: 1px solid currentColor;
      }
    }
  }
}
.product-dialog {
  height: 100%;
  .product-wrapper {
    position: relative;
  }
  .header {
    position: absolute;
    top: -50rpx;
    color: #fff;
    background-size: 100%;
    @include whl(708rpx, 108rpx);
    @include h-cen;
  }
  .content {
    width: 625rpx;
    padding-top: 50rpx;
    box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.1);
    color: #fa3f50;
    background-color: #fff;
    @include round(0 0 6rpx 6rpx);
    @include box();
  }
  .prize-title {
    margin: 24rpx 0;
  }
  .prize-info {
    padding: 20rpx;
    margin: 0 30rpx 20rpx;
    background: #ffe4e7;
    color: #333;
    @include round(4rpx);
  }
  .prize-icon {
    @include wh(120rpx);
  }
  .exchange-box {
    padding: 30rpx;
  }
  .result {
    /* #ifdef H5 */
    display: block;
    /* #endif */
    margin: 0 auto;
    @include wh(180rpx, 222rpx);
  }
  .btn {
    @include wh(540rpx, 100rpx);
  }
  .tip {
    padding: 20rpx 30rpx;
    line-height: 40rpx;
  }
  .close-btn {
    position: absolute;
    bottom: -120rpx;
    @include h-cen;
    color: #fff;
    .iconfont {
      font-size: 60rpx;
    }
  }
}
@keyframes rotate {
  0% {
    opacity: 0.4;
    transform: rotate(0deg) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    opacity: 0.4;
    transform: rotate(360deg) scale(0.9);
  }
}
@keyframes scale {
  from {
    transform: scale3d(0.55, 0.55, 0.55);
  }

  50% {
    transform: scale3d(1.25, 1.25, 1.25);
  }

  to {
    transform: scale3d(0.55, 0.55, 0.55);
  }
}
</style>
