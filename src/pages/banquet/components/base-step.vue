<template>
  <view class="step-container flex flex-middle" :style="calcThemeVars">
    <view
      v-for="(item, index) in list"
      :key="index"
      class="step-item flex-1 flex flex-middle flex-center flex-column fs-28"
      :class="{ active: index <= current }"
    >
      <view class="step-num-box">
        <view class="num fs-36 flex flex-middle flex-center">{{ index + 1 }}</view>
      </view>
      <view class="step-text">{{ item }}</view>
      <view v-if="index > 0 && index < list.length" class="step-line" />
    </view>
  </view>
</template>

<script>
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
// #ifdef MP-RETAIL
import { hex2rgb } from 'packages/utils'
// #endif
export default {
  name: 'BaseStep',
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    current: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    calcThemeVars() {
      let style = [this.themeVars]
      // #ifdef MP-RETAIL
      style.push(`--theme-color-opacity2: ${hex2rgb(this.themeInfo.color, 0.2)}`)
      // #endif
      return style.join(';')
    }
  }
}
</script>

<style lang="scss" scoped>
.step-container {
  padding: 50rpx 30rpx;
  .step-item {
    position: relative;
    &.active {
      .step-num-box {
        /* #ifdef MP-SALE */
        background-color: rgba($color: $uni-color-primary, $alpha: 0.2);
        /* #endif */
        /* #ifdef MP-RETAIL */
        background-color: var(--theme-color-opacity2);
        /* #endif */
        .num {
          background-color: var(--theme-color, $uni-color-primary);
          color: #fff;
        }
      }
      .step-text {
        color: #333;
      }
      .step-line {
        background: var(--theme-color, $uni-color-primary);
      }
    }
  }
  .step-num-box {
    @include wh(72rpx);
    padding: 6rpx;
    border-radius: 50%;
    background-color: rgba(229, 229, 229, 0.5);
    .num {
      height: 100%;
      border-radius: 50%;
      font-weight: 500;
      background-color: #fff;
      color: #aaa;
    }
  }
  .step-text {
    margin-top: 15rpx;
    color: #aaa;
    line-height: 1;
  }
  .step-line {
    position: absolute;
    top: 36rpx;
    left: -25%;
    width: 50%;
    height: 4rpx;

    background: #e5e5e5;
  }
}
</style>
