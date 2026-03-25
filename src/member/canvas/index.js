/*
 * @Descripttion: 新增生成海报canvas
 * @version: 1.0.0
 * @Author: waiter-yu
 * @Date: 2021-12-21 11:41:22
 * @Email: 18720528747@163.com
 * @LastEditTime: 2022-01-06 17:06:32
 */
import { downLoadImg } from '../../utils/function'
import { apiGetCardHaiBaoSettingInfo, apiGetMiniCode } from '../../api/member.js'
import { staticURL } from '@/config'
export const createPoster = {
  data() {
    return {
      config: {
        code: '',
        bgImg: '',
        UserHeadPath: ''
      },
      shareQuery: '',
      http: {
        code: '',
        bgImg: '',
        UserHeadPath: ''
      },
      deploy: {},
      shareImg: staticURL(true) + 'apply/apply-share.png'
    }
  },
  methods: {
    async hanldGetData() {
      this.$loading.show()
      let poster = await apiGetCardHaiBaoSettingInfo()

      if (this.$ck(poster, true)) {
        if (poster.return_data.backgroundmap.indexOf('https://') === -1) {
          poster.return_data.backgroundmap = 'https:' + poster.return_data.backgroundmap
        }
        this.config.bgImg = poster.return_data.backgroundmap
        this.config.UserHeadPath = poster.return_data.headpath
        this.deploy = poster.return_data
      }

      // let codeData = await apiGetMiniCode({ url: 'pages/index/index' })
      let codeData = await apiGetMiniCode({ url: 'packages/src/member/card' })
      this.$loading.hide()
      if (this.$ck(codeData, true)) {
        this.shareQuery = `apply=${codeData.return_data.inviterkey}`
        if (codeData.return_data.qrcodepath.indexOf('https://') === -1) {
          codeData.return_data.qrcodepath = 'https:' + codeData.return_data.qrcodepath
        }
        this.config.code = codeData.return_data.qrcodepath
        this.Invite()
      } else {
        this.$msg('获取小程序码失败')
      }
    },
    async Invite() {
      uni.showLoading({
        title: '正在生成图片',
        mask: true
      })
      // 图片下载
      let httpPhoto = ''

      if (this.config.UserHeadPath && this.deploy.isshowheadimg) {
        httpPhoto = await downLoadImg(this.config.UserHeadPath)
      }
      let httpCode = await downLoadImg(this.config.code)
      let httpBg
      if (this.config.bgImg) {
        httpBg = await downLoadImg(this.config.bgImg)
      } else {
        httpBg = this.shareBg
      }
      this.http.code = httpCode
      this.http.bgImg = httpBg
      this.http.UserHeadPath = httpPhoto
      this.canvasInvite()
    },
    /** 邀请好友生成海报 */
    canvasInvite() {
      return new Promise((resolve, reject) => {
        let ctx = uni.createCanvasContext('myQrcode', this)
        ctx.setFillStyle('white')
        ctx.fillRect(0, 0, 600, 965)
        ctx.stroke() // 不加这句会是下面的arc失效
        // 画出背景
        // ctx.drawImage(this.http.bgImg, 0, 0, 600, 780)
        ctx.drawImage(this.http.bgImg, 0, 0, 540, 960)
        // 是否显示头像
        if (this.deploy.isshowheadimg) {
          // 画出头像标题
          let avatarurl_width = 120 //绘制的头像宽度
          let avatarurl_heigth = 120 //绘制的头像高度
          let avatarurl_x = 220 //绘制的头像在画布上的位置
          let avatarurl_y = 100 //绘制的头像在画布上的位置
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

          ctx.drawImage(this.http.UserHeadPath, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth) // 推进去图片，必须是https图片

          ctx.restore() //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
        }
        // 是否显示文本
        // 画出标题-----------------
        if (this.deploy.isshowtext) {
          ctx.textAlign = 'center'
          this.textPrewrap(ctx, this.deploy.content, 268, 620, 50, 460, 2, '#000', 26)
        }

        // 画出二维码
        ctx.drawImage(this.http.code, 200, 730, 160, 160)
        ctx.draw(true)

        setTimeout(() => {
          let _this = this
          uni.canvasToTempFilePath(
            {
              x: 0,
              y: 0,
              width: 600,
              height: 965,
              destWidth: 600,
              destHeight: 965,
              canvasId: 'myQrcode',
              fileType: 'jpg',
              success(res) {
                uni.hideLoading()
                _this.type = 'Invite'
                _this.$refs.canvasPopup.show(res.tempFilePath)

                // 绘画成功
              },
              fail() {
                uni.showToast({
                  title: '生成失败,',
                  icon: 'none'
                })
              }
            },
            this
          )
        }, 1000)
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
     * color：字体颜色
     * fontSize：字体大小
     */
    textPrewrap(ctx, content, drawX, drawY, lineHeight, lineMaxWidth, lineNum, color = '#000', fontSize = '28') {
      var drawTxt = '' // 当前绘制的内容
      var drawLine = 1 // 第几行开始绘制
      var drawIndex = 0 // 当前绘制内容的索引
      ctx.setFillStyle(color)
      ctx.setFontSize(fontSize)
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
    }
  },
  onShareAppMessage() {
    return {
      title: '邀请您加入成为尊贵会员',
      path: `/packages/src/member/card?${this.shareQuery}`,
      imageUrl: this.shareImg
    }
  }
}
