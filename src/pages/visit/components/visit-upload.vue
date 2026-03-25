<template>
  <view class="upload-box" :style="gridStyle">
    <view
      v-for="(item, index) in uploadPicArr"
      :key="index"
      class="item"
      :style="sizeStyle"
      @tap="handlePreview(index)"
    >
      <view class="box">
        <image class="pic-upload" :src="item" mode="aspectFit" :style="sizeStyle" />
      </view>
      <text v-if="modify" class="close iconfont iconshanchu1" @tap.stop="handleDelete(index)"></text>
    </view>
    <!-- 上传按钮 -->
    <view v-if="canUpload" class="item ml-10" :style="sizeStyle">
      <view class="box add" @tap.stop="changeHeadImg">
        <text class="iconfont iconshangchuantupian"></text>
      </view>
    </view>
    <!-- 上传中占位符 -->
    <view v-if="isUploading && !canUpload" class="item" :style="sizeStyle">
      <view class="box">
        <u-loading mode="circle" size="48"></u-loading>
      </view>
    </view>
    <!-- 隐藏的 canvas 用于绘制水印 -->
    <canvas
      :id="canvasId"
      :canvas-id="canvasId"
      class="watermark-canvas"
      :style="{ height: `${rectHeight}px`, width: `${rectWidth}px` }"
    >
    </canvas>
  </view>
</template>

<script>
import { chooseMediaImg, uploadImg } from '@/utils/upload'
import { getImageInfo } from 'packages/utils/utils'
import dayjs from 'dayjs' 

