<template>
  <view class="upload-box flex flex-wrap">
    <view
      v-for="(item, index) in uploadPicArr"
      :key="index"
      class="item"
      :style="sizeStyle"
      @tap="changeHeadImg(index)"
    >
      <image class="pic-upload" :src="item" mode="scaleToFill" :style="sizeStyle" />
      <image v-if="modify" class="pic-dele" :src="icons.dele" mode="scaleToFill" :style="deleteSizeStyle" @tap.stop="handleDelete(index)" />
    </view>
    <!-- 上传按钮 -->
    <image
      v-if="canUpload"
      :src="icons.upload"
      mode="scaleToFill"
      :style="sizeStyle"
      class="pic-upload"
      @tap="changeHeadImg(-1)"
    />
    <!-- 上传中占位符 - 只在上传按钮位置显示一个 -->
    <view v-if="isUploading && !canUpload" :style="sizeStyle" class="item">
      <view class="uploading-text">上传中...</view>
    </view>
  </view>
</template>

<script>
/*
 * 目前只能上传图片
 * 零售助手、会员小程序、业务帮帮、新经销助手、金牌导购
 */
import { staticURL } from '@/config'
// #ifdef MP-MEMBER || MP-RETAIL
import { chooseImg } from '@/utils/upload'
// #endif

// #ifdef MP-DISTRIBUTION || MP-GUIDE
import { chooseMedia } from 'packages/utils/upload'
// #endif
// #ifdef MP-SALE
import { chooseMediaImg } from '@/utils/upload'
// #endif

