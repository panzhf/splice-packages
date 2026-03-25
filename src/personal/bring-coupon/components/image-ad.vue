<template>
  <view class="image-ad">
    <view v-if="value.length === 1" class="poster-box">
      <image mode="widthFix" class="poster" :src="value[0].imageurl" />
    </view>
    <swiper
      v-if="value.length > 1"
      class="swiper"
      :style="{ height: swiperHeight }"
      :indicator-dots="true"
      :interval="3000"
      :autoplay="true"
    >
      <view v-for="(item, index) in value" :key="index">
        <swiper-item>
          <view class="poster-box">
            <image mode="widthFix" class="poster" :src="item.imageurl" :data-id="index" @load="onImageLoaded" />
          </view>
        </swiper-item>
      </view>
    </swiper>
  </view>
</template>

<script>
export default {
  name: 'ImageAd',
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      swiperHeight: '',
      imgHeight: []
    }
  },
  methods: {
    onImageLoaded(e) {
      const r = e.detail.width / e.detail.height
      const h = w => Math.ceil(w / r)
      this.imgHeight[e.target.dataset.id] = h(750)
      this.imgHeight.length > 0 && (this.swiperHeight = Math.max(...this.imgHeight) + 'rpx')
    }
  }
}
</script>
