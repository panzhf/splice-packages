<template>
  <view class="ad-swiper">
    <swiper
      :autoplay="isAutoplay"
      class="ad-swiper__container"
      :style="{
        height: height + 'rpx'
      }"
      @change="onSwiperChanged"
    >
      <swiper-item v-for="(item, index) in list" :key="index">
        <view class="ad-swiper__image">
          <v-img
            size="1500"
            :src="item.ImgPath"
            mode="widthFix"
            :lazy-load="true"
            @click.native="handleClick(item)"
            @load="onImageLoaded"
          />
        </view>
      </swiper-item>
    </swiper>
    <view v-if="list.length > 1" class="ad-swiper__dots">{{ activeIndex }} / {{ list.length }}</view>
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
export default {
  name: 'AdSwiper',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isAutoplay: true,
      height: '750',
      activeIndex: 1,
      videoContext: {},
      imgCount: 0,
      widthList: []
    }
  },
  computed: {
    preivewUrls() {
      let urls = []
      this.list.map(item => {
        urls.push(item)
      })
      return urls
    }
  },
  methods: {
    handleplay() {
      this.isAutoplay = false
    },
    handlended() {
      this.isAutoplay = true
    },
    async handleClick(current) {
      // 跳转类型 0：H5（只在H5模板生效） 1:功能链接  2：活动链接  3：自定义链接  4：公众号文章
      /* #ifdef H5 */
      if (current.JumpType === 0) {
        location.href = current.Link
      }
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (current.JumpType === 1 || current.JumpType === 2) {
        uni.navigateTo({
          url: current.JumpType === 2 ? '/' + current.Link : current.Link
        })
        return
      }
      if (current.JumpType === 3) {
        if (current.MpAppID === '') {
          uni.navigateTo({
            url: current.Link
          })
        } else {
          await navigateToMP({
            appId: current.MpAppID,
            path: current.Link,
            onlyMp: true
          })
        }
        return
      }
      if (current.JumpType === 4) {
        await navigateToMP({
          path: current.Link,
          type: 7
        })
        return
      }
      /* #endif */
    },
    onSwiperChanged(e) {
      this.activeIndex = e.detail.current + 1
    },
    onImageLoaded(e) {
      this.imgCount++
      let winWid = 750 // 获取当前屏幕的宽度
      let imgh = e.detail.height // 图片高度
      let imgw = e.detail.width // 图片宽度
      let swiperH = (winWid * imgh) / imgw // 等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
      this.widthList.push(swiperH)
      if (this.list.length === this.imgCount) {
        let maxWidht = Math.max(...this.widthList)
        this.height = maxWidht
      }
    }
  }
}
</script>

<style lang="scss">
$prefix: 'ad-swiper';
.#{$prefix} {
  position: relative;
  // .#{$prefix}__container {
  //   max-height: 750rpx;
  // }
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
