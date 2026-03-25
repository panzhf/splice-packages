<template>
  <view
    v-if="currentProducts.length > 0"
    :class="['Product-group', seckillData.Layout == 'grid' ? seckillData.Layout : '']"
  >
    <view
      v-for="(item, index) in currentProducts"
      :key="index"
      :class="['Product-group-box', seckillData.Layout == 'list' ? seckillData.Layout : '']"
      @click="handleOpenDetail(item.goodsid)"
    >
      <!-- <block v-if="item.IsSpellGroup"> -->
      <view class="Product-img">
        <v-img size="750" :src="item.picurl" mode="aspectFit" />
        <view class="Product-group-num">秒杀抢</view>
        <view
          v-if="
            seckillData.Layout !== 'list' &&
            (seckillData.IsShowSeckillPrice || seckillData.IsShowOriginPrice || seckillData.IsShowCountDown)
          "
          :class="['kill-box', countTimelist[index].timeType == 1 ? '' : 'green']"
        >
          <view class="kill-left">
            <v-price
              v-if="seckillData.IsShowSeckillPrice"
              :price="item.seckillactivity.seckillprice"
              double
              mode="seckill"
              show-sign
            ></v-price>
            <view v-if="seckillData.IsShowOriginPrice" class="price hui mb">价格:</view>
            <v-price
              v-if="seckillData.IsShowOriginPrice"
              class="xie hui"
              :price="item.price"
              double
              mode="seckill-orig"
              show-sign
            ></v-price>
          </view>
          <view v-if="seckillData.IsShowCountDown" class="kill-right">
            <view class="right-tips">距活动{{ countTimelist[index].timeType == 1 ? '结束' : '开始' }}还有</view>
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
        </view>
      </view>
      <view
        v-if="
          seckillData.IsShowSeckillPrice ||
          seckillData.IsShowOriginPrice ||
          seckillData.IsShowCountDown ||
          seckillData.IsShowName ||
          seckillData.IsShowInventory
        "
        class="group-box-info"
      >
        <view v-if="seckillData.IsShowName" class="group-box-name">{{ item.goodsname }}</view>
        <!-- <view class="group-box-tag">
         <block v-if="data.IsShowDesc">
          <view class="group-tag" v-if="item.AuthorIntroduction">{{ item.AuthorIntroduction }}</view>
         </block>
       </view> -->
        <view class="group-parameter">
          <view class="group-parameter-left">
            <view v-if="seckillData.IsShowInventory" class="parameter-ren">
              仅剩{{ item.seckillactivity.goodsseckillinventory }}件
            </view>
            <!-- <view class="group-tag" v-if="item.AuthorIntroduction && data.IsShowDesc">{{ item.AuthorIntroduction }}</view> -->
            <view>
              <view v-if="seckillData.IsShowDesc && item.seckillactivity.tag" class="group-tag dbk">
                {{ item.seckillactivity.tag }}
              </view>
            </view>

            <view v-if="seckillData.Layout == 'list'" class="price-box">
              <v-price
                v-if="seckillData.IsShowSeckillPrice"
                :price="item.seckillactivity.seckillprice"
                double
                mode="product-card"
                show-sign
              ></v-price>
              <view v-if="seckillData.IsShowOriginPrice" class="price hui mb ml10">价格:</view>
              <v-price
                v-if="seckillData.IsShowOriginPrice"
                class="xie hui"
                :price="item.price"
                double
                mode="seckill-orig2"
                show-sign
              ></v-price>
            </view>
            <!-- 列倒计时 -->
            <view v-if="seckillData.Layout == 'list' && seckillData.IsShowCountDown" class="kill-time">
              <view class="right-tips">距活动{{ countTimelist[index].timeType == 1 ? '结束' : '开始' }}还有</view>
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
          </view>
          <view
            v-if="
              seckillData.Layout !== 'list' &&
              (seckillData.IsShowSeckillPrice || seckillData.IsShowOriginPrice || seckillData.IsShowCountDown)
            "
            class="group-parameter-right"
          >
            <view v-if="countTimelist[index].timeType == 1" class="group-starting">去抢购</view>
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
import dayjs from 'dayjs'
import { time } from '@/mixins/time.js'
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
  components: {},
  mixins: [time],
  props: {
    seckillData: {
      type: Object,
      default() {
        return {}
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
    seckillData() {
      // deep:true, //深度监听设置为 true
      //  handler:function(newV,oldV){
      //  }
    }
  },
  created() {
    this.getlist()
  },
  methods: {
    getlist() {
      /* #ifdef MP */
      GoodsList({
        PageIndex: 1,
        PageSize: this.seckillData.Products.length,
        SortKey: 0,
        Direction: 0,
        GoodsName: '',
        SysCategoryId: null,
        GoodsId: this.seckillData.Products
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        if (d.return_code === 0) {
          if (d.return_data && d.return_data.results) {
            // 根据id顺序排序
            let r = d.return_data.results || []
            this.products = this.seckillData.Products.map(item => r.find(i => i.goodsid === item)).filter(Boolean)

            let currentProducts = this.products.filter(item => {
              return (
                item.seckillactivity &&
                item.seckillactivity.goodsseckillinventory > 0 &&
                item.status === 1 &&
                item.isseckillactivity === 1
              )
            })
            this.handleTime(currentProducts)
          }
        }
      })
      /* #endif */
      /* #ifdef H5-DECORATE */
      let currentProducts = this.seckillData.selectedList.map(item => {
        item.enablestockcount = 100
        item.seckillactivity = {
          goodsseckillinventory: item.seckillinventory,
          seckillprice: item.seckillprice,
          nowtime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          starttime: item.starttime,
          endtime: item.endtime
        }
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
        if (dayjs(item.nowtime).valueOf() >= dayjs(item.seckillactivity.starttime).valueOf()) {
          countTimeItem.timeType = 1
          t = dayjs(item.seckillactivity.endtime)
          diff = Math.floor(t.diff(item.nowtime) / 1000)
        } else {
          countTimeItem.timeType = 0
          t = dayjs(item.seckillactivity.starttime)
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
        position: absolute;
        left: 0;
        right: 0;
        // padding: 18rpx 20rpx;
        // height: 64rpx;
        height: 100rpx;
        padding: 0 20rpx;
        bottom: 0;
        background-color: #ff4b40;
        // width: 650rpx;
        display: flex;
        justify-content: space-between;
        color: #fff;
        align-items: center;
        .kill-left {
          display: flex;
          align-items: flex-end;
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
      .green {
        background: #1dc06a;
        .group-time-item {
          color: #1dc06a !important;
        }
      }
      .Product-group-num {
        position: absolute;
        background: #ff4b40;
        border-radius: 0px 21rpx 21rpx 0rpx;
        padding: 4rpx 20rpx;
        font-size: 24rpx;
        font-family: PingFang SC Bold, PingFang SC Bold-Bold;
        font-weight: 700;
        top: 30rpx;
        left: 0;
        color: #fff;
      }
      image {
        width: 100%;
        height: 100%;
      }
    }
    .group-box-info {
      padding: 26rpx 30rpx;
      .group-box-name {
        font-size: 28rpx;
        font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        font-weight: 500;
        margin-top: 18rpx;
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
      .group-parameter {
        display: flex;
        justify-content: space-between;
        margin-top: 26rpx;
        align-items: flex-end;
        .group-parameter-left {
          display: flex;
          flex-direction: column-reverse;

          .parameter-ren {
            color: #999999;
            font-size: 24rpx;
            margin-top: 16rpx;
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
          .group-starting {
            background: #ff4b40;
            border-radius: 30rpx;
            font-size: 26rpx;
            font-weight: 700;
            color: #ffffff;
            text-align: center;
            padding: 14rpx 30rpx;
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
      .group-parameter {
        margin-top: 8rpx;
        .group-parameter-left {
          flex-direction: column;
          .kill-time {
            display: flex;
            .right-tips {
              font-size: 24rpx;
              font-family: PingFang SC Bold, PingFang SC Bold-Bold;
              font-weight: 700;
              color: #ff4b40;
            }
            .group-time {
              display: flex;
              align-items: center;
              font-size: 21rpx;
              font-weight: 700;
              color: #ff4b40;
              .group-time-item {
                background: #ff4b40;
                border-radius: 5rpx;
                color: #ffffff;
                font-weight: 700;
                padding: 4rpx;
                margin-right: 8rpx;
                margin-left: 8rpx;
              }
            }
          }
          .parameter-ren {
            margin-top: 0;
          }
          .parameter-price {
            display: flex;
            flex-wrap: wrap;
            width: 200rpx;
            .original-price {
              margin-left: 0;
            }
          }
          .price-box {
            margin: 14rpx 0;
          }
        }
        .group-parameter-right {
          display: flex;
          align-items: flex-end;
        }
      }
    }
  }
}
.grid {
  display: flex;
  flex-wrap: wrap;
  margin-left: 10px;
  margin-right: 10px;
  .Product-group-box {
    width: 345px;
    height: 345px;
    background: #ffffff;
    border-radius: 10px;
  }
}
</style>
