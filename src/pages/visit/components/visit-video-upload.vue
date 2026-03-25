<template>
  <view class="visit-video-upload"> 
    <view v-if="!value" class="upload-placeholder" @tap="handleUpload">
      <view class="upload-content">
        <view class="play-icon"></view>
        <view class="upload-text">录制视频</view>
      </view>
    </view>
    <view v-else class="video-preview">
      <view class="video-wrap" @tap="handleTap">
        <video :src="value" controls></video>
      </view>
      <view class="delete-btn iconfont iconshanchu1" @tap.stop="handleDelete"> 
      </view>
    </view> 
  </view>
</template>

<script>
import { uploadVideo } from '@/utils/upload'

export default {
  name: 'VisitVideoUpload',
  props: {
    value: {
      type: String,
      default: ''
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
            // 参照图片上传：选择后直接上传，成功返回 url 写回 v-model
            const uploadRes = await uploadVideo(res.tempFilePath, 'commanage/uploadvideo', true, true)
            if (this.$ck(uploadRes)) {
                console.log('uploadRes', uploadRes)
              this.$emit('input', uploadRes.return_data)
              this.$emit('change', uploadRes.return_data)
            }
          } catch (e) {
            console.error('视频上传失败', e)
          }
        }
      })
    },
    handleTap() {
      const url = this.value
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
.visit-video-upload {
  position: relative;
  margin-bottom: 20rpx;
  margin-top: 20rpx; 

  .upload-placeholder {
    width: 650rpx;
    height: 488rpx; 
    background: #F5F5F5;
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
        background: #E5E5E5;
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
    width: 650rpx;
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

    .delete-btn {
      position: absolute;
      right: -1rpx;
      top: 0;
      color: red;
      z-index: 9;
      font-size: 60rpx;   
    }
  }
}
</style>


