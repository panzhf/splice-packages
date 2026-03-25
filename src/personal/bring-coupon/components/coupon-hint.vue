<template>
  <view v-if="show" class="popop-container">
    <view class="container br-10">
      <view class="container-top">
        <view v-if="!isCollate">
          本次使用卡券：
          <text style="margin-right: 5rpx">{{ num }}</text>
          张
        </view>
        <view v-else class="container-suc">
          <view>核销结果</view>
        </view>
      </view>
      <view class="container-bottom">
        <!-- 生成核销码 -->
        <view v-if="!isCollate" class="container-ticket flex flex-middle">
          <view class="flex-1">
            <image class="code-img" :src="imgSrc" />
            <view>使用时请将此码出示给对应门店进行扫码</view>
            <view class="writeoff-tips">(若出示过的券被门店核销了将实时刷新核销结果)</view>
          </view>
        </view>
        <!-- 核销码兑换完成 -->
        <view v-else class="container-accomplish">
          <view class="accomplish-content" :style="{ height: !isicon ? '510rpx' : '' }">
            <view style="margin: 0 auto">
              本次核销卡券总计：
              <text style="color: #ffa200">{{ form.totalcount }}张</text>
              <text v-if="form.unusetotalcount">
                ，未核销
                <text style="color: #ffa200">{{ form.unusetotalcount }}张</text>
              </text>
            </view>
            <view v-if="!isicon" class="accomplish-details" @click="handleExhibition">
              <view>查看详情</view>
              <view class="iconfont iconarrow-d iconad" />
            </view>
          </view>
        </view>
        <!-- 显示核销卡券名称 -->
        <scroll-view v-if="isicon" :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" :show-scrollbar="false">
          <view v-for="(item, index) in list" :key="index" style="padding: 20rpx 10rpx">
            <view class="accomplish-info">
              <view class="accomplish-left">{{ item.vouchername }}</view>
              <view class="accomplish-right">
                <div class="accomplish-already">已核销x{{ item.usecount }}</div>
                <div v-if="item.unusecount">,未核销x{{ item.unusecount }}</div>
              </view>
            </view>
          </view>
        </scroll-view>
        <view v-if="isicon" class="accomplish-pack" @click="handleExhibition">
          收起
          <text class="iconfont iconarrow-d icondo" />
        </view>
        <view class="circle left-circle" />
        <view class="circle right-circle" />
      </view>

      <view class="iconfont icon-close2" @click="handleOnShow" />
    </view>
  </view>
</template>

