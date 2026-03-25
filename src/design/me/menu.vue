<template>
  <view class="base-menu">
    <view class="menu-list">
      <view v-for="(item, index) in innerList" :key="index" class="menu-item flex flex-middle" @tap="navigate(item)">
        <template v-if="colorful">
          <view
            class="menu-icon"
            :style="{
              background: 'linear-gradient(90deg,' + item.Color1 + ',' + item.Color2 + ')'
            }"
          >
            <span
              :class="['iconfont', item.Icon, 'icon-gra']"
              :style="{
                fontSize: item.FontSize1 * 2 + 'rpx',
                color: '#fff'
              }"
            ></span>
          </view>
        </template>
        <template v-else>
          <text class="menu-icon iconfont" :class="[item.Icon]"></text>
        </template>
        <view class="menu-text flex-1 flex">
          <text>{{ item.Name }}</text>
          <text v-if="item.Id === 'cart' && cartCount" class="cart-count">
            {{ cartCount }}
          </text>
        </view>
        <text class="link-icon iconfont iconjiantou"></text>
        <image v-if="item.Id === 'promotion'" :src="hot" class="hot-tag" />
      </view>
    </view>
    <slot></slot>
  </view>
</template>

<script>
import hot from './images/hot.png'
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    colorful: {
      // 彩色图标
      type: Boolean,
      default: false
    },
    showPromotion: {
      type: Number,
      default: 1
    },
    cartCount: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      innerList: [],
      hot
    }
  },
  computed: {
    changeData() {
      const { showPromotion, list } = this
      return { showPromotion, list }
    }
  },
  watch: {
    changeData: {
      handler(val) {
        if (val.showPromotion === 1) {
          this.innerList = val.list
        } else {
          this.innerList = val.list.filter(item => item.Id !== 'promotion')
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    navigate(item) {
      this.$emit('click', item)
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'base-menu';
.#{$prefix} {
  position: relative;
  .menu-list {
    border-radius: 10rpx;
    background-color: #fff;
  }
  .menu-item {
    position: relative;
    margin: 0 30rpx;
    padding: 30rpx 0;
    & + .menu-item {
      border-top: 1rpx solid #eee;
    }
    .menu-icon {
      font-size: 22rpx;
      width: 50rpx;
      height: 50rpx;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .menu-text {
      position: relative;
      margin-left: 16rpx;
      font-size: 30rpx;
    }
    .link-icon {
      font-size: 16rpx;
    }
  }
  .hot-tag {
    position: absolute;
    top: -8rpx;
    left: -10rpx;
    width: 36rpx;
    height: 36rpx;
  }
  .cart-count {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 30rpx;
    height: 30rpx;
    margin-left: 10rpx;
    font-size: 20rpx;
    background-color: #fc4745;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    line-height: 30rpx;
    font-weight: 400;
  }
}
</style>
