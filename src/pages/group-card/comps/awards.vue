<template>
  <view class="prize-list-container" :style="containerStyle">
    <image class="prize-title-img" mode="widthFix" :src="awardsData.titleImg" />
    <view class="prize-list-content" :style="{ backgroundImage: `url(${awardsData.bgUrl})` }">
      <view v-for="(item, index) in prizeList" :key="index" class="prize-item">
        <image
          class="prize-icon"
          mode="aspectFit"
          :src="item.prizeimage || PACKAGE_STATIC_URL + `scan/prizeIcon${index + 1}.png`"
        />
        <view class="prize-text" :style="{ color: awardsData.color }">
          <!-- #ifdef MP-WEIXIN -->
          <view class="prize-name ellipsis">{{ item.name }}</view>
          <!-- #endif -->
          <view class="prize-desc ellipsis">
            <view>{{ item.productname }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  props: {
    // 奖项内容标题图片
    awardsData: {
      type: Object,
      default: () => {
        return {
          gap: 10,
          titleImg: '',
          bgUrl: ''
        }
      }
    },
    // 奖项列表
    prizeList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      windowWidth: 750
    }
  },
  computed: {
    containerWidth() {
      // 间隙单位是px，转成rpx大概乘以2，两边间距再乘以2
      return this.windowWidth - (this.awardsData.gap || 0) * 4
    },
    containerStyle() {
      let s = []
      s.push(`width: ${this.containerWidth}rpx`)
      s.push(`border-radius: ${(this.awardsData.radius || 0) * 2}rpx`)
      return s.join(';')
    },
    ratio() {
      let r = 1
      r = this.containerWidth / this.windowWidth
      return r
    },
    currentPrizeList() {
      return this.prizeList.filter(prize => {
        return prize.type === 0
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.prize-list-container {
  margin: 20rpx auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  .prize-list-content {
    width: 100%;
    min-height: 50rpx;
    background-size: 100% 100%;
    padding: 0 40rpx 40rpx;
    .prize-item {
      display: flex;
      width: 100%;
      padding: 10rpx 16rpx;

      margin-top: 26rpx;
      margin-bottom: 26rpx;
      border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);

      &:last-child {
        border-bottom: 0;
        margin-bottom: 0;
      }

      .prize-icon {
        display: block;
        width: 68rpx;
        height: 68rpx;
        border-radius: 10rpx;
      }

      .prize-text {
        margin-left: 20rpx;
        width: 450rpx;
      }

      .prize-name {
        width: 500rpx;
        font-size: 26rpx;
        font-weight: bold;
        padding-bottom: 10rpx;
      }

      .prize-desc {
        width: 500rpx;
        font-size: 24rpx;
        padding-bottom: 8rpx;
        opacity: 0.7;
      }
    }
  }

  .prize-title-img {
    width: 100%;
  }
}
</style>
