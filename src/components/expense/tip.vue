<template>
  <view class="expense-tip fs-24 text-center">已报销中的数据执行完毕后才可发起报销...</view>
</template>

<script>
export default {
  name: 'ExpenseTip'
}
</script>

<style lang="scss" scoped>
$prefix: expense-tip;
.#{$prefix} {
  color: #fff;
  background: #ff6955;
  line-height: 48rpx;
}
</style>
