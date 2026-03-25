<template>
  <view class="serviceAssembly">
    <view class="serviceAssembly-cover" @tap="getClose()" @touchmove.stop="() => {}" />
    <view class="serviceAssembly-main">
      <scroll-view scroll-y class="scroll-box">
        <template v-if="tipsType == 1">
          <u-parse class="rich-text" :html="text" :tag-style="parseStyle" :show-with-animation="true" />
        </template>
        <template v-else>
          <view class="h1">领卡奖励</view>
          <block v-if="tipsList.length != 0">
            <block v-for="item in tipsList" :key="item">
              <view v-if="tipsType == 3">获赠{{ item }}</view>
              <view v-else class="lineHeight">
                奖励【{{ item.title }}】{{
                  item.type === 0 ? '购物券' : item.type === 1 ? '第三方卡券' : item.type === 2 ? '提领券' : '红包券'
                }}*{{ item.num }}张
              </view>
            </block>
          </block>
          <view v-if="tipsObj.points" class="lineHeight">奖励【{{ tipsObj.points }}积分】</view>
          <view v-if="tipsObj.wxHb === 1" class="lineHeight">奖励【一个红包】</view>
          <view class="lineHeight fs-24 fw-bold">提示：奖励发放成功后，请前往【个人中心】查看。</view>
        </template>
      </scroll-view>
      <view class="btn" @tap="getClose()">确定</view>
    </view>
  </view>
</template>

<script>
import { richText2Mixin } from 'packages/mixins/rich-text'
export default {
  mixins: [richText2Mixin],
  props: {
    text: {
      type: String,
      default: ''
    },
    tipsType: {
      type: Number,
      default: 1
    },
    tipsList: {
      type: Array,
      default: () => []
    },
    tipsObj: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    getClose() {
      this.$emit('clone')
    }
  }
}
</script>
<style lang="scss" scoped>
.lineHeight {
  line-height: 80rpx;
}
.h1 {
  font-weight: 700;
  font-size: 40rpx;
  color: #000;
  text-align: center;
  padding-bottom: 20rpx;
}
.serviceAssembly {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;

  .serviceAssembly-cover {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
  }

  .serviceAssembly-main {
    width: 634rpx;
    padding: 40rpx;
    font-size: 15px;
    border-radius: 20rpx;
    background-color: #fff;
    color: #333;
    z-index: 999;

    .btn {
      width: 250rpx;
      height: 70rpx;
      line-height: 70rpx;
      text-align: center;
      margin: 40rpx auto 0;
      border-radius: 10rpx;
      color: #fff;
      background: $uni-color-primary;
    }
  }
}
.scroll-box {
  max-height: 700rpx;
}
</style>
