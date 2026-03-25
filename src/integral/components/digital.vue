<template>
  <view class="cart-quantity flex flex-middle">
    <view :class="['addNum', quantity <= min ? 'gray-color' : '']" @click.stop="addNum('1')">-</view>
    <input v-model="num" type="number" maxlength="6" @blur="onBlur" />
    <view :class="['addNum', quantity >= max && max !== -1 ? 'gray-color' : '']" @click.stop="addNum('2')">+</view>
  </view>
</template>

<script>
export default {
  name: 'Digital',
  props: {
    quantity: {
      // 第几个
      type: Number,
      default: 1
    }, // 当前数量
    max: {
      // 第几个
      type: Number,
      default: -1
    }, // 当前数量
    min: {
      // 最小值
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      num: this.quantity
    }
  },

  methods: {
    onBlur(val) {
      let value = Number(val.detail.value)
      const reg = /\D/g
      const match = reg.test(value)
      if (match) {
        wx.showToast({
          title: `请输入合法数值`,
          icon: 'none'
        })
        this.num = this.min
      } else if (Number(value) === Number(this.quantity)) {
        return
      } else if (Number(value) < Number(this.min)) {
        wx.showToast({
          title: `宝贝数量不能再减少了`,
          icon: 'none',
          duration: 3000
        })
        this.num = this.min
      } else if (value > this.max) {
        wx.showToast({
          title: `最多可购买${this.max}件`,
          icon: 'none',
          duration: 3000
        })
        this.num = this.max
      }
      this.$emit('update:quantity', this.num)
      this.$emit('cartSet')
    },
    addNum(type) {
      if (type === '1') {
        if (this.quantity > 1) {
          this.num--
          this.$emit('update:quantity', this.num)
          this.$emit('cartSet')
        }
      } else if (type === '2') {
        if (this.max <= this.quantity && this.max !== -1) {
          return false
        }
        this.num++
        this.$emit('update:quantity', this.num)
        this.$emit('cartSet')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
.cart-quantity {
  .addNum {
    @include wh(42rpx);
    line-height: 42rpx;
    border-radius: 5rpx;
    text-align: center;
    font-size: 28rpx;
    background: $uni-bg-color-grey;
    font-weight: bold;
  }
  input {
    @include wh(80rpx, 42rpx);
    line-height: 42rpx;
    font-size: 26rpx;
    text-align: center;
  }
}
.gray-color {
  color: #c8c9cc;
}
</style>
