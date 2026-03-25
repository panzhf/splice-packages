<template>
  <view class="cart-quantity flex flex-middle">
    <view :class="['addNum', value <= min ? 'gray-color' : '']" @click.stop="addNum('1')">-</view>
    <input v-model="num" type="number" maxlength="6" @blur="onBlur" />
    <view :class="['addNum', value >= max && max !== -1 ? 'gray-color' : '']" @click.stop="addNum('2')">+</view>
  </view>
</template>

<script>
export default {
  name: 'Digital',
  props: {
    value: {
      // v-model 绑定的值
      type: Number,
      default: 1
    },
    max: {
      // 最大数量
      type: Number,
      default: -1
    },
    min: {
      // 最小数量
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      num: this.value
    }
  },
  watch: {
    value(newVal) {
      this.num = newVal
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
      } else if (Number(value) === Number(this.value)) {
        return
      } else if (Number(value) < Number(this.min)) {
        wx.showToast({
          title: `数量不能再减少了`,
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
      this.$emit('input', this.num)
      this.$emit('update:value', this.num)
      this.$emit('change', this.num)
    },
    addNum(type) {
      if (type === '1') {
        if (this.value > this.min) {
          this.num--
          this.$emit('input', this.num)
          this.$emit('update:value', this.num)
          this.$emit('change', this.num)
        }
      } else if (type === '2') {
        if (this.max <= this.value && this.max !== -1) {
          return false
        }
        this.num++
        this.$emit('input', this.num)
        this.$emit('update:value', this.num)
        this.$emit('change', this.num)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
.cart-quantity {
  width: 200rpx;
  height: 56rpx;

  border: 2rpx solid #e5e5e5;
  border-radius: 10rpx;

  line-height: 52rpx;
  .addNum {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    line-height: 36rpx;
  }
  input {
    text-align: center;

    border-right: 1rpx solid #e5e5e5;
    border-left: 1rpx solid #e5e5e5;

    font-size: 26rpx;
    line-height: 54rpx;

    @include wh(90rpx, 54rpx);
  }
}
.gray-color {
  color: #c8c9cc;
}
</style>
