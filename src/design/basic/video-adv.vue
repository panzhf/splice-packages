<template>
  <view v-if="videoData.VideoUrl">
    <view :class="['image-ad', videoData.layout === 'gap' ? 'gap' : '']">
      <video object-fit="fill" :src="videoSrc" :poster="videoCover" style="width: 100%; vertical-align: middle" />
    </view>
  </view>
</template>

<script>
import imgMixin from 'packages/mixins/img'
export default {
  mixins: [imgMixin],
  props: {
    videoData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    videoSrc() {
      return this.formatImg(this.videoData.VideoUrl)
    },
    videoCover() {
      return this.formatImg(this.videoData.VideoCover)
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'image-ad';
.#{$prefix} {
  position: relative;
}
.gap {
  padding: 0 10px;
}
</style>
