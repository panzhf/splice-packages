<template>
  <!-- 获得的奖励 -->
  <view v-if="showInfo" class="prize-info-container">
    <view class="prize-title">该码抽中了</view>
    <view>
      <!-- 红包零钱 -->
      <view v-if="prizeInfo.IsGetHb" class="pop__prize-item">
        <view>
          <view class="prize-name ellipsis">{{ prizeInfo.PrizeHbName }}</view>
        </view>
      </view>
      <!-- 券 -->
      <view v-if="prizeInfo.IsGetVolume" class="pop__prize-item">
        <view>
          <view class="prize-name ellipsis">
            {{ prizeInfo.VolumeType === 0 ? prizeInfo.ParValue : '' }}{{ prizeInfo | volumeType }}
          </view>
        </view>
      </view>
      <!-- 积分 -->
      <view v-if="prizeInfo.Point" class="pop__prize-item">
        <view>
          <view class="prize-name ellipsis">{{ prizeInfo.Point }}积分</view>
        </view>
      </view>
      <!-- 参与机会 -->
      <view v-if="prizeInfo.IsGetDraw" class="pop__prize-item">
        <view>
          <view class="prize-name ellipsis">
            {{ prizeInfo.DrawNum
            }}{{
              prizeInfo.DrawActSetting && prizeInfo.DrawActSetting.DrawChanceTitleType === 1
                ? prizeInfo.DrawActSetting.DrawChanceTitle
                : '次参与机会'
            }}
          </view>
        </view>
      </view>
      <!-- 礼品 -->
      <view v-if="prizeInfo.IsProduct" class="pop__prize-item">
        <view>
          <view class="prize-name ellipsis">{{ prizeInfo.PrizeProductTitle }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  filters: {
    volumeType(val) {
      if (val.VolumeType === 0) {
        return '元购物券'
      } else if ([1, 2, 3].includes(val.VolumeType)) {
        return val.VolumeTitle
      }
    }
  },
  mixins: [packageStaticMixin],
  props: {
    prizeInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    showInfo() {
      let { IsGetHb, IsGetVolume, Point, IsGetDraw, IsProduct } = this.prizeInfo
      if (IsGetHb || IsGetVolume || Point || IsGetDraw || IsProduct) return true
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.prize-info-container {
  margin: 30rpx auto 0;
  width: 540rpx;
  background: #ffffff;
  border: 1px solid #ffd7c9;
  border-radius: 8rpx;
  padding: 33rpx;
  text-align: left;
  .prize-title {
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #333333;
  }

  .pop__prize-item {
    &:first-child {
      margin-top: 0;
    }
    .prize-name {
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #666666;
      line-height: 40rpx;
    }
  }
}
</style>
