<template>
  <view class="friend-list bg-white br-10">
    <CustomHeader title="分享好友列表" />
    <none-data v-if="showNoneData" text-color="#fea021" custom-style="padding: 80rpx 0" />
    <template v-else>
      <view v-show="total" class="text-center fs-24 tip mt-20">{{ total }}位好友已助力</view>
      <view class="list flex-wrap mt-30">
        <view v-for="(item, index) in list" :key="index" class="item flex flex-column flex-middle overflow-h">
          <image :src="item.headpath" class="avatar br-round" />
          <view class="fs-24 fw-bold mt-20 ellipsis name text-center">{{ item.assistornickname }}</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import CustomHeader from './custom-header'
import NoneData from '@/components/none-data/index.vue'
export default {
  name: 'FriendList',
  components: { CustomHeader, NoneData },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    finished: Boolean
  },
  computed: {
    showNoneData() {
      // 用于判断无数据显示占位图
      return this.finished && this.total === 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: friend-list;
$color: #fea021;
.#{$prefix} {
  margin: 0 30rpx 20rpx;
  padding: 30rpx 30rpx 10rpx 30rpx;
  .tip {
    color: $color;
  }
  .item {
    width: 25%;
    margin-bottom: 40rpx;
  }
  .avatar {
    @include wh(64rpx);
  }
  .name {
    width: 100%;
  }
}
</style>
