<template>
  <view class="container">
    <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/explain-bd-top.png'" mode="widthFix" />
    <view class="content" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/explain-bd-mid.png)` }">
      <u-parse class="rich-text" :html="htmlString" :tag-style="parseStyle" />
    </view>
    <image :src="PACKAGE_STATIC_URL + 'lottery/bnht/explain-bd-bottom.png'" mode="widthFix" />

    <view
      class="back-btn"
      :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/bnht/btn-bg.png)` }"
      @click="handleBackHome"
    >
      返回首页
    </view>

    <image class="explain-bottom" :src="PACKAGE_STATIC_URL + 'lottery/bnht/explain-bottom.png'" mode="widthFix" />
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
      aid: '', // 活动id
      m: '', // 品牌商编号
      htmlString: '' // 富文本内容
    }
  },
  onLoad(option) {
    /* #ifdef H5 */
    this.aid = this.$route.query.aid
    this.m = this.$route.query.memberlogin
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.aid = option.aid
    this.m = option.memberlogin
    /* #endif */
    this.htmlString = uni.getStorageSync('Rule')
  },
  onReady() {},
  methods: {
    // 返回首页
    handleBackHome() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100vh;
  padding: 50rpx 50rpx 56rpx;
  background-image: linear-gradient(#ff4348, #ff3131);

  .content {
    max-height: calc(100vh - 400rpx);
    padding: 0 24rpx 2rpx;
    font-size: 26rpx;
    color: #ffe497;
    background-size: 100%;
    background-repeat: repeat-y;
    overflow-y: auto;
  }

  .back-btn {
    position: fixed;
    bottom: 56rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 291rpx;
    height: 74rpx;
    margin-top: 36rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #fedea3;
    background-size: 100% 100%;
    background-repeat: no-repeat;
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
}
</style>
