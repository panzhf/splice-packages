<template>
  <view v-if="currentProducts.length > 0" class="product-recommend">
    <ProductHeader v-if="giftData.IsShowTitle" :is-show-title="giftData.IsShowTitle" :title="giftData.Title" />
    <view :style="listStyle" :class="['product-recommend__list', `is-${giftData.Layout}`]">
      <block v-if="giftData.Layout === 'multiple'">
        <ProductScroll
          :layout="giftData.Layout"
          :radio="giftData.radio"
          :list="currentProducts"
          :checked="giftData.checked"
          :checkeds="giftData.checkeds"
          :is-member-pord="item.ismemberpord"
          :author-introduction="item.authorintroduction"
          @click="handleOpenDetail(item.goodsid)"
        />
      </block>
      <block v-else>
        <template v-if="giftData.Layout === 'grid'">
          <waterfall ref="uWaterfall" v-model="currentProducts">
            <template #left="{ leftList }">
              <view
                v-for="(item, index) in leftList"
                :key="index"
                class="item"
                style="width: 345rpx; margin: 0 auto 20rpx"
              >
                <ProductCard
                  layout="grid"
                  :is-show-add-cart="false"
                  :is-format="item.isformat"
                  :goods-reserve-act="item.goodsreserveact"
                  :product-id="item.goodsid"
                  :image="item.picurl"
                  :name="item.goodsname"
                  :vip-price="item.minmemberprice"
                  :price="item.price"
                  :original-price="item.ismemberpord ? item.maxprice : item.originalprice"
                  :time-discount-min-price="item.timediscount && item.timediscount.minprice"
                  :spell-group-price="item.spellgroupgoods && item.spellgroupgoods.price"
                  :seckill-price="item.seckillactivity && item.seckillactivity.seckillprice"
                  :is-distribution="item.isdistribution"
                  :distribution-info="item.distributioninfo"
                  :is-acticity-goods="item.isacticitygoods"
                  :is-spell-group="item.isspellgroup"
                  :is-time-discount="item.istimediscount"
                  :is-seckill-activity="item.isseckillactivity"
                  :is-full-reduction="item.isfullreduction"
                  :checked="item.checked"
                  :checkeds="item.checkeds"
                  :author-introduction="item.authorintroduction"
                  :is-member-pord="item.ismemberpord"
                  @click="handleOpenDetail(item.goodsid)"
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
                  layout="grid"
                  :is-show-add-cart="false"
                  :is-format="item.isformat"
                  :goods-reserve-act="item.goodsreserveact"
                  :product-id="item.goodsid"
                  :image="item.picurl"
                  :name="item.goodsname"
                  :vip-price="item.minmemberprice"
                  :price="item.price"
                  :original-price="item.ismemberpord ? item.maxprice : item.originalprice"
                  :time-discount-min-price="item.timediscount && item.timediscount.minprice"
                  :spell-group-price="item.spellgroupgoods && item.spellgroupgoods.price"
                  :seckill-price="item.seckillactivity && item.seckillactivity.seckillprice"
                  :is-distribution="item.isdistribution"
                  :distribution-info="item.distributioninfo"
                  :is-acticity-goods="item.isacticitygoods"
                  :is-spell-group="item.isspellgroup"
                  :is-time-discount="item.istimediscount"
                  :is-seckill-activity="item.isseckillactivity"
                  :is-full-reduction="item.isfullreduction"
                  :checked="item.checked"
                  :checkeds="item.checkeds"
                  :author-introduction="item.authorintroduction"
                  :is-member-pord="item.ismemberpord"
                  @click="handleOpenDetail(item.goodsid)"
                />
              </view>
            </template>
          </waterfall>
        </template>
        <template v-else>
          <view v-for="item in currentProducts" :key="item.goodsid" class="product-recommend__item">
            <ProductCard
              :layout="giftData.Layout"
              :is-show-add-cart="false"
              :is-format="item.isformat"
              :goods-reserve-act="item.goodsreserveact"
              :product-id="item.goodsid"
              :image="item.picurl"
              :name="item.goodsname"
              :vip-price="item.minmemberprice"
              :price="item.price"
              :original-price="item.ismemberpord ? item.maxprice : item.originalprice"
              :time-discount-min-price="item.timediscount && item.timediscount.minprice"
              :spell-group-price="item.spellgroupgoods && item.spellgroupgoods.price"
              :seckill-price="item.seckillactivity && item.seckillactivity.seckillprice"
              :is-distribution="item.isdistribution"
              :distribution-info="item.distributioninfo"
              :is-acticity-goods="item.isacticitygoods"
              :is-spell-group="item.isspellgroup"
              :is-time-discount="item.istimediscount"
              :is-seckill-activity="item.isseckillactivity"
              :is-full-reduction="item.isfullreduction"
              :checked="giftData.checked"
              :checkeds="giftData.checkeds"
              :is-member-pord="item.ismemberpord"
              :author-introduction="item.authorintroduction"
              @click="handleOpenDetail(item.goodsid)"
            />
          </view>
        </template>
      </block>
    </view>
  </view>
