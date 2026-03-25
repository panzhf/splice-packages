<template>
  <view class="count-box fs-26 fw-bold text-center" :class="skinClass">
    <!-- 积分兑换 -->
    <template v-if="info.joinmarketmode == 0">
      <text v-if="info.cost > 0" class="tip">
        每次消耗
        <text class="count">{{ info.cost }}</text>
        积分
      </text>
      <text v-if="info.daylimit > 0" class="tip">
        每天最多参与
        <text class="count">{{ info.daylimit }}</text>
        次
      </text>
    </template>
    <!-- 扫码 -->
    <template v-if="info.joinmarketmode == 1">
      <text v-if="info.freenum > 0" class="tip">
        您当前剩余
        <text class="count">{{ info.freenum }}</text>
        次抽奖机会
      </text>
    </template>
    <!-- 积分兑换 + 扫码 -->
    <template v-if="info.joinmarketmode == 2">
      <text v-if="info.freenum > 0" class="tip">
        您当前剩余
        <text class="count">{{ info.freenum }}</text>
        次抽奖机会
      </text>
      <template v-else>
        <text v-if="info.cost > 0" class="tip">
          每次消耗
          <text class="count">{{ info.cost }}</text>
          积分
        </text>
        <text v-if="info.daylimit > 0" class="tip">
          每天最多参与
          <text class="count">{{ info.daylimit }}</text>
          次
        </text>
      </template>
    </template>
  </view>
</template>

<script>
import { propMixin } from '../mixins'
export default {
  name: 'CountInfo',
  mixins: [propMixin]
}
</script>

<style lang="scss" scoped>
$prefix: count-box;
.#{$prefix} {
  .tip + .tip {
    margin-left: 8rpx;
  }
  &.skin-6 {
    color: #ba4b20;
    .count {
      color: #992b01;
    }
  }
  &.skin-7 {
    margin-top: 20rpx;
    color: #337453;
    .count {
      color: #c92b2e;
      font-size: 28rpx;
    }
  }
  &.skin-8 {
    margin-top: 20rpx;
    color: #f0d4aa;
  }
}
</style>
