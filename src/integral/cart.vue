<template>
  <view>
    <view class="cart-30">
      <view class="cart-b-wrap">
        <view class="cart-b">
          <view v-for="(item, index) in goodsList" :key="index" class="cart-item mb-20">
            <view v-if="item.items.length > 1" class="cart-item-header flex flex-middle mb-30">
              <u-checkbox
                size="36"
                :value="item.isShow"
                :disabled="isAllDisablded(item.items)"
                shape="circle"
                active-color="#FF9E01"
                @change="downAllIcon(item)"
              >
                <view class="fs-28 mr-30 ml-10">全选</view>
              </u-checkbox>
            </view>

            <view
              v-for="(child, childIndex) in item.items"
              :key="childIndex"
              class="flex cart-child-item mb-20"
              :class="child.goodsstatus === 1 ? '' : 'cart-child-item-disabled'"
            >
              <u-checkbox
                class="check-box"
                size="36"
                :value="child.isShow"
                :disabled="child.goodsstatus !== 1"
                shape="circle"
                active-color="#FF9E01"
                @tap="downIcon(child)"
              />
              <view class="cart-right flex flex-1 overflow-h">
                <view class="shop-img-warp">
                  <view class="shop-img shrink-0" @click.stop="handleOpenDetail(item.goodsid)">
                    <v-img :src="child.goodsurl || pdDefaultImg" />
                  </view>
                  <text v-if="child.goodsstatus !== 1" class="disabled-tag flex flex-middle flex-center">
                    {{ child.goodsstatus == 3 ? '已删除' : child.goodsstatus == 2 ? '不可销售' : '已下架' }}
                  </text>
                </view>

                <view class="flex-1 overflow-h ml-20">
                  <view class="cart-Name fs-28 fw-bold" @click.stop="handleOpenDetail(item.goodsid)">
                    {{ child.goodsname }}
                  </view>
                  <view class="flex cart-num flex-middle">
                    <!-- 多规格组合名称 -->
                    <view
                      v-if="child.isformat && child.formatnames"
                      class="moreFre fs-22 flex mr-20"
                      @click.stop="handleOpenMore(child, item.goodsid)"
                    >
                      <view class="ellipsis">{{ child.formatnames }}</view>

                      <view class="iconfont icon-arrow-down" />
                    </view>
                    <view class="flex flex-middle flex-between number-count">
                      <digital
                        :quantity.sync="child.quantity"
                        :max="child.isformat ? child.currentstock : child.maxcount"
                        @cartSet="handleCartSet(child)"
                      />
                    </view>
                  </view>
                  <view class="flex mt-20">
                    <view class="flex-1 cart-price fs-30 primary-color fw-bold">
                      {{ Number(child.hgpoints) }}积分
                      <template v-if="child.price">+{{ `￥${Number(child.price).toFixed(2)}` }}</template>
                    </view>
                    <view v-if="child.goodsstatus !== 1" class="delete-button ml-20 fs-28" @tap="deleteCart(child.id)">
                      删除
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="finished && goodsList.length > 0" class="bottom-footer-gap" />
    <view v-if="goodsList.length > 0" class="fixed-footer flex-between">
      <view class="flex flex-middle operate-wrap">
        <u-checkbox
          :value="isAll"
          class="pl-40 check-box flex flex-middle operate-wrap"
          size="36"
          shape="circle"
          active-color="#FF9E01"
          :disabled="isPageAllDisablded"
          @tap="downAll({ value: !isAll })"
        >
          <span class="fs-28">全选</span>
        </u-checkbox>
        <view v-if="isDelate || isAll" class="delete-button" @tap="handleDelect">删除</view>
      </view>
      <view class="flex sum-wrap">
        <view v-if="!priceSum && pointSum" class="tx-r flex flex-column flex-center">
          <view class="fs-28 flex flex-middle">
            合计：
            <text class="fs-36 primary-color fw-bold">
              {{ pointSum }}
              <text class="fs-28 ml-10">积分</text>
            </text>
          </view>
        </view>
        <view v-else class="tx-r flex flex-column flex-center">
          <view class="fs-28 flex flex-middle">
            合计：
            <text class="fs-36 primary-color fw-bold">{{ `￥${Number(priceSum).toFixed(2)}` }}</text>
          </view>
          <view v-if="pointSum" class="fs-24 primary-color fw-bold">+{{ pointSum }} 积分</view>
        </view>
        <view class="confirm-btn flex-center fs-32 fw-bold ml-20 mr-30 flex flex-middle" @tap="navigate()">
          结算({{ selectArray.length }})
        </view>
      </view>
    </view>
    <view v-if="finished && goodsList.length === 0">
      <!-- #ifdef MP-CLOUDSHOP -->
      <NoneDataCloushop msg="购物车空了，去逛逛吧~" />
      <!-- #endif -->
      <!-- #ifndef MP-CLOUDSHOP -->
      <NoneData msg="购物车空了，去逛逛吧~" />
      <!-- #endif -->
      <view class="flex flex-center">
        <view class="confirm-btn flex flex-middle flex-center fs-32 max-btn fw-bold" @tap="navigateHref()">去逛逛</view>
      </view>
    </view>

    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      @confirm="handleConfirm"
    />
    <!-- 多规格弹窗 -->
    <sku-popup
      ref="skuPopup"
      :goods-id="currentGoods.id"
      :sku-list="currentGoods.skuList"
      :goods-format-list="currentGoods.GoodsForMatList"
      :goods-img="currentGoods.goodsImg"
      :goods="currentGoods.goods"
      :ordersourcetype="1"
      :activityprizeid="0"
      @submit="onSkuSubmit"
    />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>
