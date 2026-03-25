<template>
  <view class="flex-wrap" :class="[align === 'right' ? 'flex-end' : '', isFixWidth ? 'label-width' : '']">
    <view v-for="(item, index) in list" :key="index" class="item flex flex-middle">
      <view :class="!showDelIcon ? 'pr-30' : ''">{{ item[nameKey] }}</view>
      <view v-if="showDelIcon" class="del-icon" @tap="handleDel(index)">x</view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    showDelIcon: {
      type: Boolean,
      default: true
    },
    align: {
      type: String,
      default: 'left'
    },
    isFixWidth: {
      type: Boolean,
      default: false
    },
    nameKey: {
      type: String, //名称key
      default: 'name'
    }
  },
  data() {
    return {}
  },
  methods: {
    handleDel(i) {
      this.$emit('del', i)
    }
  }
}
</script>
<style lang="scss" scoped>
.label-width {
  width: 690rpx;
}
.item {
  padding: 6rpx 0rpx 6rpx 24rpx;
  color: $uni-text-color-grey;
  border: 1px solid $uni-text-color-placeholder;
  border-radius: 24rpx;
  background-color: $uni-text-color-inverse;
  font-size: 28rpx;
  line-height: 36rpx;
  margin-bottom: 20rpx;
  margin-right: 20rpx;
  .del-icon {
    padding: 0 20rpx;
    text-align: center;
    font-size: 26rpx;
  }
}
</style>
