<template>
  <view class="image-cube">
    <view :class="['image-cube__container', `is-layout${imageData.Layout}`]">
      <view v-for="(item, index) in imageData.Images" :key="index" class="image-cube__item" @tap="handleOpenLink(item)">
        <v-img size="1000" class="image-cube__image" :src="item.ImageUrl" mode="widthFix" />
      </view>
    </view>
  </view>
</template>

<script>
import openLinkMixin from '@/mixins/open-link'
export default {
  mixins: [openLinkMixin],
  props: {
    imageData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      row: 1,
      column: 1
    }
  },
  computed: {
    grid() {
      if (this.imageData.Layout === 1) {
        return {
          row: 1,
          column: 1
        }
      }
      if (this.imageData.Layout === 2) {
        return {
          column: 2,
          row: 1
        }
      }
      if (this.imageData.Layout === 3) {
        return {
          row: 2,
          column: 2
        }
      }
      if (this.imageData.Layout === 4) {
        return {
          row: 2,
          column: 2
        }
      }
      return {
        row: 1,
        column: 1
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'image-cube';
.#{$prefix} {
  // padding-left: 30rpx;
  // padding-right: 30rpx;
  margin-top: -0.5px;
  .#{$prefix}__container {
    display: grid;
    align-items: flex-start;
    box-sizing: border-box;
    &.is-layout1 {
      width: 750rpx;
      // height: 750rpx;
      /* .image-cube__image,
      .image-cube__item {
        width: 100%;
        // height: 100%;
      } */
    }
    &.is-layout2 {
      width: 100%;
      grid-template-rows: repeat(2);
      grid-template-columns: repeat(2, 1fr);
      /* .image-cube__image,
      .image-cube__item {
        width: 376rpx;
        // height: 376rpx;
      } */
    }
    &.is-layout3 {
      width: 100%;
      grid-template-rows: repeat(2);
      grid-template-columns: repeat(2, 1fr);
      /* .image-cube__image,
      .image-cube__item {
        width: 376rpx;
        // height: 376rpx;
      } */
    }
    &.is-layout4 {
      grid-template-rows: repeat(2);
      grid-template-columns: repeat(2, 1fr);
      .#{$prefix}__item:first-child {
        grid-row-start: 1;
        grid-row-end: 3;
      }
      /* .image-cube__image {
        width: 100%;
        // height: 100%;
      }
      .image-cube__item:nth-child(1) {
        width: 376rpx;
        // height: 750rpx;
      }
      .image-cube__item:nth-child(2) {
        width: 376rpx;
        // height: 376rpx;
      }
      .image-cube__item:nth-child(3) {
        width: 376rpx;
        // height: 376rpx;
      } */
    }
    .#{$prefix}__item {
      display: inline-block;
    }
    .#{$prefix}__image {
      width: 100%;
      // height: 100%;
      // object-fit: fill;
      vertical-align: middle;
      box-sizing: border-box;
    }
  }
}
</style>