<script>
import {
  apiAddCart,
  apiCartUpdate,
  apiCartDelete,
  apiGetIntegralDetail,
  apiCheckoutOrder,
  apiCartGetItems
} from '../api/integral'
import SkuPopup from './components/sku-popup'
import Digital from './components/digital'
// 重命名组件解决同名冲突，不影响条件编译，但语法提示会有问题
// #ifdef MP-CLOUDSHOP
import NoneDataCloushop from '@/components/none-data/none-data.vue'
// #endif
// #ifndef MP-CLOUDSHOP
import NoneData from '@/components/none-data/index.vue'
// #endif
// #ifdef MP-MEMBER || MP-CLOUDSHOP
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
// #endif


import { staticURL } from '@/config'
export default {
  components: {
    // #ifdef MP-CLOUDSHOP
    NoneDataCloushop,
    // #endif
    // #ifndef MP-CLOUDSHOP
    NoneData,
    // #endif
    SkuPopup,
    Digital,
    // #ifdef MP-MEMBER || MP-CLOUDSHOP
    CommonPopup
    // #endif
  },
  mixins: [],
  data() {
    return {
      pdDefaultImg: staticURL(true) + 'pd-default.jpg', // 产品默认图
      deFaultID: 0,
      selectArray: [],
      goodsList: [],
      isAll: false,
      finished: false,
      isDelate: false,
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '提示', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '确定', // 弹窗确认按钮文案
      popTipType: '',
      currentGoods: {
        id: '',
        skuList: [],
        GoodsForMatList: [],
        goodsImg: '',
        goods: {
          source: 0 //礼品类型 0：实物礼品 1：虚拟商品（虚拟票券类） 2：购物券 3：微信红包 4：联盟卡券 5：直充类 6：提领券ID 7：零钱红包ID 8：微信代金券ID
        }
      }
    }
  },
  computed: {
    priceSum() {
      let num = 0
      this.selectArray.forEach(item => {
        num += Number(item.price || 0) * item.quantity
      })
      return num
    },
    pointSum() {
      let point = 0
      this.selectArray.forEach(item => {
        point += Number(item.hgpoints || 0) * item.quantity
      })
      return point
    },
    isPageAllDisablded() {
      return (
        this.goodsList.filter(item => {
          return !this.isAllDisablded(item.items)
        }).length === 0
      )
    }
  },
  async onShow() {
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    this.getPage()
    this.cancelAllCheck()
  },

  onUnload() {},
  onHide() {},
  onPullDownRefresh() {
    this.getPage().then(() => {
      uni.stopPullDownRefresh()
    })
    this.cancelAllCheck()
  },
  methods: {
    // 打开多规格弹窗
    handleOpenMore(child, goodsid) {
      // 用来存储当前商品的默认规格ID后续做判断
      this.deFaultID = child.formatid
      this.currentGoods.id = goodsid
      this.$loading.show()
      apiGetIntegralDetail({
        id: goodsid
      }).then(res => {
        this.$loading.hide()
        if (this.$ck(res, true)) {
          let data = res.return_data
          // 多规格处理
          let GoodsSysSpecificationsList = JSON.parse(JSON.stringify(data.gglist || []))
          GoodsSysSpecificationsList.forEach(item => {
            item.group = data.productspecificationlist.filter(child => {
              if (item.sid === child.sid) {
                return child
              }
            })
          })
          this.currentGoods.skuList = GoodsSysSpecificationsList
          this.currentGoods.GoodsForMatList = data.productformatslist
          this.currentGoods.goodsImg = data.activitypics[0]
          this.currentGoods.goods = data
          this.$refs.skuPopup.open(
            {
              maxcount: this.currentGoods.goods.maxcount
            },
            child
          )
          this.loading = false
        }
      })
    },
    // 多规格弹窗的回调
    onSkuSubmit(e) {
      if (this.deFaultID === e.formatid) {
        // 更新购物车数量
        this.handleMoreCard(e.productid, e.formatid, e.quantity)
      } else {
        // let isHasFormatid = false
        // for (let item of this.goodsList) {
        //   if (item.items.findIndex(res => res.formatid === e.formatid) !== -1) {
        //     isHasFormatid = true
        //     break
        //   }
        // }
        // if (isHasFormatid) {
        // this.handleMoreCard(e.productid, this.deFaultID, 0)
        // } else {
        this.handleApiUpdate(e.productid, e.formatid, e.quantity, this.deFaultID)
        // }
      }
    },
    // 多规格-切换规格方法
    handleApiUpdate(goodsid, newformatid, quantity, formatid) {
      this.$loading.show()
      apiCartUpdate({
        goodsid,
        formatid,
        quantity,
        newformatid
      }).then(res => {
        this.$loading.hide()
        if (this.$ck(res)) {
          this.getPage()
          this.cancelAllCheck()
        }
      })
    },
    // 多规格-公共方法
    handleMoreCard(goodsid, formatid, quantity) {
      this.$loading.show()
      apiAddCart({
        goodsid,
        formatid,
        quantity
      }).then(res => {
        this.$loading.hide()
        if (this.$ck(res)) {
          this.getPage()
          this.cancelAllCheck()
        }
      })
    },
    /** 关闭提示框 */
    handleConfirm() {
      // 点击确定
      this.showPopup = false
      if (this.popTipType === 'ydConfirm') {
        this.deleteCart()
      }
    },
    handleDelect() {
      if (this.selectArray.length === 0) {
        return this.$msg('没有物品可删除')
      }
      this.showPopup = true
      this.popTipType = 'ydConfirm'
      this.popType = 'confirm'
      this.popContent = `确认将已选中的${this.selectArray.length}件商品删除吗`
      this.popConfirmText = '确定'
    },
    deleteCart(id) {
      let ids = []
      if (id) {
        ids = [id]
      } else {
        this.selectArray.forEach(item => {
          ids.push(item.id)
        })
      }

      this.$loading.show()
      apiCartDelete({
        ids
      }).then(res => {
        this.$loading.hide()
        if (res.return_code === 0) {
          this.$msg('删除成功')

          this.getPage()
          this.cancelAllCheck()
          this.selectArray = []
          this.isDelate = false
        }
      })
    },
    handleOpenDetail(id) {
      uni.navigateTo({
        url: '/packages/src/integral/detail?id=' + id
      })
    },
    // 去积分商城
    navigateHref() {
      // 逛逛
      uni.redirectTo({
        url: '/packages/src/integral/index'
      })
    },
    async navigate() {
      let shoppingcartitems = this.selectArray.map(item => {
        return item.id
      })
      if (shoppingcartitems.length === 0) {
        return
      }
      this.$loading.show()
      let res = await apiCheckoutOrder({
        ordersourcetype: 6,
        shoppingcartitems
      })
      this.$loading.hide()

      if (this.$ck(res, true)) {
        uni.navigateTo({
          url: `/packages/src/integral/settle?type=6&cartids=${shoppingcartitems.join()}`
        })
      }
    },
    // 获取购物车数据
    async getPage() {
      this.goodsList = []
      let res = await apiCartGetItems({})
      if (res.return_code === 0) {
        this.goodsList = res.return_data.goodslist || []
        this.finished = this.goodsList.length < 1
      }
    },
    // 全选是否被禁用
    isAllDisablded(arr) {
      return arr.filter(item => item.goodsstatus === 1).length === 0
    },

    // 取消勾选
    cancelAllCheck() {
      this.downAll({ value: false })
    },

    // 全部选中
    downAll(e) {
      this.isAll = e.value
      this.isDelate = this.isAll
      let selectArray = []
      this.goodsList.forEach(item => {
        if (this.isAllDisablded(item.items)) return
        item.isShow = this.isAll
        item.items.forEach(child => {
          if (child.goodsstatus === 1) {
            child.isShow = this.isAll
            this.isAll &&
              selectArray.push({
                goodsid: item.goodsid,
                ...child
              })
          }
        })
      })
      this.selectArray = selectArray
    },
    // 同步是否全选
    hanleCheckData() {
      // 判断是否商品全选
      let isAll = true
      let selectArray = []
      this.goodsList.forEach(item => {
        let isShow = true
        item.items.forEach(child => {
          if (child.goodsstatus === 1 && !child.isShow) {
            isAll = false
            isShow = false
          } else if (child.isShow) {
            selectArray.push({
              goodsid: item.goodsid,
              ...child
            })
          }
        })
        item.isShow = isShow
      })
      this.selectArray = selectArray
      this.isAll = isAll
      this.isDelate = !!(this.selectArray.length > 0)
    },
    // 全选
    downAllIcon(item) {
      item.isShow = !item.isShow
      item.items.forEach(child => {
        child.isShow = item.isShow
      })

      // 判断是否商品全选
      this.hanleCheckData()
    },
    // 选中
    downIcon(child) {
      if (child.goodsstatus === 0) return
      child.isShow = !child.isShow

      // 判断是否商品全选
      this.hanleCheckData()
    },
    // 增加购买数量接口
    handleCartSet(child) {
      apiAddCart(
        {
          goodsid: child.goodsid,
          quantity: child.quantity,
          formatid: child.formatid,
          newformatid: child.formatid
        },
        false
      ).then(res => {
        if (res.return_code === 0) {
          if (child.isShow) {
            this.hanleCheckData()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
.cart-30 {
  margin: 20rpx 20rpx 0;
  padding-bottom: calc(60px + constant(safe-area-inset-bottom));
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

.cart-b {
  margin-bottom: 30rpx;
  display: block;
}

.cart-item {
  width: 100%;
  box-sizing: border-box;
  padding: 30rpx 30rpx 30rpx 20rpx;
  background: $uni-bg-color;
  border-radius: 10rpx;
  flex-wrap: wrap;
  &-header {
    margin-top: -10rpx;
  }
  .cart-warm-tip {
    height: 36rpx;
    background: rgba($color: #ff6440, $alpha: 0.1);
    color: #ff6440;
    padding-left: 12rpx;
  }
  .cart-child-item {
    margin-bottom: 30rpx;

    &-disabled {
      position: relative;
      .shop-img,
      .cart-Name,
      .cart-price,
      .cart-num {
        opacity: 0.5;
        pointer-events: none;
      }
    }
    .cart-right {
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 30rpx;
    }
    &:last-child {
      margin: 0;
      .cart-right {
        border-bottom: 0;
        padding-bottom: 0;
      }
    }
    .moreFre {
      border-radius: 5rpx;
      height: 42rpx;
      line-height: 42rpx;
      padding: 0 10rpx;
      text-align: center;
      background: #f2f2f2;
      color: #999999;
      overflow: hidden;
      .iconfont {
        font-size: 20rpx;
        padding-left: 10rpx;
      }
    }
    .number-count {
      margin-left: auto;
    }
  }
  .check-box {
    padding-top: 70rpx;
  }

  .check-disabled {
    &::before {
      border-radius: 50%;
      background: #f0f0f0;
    }
  }

  .cart-right {
    margin-left: -12rpx;
    .shop-img-warp {
      position: relative;
      .disabled-tag {
        position: absolute;
        bottom: 0;
        width: 180rpx;
        height: 42rpx;
        background: rgba($color: #000, $alpha: 0.5);
        font-weight: 500;
        font-size: 24rpx;
        color: #ffffff;
        line-height: 34rpx;
      }
      .shop-img {
        @include wh(180rpx);
      }
    }

    .cart-Name {
      @include multi-ellipsis(2);
      word-break: break-all;
      line-height: 1.5;
      margin-bottom: 15rpx;
    }
  }
}

.delete-button {
  color: #0aa6ff;
}

.fixed-footer {
  height: auto;
  z-index: 10;
  .operate-wrap {
    height: 80rpx;
  }
  .sum-wrap {
    height: 80rpx;
    margin: 15rpx 0;
  }
}
.confirm-btn {
  min-width: 200rpx;
  height: 80rpx;
  text-align: center;
  background: $bg-color;
  border-radius: 40rpx;
}
.max-btn {
  padding: 0 100rpx;
}

.bottom-footer-gap {
  height: calc(110rpx + 50px);
  height: calc(110rpx + 50px + constant(safe-area-inset-bottom));
  height: calc(110rpx + 50px + env(safe-area-inset-bottom));
}
.iconjiantou1 {
  font-size: 20rpx;
}
::v-deep {
  .u-numberbox {
    .u-icon-minus,
    .u-icon-plus {
      width: 42rpx !important;
      height: 42rpx !important;
      border-radius: 5rpx;
      .u-icon__icon {
        font-size: 24rpx !important;
      }
    }
    .u-number-input {
      height: 42rpx !important;
      background: white !important;
    }
  }
}
</style>
