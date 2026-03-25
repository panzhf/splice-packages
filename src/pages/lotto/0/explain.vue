<template>
  <view class="container">
    <image :src="PACKAGE_STATIC_URL + 'lottery/lotto/explain-bd-top.png'" mode="widthFix" />
    <image class="title-img" :src="PACKAGE_STATIC_URL + 'lottery/lotto/desc-title.png'" mode="widthFix" />
    <view class="content" :style="{ backgroundImage: `url(${PACKAGE_STATIC_URL}lottery/lotto/explain-bd-mid.png)` }">
      <u-parse class="rich-text" :html="htmlString" :tag-style="parseStyle" />
    </view>
    <image
      class="back-btn"
      :src="PACKAGE_STATIC_URL + 'lottery/lotto/back-home-btn.png'"
      mode="widthFix"
      @click="handleBackHome"
    />
    <image :src="PACKAGE_STATIC_URL + 'lottery/lotto/explain-bd-bottom.png'" mode="widthFix" />

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
  padding: 74rpx 50rpx 43rpx;
  background-color: #fff1c9;

  .title-img {
    position: absolute;
    top: 34rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    width: 320rpx;
  }

  .content {
    max-height: calc(100vh - 316rpx);
    padding: 20rpx 35rpx 28rpx;
    font-size: 26rpx;
    color: #a72615;
    overflow-y: auto;
    background-size: 100% 100%;
    background-repeat: repeat-y;
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

  .back-btn {
    position: fixed;
    bottom: 30rpx;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 260rpx;
    height: 68rpx;
    margin-top: 36rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #fedea3;
    background-size: 100%;
    background-repeat: no-repeat;
  }
}
</style>
