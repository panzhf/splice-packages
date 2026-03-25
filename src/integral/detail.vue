<template>
  <view class="detail u-skeleton" :style="themeVars">
    <template v-if="!loading">
      <title-bar :title="title" :show-nav-title="showNavTitle" type="detail" />
      <product-swiper :list="goods.activitypics" :video-url="videoUrl" class="u-skeleton-rect" />
      <view class="container u-skeleton-rect">
        <view class="row goods-title-box">
          <view class="title u-skeleton-rect">{{ goods.productname }}</view>
          <view v-if="!isGiftExchange || ordersourcetype == 1" class="price-box">
            <!-- 兑换时，不显示数量 -->
            <template v-if="!isGiftExchange">
              <view v-if="goods.hgway === 1" class="u-skeleton-rect">
                {{ goods.jifen }} 积分 +
                <v-price :price="goods.price" double show-sign mode="Jfdetail" style="display: inline-block" />
              </view>
              <view v-if="goods.hgway === 0" class="u-skeleton-rect">{{ goods.jifen }} 积分</view>
            </template>
            <view v-if="ordersourcetype == 1" class="coin">
              已兑换数：
              <span class="num">{{ goods.buycount }}</span>
            </view>
          </view>
          <view v-if="ordersourcetype == 1" class="inventory">库存数：{{ goods.maxcount }}</view>
          <view class="freight">
            <view class="left">
              <view v-if="isLimitQuantity">
                <span v-if="goods.hbdaynumber">每人每天限兑 {{ goods.hbdaynumber }} 个</span>
                <span v-if="goods.hbdaynumber">，</span>
                <span v-if="goods.limitnum.limitsettype === 1">每订单限兑 {{ goods.limitnum.orderlimitnum }} 个</span>
                <span v-if="goods.limitnum.limitsettype === 0">
                  {{ goods.limitnum.timelimit === 0 ? '每人' : '每个自然月每人' }}限兑
                  {{ goods.limitnum.personlimitnum }} 个
                </span>
                <!-- 限兑5件 -->
              </view>
              <view v-else-if="goods.hbdaynumber">
                <span v-if="goods.hbdaynumber">每人每天限兑 {{ goods.hbdaynumber }} 个</span>
              </view>
              <!-- 兑换时，并且是付费模式兑换 -->
              <template v-if="isGiftExchange && goods.activityrecordsmore.priceusetype === 1">
                <v-price
                  :price="goods.activityrecordsmore.price"
                  double
                  show-sign
                  mode="Jfdetail"
                  style="display: inline-block"
                />
                <v-price
                  :price="goods.activityrecordsmore.originalprice"
                  double
                  show-sign
                  mode="old"
                  style="display: inline-block"
                  class="ml-10"
                />
              </template>
            </view>
            <view v-if="isJfvirtual" class="right" style="color: #999">
              快递：
              <span v-if="goods.shippingtemplate.id === 0">免运费</span>
              <v-price
                v-else
                :price="goods.shippingtemplate.shippingtemplaterecords[0].firstweightprice"
                double
                show-sign
                mode="freight"
                style="display: inline-block"
                is-stair
              />
            </view>
          </view>
        </view>
        <!-- 限兑条件 -->
        <view v-if="isLimitUser && ordersourcetype == 1" class="row explain-box">
          <template v-if="isSaleman">
            <view class="title">仅支持以下导购身份兑换</view>
            <view class="explain">(限兑说明：{{ goods.limituser.limitremark }})</view>
            <view class="vip-box">
              <view v-for="(item, index) in goods.limituser.userlabelsname" :key="index" class="vip">{{ item }}</view>
            </view>
          </template>
          <template v-else>
            <view class="title">
              仅限以{{ goods.limituser.gradenumbertype === 0 && goods.limituser.usertypelimit === 0 ? '上' : '下'
              }}{{ goods.limituser.usertypelimit === 0 ? '会员' : '标签' }}兑换
            </view>
            <view v-if="goods.limituser.usertypelimit === 1" class="explain">
              (限兑说明：{{ goods.limituser.limitremark }})
            </view>
            <view v-if="goods.limituser.usertypelimit === 1" class="vip-box">
              <view v-for="(item, index) in goods.limituser.userlabelsname" :key="index" class="vip">{{ item }}</view>
            </view>
            <view v-if="goods.limituser.usertypelimit === 0 && goods.limituser.gradenumbertype === 0" class="vip-box">
              <view class="vip">{{ goods.limituser.gradenumbername }}及以上</view>
            </view>
            <view v-if="goods.limituser.usertypelimit === 0 && goods.limituser.gradenumbertype === 1" class="vip-box">
              <view v-for="(item, index) in goods.limituser.gradenumbername" :key="index" class="vip">{{ item }}</view>
            </view>
          </template>
        </view>
        <view v-if="isGiftExchange && goods.activityrecordsmore.priceusetype === 1" class="row content-box gift">
          <view class="fs-28">
            礼品已到，支付
            <v-price
              :price="goods.activityrecordsmore.price"
              double
              show-sign
              mode="card"
              style="display: inline-block"
            />
            可领取礼品
          </view>
          <view class="fs-22 c-9 mt-10">
            1、请在
            <text class="gift-text">{{ overtime }}</text>
            前领取有效，领取后请在
            <text class="gift-text">{{ goods.ordertimeouthour }}</text>
            内完成支付，否则视为自动放弃领取
          </view>
          <view class="fs-22 c-9 mt-10">2、礼品非正常售卖商品，领取后不支持退换货，请确定后领取</view>
        </view>
        <view class="row content-box">
          <view class="content-titlt u-skeleton-rect">- 详情说明 -</view>
          <u-parse
            class="u-skeleton-rect rich-text"
            :html="GoodDesc"
            :tag-style="parseStyle"
            @imgtap="({ ignore }) => ignore()"
          />
        </view>
        <!-- #ifdef MP-MEMBER || MP-CLOUDSHOP-->
        <md-copyright />
        <!-- #endif -->
      </view>
      <view v-if="!btn" class="footer-container">
        <view class="footer-box">
          <view v-if="!isGiftExchange" class="cart flex flex-column flex-middle mt-10 mr-20" @click="toCart">
            <view class="icon iconfont icongouwuche-miaobian" />
            <text class="fs-24">购物车</text>
            <view v-if="cartCount" class="num fs-18">{{ cartCount > 99 ? 99 : cartCount }}</view>
          </view>
          <!-- 实物礼品才有购物车 -->
          <m-button
            v-if="isJfvirtual"
            class="footer-button u-skeleton-rect mr-20 plan"
            type="primary"
            size="large"
            :round="true"
            :disabled="false"
            @click="handleSubmit('addCart')"
          >
            加入购物车
          </m-button>

          <m-button
            class="footer-button u-skeleton-rect"
            type="primary"
            size="large"
            :round="true"
            :disabled="false"
            @click="handleSubmit"
          >
            立即{{ textStride }}
          </m-button>
        </view>
        <auth-button />
      </view>
    </template>
    <sku-popup
      ref="skuPopup"
      :goods-id="id"
      :sku-list="skuList"
      :goods-format-list="GoodsForMatList"
      :goods-img="goodsImg"
      :goods="goods"
      :ordersourcetype="ordersourcetype"
      :activityprizeid="activityprizeid"
      @submit="onSkuSubmit"
      @addCart="onSkuAddCart"
    />

    <!--引用组件-->
    <u-skeleton :loading="loading" :animation="true" bg-color="#FFF" />
    <common-popup v-model="showPopup" title="温馨提示" :content="popupMsg" @close="popupCancel" />
    <common-popup v-model="showPrizePopup" :pop-hide-button="true" title="请选择兑奖方式">
      <!-- 礼品兑换、积分商城实物积分兑换 -->
      <view v-if="isGiftExchange" class="button-c">
        <view v-if="[0, 2].includes(productgettype)" class="btn plan" @click="skipPage(0)">快递邮寄兑奖</view>
        <view v-if="[1, 2].includes(productgettype)" class="btn" @click="skipPage(1)">前往线下门店兑奖</view>
      </view>
      <view v-else class="button-c">
        <view class="btn plan2" @click="skipJfSettlePage(1)">线下门店核销</view>
        <view class="btn" @click="skipJfSettlePage(0)">快递邮寄</view>
        <view class="tips">注意：选择快递邮寄可能产生一定的物流费用</view>
      </view>
    </common-popup>
    <phone-popup :show.sync="showPhonePopup" @submit="handleNext" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiGetIntegralDetail,
  apiCheckoutOrder,
  apiAddCart,
  apiGetCartCount,
  apiGetIntegralMarketingDetail,
  apiPrizeDetail,
  apiGetIntegralDgDetail,
  apiCheckExistStore
} from '../api/integral.js'
// #ifdef MP-MEMBER
import { apiGetSweepPrizeDetail, apiGetMarketPrizeDetail } from '@/api/me'
// #endif
// #ifdef MP-RETAIL
import { apiGetPrizeDetail } from '@/api/scan-code'
// #endif
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif

