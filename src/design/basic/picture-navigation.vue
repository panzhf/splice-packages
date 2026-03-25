<template>
  <view :class="['picture-navigation']" :style="wrapperStyle">
    <view
      v-for="(item, index) in navData.Images"
      :key="index"
      class="picture-navigation__item"
      @tap="handleOpenLink(item)"
    >
      <view
        :class="['picture-navigation__icon', navData.IsMask ? 'is-round' : '']"
        :style="{ width: `${imgSize}`, height: `${imgSize}` }"
      >
        <!-- <view class="picture-navigation__icon"> -->
        <v-img :src="item.ImageUrl" alt="" size="120" mode="scaleToFill" />
      </view>
      <view class="picture-navigation__name" :style="{ color: navData.textColor || '#333' }">
        {{ item.Name }}
      </view>
    </view>
  </view>
</template>

<script>
import openLinkMixin from '@/mixins/open-link'
export default {
  mixins: [openLinkMixin],
  props: {
    navData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    wrapperStyle() {
      let s = []
      s.push(`background-color: ${this.navData.BgColor}`)
      if (this.navData.gap) {
        s.push(`margin: 0 ${this.navData.gap * 2}rpx`)
      }
      if (this.navData.radius) {
        s.push(`border-radius: ${this.navData.radius * 2}rpx`)
      }
      return s.join(';')
    },
    imgSize() {
      let val = this.navData.size || 50
      let size = ((68 / 50) * val).toFixed(0)
      return size + 'rpx'
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'picture-navigation';
// .is-mask {
//   border-radius: 20px;
// }
.is-round {
  border-radius: 50%;
}
.#{$prefix} {
  display: flex;
  // margin-left: 30rpx;
  // margin-right: 30rpx;
  padding-top: 32rpx;
  padding-bottom: 36rpx;
  // border-radius: 20rpx;
  // background-color: #fff;
  &.is-gap {
    .#{$prefix}__item {
      padding-left: 20rpx;
      padding-right: 20rpx;
    }
  }
  .#{$prefix}__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    .#{$prefix}__icon {
      position: relative;
      width: 68rpx;
      height: 68rpx;
      overflow: hidden;
      // img {
      //   position: absolute;
      //   top: 0;
      //   right: 0;
      //   bottom: 0;
      //   left: 0;
      //   margin: auto;
      //   max-width: 100%;
      //   max-height: 100%;
      //   vertical-align: middle;
      //   z-index: 1;
      // }
    }
    .#{$prefix}__name {
      margin-top: 18rpx;
      text-align: center;
      font-size: 26rpx;
      // color: #333;
    }
  }
}
</style>
