<template>
  <view class="product-swiper">
    <swiper
      :autoplay="isAutoplay"
      class="product-swiper__container"
      :style="{
        height: height
      }"
      @change="onSwiperChanged"
    >
      <swiper-item v-if="videoUrl">
        <view class="product-swiper__image">
          <video
            id="myVideo"
            :src="'https:' + videoUrl"
            style="width: 100%; height: 100%; border-radius: 5px"
            @play="handleplay"
            @ended="handlended"
          />
        </view>
      </swiper-item>
      <swiper-item v-for="(item, index) in list" :key="index">
        <view class="product-swiper__image">
          <v-img
            size="1500"
            :src="item"
            mode="aspectFit"
            :lazy-load="true"
            @click.native="handlePreview(item)"
            @load="onImageLoaded"
          />
        </view>
      </swiper-item>
    </swiper>
    <view v-if="list.length > 1" class="product-swiper__dots">
      {{ activeIndex }} / {{ videoUrl ? list.length + 1 : list.length }}
    </view>
  </view>
</template>

<script>
import { previewImage } from 'packages/utils'
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    videoUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isAutoplay: true,
      height: '750rpx',
      activeIndex: 1,
      videoContext: {}
    }
  },
  methods: {
    handleplay() {
      this.isAutoplay = false
    },
    handlended() {
      this.isAutoplay = true
    },
    onSwiperChanged(e) {
      this.activeIndex = e.detail.current + 1
      if (this.videoUrl) {
        this.videoContext = wx.createVideoContext('myVideo', this)
        this.videoContext.pause()
      }
    },
    onImageLoaded(e) {
      let winWid = 750 // 获取当前屏幕的宽度
      let imgh = e.detail.height // 图片高度
      let imgw = e.detail.width // 图片宽度
      let swiperH = (winWid * imgh) / imgw + 'rpx' // 等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
      // 多张图片取最大的高度
      if (parseInt(this.height) < parseInt(swiperH)) {
        this.height = swiperH
      } 
    },
    handlePreview(item) {
      previewImage({
        current: item,
        urls: this.list
      })
    }
  }
}
</script>

<style lang="scss">
$prefix: 'product-swiper';
.#{$prefix} {
  position: relative;
  .#{$prefix}__container {
    max-height: 750rpx;
  }
  .#{$prefix}__image {
    width: 100%;
    height: 100%;
    vertical-align: middle;
    image {
      width: 100%;
      height: 100%;
    }
  }
  .#{$prefix}__dots {
    position: absolute;
    right: 30rpx;
    bottom: 20rpx;
    padding: 6rpx 12rpx;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 18rpx;
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.5);
    z-index: 1;
  }
}
</style>