// #ifdef H5-ACT
import { chooseImg, uploadImg as uploadImgAct } from 'packages/utils/upload-act'
// #endif
// #ifndef H5-ACT
import { uploadImg } from '@/utils/upload'
// #endif
export default {
  name: 'UploadImages',
  props: {
    modify: {
      type: Boolean, // false 不可修改
      default: true
    },
    isReplace: {
      type: Boolean,
      default: true
    },
    value: {
      type: Array,
      default() {
        return []
      }
    },
    maxLength: {
      type: Number,
      default: 1
    },
    size: {
      type: [Number, String],
      default: 80 // 上传组件大小
    },
    multiple: {
      type: Boolean,
      default: false // 是否多选
    },
    itemStyle: {
      type: String,
      default: '' // item样式
    },
    sourceType: {
      type: Array,
      default() {
        return ['album', 'camera'] // 图片选择来源，默认相册和相机
      }
    },
    deleteSize: {
      type: [Number, String],
      default: 24 // 删除按钮大小，单位 rpx
    }
  },
  data() {
    return {
      icons: {
        upload: staticURL(true) + 'common/upload.jpg',
        dele: staticURL(true) + 'common/icon-dele.png'
      },
      uploadPicArr: this.value,
      isUploading: false // 添加上传状态标记
    }
  },
  computed: {
    sizeStyle() {
      const s = []
      s.push(`width: ${this.size}rpx`)
      s.push(`height: ${this.size}rpx`)

      if (this.itemStyle) {
        s.push(this.itemStyle)
      }
      return s.join(';')
    },
    deleteSizeStyle() {
      return `width: ${this.deleteSize}rpx; height: ${this.deleteSize}rpx`
    },
    // 添加上传按钮显示控制
    canUpload() {
      return this.modify && !this.isUploading && this.uploadPicArr.length < this.maxLength
    }
  },
  watch: {
    value: {
      handler(val) {
        this.uploadPicArr = val
      }
    }
  },
  methods: {
    async changeHeadImg(n) {
      if (!this.modify || (n !== -1 && !this.isReplace)) return this.$emit('tap')

      // 防止并发上传
      if (this.isUploading) {
        return
      }

      // 边界检查 - 只对新增图片进行限制，替换图片不受限制
      if (n === -1 && this.uploadPicArr.length >= this.maxLength) {
        return
      }

      let count = 1
      if (this.multiple) {
        count = this.maxLength - this.uploadPicArr.length
        count = n === -1 ? count : count + 1
        count = count > 9 ? 9 : count
      }

      // 选择图片
      let paths = []
      try {
        // #ifdef MP-MEMBER
        paths = await chooseImg({ mediaType: ['image'], count, sourceType: this.sourceType })
        // #endif

        // #ifdef MP-RETAIL
        paths = await chooseImg({ mediaType: ['image'], count })
        // #endif

        // #ifdef MP-DISTRIBUTION ||  MP-GUIDE
        paths = await chooseMedia({ mediaType: ['image'], count })
        // #endif

        // #ifdef MP-SALE
        const p = await chooseMediaImg({
          count
        })
        paths = p.tempFiles.map(item => item.tempFilePath)
        // #endif

        // #ifdef H5-ACT
        paths = await chooseImg({ mediaType: ['image'], count, sourceType: this.sourceType })
        // #endif
      } catch (error) {
        return
      }

      if (!paths?.length) return

      // 设置上传状态
      this.isUploading = true
      this.$loading.show('图片上传中')

      try {
        paths = this.multiple ? paths : paths.slice(0, 1)

        // 使用 Promise.all 并行上传所有图片
        const uploadPromises = paths.map(item => this.uploadSingleImage(item))
        const results = await Promise.all(uploadPromises)

        // 过滤成功上传的图片
        const successPaths = results.filter(result => result.success).map(result => result.path)

        if (successPaths.length > 0) {
          if (n === -1) {
            this.uploadPicArr.splice(this.uploadPicArr.length, 0, ...successPaths)
          } else {
            this.uploadPicArr.splice(n, 1, ...successPaths)
          }
          this.handBackImage()
        }

        // 显示上传结果提示
        if (successPaths.length !== results.length) {
          const failedCount = results.length - successPaths.length
          this.$msg(`有 ${failedCount} 张图片上传失败`)
        }
      } catch (error) {
        this.$msg('上传失败，请重试')
      } finally {
        // 重置上传状态
        this.isUploading = false
        this.$loading.hide()
      }
    },

    // 上传单张图片的方法
    async uploadSingleImage(item) {
      try {
        let res = {}
        // #ifdef MP-DISTRIBUTION || MP-GUIDE
        res = await uploadImg(item)
        // #endif
        // #ifdef MP-MEMBER || MP-RETAIL
        res = await uploadImg(item, false)
        // #endif
        // #ifdef MP-SALE
        // 无需jscode，需要loading
        res = await uploadImg(item, 'user/uploadimage', false, false)
        // #endif
        // #ifdef H5-ACT
        res = await uploadImgAct(item)
        // #endif

        if (this.$ck(res, true)) {
          let path = res.return_data
          // #ifdef MP-MEMBER
          path = path[0].imgurl
          // #endif
          // #ifdef H5-ACT
          // 活动页上传接口 return_data 可能为 url 字符串或 [{ imgurl }]
          path = path[0].ImgUrl
          // #endif
          return { success: true, path }
        } else {
          return { success: false, error: res.message || '上传失败' }
        }
      } catch (error) {
        return { success: false, error: error.message || '上传失败' }
      }
    },
    handBackImage() {
      this.$emit('input', this.uploadPicArr)
    },
    handleDelete(n) {
      this.uploadPicArr.splice(n, 1)
      this.$emit('input', this.uploadPicArr)
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-box {
  .item {
    // width: 80rpx;
    // height: 80rpx;
    margin: 0 20rpx 20rpx 0;
    position: relative;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;

    .pic-dele {
      position: absolute;
      right: -20rpx;
      top: -20rpx;
      padding: 10rpx;
    }

    .uploading-text {
      font-size: 20rpx;
      color: #6b7280;
      text-align: center;
    }
  }

  // .pic-upload {
  //   width: 80rpx;
  //   height: 80rpx;
  // }
}
</style>
