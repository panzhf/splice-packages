<template>
  <view class="item" :class="[customClass, { 'mt-20': index !== 0 }]">
    <v-img mode="widthFix" size="400" :src="item.picture" />
    <view class="content fs-28">
      <view class="name fw-bold ellipsis">{{ item.content }}</view>
      <view class="plan-t mt-20 flex flex-between">
        <view class="left flex flex-middle">
          <v-img class="photo" size="400" :src="item.headpath" />
          <view class="user-name ml-10 fs-24 fw-medium ellipsis">{{ item.nickname }}</view>
        </view>
        <view class="right flex flex-middle" :class="{ islike: item.islike }" @tap.stop="handleZan(item)">
          <view class="icon iconfont fs-26" :class="item.islike ? 'icondianzan' : 'icondianzan-2'" />
          <view v-if="item.likeitnum" class="num ml-10">{{ item.likeitnum > 99 ? '99+' : item.likeitnum }}</view>
          <view class="like-tip" :class="{ float: item.istaped }">+1</view>
          <auth-button />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Item',
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: -1
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleZan(item) {
      if (item.islike) {
        return this.$msg('已点赞，不可取消哦', { mask: false })
      }
      this.$emit('zan', item)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/list.scss';
.item {
  overflow: hidden;
  width: 345rpx;
  border-radius: 10rpx;
  background: #fff;
  .content {
    padding: 10rpx 20rpx 20rpx;
    .name {
      color: #2a2a2a;
    }
    .photo {
      width: 46rpx;
      height: 46rpx;
      border-radius: 50%;
      overflow: hidden;
    }
    .user-name {
      color: #888;
      width: 100rpx;
    }
    .right {
      position: relative;
      color: #888;
    }
    .islike {
      color: $community-theme;
    }
  }
}
.like-tip {
  position: absolute;
  top: 0;
  left: 15rpx;
  z-index: 5;
  color: $community-theme;
  font-size: 20rpx;
  transform: scale(0);
  &.float {
    animation: float 1.5s 1 linear;
  }
}
@keyframes float {
  0% {
    transform: scale(0) translateY(-4rpx);
  }
  50% {
    transform: scale(2) translateY(-30rpx);
  }
  100% {
    transform: scale(0.8) translateY(-80rpx);
  }
}
</style>