</template>

<script>
// #ifdef MP
import { GoodsList } from '@/api/Goods'
import { navigateTo } from '@/utils/unis'
import waterfall from '@/components/u-waterfall/u-waterfall.vue'
// #endif
/* #ifdef H5-DECORATE */
import { staticURL } from '@/config/index'
import waterfall from 'uview-ui-v1/components/u-waterfall/u-waterfall.vue'
/* #endif */
import ProductHeader from './components/product-header.vue'
import ProductCard from './components/product-card.vue'
import ProductScroll from './components/product-scroll.vue'
import dayjs from 'dayjs'
export default {
  components: {
    ProductHeader,
    ProductCard,
    ProductScroll,
    waterfall
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
      products: [],
      currentProducts: []
    }
  },
  computed: {
    listStyle() {
      const s = []
      s.push(`background-color: ${this.giftData.Bgcolor}`)
      if (this.giftData.Layout === 'grid' && this.currentProducts.length % 2 === 0) {
        s.push(`padding-bottom: 0`)
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
    getlist() {
      // 瀑布流重置数据
      this.$refs.uWaterfall && (this.currentProducts = [])
      // #ifdef MP
      GoodsList({
        PageIndex: 1,
        PageSize: this.giftData.Products.length,
        SortKey: 0,
        Direction: 0,
        GoodsName: '',
        SysCategoryId: null,
        GoodsId: this.giftData.Products
      }).then(res => {
        const d = this.$toLowerKey(res, true)
        if (d.return_code === 0) {
          if (d.return_data && d.return_data.results) {
            // 根据id顺序排序
            let r = d.return_data.results || []
            this.products = this.giftData.Products.map(item => r.find(i => i.goodsid === item)).filter(Boolean)
            // 瀑布流赋值
            this.products.length > 0 &&
              this.products.map(item => {
                item.checked = this.giftData.checked
                item.checkeds = this.giftData.checkeds
              })
            this.currentProducts = this.products.filter(item => {
              return item.enablestockcount > 0 && item.status === 1
            })

            // 商品预约
            this.currentProducts.map(item => {
              if (item.goodsreserveact) {
                // 获取当前时间戳(毫秒)
                var curTime = dayjs().valueOf()
                var oDate1 = dayjs(item.goodsreserveact.reservestarttime).valueOf()
                var oDate2 = dayjs(item.goodsreserveact.reserveendtime).valueOf()
                var oDate3 = dayjs(item.goodsreserveact.buystarttime).valueOf()
                var oDate4 = dayjs(item.goodsreserveact.buyendtime).valueOf()
                if (curTime < oDate1) {
                  item.goodsreserveact.appointment = 1
                }
                if (curTime > oDate1 && curTime < oDate2) {
                  item.goodsreserveact.appointment = 2
                }
                if (curTime > oDate2 && curTime < oDate3) {
                  item.goodsreserveact.appointment = 3
                }
                if (curTime > oDate3 && curTime < oDate4) {
                  item.goodsreserveact.appointment = 4
                }
              }
            })
          }
        }
      })
      // #endif
      /* #ifdef H5-DECORATE */
      this.currentProducts = (this.giftData.Products || []).map(item => ({
        goodsid: item,
        goodsname: '这是商品名称这是商品名称这是商品名称',
        picurl: staticURL(true) + 'default-product.png',
        authorintroduction: '商品描述',
        price: 10,
        originalprice: 20,
        checked: this.giftData.checked,
        checkeds: this.giftData.checkeds
      }))
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
$prefix: 'product-recommend';
.#{$prefix} {
  .#{$prefix}__list {
    // margin-left: 30rpx;
    // margin-right: 30rpx;
    padding: 20rpx;
    &.is-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: stretch;
      .#{$prefix}__item {
        width: 48%;
        // width: 50%;
      }
      /* #ifdef H5-DECORATE */
      ::v-deep .u-column + .u-column {
        margin-left: 20rpx;
      }
      /* #endif */
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
