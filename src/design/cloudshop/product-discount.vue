<template>
  <view
    v-if="currentProducts.length > 0"
    :class="[
      'Product-group',
      discountData.Layout == 'largest' || discountData.Layout == 'grid' ? discountData.Layout : ''
    ]"
  >
    <view
      v-for="(item, index) in currentProducts"
      :key="index"
      :class="['Product-group-box', discountData.Layout == 'list' ? discountData.Layout : '']"
      @click="handleOpenDetail(item.goodsid)"
    >
      <!-- <block v-if="item.IsSpellGroup"> -->
      <view class="Product-img">
        <v-img size="750" :src="item.picurl" mode="aspectFit" />
        <view class="Product-discount-num">限时促销</view>
        <view
          v-if="discountData.IsShowCountDown || discountData.IsShowDiscountPrice || discountData.IsShowOriginPrice"
          :class="[
            'kill-box',
            countTimelist[index].timeType == 1 ? '' : 'green',
            discountData.Layout == 'largest' ? '' : 'h48'
          ]"
        >
          <template v-if="discountData.Layout == 'largest'">
            <view class="kill-left">
              <view v-if="discountData.IsShowDiscountPrice" class="price-yh">
                <v-price
                  :price="item.timediscount.minprice"
                  double
                  mode="discount"
                  show-sign
                  :is-stair="item.timediscount && item.timediscount.isstair"
                ></v-price>
                <!-- <div class="tag">限时折扣</div> -->
              </view>
              <v-price
                v-if="discountData.IsShowOriginPrice"
                class="xie hui"
                :price="item.price"
                double
                mode="seckill-orig"
                show-sign
              ></v-price>
            </view>
            <view v-if="discountData.IsShowCountDown" class="kill-right">
              <view class="right-tips">活动{{ countTimelist[index].timeType == 1 ? '剩余' : '开始' }}时间</view>
              <view class="group-time">
                <text class="group-time-item">
                  {{ countTimelist[index].day == '0' ? '00' : countTimelist[index].day }}
                </text>
                :
                <text class="group-time-item">
                  {{ countTimelist[index].hour == '0' ? '00' : countTimelist[index].hour }}
                </text>
                :
                <text class="group-time-item">
                  {{ countTimelist[index].minute == '0' ? '00' : countTimelist[index].minute }}
                </text>
                :
                <text class="group-time-item">{{ countTimelist[index].second }}</text>
              </view>
            </view>
          </template>
          <template v-else>
            <view v-if="discountData.IsShowCountDown" :class="[discountData.Layout == 'list' ? 'time-min' : '']">
              <text class="time-tips">
                <text v-if="countTimelist[index].timeType != 1">距</text>
                活动{{ countTimelist[index].timeType == 1 ? '剩余' : '开始' }}
                <text v-if="countTimelist[index].timeType == 1">时间</text>
              </text>
              <text class="group-time-item white">
                {{ countTimelist[index].day == '0' ? '00' : countTimelist[index].day }}
              </text>
              :
              <text class="group-time-item white">
                {{ countTimelist[index].hour == '0' ? '00' : countTimelist[index].hour }}
              </text>
              :
              <text class="group-time-item white">
                {{ countTimelist[index].minute == '0' ? '00' : countTimelist[index].minute }}
              </text>
              :
              <text class="group-time-item white">{{ countTimelist[index].second }}</text>
            </view>
          </template>
        </view>
      </view>
      <view class="group-box-info">
        <view v-if="discountData.IsShowName" class="group-box-name">
          <view class="ellipsis-2">{{ item.goodsname }}</view>
        </view>
        <view v-if="discountData.Layout == 'largest'" class="group-parameter">
          <view class="group-parameter-left">
            <view class="parameter-ren">
              <span v-if="discountData.IsShowHaveAmount">
                已抢
                <text class="dis-num">{{ item.timediscount && item.timediscount.buynumber }}</text>
                件
              </span>
              <span v-if="discountData.IsShowSurplus">
                仅剩
                <text class="dis-num">{{ item.enablestockcount }}</text>
                件
              </span>
            </view>
            <view>
              <v-progress v-if="discountData.IsShowProgress" :num="item.progress"></v-progress>
            </view>
            <view v-if="discountData.Layout != 'largest'" class="price-box">
              <v-price
                v-if="discountData.IsShowDiscountPrice"
                :price="item.timediscount.minprice"
                double
                mode="product-card"
                show-sign
                :is-stair="item.timediscount && item.timediscount.isstair"
              ></v-price>
              <view v-if="discountData.IsShowOriginPrice" class="price hui mb ml10"></view>
              <v-price
                v-if="discountData.IsShowOriginPrice"
                class="xie hui"
                :price="item.price"
                double
                mode="seckill-orig2"
                show-sign
              ></v-price>
            </view>
          </view>
          <view class="group-parameter-right">
            <view v-if="countTimelist[index].timeType == 1 && discountData.IsShowBuy" class="group-starting">
              立即抢购
            </view>
          </view>
        </view>
        <view v-else class="group-parameter-wrap">
          <view v-if="discountData.IsShowProgress">
            <v-progress :num="item.progress"></v-progress>
          </view>
          <view v-if="discountData.IsShowSurplus" class="parameter-ren">
            <span>
              已抢
              <text class="dis-num">{{ item.timediscount && item.timediscount.buynumber }}</text>
              件
            </span>
            <span>
              仅剩
              <text class="dis-num">{{ item.enablestockcount }}</text>
              件
            </span>
          </view>
          <view class="group-parameter">
            <view class="group-parameter-left">
              <view v-if="discountData.Layout != 'largest'" class="price-box">
                <v-price
                  v-if="discountData.IsShowDiscountPrice"
                  :price="item.timediscount.minprice"
                  double
                  mode="product-card"
                  show-sign
                  :is-stair="item.timediscount && item.timediscount.isstair"
                ></v-price>
                <view v-if="discountData.IsShowOriginPrice" class="price hui mb ml10"></view>
                <v-price
                  v-if="discountData.IsShowOriginPrice"
                  class="xie hui"
                  :price="item.price"
                  double
                  mode="seckill-orig2"
                  show-sign
                ></v-price>
              </view>
            </view>
            <view class="group-parameter-right">
              <view v-if="countTimelist[index].timeType == 1 && discountData.IsShowBuy" class="group-starting">
                立即抢购
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- </block> -->
    </view>
  </view>