export default {
  name: 'VisitUpload',
  props: {
    modify: {
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
      default: 128
    },
    multiple: {
      type: Boolean,
      default: false
    },
    enableWatermark: {
      type: Boolean,
      default: false
    },
    // 水印信息：业务员姓名、客户坐标、距离限制等（均为全小写字段）
    watermarkMeta: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      uploadPicArr: Array.isArray(this.value) ? [...this.value] : [],
      isUploading: false,
      rectHeight: 0,
      rectWidth: 0,
      httpBgImg: '',
      canvasId: `visitWatermarkCanvas`
    }
  },
  computed: {
    sizeStyle() {
      return `width: ${this.size}rpx; height: ${this.size}rpx`
    },
    gridStyle() {
      const itemSize = Number(this.size)
      const gap = 8
      return {
        display: 'flex',
        flexWrap: 'nowrap',
        gap: `${gap}rpx`
      }
    },
    canUpload() {
      return this.modify && !this.isUploading && this.uploadPicArr.length < this.maxLength
    }
  },
  watch: {
    value: {
      handler(val) {
        this.uploadPicArr = Array.isArray(val) ? [...val] : []
      }
    }
  },
  methods: {
    handlePreview(index) {
      const urls = this.uploadPicArr.filter(Boolean)
      if (!urls.length) return
      uni.previewImage({
        current: this.uploadPicArr[index] || urls[0],
        urls
      })
    },


    drawSingleLineWithEllipsis(ctx, text, x, y, maxWidth, fontSize) {
      const safeText = `${text || ''}`
      ctx.setFontSize(fontSize)
      ctx.setTextAlign('left')
      ctx.setFillStyle('#fff')
      if (ctx.measureText(safeText).width <= maxWidth) {
        ctx.fillText(safeText, x, y)
        return
      }
      const ellipsis = '...'
      let t = safeText
      while (ctx.measureText(t + ellipsis).width > maxWidth && t.length > 0) {
        t = t.slice(0, -1)
      }
      ctx.fillText(t + ellipsis, x, y)
    },

    drawMultiLineText(ctx, text, x, y, maxWidth, fontSize, lineHeight, maxLines = 2) {
      ctx.setFontSize(fontSize)
      ctx.setTextAlign('left')
      ctx.setFillStyle('#fff')
      
      const safeText = `${text || ''}`
      const lines = []
      let currentLine = ''
      let processedLength = 0
      
      for (let i = 0; i < safeText.length; i++) {
        const testLine = currentLine + safeText[i]
        const width = ctx.measureText(testLine).width
        
        if (width <= maxWidth) {
          currentLine = testLine
        } else {
          if (currentLine) {
            lines.push(currentLine)
            processedLength += currentLine.length
            if (lines.length >= maxLines) {
              break
            }
            currentLine = safeText[i]
          } else {
            currentLine = safeText[i]
          }
        }
      }
      
      const hasMore = processedLength + (currentLine ? currentLine.length : 0) < safeText.length
      
      if (currentLine && lines.length < maxLines) {
        lines.push(currentLine)
      }
      
      lines.forEach((line, index) => {
        if (index === maxLines - 1 && hasMore) {
          const ellipsis = '...'
          let t = line
          while (ctx.measureText(t + ellipsis).width > maxWidth && t.length > 0) {
            t = t.slice(0, -1)
          }
          ctx.fillText(t + ellipsis, x, y + index * lineHeight)
        } else {
          ctx.fillText(line, x, y + index * lineHeight)
        }
      })
      
      return lines.length
    },

    setCanvas(info, wmLines = []) {
      return new Promise(async resolve => {
        const canvasWidth = 700
        const minHeight = 400
        const aspectRatio = info.width / info.height
        let canvasHeight = canvasWidth / aspectRatio
        if (canvasHeight < minHeight) canvasHeight = minHeight

        this.rectWidth = canvasWidth
        this.rectHeight = canvasHeight

        setTimeout(() => {
          const ctx = uni.createCanvasContext(this.canvasId, this)
          const fontSize = 20
          const lineHeight = fontSize * 1.3
          const padding = 20
          const textX = padding
          const maxWidth = canvasWidth - padding * 2
          const lineSpacing = 8
          
          ctx.setFontSize(fontSize)
          ctx.setTextAlign('left')
          ctx.setFillStyle('#fff')
          
          let totalLines = 0
          let addressLines = 0
          if (wmLines[0]) totalLines += 1
          if (wmLines[1]) {
            const testText = wmLines[1]
            let testLines = 0
            let testLine = ''
            for (let i = 0; i < testText.length && testLines < 2; i++) {
              const test = testLine + testText[i]
              if (ctx.measureText(test).width <= maxWidth) {
                testLine = test
              } else {
                if (testLine) {
                  testLines++
                  testLine = testText[i]
                } else {
                  testLine = testText[i]
                }
              }
            }
            if (testLine) testLines++
            addressLines = testLines || 1
            totalLines += addressLines
          }
          if (wmLines[2]) totalLines += 1
          
          const contentCount = (wmLines[0] ? 1 : 0) + (wmLines[1] ? 1 : 0) + (wmLines[2] ? 1 : 0)
          const spacingCount = contentCount > 1 ? contentCount - 1 : 0
          const bottomPadding = addressLines === 1 ? padding + 5 : addressLines > 1 ? padding - 5 : padding
          const watermarkAreaHeight = lineHeight * totalLines + padding + bottomPadding + lineSpacing * spacingCount
          const watermarkStartY = canvasHeight - watermarkAreaHeight

          ctx.drawImage(this.httpBgImg, 0, 0, canvasWidth, canvasHeight)

          let currentY = watermarkStartY + padding + lineHeight

          if (wmLines[0]) {
            this.drawSingleLineWithEllipsis(ctx, wmLines[0], textX, currentY, maxWidth, fontSize)
            currentY += lineHeight + lineSpacing
          }
          if (wmLines[1]) {
            const addressLines = this.drawMultiLineText(ctx, wmLines[1], textX, currentY, maxWidth, fontSize, lineHeight, 2)
            currentY += lineHeight * addressLines + lineSpacing
          }
          if (wmLines[2]) {
            this.drawSingleLineWithEllipsis(ctx, wmLines[2], textX, currentY, maxWidth, fontSize)
          }

          ctx.draw(true)

          const _this = this
          setTimeout(() => {
            uni.canvasToTempFilePath(
              {
                x: 0,
                y: 0,
                width: _this.rectWidth,
                height: _this.rectHeight,
                destWidth: _this.rectWidth,
                destHeight: _this.rectHeight,
                canvasId: _this.canvasId,
                fileType: 'jpg',
                success(res) {
                  resolve(res.tempFilePath)
                },
                fail(err) {
                  console.error('生成水印图片失败', err)
                  resolve(_this.httpBgImg)
                }
              },
              _this
            )
          }, 300)
        }, 300)
      })
    },
    async changeHeadImg() {
      if (!this.modify || this.isUploading || this.uploadPicArr.length >= this.maxLength) return

      let count = 1
      if (this.multiple) {
        count = Math.min(this.maxLength - this.uploadPicArr.length, 5)
      }

      let paths = []
      try {
        const p = await chooseMediaImg({
          count,
          sourceType: ['camera'],
          mediaType: ['image']
        })
        paths = p.tempFiles.map(item => item.tempFilePath)
      } catch (error) {
        return
      }

      if (!paths?.length) return

      this.isUploading = true
      this.$loading.show('图片上传中')

      try {
        paths = this.multiple ? paths : paths.slice(0, 1)
        const processedPaths = []

        if (this.enableWatermark) {
          const { salesmanname = '', address = '', arriveDistance = '' } = this.watermarkMeta
          const wmLines = [
            `${salesmanname ? `${salesmanname} ` : ''}${dayjs().format('YYYY-MM-DD HH:mm')}`,
            address || '',
            arriveDistance ? `偏差${arriveDistance}` : ''
          ]

          for (const path of paths) {
            this.httpBgImg = path
            const imgInfo = await getImageInfo(path)
            processedPaths.push(await this.setCanvas(imgInfo, wmLines))
          }
        } else {
          processedPaths.push(...paths)
        }

        const uploadPromises = processedPaths.map(item => uploadImg(item, 'user/uploadimage', false, false))
        const results = await Promise.all(uploadPromises)
        const successUrls = results.filter(item => this.$ck(item)).map(item => item.return_data)
        this.uploadPicArr = [...this.uploadPicArr, ...successUrls]

        this.$emit('input', this.uploadPicArr)
        this.$emit('change', this.uploadPicArr)
      } catch (error) {
        console.error('上传失败', error)
        this.$msg('上传失败，请重试')
      } finally {
        this.isUploading = false
        this.$loading.hide()
      }
    },
    handleDelete(index) {
      this.uploadPicArr.splice(index, 1)
      this.$emit('input', this.uploadPicArr)
      this.$emit('change', this.uploadPicArr)
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-box {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  
  .item {
    position: relative;
    flex-shrink: 0;
    background: #ffffff;

    .box {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .pic-upload {
        width: 100%;
        height: 100%;
      }
    }

    .add {
      background-color: #f3f3f3;
      color: #DFDFDF;
    }

    .close {
      position: absolute;
      right: 0rpx;
      top: 0rpx;
      color: red;
      z-index: 9;
      font-size: 30rpx;
    }
  }
}

.watermark-canvas {
  position: fixed;
  z-index: -1;
  left: -99999px;
  opacity: 0;
  pointer-events: none;
}
</style>

