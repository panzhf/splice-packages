<template>
  <view class="base-grid" :class="{ colorful: colorful }">
    <view v-if="showTitle && title" class="menu-title">
      <view class="title">{{ title }}</view>
    </view>
    <view class="wrapper box" :class="[styles.wrap]">
      <view
        v-for="(item, index) in innerList"
        :key="index"
        :class="[styles.item]"
        class="flex flex-column flex-middle item"
        @tap="navigate(item)"
      >
        <view class="icon-box flex flex-middle flex-center">
          <template v-if="colorful">
            <view
              class="menu-icon"
              :style="{
                background: 'linear-gradient(90deg, ' + item.Color1 + ', ' + item.Color2 + ')'
              }"
            >
              <span class="iconfont" :class="[item.Icon]" :style="{ fontSize: item.FontSize2 * 2 + 'rpx' }" />
            </view>
          </template>
          <view v-else class="iconfont" :class="[item.Icon]" />
          <span v-if="item.Count" class="quantity">
            {{ item.Count | filterOrderAmount }}
          </span>
          <span v-if="item.Id === 'cart' && cartCount" class="quantity">
            {{ cartCount }}
          </span>
        </view>
        <view class="icon-name">{{ item.Name }}</view>
      </view>
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  filters: {
    filterOrderAmount(amount) {
      if (amount === null) {
        return ''
      } else {
        if (amount > 99) {
          return '99+'
        } else {
          return amount
        }
      }
    }
  },
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    showTitle: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    showPromotion: {
      // 是否开启推广，没开启时不显示
      type: Number,
      default: 1
    },
    type: {
      type: Number,
      default: 1 // 1.一行5个 2.一行4个
    },
    cartCount: {
      type: [String, Number],
      default: ''
    },
    filter: {
      // 过滤菜单，筛选checked为truthy
      type: Boolean,
      default: false
    },
    colorful: {
      // 彩色图标
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      styles: {
        wrap: 'start',
        item: 'width-20'
      },
      innerList: []
    }
  },
  watch: {
    list: {
      handler(val) {
        let list = []
        if (this.showPromotion === 1) {
          list = val
        } else {
          list = val.filter(item => item.Id !== 'promotion')
        }
        if (this.filter) {
          list = list.filter(item => item.Checked)
        }
        this.innerList = list
        this.getStyle(list)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getStyle(t) {
      const s = {
        wrap: 'start',
        item: 'width-20'
      }
      if (this.type === 1) {
        if (t.length <= 3) {
          s.wrap = 'center'
          s.item = 'width-33'
        } else if (t.length === 4) {
          s.item = 'width-25'
        } else {
          s.wrap = 'wrap'
        }
      } else {
        if (t.length <= 3) {
          s.wrap = 'center'
          s.item = 'width-33'
        } else {
          s.wrap = 'wrap'
          s.item = 'width-25'
        }
      }
      this.styles = s
    },
    navigate(item) {
      this.$emit('click', item)
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'base-grid';
.#{$prefix} {
  position: relative;
  background-color: #fff;
  border-radius: 10rpx;
  &.colorful {
    .wrapper {
      .item {
        margin-bottom: 50rpx;
        .icon-name {
          margin-top: 18rpx;
        }
      }
    }
  }
  .wrapper {
    padding-top: 40rpx;
    &.box {
      display: flex;
      &.start {
        justify-content: flex-start;
      }
      &.center {
        justify-content: center;
      }
      &.wrap {
        flex-wrap: wrap;
      }
    }
    .item {
      position: relative;
      margin-bottom: 40rpx;
      &.width-20 {
        width: 20%;
      }
      &.width-25 {
        width: 25%;
      }
      &.width-33 {
        width: 33%;
      }
      .icon-name {
        font-size: 24rpx;
        line-height: 1;
        margin-top: 10rpx;
      }
    }
    .icon-box {
      position: relative;
      .iconfont {
        font-size: 36rpx;
      }
    }
    .menu-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      .iconfont {
        color: #fff;
      }
    }
    .quantity {
      position: absolute;
      top: -15rpx;
      right: -26rpx;
      min-width: 40rpx;
      height: 30rpx;
      background: #ff4b40;
      border-radius: 15rpx 15rpx 15rpx 0;
      text-align: center;
      color: #ffffff;
      font-size: 22rpx;
      font-weight: 500;
    }
  }
  .menu-title {
    padding: 0 30rpx;
    .title {
      padding: 28rpx 0;
      font-weight: 700;
      font-size: 30rpx;
      line-height: 1;
      border-bottom: 1rpx solid #eee;
    }
  }
}
</style>
