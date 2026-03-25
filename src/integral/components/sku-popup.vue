<template>
  <u-popup v-model="show" mode="bottom" border-radius="14">
    <view class="popup-box">
      <u-icon name="close" size="30" color="#909399" class="custom-close" @click="show = false" />
      <view class="spec-popup">
        <view class="spec-popup__goods">
          <v-img class="spec-popup__goods__image" mode="aspectFit" :lazy-load="true" :src="goodsImg" />
          <view class="info-box">
            <view class="goods-title ellipsis-2">{{ goods.productname }}</view>
            <!-- 付费礼品 -->
            <view
              v-if="isGiftExchange && goods.activityrecordsmore.priceusetype === 1"
              class="spec-popup__goods__price"
            >
              <v-price
                :price="goods.activityrecordsmore.price"
                double
                show-sign
                mode="card"
                style="display: inline-block"
              />
            </view>
            <!-- 兑换时，不显示数量 -->
            <view v-if="!isGiftExchange" class="spec-popup__goods__price">
              <template v-if="goods.hgway === 0">{{ goods.jifen }} 积分</template>
              <template v-if="goods.hgway === 1">
                {{ goods.jifen }} 积分 +
                <v-price :price="goods.price" double show-sign mode="card" style="display: inline-block" />
              </template>
            </view>
          </view>
        </view>
        <view class="sku-box">
          <view v-for="(item, index) in skuListData" :key="index" class="row">
            <div class="label">{{ item.ggname }}</div>
            <div class="skus">
              <view
                v-for="(child, q) in item.group"
                :key="q"
                :class="['sku-button', child.check ? 'active' : '']"
                @click="handleSelectSku(index, q)"
              >
                {{ child.formatname }}
              </view>
            </div>
          </view>
        </view>
        <view class="spec-popup__quantity">
          <view class="flex flex-middle">
            <view class="fs-28">{{ textStride }}数量：</view>
            <!-- 兑换时不显示 -->
            <view v-if="!isGiftExchange" class="fs-24 gray-color">（库存 {{ selectSku.currentstock }}）</view>
          </view>
          <u-number-box
            v-if="ordersourcetype == 1 && (goods.isvirtual === 0 || goods.isvirtual === 6)"
            v-model="quantity"
            :max="selectSku.currentstock"
            :disabled="type == 'storeCancel'"
          />
          <span v-else>x 1</span>
        </view>
      </view>
      <view class="footer-button">
        <m-button type="primary" size="large" :round="true" :disabled="!selectSku.currentstock" @click="handleSubmit">
          <text class="btn-text">{{ selectSku.currentstock ? '确定' : '库存不足' }}</text>
        </m-button>
      </view>
    </view>
  </u-popup>
  <!-- </view> -->
</template>