</template>

<script>
// #ifdef MP
import { GoodsList } from '@/api/Goods'
import { navigateTo } from '@/utils/unis'
// #endif
// import ProductHeader from "@/components/Product/ProductHeader.vue";
// import ProductCard from "@/components/Product/ProductCard.vue";
import dayjs from 'dayjs'
import { time } from '@/mixins/time.js'
import VProgress from './components/progress.vue'
// "Sort: 列表排序
// Layout: 'largest',
// IsShowName: 1, // 显示商品名称
// IsShowDesc: 1, // 显示商品描述
// IsShowOriginPrice: 1, // 显示商品原价
// IsShowSeckillPrice: 1, // 显示秒杀价
// IsShowCountDown: 1, // 显示抢购倒计时
// IsShowInventory: 1, // 显示库存
export default {
  //混入文件
  components: {
    // ProductHeader,
    // ProductCard,
    VProgress
  },
  mixins: [time],
  props: {
    discountData: {
      type: Object,
      default() {
        return {
          Products: []
        }
      }
    }
  },
  data() {
    return {
      products: [],
      currentProducts: [],
      config: {},
      countTimelist: []
    }
  },
  watch: {
    discountData: {
      deep: true,
      immediate: true,
      handler(n) {
        this.getlist()
      }
    }
  },
  created() {
    // this.getlist()
  },
  methods: {
    getlist() {
      /* #ifdef MP */
      GoodsList({
        PageIndex: 1,
        PageSize: this.discountData.Products.length,
        SortKey: 0,
        MarketingSort: Number(this.discountData.Sort), // (0-默认 1-活动剩余时间从少到多 2活动添加时间从早到晚 3-参与拼团人数从多到少)
        Direction: 0,
        GoodsName: '',
        SysCategoryId: null,
        GoodsId: this.discountData.Products
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        if (d.return_code === 0) {
          if (d.return_data && d.return_data.results) {
            // 根据id顺序排序
            let r = d.return_data.results || []
            this.products = this.discountData.Products.map(item => r.find(i => i.goodsid === item)).filter(Boolean)

            let currentProducts = this.products.filter(item => {
              if (item.timediscount) {
                // item.progress=(item.timediscount.buynumber / (item.timediscount.buynumber + item.enablestockcount)).toFixed(1)
                item.progress = (
                  (item.timediscount.buynumber / (item.timediscount.buynumber + item.enablestockcount)) *
                  100
                ).toFixed(2)
              }
              return item.status === 1 && item.timediscount
            })
            this.handleTime(currentProducts)
          }
        }
      })
      /* #endif */
      /* #ifdef H5-DECORATE */
      let startTime =
        this.discountData.activities &&
        this.discountData.activities.length > 0 &&
        this.discountData.activities[0].starttime
          ? this.discountData.activities[0].starttime
          : dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
      let endTime =
        this.discountData.activities &&
        this.discountData.activities.length > 0 &&
        this.discountData.activities[0].endtime
          ? this.discountData.activities[0].endtime
          : dayjs().add(2, 'day').format('YYYY-MM-DD HH:mm:ss')
      let currentProducts = this.discountData.selectedList.map(item => {
        item.enablestockcount = 100
        item.timediscount = {
          minprice: item.minprice,
          isstair: item.isstair,
          buynumber: 10,
          nowtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          starttime: startTime,
          endtime: endTime
        }
        item.progress = (
          (item.timediscount.buynumber / (item.timediscount.buynumber + item.enablestockcount)) *
          100
        ).toFixed(2)
        return item
      })
      this.handleTime(currentProducts)
      /* #endif */
    },
    handleTime(currentProducts) {
      this.countTimelist = []
      this.currentProducts = currentProducts
      currentProducts.forEach((item, index) => {
        let countTimeItem = {
          timeType: 0, //0未开始，1已开始
          diff: 0,
          day: 0,
          hour: 0,
          minute: 0,
          second: 0
        }
        let t
        let diff
        if (dayjs(item.nowtime).valueOf() >= dayjs(item.timediscount.starttime).valueOf()) {
          countTimeItem.timeType = 1
          t = dayjs(item.timediscount.endtime)
          diff = Math.floor(t.diff(item.nowtime) / 1000)
        } else {
          countTimeItem.timeType = 0
          t = dayjs(item.timediscount.starttime)
          diff = Math.floor(t.diff(item.nowtime) / 1000)
        }
        countTimeItem.diff = diff
        this.countTimelist.push(countTimeItem)
      })
      this.countDown2()
    },
    handleOpenDetail(id) {
      /* #ifdef MP */
      navigateTo('/cloudStore/product/detail?id=' + id)
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
.dbk {
  display: inline-block;
}

.Product-group {
  // padding: 0 30rpx;
  .Product-group-box {
    margin-top: 20rpx;
    background-color: #fff;
    border-radius: 10rpx;
    overflow: hidden;

    .Product-img {
      width: 690rpx;
      height: 690rpx;
      position: relative;
      margin: 0 auto;

      .kill-box {
        box-sizing: border-box;
        position: absolute;
        padding: 0 20rpx;
        // width: 650rpx;
        // height: 64rpx;
        width: 100%;
        height: 120rpx;
        bottom: 0;
        background-color: #ff4b40;
        display: flex;
        justify-content: space-between;
        color: #fff;
        align-items: center;

        .kill-left {
          display: flex;
          flex-direction: column;

          // align-items: flex-end;
          .mb {
            margin-bottom: 16rpx;
          }

          .fh {
            font-size: 36rpx;
            // margin-right: 15rpx;
          }

          .money {
            font-size: 72rpx;
            font-weight: bold;
          }

          .hui {
            opacity: 0.4;
            font-size: 22rpx;
            font-family: PingFang SC Medium, PingFang SC Medium-Medium;
            font-weight: 500;
            text-align: left;
            color: #ffffff;
          }

          .price {
            margin-left: 14rpx;
          }

          .price-yh {
            display: flex;
            align-items: center;

            .tag {
              font-size: 22rpx;
              font-family: PingFang SC Medium, PingFang SC Medium-Medium;
              font-weight: bold;
              text-align: left;
              color: #ff4b40;
              background: #ffffff;
              border-radius: 17rpx 17rpx 17rpx 0;
              height: 34rpx;
              padding: 0 10rpx;
              margin-left: 20rpx;
            }
          }
        }

        .kill-right {
          display: flex;
          flex-direction: column;
          justify-content: center;

          .right-tips {
            font-size: 24rpx;
            font-weight: 700;
            text-align: right;
          }

          .group-time {
            margin-top: 4rpx;

            .group-time-item {
              background: #ffffff;
              border-radius: 5rpx;
              font-size: 24rpx;
              font-weight: bold;
              color: #ff4b40;
              margin-right: 8rpx;
              margin-left: 8rpx;
              padding: 4rpx 4rpx;

              &:last-child {
                margin-right: 0rpx;
              }
            }
          }
        }
      }

      .h48 {
        height: 48rpx;
        padding: 10rpx 14rpx;
        font-size: 22rpx;

        .time-tips {
          margin-right: 10rpx;
        }
      }

      .green {
        background: #1dc06a;

        .group-time-item {
          color: #1dc06a !important;
        }

        .white {
          color: #fff !important;
        }
      }

      .Product-discount-num {
        position: absolute;
        background: #ff4b40;
        border-radius: 10rpx 0rpx 10rpx 0px;
        padding: 4rpx 20rpx;
        font-size: 24rpx;
        font-family: PingFang SC Bold, PingFang SC Bold-Bold;
        font-weight: 700;
        top: 0rpx;
        left: 0;
        color: #fff;
      }
      image {
        width: 100%;
        height: 100%;
      }
    }

    .group-box-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 26rpx 30rpx;

      .group-box-name {
        font-size: 28rpx;
        font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        font-weight: 500;
        // margin-top: 18rpx;
        // padding-left: 20rpx;
      }

      .group-box-tag {
        display: flex;
        flex-wrap: wrap;
        // .group-tag{
        //   font-size: 22rpx;
        //   font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        //   font-weight: 500;
        //   color: #ff4b40;
        //   padding: 2rpx 10rpx;
        //   border: 1rpx solid #ff4b40;
        //   border-radius: 5rpx;
        //   margin-right: 10rpx;
        //   margin-top: 14rpx;
        // }
      }

      .group-parameter-wrap {
        // margin-bottom: 10rpx;
        .parameter-ren {
          color: #999999;
          font-size: 24rpx;
          margin-top: 16rpx;

          span:last-child {
            margin-left: 15rpx;
          }
        }

        .group-parameter {
          display: flex;
          justify-content: space-between;
          margin-top: 26rpx;
          align-items: center;

          .group-parameter-left {
            display: flex;
            flex-direction: column-reverse;
            flex: 1;

            .group-tag {
              font-size: 22rpx;
              font-family: PingFang SC Medium, PingFang SC Medium-Medium;
              font-weight: 500;
              color: #ff4b40;
              padding: 2rpx 10rpx;
              border: 1rpx solid #ff4b40;
              border-radius: 5rpx;
              margin-right: 10rpx;
              margin-top: 14rpx;
            }

            .price-box {
              display: flex;
              flex-direction: column;
              // align-items: center;
              font-size: 22rpx;
              color: #999999;

              .ml10 {
                margin-left: 10rpx;
              }
            }

            .parameter-price {
              .price {
                font-size: 36rpx;
                color: #ff4b40;
                font-weight: 800;
              }

              .original-price {
                font-size: 26rpx;
                font-weight: 500;
                color: #cccccc;
                text-decoration: line-through;
                margin-left: 10rpx;
              }
            }
          }

          .group-parameter-right {
            margin-left: 40rpx;

            .group-starting {
              background: #ff4b40;
              border-radius: 30rpx;
              font-size: 26rpx;
              font-weight: 700;
              color: #ffffff;
              text-align: center;
              padding: 14rpx 20rpx;
            }
          }
        }
      }
    }
  }

  .list {
    display: flex;

    .Product-img {
      width: 300rpx;
      height: 300rpx;
      // border-radius: 10rpx;
      overflow: hidden;
    }

    .group-box-info {
      flex: 1;
      padding: 0 18rpx;

      .group-box-name {
        // min-height: 80rpx;
        width: 400rpx;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-top: 26rpx;
        padding-left: 0;
      }

      .group-box-tag {
        min-height: 84rpx;

        .group-tag {
          height: 30rpx;
          margin-top: 6rpx;
        }
      }
    }
  }
}

.grid {
  display: flex;
  flex-wrap: wrap;
  padding-left: 20rpx;
  padding-right: 20rpx;
  box-sizing: border-box;

  .Product-group-box {
    width: 345rpx;
    background: #ffffff;
    border-radius: 10px;
    box-sizing: border-box;
    margin-right: 20rpx;

    &:nth-of-type(2n) {
      margin-right: 0;
    }

    .group-box-name {
      margin-top: 0 !important;
      margin-bottom: 20rpx;
    }

    .Product-img {
      width: 345rpx;
      height: 345rpx;

      /* .kill-box {
          width: 100%;
          box-sizing: border-box;
      } */
      image {
        width: 100%;
        height: 100%;
      }

      .time-tips {
        margin-right: 60rpx !important;
      }
    }

    .group-box-info {
      padding: 26rpx 20rpx 10rpx;
    }
  }
}

.largest {
  .group-parameter {
    display: flex;
    justify-content: space-between;
    margin-top: 26rpx;
    align-items: flex-end;

    .group-parameter-left {
      display: flex;
      flex-direction: column-reverse;
      flex: 1;

      .parameter-ren {
        color: #999999;
        font-size: 24rpx;
        margin-top: 16rpx;

        span:last-child {
          margin-left: 15rpx;
        }
      }

      .group-tag {
        font-size: 22rpx;
        font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        font-weight: 500;
        color: #ff4b40;
        padding: 2rpx 10rpx;
        border: 1rpx solid #ff4b40;
        border-radius: 5rpx;
        margin-right: 10rpx;
        margin-top: 14rpx;
      }

      .price-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 22rpx;
        color: #999999;

        .ml10 {
          margin-left: 10rpx;
        }
      }

      .parameter-price {
        .price {
          font-size: 36rpx;
          color: #ff4b40;
          font-weight: 800;
        }

        .original-price {
          font-size: 26rpx;
          font-weight: 500;
          color: #cccccc;
          text-decoration: line-through;
          margin-left: 10rpx;
        }
      }
    }

    .group-parameter-right {
      margin-left: 48rpx;

      .group-starting {
        background: #ff4b40;
        border-radius: 30rpx;
        font-size: 26rpx;
        font-weight: 700;
        color: #ffffff;
        text-align: center;
        padding: 14rpx 20rpx;
      }
    }
  }
}

.dis-num {
  color: #ff4b40;
}
</style>
