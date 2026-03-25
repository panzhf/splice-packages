<template>
  <view :style="themeVars">
    <u-mask :show="showDialog" :zoom="false" :custom-style="{ background: 'rgba(0, 0, 0, 0.5)' }" z-index="100">
      <view class="dialog-info" :class="{ showDialog }">
        <view class="iconfont icon-close2 close-icon fw-bold" @tap.stop="showDialog = false" />
        <view class="title">
          添加照片
          <text class="tips">(最多60张图片)</text>
        </view>
        <scroll-view scroll-y="true" style="height: 800rpx">
          <view class="update-box">
            <view v-for="(item, index) in fileList" :key="index" class="item">
              <view v-if="item.loading" class="box add">
                <u-loading mode="circle" size="48" />
              </view>
              <text v-if="item.url" class="close iconfont iconpack-close-guanbi" @click="handRemove(index)" />
              <view v-if="item.url" class="box">
                <image :src="item.url" class="imgs" mode="aspectFit" @click="handlePreview(item.url)" />
              </view>
            </view>
            <view v-if="fileList.length < 60" class="item">
              <!-- <view class="box add" @click.stop="hanleGetphoto()"> -->
              <view class="box add" @click.stop="handleGetImg()">
                <text class="iconfont iconshangchuan" />
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="button-form" @click="handleSubmit">提交</view>
      </view>
    </u-mask>
    <canvas
      id="myQrcode"
      canvas-id="myQrcode"
      class="share-canvas"
      :style="{ height: `${rectHeight}px`, width: `${rectWidth}px` }"
    />
    <u-action-sheet v-model="showActionSheet" :list="list" @click="hanleGetphoto" />
    <location ref="location" @location="setLocation" />
  </view>
</template>

<script>
import { getJsCode } from '@/utils/set-mp'
import { apiCommanageGetlocation } from '@/api/scan-code'
import { apiBanquetOrderPhoto } from 'packages/api/banquet.js'
import Location from 'packages/components/location/index.vue'
import { chooseImg, uploadImg } from '@/utils/upload'
import dialogMixin from 'packages/mixins/dialog'
import { previewMixin } from 'packages/mixins/img'
import { getImageInfo } from 'packages/utils/utils'
import dayjs from 'dayjs'
import zhCn from 'dayjs/locale/zh-cn'

