
<template>
  <view class="loadmore">
    <block v-if="isLoading">
      <view class="loading-content inline">
        <view class="loading-type circular"></view>
        <text>{{ loading || '加载中' }}</text>
      </view>
    </block>
    <block v-if="isLoadend">
      <text class="lighter"></text>
      <text>{{ loaded || '加载完成' }}</text>
      <text class="lighter"></text>
    </block>
  </view>
</template>
<script>
/**
 * 商城小程序 底部loading 组件
 * @props {Boolean} [type = false] isLoadend为true时是没有更多了，isLoading为true时是在加载中
 * @props {String} [loading = '正在加载，请稍后'] 加载中文案
 * @props {String} [loading = '亲~没有更多了'] 加载完成文案
 * 引入步骤：
 * 1. 导入组件
 *   import Loadmore from 'ui/components/loadmore/index'
 *
 */
export default {
  props: {
    isLoadend: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    loading: {
      type: String,
      default: '正在加载，请稍后'
    },
    loaded: {
      type: String,
      default: '亲~没有更多了'
    }
  },
  data() {
    return {}
  },

  methods: {},

  onLoad() {}
}
</script>

<style lang="scss" scoped>
.loadmore {
  width: 65%;
  position: relative;
  margin: 0 auto;
  padding-top: 26rpx;
  padding-bottom: 32rpx;
  font-size: 24rpx;
  color: #999999;
  line-height: 36rpx;
  text-align: center;
  vertical-align: middle;
  .icon-loading {
    display: inline-block;
    animation: icon-spin 2s linear;
    animation-iteration-count: infinite;
    margin-right: 5px;
  }
}

@keyframes icon-spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-content.inline .circular {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}
</style>

