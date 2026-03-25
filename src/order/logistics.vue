<template>
  <view :style="themeVars">
    <view v-if="list && list.products" class="logistics-content" :style="{ marginTop: `${margintop}rpx` }">
      <title-bar title="物流跟踪" back-color="black" title-color is-settle="2" class="title-bar" />
      <view class="logistics-box">
        <!-- 头部物流信息 -->
        <view class="logistics-exchange logistics-sty">
          <view class="logistics-wxs">
            <view class="logistics-name">快递公司</view>
            <view class="logistics-number">{{ list.expressname || '--' }}</view>
          </view>
          <view class="logistics-wxs">
            <view class="logistics-name">运单号</view>
            <view class="logistics-number">
              {{ list.trackingnumber || '--' }}
              <text v-if="list.trackingnumber" class="logistics-copy" @click="handleCopy(list.trackingnumber)">
                复制
              </text>
            </view>
          </view>
        </view>

        <!-- 礼品信息 -->
        <view class="logistics-info logistics-sty">
          <view class="info-top">礼品信息</view>
          <view v-for="(item, index) in list.products" :key="index" class="info-content">
            <view class="info-img">
              <v-img :src="item.imageurl" />
            </view>
            <view class="info-shop">
              <view class="info-shop-top">{{ item.productname }}</view>
              <view class="info-shop-size">{{ item.types }}</view>
              <view class="info-shop-price">
                <view class="shop-price-le">
                  <view v-if="item.point">{{ item.point }}积分</view>
                  <view v-if="item.point && item.originalamount" style="margin: 0 5rpx">+</view>
                  <price v-if="item.originalamount" mode="cash" :price="item.originalamount" double show-sign />
                </view>
                <view class="shop-price-ri">x{{ item.quantity }}</view>
              </view>
            </view>
          </view>
        </view>

        <view class="logistics-list logistics-sty">
          <view class="list-line" />
          <block v-for="(item, index) in list.details" :key="index">
            <view class="item">
              <view class="alpha">
                <view v-if="item.tip" :class="['big-circle', index === 0 ? 'first-bg' : '']">{{ item.tip }}</view>
                <view v-else style="width: 40rpx; height: 40rpx">
                  <view :class="['small-circle', index === 0 ? 'first-bg' : '']" />
                </view>
              </view>
              <view class="beta">
                <view :class="['message', index === 0 ? 'first-meesage' : '']">{{ item.content }}</view>
                <view class="text">{{ item.time }}</view>
              </view>
            </view>
          </block>
        </view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import price from '../components/price/price'
