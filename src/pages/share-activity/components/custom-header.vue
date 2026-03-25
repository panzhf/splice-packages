<template>
  <view class="custom-header bg-white">
    <image :src="PACKAGE_STATIC_URL + 'share-activity/title-bg.png'" class="bg" />
    <view class="title fw-bold text-center fs-28">{{ title }}</view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  name: 'CustomHeader',
  mixins: [packageStaticMixin],
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: custom-header;
.#{$prefix} {
  position: relative;
  .bg {
    position: absolute;
    @include wh(285rpx, 22rpx);
    @include hv-cen;
  }
  .title {
    position: relative;
  }
}
</style>
