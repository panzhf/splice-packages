<template>
  <view v-if="currentProducts.length > 0" class="Product-group">
    <view
      v-for="item in currentProducts"
      :key="item.goodsid"
      :class="['Product-group-box', groupData.Layout == 'list' ? groupData.Layout : '']"
      @click="handleOpenDetail(item.goodsid)"
    >
      <block v-if="item.isspellgroup">
        <view class="Product-img">
          <v-img size="750" :src="item.picurl" mode="aspectFit" />
          <view class="Product-group-num">{{ item.spellgroupgoods.groupcondition }}</view>
        </view>
        <view class="group-box-info">
          <view v-if="groupData.IsShowName" class="group-box-name">{{ item.goodsname }}</view>
          <view class="group-box-tag">
            <block v-if="groupData.IsShowDesc">
              <view v-if="item.authorintroduction" class="group-tag">{{ item.authorintroduction }}</view>
            </block>
          </view>
          <view class="group-parameter">
            <view class="group-parameter-left">
              <view v-if="groupData.IsShowPersonNumber" class="parameter-ren">
                {{ item.spellgroupgoods.havenumber }}人已参团
              </view>
              <template v-if="groupData.Layout == 'list'">
                <view>
                  <v-price
                    v-if="groupData.IsShowGroupPrice"
                    :price="item.spellgroupgoods.price"
                    double
                    show-sign
                    mode="card"
                  ></v-price>
                </view>
                <view style="margin-left: -8rpx">
                  <v-price
                    v-if="groupData.IsShowOriginPrice"
                    :price="item.price"
                    double
                    show-sign
                    mode="original"
                  ></v-price>
                </view>
              </template>
              <template v-else>
                <view class="parameter-price">
                  <v-price
                    v-if="groupData.IsShowGroupPrice"
                    :price="item.spellgroupgoods.price"
                    double
                    show-sign
                    mode="card"
                  ></v-price>
                  <v-price
                    v-if="groupData.IsShowOriginPrice"
                    :price="item.price"
                    double
                    show-sign
                    mode="original"
                  ></v-price>
                </view>
              </template>
            </view>
            <view class="group-parameter-right">
              <view class="group-starting">去开团</view>
            </view>
          </view>
        </view>
      </block>
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
// "Sort: 列表排序
// IsShowName":  是否显示商品名称 0-否  1-是
// ,"IsShowDesc":, 是否显示商品描述 0-否  1-是
// "IsShowPersonNumber": 是否显示人数 0-否  1-是
// "IsShowGroupPrice": 是否显示拼团价格 0-否  1-是
// "IsShowOriginPrice": 是否显示原始价格 0-否  1-是
export default {
  components: {
    // ProductHeader,
    // ProductCard
  },
  props: {
    groupData: {
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
      currentProducts: []
    }
  },
  watch: {
    groupData: {
      deep: true,
      immediate: true,
      handler(n) {
        this.getlist()
      }
    }
  },
  methods: {
    getlist() {
      /* #ifdef MP */
      GoodsList({
        PageIndex: 1,
        PageSize: this.groupData.Products.length,
        SortKey: 0,
        Direction: 0,
        GoodsName: '',
        SysCategoryId: null,
        GoodsId: this.groupData.Products
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        if (d.return_code === 0) {
          if (d.return_data && d.return_data.results) {
            // 根据id顺序排序
            let r = d.return_data.results || []
            this.products = this.groupData.Products.map(item => r.find(i => i.goodsid === item)).filter(Boolean)

            this.currentProducts = this.products.filter(item => {
              return item.enablestockcount > 0 && item.status === 1 && item.isspellgroup
            })
          }
        }
      })
      /* #endif */
      /* #ifdef H5-DECORATE */
      this.currentProducts = this.groupData.selectedList.map(item => {
        item.isspellgroup = 1
        item.spellgroupgoods = {
          price: item.friststairprice,
          havenumber: 2,
          groupcondition: item.groupcondition
        }
        return item
      })
      /* #endif */
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
      padding: 26rpx 20rpx;
      .group-box-name {
        font-size: 28rpx;
        font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        font-weight: 500;
        margin-top: 18rpx;
      }
      .group-box-tag {
        display: flex;
        flex-wrap: wrap;
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
      }
      .group-parameter {
        display: flex;
        justify-content: space-between;
        margin-top: 26rpx;
        .group-parameter-left {
          display: flex;
          flex-direction: column-reverse;

          .parameter-ren {
            color: #999999;
            font-size: 24rpx;
            margin-top: 16rpx;
          }
          .parameter-price {
            display: flex;
            align-items: center;
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
        width: 350rpx;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-top: 26rpx;
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
        }
        .group-parameter-right {
          display: flex;
          align-items: flex-end;
        }
      }
    }
  }
}
</style>