import richTextMixin from 'packages/mixins/rich-text'
import { getUrlQuery } from '../utils/function'
import TitleBar from '../components/title-bar/title-bar.vue'
import ProductSwiper from './components/product-swiper.vue'
import VPrice from '../components/price/price.vue'
import SkuPopup from './components/sku-popup'
import MButton from './components/com-button.vue'
import CommonPopup from '../components/common-popup/common-popup.vue'
import PhonePopup from './components/phone-popup.vue'
import integralMixin from './mixins/integral.js'
import { getUserLocation } from 'packages/utils/location-mp.js'

export default {
  components: {
    TitleBar,
    ProductSwiper,
    SkuPopup,
    MButton,
    VPrice,
    CommonPopup,
    PhonePopup
  },
  mixins: [
    richTextMixin,
    integralMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      activitytype: null,
      id: '',
      title: '',
      showNavTitle: false,
      loading: true,
      videoUrl: '',
      GoodDesc: '',
      skuList: [], //规格列表
      GoodsForMatList: [], //规格信息列表
      goods: {
        source: 0 //礼品类型 0：实物礼品 1：虚拟商品（虚拟票券类） 2：购物券 3：微信红包 4：联盟卡券 5：直充类 6：提领券ID 7：零钱红包ID 8：微信代金券ID
      },
      goodsImg: '',
      exchangetype: 0, //兑换专区类型 0：积分商城 1：导购专区
      ordersourcetype: 1, //订单来源类型，1：积分商城订单 2:扫码中奖订单 3：营销订单 5:生日礼包
      btn: null, //订单详情跳过来的，不显示兑换按钮
      // activityprizeid: 1, //扫码过来的活动奖项Id
      activityprizeid: 0, //扫码过来的活动奖项Id
      productid: 1, //商品ID
      actid: '', //活动id
      subcategory: 0, //积分类型 2积分换购订单6扫码实物中奖订单13营销订单14 会员小程序 19生日礼包
      showPopup: false,
      popupflag: '', // 弹窗标识
      showPrizePopup: false,
      showPhonePopup: false,
      PrizeType: 0, // 0:红包；1积分；2：购物券；3：礼品
      productgettype: 0, // 礼品领取方式0：邮寄；1：线下门店领奖 2邮寄和门店领奖
      popupMsg: '',
      chargenumber: '',
      overtime: '',
      cartCount: 0,
      autoJump: true // 只自动跳转一次
    }
  },
  computed: {
    // 是否积分商城实物礼品
    isJfvirtual() {
      return this.goods.isvirtual === 0 && !this.isGiftExchange
    },
    // 是否限兑数量
    isLimitQuantity() {
      return this.goods.limitset && this.goods.limitset.length > 0 && this.goods.limitset.includes(0)
    },
    // 是否限兑用户
    isLimitUser() {
      return this.goods.limitset && this.goods.limitset.length > 0 && this.goods.limitset.includes(1)
    },
    isSaleman() {
      return this.goods.limituser && this.goods.limituser.usertypelimit === 2
    }
  },
  onLoad(opotion) {
    let scene = opotion.scene ? getUrlQuery(decodeURIComponent(opotion.scene)) : {}
    this.id = opotion.id || scene.id || 0
    // if (!this.id) {
    //   return this.$msg('礼品信息获取失败')
    // }
    this.activitytype = Number(opotion.activitytype)
    opotion.type ? (this.ordersourcetype = Number(opotion.type)) : null
    opotion.btn ? (this.btn = Number(opotion.btn)) : null
    // 扫码过来的活动奖项Id
    opotion.activityprizeid ? (this.activityprizeid = Number(opotion.activityprizeid)) : 0

    // 积分类型 2积分换购订单6扫码实物中奖订单13营销订单14 会员小程序 19生日礼包
    opotion.subcategory ? (this.subcategory = Number(opotion.subcategory)) : null
    // 礼品Id
    opotion.productid ? (this.productid = Number(opotion.productid)) : null
    // 扫码过来的活动Id
    opotion.actid ? (this.actid = Number(opotion.actid)) : null
    // 扫码过来领奖的类型
    opotion.PrizeType ? (this.PrizeType = Number(opotion.PrizeType)) : null
  },
  async onShow() {
    await this.getHomeDetail()
  },
  onPageScroll(e) {
    this.showNavTitle = !(e.scrollTop <= 200)
  },
  onShareAppMessage() {
    return {
      title: this.title,
      imageUrl: this.goodsImg.indexOf('http') === -1 ? 'http:' + this.goodsImg : this.goodsImg,
      path: `/packages/src/integral/detail?id=${this.id}&activitytype=${this.activitytype}&type=${this.ordersourcetype}&btn=${this.btn}&activityprizeid=${this.activityprizeid}&subcategory=${this.subcategory}&productid=${this.productid}&actid${this.actid}&PrizeType=${this.PrizeType}`
    }
  },
  methods: {
    // 积分商城实物邮寄、门店兑换
    skipJfSettlePage(type) {
      this.showPrizePopup = false
      this.openSkuPopup(type ? 'storeCancel' : '')
    },
    async getCartCount() {
      let res = await apiGetCartCount({})
      if (this.$ck(res)) {
        this.cartCount = res.return_data.goodscount
      }
    },
    handleNext(e) {
      this.chargenumber = e
      this.showPhonePopup = false
      this.openSkuPopup()
    },
    // 选完sku 提交
    async onSkuSubmit(val, data) {
      const query = {
        activitytype: this.activitytype || 0,
        exchangetype: this.exchangetype,
        products: [val],
        ordersourcetype: this.ordersourcetype
      }
      this.$loading.show()
      let res = await apiCheckoutOrder(query)
      this.$loading.hide()
      if (this.$ck(res, true)) {
        let query = `id=${this.id}&type=${this.ordersourcetype}&formatname=${val.formatname}&activityprizeid=${this.activityprizeid}&productid=${this.productid}&actid=${this.actid}&subcategory=${this.subcategory}&chargenumber=${this.chargenumber}`
        // 标记实物礼品门店自提方式
        if (data && data.type === 'storeCancel') {
          query += `&deliveryMode=1`
        }
        uni.navigateTo({
          url: `/packages/src/integral/settle?${query}`
        })
      }
    },
    toCart() {
      uni.navigateTo({
        url: '/packages/src/integral/cart'
      })
    },
    async onSkuAddCart(val) {
      this.$loading.show()
      let res = await apiAddCart(Object.assign({ isappend: 1 }, val))
      this.$loading.hide()
      if (this.$ck(res, true)) {
        this.$msg('已添加到购物车')
        setTimeout(() => {
          this.getCartCount()
        }, 1500)
      }
    },
    async getHomeDetail() {
      // 如果没有商品ID
      // #ifdef MP-GUIDE
      if (!this.id && this.activityprizeid) {
        let info = await apiPrizeDetail({
          awardid: this.activityprizeid, // 领奖记录ID
          type: this.PrizeType // 0:红包；1积分；2：购物券；3：礼品
        })
        if (this.$ck(info)) {
          let data = JSON.parse(info.return_data)
          this.id = data.productid
          if (data.isshowproductremark && data.productgetremark) {
            this.popupMsg = decodeURIComponent(data.productgetremark)
            this.showPopup = true
            this.popupflag = ''
          }
          this.productgettype = data.productgettype
        }
      }
      // #endif
      this.$loading.show()
      let res
      if (this.ordersourcetype === 1) {
        res = await apiGetIntegralDetail({ id: this.id })
      } else {
        // 导购礼品
        // #ifdef MP-GUIDE
        res = this.activityprizeid
          ? await apiGetIntegralDgDetail({ productID: this.id })
          : await apiGetIntegralMarketingDetail({ goodsid: this.id, subcategory: this.subcategory })
        // #endif

        // #ifndef MP-GUIDE
        res = await apiGetIntegralMarketingDetail({ goodsid: this.id, subcategory: this.subcategory })
        // #endif
      }
      // 提前结束loding，防止被toast影响
      this.$loading.hide()
      const { return_code: code, return_data: data, return_msg: msg } = res
      if (code === 0) {
        // 多规格处理
        let GoodsSysSpecificationsList = JSON.parse(JSON.stringify(data.gglist || []))
        GoodsSysSpecificationsList.forEach(item => {
          item.group = data.productspecificationlist.filter(child => {
            if (item.sid === child.sid) {
              return child
            }
          })
        })
        this.skuList = GoodsSysSpecificationsList
        this.GoodsForMatList = data.productformatslist
        this.title = data.productname
        this.GoodDesc =
          data.remark &&
          data.remark.replace(
            /<img src([^>\s]+)(([^>]+)\s?style="(.*?)"\s?)?\/>/gi,
            '<img src$1 style="max-width:100%;height:auto;vertical-align:middle;" />'
          )
        this.goodsImg = data.activitypics[0]
        data.ordertimeouthour = this.hoursToMinutes(data.ordertimeouthour)
        this.goods = data
        setTimeout(() => {
          this.loading = false
        }, 500)
        // 礼品模式并且是付费礼品，查一下奖品详情，拿截止时间
        // #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP || MP-RETAIL
        if (this.isGiftExchange && this.goods.activityrecordsmore.priceusetype === 1) {
          this.getGiftOverTime()
        }
        // #endif
        // 如果是礼品模式，并且是单规格，并且是实物，库存大于0，直接下单 (只跳转一次)   百年需求，测回功能先
        // if (
        //   this.isGiftExchange &&
        //   !this.skuList.length &&
        //   this.goods.isvirtual === 0 &&
        //   this.goods.maxcount > 0 &&
        //   this.autoJump
        // ) {
        //   // 判断是配送还是门店自提
        //   if (this.productgettype === 2) {
        //     return (this.showPrizePopup = true)
        //   }
        //   if (this.productgettype === 1) {
        //     // 门店自提
        //     return this.skipPage(1)
        //   }
        //   this.onSkuSubmit({
        //     productid: this.id,
        //     formatid: 0,
        //     quantity: 1,
        //     formatids: '',
        //     formatname: '',
        //     isfreightfree: this.goods.shippingtemplate.id,
        //     price: this.goods.price,
        //     recordid: this.activityprizeid
        //   })
        //   this.autoJump = false
        // }

        !this.isGiftExchange && this.getCartCount()
      } else if (/商品不存在|暂无数据/.test(msg)) {
        // 此处不确定其他端状态码，临时用文案判断
        uni.showModal({
          title: '温馨提示',
          content: '当前礼品不支持查看详情哦',
          showCancel: false,
          confirmText: '知道了',
          success: () => {
            const pages = getCurrentPages()
            if (pages.length > 1) {
              uni.navigateBack()
            } else {
              uni.reLaunch({ url: '/pages/index/index' })
            }
          }
        })
      } else {
        this.$msg(msg)
      }
    },
    async getGiftOverTime() {
      if (this.busy) return
      this.busy = true
      let res
      // #ifdef MP-MEMBER || MP-CLOUDSHOP
      if (this.ordersourcetype === 2) {
        // 2 智能营销 3 互动营销
        res = await apiGetSweepPrizeDetail({ id: this.id, type: 3 })
      } else {
        res = await apiGetMarketPrizeDetail({ id: this.activityprizeid })
      }
      // #endif
      // #ifdef MP-GUIDE
      // 2 智能营销 3 互动营销
      res = await apiPrizeDetail({
        awardid: this.activityprizeid, // 领奖记录ID
        type: 3 // 0:红包；1积分；2：购物券；3：礼品
      })
      res.return_data = this.$toLowerKey(JSON.parse(res.return_data))
      // #endif
      // #ifdef MP-RETAIL
      res = await apiGetPrizeDetail({
        id: this.id, // 领奖记录ID
        type: 3 // 0:红包；1积分；2：购物券；3：礼品
      })
      // #endif

      if (this.$ck(res, true)) {
        // #ifdef MP-MEMBER || MP-CLOUDSHOP || MP-RETAIL
        this.overtime = res.return_data.overtime || ''
        // #endif
        // #ifdef MP-GUIDE
        this.overtime = res.return_data.prizeproductreceivetime || ''
        // #endif
      }
    },
    hoursToMinutes(hours) {
      if (hours < 1) {
        // 转换为分钟
        const minutes = hours * 60
        return `${Math.round(minutes)}分钟`
      }
      return `${hours} 小时`
    },
    async handleSubmit(e) {
      // #ifdef MP-GUIDE
      if (this.activityprizeid) {
        // 0：实物；1：虚拟票券2：联盟卡券；3：直充类 10：服务商礼品
        if (this.goods.isvirtual === 0) {
          this.productgettype === 2 ? (this.showPrizePopup = true) : this.skipPage(this.productgettype)
        }
        if (this.goods.isvirtual === 1) {
          this.openSkuPopup()
        }
        if (this.goods.isvirtual === 10) {
          this.showPhonePopup = true
        }
        return
      }
      // #endif
      // 如果是礼品模式，并且是单规格，并且是实物，库存大于0，直接下单 (只跳转一次)   不弹SKU 弹窗了
      if (this.isGiftExchange && !this.skuList.length && this.goods.isvirtual === 0 && this.goods.maxcount > 0) {
        return this.onSkuSubmit({
          productid: this.id,
          formatid: 0,
          quantity: 1,
          formatids: '',
          formatname: '',
          isfreightfree: this.goods.shippingtemplate.id,
          price: this.goods.price,
          recordid: this.activityprizeid
        })
      }
      // 如果是积分商城实物礼品，立即兑换，支持线下门店核销，
      if (this.isJfvirtual && !e && this.goods.localstoreexchange) {
        // 如果限制了兑换门店范围
        if (this.goods.exchangestoredistance > 0) {
          let resData = await getUserLocation({
            skipChoose: false, // 是否用地图选点
            useTencentMapAPI: false, // 是否用腾讯地图逆解析
            isReturnProvinceCity: false // 是否返回省市区
          })
          this.checkStore(resData)
        } else {
          this.showPrizePopup = true
        }
        return
      }
      this.openSkuPopup(e)
    },
    popupCancel() {
      if (this.popupflag === 'jfCity') this.openSkuPopup()
    },
    // 检查附近是否有可用门店可兑换，没有则走邮寄流程
    async checkStore(location) {
      let res = await apiCheckExistStore({
        ProductID: this.id, //实物礼品ID
        Distance: this.goods.exchangestoredistance, //门店核销限制距离
        Lat: location.latitude,
        Lng: location.longitude
      })
      if (this.$ck(res)) {
        if (res.return_data) {
          this.showPrizePopup = true
        } else {
          this.popupMsg = `由于您附近5000米内无可兑换门店，故只能通过快递邮寄的方式进行下单兑换`
          this.popupflag = 'jfCity'
          this.showPopup = true
        }
      }
    },
    skipPage(state) {
      this.showPrizePopup = false
      if (state === 0) {
        this.openSkuPopup()
      }
      if (state === 1) {
        uni.redirectTo({
          url: `/packages/src/integral/settle?type=4&activityprizeid=${this.activityprizeid}&ordersourcetype=2&PrizeType=${this.PrizeType}`
        })
      }
    },
    openSkuPopup(type = '') {
      this.$refs.skuPopup.open({
        maxcount: this.goods.maxcount,
        type
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail {
  background-color: #f2f2f2;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  .container {
    padding: 0 20rpx;
  }
  .row {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    margin-top: 20rpx;
    .title {
      font-weight: 700;
      color: #000000;
      font-size: 30rpx;
    }
    &.gift {
      padding: 30rpx 20rpx;
      .gift-text {
        color: $price-color;
      }
    }
  }
  .content-box {
    .content-titlt {
      font-size: 30rpx;
      font-weight: 700;
      text-align: center;
      padding: 40rpx 0 20rpx 0;
    }
  }
  .explain-box {
    padding: 30rpx 20rpx;
    .explain {
      color: #666666;
      font-weight: 500;
      font-size: 24rpx;
      margin-top: 16rpx;
    }
    .vip-box {
      .vip {
        margin-top: 18rpx;
        display: inline-block;
        background: $bg-color;
        border-radius: 19rpx;
        font-weight: 500;
        color: #000000;
        font-size: 22rpx;
        padding: 0 10rpx;
        margin-right: 10rpx;
        height: 38rpx;
        line-height: 38rpx;
      }
    }
  }
  .goods-title-box {
    padding: 30rpx 20rpx;

    .price-box {
      font-size: 36rpx;
      color: $price-color;
      font-weight: 800;
      margin-top: 20rpx;
      display: flex;
      justify-content: space-between;
      .coin {
        color: #666666;
        font-weight: 500;
        font-size: 24rpx;
        .num {
          color: #000;
          font-weight: 700;
        }
      }
    }
    .inventory {
      margin-top: 12rpx;
      color: #666666;
      font-weight: 500;
      font-size: 24rpx;
    }
    .freight {
      margin-top: 30rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #666666;
      font-weight: 500;
      font-size: 24rpx;
    }
  }
  .footer-container {
    box-sizing: content-box;
    position: fixed;
    width: 100%;
    height: 110rpx;
    bottom: 0;
    background-color: #fff;
    padding-bottom: calc(constant(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
    .footer-box {
      display: flex;
      padding: 0 20rpx;
      .cart {
        justify-content: center;
        position: relative;
        .icongouwuche-miaobian {
          font-size: 40rpx;
        }
        .num {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--theme-color, #ff6440);
          color: #fff;
          border-radius: 50%;
          width: 30rpx;
          height: 30rpx;
          text-align: center;
          line-height: 30rpx;
          top: -4rpx;
          right: -6rpx;
        }
      }

      .footer-button {
        flex: 1;
        margin-top: 15rpx;
        height: 80rpx;
        border-radius: 40rpx;
        background-color: $bg-color;
        line-height: 80rpx;
        font-size: 32rpx;
        text-align: center;
        color: #000000;
        line-height: 80rpx;
        ::v-deep .btn__inner {
          color: #000;
          font-size: 32rpx;
          font-weight: 700;
          color: $integral-text-color;
        }
      }
      .plan {
        background-color: #2a2823;
        color: #fff;
        ::v-deep .btn__inner {
          color: #fff;
          background-color: #2a2823;
        }
      }
    }
  }
}
.button-c {
  margin-top: -50rpx;
  .btn {
    margin: 0 auto;
    width: 400rpx;
    line-height: 72rpx;
    text-align: center;
    height: 72rpx;
    border-radius: 36rpx;
    border: 1rpx solid #999999;
    margin-top: 30rpx;
  }
  .plan {
    background: linear-gradient(90deg, #f2bc64 0%, #ffe29a 100%);
    font-weight: bold;
    color: #9a4802;
    border: none;
  }
  .plan2 {
    background: #ffd461;
    font-weight: bold;
    color: #000;
    border: none;
  }
  .tips {
    color: #ff4b40;
    font-size: 26rpx;
    margin-top: 30rpx;
  }
}
.rich-text {
  padding-bottom: 40rpx;
  ::v-deep {
    ._img {
      display: block;
    }
  }
}
</style>
