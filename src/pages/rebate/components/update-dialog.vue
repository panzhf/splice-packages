<template>
  <u-mask :show="showDialog" :zoom="false" :custom-style="{ background: 'rgba(0, 0, 0, 0.5)' }" z-index="100">
    <view class="dialog-info" :class="{ showDialog }">
      <view class="iconfont icon-close2 close-icon fw-bold" @tap.stop="showDialog = false" />
      <view class="title">上传订单图片</view>
      <view class="tips">(最多添加3张图片，图片不能大于5M)</view>
      <view class="update-box">
        <view v-for="(item, index) in fileList" :key="index" class="item">
          <u-icon v-if="item.url" name="close" size="40" class="close" @click="handRemove(item)" />
          <view v-if="item.url" class="box" @click.stop="hanleGetphoto(index)">
            <image :src="item.url" class="imgs" mode="aspectFit" />
          </view>
          <view v-else class="box" @click.stop="hanleGetphoto(index)">
            <u-icon name="camera" size="40" />
            <text>添加图片</text>
          </view>
        </view>
      </view>
      <view class="button-form" @click="handleSubmit">确认上传</view>
    </view>
  </u-mask>
</template>

<script>
/* #ifdef MP-WEIXIN */
import { chooseImg, uploadImg } from '@/utils/upload'
/* #endif */
/* #ifdef H5 */
import { apiGetWxImg } from 'packages/api/rebate'
/* #endif */
import dialogMixin from 'packages/mixins/dialog'
export default {
  mixins: [dialogMixin],
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      fileList: [
        {
          url: ''
        },
        {
          url: ''
        },
        {
          url: ''
        }
      ]
    }
  },
  watch: {
    value(val) {
      if (!val) {
        this.fileList = [
          {
            url: ''
          },
          {
            url: ''
          },
          {
            url: ''
          }
        ]
      }
    }
  },
  methods: {
    handRemove(item) {
      item.url = ''
    },
    async hanleGetphoto(index) {
      /* #ifdef MP-WEIXIN */
      const paths = await chooseImg({
        mediaType: ['image'],
        sizeType: ['compressed'],
      })
      if (paths?.length) {
        this.$loading.show()

        uploadImg(paths[0]).then(res => {
          this.$loading.hide()
          if (this.$ck(res)) {
            this.fileList[index].url = res.return_data[0].imgurl
          }
        })
      }
      /* #endif */
      /* #ifdef H5 */
      this.$wechat.chooseImage({
        count: 1, // 默认9
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
        success: res => {
          let localId = res.localIds[0] // 返回选定照片的本地 ID 列表，localId可以作为 img 标签的 src 属性显示图片
          this.$wechat.uploadImage({
            localId, // 需要上传的图片的本地ID，由 chooseImage 接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: res2 => {
              let serverId = res2.serverId // 返回图片的服务器端ID
              apiGetWxImg({
                Memberlogin: this.info.MemberLogin,
                MediaId: [serverId]
              })
                .then(data => {
                  if (this.$ck(data)) {
                    if (data.return_data) {
                      this.fileList[index].url = data.return_data[0].ImgUrl
                    } else {
                      this.$msg('获取图片失败')
                    }
                  }
                })
                .catch(err => {
                  this.$msg(err.return_msg)
                })
            }
          })
        },
        fail: err => {
          console.log(err)
          this.$msg('SDK调用失败')
        }
      })
      /* #endif */
    },
    async handleSubmit() {
      let files = []
      // 通过filter，筛选出上传进度为100的文件(因为某些上传失败的文件，进度值不为100，这个是可选的操作)
      files = this.fileList.filter(val => {
        return val.url
      })
      // 如果您不需要进行太多的处理，直接如下即可
      // files = this.$refs.uUpload.lists;
      if (!files.length) {
        return this.$msg('请选择你要上传的订单截图')
      }
      this.$emit('handleSubmit', {
        ActID: this.info.actId, //活动ID
        Images: files.map(item => item.url)
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
    height: 700rpx;
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
    text-align: center;
    font-size: 28rpx;
    font-family: PingFang SC;
    .mb {
      font-weight: bold;
    }
  }
  .update-box {
    display: flex;
    margin-top: 30rpx;
    padding: 0 50rpx;
    justify-content: space-between;
    .item {
      width: 202rpx;
      height: 350rpx;
      background: #ffffff;
      border: 1rpx solid #e5e5e5;

      position: relative;
      .box {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .close {
        position: absolute;
        right: 0rpx;
        top: 0rpx;
        background: red;
        color: #fff;
        z-index: 9;
      }
      .img {
        width: 202rpx;
        height: 350rpx;
      }
    }
  }

  .tips {
    margin-top: 16rpx;
    text-align: center;
    font-size: 24rpx;
    font-family: PingFang SC;
    color: #aaaaaa;
  }
  .button-form {
    width: 650rpx;
    height: 90rpx;
    background: linear-gradient(0deg, #60e2fd, #1e75f3);
    border: 2rpx solid #dbf4ff;
    box-shadow: 0rpx 10rpx 20rpx 0rpx rgba(16, 135, 213, 0.39), 0rpx 3rpx 2rpx 0rpx rgba(253, 93, 43, 0.35);
    border-radius: 45rpx;
    font-size: 36rpx;
    font-family: PingFang SC;
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
</style>
