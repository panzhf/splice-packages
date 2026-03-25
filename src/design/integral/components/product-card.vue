<template>
  <view
    :class="[
      'product-card',
      {
        'is-list': layout === 'list',
        'is-grid': layout === 'grid',
        'is-largest': layout === 'largest',
        'is-three': layout === 'three',
        'is-four': layout === 'four'
      }
    ]"
    @click="handleClick"
  >
    <view class="image">
      <!-- #ifdef MP -->
      <text v-if="row.issaleout" class="iconfont sell iconyiduiwan" />
      <v-img size="1500" mode="aspectFit" :lazy-load="true" :src="image" />
      <!-- #endif -->
      <!-- #ifdef H5-DECORATE -->
      <image :src="image" mode="aspectFit" />
      <!-- #endif -->
    </view>
    <view class="info" style="overflow: hidden">
      <view class="name">
        <view class="ellipsis">{{ goodsName }}</view>
      </view>
      <view class="bottom">
        <view class="price-wrap">
          <!-- #ifdef MP -->
          <template v-if="hgway === 1">
            {{ points }}积分 +
            <v-price :price="price" double show-sign mode="swiper" style="display: inline-block" />
          </template>
          <template v-if="hgway === 0">{{ points }}积分</template>
          <!-- #endif -->
          <!-- #ifdef H5-DECORATE -->
          <template v-if="hgway === 2">
            {{ points }}积分 +
            <v-price :price="price" double show-sign mode="swiper" style="display: inline-block" />
          </template>
          <template v-if="hgway === 1">{{ points }}积分</template>
          <!-- #endif -->
        </view>
      </view>
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
    image: {
      type: String,
      default: ''
    },
    goodsName: {
      type: String,
      default: ''
    },
    price: {
      type: [String, Number],
      default: ''
    },
    points: {
      type: Number,
      default: 0
    },
    hgway: {
      type: Number,
      default: 0
    },
    row: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss">
.product-card {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  border-radius: 10rpx;
  background-color: #fff;
  position: relative;

  .identifying {
    position: absolute;
    background: #ffb634;
    border-radius: 10rpx 0rpx 10rpx 0px;
    font-size: 22rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #ffffff;
    padding: 6rpx 8rpx;
    top: 0;
    left: 0;
    z-index: 5;
  }

  .time-discount {
    position: absolute;
    background: #ff4b40;
    border-radius: 10rpx 0rpx 10rpx 0px;
    font-size: 22rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #ffffff;
    padding: 6rpx 8rpx;
    top: 0;
    left: 0;
    z-index: 5;
  }

  &.is-list {
    padding: 20rpx 20rpx 20rpx 15rpx;

    .image {
      flex-shrink: 0;
      width: 190rpx;
      height: 190rpx;
    }

    .info {
      flex: 1;
      margin-left: 15rpx;

      .name {
        flex: 1;
      }
    }
  }

  &.is-grid {
    flex-direction: column;
    padding: 0;

    .image {
      position: relative;
      padding-bottom: 100%;

      image {
        position: absolute;
        border-radius: 10rpx 10rpx 0 0;
      }
    }

    .info {
      padding: 10rpx;

      .name {
        /* margin: 15rpx 0 0;
          margin-bottom: 20rpx;
          height: 72rpx; */
        margin: 12rpx;
        margin-left: 0;
      }
      .earnings {
        margin: 10rpx 0;
      }

      .bottom {
        padding-bottom: 12rpx;
      }
    }
  }

  &.is-three,
  &.is-four {
    flex-direction: column;
    padding: 0;

    .image {
      position: relative;
      padding-bottom: 100%;

      image {
        position: absolute;
        border-radius: 10rpx 10rpx 0 0;
      }
    }

    .info {
      padding: 10rpx;

      .name {
        margin: 15rpx 0 0;
        margin-bottom: 8rpx;
      }

      .bottom {
        padding-bottom: 12rpx;
      }
    }
  }

  &.is-largest {
    flex-direction: column;

    .image {
      position: relative;
      padding-bottom: 100%;
      border-radius: 10rpx 10rpx 0 0;
      z-index: 1;

      image {
        position: absolute;
        border-radius: 10rpx 10rpx 0 0;
      }
    }

    .info {
      padding: 20rpx;

      .name {
        margin-top: 15rpx;
        // margin-bottom: 20rpx;
      }

      .bottom {
        padding-bottom: 12rpx;
      }
    }
  }

  .image {
    position: relative;

    image {
      width: 100%;
      height: 100%;
    }

    .sold-out {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 10rpx 10rpx 0 0;
      background-color: rgba(0, 0, 0, 0.5);
      font-size: 132rpx;
      color: #fff;
      z-index: 1;
    }
  }

  .info {
    display: flex;
    flex-direction: column;

    .earnings {
      font-size: 24rpx;
      color: #444444ff;
      margin: 10rpx 0;
      min-height: 40rpx;

      .zeng {
        max-width: 90%;
        display: inline-block;
        padding: 2rpx 4rpx;
        border-radius: 8rpx;
        color: #ff4c40;
        border: 1rpx solid #ff4c40;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-break: break-all;
        /* &:nth-child(n+1){
            margin-left: 10rpx;
          } */
        margin-right: 10rpx;
      }
    }

    .name {
      // line-height: 30rpx;
      font-size: 26rpx;
      font-weight: 500;
      color: #000;
      word-break: break-all;
    }

    .bottom {
      display: flex;
      justify-content: space-between;
      position: relative;

      .price-wrap {
        font-size: 30rpx;
        color: $price-color;
        text-align: center;
        font-weight: 700;
        .price {
          display: flex;
          align-items: baseline;
          font-size: 30rpx;
          font-weight: 800;
          color: #ff4b40;
        }

        .original-price {
          margin-left: 20rpx;
          font-size: 24rpx;
          color: #666;
          vertical-align: baseline;
          text-decoration: line-through;
        }
      }

      .icongouwuche-tianchong {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color: #ff4b40;
        font-size: 26rpx;
        color: #fff;
      }
    }
  }
}
.sell {
  position: absolute;
  z-index: 9;
  width: 100%;
  height: 100%;
  font-size: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
}
</style>