<script>
import QRCode from 'packages/utils/qr-code.js'
import { apiConfirmList, apiCheckresultlist } from 'packages/api/bring-coupon'
import { getExtConfig } from '@/config'
export default {
  props: {},
  data() {
    return {
      Ids: [], //码券id
      couponcodelist: [], //码券集合
      show: false,
      num: 0, //几张卡券
      isCollate: false, //核对成功
      isicon: false, // 是否显示卡券数据
      memberlogin: '', //商户号
      form: {
        totalcount: 0, //总核销数
        unusetotalcount: 0 //未核销数
      },
      timer: null, // 轮询定时器
      list: [],
      customerid: 0, // 用户id
      imgSrc: ''
    }
  },
  methods: {
    async showToast(Ids, couponcodelist, num, customerid) {
      this.Ids = Ids // ID集合
      const res = await this.getData()
      if (!res) return

      const extConfig = getExtConfig()
      this.couponcodelist = couponcodelist // 券码集合
      this.num = num // 一共几条数据
      this.customerid = customerid // 用户id
      this.memberlogin = extConfig.memberLogin || extConfig.Memberlogin

      this.show = true
    },
    async getData() {
      let res = await apiConfirmList({ id: this.Ids })
      if (this.$ck(res, true)) {
        new QRCode('myCanvas', {
          text: res.return_data,
          width: 150,
          height: 150,
          padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
          correctLevel: QRCode.CorrectLevel.M, // 二维码可辨识度
          callback: res => {
            setTimeout(() => {
              this.imgSrc = res.path
            }, 500)
            setTimeout(() => {
              this.onPolling()
            }, 4000)
          }
        })
      }
      return res.return_code === 0
    },
    // 轮询提领券核销情况
    onPolling() {
      let couponcodelist = this.couponcodelist
      clearTimeout(this.timer)
      apiCheckresultlist({ couponcodelist, customerid: this.customerid }).then(res => {
        if (res.return_code === 600012 && this.show) {
          this.timer = setTimeout(() => {
            this.onPolling()
          }, 3000)
        } else if (res.return_code === 0) {
          this.form.totalcount = res.return_data.totalcount || 0 //总核销数
          this.form.unusetotalcount = res.return_data.unusetotalcount || 0 //未核销总数
          this.list = res.return_data.list || []
          this.isCollate = true
        }
      })
    },
    handleExhibition() {
      this.isicon = !this.isicon
    },
    // 点击关闭
    handleOnShow() {
      this.show = false
      clearTimeout(this.timer)
      this.imgSrc = ''
      this.isCollate = false
      this.isicon = false
      this.list = []
      this.couponcodelist = []
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.popop-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9991;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  .container {
    position: absolute;
    animation: tanchuang 0.4s ease-in-out;
    width: 600rpx;
    .container-top {
      width: 100%;
      height: 120rpx;
      background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
      color: #fff;
      line-height: 120rpx;
      text-align: center;
      font-size: 32rpx;
      .container-suc {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        .icon-success {
          margin-right: 20rpx;
          font-size: 44rpx;
        }
      }
    }
    .container-bottom {
      width: 100%;
      height: 650rpx;
      background-color: #fff;
      box-sizing: border-box;
      overflow: hidden;
      .circle {
        width: 40rpx;
        height: 40rpx;
        position: absolute;
        top: 116rpx;
        z-index: 9999;
        background: rgba(0, 0, 0, 1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      .left-circle {
        left: 0;
      }
      .right-circle {
        right: 0;
        transform: translate(50%, -50%);
      }
    }
    .title {
      font-size: 30rpx;
      font-weight: 700;
      text-align: center;
      margin-top: 40rpx;
    }
    .icon-close2 {
      position: absolute;
      // bottom: -150rpx;
      top: -135rpx;
      // left: 260rpx
      left: 87%;
      // transform: translate(-50%, -50%);
      color: #fff;
      font-size: 70rpx;
    }
    .container-ticket {
      text-align: center;
      padding-top: 30rpx;
      height: 580rpx;
      .code-img {
        width: 320rpx;
        margin: 0 auto;
        height: 320rpx;
        vertical-align: top;
        padding: 20rpx 0 40rpx;
      }
    }
    .container-accomplish {
      padding-top: 40rpx;
      .accomplish-content {
        display: flex;
        align-content: center;
        justify-content: center;
        flex-direction: column;
        font-size: 30rpx;
        color: #000;
        font-weight: bold;
        .accomplish-details {
          display: flex;
          align-content: center;
          justify-content: center;
          line-height: 100%;
          color: #888888;
          font-size: 26rpx;
          margin-top: 20rpx;
          .iconad {
            font-size: 15rpx;
            margin-left: 10rpx;
          }
        }
      }
    }
    .accomplish-pack {
      display: flex;
      align-content: center;
      line-height: 100%;
      color: #888888;
      font-size: 26rpx;
      margin-top: 25rpx;
      justify-content: center;
      .icondo {
        font-size: 15rpx;
        margin-left: 10rpx;
        transform: rotate(180deg);
      }
    }
    .scroll-Y {
      margin: 0 auto;
      max-height: 400rpx;
      position: relative;
      margin-top: 30rpx;
      background: #f8f8f8;
      width: 96%;
      ::-webkit-scrollbar {
        width: 0;
        height: 0;
        color: transparent;
      }

      .accomplish-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10rpx;
        color: #666666;
        font-size: 24rpx;
        .accomplish-left {
          width: 50%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .accomplish-right {
          display: flex;
          align-items: center;
          .accomplish-already {
            color: #ffa200;
          }
        }
      }
    }
  }
  .writeoff-tips {
    color: #999;
    text-align: center;
    font-size: 24rpx;
  }
}
.canvas-code {
  position: fixed;
  left: -999px;

  width: 150px;
  height: 150px;
}
@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
