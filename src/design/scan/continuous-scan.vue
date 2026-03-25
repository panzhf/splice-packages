<template>
  <view>
    <view class="scan-qr-code" :style="containerStyle">
      <image
        size="1000"
        class="scan-qr-code__image"
        mode="widthFix"
        :src="imgUrl"
        @load="onImageLoaded"
        @click.native="handleOpenLink"
      />
      <!-- #ifdef H5 -->
      <view class="btn" v-html="wxTag" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
// #ifdef H5
import { formatPath } from 'packages/utils/utils'
// #endif
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    mpMapInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      imgUrl: '',
      windowWidth: 750,
      wxTag: '',
      height: 0
    }
  },
  computed: {
    // #ifdef H5
    infoView() {
      return {
        ...this.info,
        ...this.mpMapInfo,
        wxConfigReady: this.wxConfigReady
      }
    },
    // #endif
    mapPath() {
      return {
        /* #ifndef MP-RETAIL */
        appid: this.mpMapInfo.retailassistant ? this.mpMapInfo.retailassistant : '',
        /* #endif */
        path: '/scans/scan/index',
        scene: 'retailassistant'
      }
    },
    containerWidth() {
      // 间隙单位是px，转成rpx大概乘以2，两边间距再乘以2
      return this.windowWidth - (this.info.gap || 0) * 4
    },
    containerStyle() {
      let s = []
      s.push(`width: ${this.containerWidth}rpx`)
      s.push(`margin-top: ${(this.info.topGap || 0) * 2}rpx`)
      s.push(`height: ${this.height}rpx`)
      return s.join(';')
    },
    ratio() {
      let r = 1
      r = this.containerWidth / this.windowWidth
      return r
    }
  },
  watch: {
    info: {
      handler(val) {
        this.imgUrl = val.imgUrl
      },
      immediate: true,
      deep: true
    },
    // #ifdef H5
    infoView: {
      handler(val) {
        val && this.updateWxTag()
      },
      immediate: true,
      deep: true
    }
    // #endif
  },
  methods: {
    // #ifdef H5
    updateWxTag() {
      let imgSrc = this.imgUrl?.startsWith('//') ? 'https:' + this.imgUrl : this.imgUrl
      const path = formatPath(this.mapPath)
      this.wxTag = /*html*/ `<wx-open-launch-weapp appid="${this.mapPath.appid}" path="${path}" style="display:block;width: 100%;height: 100%;">
           <template type="text/wxtag-template">
            <style>.btn-icon,.img-icon{ display:block;width: 100%;}</style>
            <div class="btn-icon">
              <img src="${imgSrc}" class="img-icon">
            </div>
           <template>
        </wx-open-launch-weapp>
      `
    },
    // #endif
    handleOpenLink() {
      // #ifdef MP
      navigateToMP(this.mapPath)
      // #endif
    },
    onImageLoaded(e) {
      let w = e.detail.width
      let h = e.detail.height
      this.height = (this.containerWidth / w) * h
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'scan-qr-code';
.#{$prefix} {
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  margin-top: -0.5px;
  margin-bottom: -0.5px;
  min-height: 10rpx;
  .btn {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 8;
  }
  &__item {
    display: flex;
    overflow: hidden;
  }
  .#{$prefix}__image {
    display: block;
    width: 100%;
    margin: 0 auto;
    /* #ifdef H5 */
    display: none;
    /* #endif */
  }
}
</style>
