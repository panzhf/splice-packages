<template>
  <view class="container">
    <view style="position: relative">
      <view class="title-desc">活动说明</view>
      <image :src="PACKAGE_STATIC_URL + 'lottery/sdjc/activity-img.png'" mode="widthFix" />
    </view>
    <view class="content">
      <u-parse :html="htmlString" :tag-style="parseStyle" />
    </view>

    <!-- #ifdef H5 -->
    <!-- 关注公众号 -->
    <md-follow-gzh />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import richTextMixin from 'packages/mixins/rich-text'
export default {
  mixins: [packageStaticMixin, richTextMixin],
  data() {
    return {
      htmlString: '', // 富文本内容
      parseStyle: {
        th: 'border: 1px solid #333',
        td: 'border: 1px solid #333'
      }
    }
  },
  onLoad() {
    this.htmlString = uni.getStorageSync('Rule')
  },
  onReady() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100vh;
  padding: 20rpx 50rpx 56rpx;
  background: linear-gradient(0deg, rgba(255, 225, 158, 1) 43%, #ff6136 100%);

  .content {
    max-height: calc(100vh - 300rpx);
    padding: 47rpx 24rpx 28rpx;
    font-size: 26rpx;
    color: #333333;
    overflow-y: auto;
    background: #ffffff;
    border-radius: 0px 0px 10rpx 10rpx;
    box-shadow: 0px 0px 30rpx 0px #ffe4ad inset;
  }

  .explain-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .rich-text {
    word-break: break-all;
    white-space: pre-wrap;
  }
  .title-desc {
    position: absolute;
    bottom: 12%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    width: 272rpx;
    text-align: center;
    font-weight: 800;
    letter-spacing: -1px;
    color: #ac510a;
  }
}
</style>
