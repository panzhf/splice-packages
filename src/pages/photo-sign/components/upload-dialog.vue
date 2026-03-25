<template>
  <u-mask
    :show="showDialog"
    :zoom="false"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    z-index="100"
    @click="close"
  >
    <view class="upload-dialog bg-white" :class="{ slide: showDialog }" @tap.stop="() => {}">
      <view class="iconfont icon-close close-icon fw-bold" @tap.stop="close" />
      <image :src="PACKAGE_STATIC_URL + 'photo-sign/upload-title.png'" class="title-icon" />
      <view class="upload-box flex flex-middle flex-center br-10">
        <template v-if="tempImg">
          <image :src="tempImg" mode="aspectFit" class="cover" />
          <view class="del-tag" @tap.stop="handleDel" />
        </template>
        <view v-else class="placeholder flex flex-middle flex-center flex-column" @tap="handleChoose">
          <view class="iconfont iconpack-xiangji icon" />
          <view class="mt-30 c-9 fs-32 text-center">点 击 拍 照</view>
        </view>
      </view>
      <view class="input-box mt-30 fs-28">
        <textarea
          v-model.trim="content"
          placeholder-style="color:#ccc"
          placeholder="请输入打卡内容（选填）"
          :maxlength="1000"
          adjust-keyboard-to="bottom"
          fixed
          class="input"
          @blur="handleContent"
        />
        <view class="count text-right fs-24 c-9">{{ contentLength }}/1000</view>
      </view>
      <button class="confirm-btn fs-36 fw-bold" hover-class="button-action" @tap="handleSign">完成打卡</button>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
