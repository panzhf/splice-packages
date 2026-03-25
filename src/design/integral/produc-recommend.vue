<template>
  <view class="product-recommend">
    <ProductHeader v-if="giftData.IsShowTitle" :is-show-title="giftData.IsShowTitle" :title="giftData.Title" />
    <ProductCategory v-if="giftData.showCategory" :tab-list="tabs" @change="handleTabChange"></ProductCategory>
    <view :style="listStyle" :class="['product-recommend__list', `is-${giftData.Layout}`]">
      <block v-if="giftData.Layout === 'multiple'">
        <ProductScroll
          :layout="giftData.Layout"
          :is-show-add-cart="false"
          :radio="giftData.radio"
          :list="currentProducts"
          @tap="handleOpenDetail(item.goodsid)"
        />
      </block>
      <block v-else>
        <template v-if="giftData.Layout === 'grid'">
          <!-- #ifdef MP -->
          <CustomWaterfall ref="uWaterfall" :list="currentProducts" id-key="goodsid">
            <view v-for="(item, index) of currentProducts" :key="index" :slot="'slot' + index">
              <ProductCard
                :image="item.picurl"
                :goods-name="item.goodsname"
                :hgway="item.hgway"
                :points="item.points"
                :price="item.price"
                :row="item"
                layout="grid"
                @tap="handleOpenDetail(item.goodsid)"
              />
            </view>
          </CustomWaterfall>
          <!-- #endif -->
          <!-- #ifdef H5-DECORATE -->
          <u-waterfall ref="uWaterfall" v-model="currentProducts">
            <template #left="{ leftList }">
              <view
                v-for="(item, index) in leftList"
                :key="index"
                class="item"
                style="width: 345rpx; margin: 0 auto 20rpx"
              >
                <ProductCard
                  :image="item.picurl"
                  :goods-name="item.goodsname"
                  :hgway="item.hgway"
                  :points="item.points"
                  :price="item.price"
                  layout="grid"
                  @tap="handleOpenDetail(item.goodsid)"
                />
              </view>
            </template>
            <template #right="{ rightList }">
              <view
                v-for="(item, index) in rightList"
                :key="index"
                class="item"
                style="width: 345rpx; margin: 0 auto 20rpx"
              >
                <ProductCard
                  :image="item.picurl"
                  :goods-name="item.goodsname"
                  :hgway="item.hgway"
                  :points="item.points"
                  :price="item.price"
                  layout="grid"
                  @tap="handleOpenDetail(item.goodsid)"
                />
              </view>
            </template>
          </u-waterfall>
          <!-- #endif -->
        </template>
        <template v-else>
          <view v-for="item in currentProducts" :key="item.goodsid" class="product-recommend__item">
            <ProductCard
              :layout="giftData.Layout"
              :image="item.picurl"
              :goods-name="item.goodsname"
              :hgway="item.hgway"
              :points="item.points"
              :price="item.price"
              @tap="handleOpenDetail(item.goodsid)"
            />
          </view>
        </template>
      </block>
    </view>
  </view>
</template>

<script>
/* #ifdef MP */
import { apiGetGoodsList } from 'packages/api/integral.js'
/* #endif */
import ProductHeader from './components/product-header.vue'
import ProductCategory from './components/product-category.vue'
import ProductCard from './components/product-card.vue'
import ProductScroll from './components/product-scroll.vue'
/* #ifdef MP */
import CustomWaterfall from './components/custom-waterfall.vue'
/* #endif */
export default {
  components: {
    ProductHeader,
    ProductCategory,
    ProductCard,
    ProductScroll,
    /* #ifdef MP */
    CustomWaterfall
    /* #endif */
  },
  props: {
    giftData: {
      type: Object,
      default() {
        return {
          checked: true,
          checkeds: true,
          Products: []
        }
      }
    }
  },
  data() {
    return {
      products: [], // 所有数据
      currentProducts: [], // 展示数据，包括基于分类筛选的
      tabs: ['全部']
    }
  },
  computed: {
    listStyle() {
      const s = []
      s.push(`background-color: ${this.giftData.Bgcolor}`)
      if (this.giftData.Layout === 'grid' && this.currentProducts.length % 2 === 0) {
        // s.push(`padding-bottom: 0`)
      } else if (this.giftData.Layout === 'four' && [0, 2].indexOf(this.currentProducts.length % 3) !== -1) {
        s.push(`padding-bottom: 0`)
      } else if (this.giftData.Layout === 'three' && [0, 2, 3].indexOf(this.currentProducts.length % 4) !== -1) {
        s.push(`padding-bottom: 0`)
      }
      return s.join(';')
    }
  },
  watch: {
    giftData: {
      deep: true,
      immediate: true,
      handler(n) {
        this.getlist()
      }
    }
  },
  methods: {
    async getlist() {
      // 瀑布流重置数据
      this.$refs.uWaterfall && (this.currentProducts = [])
      /* #ifdef MP */
      const res = await apiGetGoodsList({
        PageIndex: 1,
        PageSize: this.giftData.Products.length,
        SortKey: 0,
        Direction: 0,
        GoodsName: '',
        SysCategoryId: null,
        GoodsId: this.giftData.Products
      })
      if (this.$ck(res, true) && res.return_data.list) {
        let l = res.return_data.list || []
        l.forEach(item => {
          item.categories = item.categories.toString() // 分类转成字符串
        })
        // 抽离礼品分类并去重
        const tabs = [...new Set(l.filter(item => item.categories).map(item => item.categories))]
        this.tabs = ['全部', ...tabs]
        this.products = l
        // 瀑布流赋值
        this.currentProducts = l
      }
      /* #endif */
      /* #ifdef H5-DECORATE */
      let l = this.giftData.selectedList || []
      l.forEach((item, index) => {
        index === 0 && (item.categories = '分类一')
      })
      this.tabs = ['全部', '分类一']
      this.products = l
      this.currentProducts = l
      /* #endif */
    },
    handleOpenDetail(id) {
      /* #ifdef MP */
      uni.navigateTo({
        url: '/packages/src/integral/detail?id=' + id
      })
      /* #endif */
    },
    handleTabChange(v) {
      if (this.$refs.uWaterfall) {
        this.currentProducts = []
        /* #ifdef H5-DECORATE */
        this.$refs.uWaterfall.clear()
        /* #endif */
      }
      this.$nextTick(() => {
        if (v === '全部') {
          this.currentProducts = this.products
          return
        }
        this.currentProducts = this.products.filter(item => item.categories === v)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'product-recommend';
.#{$prefix} {
  .#{$prefix}__list {
    // margin-left: 30rpx;
    // margin-right: 30rpx;
    padding: 20rpx;
    &.is-grid {
      // display: flex;
      // flex-wrap: wrap;
      // justify-content: space-between;
      // align-items: stretch;
      .#{$prefix}__item {
        width: 48%;
        // width: 50%;
      }
    }
    &.is-three {
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
      .#{$prefix}__item {
        width: 24%;
        margin-right: 1.3%;
        &:nth-child(4n) {
          margin-right: 0;
        }
        // width: 50%;
      }
    }
    &.is-four {
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
      .#{$prefix}__item {
        width: 32%;
        margin-right: 2%;
        // width: 50%;
        &:nth-child(3n) {
          margin-right: 0;
        }
      }
    }
  }
  .#{$prefix}__item {
    display: block;
    &:not(:last-child) {
      margin-bottom: 20rpx;
    }
  }
}
</style>
