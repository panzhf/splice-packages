<template>
  <view v-if="isShow" class="unlock-dialog-container">
    <view class="mask" @click="handleClickMask" />
    <view class="content" :style="{ backgroundImage: 'url(' + PopupBg + ')' }">
      <view class="box" />
      <view class="title" :style="{ backgroundImage: 'url(' + titleBgImg + ')' }">恭喜您，解锁成功</view>
      <view class="activity-info">
        <view class="info-item">
          <view class="money">{{ info }}</view>
          <view class="yuan">元</view>
        </view>
        <template v-if="hbtype === 3">
          <view class="tips lh1">{{ hbText }}</view>
          <view class="tips">{{ tipsText }}</view>
        </template>
        <template v-else>
          <view class="tips">— 请到“{{ hbtype === 1 ? '红包零钱' : '微信钱包' }}”查看 —</view>
        </template>
      </view>
      <div class="jx-button" @tap="handleCloseDialog">
        <img :src="butImg" alt="" />
      </div>
      <view class="iconfont icon-close2 close-btn" @tap="handleCloseDialog" />
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { getQuery } from 'packages/utils/function'
import { apiGetHbState } from 'packages/api/scan'
export default {
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 弹窗内容
    info: {
      type: [String, Number],
      default: ''
    },
    // 红包类型
    hbtype: {
      type: Number,
      default: 1
    },
    // 红包奖项id
    awardId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      getHbState: 1, // 1 发放成功 2 发放中 3 发放失败
      requestCountOfUnionCard: 7,
      PopupBg: staticURL(true) + 'jscg.png',
      butImg: staticURL(true) + 'jxbut.png',
      titleBgImg: staticURL(true) + 'dialog-title.png', // 标题背景图
      hbText: ''
    }
  },
  computed: {
    tipsText() {
      if (this.getHbState === 1) {
        return '— 请到“微信钱包”查看 —'
      } else if (this.getHbState === 2) {
        return '— 稍后可到“微信钱包”查看 —'
      } else {
        return '— 请联系客服补发 —'
      }
    }
  },
  watch: {
    isShow(val) {
      if (val) {
        if (this.hbtype === 3) {
          // 品牌红包轮训
          this.requestCountOfUnionCard = 7
          this.hbText = '红包发放中...'
          this.getHbState = 2
          this.getHbStateTask(this.awardId)
        }
      }
    }
  },
  methods: {
    getHbStateTask(AwardId) {
      if (this.requestCountOfUnionCard <= 0) {
        this.hbText = '红包发放失败'
        this.getHbState = 3
        return false
      }
      let query = {
        AwardId
      }
      /* #ifdef H5 */
      query.Memberlogin = getQuery('m')
      /* #endif */
      apiGetHbState(query).then(res => {
        if (this.$ck(res)) {
          if (['发放失败'].includes(res.return_data.HbSendResult)) {
            this.hbText = res.return_data.HbRemark || '红包发放失败'
            this.getHbState = 3
          } else if (['发放中', '发放中（待到账）'].includes(res.return_data.HbSendResult)) {
            setTimeout(() => {
              this.requestCountOfUnionCard--
              this.getHbStateTask(AwardId)
            }, 3000)
          } else {
            this.hbText = '红包发放成功'
            this.getHbState = 1
          }
        }
      })
    },
    // 点击遮罩
    handleClickMask() {
      this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.unlock-dialog-container {
  position: fixed;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  .mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;

    width: 600rpx;
    height: 590rpx;

    // animation: tanchuang 0.4s ease-in-out;

    border-radius: 20rpx;
    background-image: linear-gradient(#ffffff, #fff9e2);
    background-repeat: no-repeat;
    background-size: 100%;
    .jx-button {
      position: absolute;
      bottom: 48rpx;
      z-index: 99999;
      font-size: 90rpx;
      img {
        width: 320rpx;
        height: 100rpx;
      }
    }
    .box {
      position: absolute;
      z-index: 100;

      width: 577rpx;
      height: calc(100% - 20rpx);
      margin: 10rpx 0;
      // border: 1rpx solid #fae5ca;

      border-radius: 30rpx;
    }

    .title {
      position: relative;
      z-index: 200;

      display: flex;
      align-items: center;
      justify-content: center;

      width: 459rpx;
      height: 70rpx;
      padding-bottom: 8rpx;

      transform: translateY(-8rpx);

      color: #c01717;
      background-repeat: no-repeat;
      background-size: 100%;

      font-size: 32rpx;
      font-weight: bold;
    }

    .activity-info {
      width: 100%;
      height: 100%;
      padding: 0 40rpx;

      .info-item {
        display: flex;
        justify-content: center;

        margin-top: 64rpx;
        .money {
          text-align: center;

          opacity: 1;
          color: #f0311d;

          font-family: PingFang SC Heavy, PingFang SC Heavy-Heavy;
          font-size: 90rpx;
          font-weight: 800;
          line-height: 88rpx;
        }
        .yuan {
          margin-left: 24rpx;

          text-align: center;

          color: #f0311d;

          font-family: PingFang SC Heavy, PingFang SC Heavy-Heavy;
          font-size: 30rpx;
          font-weight: 800;
          line-height: 130rpx;
        }
      }

      .tips {
        text-align: center;
        color: #c41b23;
        font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        font-size: 24rpx;
        font-weight: 500;
        line-height: 60rpx;
      }
      .lh1 {
        line-height: 1;
      }
    }
  }

  .close-btn {
    position: absolute;
    bottom: -150rpx;

    color: #fff;

    font-size: 72rpx;
  }
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
