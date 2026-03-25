<template>
  <view>
    <view class="page-section-spacing" :class="['product-card', { 'is-three': radio == 1, 'is-four': radio == 2 }]">
      <scroll-view class="scroll-view_H" :show-scrollbar="false" :scroll-left="toIndexWidth" :scroll-x="true">
        <view
          v-for="(item, index) in list"
          :id="item.goodsid"
          :key="index"
          :class="['scroll-view-item']"
          @tap="handleOpenDetail(item.goodsid)"
        >
          <view class="img">
            <image mode="aspectFit" :lazy-load="true" :src="item.picurl" />
          </view>
          <view v-if="isMemberPord" class="zeng">会员价</view>
          <view v-if="isMemberPord" class="text">￥{{ item.minmemberprice }}</view>
          <view v-else-if="item.istimediscount" class="text">
            ￥{{ item.timediscount && item.timediscount.minprice }}
          </view>
          <view v-else-if="item.isspellgroup" class="text">
            ￥{{ item.spellgroupgoods && item.spellgroupgoods.price }}
          </view>
          <view v-else-if="item.isseckillactivity" class="text">
            ￥{{ item.seckillactivity && item.seckillactivity.seckillprice }}
          </view>
          <view v-else-if="item.goodsreserveact" class="text">
            ￥{{ item.goodsreserveact && item.goodsreserveact.minprice }}
          </view>
          <view v-else class="price" style="font-size: 30rpx; color: red; text-align: center">
            ￥{{ item.price | filterRmb }}
          </view>
          <view
            v-if="checked && item.goodsreserveact"
            class="price"
            style="text-decoration: line-through; font-size: 20rpx; text-align: center"
          >
            ￥{{ item.price }}
          </view>
          <view v-else class="price" style="text-decoration: line-through; font-size: 20rpx; text-align: center">
            ￥{{ item.originalprice }}
          </view>
          <!-- <view class="price" v-if="checkeds" style="color:#000;text-align: center;">{{item.AuthorIntroduction}}</view> -->
        </view>
      </scroll-view>
    </view>
  </view>
</template>
<script>
// import SkuPopup from '@/components/Product/SkuPopup.vue'
/* #ifdef MP */
import { navigateTo } from '@/utils/unis'
/* #endif */
export default {
  components: {
    // SkuPopup
  },
  props: {
    layout: {
      type: String,
      default: 'list'
    },
    // isShowAddCart: {
    //   type: Boolean,
    //   default: true
    // },
    // pid: {
    //   type: Number,
    //   default: 0
    // },
    radio: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default() {
        return []
      }
    },
    // Bgcolor: {
    //   type: String,
    //   default: '#ffffff'
    // },
    checked: {
      type: Boolean,
      default: true
    },
    checkeds: {
      type: Boolean,
      default: true
    },
    isMemberPord: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    handleOpenDetail(id) {
      /* #ifdef MP */
      navigateTo('/cloudStore/product/detail?id=' + id)
      /* #endif */
    }
  }
}
</script>
<style lang="scss">
// .gray-color4 {
//   color: $uni-text-color3;
// }
.scroll-view_H {
  white-space: nowrap;
  .scroll-view-item {
    font-size: 0;
    background-color: #fff;
  }
  .text {
    font-size: 30rpx;
    color: #ff4b40;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    word-break: break-all;
  }
}
.is-three {
  .scroll-view_H {
    display: flex;
    overflow-x: scroll;
    padding-bottom: 0;
    .scroll-view-item {
      display: inline-block;
      text-align: center;
      width: 214rpx;
      margin-right: 20rpx;
      padding: 0;
      margin-bottom: 10rpx;
      box-sizing: border-box;
      background-color: #fff;
      border-radius: 5rpx;

      .img {
        height: 214rpx;
        width: 214rpx;
        position: relative;
        display: inline-block;
        overflow: hidden;

        image {
          object-fit: contain;
          vertical-align: top;
          // display: block;
          width: 100%;
          height: 100%;
        }
      }
    }
    .text {
      padding: 20rpx;
    }
  }
}
.is-four {
  .scroll-view_H {
    .scroll-view-item {
      display: inline-block;
      width: 164rpx;
      margin-right: 8rpx;
      image {
        display: block;
        width: 100%;
        height: 164rpx;
        /* height: 100%; */
      }
    }
    .text {
      padding: 20rpx 0;
    }
  }
}
.zeng {
  max-width: 90%;
  height: 40rpx;
  display: inline-block;
  padding: 2rpx 4rpx;
  border-radius: 8rpx;
  color: #ff4c40;
  font-size: 24rpx;
  line-height: 40rpx;
  border: 1rpx solid #ff4c40;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
  margin-right: 10rpx;
}
</style>
