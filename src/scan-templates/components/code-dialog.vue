<template>
  <view v-if="isShow" class="code-dialog-container">
    <view class="mask" @click="handleClickMask" />
    <view class="content">
      <view class="box" />
      <view class="title" :style="{ backgroundImage: 'url(' + titleBgImg + ')' }">请输入验证码</view>
      <view class="activity-info">
        <input v-model="code" class="input-code" type="number" maxlength="20" />

        <!-- <view class="input-value">
          <view v-for="(item, index) in maxlength" :key="index" :class="['value', maxlength === 8 ? 'mr6' : '']">
            {{ code[index] || '' }}
          </view>
        </view> -->
        <view class="tips">温馨提示：{{ tips }}</view>
        <view class="button-box">
          <view class="bt submit" @click="handleSubmit">开始验证</view>
        </view>
      </view>
      <view v-if="isShowClose" class="iconfont icon-close2 close-btn" @click="handleCloseDialog" />
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 弹窗内容
    tips: {
      type: String,
      default: '输入包装上的验证码，立即参与抽奖！'
    },
    // 是否显示关闭按钮
    isShowClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      code: '',
      titleBgImg: staticURL(true) + 'scan/collect-dialog-title-bg.png' // 标题背景图
    }
  },
  methods: {
    // 开始验证
    handleSubmit() {
      if (this.code === '') {
        this.$msg('验证码不能为空')
        return
      }
      this.$emit('judge', this.code)
    },
    // 点击遮罩
    handleClickMask() {
      // this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.code-dialog-container {
  position: fixed;
  z-index: 10000;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 600rpx;
    min-height: 416rpx;
    border-radius: 40rpx;
    background-color: #fff;
    // background-image: linear-gradient(#ffffff, #fff9e2);
    // animation: tanchuang 0.4s ease-in-out;

    .box {
      position: absolute;
      z-index: 100;
      width: 577rpx;
      height: calc(100% - 20rpx);
      margin: 10rpx 0;
      border-radius: 30rpx;
    }

    .title {
      position: relative;
      z-index: 200;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 459rpx;
      height: 70rpx;
      padding-bottom: 8rpx;
      transform: translateY(-8rpx);
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
      background-size: 100%;
      background-repeat: no-repeat;
    }

    .activity-info {
      width: 100%;
      height: 396rpx;
      padding: 0 40rpx;
      .input-code {
        position: relative;
        z-index: 999;
        background-color: #fff;
        width: 100%;
        height: 64rpx;
        padding-left: 10rpx;
        margin-top: 20rpx;
        border: 2rpx solid #febc33;
        box-sizing: border-box;
      }
      .info-item {
        border-bottom: 1rpx solid rgba($color: #e0ccbe, $alpha: 0.5);
        &:last-child {
          border-bottom: none;
        }
      }
      .tips {
        text-align: center;
        margin-top: 42rpx;
        word-break: break-all;
      }
      .button-box {
        position: absolute;
        bottom: 40rpx;
        left: 50%;
        transform: translateX(-50%);
        z-index: 200;
        display: flex;
        justify-content: center;
        margin-top: 40rpx;
        .bt {
          border-radius: 34px;
          text-align: center;
          height: 74rpx;
          line-height: 74rpx;
          font-size: 28rpx;
        }
        .cancel {
          border: 1px solid #ff893a;
          width: 226rpx;
          color: #f0311d;

          font-weight: 500;
        }
        .submit {
          // background: linear-gradient(0deg, #ff2529 0%, #ff5e1f 100%);
          // width: 220rpx;
          // color: #ffffff;
          // margin-left: 30rpx;
          width: 400rpx;
          height: 80rpx;
          font-size: 32rpx;
          font-weight: 700;
          color: #fff;
          background-image: linear-gradient(180deg, #ff744f 0%, #fb4a0c 100%);
          border-radius: 40rpx;
        }
      }
    }
  }

  .close-btn {
    color: #fff;
    position: absolute;
    bottom: -150rpx;
    font-size: 72rpx;
  }
}

@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
