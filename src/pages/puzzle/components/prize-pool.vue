<template>
  <view>
    <view class="prize-pool-box">
      <image :src="puzzleInfo.prizePoolHeader" class="header" />
      <scroll-view scroll-x class="list text-center" :class="[listLength < 4 ? 'mode-' + listLength : 'mode-4']">
        <view v-for="(item, index) in list" :key="index" class="card-item flex flex-column flex-middle">
          <view class="condition" :style="{ 'background-image': `url(${puzzleInfo.prizePoolCardHeader})` }">
            <view class="fw-bold">集齐{{ item.MinCount }}张拼图</view>
          </view>
          <view
            class="content flex flex-column flex-middle fs-24"
            :class="{ center: listLength === 1 && item.PrizeList.length === 1 }"
            @tap="handleShowPool(item)"
          >
            <image :src="item.ImgPath" class="icon" />
            <view class="prize-list">
              <!-- 最多展示两个奖项 -->
              <view v-for="(i, j) in sliceList(item.PrizeList)" :key="j" class="item ellipsis fw-bold">
                {{ i.Name }}
              </view>
            </view>
            <view class="more fs-24">点击查看</view>
          </view>
          <view class="name fs-26 fw-medium">{{ item.JackpotName }}</view>
        </view>
      </scroll-view>
    </view>
    <!-- 查看奖池 -->
    <PoolDialog v-model="isShowPool" :info="poolItem" />
  </view>
</template>

<script>
import PoolDialog from './pool-dialog.vue'
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  name: 'PrizePool',
  components: {
    PoolDialog
  },
  mixins: [packageStaticMixin],
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isShowPool: false,
      poolItem: {} // 奖池单项数据
    }
  },
  computed: {
    puzzleInfo() {
      return {
        prizePoolHeader: `${this.PACKAGE_STATIC_URL}puzzle/prize-pool-header.png`,
        prizePoolCardHeader: `${this.PACKAGE_STATIC_URL}puzzle/card-header.png`
      }
    },
    listLength() {
      return this.list.length
    }
  },
  methods: {
    sliceList(v = []) {
      return v.slice(0, 2)
    },
    handleShowPool(item) {
      this.poolItem = item
      this.isShowPool = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: prize-pool-box;
$color1: #ffdcab;
$color2: #ca3c1c;
.#{$prefix} {
  position: relative;
  .header {
    display: block;
    @include wh(644rpx, 54rpx);
    margin: 10rpx auto 30rpx;
  }
  .list {
    padding: 0 30rpx;
    color: $color1;
    @include box();
    white-space: nowrap; // scroll-view横向滑动需要
    &.mode-1 {
      .card-item {
        width: 100%;
      }
      .content {
        padding-left: 42rpx;
        padding-right: 42rpx;
        &.center {
          padding-top: 40rpx;
        }
      }
    }
    &.mode-2 {
      .card-item {
        width: calc((100% - 38rpx) / 2);
      }
      .content {
        padding-left: 32rpx;
        padding-right: 32rpx;
      }
    }
    &.mode-3,
    &.mode-4 {
      .card-item {
        width: calc((100% - 76rpx) / 3);
      }
      .content {
        padding-left: 14rpx;
        padding-right: 14rpx;
      }
    }
    &.mode-4 {
      .card-item {
        margin-right: 16rpx;
      }
    }
  }
  .card-item {
    display: inline-block;
    margin-right: 38rpx;
    &:last-of-type {
      margin-right: 0;
    }
  }
  .condition {
    @include whl(200rpx, 58rpx, 48rpx);
    margin: 0 auto;
    background-size: 100%;
    font-size: 24rpx;
  }
  .content {
    position: relative;
    margin-top: 14rpx;
    margin-bottom: 30rpx;
    padding-top: 30rpx;
    border: 2rpx solid $color1;
    box-shadow: inset 0px 1rpx 10rpx 0px #c92f00;
    color: #bb240f;
    background-color: $color1;
    @include round(15rpx);
    @include wh(100%, 291rpx);
    @include box();
    .icon {
      @include wh(100rpx);
    }
    .prize-list {
      width: 100%;
      margin-top: 16rpx;
    }
    .item {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      -webkit-line-clamp: 1;
      & + .item {
        margin-top: 10rpx;
      }
    }
  }
  .more {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    @include lh(42rpx);
    background-color: $color2;
    color: #fff;
    @include round(0 0 15rpx 15rpx);
  }
}
</style>
