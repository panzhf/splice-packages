<template>
  <view
    :class="[
      'product-card',
      {
        'is-list': layout === 'list',
        'is-grid': layout === 'grid',
        'is-largest': layout === 'largest',
        'is-three': layout === 'three',
        'is-four': layout === 'four'
      }
    ]"
    @click="handleClick"
  >
    <view v-if="isDistribution" class="identifying">赚佣</view>
    <view class="image">
      <!-- #ifdef MP -->
      <v-img size="750" mode="aspectFit" :lazy-load="true" :src="image" />
      <!-- #endif -->
      <!-- #ifdef H5-DECORATE -->
      <image mode="aspectFit" :src="image" />
      <!-- #endif -->
      <view v-if="isShowAddCart && stock === 0" class="iconfont iconyishouxin sold-out"></view>
    </view>
    <view class="info" style="overflow: hidden">
      <view class="name">
        <view class="ellipsis-2">{{ name }}</view>
        <view
          v-if="
            isActicityGoods ||
            isTimeDiscount ||
            isSpellGroup ||
            isSeckillActivity ||
            isFullReduction ||
            isMemberPord ||
            goodsReserveAct
          "
          class="earnings"
        >
          <view v-if="isActicityGoods" class="zeng">赠</view>
          <view v-if="isSpellGroup" class="zeng">团</view>
          <view v-if="isTimeDiscount" class="zeng">折扣</view>
          <view v-if="isSeckillActivity" class="zeng">秒</view>
          <view v-if="isFullReduction" class="zeng">减送</view>
          <view v-if="isMemberPord" class="zeng">会员价</view>
          <view v-if="goodsReserveAct.appointment === 1" class="zeng">预约</view>
          <view v-if="goodsReserveAct.appointment === 2" class="zeng">预约中</view>
          <view v-if="goodsReserveAct.appointment === 3" class="zeng">抢购</view>
          <view v-if="goodsReserveAct.appointment === 4" class="zeng">抢购中</view>
        </view>
        <block v-if="checkeds">
          <view v-if="authorIntroduction" class="earnings">
            <view class="zeng">{{ authorIntroduction }}</view>
          </view>
        </block>
      </view>
      <view class="bottom">
        <view class="price-wrap">
          <view v-if="isMemberPord" class="price">￥{{ vipPrice | filterRmb }}</view>
          <view v-else-if="isTimeDiscount" class="price">￥{{ timeDiscountMinPrice | filterRmb }}</view>
          <view v-else-if="isSpellGroup" class="price">￥{{ spellGroupPrice | filterRmb }}</view>
          <view v-else-if="isSeckillActivity" class="price">￥{{ seckillPrice | filterRmb }}</view>
          <view v-else-if="goodsReserveAct && (isFormat === 0 || isFormat === 1)" class="price">
            ￥{{ goodsReserveAct.minprice | filterRmb }}
          </view>
          <view v-else class="price">￥{{ price | filterRmb }}</view>
          <view v-if="checked && originalPrice" class="original-price">
            ￥{{ originalPrice }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  components: {
    // SkuPopup
  },
  props: {
    // 是否有规格: 0-否 1-是
    isFormat: {
      type: Number,
      default: 0
    },
    // 多规格商品-普通商品最大价格
    // maxPrice: {
    //   type: Number,
    //   default: 0
    // },
    // // 多规格商品-活动最优惠价格
    // activityPrice: {
    //   type: Number,
    //   default: 0
    // },
    // // 多规格商品-活动最大价格
    // maxActivityPrice: {
    //   type: Number,
    //   default: 0
    // },
    // 商品预约
    goodsReserveAct: {
      type: Object,
      default: () => {}
    },
    layout: {
      type: String,
      default: 'list'
    },
    checked: {
      type: Boolean,
      default: false
    },
    checkeds: {
      type: Boolean,
      default: true
    },
    isShowAddCart: {
      type: Boolean,
      default: true
    },
    pid: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    stock: {
      type: Number,
      default: 0
    },
    price: {
      // 商品原价
      type: Number,
      default: 0
    },
    timeDiscountMinPrice: {
      // 限时折扣最优惠价格
      type: Number,
      default: 0
    },
    originalPrice: {
      // 市场价
      type: Number,
      default: 0
    },
    spellGroupPrice: {
      // 拼团价
      type: Number,
      default: 0
    },
    seckillPrice: {
      // 秒杀价
      type: Number,
      default: 0
    },
    distributionInfo: {
      type: Object,
      default: () => {}
    },
    isActicityGoods: {
      type: Number,
      default: 0
    },
    isDistribution: {
      type: Number,
      default: 0
    },
    authorIntroduction: {
      type: String,
      default: ''
    },
    isSpellGroup: {
      type: Number,
      default: 0
    },
    isSeckillActivity: {
      type: Number,
      default: 0
    },
    isFullReduction: {
      type: Number,
      default: 0
    },
    isTimeDiscount: {
      type: Number,
      default: 0
    },
    isMemberPord: {
      type: Number,
      default: 0
    },
    memberPrice: {
      type: Number,
      default: 0
    },
    vipPrice: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    handleClick() {
      this.$emit('click')
    }
    // handleBuy() {
    //   if (!getApp().globalData.isAuth) {
    //     return false
    //   }
    //   getApp().showLoading()
    //   GoodsDetail({
    //     GoodsId: this.pid
    //   }).then((res) => {
    //     getApp().hideLoading()
    //     if (res.Return_code === 0) {
    //       if (res.Return_data) {
    //         let price=res.Return_data.Price
    //         //会员专享价
    //         if(res.Return_data.isMemberPord){
    //           price=res.Return_data.memberPrice
    //         }
    //         //限时折扣最优惠价
    //         if(res.Return_data.TimeLimitDiscount){
    //           price=res.Return_data.TimeLimitDiscount.MinPrice
    //         }
    //         this.$refs.skuPopup.open({
    //           type: 1,
    //           id: res.Return_data.GoodsId,
    //           GoodType: res.Return_data.GoodType,
    //           DirectActivityId: res.Return_data.DirectActivityId,
    //           image: res.Return_data.PicUrl,
    //           price,
    //           stock: (res.Return_data.StoreOnSale && res.Return_data.StoreOnSale.EnableStockCount) || 0,
    //           sysSpecList: res.Return_data.GoodsSysSpecList,
    //           specList: res.Return_data.GoodsSpecList,
    //           formatList: res.Return_data.GoodsFormatList
    //         })
    //       }
    //     } else {
    //       getApp().tips(res.Return_msg)
    //     }
    //   })
    // }
  }
}
</script>