// import subscribeMsgMixin from 'packages/mixins/subscribe-msg'
import dialogMixin from 'packages/mixins/dialog'
import { apiSetNewSign } from 'packages/api/photo-sign'
import { chooseImg, uploadImg } from '@/utils/upload'
export default {
  name: 'UploadDialog',
  mixins: [
    packageStaticMixin,
    // subscribeMsgMixin,
    dialogMixin
  ],
  props: {
    info: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tempImg: '', // 拍照选择照片
      uploadedImg: '', // 上传成功后的照片。个别原因打卡失败时，可取此照片无需重新上传
      content: '',
      firstInit: true,
      subscribeInfo: {
        mainSwitch: true, // 主开关
        isAlways: false, // 总是保持选择
        isAccept: false // 总是允许
      } // 订阅消息
    }
  },
  computed: {
    contentLength() {
      return this.content.length
    }
  },
  watch: {
    async showDialog(v) {
      if (v) {
        this.tempImg = ''
        this.uploadedImg = ''
        this.content = ''
        // if (this.firstInit) {
        //   // 等上传弹窗打开再获取，减少请求
        //   await this.fetchSubscribeTemplate()
        //   this.noticeTempId && (this.firstInit = false)
        // }
      }
    }
  },
  methods: {
    handleContent({ detail: { value } }) {
      if (!value) return
      this.content = value
    },
    async handleChoose() {
      if (this.disabledSign) return

      const paths = await chooseImg({
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: this.info.photomode ? ['album', 'camera'] : ['camera'],
        count: 1
      })
      if (paths?.length) {
        this.uploadedImg = ''
        this.tempImg = paths[0]
      }
    },
    handleDel() {
      this.tempImg = ''
      this.uploadedImg = ''
    },
    async handleSign() {
      if (!this.tempImg) return this.$msg('请上传图片')
      this.$loading.show('上传中')
      try {
        if (!this.uploadedImg) {
          // true兼容云店上传图片
          const { return_data: r } = await uploadImg(this.tempImg, true)
          this.uploadedImg = r[0].imgurl
        }
        // await this.handleSubscribeMessage()
        apiSetNewSign({ aid: this.info.actId, signimage: this.uploadedImg, content: this.content })
          .then(res => {
            this.$loading.hide()
            const d = this.$toLowerKey(res, true)
            // prizetype: -1未中奖 0产品 1积分 2购物券 3第三方卡券 5微信红包 6红包零钱 8企业付款红包 10品牌红包
            const prize = d.return_data[0]
            let info = {}
            if (prize) {
              // 人工审核模式下无奖励，进入审核状态
              const { maxtotalnumber, prizetype, mpjumplikn, productimage, productname, point, shopvouname, hbname } =
                prize

              // 简化奖品类型以便展示图标，拼接奖品内容
              let newPrizeType = prizetype
              let prizeName = ''
              if (prizetype === 0) {
                prizeName = productname
              } else if (prizetype === 1) {
                prizeName = `获得 ${point} 积分`
              } else if ([2, 3].includes(prizetype)) {
                newPrizeType = 2
                prizeName = shopvouname
              } else if ([5, 6, 8, 10].includes(prizetype)) {
                newPrizeType = 3
                prizeName = hbname
              }
              info = {
                ...info,
                day: maxtotalnumber,
                prizename: prizeName,
                prizetype: newPrizeType,
                picurl: productimage,
                prizelink: mpjumplikn
              }
            }
            this.$emit('success', { prize: info, img: this.uploadedImg })
          })
          .catch(err => {
            this.$msg(err.return_msg)
          })
      } catch (error) {
        this.$msg(error.return_msg || '上传失败，请重试', { duration: 3000 })
      }
    }
    /**
     * fetchSubscribeTemplate() {
        return new Promise(resolve => {
          apiGetSubscribeTemplateId()
            .then(res => {
              this.noticeTempId = res.return_data
              resolve()
            })
            .catch(() => {
              resolve()
            })
        })
    },
    judgeSetting() {
      return new Promise(resolve => {
        uni.getSetting({
          withSubscriptions: true,
          success: ({ subscriptionsSetting }) => {
            let { mainSwitch, itemSettings = {} } = subscriptionsSetting
            this.subscribeInfo.mainSwitch = mainSwitch
            this.subscribeInfo.isAlways = !!itemSettings[this.noticeTempId]
            this.subscribeInfo.isAccept = itemSettings[this.noticeTempId] === 'accept'
          },
          complete() {
            resolve()
          }
        })
      })
    },
    async handleSubscribeMessage() {
      await this.judgeSetting()
      if (this.subscribeInfo.mainSwitch && this.subscribeInfo.isAlways) {
        // 勾选总是选项不发起消息订阅弹窗
        if (this.subscribeInfo.isAccept) {
          this.handleAddSubscribeRecord()
          return Promise.resolve()
        } else {
          return Promise.resolve()
        }
      }
      const res = await this.requestSubscribeMsg([this.noticeTempId])
      if (res && res[this.noticeTempId] === 'accept') {
        this.handleAddSubscribeRecord()
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    },
    handleAddSubscribeRecord() {
      apiAddSubscribeRecord({aid: this.info.actId})
    }
     */
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: upload-dialog;
.#{$prefix} {
  position: fixed;
  left: 0;
  bottom: 0;
  @include wh(100%, 982rpx);
  @include round(30rpx 30rpx 0 0);
  @include box();
  padding: 60rpx 50rpx 40rpx;
  transition: transform 0.25s;
  transform: translate3d(0, 100%, 0);
  &.slide {
    transform: translate3d(0, 0, 0);
  }
  .close-icon {
    position: absolute;
    top: -60rpx;
    right: 30rpx;
    font-size: 30rpx;
    color: #fff;
  }
  .title-icon {
    position: absolute;
    top: -42rpx;
    @include wh(316rpx, 42rpx);
    @include h-cen;
  }
  .upload-box {
    position: relative;
    @include wh(100%, 480rpx);
    border: 1px solid #ddd;
    .cover {
      display: block;
      @include wh(100%, 480rpx);
    }
    .placeholder {
      @include wh(100%);
    }
    .icon {
      font-size: 90rpx;
      color: #f2f2f2;
    }
  }
  .del-tag {
    position: absolute;
    z-index: 3;
    top: 0;
    right: 0;
    border: 24rpx solid transparent;
    border-top-color: #ff5c53;
    border-right-color: #ff5c53;
    @include round(0 10rpx);
    &::before,
    &::after {
      position: absolute;
      top: -10rpx;
      content: '';
      @include wh(20rpx, 4rpx);
      background-color: #fff;
    }
    &::before {
      transform: rotate(45deg);
    }
    &::after {
      transform: rotate(135deg);
    }
  }
  .input-box {
    .input {
      width: 100%;
      height: 170rpx;
    }
    .count {
      padding: 20rpx 0 10rpx;
      border-bottom: 1px solid #ddd;
    }
  }
  .confirm-btn {
    @include whl(580rpx, 90rpx);
    margin: 40rpx auto 0;
    background: linear-gradient(90deg, #f5862b 0%, rgba(245, 134, 43, 0.7) 100%);
    color: #fff;
    @include round(45rpx);
  }
}
</style>
