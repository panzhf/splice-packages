<template>
  <view class="combine-carousel">
    <v-img
      v-if="info.images.length === 1"
      size="1000"
      class="image-ad__image"
      mode="widthFix"
      :src="info.images[0].ImageUrl"
      @load="onImageLoaded"
      @click.native="handleOpenLink(info.images[0])"
    />
    <swiper v-else :autoplay="autoplay" :circular="true" :style="{ height: swiperHeight }" @change="onSwiperChanged">
      <swiper-item v-for="(item, index) in info.images" :key="index" class="image-ad__item">
        <view class="image-ad__img-wrap">
          <v-img
            size="1000"
            class="image-ad__image"
            mode="widthFix"
            :src="item.ImageUrl"
            :index="index"
            @load="onImageLoaded"
            @click.native="handleOpenLink(item)"
          />
        </view>
      </swiper-item>
    </swiper>
    <view v-if="info.images.length > 1" class="custom-pagination" :class="info.position">
      <label
        v-for="(item, index) in info.images"
        :key="index"
        class="pagination-bullet"
        :class="{ active: activeIndex === index }"
        :style="{ backgroundColor: activeIndex === index ? info.indicatorColor : '#fff' }"
      />
    </view>
    <view class="picture-cube flex flex-between">
      <view v-for="(item, index) in info.subImages" :key="index" class="picture-cube__item flex-1">
        <v-img size="700" :src="item.ImageUrl" alt="" @click.native="handleOpenLink(item)" />
      </view>
    </view>
  </view>
</template>

<script>
import openLinkMixin from '@/mixins/open-link'
export default {
  name: 'CombineCarousel',
  mixins: [openLinkMixin],
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      swiperHeight: '',
      autoplay: false,
      activeIndex: 0,
      imgHeight: []
    }
  },
  watch: {
    'info.images': {
      immediate: true,
      deep: true,
      handler(v) {
        this.activeIndex = 0
        this.autoplay = v.length > 1
      }
    }
  },
  methods: {
    onSwiperChanged(e) {
      this.activeIndex = e.detail.current
    },
    onImageLoaded(e) {
      const r = e.detail.width / e.detail.height
      const h = w => Math.ceil(w / r)
      this.imgHeight[e.target.dataset.id] = h(750)
      this.imgHeight.length > 0 && (this.swiperHeight = Math.max(...this.imgHeight) + 'rpx')
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: combine-carousel;
.#{$prefix} {
  position: relative;
  margin-top: -0.5px;
  margin-bottom: -0.5px;
  .custom-pagination {
    position: absolute;
    bottom: 320rpx;
    left: 0;
    right: 0;
    height: 10rpx;
    padding: 0 30rpx;
    z-index: 1;
    font-size: 0;
    &.left {
      text-align: left;
    }
    &.center {
      text-align: center;
    }
    &.right {
      text-align: right;
    }
    .pagination-bullet {
      display: inline-block;
      margin: 0 6rpx;
      width: 10rpx;
      height: 10rpx;
      border-radius: 20rpx;
      &.active {
        width: 24rpx;
      }
    }
  }
  .picture-cube {
    position: absolute;
    right: 30rpx;
    bottom: 20rpx;
    left: 30rpx;
    height: 280rpx;
    z-index: 2;
    ::v-deep {
      .img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
