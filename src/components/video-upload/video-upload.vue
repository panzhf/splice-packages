<template>
  <view class="video-upload">
    <view v-if="!value" class="upload-placeholder" @tap="handleUpload">
      <view class="upload-content">
        <view class="play-icon"></view>
        <view class="upload-text">录制视频</view>
      </view>
    </view>
    <view v-else class="video-preview">
      <view class="video-wrap" @tap="handleTap">
        <video :src="videoSrc" controls object-fit="contain"></video>
      </view>
      <view v-if="modify" class="pic-dele" @tap.stop="handleDelete">
        <i class="close iconfont iconshanchu1 c-danger"></i>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
// #ifdef H5-ACT
import { uploadVideo } from 'packages/utils/upload-act'
// #endif
// #ifndef H5-ACT
import { uploadVideo } from '@/utils/upload'
// #endif

export default {
  name: 'VideoUpload',
  props: {
    value: {
      type: String,
      default: ''
    },
    modify: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      icons: {
        dele: staticURL(true) + 'common/icon-dele.png'
      }
    }
  },
  computed: {
    // 协议相对地址(//)转为 https:，否则小程序 video 可能黑屏、时长为 0
    videoSrc() {
      const url = this.value
      if (!url) return ''
      return url.replace(/^(http:)?(\/\/)/, 'https://')
    }
  },
  methods: {
    async handleUpload() {
      uni.chooseVideo({
        sourceType: ['camera'],
        maxDuration: 45,
        camera: 'back',
        success: async res => {
          try {
            const uploadRes = await uploadVideo(res.tempFilePath)
            const data = uploadRes?.return_data 
            if (data) {
              let path = data?.url
              // #ifdef H5-ACT
              // 活动页上传接口 return_data 可能为 url 字符串或 [{ imgurl }]
              path = data
              // #endif
              this.$emit('input', path)
              this.$emit('change', path)
            }
          } catch (e) {
            console.error('视频上传失败', e)
          }
        }
      })
    },
    handleTap() {
      const url = this.videoSrc
      if (!url) return
      try {
        uni.previewMedia({
          sources: [{ url, type: 'video' }]
        })
      } catch (e) {
        console.error('previewMedia 不支持或调用失败', e)
      }
    },
    handleDelete() {
      this.$emit('input', '')
      this.$emit('change', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.video-upload {
  position: relative;
  width: 100%;
  .upload-placeholder {
    width: 100%;
    height: 488rpx;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .play-icon {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background: #e5e5e5;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20rpx;
        position: relative;

        &::after {
          content: '';
          width: 0;
          height: 0;
          border-left: 30rpx solid #fff;
          border-top: 20rpx solid transparent;
          border-bottom: 20rpx solid transparent;
          margin-left: 8rpx;
        }
      }

      .upload-text {
        font-size: 36rpx;
        color: #ccc;
      }
    }
  }

  .video-preview {
    position: relative;
    width: 100%;
    height: 488rpx;

    .video-wrap {
      width: 100%;
      height: 100%;
      overflow: hidden;

      video {
        width: 100%;
        height: 100%;
      }
    }

    .pic-dele {
      position: absolute;
      right: -20rpx;
      top: -15rpx; 
      z-index: 9;
      &:after {
        content: '';
        position: absolute;
        background-color: white;
        right: 10rpx;
        top: 10rpx;
        display: inline-block;
        width: 25rpx;
        height: 20rpx;
        z-index: -1;
      }
      .close { 
        font-size: 40rpx;
        color: rgb(253, 91, 60);
      }
    }
  }
}
</style>
