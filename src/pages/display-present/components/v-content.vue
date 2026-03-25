<template>
  <view class="content">
    <view class="btn-box flex flex-end">
      <view class="btn" @tap="handleRecord()">
        查看上传记录
        <text class="iconfont iconjiantou1" />
      </view>
    </view>
    <!-- 进行中并且不是已获得了奖励 -->
    <template v-if="(state === 0 && steps !== 3) || state === 1">
      <view :class="updateImg ? 'upload-box-wrap' : 'upload-exapmle-wrap'">
        <view v-if="!updateImg" class="example-image">
          <view class="example-tips">示例图</view>
          <image :src="info.activityinfo.contentjson.sampleimage" mode="aspectFit" @tap="handleLookImg" />
        </view>
        <view class="upload-box flex flex-center flex-middle" @tap="handlePhoto()">
          <template v-if="updateImg && state === 0">
            <image :src="updateImg" mode="aspectFit" class="cover" />
            <!-- <view v-if="steps !== 2" class="iconfont iconpack-close-guanbi" @tap.stop="handleRemove" /> -->
            <view v-if="steps !== 2" class="remove-btn flex flex-center flex-middle fs-24" @tap.stop="handleRemove">
              <view class="iconfont iconpack-xiangji" />
              <view class="ml-10">更换照片</view>
            </view>
          </template>
          <view v-else class="flex flex-center flex-middle flex-column">
            <view class="iconfont iconpack-xiangji icon" />
            <view class="text">{{ state === 1 || activityStatus === 1 ? '活动未开始' : '点 击 拍 照' }}</view>
          </view>
          <view v-if="steps === 2" class="mask flex flex-center flex-middle">
            <view class="iconfont iconpack-shenhezhong" />
          </view>
        </view>
      </view>
      <view class="tips fs-28">
        <template v-if="steps === 2">
          预计24小时内完成审核，审核通过后，红包将直接发放至当前登录的微信钱包中；返货券奖励将发放至门店负责人账户中。
        </template>
        <view v-else :class="{ 'tx-r': !info.activityinfo.contentjson.showtip }">
          <text v-if="info.activityinfo.contentjson.showtip">
            {{ info.activityinfo.contentjson.tipcontent || '请按规范拍摄照片，否则无法通过审核。' }}
          </text>
          <text class="btn" @tap="handleLookImg">查看示例</text>
        </view>
      </view>
      <view v-if="steps === 1" class="handle-box">
        <button class="btn fsz-32 fw-bold" :disabled="state === 1 || !updateImg" @tap="handleSave">
          <!-- 先判断活动状态，再判断期数状态 -->
          <template v-if="activityStatus === 0">
            {{ state === 1 ? '未开始' : '立即上传' }}
          </template>
          <template v-else>
            {{ filterActivityState(activityStatus) }}
          </template>
        </button>
      </view>
    </template>
    <template v-if="steps !== 2 && steps !== 1">
      <view v-if="info.awardrecord && info.awardrecord.id > 0" class="award-box">
        <view class="title fw-bold">恭喜获得奖励</view>
        <!-- 红包发放 -->
        <template v-if="info.awardrecord.hbid">
          <view :style="{ backgroundImage: `url(${hbBg} )` }" class="prize-item c-f tx-c" @tap="handleWithdraw">
            <view>
              <text class="fs-36">￥</text>
              <text class="fs-56 fw-bold">{{ info.awardrecord.hbmoney }}</text>
              <text class="fs-26">（微信红包）</text>
              <text v-if="showWithdraw" class="withdraw-btn ml-20 fs-22">
                去提现
                <text class="iconfont icon-more fs-20" />
              </text>
            </view>
            <view class="tips">{{ filtersHbState(info.awardrecord.hbsendresult, info.awardrecord.hbtype) }}</view>
          </view>
          <view class="fs-24 c-3 tx-c">奖励将发放至参与并审核通过的门店负责人/店员账户中</view>
        </template>
        <!-- 返货券发放 -->
        <template v-if="info.awardrecord.shouvouid">
          <view :style="{ backgroundImage: `url(${kqBg})` }" class="c-f tx-c flex voucher-item" @tap="handleWithdraw">
            <image :src="info.awardrecord.shouvouimageurl" mode="scaleToFill" class="card-img" />
            <view class="right">
              <view class="fs-28 voucher-title tx-l">
                {{ info.awardrecord.shouvouname }}
              </view>
              <view class="num">x{{ info.awardrecord.shouvouamount }}</view>
            </view>
          </view>
          <view class="fs-24 c-3 tx-c">返货券将发放至门店负责人账户中</view>
        </template>
      </view>
      <view v-else>
        <none-data
          :icon="noneIcon"
          :msg="defaultText"
          icon-width="256"
          icon-height="190"
          custom-style="padding: 200rpx 0"
          :use-icon="true"
        />
      </view>
    </template>
    <canvas
      id="myQrcode"
      canvas-id="myQrcode"
      class="share-canvas"
      :style="{ height: `${rectHeight}px`, width: `${rectWidth}px` }"
    />
    <location ref="location" @location="setLocation" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiCommanageGetlocation } from '@/api/scan-code'
