<template>
  <view :style="themeVars">
    <view :class="['price', mode ? mode : '']">
      <view v-if="showSign" class="sign">￥</view>
      <view v-if="double" class="number">
        {{ fixedNumberZhengshu(price) }}
        <view class="type">{{ fixedNumberXiaoshu(price) }}</view>
        <text v-if="isStair" class="stair">{{ isStair ? '起' : '' }}</text>
      </view>
      <view v-else class="number">{{ price }}</view>
      <view v-if="unit" class="type">/{{ unit }}</view>
    </view>
    <!--price end-->
  </view>
</template>

<script>
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    showSign: {
      type: Boolean,
      default: true
    },
    price: {
      type: [String, Number],
      default: '0'
    },
    type: {
      type: String,
      default: ''
    },
    isStair: {
      type: Boolean,
      default: false
    },
    double: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      default: 'order'
    },
    product: {
      type: Boolean,
      default: false
    },
    unit: {
      type: String,
      default: ''
    }
  },
  methods: {
    /**
     * 金额格式转换
     */
    fixedNumber(number) {
      if (!number && number !== 0) {
        return
      }
      if (number < 0) {
        number = -number
      }
      return Number(number).toFixed(2)
    },

    /**
     * 金额格式转换整数部分
     */
    fixedNumberZhengshu(number) {
      if (!number && number !== 0) {
        return
      }
      if (number < 0) {
        number = -number
      }
      return Number(number).toFixed(2).split('.')[0]
    },

    /**
     * 金额格式转换小数部分
     */
    fixedNumberXiaoshu(number) {
      if (!number && number !== 0) {
        return
      }
      if (number < 0) {
        number = -number
      }
      return '.' + Number(number).toFixed(2).split('.')[1]
    },

    /**
     * 根据数量及价格计算总价
     */
    totalSum(price, number) {
      if (!price && !number) {
        return
      }
      return Number(price * number).toFixed(2)
    },

    /**
     * 根据商品总价及运费计算总价
     */
    totality(price, number) {
      if (!price && !number) {
        return
      }
      return Number(price) + Number(number)
    }
  }
}
</script>

<style lang="scss" scoped>
.price {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  font-weight: bold;
}
.price {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  font-weight: bold;
}

.payment-help.mt8 {
  margin-bottom: 8rpx;
}

.number {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}
.card {
  font-size: 30rpx;
  // color: $price-color;
  color: var(--theme-color, $price-color);
  font-weight: 800;
  .type {
    font-size: 22rpx;
  }
}
.Jfdetail {
  // color: $price-color;
  color: var(--theme-color, $price-color);
  font-weight: 800;
  .number {
    font-size: 36rpx;
    .type {
      font-size: 26rpx;
    }
  }
}
.cash {
  font-size: 26rpx;
  // color: #000;
  font-weight: 700;
  .type {
    font-size: 22rpx;
  }
}
.freight {
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
  .type {
    font-size: 18rpx;
  }
}
.swiper {
  font-size: 30rpx;
  color: $price-color;
  font-weight: 700;
  .type {
    font-size: 22rpx;
  }
}

.detail {
  .sign {
    font-size: 36rpx font-weight：Medium;
  }
  .number {
    font-size: 60rpx;
    font-weight: Bold;
  }
  .type {
    font-size: 40rpx;
  }
}
.old {
  text-decoration: line-through;
  color: #999;
  .sign {
    font-size: 36rpx font-weight：Medium;
  }
  .number {
    font-size: 20rpx;
  }
  .type {
    font-size: 20rpx;
  }
}
</style>
