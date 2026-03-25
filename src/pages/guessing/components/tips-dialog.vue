<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view
      v-if="baseStaticUrl"
      class="tips-dialog flex flex-column"
      :style="{ backgroundImage: `url(${baseStaticUrl}/tcbj.png)` }"
      @tap.stop="() => {}"
    >
      <template v-if="type === 1">
        <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/tips.png`" class="title-icon" />
        <view class="content">
          <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/success.png`" class="success-icon" />
          <view class="tips-text">恭喜竞猜成功</view>
          <view class="tips-text text2">离奖金又进一步啦~</view>
          <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/next.png?v999`" class="vote-btn" @tap.stop="close" />
        </view>
      </template>
      <template v-if="type === 2">
        <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/jj-text.png`" class="title-icon2" />
        <view class="content">
          <image :src="info.RankImgUrl" class="success-icon2" />
          <view class="tips-text">{{ info.WinRankName }}胜利</view>
          <view class="button-box flex">
            <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/canyu.png`" class="votes-btn" @tap.stop="close" />
            <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/jj.png`" class="votes-btn" @click="handleLook" />
          </view>
        </view>
      </template>

      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2 fw-bold" @tap.stop="close" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
import commonMixin from '../mixins'
export default {
  mixins: [packageStaticMixin, dialogMixin, commonMixin],
  props: {
    baseStaticUrl: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 1
    }
  },
  methods: {
    handleLook() {
      /* #ifdef H5 */
      location.href = this.info.H5JumpUrl
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({ url: this.info.MpJumpUrl })
      /* #endif */
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: tips-dialog;
.fsz-30 {
  font-size: 30;
}
.#{$prefix} {
  width: 600rpx;
  height: 790rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .content {
    margin-top: 240rpx;
    .success-icon {
      width: 95rpx;
      height: 76rpx;
      margin: 60rpx auto 0;
      display: block;
    }
    .success-icon2 {
      width: 100rpx;
      height: 100rpx;
      margin: 100rpx auto 0;
      display: block;
      border-radius: 50%;
      overflow: hidden;
    }
    .tips-text {
      margin-top: 40rpx;
      text-align: center;
      font-size: 40rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #ffffff;
    }
    .text2 {
      font-size: 30rpx;
      color: #b6d2ff;
      font-weight: 500;
    }
    .vote-btn {
      width: 314rpx;
      height: 87rpx;
      display: block;
      margin: 70rpx auto 0;
    }
    .button-box {
      margin-top: 96rpx;
      justify-content: space-between;
      padding: 0 60rpx;
      .votes-btn {
        width: 234rpx;
        height: 87rpx;
      }
    }
  }
  .title-icon {
    position: absolute;
    width: 245rpx;
    height: 80rpx;
    top: 186rpx;
    left: 180rpx;
  }
  .title-icon2 {
    position: absolute;
    width: 272rpx;
    height: 66rpx;
    top: 200rpx;
    left: 166rpx;
  }
  .close-btn {
    position: absolute;
    left: 270rpx;
    bottom: -140rpx;
    margin-top: 60rpx;
    color: #fff;
    .iconfont {
      font-size: 60rpx;
    }
  }
}
</style>
