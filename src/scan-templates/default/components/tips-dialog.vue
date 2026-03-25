<template>
  <view v-if="isShow" class="tips-dialog-container">
    <view class="mask" @click="handleClickMask"></view>
    <view class="content" :style="{ backgroundImage: 'url(' + PopupBg + ')' }">
      <text class="name">{{ info.tips }}</text>
      <image :src="stateImg" alt="" class="state-img" />
      <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog"></view>
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
    title: {
      type: String,
      default: ''
    },
    // 弹窗状态
    state: {
      type: Number,
      default: 1
    },
    info: {
      type: Object,
      default: () => {
        return {
          state: 1, //1成功2失败
          tips: '很遗憾~ \n你没有获得奖励，再接再厉'
        }
      }
    }
  },
  data() {
    return {
      titleBgImg: staticURL(true) + 'dialog-title.png', // 标题背景图
      PopupBg: staticURL(true) + 'popup-bg.png',
      successImg: staticURL(true) + 'xiao.png',
      errImg: staticURL(true) + 'ku.png'
      // tips: `很遗憾~ \n你没有获得奖励，再接再厉`,
      // state: 2 //1成功2失败
    }
  },
  computed: {
    stateImg() {
      return this.info.state === 1 ? this.successImg : this.errImg
    }
  },
  methods: {
    // 点击遮罩
    handleClickMask() {
      this.$emit('update:isShow', false)
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
.tips-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  .state-img {
    width: 319rpx;
    height: 223rpx;
    position: absolute;
    bottom: 30rpx;
  }
  .name {
    font-size: 32rpx;
    font-family: PingFang SC Bold, PingFang SC Bold-Bold;
    font-weight: 700;
    text-align: center;
    color: #ffffff;
    line-height: 48rpx;
    position: absolute;
    top: 80rpx;
    width: 100%;
    // overflow: hidden;
    // text-overflow: ellipsis;
    // white-space: nowrap;
    padding: 0 18rpx;
  }
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
    width: 540rpx;
    height: 667rpx;
    border-radius: 40rpx;
    background-image: linear-gradient(#ffffff, #fff9e2);
    animation: tanchuang 0.4s ease-in-out;
    background-size: 100%;
    .close-btn {
      color: #fff;
      position: absolute;
      bottom: -150rpx;
      font-size: 72rpx;
    }
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
