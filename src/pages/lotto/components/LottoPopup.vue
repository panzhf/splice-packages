<template>
  <u-mask :show="isShow" :custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }">
    <view class="content">
      <view class="rect">
        <view class="circle">
          <view
            class="decorate"
            :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/popup-decorate.png)` }"
          />
          <view class="count">+{{ count }}</view>
        </view>
        <view class="title">{{ popupTitle }}</view>
        <rich-text class="info" :nodes="info" />
        <view class="desc" :class="isShowBtn ? 'mt-20' : ''">
          <view>{{ drawTitle }}越多，中奖几率越大！</view>
          <view>页面右上方可查看活动说明。</view>
        </view>
        <view v-if="isShowBtn" class="btns">
          <image
            class="submit"
            :src="PACKAGE_STATIC_URL + 'lottery/lotto/popup-ok-btn.png'"
            mode="widthFix"
            @click="handleSubmit"
          />
        </view>
      </view>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  props: {
    isShow: {
      default: false,
      type: Boolean
    },
    isShowBtn: {
      default: false,
      type: Boolean
    },
    count: {
      default: '',
      type: [Number, String]
    },
    info: {
      default: '',
      type: String
    },
    popupTitle: {
      default: '参与活动成功',
      type: String
    },
    drawTitle: {
      default: '抽奖机会',
      type: String
    }
  },
  data() {
    return {}
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleSubmit() {
      this.$emit('submit')
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .rect {
    position: relative;
    width: 600rpx;
    min-height: 370rpx;
    display: flex;
    flex-direction: column;
    background: linear-gradient(#fff9e3, #ffeba2);
    border: 2rpx solid #fee0b5;
    border-radius: 20rpx;

    .circle {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      justify-content: center;
      align-items: center;
      width: 160rpx;
      height: 160rpx;
      font-size: 66rpx;
      font-weight: bold;
      color: #fff6d3;
      border: 2rpx solid #ffe176;
      border-radius: 50%;
      background-image: linear-gradient(#e9291d, #f1551b);

      .decorate {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300rpx;
        height: 90rpx;
        background-size: 100%;
        background-repeat: no-repeat;
      }
    }

    .title {
      margin-top: 134rpx;
      text-align: center;
      font-size: 36rpx;
      font-weight: bold;
      color: #000;
    }

    .info {
      margin: 16rpx auto 40rpx;
      text-align: center;
      max-width: 480rpx;
      font-size: 28rpx;
      color: #000;
      word-break: break-all;
    }

    .desc {
      margin-bottom: 66rpx;
      font-size: 22rpx;
      color: #ed3c1c;
      text-align: center;

      &.mt-20 {
        margin-top: 20rpx;
      }
    }
  }

  .btns {
    display: flex;
    justify-content: space-between;

    .btn {
      width: 200rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 26rpx;
      border-radius: 32rpx;
      font-weight: bold;
    }

    .submit {
      margin: -20rpx auto 40rpx;
      width: 260rpx;
      height: 74rpx;
      background-size: 100%;
    }
  }
}
</style>
