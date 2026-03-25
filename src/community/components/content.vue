<template>
  <view class="content-box bg-white br-10 overflow-h">
    <view class="header flex flex-middle fs-28">
      <view class="flex-1 flex overflow-h pr-20">
        <v-img class="photo shrink-0 br-round overflow-h" size="400" :src="info.headpath" />
        <view class="right flex-1 overflow-h ml-14">
          <view class="nick-name ellipsis fw-bold">{{ info.nickname }}</view>
          <view class="time fs-24 fw-medium">{{ info.addtime }}</view>
        </view>
      </view>
      <view v-if="type === 'my'" class="state text-center fw-bold" :class="[`state-${info.status}`]">
        {{ info.status | filterText }}
      </view>
    </view>
    <view v-if="info.topics.length" class="tag-box flex-wrap">
      <tag
        v-for="(item, index) in info.topics"
        :key="index"
        :text="item.topicname"
        :checked="checkedTagId === 0 || checkedTagId === item.topicid"
        :active-color="tagCheckedColor"
        :inactive-color="tagColor"
        @click.native="handleDetail(item)"
      />
    </view>
    <text-collapse
      :line="6"
      :dt="info.content"
      font-style="font-size: 32rpx;font-weight: 500;color: #2a2a2a;"
      class="content"
    />

    <u-swiper
      v-if="info.pictures.length > 1"
      :list="info.pictures"
      height="946"
      name="url"
      :autoplay="false"
      indicator-pos="bottomRight"
      img-mode="aspectFill"
      border-radius="0"
      class="swiper-u"
      @click="handleLookImg"
    />

    <image v-else mode="widthFix" class="imgs" :src="info.pictures[0].url" @tap="handleLookImg(0)" />
    <template v-if="type === 'my'">
      <view v-if="info.status !== 0" class="emum-box flex flex-middle flex-between fs-28">
        <view class="iconfont icon-trash" @tap="handleDel" />
        <view v-if="info.status == 1" class="right flex flex-middle">
          <view
            class="iconfont icondianzan"
            :class="info.islike ? 'icondianzan' : 'icondianzan-2'"
            @tap="handleZan()"
          />
          <text class="ren fw-medium fs-26">{{ info.likeitnum }}人点赞</text>
          <view class="iconfont iconpack-fenxiang ml-30" @tap="handleShare" />
          <view class="like-tip" :class="{ float: info.istaped }">+1</view>
        </view>
        <view v-if="info.status == 2" class="btn mr-20 fw-medium" @tap="handleLook">查看原因</view>
      </view>
    </template>
    <view v-else class="emum-box flex flex-middle flex-between">
      <view class="left ml-20 flex flex-middle">
        <v-img
          v-for="(item, index) in info.likeitheadpaths"
          :key="index"
          class="photo br-round overflow-h"
          :class="{ skewing: index > 0 }"
          size="400"
          :src="item.url"
        />
        <view v-if="info.likeitnum" class="ren fw-medium fs-26">{{ info.likeitnum }}人点赞</view>
      </view>
      <view class="right flex flex-middle">
        <view class="iconfont" :class="info.islike ? 'icondianzan' : 'icondianzan-2'" @tap="handleZan()">
          <auth-button />
        </view>
        <view class="iconfont iconpack-fenxiang ml-20" @tap="handleShare" />
        <view class="like-tip" :class="{ float: info.istaped }">+1</view>
      </view>
    </view>
    <common-popup v-model="showPopup" title="未通过原因" :content="popupMsg" class="pop" />
    <common-popup
      v-model="showConfirmPopup"
      type="confirm"
      title="删除提示"
      content="是否确定删除？"
      class="pop"
      @confirm="dleConfirm"
    />
    <canvas id="myQrcode" canvas-id="myQrcode" class="share-canvas" :style="{ height: `${rectHeight}px` }" />
    <share-popup v-model="showSharePopup" :path="shareImgPath" @share="handleGetShareAward" />
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { getExtConfig } from '@/config'
import Tag from './tag'
import CommonPopup from 'packages/components/common-popup/common-popup'
import SharePopup from 'packages/components/share-popup/index'
import TextCollapse from 'packages/components/text-collapse/index'
import imgMixin from 'packages/mixins/img'
import { downLoadImg, getImageInfo } from 'packages/utils/utils'
import { previewImage } from 'packages/utils'
import {
  apiGetShareContent,
  apiShareReward,
  apiContentLikeit,
  apiDeleteContent,
  apiGetMiniCode
} from 'packages/api/community'

