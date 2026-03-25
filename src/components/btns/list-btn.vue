<template>
  <view>
    <view style="height: 200rpx" />
    <view class="fixed-footer flex">
      <button
        v-for="item in footBtns"
        :key="item.id"
        class="primary-btn round flex-1"
        hover-class="button-action"
        @tap="handleNavigate(item.path)"
      >
        {{ item.name }}
      </button>
    </view>
  </view>
</template>
<script>
/*
footBtns:
[{
    id: 1,
    name: '添加导购',
    path: '/guide-manage/add?id=0'
  }]
*/
export default {
  props: {
    footBtns: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleNavigate(url) {
      this.$emit('nav', url)
    }
  }
}
</script>
<style lang="scss" scoped>
.fixed-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  height: 140rpx;
  box-sizing: border;
  padding: 0 40rpx;
  .primary-btn:nth-child(2) {
    margin-left: 40rpx;
  }
}
</style>
