<template>
  <view class="announce-notice" :style="wrapperStyle" @tap="handleOpenLink(noticeData)">
    <view :class="['announce-notice__icon', 'iconfont', noticeData.Logo]" />
    <view class="announce-notice__content">
      <UniNoticeBar
        v-if="noticeData.Content"
        :scrollable="noticeData.Style === 'scroll'"
        :single="noticeData.Style === 'scroll'"
        background-color="transparent"
        :color="noticeData.TextColor"
        :text="noticeData.Content"
      />
    </view>
  </view>
</template>

<script>
import { UniNoticeBar } from '@dcloudio/uni-ui'
import openLinkMixin from '@/mixins/open-link'
export default {
  components: {
    UniNoticeBar
  },
  mixins: [openLinkMixin],
  props: {
    noticeData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    wrapperStyle() {
      let s = []
      s.push(`background-color: ${this.noticeData.BgColor}`)
      s.push(`margin: 0 ${this.noticeData.Gap * 2}rpx`)
      s.push(`border-radius: ${this.noticeData.radius * 2}rpx`)
      return s.join(';')
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'announce-notice';
.#{$prefix} {
  display: flex;
  align-items: center;
  margin-top: -0.5px;
  // margin-left: 15px;
  // margin-right: 15px;
  padding: 8px 12px;
  // border-radius: 10px;
  background-color: #fff;
  overflow: hidden;
  &.is-scroll {
    .#{$prefix}__text {
      white-space: nowrap;
      word-break: keep-all;
    }
  }
  .#{$prefix}__icon {
    &.icongonggaotubiao {
      color: #ff4b40;
    }
    &.icongonggao2 {
      color: #ff7640;
    }
    &.icongonggao3 {
      color: #2c94ff;
    }
    &.icongonggao4 {
      color: #b50003;
    }
  }
  .#{$prefix}__content {
    margin-left: 10px;
    flex: 1;
    overflow: hidden;
  }
}
</style>


