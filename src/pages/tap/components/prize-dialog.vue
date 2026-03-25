<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    :mask-click-able="!isPrize"
    :zoom="false"
    z-index="100"
    @click="handleContinue"
  >
    <view class="prize-dialog flex flex-column flex-middle flex-center">
      <template v-if="isPrize">
        <view class="title-box flex flex-middle">
          <image :src="PACKAGE_STATIC_URL + 'puzzle/title-left.png'" class="title-icon" />
          <view class="title">恭喜中奖</view>
          <image :src="PACKAGE_STATIC_URL + 'puzzle/title-right.png'" class="title-icon" />
        </view>
        <view class="prize-box">
          <image :src="PACKAGE_STATIC_URL + 'puzzle/loading.png'" class="bg loading" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star left-center" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star left-top" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star right-top" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/star.png'" class="star right-center" />
          <image :src="info.awardpicture" class="prize-icon" />
        </view>
        <view class="sub-title fs-30">{{ info.name }}</view>
        <view class="prize-name fs-30">{{ info.productname }}</view>
        <view v-if="info.prizetype === 0 && info.receivedays" class="date fs-24">
          （请在{{ info.receivedays }}天内领取，过期无效）
        </view>
        <view class="btn-group">
          <view class="btn active" @tap="handleView">查看奖品</view>
          <view class="btn plain" @tap="handleContinue">继续参与</view>
        </view>
      </template>
      <view v-else class="fail-box text-center">
        <image :src="PACKAGE_STATIC_URL + 'tap/fail-bg.png'" class="bg" />
        <view class="fail-tip fw-bold fs-36">很遗憾挑战失败！</view>
        <view class="time-box fs-26">拍停时间：{{ info.finalTime }}秒</view>
        <view class="btn-group flex flex-middle flex-center">
          <view class="btn plain" @tap="handleContinue">关闭</view>
          <view class="btn active" @tap="handleContinue">再次挑战</view>
        </view>
      </view>
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
    }
  },
  data() {
    return {}
  },
  computed: {
    isPrize() {
      return !!this.info.id
    }
  },
  methods: {
    handleView() {
      this.handleContinue()
      /* #ifdef H5 */
      location.href = this.info.h5turntablelink
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({ url: this.info.mpturntablelink })
      /* #endif */
    },
    handleContinue() {
      this.close()
      this.$emit('continue')
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
    font-weight: 500;
  }
  .prize-name {
    max-width: 640rpx;
    color: #ffe2b5;
    font-weight: 500;
  }
  .date {
    margin-top: 12rpx;
    color: #7a6f5e;
    font-weight: 500;
  }
  .btn-group {
    margin-top: 128rpx;
    .btn {
      font-size: 30rpx;
      text-align: center;
      font-weight: bold;
      @include whl(300rpx, 75rpx, 73rpx);
      @include round(38rpx);
      & + .btn {
        margin-top: 40rpx;
      }
      &.active {
        background-color: #ff5c2f;
        color: #fff;
      }
      &.plain {
        color: #fff4db;
        border: 1px solid currentColor;
      }
    }
  }
}

.fail-box {
  @include wh(600rpx, 554rpx);
  @include round(20rpx);
  padding-top: 60rpx;
  background-color: #fff;
  .bg {
    display: block;
    margin: 0 auto;
    @include wh(444rpx, 282rpx);
  }
  .fail-tip {
    margin-top: -60rpx;
    color: #fa1622;
  }
  .time-box {
    margin-top: 24rpx;
    color: #666666;
  }
  .btn-group {
    margin-top: 50rpx;
    .btn {
      @include whl(220rpx, 80rpx, 78rpx);
      @include round(40rpx);
      & + .btn {
        margin-top: 0;
        margin-left: 40rpx;
      }
      &.plain {
        color: #222;
        border: 1px solid #aaa;
      }
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
