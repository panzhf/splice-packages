<template>
  <view
    :class="['custom-content']"
    :style="{
      'background-color': value.BgColor ? value.BgColor : '#fff',
      padding: value.IsFullScreen ? '20rpx 0px' : '20rpx 20rpx'
    }"
  >
    <u-parse class="rich-text" :html="value.QuillText" :tag-style="parseStyle" />
  </view>
</template>

<script>
import richTextMixin from 'packages/mixins/rich-text'
export default {
  mixins: [richTextMixin],
  props: {
    value: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: custom-content;
.#{$prefix} {
  background-color: #fff;
  .rich-text {
    word-break: break-all;
  }
}
</style>
