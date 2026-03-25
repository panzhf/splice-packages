<template>
  <view :style="{ backgroundColor: imgData.bgColor || 'transparent' }">
    <view
      class="image-ad"
      :style="containerStyle"
      :class="{ bottom: imgData.Mode === 'swiper' && imgData.Position === 'bottom' }"
    >
      <template v-if="imgData.Mode === 'slide-small' || imgData.Mode === 'slide-mini'">
        <view class="slide-small">
          <view v-for="(item, index) in imgList" :key="index" class="img-box" :style="{ width: itemWidth }">
            <image class="img" mode="widthFix" :src="item.ImageUrl" @click="handleOpenLink(item)" />
          </view>
        </view>
      </template>
      <template v-else>
        <v-img
          v-if="imgList.length === 1"
          size="1000"
          class="image-ad__image"
          mode="widthFix"
          :src="imgList[0].ImageUrl"
          @load="onImageLoaded"
          @click.native="handleOpenLink(imgList[0])"
        />
        <template v-else>
          <!-- 轮播大图卡片式 -->
          <swiper
            v-if="imgData.Mode === 'swiper' && imgData.Style === 'large'"
            :autoplay="autoplay"
            :circular="true"
            :previous-margin="swiperMargin"
            :next-margin="swiperMargin"
            :style="{ height: swiperHeight }"
            @change="onSwiperChanged"
          >
            <swiper-item v-for="(item, index) in imgList" :key="index" class="image-ad__item">
              <view class="image-ad__img-wrap" :style="{ margin: effect && activeIndex !== index ? '0 10rpx' : 0 }">
                <v-img
                  size="1000"
                  class="image-ad__image"
                  mode="widthFix"
                  :src="item.ImageUrl"
                  :style="{ width: swiperLargeWidth + 'rpx' }"
                  :index="index"
                  @load="onImageLoaded"
                  @click.native="handleOpenLink(item)"
                />
              </view>
            </swiper-item>
          </swiper>
          <!-- 轮播小图卡片式 -->
          <swiper
            v-else-if="imgData.Mode === 'swiper' && imgData.Style === 'small'"
            :autoplay="autoplay"
            :circular="true"
            :previous-margin="swiperMargin"
            :next-margin="swiperMargin"
            :style="{ height: swiperHeight }"
            @change="onSwiperChanged"
          >
            <swiper-item v-for="(item, index) in imgList" :key="index" class="image-ad__item">
              <view class="image-ad__img-wrap" :style="{ margin: effect && activeIndex !== index ? '0 10rpx' : 0 }">
                <v-img
                  size="1000"
                  class="image-ad__image"
                  mode="widthFix"
                  :src="item.ImageUrl"
                  :style="{ width: swiperSmallWidth + 'rpx' }"
                  :index="index"
                  @load="onImageLoaded"
                  @click.native="handleOpenLink(item)"
                />
              </view>
            </swiper-item>
          </swiper>
          <!-- 轮播平铺 或 大图滑动 -->
          <swiper
            v-else
            :autoplay="autoplay"
            :circular="true"
            :style="{ height: swiperHeight }"
            @change="onSwiperChanged"
          >
            <swiper-item v-for="(item, index) in imgList" :key="index" class="image-ad__item">
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
        </template>
      </template>
      <!-- pagination -->
      <template v-if="imgData.Mode === 'swiper'">
        <view
          v-if="imgList.length > 1"
          class="image-ad__dots"
          :class="{ bottom: imgData.Position === 'bottom' }"
          :style="{ height: imgData.indicatorSize * 2 + 'rpx' }"
        >
          <view
            v-for="(item, index) in imgList"
            :key="index"
            class="image-ad__dot"
            :class="{ 'is-active': activeIndex === index }"
            :style="{
              width: activeIndex === index ? imgData.indicatorSize * 2 + 'rpx' : imgData.indicatorSize * 2 + 'rpx',
              height: imgData.indicatorSize * 2 + 'rpx',
              backgroundColor: activeIndex === index ? imgData.indicatorColor : '#000'
            }"
          />
        </view>
      </template>
    </view>
  </view>
</template>

