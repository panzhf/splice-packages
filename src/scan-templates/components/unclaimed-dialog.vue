<template>
<!-- #ifdef H5 -->
  <view v-show="isShow" class="unclaimed-dialog-container" :class="isShowAni ? 'fade-leave-to' : ''">
<!-- #endif -->
<!-- #ifdef MP-WEIXIN -->
  <view v-if="isShow" class="unclaimed-dialog-container" :class="isShowAni ? 'fade-leave-to' : ''">
<!-- #endif -->
    <view class="mask" @click="handleClickMask"></view>
    <view class="content">
      <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog"></view>
      <image class="pop__title" style="width: 560rpx;height: 140rpx;" :src="titleImg" mode="scaleToFill" />
      <view class="pop__content">
        <view class="pop__bg-top">
          <image :src="bgTopImg" class="pop__bg-top-img" style="width: 628rpx;height: 60rpx;" mode="scaleToFill" />
        </view>
        <view class="pop__bg-center" :style="{ backgroundImage: 'url(' + bgCenterImg + ')' }">
          <view
            v-for="(item, index) in list"
            :key="index"
            class="pop__prize-item"
            :style="{ backgroundImage: 'url(' + prizeBgImg + ')' }"
          >
            <image
              v-if="index === 0"
              height="100%"
              class="overdue-img"
              style="width:152rpx;height: 52rpx;"
              :src="overdueImg"
              mode="scaleToFill"
            />
            <image class="prize-icon" :src="item.imageurl || defaultPrizeIcon" mode="widthFix" />
            <view class="prize-name ellipsis">{{ item.awardname }}</view>
            <image
              class="prize-btn"
              :class="index === 0 ? 'first-prize-btn' : ''"
              style="width:200rpx;height: 67rpx;"
              :src="prizeBtnPngImg"
              mode="scaleToFill"
              @click="handleJumpToAward(item)"
            />
          </view>
        </view>
        <view class="pop__bg-bottom">
          <image class="bottom-img" style="width: 628rpx;height: 165rpx;" :src="bgBottomImg" mode="scaleToFill" />
          <p class="pop__desc">点击“现在就领”进入个人中心-我的奖品领取吧。</p>
        </view>
      </view>
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
    // 待领取奖品列表
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      isShowAni: false,
      bgTopImg: staticURL(true) + 'scan/win-dialog-bg-top2.png',
      bgCenterImg: staticURL(true) + 'scan/win-dialog-bg-center.png',
      bgBottomImg: staticURL(true) + 'scan/win-dialog-bg-bottom.png',
      prizeBtnGifImg: staticURL(true) + 'scan/unclaimed-dialog-bg-btn-gif.gif',
      prizeBtnPngImg: staticURL(true) + 'scan/unclaimed-dialog-bg-btn-png.png',
      titleImg: staticURL(true) + 'scan/unclaimed-dialog-title-img.png',
      defaultPrizeIcon: staticURL(true) + 'scan/win-dialog-prize-icon.jpg',
      prizeBgImg: staticURL(true) + 'scan/win-dialog-prize-bg.png',
      overdueImg: staticURL(true) + 'scan/unclaimed-dialog-overdue-icon.png'
    }
  },
  watch: {
    isShow(val) {
      if (val) {
        this.isShowAni = false
      }
    }
  },
  methods: {
    // 点击遮罩
    handleClickMask() {
      // this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.isShowAni = true
      setTimeout(() => {
        this.$emit('update:isShow', false)
        this.$emit('close')
      }, 580)
    },
    // 跳转领奖页
    handleJumpToAward(item) {
      /* #ifdef H5 */
      location.href = item.receiveurl
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: `/personal/prize/prize-detail?id=${item.id}&type=${item.type}&detailType=${item.detailtype}&volumeId=${item.volumeid}`
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
.unclaimed-dialog-container {
  position: fixed;
  z-index: 30000;
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
    /* #ifdef MP-WEIXIN */
    animation: tanchuang 0.4s ease-in-out;
    /* #endif */
    .pop__title {
      position: absolute;
      top: -140rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 560rpx;
    }
    .pop__content {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .pop__bg-top {
      position: relative;
      width: 628rpx;

      .pop__bg-top-img {
        display: block;
        width: 628rpx;
      }
    }
    .pop__bg-center {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      width: 628rpx;
      height: 100%;
      max-height: 450rpx;
      overflow-y: auto;
      background-size: 100%;
      background-repeat: repeat-y;

      .pop__prize-item {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 46rpx;
        width: 580rpx;
        height: 122rpx;
        margin-top: 34rpx;
        background-size: 100%;
        background-repeat: no-repeat;
        z-index: 100;
        box-sizing: border-box;

        &:first-child {
          margin-top: 24rpx;
        }

        .overdue-img {
          position: absolute;
          top: -22rpx;
          left: 130rpx;
          width: 152rpx;
        }

        .prize-icon {
          width: 60rpx;
          height: 60rpx;
          margin-right: 16rpx;
          border-radius: 5rpx;
        }
        .prize-name {
          width: 300rpx;
          color: #eb562a;
          font-size: 24rpx;
          font-weight: bold;
        }
        .prize-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 200rpx;
          font-size: 24rpx;
          color: #fff;

          &.first-prize-btn {
            animation: firstAni 0.6s infinite linear alternate;
          }

          @keyframes firstAni {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(0.8);
            }
          }
        }
      }
    }
    .pop__bg-bottom {
      position: relative;
      width: 628rpx;
      .bottom-img {
        width: 628rpx;
      }
      .pop__desc {
        position: absolute;
        bottom: 30%;
        width: 100%;
        text-align: center;
        color: #fff;
        font-size: 24rpx;
      }
    }

    .close-btn {
      position: absolute;
      top: -180rpx;
      right: 0;
      color: #fff;
      opacity: 0.6;
      font-size: 48rpx;
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

.fade-leave-to {
  animation: fadeOutBottomRight ease-in-out;
  animation-duration: 0.6s;
}

@keyframes fadeOutBottomRight {
  0% {
    background-color: transparent;
    opacity: 1;
    transform: translate(0, 0) scale(1);
    -webkit-transform: translate(0, 0) scale(1);
  }
  100% {
    background-color: transparent;
    opacity: 0;
    transform: translate(50%, 25%) scale(0);
    -webkit-transform: translate(50%, 25%) scale(0);
  }
}
</style>
