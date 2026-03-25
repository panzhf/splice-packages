<template>
  <view>
    <!-- 底部关注 -->
    <view v-show="focusFlag" class="focus-wrapper" :style="styleObj">
      <view class="left">
        <image :src="logoImg" alt="" class="avatar" />
        <text class="txt ell">{{ comName }}</text>
      </view>
      <view class="right">
        <text class="btn" @click="handleFollow">关注</text>
        <image :src="PACKAGE_STATIC_URL + 'lottery/img/chacha.png'" alt="" class="close" @click="focusFlag = false" />
      </view>
    </view>
    <!-- 二维码弹框 -->
    <view v-show="codeFlag" class="qr-code" @click="hideCode">
      <view class="code-wrapper" @click.stop="() => {}">
        <view class="code-content">
          <image class="img" :src="codeImg" alt="" />
          <view class="text">长按识别二维码关注公众号</view>
        </view>
        <view class="del" @click="hideCode" />
      </view>
    </view>
  </view>
</template>

<script>
import { apiGetCustomerType } from '../../api/common'
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  props: {
    actType: {
      default: 8, // 8:期期抽奖 9:集拼图 11:拍一拍
      type: Number
    },
    position: {
      default: 'bottom',
      type: String
    }
  },
  data() {
    return {
      aid: '', // 活动id
      focusFlag: false,
      logoImg: '',
      comName: '',
      codeFlag: false,
      codeImg: ''
    }
  },
  computed: {
    styleObj() {
      return this.position === 'bottom' ? { bottom: 0 } : { top: 0 }
    }
  },
  created() {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.getGzStatus()
    /* #endif */
  },
  methods: {
    getGzStatus(type) {
      let params = {
        actid: this.aid,
        type: this.actType
      }
      //用户是否关注公众号
      apiGetCustomerType(params).then(res => {
        if (res.return_code === 0) {
          this.comName = res.return_data.CompanyName
          this.logoImg = res.return_data.WxLogo
          this.focusFlag = res.return_data.IsFollow === 1 && res.return_data.GzStatus !== 1 //开启用户关注开关和用户未关注为true
          this.codeImg = res.return_data.Url
          this.$emit('status', res.return_data.GzStatus)
        }
      })
    },
    handleFollow() {
      this.codeFlag = true
    },
    hideCode() {
      this.codeFlag = false
    }
  }
}
</script>

<style lang="scss">
.focus-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 90rpx;
  background-color: rgba(49, 16, 10, 0.7);
  z-index: 1001;
  .left,
  .right {
    display: flex;
    align-items: center;
  }
  .avatar {
    display: block;
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-left: 20rpx;
  }
  .txt {
    margin-left: 20rpx;
    width: 390rpx;
    color: #fff;
    font-size: 26rpx;
  }
  .btn {
    width: 98rpx;
    height: 50rpx;
    border: 1px solid #fff;
    border-radius: 8rpx;
    line-height: 46rpx;
    text-align: center;
    margin-right: 30rpx;
    color: #fff;
  }
  .close {
    display: block;
    box-sizing: content-box;
    width: 24rpx;
    height: 24rpx;
    padding: 20rpx 40rpx 20rpx 20rpx;
  }
}
.qr-code {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 998;
  background-color: rgba(0, 0, 0, 0.75);

  .code-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;

    .code-content {
      box-shadow: 0 0 16rpx rgba(0, 0, 0, 0.1);
      border-radius: 6rpx;
      font-size: 28rpx;
      background-color: #fff;
      overflow: hidden;
      min-width: 440rpx;
      .img {
        display: block;
        width: 320rpx;
        height: 320rpx;
        margin: 50rpx auto 30rpx;
      }
      .text {
        font-size: 32rpx;
        color: #666;
        text-align: center;
        margin-bottom: 48rpx;
      }
    }
    .del {
      position: absolute;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      top: -60rpx;
      right: -80rpx;
      border: 1px solid #fff;
      &::before {
        position: absolute;
        left: 8rpx;
        top: 26rpx;
        content: '';
        width: 40rpx;
        height: 1px;
        background-color: #fff;
        transform: rotate(45deg);
        border-radius: 6rpx;
      }
      &::after {
        position: absolute;
        left: 8rpx;
        top: 26rpx;
        content: '';
        width: 40rpx;
        height: 1px;
        background-color: #fff;
        transform: rotate(-45deg);
        border-radius: 6rpx;
      }
    }
  }
}
</style>
