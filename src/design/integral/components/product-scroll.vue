<template>
  <view>
    <view class="page-section-spacing" :class="['product-card', { 'is-three': radio == 1, 'is-four': radio == 2 }]">
      <scroll-view class="scroll-view_H" :show-scrollbar="false" :scroll-x="true">
        <view
          v-for="(item, index) in list"
          :id="item.goodsid"
          :key="index"
          :class="['scroll-view-item']"
          @tap="handleOpenDetail(item.goodsid)"
        >
          <view class="img">
            <image mode="aspectFit" :lazy-load="true" :src="item.picurl" />
          </view>

          <view class="goods-price">
            <!-- #ifdef MP -->
            <template v-if="item.hgway === 1">
              {{ item.points }}积分 +
              <br />
              <v-price :price="item.price" double show-sign mode="swiper" style="display: inline-block"></v-price>
            </template>
            <template v-if="item.hgway === 0">{{ item.points }}积分</template>
            <!-- #endif -->
            <!-- #ifdef H5-DECORATE -->
            <template v-if="item.hgway === 2">
              {{ item.points }}积分 +
              <br />
              <v-price :price="item.price" double show-sign mode="swiper" style="display: inline-block"></v-price>
            </template>
            <template v-if="item.hgway === 1">{{ item.points }}积分</template>
            <!-- #endif -->
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script>
import VPrice from '../../../components/price/price.vue'
export default {
  components: {
    VPrice
  },
  props: {
    layout: {
      type: String,
      default: 'list'
    },
    radio: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  methods: {
    handleOpenDetail(id) {
      /* #ifdef MP */
      uni.navigateTo({
        url: '/packages/src/integral/detail?id=' + id
      })
      /* #endif */
    }
  }
}
</script>
<style lang="scss">
.gray-color4 {
  color: #444;
}
.scroll-view_H {
  white-space: nowrap;
  .scroll-view-item {
    font-size: 0;
    background-color: #fff;
    .goods-price {
      font-size: 30rpx;
      color: $price-color;
      text-align: center;
    }
  }
  .text {
    font-size: 30rpx;
    color: $price-color;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    word-break: break-all;
  }
}
.is-three {
  .scroll-view_H {
    display: flex;
    overflow-x: scroll;
    padding-bottom: 0;
    .scroll-view-item {
      // display: inline-block;
      display: inline-grid;
      text-align: center;
      width: 214rpx;
      margin-right: 20rpx;
      // margin-bottom: 10rpx;
      padding: 0;
      padding-bottom: 8rpx;
      box-sizing: border-box;
      background-color: #fff;
      border-radius: 5rpx;

      .img {
        height: 214rpx;
        width: 214rpx;
        position: relative;
        display: inline-block;
        overflow: hidden;

        image {
          object-fit: contain;
          vertical-align: top;
          // display: block;
          width: 100%;
          height: 100%;
        }
      }
    }
    .text {
      padding: 20rpx;
    }
  }
}
.is-four {
  .scroll-view_H {
    .scroll-view-item {
      display: inline-grid;
      width: 164rpx;
      margin-right: 8rpx;
      image {
        display: block;
        width: 100%;
        height: 164rpx;
        /* height: 100%; */
      }
    }
    .text {
      padding: 20rpx 0;
    }
  }
}
</style>
