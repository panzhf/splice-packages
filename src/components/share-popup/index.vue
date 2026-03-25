<template>
  <u-mask
    class="share-mask"
    :show="showDialog"
    :zoom="false"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
    z-index="100"
    @click="close"
  >
    <view>
      <view class="share-view">
        <view class="share-view-close c-6 fs-24 iconfont icon-close" @tap.stop="close" />
        <scroll-view class="share-view-con" :scroll-y="true">
          <image :src="path" mode="widthFix" @tap.stop="handlePreview(path)" />
        </scroll-view>
      </view>
      <view class="handle-box safe-area-inset-bottom flex">
        <button class="share-item flex-1 flex-column flex flex-center flex-middle" open-type="share" @tap="handleShare">
          <view class="icon-box1 flex flex-center flex-middle"><text class="iconfont iconfenxiangicon" /></view>
          <text class="handle-title fs-26 fw-medium">分享给好友</text>
        </button>
        <view class="flex-1 flex-column flex flex-center flex-middle" @tap.stop="saveImage">
          <view class="icon-box2 flex flex-center flex-middle">
            <text class="iconfont iconbaocundaoxiangceicon" />
          </view>
          <text class="handle-title fs-26 fw-medium">保存到相册</text>
        </view>
      </view>
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
import { previewMixin } from 'packages/mixins/img'
export default {
  mixins: [dialogMixin, previewMixin],
  props: {
    path: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleShare() {
      this.$emit('share')
    },
    // 保存图片
    saveImage() {
      uni.saveImageToPhotosAlbum({
        filePath: this.path,
        success: () => {
          this.showDialog = false
          uni.showToast({
            title: '保存成功'
          })
        },
        fail(err) {
          if (
            err.errMsg === 'saveImageToPhotosAlbum:fail:auth denied' ||
            err.errMsg === 'saveImageToPhotosAlbum:fail auth deny'
          ) {
            // 微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
            uni.showModal({
              title: '提示',
              content: '需要您授权保存相册',
              showCancel: false,
              success: () => {
                uni.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      uni.showModal({
                        title: '提示',
                        content: '获取权限成功，再次操作即可保存',
                        showCancel: false
                      })
                    } else {
                      uni.showModal({
                        title: '提示',
                        content: '获取权限失败，将无法保存到相册哦~',
                        showCancel: false
                      })
                    }
                  }
                })
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* #ifdef MP-CLOUDSHOP */
// 兼容云店
image {
  display: block;
  width: 100%;
}
button {
  margin: 0;
  padding: 0;
  line-height: 1;
  &::after {
    border: none;
  }
}
/* #endif */
.handle-box {
  position: absolute;
  bottom: 0;
  background-color: #fff;
  height: 200rpx;
  width: 100%;
  border-radius: 20rpx 20rpx 0 0;
  box-sizing: content-box;
  .share-item {
    border-radius: 20rpx 0 0;
    background-color: #fff;
  }
  .icon-box1,
  .icon-box2 {
    border-radius: 50%;
    width: 100rpx;
    height: 100rpx;
  }
  .icon-box1 {
    background-color: #02c668;
  }
  .icon-box2 {
    background-color: #ff8b3e;
  }
  .iconfont {
    font-size: 40rpx;
    color: #fff;
  }
  .handle-title {
    margin-top: 19rpx;
    color: #666;
  }
}

.share-view {
  position: absolute;
  width: 630rpx;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -54%);
  .share-view-close {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    padding: 10rpx;
  }
  .share-view-con {
    height: 1000rpx;
  }
}
</style>
