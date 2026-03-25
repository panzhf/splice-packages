<template>
  <view class="item-box" :style="themeVars">
    <view v-for="(item, index) in list" :key="index" class="flex item" @click="haneleDetail(item)">
      <view class="icon iconfont icon-more fs-24" />
      <image class="img" :src="item.productimg" mode="scaleToFill" />
      <view class="right ml-20 flex-1">
        <view class="row flex">
          <view class="lable">单号</view>
          <view class="info flex flex-1">
            <view class="value">{{ item.id }}</view>
            <view :class="{ wait: [0, 1, 3, 7, 8].includes(item.orderstatus), er: [2, 6].includes(item.orderstatus) }">
              {{ setStateText(item.orderstatus) }}
            </view>
          </view>
        </view>
        <view class="row flex mt-6">
          <view class="lable">宴席主</view>
          <view class="info flex flex-1">{{ item.banquetname }}</view>
        </view>
        <view class="row flex mt-6">
          <view class="lable">宴席时间</view>
          <view class="info flex flex-1">{{ item.banquettime }}</view>
        </view>
        <view class="row flex mt-6">
          <view class="lable">报名数量</view>
          <view class="info flex flex-1">{{ item.banquetrequiredamount }}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
/* 提领券 */
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    rewardTypeOption: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    setStateText(val) {
      return this.rewardTypeOption.filter(item => item.val === val)[0].label
    },
    haneleDetail(item) {
      uni.navigateTo({
        url: `/packages/src/pages/banquet/detail?id=${item.id}`
      })
    },
    handleOpen(item) {
      let obj = {
        expenseNo: item.expenseno,
        id: item.id
      }
      this.$emit('comfirm', obj)
    }
  }
}
</script>
<style lang="scss" scoped>
.mt-6 {
  margin-top: 6rpx;
}
.item-box {
  padding: 20rpx;
  .item {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 30rpx;
    position: relative;
    &:nth-child(n + 2) {
      margin-top: 20rpx;
    }
    .icon-more {
      position: absolute;
      right: 20rpx;
      top: 100rpx;
    }
    .img {
      width: 120rpx;
      height: 120rpx;
    }
    .right {
      .row {
        justify-content: space-between;
        .lable {
          font-size: 28rpx;
          font-weight: 500;
          width: 140rpx;
          color: #666666;
        }
        .info {
          justify-content: space-between;
          font-size: 28rpx;
          font-weight: 500;
          color: #000000;
          .wait {
            color: var(--theme-color, #ff7640);
            font-weight: bold;
          }
          .er {
            font-weight: bold;
            color: #f35854;
          }
        }
      }
    }
  }
}
</style>