import titleBar from '../components/title-bar/title-bar'
import { apiOrderlogistics } from '../api/order.js'
export default {
  components: { price, titleBar },

  data() {
    return {
      margintop: '170', //苹果6/7/8 需要小一点
      price1: 500,
      price2: 5,
      price3: 10,
      orderid: 0, //订单id
      list: {} //物流数据
    }
  },
  async onLoad(options) {
    let that = this
    uni.getSystemInfo({
      success: function (res) {
        if (res.model === 'iPhone 6/7/8') {
          that.margintop = '130'
        }
      }
    })
    this.orderid = options.orderid || 0
    await this.getData(options.orderid)
  },
  onReachBottom() {},
  methods: {
    // 获取物流接口
    getData(orderid) {
      this.$loading.show()
      apiOrderlogistics({ orderid: Number(orderid) }).then(res => {
        this.$loading.hide()
        if (this.$ck(res)) {
          this.list = res.return_data
        }
      })
    },
    // 复制
    handleCopy(data) {
      uni.setClipboardData({
        data,
        success() {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    }
  }
}
</script>


<style lang="scss" scoped>
// @import '../styles/icon.css';
.logistics-content {
  padding: 20rpx;
  margin-top: 170rpx;
  .title-bar ::v-deep .backcolor {
    color: $order-text-color;
  }
  .title-bar ::v-deep .black {
    &::after {
      border-left: $order-text-color 2px solid;
      border-bottom: $order-text-color 2px solid;
    }
  }
  .logistics-sty {
    background: #ffffff;
    padding: 30rpx 20rpx;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
  }
  &::after {
    content: '';
    width: 100%;
    height: 180rpx;
    background: var(--theme-color, $bg-color);
    position: absolute;
    left: 0;
    top: 100rpx;
    z-index: 10;
  }
  .logistics-box {
    position: relative;
    z-index: 99;
    .logistics-exchange {
      .logistics-wxs {
        display: flex;
        align-items: center;
        font-size: 26rpx;
        color: #000;
        padding-bottom: 25rpx;
        font-weight: 500;
        margin-top: 30rpx;
        border-bottom: 2rpx solid #eeeeee;
        &:nth-child(1) {
          margin-top: 0;
        }
        &:nth-last-child(1) {
          border-bottom: 2rpx solid transparent;
          padding-bottom: 0;
        }
        .logistics-name {
          width: 120rpx;
          margin-right: 55rpx;
          color: #666666;
          text-align: left;
        }
        .logistics-number {
          width: 73%;
          font-weight: bold;
          font-size: 30rpx;
          .logistics-copy {
            border: 1rpx solid #aaaaaa;
            border-radius: 18rpx;
            padding: 2rpx 12rpx;
            margin-left: 40rpx;
            font-size: 22rpx;
          }
        }
      }
    }
    .logistics-info {
      .info-top {
        font-size: 28rpx;
        font-weight: 700;
        margin-bottom: 20rpx;
      }
      .info-content {
        display: flex;
        align-items: center;
        .info-img {
          width: 160rpx;
          height: 160rpx;
          position: relative;
        }
        .info-shop {
          margin-left: 20rpx;
          width: 72%;
          .info-shop-top {
            font-size: 28rpx;
            font-weight: 700;
            text-align: left;
            color: #000000;
            line-height: 36rpx;
            margin-bottom: 20rpx;
          }
          .info-shop-size {
            font-size: 24rpx;
            font-weight: 500;
            text-align: left;
            color: #999999;
            line-height: 30rpx;
            margin-bottom: 20rpx;
          }
          .info-shop-price {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 24rpx;
            .shop-price-le {
              display: flex;
              font-weight: 700;
              align-items: center;
            }
            .shop-price-ri {
              color: #666666;
            }
          }
        }
      }
    }

    .logistics-list {
      background: #fff;
      padding: 20rpx 20rpx 0;
      margin: 20rpx 0;
      position: relative;
      .first-bg {
        background-color: var(--theme-color, $price-color) !important;
      }
      .list-line {
        position: absolute;
        top: 40rpx;
        left: 37rpx;
        z-index: 1;
        width: 5rpx;
        height: calc(100% - 142rpx);
        background: #f5f5f5;
      }
      .item {
        display: flex;
        padding: 0 0 40rpx;
        &:nth-last-child(1) {
          padding: 0 0 30rpx;
        }
        .alpha {
          position: relative;
          width: 40rpx;
          height: 40rpx;
          .big-circle {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 2;
            width: 40rpx;
            height: 40rpx;
            line-height: 40rpx;
            text-align: center;
            font-size: 22rpx;
            background: rgba(204, 204, 204, 1);
            border-radius: 50%;
            color: #fff;
          }
          .small-circle {
            position: absolute;
            left: 47%;
            top: 50%;
            z-index: 2;
            transform: translate(-50%, -50%);
            width: 18rpx;
            height: 18rpx;
            background: #e3e3e3;
            border-radius: 50%;
            color: #fff;
          }
        }
        .beta {
          display: flex;
          flex-direction: column;
          font-size: 26rpx;
          color: #666;
          padding: 0 0 0 30rpx;
          .message {
            font-size: 30rpx;
          }
          .first-meesage {
            color: var(--theme-color, $price-color);
            font-weight: 700;
          }
          .text {
            padding: 12rpx 0 0;
          }
        }
      }
    }
  }
}
</style>
