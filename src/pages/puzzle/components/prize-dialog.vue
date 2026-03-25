<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view class="prize-dialog flex flex-column flex-middle flex-center">
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
          <image :src="info.PrizeImageUrl" class="prize-icon" />
        </view>
        <view class="sub-title fs-26">第{{ info.PeriodOrder }}期活动</view>
        <view class="prize-name">{{ info.JackpotName }} - {{ info.PrizeName }}</view>
        <view class="btn-group">
          <view class="btn active" @tap="handleView">查看奖品</view>
          <view class="btn plain" @tap="handleContinue">继续参与</view>
        </view>
      </template>
      <template v-else>
        <view class="prize-box">
          <image :src="PACKAGE_STATIC_URL + 'puzzle/loading.png'" class="bg" />
          <image :src="PACKAGE_STATIC_URL + 'puzzle/no-prize.png'" class="prize-icon fail" />
        </view>
        <view class="sub-title fs-26">第{{ info.PeriodOrder }}期活动</view>
        <view class="btn-group">
          <view class="btn active" @tap="handleContinue">继续参与</view>
        </view>
      </template>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
import commonMixin from '../mixins'
export default {
  name: 'PrizeDialog',
  mixins: [packageStaticMixin, dialogMixin, commonMixin],
  props: {
    top: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {}
  },
  computed: {
    isPrize() {
      return !!this.info.PrizeName
    }
  },
  methods: {
    handleView() {
      this.close()
      /* #ifdef H5 */
      location.href = this.info.H5JumpUrl
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({ url: this.info.MpJumpUrl })
      /* #endif */
    },
    handleContinue() {
      this.close()
      this.$emit('refresh') // 触发获得拼图弹窗等
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
      @include wh(182rpx, 200rpx);
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
    font-size: 30rpx;
    color: #ffe2b5;
    font-weight: 500;
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
