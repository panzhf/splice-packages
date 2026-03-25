<template>
  <u-mask
    :show="showDialog"
    :zoom="false"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    z-index="100"
    @click="close"
  >
    <view class="prize-dialog flex flex-column flex-middle flex-center">
      <view class="header">
        <image :src="tipIcon" class="bg" />
      </view>
      <view class="prize-container overflow-h">
        <view class="content">
          <!-- 占位 -->
          <view class="placeholder" />
          <view class="tip-box fs-30 text-center" :class="{ small: isPrize, 'fw-bold': !info.audittype }">
            <template v-if="info.audittype === 1">
              <view>打卡信息正在审核中</view>
              <view>请关注审核结果</view>
            </template>
            <template v-else>
              你已累计打卡
              <text class="count">{{ info.day }}</text>
              天
            </template>
          </view>
          <view
            v-if="isPrize"
            class="prize-box bg-white flex flex-middle"
            :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}photo-sign/prize-bg.png)` }"
          >
            <image :src="prizeIcon" class="prize-icon" />
            <view class="flex-1 prize-info">
              <view class="title fs-30 fw-bold">{{ info.prizename }}</view>
            </view>
          </view>
          <view class="placeholder" />
          <view class="btn-group flex flex-middle" :class="isPrize ? 'flex-between' : 'flex-center'">
            <view
              class="btn text-center fw-bold"
              :class="isPrize ? 'plain flex-1 ml-30' : 'active w-360'"
              @tap.stop="close"
            >
              关闭
            </view>
            <view v-if="isPrize" class="btn active flex-1 text-center fw-bold ml-30 mr-30" @tap.stop="handleView">
              查看奖品
            </view>
          </view>
        </view>
      </view>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
export default {
  name: 'PrizeDialog',
  mixins: [packageStaticMixin, dialogMixin],
  props: {
    info: {
      type: Object,
      default: () => ({})
    },
    // #ifdef MP-CLOUDSHOP
    mpInfo: {
      type: Object,
      default: () => ({})
    }
    // #endif
  },
  data() {
    return {}
  },
  computed: {
    isPrize() {
      return this.info.prizetype > -1
    },
    prizeIcon() {
      const o = {
        1: this.PACKAGE_STATIC_URL + 'jifengIcon.jpg',
        2: this.PACKAGE_STATIC_URL + 'kaquan.png',
        3: this.PACKAGE_STATIC_URL + 'hong.jpg'
      }
      return this.info.prizetype in o ? o[this.info.prizetype] : this.info.picurl
    },
    tipIcon() {
      return `${this.PACKAGE_STATIC_URL}photo-sign/${this.info.audittype === 1 ? 'upload' : 'sign'}-success.png`
    }
  },
  methods: {
    handleView() {
      this.close()
      // #ifdef MP-CLOUDSHOP
      if (!this.mpInfo.ishasminiprogram) return this.$msg('请联系品牌授权会员小程序哦')
      navigateToMP({
        appId: this.mpInfo.appid,
        path: this.info.prizelink
      })
      // #endif
      // #ifdef MP-MEMBER
      navigateToMP({
        path: this.info.prizelink
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: prize-dialog;
.#{$prefix} {
  height: 100%;
  .prize-container {
    width: 600rpx;
  }
  .header {
    position: relative;
    z-index: 10;
    bottom: -120rpx;
    @include wh(396rpx, 195rpx);
    .bg {
      display: block;
      margin: 0 auto;
      @include wh(396rpx, 196rpx);
    }
  }
  .content {
    position: relative;
    min-height: 480rpx;
    @include round(30rpx);
    // 渐变边框
    border: 2px solid transparent;
    background-image: linear-gradient(0deg, #ffffff 0%, #fffce7 100%), linear-gradient(0deg, #ffffff, #fec785);
    background-clip: content-box, border-box;
    background-origin: border-box;
  }
  .placeholder {
    height: 120rpx;
  }
  .tip-box {
    margin-top: 80rpx;
    &.small {
      margin-top: 0;
    }
    .count {
      margin: 0 6rpx;
      color: #f5862b;
    }
  }
  .prize-box {
    min-height: 140rpx;
    margin: 42rpx 25rpx;
    padding: 20rpx 20rpx 20rpx 15rpx;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    @include box;
    .prize-icon {
      @include wh(100rpx);
    }
    .prize-info {
      margin-left: 40rpx;
    }
    .tip {
      margin-top: 15rpx;
    }
  }
  .btn-group {
    position: absolute;
    bottom: 40rpx;
    @include h-cen;
    width: 100%;
  }
  .btn {
    @include lh(80rpx);
    @include round(40rpx);
    @include box;
    &.plain {
      color: #f5862b;
      border: 1px solid currentColor;
      background-color: #fff;
    }
    &.active {
      color: #fff;
      background-color: #f5862b;
    }
    &.w-360 {
      width: 360rpx;
    }
  }
}
/* #ifdef MP-CLOUDSHOP */
// 兼容云店
view {
  box-sizing: border-box;
}
image {
  display: block;
}
/* #endif */
</style>