export default {
  components: {
    Location
  },
  mixins: [dialogMixin, previewMixin],
  props: {
    orderid: {
      default: '',
      type: String
    },
    info: {
      default: () => {},
      type: Object
    }
  },
  data() {
    return {
      city: '',
      fileList: [],
      showActionSheet: false,
      list: [
        {
          text: '拍摄'
        }
        // {
        //   text: '从相册选择'
        // }
      ],
      rectHeight: 0, // 画布高度
      rectWidth: 0, // 画布宽度
      httpBgImg: ''
    }
  },
  watch: {
    value(val) {
      if (!val) {
        this.fileList = []
      } else {
        if (this.info.orderpicture && this.info.orderpicture.picturesjson) {
          this.fileList = this.info.orderpicture.picturesjson.map(item => {
            return {
              url: item,
              loading: false
            }
          })
        }
        if (!this.city) {
          this.$refs.location.setLocation()
          // this.getCity()
        }
      }
    }
  },
  methods: {
    setWidthValue(val, width) {
      let baseWidth = 750
      return (val * width) / baseWidth
    },
    setHeightValue(val, height) {
      let baseHeight = 1334
      return (val * height) / baseHeight
    },
    async setLocation(val) {
      const { memberLogin: memberlogin = '' } = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      let params = {
        lng: val.longitude,
        lat: val.latitude
      }
      // 获取详细的地址信息
      let res = await apiCommanageGetlocation({
        memberlogin,
        ...params,
        js_code: await getJsCode()
      })
      if (this.$ck(res, true)) {
        this.city = res.return_data.address
      }
    },
    handleGetImg() {
      this.showActionSheet = true
    },
    handRemove(index) {
      this.fileList.splice(index, 1)
    },
    async setCanvasTask() {
      const res = await chooseImg({
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['camera']
      })
      // const res = await chooseMediaImg({
      //   count: 9 - this.fileList.length,
      //   sourceType: ['camera']
      // })
      let arr = []
      const pushIndex = this.fileList.length
      for (const task of res) {
        this.httpBgImg = task
        const imgInfo = await getImageInfo(task)
        arr.push(await this.setCanvas(imgInfo))
        this.fileList.push({
          url: '',
          loading: true
        })
      }
      Promise.all(arr.map(item => uploadImg(item, false))).then(res => {
        res.map((item, index) => {
          this.fileList[pushIndex + index].url = item.return_data
          this.fileList[pushIndex + index].loading = false
        })
      })
    },
    setCanvas(info) {
      return new Promise(resolve => {
        dayjs.locale(zhCn)
        let day = dayjs().format('YYYY.MM.DD HH:mm dddd')
        let city = this.city
        const bgWidth = info.width
        const bgImgHeight = info.height
        this.rectWidth = bgWidth
        this.rectHeight = bgImgHeight
        setTimeout(() => {
          const ctx = uni.createCanvasContext('myQrcode', this)
          ctx.drawImage(this.httpBgImg, 0, 0, bgWidth, bgImgHeight)
          ctx.draw(true)
          // 画出时间
          ctx.setFontSize(this.setWidthValue(38, bgWidth))
          ctx.font = 'bold'
          ctx.setTextAlign('left')
          ctx.setFillStyle('#fff')
          ctx.fillText(day, this.setWidthValue(38, bgWidth), bgImgHeight - this.setHeightValue(140, bgImgHeight))
          ctx.draw(true)
          // 画出日期
          // 画出地址
          ctx.setFontSize(this.setWidthValue(26, bgWidth))
          ctx.setTextAlign('left')
          ctx.setFillStyle('#fff')
          ctx.fillText(city, this.setWidthValue(45, bgWidth), bgImgHeight - this.setHeightValue(58, bgImgHeight))
          ctx.save()
          ctx.draw(true)
          ctx.save()
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
                canvasId: 'myQrcode',
                fileType: 'jpg',
                success(res) {
                  resolve(res.tempFilePath)
                },
                fail(err) {
                  uni.showToast({
                    title: '生成失败,' + err,
                    icon: 'none'
                  })
                }
              },
              this
            )
          }, 300)
        }, 300)
      })
    },
    async hanleGetphoto(index) {
      this.showActionSheet = false
      // 新增水印
      if (this.info.isopenphotowatermark && index === 0) {
        return this.setCanvasTask()
      }

      let lastCount = 60 - this.fileList.length

      const pathArr = await chooseImg({
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: index === 0 ? ['camera'] : ['album'],
        count: lastCount > 9 ? 9 : lastCount
      })

      const pushIndex = this.fileList.length
      pathArr.map(() => {
        this.fileList.push({
          url: '',
          loading: true
        })
      })

      if (pathArr?.length) {
        Promise.all(pathArr.map(item => uploadImg(item, false))).then(res => {
          if (res.every(item => this.$ck(item))) {
            res.forEach((item, index) => {
              this.fileList[pushIndex + index].url = item.return_data
              this.fileList[pushIndex + index].loading = false
            })
          }
        })
      }
    },
    async handleSubmit() {
      let files = this.fileList
        .map(val => {
          return val.url
        })
        .filter(item => item)
      if (!files.length) {
        return this.$msg('请选择照片')
      }
      apiBanquetOrderPhoto({
        orderid: this.orderid,
        pictures: files
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('上传成功')
          setTimeout(() => {
            this.showDialog = false
            this.$emit('success')
          }, 1500)
        }
      })
    },
    async handleSubscribeMessage() {
      const res = await this.requestSubscribeMsg([this.noticeTempId])
      if (res && res[this.noticeTempId] === 'accept') {
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-info {
  background: #fff;
  position: relative;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  border-radius: 30rpx 30rpx 0 0;
  height: 0;
  -webkit-transition: all 0.2s ease-in;
  transition: all 0.2s ease-in;
  &.showDialog {
    height: auto;
  }
  .logo {
    position: absolute;
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    overflow: hidden;
    top: -38rpx;
    left: 50%;
    transform: translate(-50%, 0);
    border: 1rpx solid #fff;
  }
  .close-icon {
    position: absolute;
    top: -85rpx;
    right: 30rpx;
    color: #fff;
    font-size: 50rpx;
    z-index: 9;
  }
  .title {
    margin-top: 40rpx;
    padding-left: 30rpx;
    font-size: 32rpx;
    font-weight: bold;
    .tips {
      margin-top: 16rpx;
      text-align: center;
      font-size: 24rpx;
      font-family: PingFang SC;
      color: #aaaaaa;
      font-weight: 400;
    }
  }
  .update-box {
    margin-top: 30rpx;
    padding: 0 30rpx;
    display: grid;
    grid-template-columns: 224rpx 224rpx 224rpx;
    grid-gap: 14rpx 10rpx;
    .item {
      width: 224rpx;
      height: 224rpx;
      background: #ffffff;

      position: relative;
      .iconshangchuan {
        font-size: 54rpx;
        color: #ccc;
      }
      .add {
        background-color: #f3f3f3;
      }
      .box {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .imgs {
          width: 100%;
          height: 100%;
        }
      }
      .close {
        position: absolute;
        right: 0rpx;
        top: 0rpx;
        color: red;
        z-index: 9;
        font-size: 56rpx;
      }
      .img {
        width: 202rpx;
        height: 350rpx;
      }
    }
  }

  .button-form {
    width: 650rpx;
    height: 90rpx;
    background: var(--theme-color, $uni-bg-color-primary);
    border: 2rpx solid #dbf4ff;
    border-radius: 45rpx;
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
    text-align: center;
    line-height: 90rpx;
    margin: 0 auto;
    margin-top: 38rpx;
    margin-bottom: 50rpx;
    margin-bottom: constant(50rpx + safe-area-inset-bottom);
    margin-bottom: env(50rpx + safe-area-inset-bottom);
  }
}
.share-canvas {
  position: fixed;
  z-index: -1;
  left: -99999px;
  width: 620px;
  border: 1px solid #c3c3c3;
  opacity: 0;
  pointer-events: none;
}
</style>