<script>
import openLinkMixin from '@/mixins/open-link'
export default {
  mixins: [openLinkMixin],
  props: {
    imgData: {
      type: Object,
      default() {
        return {}
      }
    }
    // ratio: {
    //   type: Number,
    //   default: 1 // 缩放比例
    // }
  },
  data() {
    return {
      swiperHeight: '',
      activeIndex: 0,
      autoplay: false,
      swiperMargin: '0rpx', // 卡片式轮播间距
      effect: false, // 卡片式轮播标识
      itemWidth: 'calc(750rpx / 3)',
      imgList: [],
      imgHeight: [],
      windowWidth: 750
    }
  },
  computed: {
    containerWidth() {
      // 间隙单位是px，转成rpx大概乘以2，两边间距再乘以2
      return this.windowWidth - (this.imgData.gap || 0) * 4
    },
    containerStyle() {
      let s = []
      s.push(`width: ${this.containerWidth}rpx`)
      s.push(`border-radius: ${(this.imgData.radius || 0) * 2}rpx`)
      return s.join(';')
    },
    ratio() {
      let r = 1
      r = this.containerWidth / this.windowWidth
      return r
    },
    swiperLargeWidth() {
      return Math.floor(this.ratio * 580)
    },
    swiperSmallWidth() {
      return Math.floor(this.ratio * 480)
    }
  },
  watch: {
    imgData: {
      handler(val) {
        if (val.Images.length > 1) {
          this.activeIndex = 0
          if (val.Mode === 'slide') {
            this.autoplay = false
            this.effect = false
          } else if (val.Mode === 'slide-small') {
            // 导航小图滑动
            // 三图时稍微加一点宽度防止个别机型因计算结果有小数出现间隙
            this.itemWidth = val.SmallHalf
              ? `${this.ratio * 224}rpx`
              : `calc(${Math.ceil((this.ratio * 750) / 3)}rpx + 2rpx)`
          } else if (val.Mode === 'slide-mini') {
            // 导航横向滑动
            this.itemWidth = val.MiniHalf
              ? `${this.ratio * 172}rpx`
              : `calc(${Math.ceil((this.ratio * 750) / 4)}rpx + 2rpx)`
          } else {
            this.autoplay = true
            // 卡片式增加间距，前后轮播图露出一部分
            // (750-580)/2-20=65
            // (750-480)/2-20=115
            this.swiperMargin = val.Style === 'large' ? `65rpx` : val.Style === 'small' ? `115rpx` : '0rpx'
            this.effect = val.Style === 'large' || val.Style === 'small'
          }
        }
        this.imgList = val.Images
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // try {
    //   const res = uni.getSystemInfoSync()
    //   this.windowWidth = res.windowWidth
    //   // eslint-disable-next-line no-empty
    // } catch (error) {}
  },
  methods: {
    onSwiperChanged(e) {
      this.activeIndex = e.detail.current
    },
    onImageLoaded(e) {
      const r = e.detail.width / e.detail.height
      const h = w => Math.ceil((w * this.ratio) / r)
      /* this.height_flat = h(750) + 'rpx'
        this.height_large = h(580) + 'rpx' // 卡片大图激活项宽度580
        this.height_small = h(480) + 'rpx' // 卡片小图激活项宽度480 */
      this.imgHeight[e.target.dataset.id] = h(
        this.imgData.Style === 'large' ? 580 : this.imgData.Style === 'small' ? 480 : 750
      )
      this.imgHeight.length > 0 && (this.swiperHeight = Math.max(...this.imgHeight) + 'rpx')
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'image-ad';
.#{$prefix} {
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  margin-top: -0.5px;
  margin-bottom: -0.5px;
  &__item {
    display: flex;
    overflow: hidden;
  }
  &__img-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    /* transition: all 0.5s; */
    overflow: hidden;
    box-sizing: content-box;
  }
  .#{$prefix}__image {
    display: block;
    width: 100%;
    margin: 0 auto;
    /* will-change: transform; */
    /* vertical-align: middle; */
  }
  /* &.bottom {
    padding-top: 6rpx;
  } */
  .#{$prefix}__dots {
    position: absolute;
    z-index: 100;
    bottom: 10rpx;
    left: 0;
    width: 100%;
    text-align: right;
    font-size: 0;
    &.bottom {
      position: relative;
      text-align: center;
      padding-top: 44rpx;
      padding-bottom: 15rpx;
      transform: translateY(-5rpx);
      .#{$prefix}__dot {
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .#{$prefix}__dot {
      display: inline-block;
      margin: 0 6rpx;
      width: 8rpx;
      height: 8rpx;
      border-radius: 20rpx;
      background-color: #000;
      opacity: 0.2;
      &.is-active {
        width: 16rpx;
        background-color: #ff4b40;
        opacity: 1;
      }
      &:last-child {
        margin-right: 20rpx;
      }
    }
  }
  .slide-small {
    white-space: nowrap;
    overflow-x: scroll;
    font-size: 0;
    .img-box {
      display: inline-block;
    }
    .img {
      width: 100%;
      vertical-align: middle;
    }
  }
}
</style>
