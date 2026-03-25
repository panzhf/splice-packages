<template>
  <view>
    <view class="adward-entrance" :style="containerStyle">
      <v-img
        v-if="imgUrl"
        size="1000"
        class="adward-entrance__image"
        mode="widthFix"
        :src="imgUrl"
        @load="onImageLoaded"
        @click.native="handleClick"
      />
      <!-- #ifdef MP-WEIXIN -->
      <auth-button v-if="needAuth" :mode="2" @success="handleClick()" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import { mapState } from 'vuex'
// #endif
export default {
  props: {
    imgData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      swiperHeight: '',
      activeIndex: 0,
      imgUrl: '',
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
    // #ifdef MP-WEIXIN
    ...mapState('scanAuth', ['needAuth'])
    // #endif
  },
  watch: {
    imgData: {
      handler(val) {
        this.imgUrl = val.imgUrl
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {},
  methods: {
    handleClick() {
      this.$emit('get-award')
    },
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
$prefix: 'adward-entrance';
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
}
</style>
