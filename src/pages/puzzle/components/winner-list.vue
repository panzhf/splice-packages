<template>
  <view class="win-list flex flex-middle">
    <view class="title shrink-0 fs-24">{{ tip }}</view>
    <view v-if="content" class="notice-wrapper">
      <uni-notice-bar
        single
        :text="content"
        :speed="70"
        background-color="transparent"
        color="#ffdcab"
        :scrollable="true"
      />
    </view>
  </view>
</template>

<script>
import UniNoticeBar from './uni-notice-bar.vue'
export default {
  name: 'WinnerList',
  components: {
    UniNoticeBar
  },
  props: {
    tip: {
      type: String,
      default: '获奖名单'
    },
    content: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: win-list;
$color1: #ffdcab;
.#{$prefix} {
  @include box();
  height: 60rpx;
  margin: 0 40rpx 30rpx;

  border-top: 1px solid $color1;
  border-bottom: 1px solid $color1;
  .title {
    position: relative;

    padding-right: 20rpx;

    color: $color1;
    &::after {
      position: absolute;
      top: 50%;
      right: 0;

      height: 20rpx;

      content: '';
      transform: translateY(-50%);

      border-right: 1px solid currentColor;
    }
  }
  .notice-wrapper {
    width: 512rpx;
  }
}
</style>
