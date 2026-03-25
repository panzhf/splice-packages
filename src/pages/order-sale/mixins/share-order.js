import { staticURL } from '@/config'
import { activeColor } from 'packages/utils/default-picture'
import { downLoadImg } from 'packages/utils/utils'
import { apiStoreSalesGiftForwardToGroup } from 'packages/api/StoreSalesGift'

export default {
  data() {
    return {
      showSharePopup: false,
      shareShowImgSrc: '',
      shareBgSrc: staticURL(true) + 'order-sale/share.png',
      activeColor
    }
  },
  computed: {
    calcActiveColor() {
      let color = this.activeColor
      // #ifdef MP-RETAIL
      color = this.themeInfo.color
      // #endif
      return color
    },
    storeInfo() {
      return JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    },
    m() {
      return this.storeInfo.memberLogin
    },
    // 计算画布宽度 - 与makeShareImg方法保持一致
    canvasWidth() {
      const scale = 2
      return 620 * scale + 'px' // 1240px
    },
    // 计算画布高度 - 与makeShareImg方法保持一致
    canvasHeight() {
      if (!this.orderInfo || !this.orderInfo.orderdetails) {
        return '600px' // 2倍分辨率的最小高度
      }

      const products = this.orderInfo.orderdetails || []
      const actualProducts = products.length // 显示所有产品

      // 使用与makeShareImg方法相同的计算逻辑
      const scale = 2
      const cardPadding = 30 * scale // 卡片内边距
      const bgImageHeight = 196 * scale // 底层背景图片高度
      const orderInfoHeight = 100 * scale // 订单信息区域高度
      const orderInfoMargin = 15 * scale // 订单信息底部边距
      const listTitleHeight = 40 * scale // 售出商品标题高度
      const listTitleMargin = 20 * scale // 标题底部边距
      const listPadding = 20 * scale // 产品列表内边距
      const productHeight = 150 * scale // 每个产品的高度

      // 动态计算画布高度 - 不包含背景图片高度
      let canvasHeight = cardPadding // 顶部内边距
      canvasHeight += orderInfoHeight + orderInfoMargin // 订单信息区域

      // 售出商品区域高度（包含标题和产品列表，不包含底部高度）
      canvasHeight += listTitleHeight + listTitleMargin + listPadding // 标题区域
      if (actualProducts > 0) {
        canvasHeight += actualProducts * productHeight // 产品列表高度
      } else {
        canvasHeight += productHeight // 至少保留一个产品的高度空间
      }

      canvasHeight += cardPadding // 底部内边距

      // 确保画布高度有合理的最小值
      const minHeight = 250 * scale
      canvasHeight = Math.max(canvasHeight, minHeight)

      return canvasHeight + 'px'
    }
  },
  onShareAppMessage(e) {
    if (e.from === 'button') {
      return {
        title: '快来查看我的售出喜报吧~',
        path: `/packages/src/pages/order-sale/sales-report?orderno=${this.orderInfo.orderno}&memberlogin=${this.m}`,
        imageUrl: this.shareShowImgSrc
      }
    }
  },
  methods: {
    handleGetShareAward() {
      apiStoreSalesGiftForwardToGroup({
        OrderNo: this.orderNo
      })
        .then(res => {
          if (this.$ck(res)) {
            this.$msg('转发成功')
            // 重新获取订单详情
            this.getOrderDetail()
          }
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    },
    // 生成分享图片
    async makeShareImg(orderInfo) {
      const shareBgSrc = await downLoadImg(this.shareBgSrc)
      const products = orderInfo.orderdetails || []
      // 预下载产品图片
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        let imageUrl = product.goodspicurl
        if (imageUrl) {
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl
          }
          product.goodspicurl = await downLoadImg(imageUrl)
        }
      }
      try {
        // 创建画布
        let ctx = uni.createCanvasContext('shareCanvas', this)

        // 设置2倍分辨率以提高清晰度
        const scale = 2
        const canvasWidth = 620 * scale

        // 计算动态高度

        const actualProducts = products.length // 显示所有产品

        // 计算画布高度：根据内容动态计算
        const cardPadding = 30 * scale // 卡片内边距 30rpx
        const bgImageHeight = 196 * scale // 底层背景图片高度 196
        const orderInfoHeight = 100 * scale // 订单信息区域高度（3行信息）
        const orderInfoMargin = 15 * scale // 订单信息底部边距
        const listTitleHeight = 40 * scale // 售出商品标题高度
        const listTitleMargin = 20 * scale // 标题底部边距
        const listPadding = 20 * scale // 产品列表内边距
        const productHeight = 150 * scale // 每个产品的高度（包含20px间距）

        // 动态计算画布高度 - 与canvasHeight计算属性保持一致，不包含背景图片高度
        let canvasHeight = cardPadding // 顶部内边距

        // 添加订单信息区域高度
        canvasHeight += orderInfoHeight + orderInfoMargin

        // 售出商品区域高度（包含标题和产品列表，不包含底部高度）
        canvasHeight += listTitleHeight + listTitleMargin + listPadding // 标题区域
        if (actualProducts > 0) {
          canvasHeight += actualProducts * productHeight // 产品列表高度
        } else {
          canvasHeight += productHeight // 至少保留一个产品的高度空间
        }

        // 添加底部内边距
        canvasHeight += cardPadding

        // 确保画布高度有合理的最小值，避免过小
        const minHeight = 250 * scale
        canvasHeight = Math.max(canvasHeight, minHeight)

        // 绘制白色背景（最底层）
        ctx.setFillStyle('#ffffff')
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        // 绘制底层背景图片（在所有元素的底层）
        try {
          ctx.drawImage(shareBgSrc, 0, 0, canvasWidth, bgImageHeight)
        } catch (error) {
          console.warn('底层背景图片加载失败:', error)
        }

        // 绘制订单信息区域
        let currentY = cardPadding

        // 门店名称
        ctx.setFontSize(28 * scale)
        ctx.setTextAlign('left')
        ctx.setFillStyle('#333')
        ctx.fillText('门店名称:', cardPadding, currentY + 20 * scale)
        ctx.fillText(orderInfo.storename || '', cardPadding + 140 * scale, currentY + 20 * scale)

        // 预计收入
        currentY += 40 * scale
        ctx.setFillStyle('#333')
        ctx.fillText('预计收入:', cardPadding, currentY + 20 * scale)
        ctx.fillText((orderInfo.totalamount || '0') + '元', cardPadding + 140 * scale, currentY + 20 * scale)

        // 提交时间
        currentY += 40 * scale
        ctx.setFillStyle('#333')
        ctx.fillText('提交时间:', cardPadding, currentY + 20 * scale)
        ctx.fillText(orderInfo.addtime || '', cardPadding + 140 * scale, currentY + 20 * scale)

        // 售出商品区域
        currentY += orderInfoMargin + listTitleHeight + listTitleMargin

        // 售出商品区域位置计算
        const listBgY = bgImageHeight + cardPadding - 60 * scale
        const listBgHeight =
          listTitleHeight + listTitleMargin + (actualProducts > 0 ? actualProducts * productHeight : productHeight)
        ctx.setFillStyle('#F5F5F5')
        ctx.fillRect(listPadding, listBgY, canvasWidth - listPadding * 2, listBgHeight)

        // 绘制售出商品标题
        ctx.setFontSize(28 * scale)
        ctx.setFillStyle('#333')
        ctx.fillText('售出商品', listPadding + 20 * scale, listBgY + listTitleHeight + 5 * scale)

        // 绘制产品列表
        let yPosition = listBgY + listTitleHeight + listTitleMargin + listPadding - 5 * scale

        products.forEach((product, index) => {
          // 显示所有产品

          // 绘制产品图片（如果有的话）
          if (product.goodspicurl) {
            try {
              ctx.save()
              ctx.beginPath()
              // 绘制圆角矩形路径
              const x = listPadding + 20 * scale
              const y = yPosition + 5 * scale
              const width = 100 * scale
              const height = 100 * scale
              const radius = 8 * scale

              ctx.moveTo(x + radius, y)
              ctx.lineTo(x + width - radius, y)
              ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
              ctx.lineTo(x + width, y + height - radius)
              ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
              ctx.lineTo(x + radius, y + height)
              ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
              ctx.lineTo(x, y + radius)
              ctx.quadraticCurveTo(x, y, x + radius, y)
              ctx.closePath()
              ctx.clip()

              // 先填充白色背景
              ctx.setFillStyle('#ffffff')
              ctx.fillRect(x, y, width, height)

              // 获取图片信息以计算等比例缩放
              uni.getImageInfo({
                src: product.goodspicurl,
                success: imgRes => {
                  const imgWidth = imgRes.width
                  const imgHeight = imgRes.height

                  // 计算等比例缩放
                  const scaleX = width / imgWidth
                  const scaleY = height / imgHeight
                  const scale = Math.min(scaleX, scaleY)

                  // 计算缩放后的尺寸
                  const scaledWidth = imgWidth * scale
                  const scaledHeight = imgHeight * scale

                  // 计算居中位置
                  const centerX = x + (width - scaledWidth) / 2
                  const centerY = y + (height - scaledHeight) / 2

                  // 绘制等比例缩放的图片
                  ctx.drawImage(product.goodspicurl, centerX, centerY, scaledWidth, scaledHeight)
                  ctx.draw(true)
                },
                fail: () => {
                  console.log('获取失败')
                  // 如果获取图片信息失败，使用默认绘制方式
                  ctx.drawImage(product.goodspicurl, x, y, width, height)
                  ctx.draw(true)
                }
              })
              ctx.restore()
            } catch (error) {
              console.warn('产品图片加载失败:', error)
              // 如果产品图片加载失败，只绘制白色背景
              ctx.save()
              ctx.setFillStyle('#ffffff')
              ctx.beginPath()
              const x = listPadding + 20 * scale
              const y = yPosition + 5 * scale
              const width = 100 * scale
              const height = 100 * scale
              const radius = 8 * scale

              ctx.moveTo(x + radius, y)
              ctx.lineTo(x + width - radius, y)
              ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
              ctx.lineTo(x + width, y + height - radius)
              ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
              ctx.lineTo(x + radius, y + height)
              ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
              ctx.lineTo(x, y + radius)
              ctx.quadraticCurveTo(x, y, x + radius, y)
              ctx.closePath()
              ctx.fill()
              ctx.restore()
            }
          } else {
            // 绘制产品图片占位符（圆角矩形）
            ctx.save()
            ctx.setFillStyle('#ffffff')
            ctx.beginPath()
            const x = listPadding + 20 * scale
            const y = yPosition + 5 * scale
            const width = 100 * scale
            const height = 100 * scale
            const radius = 8 * scale

            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + width - radius, y)
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
            ctx.lineTo(x + width, y + height - radius)
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
            ctx.lineTo(x + radius, y + height)
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
            ctx.lineTo(x, y + radius)
            ctx.quadraticCurveTo(x, y, x + radius, y)
            ctx.closePath()
            ctx.fill()
            ctx.restore()
          }

          // 绘制产品名称和规格
          ctx.setFontSize(28 * scale)
          ctx.setFillStyle('#333')
          const productName = product.goodsname + ''
          const specText = product.goodsformatname ? ' - ' + product.goodsformatname : ''
          const fullText = productName + specText

          // 计算可用宽度（从产品名称开始位置到数量显示位置）
          const textStartX = listPadding + 140 * scale
          const textEndX = canvasWidth - listPadding - 20 * scale - 60 * scale // 减去数量显示区域
          const availableWidth = textEndX - textStartX

          // 测量文本宽度并处理省略号
          let displayText = fullText
          let textWidth = ctx.measureText(displayText).width

          // 如果文本宽度超过可用宽度，逐字符减少直到合适
          while (textWidth > availableWidth && displayText.length > 0) {
            displayText = displayText.substring(0, displayText.length - 1)
            textWidth = ctx.measureText(displayText + '...').width
          }

          // 如果文本被截断，添加省略号
          if (displayText.length < fullText.length) {
            displayText += '...'
          }

          ctx.fillText(displayText, textStartX, yPosition + 30 * scale)

          // 绘制奖励红包
          ctx.setFontSize(22 * scale)
          ctx.setFillStyle('#666666')
          ctx.fillText('奖励红包:', listPadding + 140 * scale, yPosition + 80 * scale)
          ctx.setFillStyle(this.calcActiveColor) // 使用主题色，与Vue组件保持一致
          ctx.fillText((product.unitreward || '0') + '元', listPadding + 240 * scale, yPosition + 80 * scale)

          // 绘制数量（右对齐）
          ctx.setFontSize(24 * scale)
          ctx.setFillStyle('#666')
          ctx.setTextAlign('right')
          ctx.fillText('x' + (product.quantity || '0'), canvasWidth - listPadding - 20 * scale, yPosition + 80 * scale)
          ctx.setTextAlign('left')

          // 绘制产品项之间的分隔线（每个产品底部都有）
          ctx.save()
          ctx.setStrokeStyle('#ccc')
          ctx.setLineWidth(1 * scale)
          ctx.beginPath()
          ctx.moveTo(listPadding + 20 * scale, yPosition + 132 * scale)
          ctx.lineTo(canvasWidth - listPadding - 20 * scale, yPosition + 132 * scale)
          ctx.stroke()
          ctx.restore()

          yPosition += 150 * scale // 每个商品元素之间有40像素间距
        })

        ctx.draw(true)

        // 生成图片
        setTimeout(() => {
          uni.canvasToTempFilePath(
            {
              x: 0,
              y: 0,
              width: canvasWidth,
              height: canvasHeight,
              destWidth: canvasWidth,
              destHeight: canvasHeight,
              canvasId: 'shareCanvas',
              fileType: 'jpg',
              success: res => {
                this.shareShowImgSrc = res.tempFilePath
                this.showSharePopup = true
              },
              fail: err => {
                uni.showToast({
                  title: '生成分享图片失败',
                  icon: 'none'
                })
                console.error('生成分享图片失败:', err)
              }
            },
            this
          )
        }, 300)
      } catch (error) {
        console.error('生成分享图片出错:', error)
        uni.showToast({
          title: '生成分享图片失败',
          icon: 'none'
        })
      }
    },

    // 显示分享弹窗
    handleShowShare() {
      if (this.orderInfo && Object.keys(this.orderInfo).length > 0) {
        this.makeShareImg(this.orderInfo)
      } else {
        uni.showToast({
          title: '订单信息加载中，请稍后再试',
          icon: 'none'
        })
      }
    }
  }
}