import { chooseImg, uploadImg } from '@/utils/upload'
import { getJsCode } from '@/utils/set-mp'
import Location from 'packages/components/location/index.vue'
import subscribeMsg from 'packages/mixins/subscribe-msg'
import filtersMixin from '../mixins'
import { previewImage } from 'packages/utils'
import { getImageInfo } from 'packages/utils/utils'
import dayjs from 'dayjs'
import zhCn from 'dayjs/locale/zh-cn'

export default {
  components: {
    Location
  },
  mixins: [subscribeMsg, filtersMixin],
  props: {
    activityId: {
      type: [String, Number],
      default: 0
    },
    steps: {
      type: Number,
      default: 0
    },
    state: {
      // 本期状态
      type: Number,
      default: 0 // 0：进行中，1：未开始，2：已结束
    },
    activityStatus: {
      // 活动状态
      type: Number,
      default: 0 // 0：进行中，1：未开始，2：已结束，3：已禁用,4：已删除
    },
    info: {
      type: Object,
      default: () => {}
    },
    templateId: {
      type: Array,
      default: () => []
    },
    subscribeSettings: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      defaultText: '任务未完成，无法领取本期奖励。',
      noneIcon: staticURL() + 'shop/default-2.png',
      hbBg: staticURL(true) + 'bg/hb.png',
      kqBg: staticURL() + 'coupon/gw.png',
      updateImg: '',
      latitude: 0,
      longitude: 0,
      rectHeight: 0, // 画布高度
      rectWidth: 0, // 画布宽度
      httpBgImg: '', // 画布背景图片
      city: '',
      address: '' // 回传地址，省市区拼接
    }
  },
  computed: {
    showWithdraw() {
      return this.info.awardrecord.hbtype === 1 && [1, 2].includes(this.info.awardrecord.hbsendresult)
    }
  },
  watch: {
    steps: {
      immediate: true,
      deep: true,
      handler(val) {
        this.updateImg = val === 2 ? this.info.joinrecord.layoutimageurl : ''
      }
    }
  },
  methods: {
    async setLocation(val) {
      this.longitude = val.longitude
      this.latitude = val.latitude
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
        const { provincename = '', cityname = '', areaname, address } = res.return_data
        this.address = `${provincename},${cityname},${areaname}`
        this.city = `${provincename}${cityname}${address}`
      }
      this.handlePhoto()
    },
    async handleSave() {
      let subscriberesult = {}
      if (this.subscribeSettings.isopenaudit || this.subscribeSettings.isopenstart) {
        // 未订阅先订阅弹窗
        subscriberesult = await this.requestSubscribeMsg(this.templateId)
      }
      let res = await uploadImg(this.updateImg)
      this.$loading.hide()
      if (this.$ck(res)) {
        this.$emit('submit', {
          data: res.return_data,
          lanandlat: this.info.activityinfo.isenabledstorerangelimit ? `${this.latitude},${this.longitude}` : '',
          address: this.address,
          subscriberesult
        })
      }
    },
    async handlePhoto() {
      if (this.state !== 0) return
      if (
        (this.info?.activityinfo?.isenabledstorerangelimit ||
          this.info?.activityinfo?.strategyjson?.isopenphotowatermark) &&
        !this.latitude
      ) {
        return this.$refs.location.setLocation()
      }
      if (this.updateImg || this.state === 1 || this.activityStatus !== 0) return
      const paths = await chooseImg({
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['camera']
      })
      if (paths?.length) {
        // 判断是否需要添加水印
        if (this.info?.activityinfo?.strategyjson?.isopenphotowatermark) {
          this.httpBgImg = paths[0]
          const imgInfo = await getImageInfo(paths[0])
          this.updateImg = await this.setCanvas(imgInfo)
        } else {
          this.updateImg = paths[0]
        }
      }
    },
    setCanvas(info) {
      return new Promise(resolve => {
        dayjs.locale(zhCn)
        let day = dayjs().format('YYYY.MM.DD HH:mm dddd')

        // 计算画布尺寸
        const canvasWidth = 700
        const minHeight = 400 // 最小高度，确保水印区域足够
        const aspectRatio = info.width / info.height
        let canvasHeight = canvasWidth / aspectRatio

        // 确保最小高度
        if (canvasHeight < minHeight) {
          canvasHeight = minHeight
        }

        this.rectWidth = canvasWidth
        this.rectHeight = canvasHeight

        setTimeout(() => {
          const ctx = uni.createCanvasContext('myQrcode', this)

          // 水印配置
          const fontSize = 38
          const lineHeight = fontSize * 1.2
          const padding = 20
          const textX = padding
          const maxLines = 2
          const maxWidth = canvasWidth - padding * 2

          // 计算水印区域高度（预留3行文字空间 + 底部padding）
          const watermarkAreaHeight = lineHeight * 3 + padding * 2
          const watermarkStartY = canvasHeight - watermarkAreaHeight

          // 绘制背景图片
          ctx.drawImage(this.httpBgImg, 0, 0, canvasWidth, canvasHeight)

          // 绘制时间
          ctx.setFontSize(fontSize)
          // ctx.font = 'bold'
          ctx.setTextAlign('left')
          ctx.setFillStyle('#fff')
          const timeY = watermarkStartY + lineHeight
          ctx.fillText(day, textX, timeY)

          // 绘制地址（支持多行和省略号）
          if (this.city) {
            const addressY = timeY + lineHeight + 10 // 时间与地址间距10px
            this.drawMultiLineText(ctx, this.city, textX, addressY, maxWidth, fontSize, lineHeight, maxLines)
          }

          // 最后统一绘制
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

    // 计算文字分行
    calcTxtLine(ctx, txt, maxWidth, fontSize) {
      // 先设置字体大小和样式，确保measureText测量准确
      ctx.setFontSize(fontSize)
      ctx.font = `${fontSize}px sans-serif` // 使用完整的字体描述符
      ctx.setTextAlign('left')
      ctx.setFillStyle('#fff')

      // 在uni-app中，可能需要先绘制一次来激活字体设置
      // 绘制一个不可见的字符来激活字体
      ctx.fillText('', -1000, -1000)

      // 正确分割中文字符
      const chr = Array.from(txt)
      let temp = ''
      let row = []

      // 测试单个字符的宽度
      const testChar = '中'
      const testCharWidth = ctx.measureText(testChar).width

      // 如果测量宽度异常小，使用估算方法
      let charWidth = testCharWidth
      if (testCharWidth < fontSize * 0.5) {
        // 测量宽度异常，使用字体大小估算（中文字符通常接近字体大小）
        charWidth = fontSize
      }

      for (let a = 0; a < chr.length; a++) {
        const testLine = temp + chr[a]
        let currentWidth = ctx.measureText(temp).width
        let testWidth = ctx.measureText(testLine).width

        // 如果测量宽度异常，使用估算方法
        if (charWidth === fontSize) {
          currentWidth = temp.length * charWidth
          testWidth = testLine.length * charWidth
        }

        if (currentWidth < maxWidth && testWidth <= maxWidth) {
          temp += chr[a]
        } else {
          if (temp) {
            row.push(temp)
          }
          temp = chr[a]
        }
      }

      if (temp) {
        row.push(temp)
      }

      return { row }
    },

    // 绘制多行文字方法
    drawMultiLineText(ctx, text, x, y, maxWidth, fontSize, lineHeight, maxLines) {
      ctx.setFontSize(fontSize)
      ctx.setTextAlign('left')
      ctx.setFillStyle('#fff')

      // 计算分行（传入字体大小）
      const { row } = this.calcTxtLine(ctx, text, maxWidth, fontSize)

      // 限制最大行数
      const displayRows = row.slice(0, maxLines)

      // 如果超过最大行数，在最后一行添加省略号
      if (row.length > maxLines) {
        const lastRow = displayRows[displayRows.length - 1]
        const ellipsis = '...'

        // 逐步减少文字直到能放下省略号
        let truncatedRow = lastRow
        while (ctx.measureText(truncatedRow + ellipsis).width > maxWidth && truncatedRow.length > 0) {
          truncatedRow = truncatedRow.slice(0, -1)
        }

        displayRows[displayRows.length - 1] = truncatedRow + ellipsis
      }

      // 逐行绘制
      displayRows.forEach((lineText, index) => {
        ctx.fillText(lineText, x, y + index * lineHeight)
      })
    },
    handleRecord() {
      uni.navigateTo({ url: `/packages/src/pages/display-present/record?id=${this.activityId}` })
    },
    handleLookImg() {
      let { sampleimage } = this.info.activityinfo.contentjson
      previewImage({
        current: sampleimage
      })
    },
    handleWithdraw() {
      if (!this.showWithdraw) return
      uni.navigateTo({
        url: '/packages/src/personal/change/index'
      })
    },
    handleRemove() {
      this.latitude = 0
      this.longitude = 0
      this.city = ''
      this.updateImg = ''
      this.handlePhoto()
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  background-color: #fff;
  padding: 36rpx 40rpx;
  border-radius: 10rpx;
  // height: 1160rpx;
  .btn-box {
    font-size: 22rpx;
    font-weight: 500;
    color: #3385ff;
    font-weight: 500;
    .iconjiantou1 {
      margin-left: 16rpx;
      font-size: 22rpx;
    }
  }
  .upload-exapmle-wrap {
    margin: 30rpx auto 40rpx;
    padding: 36rpx 40rpx;
    border-radius: 10rpx;
    @include wh(600rpx, 800rpx);
    background-color: #f2f2f2;
    .example-image {
      position: relative;
      border-radius: 8rpx;
      border: 2rpx solid #eee;
      .example-tips {
        position: absolute;
        top: -24rpx;
        left: -24rpx;
        color: #999;
        padding: 6rpx 10rpx;
        border-radius: 4rpx;
        background-color: rgba(255, 255, 255, 0.7);
        font-size: 20rpx;
      }
      image {
        width: 100%;
        height: 294rpx;
      }
    }
    .upload-box {
      height: 475rpx;
    }
  }
  .upload-box-wrap .upload-box {
    margin: 30rpx auto 40rpx;
    border-radius: 10rpx;
    @include wh(600rpx, 800rpx);
    background-color: #f2f2f2;
  }
  .upload-box {
    overflow: hidden;
    position: relative;
    .mask {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.7);
      @include wh(100%, 100%);
      top: 0;
      left: 0;
      color: #fff;
      .iconpack-shenhezhong {
        font-size: 200rpx;
      }
    }
    .remove-btn {
      position: absolute;
      right: 20rpx;
      top: 20rpx;
      padding: 10rpx 20rpx;
      background: var(--page-theme-color, var(--theme-color, $uni-color-primary));
      border-radius: 10rpx;
      color: #fff;
      .iconfont {
        font-size: 20rpx;
      }
    }
    .icon {
      font-size: 160rpx;
      color: #fff;
    }
    .text {
      margin-top: 30rpx;
      font-size: 44rpx;
      color: #ccc;
    }
    .cover {
      @include wh(100%, 100%);
    }
  }
  .tips {
    font-weight: 500;
    color: #999999;
    .btn {
      color: #3385ff;
    }
  }
  .handle-box {
    margin-top: 50rpx;
    .btn {
      // background: #ff7640;
      background: var(--page-theme-color, var(--theme-color, $uni-color-primary));
      border-radius: 45rpx;
      @include wh(620rpx, 90rpx);
      text-align: center;
      line-height: 90rpx;
      color: #fafafa;
      font-size: 32rpx;
    }
    /* 修改默认背景色 */
    button[disabled][type='default'],
    wx-button[disabled]:not([type]) {
      color: #fff;
      background-color: #dcdcdc;
      border-color: #ccc;
    }
  }
  .award-box {
    .title {
      text-align: center;
      font-size: 36rpx;
      font-family: PingFang SC;
      color: #222222;
      margin: 30rpx 0;
    }
    .prize-item {
      margin: 20rpx auto 20rpx;
      padding-top: 14rpx;
      width: 610rpx;
      height: 140rpx;
      box-sizing: border-box;
      background-size: 610rpx 140rpx;
      .tips {
        font-size: 22rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #ffd4c9;
      }
    }
    .voucher-item {
      margin: 20rpx auto 20rpx;
      padding: 25rpx 30rpx;
      width: 610rpx;
      height: 140rpx;
      box-sizing: border-box;
      background-size: 610rpx 140rpx;
      .card-img {
        width: 90rpx;
        height: 90rpx;
      }
      .right {
        flex: 1;
        margin-left: 18rpx;
        .voucher-title {
          width: 425rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #000;
          font-weight: 700;
        }
        .num {
          text-align: left;
          color: #999999;
          margin-top: 8rpx;
        }
      }
    }
  }
}
.withdraw-btn {
  display: inline-block;
  width: 110rpx;
  height: 42rpx;
  line-height: 40rpx;
  border: 1px solid #fff;
  border-radius: 20rpx;
  .iconfont {
    font-size: 18rpx;
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
