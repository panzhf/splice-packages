<template>
  <view class="prize-list" :style="bgStyle">
    <view v-if="show" class="container">
      <view class="header flex flex-center flex-middle">
        <image :src="PACKAGE_STATIC_URL + 'tap/prize-title.png'" class="bg" />
        <view class="title fw-bold fs-30">奖项内容</view>
      </view>
      <view class="list">
        <view v-for="(item, index) in calcList" :key="index" class="item flex flex-middle">
          <image :src="item.awardpicture" class="cover" />
          <view class="flex-1 ml-20">
            <view class="name fs-26">{{ item.name }}</view>
            <view class="desc fs-24">{{ item.productname }}</view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="empty" />
    <md-copyright color="#fff" bg-color="transparent" />
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  name: 'PrizeList',
  mixins: [packageStaticMixin],
  props: {
    show: Boolean,
    bgColor: {
      type: String,
      default: '#fe6133'
    },
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    calcList() {
      // 过滤“谢谢参与”
      return this.list.filter(item => !!item.id)
    },
    bgStyle() {
      return `background: linear-gradient(180deg, #f13f22 0%, ${this.bgColor} 100%);`
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: prize-list;
.#{$prefix} {
  padding-bottom: 160rpx;
  .container {
    margin: 0 40rpx;
    padding: 0 58rpx 30rpx;
    background: rgba(234, 37, 9, 0.5);
    box-shadow: 0px 0px 15rpx 0px rgba(197, 29, 0, 0.68) inset;
    border-radius: 20rpx;
  }
  .header {
    position: relative;
    height: 78rpx;
    .bg {
      @include wh(306rpx, 27rpx);
    }
    .title {
      position: absolute;
      color: #feeeaa;
      @include hv-cen;
    }
  }
  .item {
    height: 120rpx;
    border-bottom: 1rpx dashed #fff;
    .cover {
      @include wh(68rpx);
      @include round(10rpx);
    }
    .name {
      margin-bottom: 6rpx;
      color: #fff;
    }
    .desc {
      color: rgba(255, 255, 255, 0.8);
    }
  }
  .empty {
    // 1118活动区域以上高度 160底部高度 110版权组件
    height: calc(100vh - 1118rpx - 160rpx);
  }
}
</style>
