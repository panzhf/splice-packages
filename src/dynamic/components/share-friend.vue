<template>
  <!--分享-->
  <view>
    <view
      v-if="shareImgFlag === 1"
      class="share-mask"
      catchtouchmove="true"
      border="false"
      style="z-index: 299; background: none"
      @tap="hideComponent"
    >
      <view class="share-view">
        <view class="share-view-con">
          <!-- <view class="share-view-close c-6 fs-24 iconfont icon-close" @tap="hideShareView"></view> -->
          <image style="width: 540rpx; height: 960rpx; vertical-align: top" :src="shareImg" />
          <view class="save-poster base-btn" @click="saveImage">保存海报</view>
          <!-- <view class="share-save-btn bgc-red theme-bgc" @tap="saveImage">保存到本地</view> -->
        </view>
      </view>
    </view>

    <view v-if="openSetFlag" class="share-mask" catchtouchmove="true" style="z-index: 302" @click="cancleSet">
      <view class="share-open-set">
        <view class="set-title">是否打开授权设置？</view>
        <view class="btn-openSet">
          <view @click="cancleSet">取消</view>
          <view>
            <button open-type="openSetting" class="button-style" catchtap="cancleSet">确定</button>
          </view>
        </view>
      </view>
    </view>

    <canvas id="myQrcode" canvas-id="myQrcode" class="share-canvas" catchtouchmove="true" />
    <view
      v-if="moveFlag !== -1"
      :class="['share-mask', moveFlag !== -1 ? 'show' : 'hide']"
      catchtouchmove="true"
      style="z-index: 100"
      @click.stop="hideShare"
      @touchmove.stop.prevent
    />
    <view
      :class="['share-model', 'safe-area-inset-bottom ', moveFlag === 1 ? 'share-move-up' : '']"
      catchtouchmove="true"
    >
      <view class="share-model-box">
        <button v-if="shareInfo.showFriend" class="shareBtn" open-type="share" @tap="setShareAppMessage">
          <view>
            <span class="icon iconfont icon-weixin" />
          </view>
          <view class="share-model-btn">微信好友</view>
        </button>
      </view>
      <view class="share-model-box" catchtouchmove="true" @click="getShareData">
        <view>
          <span class="icon iconfont icon-save" />
        </view>
        <view class="share-model-btn">生成海报</view>
      </view>
    </view>
  </view>