<style lang="scss">
.product-card {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  border-radius: 10rpx;
  background-color: #fff;
  position: relative;

  .identifying {
    position: absolute;
    background: #ffb634;
    border-radius: 10rpx 0rpx 10rpx 0px;
    font-size: 22rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #ffffff;
    padding: 6rpx 8rpx;
    top: 0;
    left: 0;
    z-index: 5;
  }

  .time-discount {
    position: absolute;
    background: #ff4b40;
    border-radius: 10rpx 0rpx 10rpx 0px;
    font-size: 22rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #ffffff;
    padding: 6rpx 8rpx;
    top: 0;
    left: 0;
    z-index: 5;
  }

  &.is-list {
    padding: 20rpx 20rpx 20rpx 15rpx;

    .image {
      flex-shrink: 0;
      width: 190rpx;
      height: 190rpx;
    }

    .info {
      flex: 1;
      margin-left: 15rpx;

      .name {
        flex: 1;
      }
    }
  }

  &.is-grid {
    flex-direction: column;
    padding: 0;

    .image {
      position: relative;
      padding-bottom: 100%;

      image {
        position: absolute;
        border-radius: 10rpx 10rpx 0 0;
      }
    }

    .info {
      padding: 10rpx;

      .name {
        /* margin: 15rpx 0 0;
          margin-bottom: 20rpx;
          height: 72rpx; */
        margin: 12rpx;
      }
      .earnings {
        margin: 10rpx 0;
      }

      .bottom {
        padding-bottom: 12rpx;
      }
    }
  }

  &.is-three,
  &.is-four {
    flex-direction: column;
    padding: 0;

    .image {
      position: relative;
      padding-bottom: 100%;

      image {
        position: absolute;
        border-radius: 10rpx 10rpx 0 0;
      }
    }

    .info {
      padding: 10rpx;

      .name {
        margin: 15rpx 0 0;
        // margin-bottom: 20rpx;
      }

      .bottom {
        padding-bottom: 12rpx;
      }
    }
  }

  &.is-largest {
    flex-direction: column;

    .image {
      position: relative;
      padding-bottom: 100%;
      border-radius: 10rpx 10rpx 0 0;
      z-index: 1;

      image {
        position: absolute;
        border-radius: 10rpx 10rpx 0 0;
      }
    }

    .info {
      padding: 20rpx;

      .name {
        margin-top: 15rpx;
        // margin-bottom: 20rpx;
      }

      .bottom {
        padding-bottom: 12rpx;
      }
    }
  }

  .image {
    position: relative;

    image {
      width: 100%;
      height: 100%;
    }

    .sold-out {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 10rpx 10rpx 0 0;
      background-color: rgba(0, 0, 0, 0.5);
      font-size: 132rpx;
      color: #fff;
      z-index: 1;
    }
  }

  .info {
    display: flex;
    flex-direction: column;

    .earnings {
      font-size: 24rpx;
      color: #444444ff;
      margin: 10rpx 0;
      min-height: 40rpx;

      .zeng {
        max-width: 90%;
        display: inline-block;
        padding: 2rpx 4rpx;
        border-radius: 8rpx;
        color: #ff4c40;
        border: 1rpx solid #ff4c40;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-break: break-all;
        /* &:nth-child(n+1){
            margin-left: 10rpx;
          } */
        margin-right: 10rpx;
      }
    }

    .name {
      // line-height: 30rpx;
      font-size: 26rpx;
      font-weight: 500;
      color: #000;
      word-break: break-all;
    }

    .bottom {
      display: flex;
      justify-content: space-between;
      position: relative;

      .price-wrap {
        display: flex;
        align-items: baseline;
        font-weight: bold;

        .price {
          display: flex;
          align-items: baseline;
          font-size: 30rpx;
          color: #ff4b40;
          // .point {
          //   font-size: 22rpx;
          //   vertical-align: baseline;
          // }
        }

        .original-price {
          margin-left: 4rpx;
          text-decoration: line-through;
          font-size: 20rpx;
          color: gray;
        }
      }

      .icongouwuche-tianchong {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color: #ff4b40;
        font-size: 26rpx;
        color: #fff;
      }
    }
  }
}
</style>
