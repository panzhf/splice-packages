<template>
  <view class="invite-tip fs-28 fw-bold" :style="{ backgroundColor: customStyle.backgroundColor }">
    <text class="mr-10">{{ from }}</text>
    邀你注册
    <text class="store" :style="{ color: customStyle.color }">@{{ memberlogin }}</text>
  </view>
</template>

<script>
export default {
  name: 'InviteTip',
  props: {
    from: {
      type: String,
      default: ''
    },
    memberlogin: {
      type: String,
      default: ''
    },
    customStyle: {
      type: Object,
      default: () => {
        return {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: invite-tip;
.#{$prefix} {
  padding: 24rpx 30rpx;
  background: #fff5f1;
  color: #000;
  .store {
    color: #ff7640;
  }
}
</style>
