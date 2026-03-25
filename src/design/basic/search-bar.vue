<template>
  <view
    :class="['product-search', `is-${searchData.Style}`, `is-${searchData.type}`]"
    :style="{ padding: searchData.Gap ? '20rpx 30rpx' : '20rpx 0' }"
    @tap="handleClick"
  >
    <view class="product-search__inner">
      <view class="product-search__icon iconfont iconsousuo" />
      <view v-if="isNavigate" class="product-search__input">{{ searchData.Placeholder }}</view>
      <view v-else class="product-search__input">
        <input
          v-model.trim="keyword"
          type="text"
          :focus="isAutoFocus"
          :placeholder="searchData.Placeholder"
          @confirm="handleConfirm"
        />
      </view>
      <!-- 扫码 -->
      <view
        v-if="IsGoodsBarcodeSearch == 1 && isscan == 1"
        style="font-size: 35rpx; width: 60rpx; text-align: center"
        class="product-search__icon iconfont iconsaoyisao"
        @click.stop="handleScan"
      />
    </view>
    <view v-if="isButton" class="product-search-button" @tap="handleConfirm">搜索</view>
  </view>
</template>

<script>
// #ifdef MP
import { GoodsList as GoodsListApi } from '@/api/Goods'
// #endif
export default {
  props: {
    searchData: {
      type: Object,
      default() {
        return {}
      }
    },
    isNavigate: {
      type: Boolean,
      default: false
    },
    isAutoFocus: {
      type: Boolean,
      default: true
    },
    isButton: Boolean,
    valData: {
      type: Object,
      default() {
        return {}
      }
    },
    isscan: {
      type: Number,
      default: 0 // 默认不显示扫码入口   1：显示
    }
  },
  data() {
    return {
      keyword: '',
      IsGoodsBarcodeSearch: 0 // 是否开启产品条码搜索商品 0.关闭,1.开启
    }
  },
  mounted() {
    if (JSON.stringify(this.valData) !== '{}') {
      this.keyword = this.valData.name
      this.handleConfirm()
    }
    this.IsGoodsBarcodeSearch = uni.getStorageSync('IsGoodsBarcodeSearch') || 0
    // this.IsGoodsBarcodeSearch = 1;
  },
  methods: {
    handleClick() {
      /* #ifdef MP */
      if (!this.isNavigate) {
        return false
      }
      uni.navigateTo({
        url: '/cloudStore/product/search'
      })
      /* #endif */
    },
    handleConfirm() {
      this.$emit('confirm', {
        keyword: this.keyword
      })
    },
    // 调起扫码
    handleScan() {
      /* #ifdef MP */
      uni.scanCode({
        scanType: ['barCode'],
        success: res => {
          let { result } = res
          result = result.trim()
          if (result) {
            uni.showLoading({
              title: '加载中',
              mask: true
            })
            GoodsListApi({
              PageIndex: 1,
              PageSize: 10,
              SortKey: 0,
              Direction: 0,
              SysSecondCategoryId: null,
              GoodsName: '',
              SysCategoryId: null,
              GoodsId: [],
              Barcode: result
            }).then(data => {
              uni.hideLoading()
              if (data.Return_data.TotalCount != 0) {
                let id = data.Return_data.Results[0].GoodsId || 0
                uni.navigateTo({
                  url: '/cloudStore/product/detail?id=' + id
                })
              } else {
                uni.showToast({
                  title: '扫描结果“[' + result + ']”,该店铺没有上架该商品或产品条码错误,请重新扫码或联系店家',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          } else {
            uni.showToast({
              title: '扫码失败，请重试',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: res => {
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'product-search';
.#{$prefix} {
  // padding: 20rpx 30rpx;
  padding: 20rpx 0;
  width: 100%;
  background-color: #fff;
  box-sizing: border-box;
  display: flex;
  &.is-round {
    .#{$prefix}__inner {
      height: 70rpx;
      background-color: #f2f2f2;
      border-radius: 70rpx;
      flex: 1;
      .#{$prefix}__input {
        flex: 1;
        input {
          width: 100%;
        }
      }
    }
  }
  &.is-store {
    padding: 0 20rpx;
    background-color: #f5f5f5;
    .#{$prefix}__inner {
      background-color: #ffffff;
      border-radius: 70rpx;
      .#{$prefix}__input {
        flex: 1;
        input {
          width: 100%;
        }
      }
    }
  }
  &.is-white {
    padding: 0 20rpx;
    background-color: #ffffff;
    .#{$prefix}__inner {
      background-color: #f5f5f5;
      border-radius: 70rpx;
      .#{$prefix}__input {
        flex: 1;
        input {
          width: 100%;
        }
      }
    }
  }
  &.is-subordinate {
    background-color: #f5f5f5;

    .#{$prefix}__inner {
      height: 70rpx;
      background-color: #fff;
      border-radius: 70rpx;
      flex: 1;

      .#{$prefix}__input {
        flex: 1;

        input {
          width: 100%;
        }
      }
    }
    .product-search-button {
      width: 120rpx;
      background-color: #fff;
      border-radius: 35rpx;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #000000;
      line-height: 70rpx;
      text-align: center;
    }
  }
  &.is-square {
    .#{$prefix}__inner {
      justify-content: center;
      background-color: #f2f2f2;
    }
  }
  &.is-square--white {
    .#{$prefix}__inner {
      justify-content: center;
      border: 1rpx solid #d5d5d5;
    }
  }
  .#{$prefix}__inner {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 36rpx;
    padding-right: 36rpx;
    box-sizing: border-box;
    width: 100%;
    .#{$prefix}__input {
      display: flex;
      align-items: center;
      margin-left: 10rpx;
      width: auto;
      height: 70rpx;
      font-size: 28rpx;
      color: #999;
    }
    .#{$prefix}__icon {
      width: 28rpx;
      // height: 28rpx;
      font-size: 26rpx;
      color: #999;
      z-index: 0;
    }
  }
}
</style>
