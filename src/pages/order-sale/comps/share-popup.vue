<template>
  <u-mask
    :show="show"
    class="popup-content"
    :custom-style="{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }"
  >
    <scroll-view class="share-card" scroll-y="true">
      <image :src="imgSrc" mode="widthFix" />
    </scroll-view>

    <view class="btns">
      <button class="primary-btn round flex flex-center flex-middle" open-type="share" @click="handleShare">
        <text class="iconfont fw-normal icon-fenxiang fs-28 mr-20 mt-10" />
        转发到群聊
      </button>
    </view>
  </u-mask>
</template>

<script>
export default {
  props: {
    orderInfo: {
      type: Object,
      default: () => ({})
    },
    imgSrc: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    show: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    handleShare() {
      this.show = false
      this.$emit('share')
    },
    preview() {
      uni.previewImage({
        current: this.imgSrc, // 当前显示图片的http链接
        urls: [this.imgSrc] // 需要预览的图片http链接列表
      })
    },
    // 保存图片
    saveImage() {
      uni.saveImageToPhotosAlbum({
        filePath: this.imgSrc,
        success: () => {
          this.show = false
          uni.showToast({
            title: '保存成功'
          })
          this.show = false
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
.popup-content {
  .share-card {
    overflow: hidden;

    width: 620rpx;
    max-height: 900rpx;
    margin-bottom: 40rpx;

    image {
      width: 620rpx;
    }
  }
  .btns {
    width: 620rpx;
    margin-top: 40rpx;
  }
}
</style>
