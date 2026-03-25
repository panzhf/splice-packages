<template>
  <view>
    <view v-if="shareImgFlag === 1" class="share-mask" catchtouchmove="true" @tap="hideShareView">
      <view class="share-view">
        <view class="share-view-con">
          <image
            style="width: 540rpx; height: 960rpx; border-radius: 20rpx"
            :src="shareImg"
            @tap.stop="handlePreview(shareImg)"
          />
        </view>
      </view>
      <view class="handle-box iphoneX">
        <button class="handle-box-item share-button" open-type="share" formType="submit">
          <view class="icon-box1"><text class="iconfont iconfenxiangicon" /></view>
          <text class="handle-title">分享给好友</text>
        </button>
        <view class="handle-box-item" @tap.stop="saveImage">
          <view class="icon-box2"><text class="iconfont iconbaocundaoxiangceicon" /></view>
          <text class="handle-title">保存到相册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { previewMixin } from 'packages/mixins/img'
export default {
  mixins: [previewMixin],
  data() {
    return {
      shareImgFlag: 0,
      shareImg: '',
      footer: true
    }
  },
  watch: {
    shareImgFlag(val) {
      if (!val) {
        this.shareImgFlag = 0
        this.shareImg = ''
        this.footer = true
      }
    }
  },
  methods: {
    reset() {
      this.shareImg = ''
      this.footer = true
      this.shareImgFlag = 0
    },
    show(path) {
      this.shareImg = path
      this.type = ''
      this.shareImgFlag = 1
    },
    /** 邀请好友打开 */
    showImage(path) {
      this.shareImg = path
      this.shareImgFlag = 1
    },
    // 保存图片
    saveImage() {
      if (this.type === 'live' && !this.shareContainer) {
        this.liveShowImage()
        return false
      }
      let that = this
      wx.saveImageToPhotosAlbum({
        filePath: that.shareImg,
        success() {
          that.shareImgFlag = 0
          wx.showToast({
            title: '保存成功'
          })
        },
        fail(err) {
          if (
            err.errMsg === 'saveImageToPhotosAlbum:fail:auth denied' ||
            err.errMsg === 'saveImageToPhotosAlbum:fail auth deny'
          ) {
            // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
            wx.showModal({
              title: '提示',
              content: '需要您授权保存相册',
              showCancel: false,
              success: modalSuccess => {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      wx.showModal({
                        title: '提示',
                        content: '获取权限成功,再次点击图片即可保存',
                        showCancel: false
                      })
                    } else {
                      wx.showModal({
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
    },
    hideShareView() {
      this.shareImgFlag = false
      this.reset()
    },
    /** 绘制 */
    canvasCreat() {
      return new Promise((resolve, reject) => {
        let ctx = uni.createCanvasContext('myQrcode', this)
        ctx.setFillStyle('white')
        ctx.fillRect(0, 0, 260, 462)

        // 画出头像标题
        let avatarurl_width = 30 //绘制的头像宽度
        let avatarurl_heigth = 30 //绘制的头像高度
        let avatarurl_x = 20 //绘制的头像在画布上的位置
        let avatarurl_y = 30 //绘制的头像在画布上的位置
        ctx.save()
        ctx.beginPath() //开始绘制
        //先画个圆  前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针

        ctx.arc(
          avatarurl_width / 2 + avatarurl_x,
          avatarurl_heigth / 2 + avatarurl_y,
          avatarurl_width / 2,
          0,
          Math.PI * 2,
          false
        )

        ctx.clip() //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因

        ctx.drawImage(this.httpPhoto, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth) // 推进去图片，必须是https图片

        ctx.restore() //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制

        ctx.draw(true)
        // 画出直播标题-----------------
        ctx.setFontSize(12)
        ctx.setTextAlign('left')
        ctx.setFillStyle('#000')
        ctx.fillText(`${this.wxName} 邀请你观看直播`, 60, 50)
        ctx.draw(true)
        // 画出封面
        ctx.drawImage(this.codeImg, 20, 70, 220, 200)
        ctx.draw(true)

        // 画出标题
        ctx.setFontSize(12)
        ctx.setTextAlign('left')
        ctx.setFillStyle('#000')
        ctx.fillText(this.title, 20, 290)
        ctx.draw(true)

        // 画出主播昵称
        ctx.setFontSize(12)
        ctx.setTextAlign('left')
        ctx.setFillStyle('#000')
        ctx.fillText(`主播：${this.anchor}`, 20, 310)
        ctx.draw(true)

        // 画出开播时间
        ctx.setFontSize(12)
        ctx.setTextAlign('left')
        ctx.setFillStyle('#000')
        ctx.fillText(`开播时间：${this.time}`, 20, 330)
        ctx.draw(true)

        this.textPrewrap(ctx, this.text, 20, 370, 20, 100, 3)

        // 画出提示线
        ctx.setFontSize(12)
        ctx.setTextAlign('left')
        ctx.setFillStyle('#7b8b99')
        ctx.fillText(`长按识别进入直播间>>`, 20, 440)
        ctx.draw(true)

        // 画出二维码
        ctx.drawImage(this.httpCode, 150, 346, 100, 100)
        ctx.draw(true)
        setTimeout(() => {
          let _this = this
          wx.canvasToTempFilePath(
            {
              x: 0,
              y: 0,
              width: 260,
              height: 462,
              destWidth: 260,
              destHeight: 462,
              canvasId: 'myQrcode',
              fileType: 'jpg',
              success(res) {
                wx.hideLoading()
                _this.moveFlag = 0
                _this.shareImgFlag = 1
                _this.shareImg = res.tempFilePath

                // 绘画成功
              },
              fail(err) {
                wx.showToast({
                  title: '生成失败,' + err,
                  icon: 'none'
                })
              }
            },
            this
          )
        }, 1000)
      })
    },
    /** 生成海报 */
    async setShareInfo() {
      wx.showLoading({
        title: '正在生成图片'
      })
      let that = this

      // 图片下载
      return new Promise(async (resolve, reject) => {
        let imgdata = await that.downLoadImg(that.userImg)
        let httpCode = await that.downLoadImg(that.code)
        let httpPhoto = await that.downLoadImg(that.photo)
        that.httpCode = httpCode
        that.codeImg = imgdata
        that.httpPhoto = httpPhoto
        resolve(that.httpCode, that.codeImg, that.httpPhoto)
        that.canvasCreat()
      })
    },
    /**
     * ctx： 画布的上下文环境
     * content： 需要绘制的文本内容
     * drawX： 绘制文本的x坐标
     * drawY： 绘制文本的y坐标
     * lineHeight：文本之间的行高
     * lineMaxWidth：每行文本的最大宽度
     * lineNum：最多绘制的行数
     */
    textPrewrap(ctx, content, drawX, drawY, lineHeight, lineMaxWidth, lineNum) {
      var drawTxt = '' // 当前绘制的内容
      var drawLine = 1 // 第几行开始绘制
      var drawIndex = 0 // 当前绘制内容的索引

      // 判断内容是否可以一行绘制完毕
      if (ctx.measureText(content).width <= lineMaxWidth) {
        ctx.fillText(content.substring(drawIndex, i), drawX, drawY)
      } else {
        for (var i = 0; i < content.length; i++) {
          drawTxt += content[i]
          if (ctx.measureText(drawTxt).width >= lineMaxWidth) {
            if (drawLine >= lineNum) {
              ctx.fillText(content.substring(drawIndex, i) + '..', drawX, drawY)
              break
            } else {
              ctx.fillText(content.substring(drawIndex, i + 1), drawX, drawY)
              drawIndex = i + 1
              drawLine += 1
              drawY += lineHeight
              drawTxt = ''
            }
          } else {
            // 内容绘制完毕，但是剩下的内容宽度不到lineMaxWidth
            if (i === content.length - 1) {
              ctx.fillText(content.substring(drawIndex), drawX, drawY)
            }
          }
        }
      }
    },
    // 下载图片,下载到本地，供绘图使用
    downLoadImg(url) {
      return new Promise((resolve, reject) => {
        let result = ''
        wx.getImageInfo({
          src: url,
          success(res) {
            result = res.path
            resolve(result)
          },
          fail(res) {
            // console.log(res, '失败')
            wx.showToast({
              title: '下载图片失败',
              icon: 'none'
            })
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-generate {
  background-color: #ff4d4d;
  color: #fff;
  width: 80%;
  text-align: center;
  line-height: 80rpx;
  height: 80rpx;
  margin: 0 auto;
  border-radius: 40rpx;
  margin-top: 50rpx;
}
.share-mask {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 200;
  display: block;
  &.show {
    opacity: 1;
    pointer-events: auto;
  }
  &.hide {
    // 这个方式已经不可取
    // animation-timing-function: ease;
    // animation-name: skuMaskHide;
    // animation-fill-mode: forwards;
    // animation-duration: .2s;
    display: none;
  }
  .handle-box {
    position: absolute;
    bottom: 0;
    background-color: #fff;
    height: 270rpx;
    width: 100%;
    border-radius: 20rpx 20rpx 0px 0px;
    display: flex;

    .handle-box-item {
      display: flex;
      flex-direction: column;
      flex: 1;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      position: relative;
      .share-tips {
        position: absolute;
        top: -36rpx;
        z-index: 1;
        right: -100rpx;
        background: #ffffff;
        border: 1rpx solid #cbcbcb;
        box-shadow: 0rpx 0rpx 6rpx 0rpx rgba(0, 0, 0, 0.06);
        border-radius: 20rpx;
        font-size: 22rpx;
        padding: 7rpx 12rpx;
        &:before {
          content: '';
          position: absolute;
          top: 50rpx;
          right: 250rpx;
          width: 0;
          height: 0;
          border: solid transparent;
          pointer-events: none;
          margin-top: -7rpx;
          border-color: transparent;
          border-top-color: #cccccc;
          border-width: 12rpx;
        }

        &:after {
          content: '';
          position: absolute;
          top: 50rpx;
          right: 250rpx;
          width: 0;
          height: 0;
          border: solid transparent;
          pointer-events: none;
          margin-top: -6rpx;
          border-color: transparent;
          border-top-color: #fff;
          border-width: 10rpx;
        }
      }
      &::after {
        border: none;
      }
      .icon-box1,
      .icon-box2 {
        border-radius: 50%;
        width: 100rpx;
        height: 100rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        .iconfenxiangicon,
        .iconbaocundaoxiangceicon {
          font-size: 40rpx;
          color: #fff;
        }
      }

      .icon-box1 {
        background-color: #02c668ff;
        margin-bottom: 20rpx;
      }

      .icon-box2 {
        background-color: #ff8b3e;
      }

      .handle-title {
        margin-top: 19rpx;
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #666666;
      }
    }
    .share-button {
      // padding-top: 24rpx;
      .handle-title {
        margin-top: 0;
      }
    }
  }
}
.share-canvas {
  border: 1px solid #c3c3c3;
  width: 750px;
  height: 1334px;
  position: fixed;
  z-index: -1;
  top: -10000000px;
  // top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}
.share-view {
  position: absolute;
  width: 630rpx;
  height: 1016.5rpx;
  left: 50%;
  top: 45%;
  margin: -508rpx 0 0 -315rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  .saveBtnWrapper {
    margin: 0 auto;
    margin-top: 50rpx;
    width: 400rpx;
    height: 70rpx;
    background-color: #ff4b40;
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #ffffff;
    line-height: 36rpx;
    border-radius: 35rpx;
    line-height: 70rpx;
    text-align: center;
  }
  .share-view-con {
    position: relative;
    .share-view-close {
      position: absolute;
      z-index: 1;
      padding: 10px;
      top: 0;
      right: 0;
      width: 20rpx;
      height: 20rpx;
    }
    .share-save-btn {
      width: 630rpx;
      height: 80rpx;
      line-height: 80rpx;
      // background-color: #DD2726;
      color: #fff;
      font-size: 30rpx;
      text-align: center;
      margin-top: 30rpx;
    }
  }
}
.iphoneX {
  padding-bottom: 0rpx;
  padding-bottom: calc(constant(safe-area-inset-bottom));
  padding-bottom: calc(env(safe-area-inset-bottom));
}
</style>