</template>
<script>
import { staticURL } from '@/config'
export default {
  props: {
    product: {
      type: Object
    },
    shareInfo: {
      type: Object,
      default: () => ({
        shareText: '转发好友', // 分享组件文案
        showPoster: true, // 海报显示
        showFriend: true // 分享好友显示
      })
    }
  },
  data() {
    return {
      width: 300, // 海报的宽度
      height: 380, // 海报的高度
      point: 0, // 积分
      price: 0, // 价格
      oriPrice: 0, // 原价
      articleBg: staticURL(true) + 'article-bg.jpg',
      timer: null,
      moveFlag: -1,
      shareImgFlag: 0,
      openSetFlag: false,
      productName: '',
      productImg: '', // 产品图片
      qrcode: '', // 小程序码
      shareImg: '' // 生成图片地址
    }
  },
  onLoad() {},
  onReady() {},

  methods: {
    getShareData() {
      this.$emit('getShareData')
    },
    // 隐藏所有
    hideComponent() {
      this.timer && clearTimeout(this.timer)
      this.shareImgFlag = 0
      this.moveFlag = -1
    },

    // 隐藏预览弹窗
    hideShareView() {
      this.shareImgFlag = 0
    },
    // 隐藏 分享按钮
    hideShare() {
      this.timer && clearTimeout(this.timer)
      this.moveFlag = -1
    },
    // 显示 分享按钮
    showShare() {
      this.moveFlag = 1
    },

    /** 发起分享设置 */
    setShareAppMessage() {
      // 分享回来不关闭弹窗
      // this.moveFlag = 0
      // this.$apply()
      this.$emit('getShareAppMessage')
    },
    // 生成海报- 下载图片 -其他信息准备
    async setShareInfo() {
      this.timer && clearTimeout(this.timer)
      uni.showLoading({
        title: '正在生成图片',
        mask: true
      })

      let that = this
      let p = that.product

      that.productImg = p.postpicture // 封面图
      that.qrcode = p.qrcodeurl // 小程序码，后端返回png图片。base64无法绘制
      // that.headpath = p.headpath
      that.productName = p.title
      that.price = p.price
      that.oriPrice = p.originalprice
      that.point = p.point || 0

      // 图片下载
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        that.productImg = await that.downLoadImg(that.productImg)
        that.qrcode = await that.downLoadImg(that.qrcode)
        // that.headpath = await that.downLoadImg(that.headpath)
        that.articleBg = await that.downLoadImg(that.articleBg)
        resolve(that.productImg, that.qrcode, that.headpath, that.articleBg)
        that.canvasCreat()
      })
    },

    cancleSet() {
      this.openSetFlag = false
    },

    // 保存图片
    saveImage() {
      let that = this
      this.timer && clearTimeout(this.timer)
      // 获取用户是否开启用户授权相册
      uni.getSetting({
        success(res) {
          // 如果没有则获取授权
          if (!res.authSetting['scope.writePhotosAlbum']) {
            uni.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                uni.saveImageToPhotosAlbum({
                  filePath: that.shareImg,
                  success() {
                    that.shareImgFlag = 0
                    // that.moveFlag = -1
                    uni.showToast({
                      title: '保存成功'
                    })
                  },
                  fail() {
                    uni.showToast({
                      title: '保存失败',
                      icon: 'none'
                    })
                  }
                })
              },
              fail() {
                // 如果用户拒绝过或没有授权，则再次打开授权窗口
                // （ps：微信api又改了现在只能通过button才能打开授权设置，以前通过openSetFlag就可打开，下面有打开授权的button弹窗代码）
                that.openSetFlag = true
              }
            })
          } else {
            // 有则直接保存
            uni.saveImageToPhotosAlbum({
              filePath: that.shareImg,
              success() {
                that.shareImgFlag = 0
                that.moveFlag = -1
                uni.showToast({
                  title: '保存成功'
                })
              },
              fail() {
                uni.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
            })
          }
        }
      })
    },
    // 下载图片,下载到本地，供绘图使用
    downLoadImg(url) {
      return new Promise((resolve, reject) => {
        let result = ''
        uni.getImageInfo({
          src: url,
          success(res) {
            result = res.path
            resolve(result)
          },
          fail() {
            uni.showToast({
              title: '下载图片失败',
              icon: 'none'
            })
          }
        })
      })
    },
    // 绘制海报
    canvasCreat() {
      let _this = this
      return new Promise((resolve, reject) => {
        const ctx = uni.createCanvasContext('myQrcode', _this)
        const txt1 = '长按识别小程序码'
        const txt2 = '进入小程序看更多动态'
        const shareTimeText = this.product.shareTime + '给你分享这条动态'
        ctx.setFillStyle('white')
        let w = 750
        let h = 1334
        ctx.fillRect(0, 0, 750, 1334)
        ctx.draw(true)

        // 画出海报背景图
        ctx.drawImage(this.articleBg, 0, 0, w, h)
        ctx.draw(true)
        let width = 750

        // 画出产品标题
        ctx.setFontSize(30)
        ctx.setFillStyle('#000000')
        ctx.setTextAlign('left')
        const nameWidth = ctx.measureText(this.productName).width
        var usedWidth = w - 60 // 每一行可用宽度
        var titleLen = this.productName.length
        var onewordWidth = nameWidth / titleLen // 一个字的长度
        var oneLineCount = Math.floor(usedWidth / onewordWidth) // 一行可以展示多少个字
        var titleStartY = h * (185 / 480) // 标题起始Y坐标
        var titleEndY = titleStartY // 标题结束Y坐标，用于计算分享时间位置

        // 一行可以画完标题
        if (titleLen <= oneLineCount) {
          this.wordsWrap(ctx, this.productName, usedWidth, usedWidth, 30, titleStartY, 50)
          titleEndY = titleStartY + 50
        } else if (titleLen <= oneLineCount * 2) {
          this.wordsWrap(ctx, this.productName.substring(0, oneLineCount), usedWidth, usedWidth, 30, titleStartY, 50)
          this.wordsWrap(ctx, this.productName.substring(oneLineCount), usedWidth, usedWidth, 30, titleStartY + 50, 50)
          titleEndY = titleStartY + 100
        } else {
          // 超过2行 64个字最多就3行
          this.wordsWrap(ctx, this.productName.substring(0, oneLineCount), usedWidth, usedWidth, 30, titleStartY, 50)
          this.wordsWrap(
            ctx,
            this.productName.substring(oneLineCount, oneLineCount * 2),
            usedWidth,
            usedWidth,
            30,
            titleStartY + 50,
            50
          )
          this.wordsWrap(
            ctx,
            this.productName.substring(2 * oneLineCount),
            usedWidth,
            usedWidth,
            30,
            titleStartY + 50 * 2,
            50
          )
          titleEndY = titleStartY + 150
        }

        // 画出分享者分享的时间（放在文章标题下面）
        ctx.setFontSize(24)
        ctx.setFillStyle('#AAAAAA')
        ctx.setTextAlign('left')
        const shareTime = ctx.measureText(shareTimeText).width
        this.wordsWrap(ctx, shareTimeText, shareTime, w - 60, 30, titleEndY + 20, 60)

        // 画出长按识别小程序码
        ctx.setFontSize(24)
        ctx.setFillStyle('#606266')
        ctx.setTextAlign('left')
        const txt1width = ctx.measureText(txt1).width
        const text1Left = (w - txt1width) * 0.5
        this.wordsWrap(ctx, txt1, txt1width, txt1width + 100, text1Left, h * (426 / 480), 40)

        // 画出进入小程序看更多动态
        ctx.setFontSize(24)
        ctx.setFillStyle('#606266')
        ctx.setTextAlign('left')
        const txt2width = ctx.measureText(txt2).width
        const text2Left = (w - txt2width) * 0.5
        this.wordsWrap(ctx, txt2, txt2width, txt2width + 100, text2Left, h * (440 / 480), 40)

        // 画出产品图像
        ctx.drawImage(
          this.productImg,
          (width / 750) * 30,
          (width / 750) * 30,
          (width / 750) * (w - 60),
          ((width / 750) * (w - 60)) / (251 / 109)
        )
        ctx.draw(true)

        // ctx.rect(410, 510 * heightPercent, 280, 289)
        // ctx.setFillStyle('#ffffff')
        // ctx.fill()
        ctx.drawImage(
          this.qrcode,
          (width / 750) * w * (78 / 270),
          (width / 750) * h * (293 / 480),
          (width / 750) * w * (114 / 270),
          (width / 750) * w * (117 / 270)
        )

        ctx.draw(true)
        // let _this = this
        this.timer = setTimeout(() => {
          wx.canvasToTempFilePath(
            {
              x: 0,
              y: 0,
              width: 1080,
              height: 1920,
              destWidth: 1080,
              destHeight: 1920,
              canvasId: 'myQrcode',
              fileType: 'jpg',
              success(res) {
                wx.hideLoading()
                _this.moveFlag = 0
                _this.shareImg = res.tempFilePath
                _this.shareImgFlag = 1
                // _this.$apply()
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
    wordsWrap(ctx, name, nameWidth, maxWidth, startX, srartY, wordsHight) {
      let lineWidth = 0
      let lastSubStrIndex = 0
      for (let i = 0; i < name.length; i++) {
        lineWidth += ctx.measureText(name[i]).width
        if (lineWidth > maxWidth) {
          ctx.setFontSize(32)
          ctx.fillText(name.substring(lastSubStrIndex, i), startX, srartY)
          srartY += wordsHight
          lineWidth = 0
          lastSubStrIndex = i
        }
        if (i === name.length - 1) {
          ctx.fillText(name.substring(lastSubStrIndex, i + 1), startX, srartY)
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
// @import '../../styles/icon.css';
.share-canvas {
  border: 1px solid #c3c3c3;
  width: 750px;
  height: 1334px;
  position: fixed;
  z-index: -1;
  top: -10000000px;
  opacity: 0;
  pointer-events: none;
}
.share-view {
  position: absolute;
  left: 50%;
  top: 85rpx;
  transform: translate(-50%, 0);
  z-index: 301;
  .share-view-con {
    .share-save-btn {
      width: 520rpx;
      height: 80rpx;
      line-height: 80rpx;
      color: #fff;
      font-size: 30rpx;
      text-align: center;
      margin-top: 10rpx;
    }
  }
  .save-poster {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 540rpx;
    height: 80rpx;
    margin-top: 40rpx;
    border-radius: 40rpx;
  }
}
.btn-openSet {
  display: flex;
  justify-content: space-around;
  font-size: 30rpx;
  margin-top: 60rpx;
}
.share-open-set {
  width: 400rpx;
  height: 220rpx;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  background: #ffffff;
  padding: 30rpx;
  .set-title {
    font-size: 30rpx;
    margin-top: 40rpx;
    text-align: center;
    .btn-openSet > view:nth-child(1) {
      color: #919191;
    }
  }
  .button-style {
    width: 100%;
    height: 100%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 0;
    font-size: 30rpx;
    line-height: 0;
    color: red;
  }
  button::after {
    border: 0;
  }
}
.share-model {
  position: fixed;
  bottom: 0;
  left: 0;
  text-align: center;
  background: #fff;
  width: 100%;
  z-index: 300;
  transform: translateY(100%);
  .share-model-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    padding: 40rpx 0 12rpx;
    position: relative;
    .icon {
      line-height: 128rpx;
      font-size: 128rpx;
    }
    .icon-weixin {
      color: #46bb36;
    }
    .icon-save {
      color: #3e94dd;
    }
    .shareBtn {
      line-height: 1;
      background: #fff;
    }
  }
  .share-model-btn {
    background-color: #fff;
    color: #333;
    font-size: 30rpx;
    line-height: 16px;
    padding: 30rpx 0 0;
    &:nth-child(1) {
      border-bottom: 1px solid #eee;
    }
  }
  .share-model-br {
    height: 20rpx;
    background-color: #f2f2f2;
  }
  .share-model-close {
    height: 100rpx;
    line-height: 100rpx;
    font-size: 32rpx;
    color: #333;
  }
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
}

.share-move-up {
  animation-timing-function: ease-in-out;
  animation-name: skuMoveUp;
  animation-fill-mode: forwards;
  animation-duration: 0.3s;
  pointer-events: auto;
  opacity: 1;
  display: flex;
  align-items: center;
}
.share-move-down {
  animation-timing-function: ease-in-out;
  animation-name: skuMoveDown;
  animation-fill-mode: forwards;
  animation-duration: 0.2s;
  pointer-events: none;
}

@keyframes skuMoveUp {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}
@keyframes skuMoveDown {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  90% {
    transform: translateY(90%);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}
@keyframes skuMaskHide {
  0%,
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    pointer-events: none;
  }
}
</style>
