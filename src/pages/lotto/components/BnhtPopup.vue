<template>
  <u-mask :show="isShow" :custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }">
    <view class="content">
      <view class="rect">
        <view class="popup-top">
          <view class="popup-title">{{ popupTitle }}</view>
          <u-image width="676rpx" height="200rpx" :src="PACKAGE_STATIC_URL + 'lottery/bnht/popup-top2.png'" />
        </view>
        <view class="circle">
          <view class="text">{{ drawTitle }}</view>
          <view class="count">+{{ count }}</view>
        </view>
        <rich-text class="info" :nodes="info" />
        <view v-if="isShowBtn" class="desc">
          <view>{{ drawTitle }}越多，中奖几率越大！</view>
          <view>页面右上方可查看活动说明。</view>
        </view>
        <view v-if="isShowBtn" class="btns">
          <view class="btn submit" @click="handleSubmit">
            {{ submitText }}
            <image class="btn-icon" :src="PACKAGE_STATIC_URL + 'lottery/bnht/sanjiao.png'" mode="widthFix" />
          </view>
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
      default: '参与成功',
      type: String
    },
    submitText: {
      default: '确定',
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

  .popup-top {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -62%);
    width: 680rpx;
    background-size: 100%;

    .popup-title {
      position: absolute;
      top: 104rpx;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      font-size: 40rpx;
      font-weight: bold;
      color: #ffdda4;
    }
  }

  .circle {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 150rpx;
    height: 150rpx;
    margin: 40rpx auto 0;
    border-radius: 50%;
    border: 2rpx solid #ffe176;
    background-image: linear-gradient(#f13e1b, #e9291d);
    font-weight: bold;
    color: #fff6d3;

    .text {
      font-size: 24rpx;
    }
    .count {
      font-size: 56rpx;
      line-height: 1;
    }
  }

  .rect {
    position: relative;
    width: 550rpx;
    min-height: 360rpx;
    display: flex;
    flex-direction: column;
    padding: 40rpx 60rpx;
    border-radius: 20rpx;
    background-color: #ffdda4;
  }

  .info {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    max-width: 480rpx;
    padding: 28rpx 0 8rpx;
    font-size: 28rpx;
    line-height: 40rpx;
    color: #000;
    word-break: break-all;
  }

  .desc {
    padding: 30rpx 0;
    text-align: center;
    color: #ff8d4f;
  }

  .btns {
    display: flex;
    justify-content: center;

    .btn {
      width: 200rpx;
      height: 70rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30rpx;
      border-radius: 37rpx;
    }

    .close {
      color: #ff3834;
      border: 2rpx solid #ff3834;
    }

    .submit {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fae19c;
      background-image: linear-gradient(#f6433f, #e40809);

      .btn-icon {
        margin-left: 12rpx;
        padding-top: 4rpx;
        width: 14rpx;
      }
    }
  }
}
</style>