export default {
  components: {
    Tag,
    CommonPopup,
    SharePopup,
    TextCollapse
  },
  filters: {
    filterText(val) {
      let o = {
        0: '审核中',
        1: '通过',
        2: '未通过'
      }
      return o[val]
    }
  },
  mixins: [imgMixin],
  props: {
    type: {
      type: String,
      default: ''
    },
    checkedTagId: {
      // 选中标签Id
      type: Number,
      default: 0
    },
    tagClck: {
      // 标签是否可点击
      type: Boolean,
      default: true
    },
    tagCheckedColor: {
      // 标签选中颜色
      type: String,
      default: '#5380ff'
    },
    tagColor: {
      // 标签颜色
      type: String,
      default: '#000'
    },
    info: {
      type: Object,
      default: () => {
        return {
          status: 0,
          likeitheadpaths: [],
          islike: false
        }
      }
    }
  },
  data() {
    return {
      showSharePopup: false,
      shareImgPath: '',
      rectHeight: 0, // 画布高度
      httpCodeImg: '',
      httpBgImg: '',
      httpHeadImg: '',
      popupMsg: '',
      showPopup: false,
      showConfirmPopup: false,
      sharecontent: '', // 后台设置的标语
      memberLogin: ''
    }
  },
  computed: {
    ...mapState(['NickName', 'HeadPath'])
  },
  mounted() {
    this.memberLogin = this.$toLowerKey(getExtConfig()).memberlogin
  },
  methods: {
    handleDetail(item) {
      if (this.tagClck) {
        uni.navigateTo({
          url: `/packages/src/community/topic?id=${item.topicid}&title=${encodeURIComponent(item.topicname)}`
        })
      }
    },
    dleConfirm() {
      this.showConfirmPopup = false
      apiDeleteContent({
        id: this.info.communityid
      })
        .then(() => {
          this.$msg('删除成功')
          this.$emit('del')
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    },
    handleDel() {
      this.showConfirmPopup = true
    },
    handleZan() {
      if (this.info.islike) {
        return this.$msg('已点赞，不可取消哦', { mask: false })
      }
      let info = JSON.parse(JSON.stringify(this.info))
      info.islike = 1
      this.$emit('update', info)
      apiContentLikeit({
        m: this.memberLogin,
        id: this.info.communityid
      })
        .then(() => {
          uni.$emit('setZan', this.info.communityid)
          info.likeitnum++
          if (this.type !== 'my') {
            if (info.likeitheadpaths.length >= 3) {
              info.likeitheadpaths[2].url = this.HeadPath
            } else {
              info.likeitheadpaths.push({
                url: this.HeadPath
              })
            }
          }
          info.istaped = true
          this.$emit('update', info)
        })
        .catch(err => {
          this.$msg(err.return_msg || '网络异常')
          info.islike = 0
          this.$emit('update', info)
        })
    },
    handleGetShareAward() {
      apiShareReward({
        id: this.info.communityid,
        m: this.memberLogin
      })
        .then(res => {
          this.$msg(res.return_msg)
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    },
    handleLook() {
      this.popupMsg = this.info.auditreason
      this.showPopup = true
    },
    async handleShare() {
      if (this.shareImgPath) {
        this.showSharePopup = true
        return
      }
      // if (!this.NickName || !this.HeadPath) {
      //   return this.$msg('获取头像昵称失败')
      // }
      let {
        return_data: { sharecontent = '' }
      } = await apiGetShareContent({ m: this.memberLogin })
      this.sharecontent = sharecontent

      this.$loading.show('正在生成图片')
      const res = await apiGetMiniCode({
        pageUrl: 'packages/src/community/detail',
        parameters: encodeURIComponent(`id=${this.info.communityid}`)
      })
      const d = this.$toLowerKey(res, true)
      if (this.$ck(d, true)) {
        if (d.return_data?.state === 0 && d.return_data.imgpath) {
          // 二维码转换
          const codeImg = this.formatImg(d.return_data.imgpath)
          // 二维码下载
          this.httpCodeImg = await downLoadImg(codeImg)
          // 背景转换
          const bgImg = this.formatImg(this.info.pictures[0].url)
          // 背景图片信息下载
          this.httpBgImg = await downLoadImg(bgImg)
          const bgImgInfo = await getImageInfo(this.httpBgImg)
          // 头像转换
          // const headPath = this.formatImg(this.HeadPath)
          // 头像下载
          // this.httpHeadImg = await downLoadImg(headPath)
          this.setCanvas(bgImgInfo)
        } else {
          this.$msg('获取小程序码失败')
        }
      }
    },
    setCanvas(info) {
      let bgWidth = 620
      let bgImgHeight = (bgWidth * info.height) / info.width
      this.rectHeight = bgImgHeight + 240
      let ctx = uni.createCanvasContext('myQrcode', this)
      ctx.setFillStyle('white')
      ctx.fillRect(0, 0, bgWidth, this.rectHeight)
      ctx.stroke() // 不加这句会是下面的arc失效
      // ctx.save(true)
      ctx.drawImage(this.httpBgImg, 0, 0, bgWidth, bgImgHeight)
      // ctx.save(true)
      // 写入头像

      // 画出头像标题
      // let avatarurl_width = 80 //绘制的头像宽度
      // let avatarurl_heigth = 80 //绘制的头像高度
      // let avatarurl_x = 30 //绘制的头像在画布上的位置
      // let avatarurl_y = bgImgHeight - 30 //绘制的头像在画布上的位置
      ctx.save()
      // ctx.beginPath() //开始绘制
      // // 先画个圆  前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
      // ctx.arc(
      //   avatarurl_width / 2 + avatarurl_x,
      //   avatarurl_heigth / 2 + avatarurl_y,
      //   avatarurl_width / 2,
      //   0,
      //   Math.PI * 2,
      //   false
      // )
      // ctx.clip() //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因

      // ctx.drawImage(this.httpHeadImg, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth) // 推进去图片，必须是https图片
      ctx.restore() //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
      // ctx.draw(true)
      // 画出内容文本
      let content = Array.from(this.info.content) // 防止一些带表情等特殊字符，截取有问题
      content = content.filter(item => !['↵', '\n', '\r\n', '\n\n'].includes(item)).join('')
      this.textPrewrap(ctx, content, 35, bgImgHeight + 40, 40, 532, 2, '#2A2A2A', 28)
      ctx.stroke()
      ctx.draw(true)
      // 画出二维码
      ctx.drawImage(this.httpCodeImg, 473, 100 + bgImgHeight, 120, 120)

      ctx.save()
      ctx.draw(true)
      this.textPrewrap(ctx, this.sharecontent, 35, bgImgHeight + 170, 40, 400, 2, '#666666', 24)
      ctx.save()
      ctx.draw(true)

      let _this = this
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width: bgWidth,
            height: _this.rectHeight,
            destWidth: bgWidth,
            destHeight: _this.rectHeight,
            canvasId: 'myQrcode',
            fileType: 'jpg',
            success(res) {
              _this.$loading.hide()
              _this.showSharePopup = true
              _this.shareImgPath = res.tempFilePath
              let obj = {
                imageUrl: res.tempFilePath
              }
              _this.$emit('shareData', Object.assign(_this.info, obj))
              // 绘画成功
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
    },
    handleLookImg(index) {
      const urls = this.info.pictures.map(item => item.url)
      const current = urls[index]
      previewImage({
        current,
        urls
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
@import '../styles/list.scss';
view {
  box-sizing: border-box;
}
.header {
  padding: 30rpx 0 0 30rpx;
  .state {
    @include whl(120rpx, 48rpx);
    border-radius: 24rpx 0rpx 0rpx 24rpx;
  }
  .state-0 {
    background: $community-theme;
    color: #fff;
  }
  .state-1 {
    background: #f4f4f4;
    color: #2a2a2a;
  }
  .state-2 {
    background: #ffefee;
    color: $community-theme;
  }
  .photo {
    @include wh(72rpx);
  }
  .nick-name {
    color: #2a2a2a;
  }
  .time {
    color: #888;
  }
}
.tag-box {
  padding: 0 30rpx 10rpx;
}
.emum-box {
  height: 95rpx;
  padding: 0 10rpx;
  .iconfont {
    padding: 20rpx; // 加大图标点击区域
    position: relative;
  }
  .ren {
    color: #888;
  }
  .btn {
    color: #5380ff;
  }
  .left {
    .photo {
      @include wh(50rpx);
      margin-right: 12rpx;
    }
    .skewing {
      margin-left: -22rpx;
    }
  }
  .right {
    position: relative;
    .icondianzan {
      color: $community-theme;
    }
  }
}
.content-box {
  .content {
    padding: 0 20rpx;
    // 有BUG，加点间距
    padding-left: 36rpx;
    margin: 10rpx auto 20rpx;
    display: block;
  }
}
.imgs {
  display: block;
  width: 100%;
}

.swiper-u {
  ::v-deep .u-swiper-indicator {
    box-sizing: border-box;
  }
}
.share-canvas {
  position: fixed;
  z-index: -1;
  left: -999px;
  width: 620px;
  border: 1px solid #c3c3c3;
  opacity: 0;
  pointer-events: none;
}
.like-tip {
  position: absolute;
  top: 0;
  left: 15rpx;
  z-index: 5;
  color: $community-theme;
  font-size: 20rpx;
  transform: scale(0);
  &.float {
    animation: float 1.5s 1 linear;
  }
}
@keyframes float {
  0% {
    transform: scale(0) translateY(-4rpx);
  }
  50% {
    transform: scale(2) translateY(-30rpx);
  }
  100% {
    transform: scale(0.8) translateY(-80rpx);
  }
}
</style>
