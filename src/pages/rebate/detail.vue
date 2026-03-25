<template>
  <view class="detail">
    <view class="info">
      <view class="state">
        审核状态：
        <view v-if="info.AuditStatus === 3" class="err">审核失败</view>
        <view v-if="info.AuditStatus === 1" class="ing">审核中</view>
        <view v-if="info.AuditStatus === 2" class="success">审核成功</view>
        <view v-if="info.AuditStatus === 0" class="ing">待审核</view>
      </view>
      <view v-if="[3].includes(info.AuditStatus)" class="desc">原因：{{ info.Reason }}</view>
      <view class="time mt16">上传时间：{{ info.CreatedTime }}</view>
      <view v-if="[2, 3].includes(info.AuditStatus)" class="time">审核时间：{{ info.AuditTime }}</view>
    </view>
    <div class="img-con">
      <image v-for="(item, index) in info.ImageUrl" :key="index" :src="item" mode="widthFix" class="img" />
    </div>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      info: {}
    }
  },
  onLoad(options) {
    let data = uni.getStorageSync('recordItem')
    this.info = JSON.parse(data)
    uni.removeStorageSync('recordItem')
  }
}
</script>

<style lang="scss" scoped>
.detail {
  padding: 30rpx;
  .info {
    background: #fefaed;
    padding: 30rpx 30rpx;
    .state {
      display: flex;
      font-size: 36rpx;
      .err {
        color: #f43b0b;
      }
      .ing {
        color: #ff7f00;
      }
      .success {
        color: #000;
      }
    }
    .desc {
      margin-top: 16rpx;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #f43b0b;
    }
    .time {
      margin-top: 10rpx;
      font-size: 24rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #666666;
    }
    .mt16 {
      margin-top: 16rpx;
    }
  }
  .img-con {
    margin-top: 30rpx;
  }
}
</style>
<style>
page {
  background-color: #fff;
}
</style>
