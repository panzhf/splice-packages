<template>
  <u-mask
    :show="showDialog"
    :zoom="false"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    z-index="100"
    @click="close"
  >
    <view class="rule-dialog flex flex-column flex-middle flex-center" @tap.stop="() => {}">
      <view class="rule-container overflow-h">
        <view class="header">
          <image :src="PACKAGE_STATIC_URL + 'photo-sign/diaolog-bg.png'" class="bg" />
          <image :src="title" class="title" />
        </view>
        <scroll-view class="scroll-box" scroll-y>
          <view class="content fs-28">
            <image v-if="mode === 1" :src="content" mode="widthFix" class="img" />
            <view v-if="mode === 2" class="text">
              <view>1、排行榜每日0点刷新数据</view>
              <view>2、拍照打卡次数越多排名越靠前。相同次数排名以最后一次打卡时间为准，先打卡的排名越靠前。</view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2" @tap.stop="close" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  name: 'RuleDialog',
  mixins: [dialogMixin, packageStaticMixin],
  props: {
    content: {
      type: String,
      default: '' // 在mode为1时使用
    },
    mode: {
      type: Number,
      default: 1 // 1.拍照规则 2.上榜规则
    }
  },
  computed: {
    title() {
      const o = {
        1: `${this.PACKAGE_STATIC_URL}photo-sign/photo-rule.png`,
        2: `${this.PACKAGE_STATIC_URL}photo-sign/rank-rule.png`
      }
      return o[this.mode]
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: rule-dialog;
.#{$prefix} {
  position: fixed;
  @include hv-cen;
  .rule-container {
    width: 580rpx;
    @include round(0 0 30rpx 30rpx);
  }
  .header {
    position: relative;
    @include wh(100%, 75rpx);
    .bg {
      display: block;
      @include wh(100%, 76rpx);
    }
    .title {
      position: absolute;
      top: 25rpx;
      @include h-cen;
      @include wh(134rpx, 25rpx);
    }
  }
  .scroll-box {
    width: 100%;
    min-height: 336rpx;
    max-height: 640rpx;
    border: 2px solid;
    border-top: 0;
    border-image: linear-gradient(0deg, #ffffff, #fec785) 10 10;
    background: linear-gradient(0deg, #ffffff 0%, #fffce7 100%);
    @include round(0 0 30rpx 30rpx);
    @include box;
  }
  .content {
    padding: 40rpx 60rpx;
    .img {
      width: 100%;
    }
    .text {
      color: #333;
      line-height: 48rpx;
    }
  }
  .close-btn {
    margin-top: 60rpx;
    color: #fff;
    .iconfont {
      font-size: 60rpx;
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
