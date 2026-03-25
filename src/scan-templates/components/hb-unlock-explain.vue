<template>
  <MaskLayer>
    <view class="pop" @touchmove.stop="() => {}">
      <view class="pop-header">
        <view class="pop-header-icon" />
        <view class="pop-header-text">{{ title }}</view>
      </view>
      <view class="pop-body">
        <view class="pop-body-process" :style="{ 'background-image': 'url(' + explainProcess + ')' }" />
        <scroll-view class="scroll-height" scroll-y>
          <view class="pop-body-content">
            <u-parse class="rich-text" :html="content" :tag-style="parseStyle" :show-with-animation="true" />
          </view>
        </scroll-view>
      </view>
      <view class="pop-body-close" @tap="$emit('close')" />
    </view>
  </MaskLayer>
</template>

<script>
import MaskLayer from './mask-layer.vue'
import { staticURL } from '@/config'
import { richText2Mixin } from 'packages/mixins/rich-text'

export default {
  components: {
    MaskLayer
  },
  mixins: [richText2Mixin],
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      explainProcess: staticURL() + 'my-voucher/explain-process.jpg'
    }
  }
}
</script>

<style lang="scss" scoped>
.pop {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 60rpx;
  width: 640rpx;
  border-radius: 10rpx;
  background-color: #fff;
  pointer-events: auto;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 53rpx;
    background-image: url(data:image/png;base64,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);
    background-size: 100% 100%;
    background-position: bottom;
    background-repeat: no-repeat;
  }
  .pop-header {
    position: relative;
    margin-left: auto;
    margin-right: auto;
    padding-top: 40rpx;
    width: 347rpx;
    font-size: 0;
    line-height: 1;
    vertical-align: middle;
    text-align: center;
    z-index: 1;
    .pop-header-icon {
      display: inline-block;
      width: 38rpx;
      height: 38rpx;
      vertical-align: middle;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAMAAACf4xmcAAAAe1BMVEUAAAD/Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px//Px/zrrRfAAAAKHRSTlMA++0Eb3KpzWYP1lzRMyYhC/L1Ui8YwH9OLfPq3a6gj0ATm4ZiTEkk9QUi+wAAAVlJREFUOMudlNeSgzAMReVKMeDQ03vR/3/hZoMZYxNCds8TzJwx6EoWOKy4TCghNJF8BRMsRIwDYrGAMYxT9KCc+VYW4BuCzLVuOb4lvw0tRXACoqy1tNbYW4Ihy/EDeWZq7P6+CCNwiMKiq6Orl+OLEEaE+IK/UjV51WMtMvn95iywY3O+Myfv+3mDHQIA+g4dtpjLcmEaV8oct4e+bwAVGp6PbYDFTj0ealdg0FYAaKiAW+2J5g1BJA3XAGA1AdJqHaeyPIEBDRISq1l8LQHqavWmBWCHmDkaBeKddsG9bsjVPY2MNOCE0CN4mv/RKE0lKl27GvVLaMyb8kqQXglpusc2vNZeIOKNptKUefFWrrZFO1bDZkHslqD1Do9aO6fFg0GCnuOFeV0Qg7E8fRjL74b86yszfwHX2V+u8/xysJTriS+W/1hc82vQEvlLNYIJVqJf0cJd0T9TNHDCNUr40AAAAABJRU5ErkJggg==);
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
    .pop-header-text {
      display: inline-block;
      margin-left: 10rpx;
      line-height: 1;
      vertical-align: middle;
      font-size: 34rpx;
      color: #000;
    }
  }
  .pop-body {
    margin-top: 50rpx;
    min-height: 300rpx;
    max-height: 550rpx;
    overflow-y: auto;
    .pop-body-process {
      margin-bottom: 40rpx;
      margin-left: auto;
      margin-right: auto;
      width: 570rpx;
      height: 220rpx;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
    .pop-body-content {
      padding-left: 50rpx;
      padding-right: 50rpx;
      font-size: 30rpx;
      color: #000;
      line-height: 50rpx;
      text-align: left;
      word-break: break-all;
      img {
        max-width: 100%;
      }
    }
  }
  .pop-body-close {
    position: absolute;
    bottom: -100rpx;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 60rpx;
    height: 60rpx;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAdVBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////li2ZAAAAAJnRSTlMAf6o65aZJ1IkmGQuRnpV2ZTXb+O3XzrOtk41gTDEgmujIg1YSB2qkdycAAAJoSURBVEjHpZfrcoMgEIWhGDRR4yXRXM2lTc77P2KHaLsRWKXT8yOZEb7ddRdhEZzSS6VPRXHS1SUVf1IlY4AUyyqU1EciiT/qAFQthtn7tSzP51Ku94OthZpBlwcY3Yvl6Glxh9FhOcXKLYBIdu5IJyMAW8knePdCV/7R1QvfMalXN2DToxy+AW7eNy+NWz1TCOO8dJ9/AWgfYkaPFsCXk2ZTCxEgU0kr6c8ayESQMqB+jp7kwE4Eagfko/oCcRoKpzEg3154i40SwVIbbOm1D2QqSBI4/FoCohUNMHY+aGAVAYqyTwCATz8LkOvfuureMVUCiZ+V4t21/pkurWmJw1oByZ9lUQPKnni0WNugAurhv3WnZl6W1PYeEzPg0uuJUIhqgM73ildPIKQOaIRIX78+OveEQWqAVFyAvWBoCsLVHriIiuw69IKMOFoDldCmyiztYanSWpyAUrA0v7+UwEkUwFlwNM+KM1BMwQsDf0zBJmyeNTQfNp+w3ICLnmYSxpYq77GeZkrFLZKrgcgIs0hSIPbYJYShYyB9/S49GzsBVx+97H1KoLBGjuPpaw9d9HmugLv1rdqTM5e+A9UQfcezFIr1Ocf9yLjSnzSRNyiBo2frlTZL9NXaet1N32IpIHfTd4+b2mIJsI6bfx50dMTqcFYPRyyZih6h7COyAt0BbSjc2i1IeqP8zbdDN6sFUQCywGYIytcAUmPJt6d8CxiraVbFVgNIBatDGtea6bmf+XzLnD/nmnXlCZia9blrQpt0o683aemaEHJBaeiC0tAFZVY6q+GozoIXv0qad7JJGKf/uQ5+A2APXUUIBFcPAAAAAElFTkSuQmCC);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    z-index: 1;
  }
  .scroll-height {
    margin-top: 30rpx;
    max-height: 290rpx;
  }
}
</style>
