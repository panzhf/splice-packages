<template>
  <u-mask :show="isShow" :custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }">
    <view class="content">
      <view class="rect">
        <view class="popup-top">
          <u-image
            class="top-img"
            width="676rpx"
            height="200rpx"
            :src="PACKAGE_STATIC_URL + 'lottery/sdjc/popup-top.png'"
          />
        </view>
        <u-image
          v-if="imgType == 1"
          class="popup-img"
          width="315rpx"
          height="280rpx"
          :src="PACKAGE_STATIC_URL + 'lottery/sdjc/success-popup.png'"
        />
        <u-image
          v-else
          class="popup-img"
          width="315rpx"
          height="280rpx"
          :src="PACKAGE_STATIC_URL + 'lottery/sdjc/defeate-popup.png'"
        />
        <rich-text class="info" :nodes="info" />
        <view class="btns">
          <view class="btn close" @click="handleClose">关闭</view>
          <view class="btn submit" @click="handleSubmit">{{ submitText }}</view>
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
    info: {
      default: '',
      type: String
    },
    submitText: {
      default: '确定',
      type: String
    },
    imgType: {
      default: 1,
      type: Number
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

  .popup-top {
    position: absolute;
    top: 124rpx;
    left: 50%;
    transform: translate(-50%, -62%);
    width: 680rpx;
    .top-img {
      display: block;
      margin: 0 auto;
      width: 88% !important;
    }
  }
  .popup-img {
    display: block;
    margin: 0 auto;
  }
  .rect {
    position: relative;
    width: 600rpx;
    min-height: 626rpx;
    display: flex;
    flex-direction: column;
    padding: 40rpx 60rpx;
    background: linear-gradient(0deg, #ffffff 0%, #fff7ea 100%);
    border: 2rpx solid #fee0b5;
    border-radius: 20rpx;
    overflow: hidden;
  }

  .info {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    max-width: 480rpx;
    padding: 28rpx 0;
    font-size: 28rpx;
    line-height: 40rpx;
    color: #000;
    word-break: break-all;
  }

  .btns {
    display: flex;
    justify-content: space-between;

    .btn {
      width: 240rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30rpx;
      border-radius: 37rpx;
    }

    .close {
      background: linear-gradient(2deg, #ffd99e 0%, #fffffe 100%);
      border: 2rpx solid #ffdca6;
      color: #ac510a;
      font-weight: 700;
      margin-right: 20rpx;
    }

    .submit {
      color: #fae19c;
      background: linear-gradient(0deg, #ff3f42 0%, #ff8c4d 100%);
      border: 2rpx solid #ffdca6;
      color: #fffefe;
    }
  }
}
</style>