<script>
import MButton from './com-button.vue'
import VPrice from '../../components/price/price.vue'
import integralMixin from '../mixins/integral.js'
export default {
  components: {
    VPrice,
    MButton
  },
  mixins: [integralMixin],
  props: {
    skuList: {
      type: Array,
      default: () => []
    },
    goodsId: {
      type: String,
      default: ''
    },
    goodsImg: {
      type: String,
      default: ''
    },
    goodsFormatList: {
      type: Array,
      default: () => []
    },
    goods: {
      type: Object,
      default: () => {}
    },
    ordersourcetype: {
      type: Number,
      default: 0
    },
    activityprizeid: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      show: false,
      skuListData: [],
      type: '', // storeCancel 门店自提核销（不能选择数量） addCart 加入购物车
      quantity: 0,
      selectArr: [],
      selectSku: {
        buycount: 0,
        currentstock: 9,
        formatids: '',
        formatname: '',
        id: 0,
        maxstock: 0
      }
    }
  },
  computed: {
    selectLength() {
      return this.skuList.length
    }
  },
  watch: {
    skuList: {
      handler(val) {
        this.selectArr = val.map(item => -1)
        let data = JSON.parse(JSON.stringify(val))
        data.forEach(item => {
          item.group.forEach(child => {
            child.check = false
          })
        })
        this.skuListData = data
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // onStopClick() {},
    handleSelectSku(firstIndex, twoIndex) {
      this.selectArr[firstIndex] = twoIndex
      this.skuListData[firstIndex].group.forEach(item => {
        item.check = false
      })
      this.skuListData[firstIndex].group[twoIndex].check = true
      let selectAll = this.selectArr.reduce((item, sum) => {
        return !!(sum !== -1 && item)
      }, true)
      if (selectAll) {
        let sku = ''
        this.skuListData.forEach(item => {
          item.group.forEach(child => {
            if (child.check) {
              sku += !sku ? child.id : ',' + child.id
            }
          })
        })
        this.selectSku = this.goodsFormatList.filter(item => {
          if (this.isEqual(item.formatids, sku)) {
            return item
          }
        })[0]
      }
      this.quantity = 1
    },
    open(opts, child) {
      let selectAll = this.selectArr.reduce((item, sum) => {
        return !!(sum !== -1 && item)
      }, true)
      if (!selectAll || !this.goods.isformat) {
        this.selectSku.currentstock = opts.maxcount
        if (opts.maxcount > 0) {
          this.quantity = 1
        }
      }
      if (this.ordersourcetype !== 1 && this.goods.isvirtual !== 0) {
        this.quantity = 1
      }
      this.type = opts.type
      this.show = true
      if (child && child.formatid) {
        this.$nextTick(() => {
          this.handlerCheckList(child.formatid)
          this.quantity = child.quantity
        })
      }
    },
    handlerCheckList(formatid) {
      let selectSku = this.goodsFormatList.filter(item => item.id === formatid)[0]
      this.skuListData.forEach((item, index) => {
        item.group.forEach((child, q) => {
          if (selectSku.formatname.includes(child.formatname) && selectSku.formatids.includes(child.id)) {
            this.handleSelectSku(index, q)
          }
        })
      })
    },
    close() {
      this.show = false
    },

    handleSubmit() {
      if (this.quantity <= 0) {
        return this.$msg('请选择数量')
      }
      if (this.selectArr.includes(-1) && this.goods.isformat) {
        return this.$msg('请选择规格')
      }
      if (this.type === 'addCart') {
        this.close()
        return this.$emit('addCart', {
          goodsid: this.goodsId,
          formatid: this.selectSku.id,
          quantity: this.quantity
        })
      }
      this.$emit(
        'submit',
        {
          productid: this.goodsId,
          formatid: this.selectSku.id,
          quantity: this.quantity,
          formatids: this.selectSku.formatids,
          formatname: this.selectSku.formatname,
          isfreightfree: this.goods.shippingtemplate.id,
          price: this.goods.price,
          recordid: this.activityprizeid
        },
        {
          type: this.type
        }
      )
      this.close()
    },
    isEqual(a, b) {
      let c = a.split(',')
      let d = b.split(',')
      if (c.length !== d.length) {
        return false
      }
      for (let i = 0; i < c.length; i++) {
        let isMatch = false
        for (let j = 0; j < d.length; j++) {
          if (c[i] === d[j]) {
            isMatch = true
            break
          }
        }
        if (!isMatch) {
          return false
        }
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.popup-box {
  padding: 30rpx;
  position: relative;
  .custom-close {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    z-index: 3;
    padding: 10rpx;
  }
  // .icon-close {
  //   position: absolute;
  //   right: 40rpx;
  //   top: 30rpx;
  //   padding: 20rpx;
  //   margin: -20rpx;
  //   font-size: 20rpx;
  // }
  // 商品规格
  .spec-popup {
    margin-bottom: 60rpx;
    .spec-popup__goods {
      display: flex;
      // align-items: flex-end;
      padding-bottom: 30rpx;
      .spec-popup__goods__image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 10rpx;
        display: block;
        overflow: hidden;
      }
      .info-box {
        margin-left: 20rpx;
        .goods-title {
          width: 444rpx;
          font-weight: 700;
          font-size: 28rpx;
          height: 76rpx;
        }
        .spec-popup__goods__price {
          font-size: 30rpx;
          color: $price-color;
          font-weight: 800;
          margin-top: 50rpx;
        }
      }
    }
    .sku-box {
      .row {
        margin-bottom: 40rpx;
        .skus {
          margin-bottom: 20rpx;
          .sku-button {
            display: inline-block;
            height: 54rpx;
            background: #f0f0f0;
            border-radius: 27rpx;
            color: #333333;
            font-weight: 500;
            line-height: 54rpx;
            padding: 0 20rpx;
            margin-right: 20rpx;
            margin-top: 20rpx;
          }
          .active {
            background: var(--theme-color, $bg-color);
            font-weight: 500;
            color: $integral-text-color;
          }
        }
      }
    }
    .spec-popup__spec-list {
      max-height: 450rpx;
      overflow-y: auto;
      .spec-popup__spec {
        margin-top: 20rpx;
        .spec-popup__sys-spec {
          padding-top: 30rpx;
          padding-bottom: 30rpx;
          .spec-popup__sys-spec__title {
            margin-bottom: 20rpx;
            font-size: 28rpx;
            color: #000;
          }
        }
      }
    }
    .spec-popup__quantity {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 30rpx;
    }
  }
  .footer-button .btn-text {
    font-size: 32rpx;
    font-weight: 700;
    color: $integral-text-color;
  }
}
</style>
