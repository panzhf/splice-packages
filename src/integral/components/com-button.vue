<template>
  <button
    :class="[
      'btn',
      `is-${size}`,
      `is-${type}`,
      {
        'is-round': round,
        'is-disabled': disabled
      }
    ]"
    @click="handleClick"
  >
    <view class="btn__inner">
      <slot />
    </view>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'default'
    },
    size: {
      type: String,
      default: ''
    },
    round: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    handleClick() {
      if (this.disabled) {
        return false
      }
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss">
$prefix: 'btn';
.#{$prefix} {
  display: inline-block;
  margin-bottom: 30rpx;
  margin-right: 30rpx;
  padding: 0;
  min-width: 110rpx;
  line-height: 1.2;
  background-color: #f0f0f0;
  text-align: center;
  color: #333;
  &::after {
    border: 0;
  }
  &.is-primary {
    background-color: var(--theme-color, $bg-color);
  }
  &.is-round {
    border-radius: 40rpx;
  }
  &.is-small {
    padding-left: 22rpx;
    padding-right: 22rpx;
    height: 54rpx;
    font-size: 24rpx;
  }
  &.is-large {
    width: 100%;
    height: 80rpx;
  }
  &.is-disabled {
    background-color: #dddddd;
    color: #ccc;
  }
  .btn__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
