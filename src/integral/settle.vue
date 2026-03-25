<template>
  <view :style="themeVars">
    <view class="settle-content fs-28">
      <title-bar :title="title" back-color="black" title-color :is-settle="isSettle" show-placeholder />
      <!-- 门店兑奖 -->
      <settle-stores v-if="list.code && type == 4" :list-store="list" :img="imgSrc" @near="handleCheckStore" />

      <!-- 填写订单 -->
      <view v-if="type != 4 && list.items">
        <!-- 头部收货地址   只有实物奖品邮寄方式有运费才显示 -->
        <view v-if="showAddress" class="settle-address settle-sty" @tap="handleOpenRess()">
          <view class="address-top flex flex-between flex-middle">
            <view class="fw-bold">
              <span class="iconfont icondizhi" />
              <span v-if="!list.address.mobile" class="address-add">添加收货地址</span>
              <span v-else class="address-add">{{ list.address.consignee }} {{ list.address.mobile }}</span>
            </view>
            <view class="iconfont icon-more" />
          </view>
          <view v-if="list.address.mobile" class="address-bom fs-24">
            <text v-if="list.address.provincename !== null">{{ list.address.provincename }}</text>
            <text v-if="list.address.cityname !== null">{{ list.address.cityname }}</text>
            <text v-if="list.address.countyname !== null">{{ list.address.countyname }}</text>
            <text v-if="list.address.addressdetail !== null">
              {{ list.address.addressdetail }}
            </text>
          </view>
        </view>

        <!-- 礼品信息 -->
        <view class="settle-info settle-sty">
          <view class="fw-bold mb-20">礼品信息</view>
          <view v-for="(item, index) in list.items" :key="index" class="info-item">
            <view class="flex">
              <image class="info-img" mode="aspectFit" :src="item.picture" />
              <view class="info-shop flex-1 flex flex-column flex-between ml-20">
                <view class="text-left">
                  <view class="info-shop-top">{{ item.name }}</view>
                  <view v-if="item.formatname" class="info-shop-size">{{ item.formatname }}</view>
                </view>
                <view class="flex flex-middle flex-between fs-24">
                  <view class="flex flex-middle fw-bold">
                    <view v-if="item.points">{{ item.points }}积分</view>
                    <view v-if="item.points && item.price" style="margin: 0 5rpx">+</view>
                    <price v-if="item.price" mode="cash" :price="item.price" double show-sign />
                  </view>
                  <view class="shop-price-ri">x{{ item.quantity }}</view>
                </view>
              </view>
            </view>
            <view v-if="item.failtip" class="fail-tip mt-10 fs-24">{{ item.failtip }}</view>
          </view>
        </view>
        <!-- 积分 运费  金额 -->
        <view v-if="list.paypoints || list.actualamount || deliveryfee" class="settle-integral settle-sty">
          <view class="integral-box">
            <view v-if="list.paypoints" class="integral-int">
              <view class="integral-points">积分</view>
              <view>{{ list.paypoints }}</view>
            </view>
            <view v-if="list.actualamount" class="integral-int">
              <view class="integral-points">金额</view>
              <price mode="cash" :price="list.actualamount" double show-sign />
            </view>
            <view v-if="deliveryfee" class="integral-int">
              <view class="integral-points">运费</view>
              <price mode="cash" :price="deliveryfee" double show-sign />
            </view>
          </view>
          <view class="flex flex-middle flex-end fs-26 fw-bold mt-30">
            <view>应付:</view>
            <view class="integral-cope-right flex flex-middle ml-30 fs-30">
              <view v-if="list.paypoints">{{ list.paypoints }}积分</view>
              <view v-if="list.paypoints && (list.actualamount || deliveryfee)" style="margin: 0 5rpx">+</view>
              <price
                v-if="list.actualamount || deliveryfee"
                :price="list.actualamount + deliveryfee"
                double
                show-sign
                mode="card"
              />
            </view>
          </view>
        </view>
        <!-- 留言 -->
        <view class="settle-message settle-sty">
          <view class="message-box message-border">
            <view class="message-left">微信号</view>
            <input
              v-model="form.webchatnumber"
              type="text"
              style="width: 85%"
              placeholder-class="pla-class"
              placeholder="选填，以便客服联系你"
              maxlength="30"
            />
          </view>
          <view v-if="list.isneedidentitynumber" class="message-box message-border mt-30 required">
            <view class="message-left">身份证号</view>
            <input
              v-model="form.useridentitynumber"
              type="idcard"
              style="width: 85%"
              placeholder-class="pla-class"
              placeholder="必填，用于核实用户信息"
              maxlength="18"
            />
          </view>
          <view class="message-box" style="padding-top: 25rpx">
            <view class="message-left">订单留言</view>
            <input
              v-model="form.orderremark"
              type="text"
              style="width: 85%"
              placeholder-class="pla-class"
              placeholder="选填，请先与品牌商协商一致"
              maxlength="200"
            />
          </view>
        </view>
        <view class="gap" />
        <!-- 确认兑换 -->
        <view class="integral-footer">
          <view v-if="!isdistribution && list.address !== null" class="integral-support">该地区不支持配送</view>
          <view class="footer-confirm" @click="handleSave()">
            <view :class="['footer-btn', !isdistribution ? 'footer-wite' : '']">确认{{ textStride }}</view>
          </view>
        </view>
      </view>
    </view>

    <guide-toast ref="guideToast" />
    <canvas canvas-id="myCanvas" class="canvas-code" />
    <pay ref="pay" @success="success" @errFail="errFail" />
    <common-popup
      v-model="showPrizeConfirm"
      type="confirm"
      title="温馨提示"
      :content="list.warmtips"
      @confirm="handleSave(true)"
    />
    <!-- #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP -->
    <FailCart v-model="showFailCart" :list="failCarList" @remove="onRemoveCart" />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import subscribeMsg from 'packages/mixins/subscribe-msg' // 消息订阅
import titleBar from '../components/title-bar/title-bar'
import price from '../components/price/price'
import pay from '../components/pay/pay'
import SettleStores from './components/settle-stores.vue'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import {
  apiOrderConfirm,
  apiOrderFreightinfo,
  apiOrderCommit,
  apiOrderStorerewarddetail,
  apiOrderhandler
} from '../api/order.js'
import integralMixin from './mixins/integral.js'
// 万能零售不需要门店兑换,地图，生成二维码,消息订阅
// #ifdef MP-GUIDE || MP-MEMBER
import GuideToast from '@/components/guide-toast/index.vue'
import Map from '@/utils/map'
import QRCode from '@/utils/qr-code'
import { apiExpressTemplate } from '../api/order.js'
import { apiAddSubscribemsgRecord } from '../api/integral.js'
// #endif
// #ifdef MP-GUIDE
import { apiPrizeDetail } from '../api/integral.js'
import { uniLogin } from '../utils/login.js'
import store from '@/store'
// #endif
// #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP
// 暂只有导购小程序，后面开放到会员小程序+云店
import FailCart from './components/fail-cart'
import { apiGetCheckoutFreight } from '../api/order.js'
import { apiCheckoutOrder, apiCartDelete } from '../api/integral.js'
import { isValidChineseID } from 'packages/utils/function.js'
// #endif
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    titleBar,
    CommonPopup,
    // #ifdef MP-GUIDE || MP-MEMBER
    GuideToast,
    // #endif
    price,
    SettleStores,
    pay,
    // #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP
    FailCart
    // #endif
  },
  mixins: [
    subscribeMsg,
    integralMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      type: 1, // 类型： 1.兑换订单 默认 (2,3).实物奖品,智能营销 的填写订单 4.门店兑奖 5.生日礼包 6.购物车结算
      title: '兑换确认',
      form: {
        webchatnumber: '', //微信号
        orderremark: '', //备注
        useridentitynumber: '' //身份证号
      },
      deliveryfee: 0, // 运费
      isdistribution: true, // 是否支持派送
      list: {}, //数据
      imgSrc: '', // 门店兑换二维码
      isSettle: 1, // 如果是门店兑奖就 == 2
      msg: '', //兑换接口响应结果
      productid: 0, //商品ID
      actid: 0, //活动id
      activityprizeid: 0, //模板运费奖项id
      subcategory: 0, //积分类型 2积分换购订单6扫码实物中奖订单13营销订单14 会员小程序 19生日礼包
      templateId: [],
      PrizeType: 0, // 奖品类型// 0:红包；1积分；2：购物券；3：礼品（导购礼品信息用到）
      chargenumber: '', //获取的手机号码
      ordersourcetype: 1, //订单来源类型，1：积分商城订单 2:扫码中奖订单 3：营销订单 5:生日礼包
      deliveryMode: 0, // 配送方式 0：快递 1：门店自提 积分商城实物下单才有
      // #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP
      cartIds: [],
      showFailCart: false,
      failCarList: [],
      busy: false,
      // #endif
      showPrizeConfirm: false,
      // #ifdef MP-MEMBER
      // 门店兑奖轮询核销状态（仅会员小程序）
      pollTimer: null,
      storeRewardAwardId: '' // type===4 时用于轮询的 awardid
      // #endif
    }
  },
  computed: {
    showAddress() {
      return this.list.isneedorderaddress === 1 && this.deliveryMode !== 1
    }
  },
  onLoad(options) {
    /**
     * type 类型： 1 :兑换订单   (2,3)：实物奖品,智能营销的填写订单    4:门店兑奖
     *  门店兑换需要参数  :id   获奖物品id（awardid）
     *  门店兑换需要参数  :ordersourcetype    订单来源类型，1：积分商城订单 2:扫码中奖订单 3：营销订单
     * PrizeType  奖品类型// 0:红包；1积分；2：购物券；3：礼品（导购礼品信息用到）
     * */
    if (options.type) {
      this.type = +options.type || 1
      this.deliveryMode = +options.deliveryMode || 0
      this.ordersourcetype = this.type
      this.activityprizeid = options.activityprizeid || 0
      this.subcategory = options.subcategory
      this.actid = options.actid || 0
      this.productid = options.productid || 0
      this.PrizeType = options.PrizeType || 0
      this.chargenumber = options.chargenumber || ''
      this.type === 6 && (this.cartIds = options.cartids.split(',').map(Number))
      this.title = [2, 3, 5].includes(this.type) ? '填写订单' : this.type === 4 ? '门店兑换' : '兑换确认'
      // 如果是门店兑奖头部就要变成黄色
      if (this.type === 4) {
        this.isSettle = 2
        // 门店兑换
        this.findCOde(options.id, options.ordersourcetype)
      } else {
        // 填写订单
        const formatname = options.formatname || ''
        this.findConfirmInfo({ formatname })
      }
    }
  },
  onShow() {
    uni.$once('selectRess', res => {
      this.list.address = res
      this.list.address.addressid = res.id
      this.list.address.addressdetail = res.address
      // 运费模板接口
      this.getFreight()
    })
  },
    // #ifdef MP-MEMBER
  onUnload() {
    this.clearStoreRewardPoll()
  },
    // #endif
  methods: {
    // #ifdef MP-MEMBER
    // 清除门店兑奖轮询（仅会员小程序）
    clearStoreRewardPoll() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    // 轮询门店兑奖核销状态（参考 order/detail 的轮询逻辑）仅 ordersourcetype 为 2（扫码中奖）时轮询
    pollStoreRewardStatus(params) {
      const isVerified = status => status === '已兑换'
      if (isVerified(this.list.status)) {
        this.clearStoreRewardPoll()
        return
      }
      if (this.pollTimer) return
      this.pollTimer = setInterval(() => this.fetchStoreRewardStatus(params), 2000)
    },
    fetchStoreRewardStatus(params) {
      const isVerified = status => status === '已兑换'
      apiOrderStorerewarddetail(params).then(res => {
        if (this.$ck(res)) {
          this.list = res.return_data || {}
          if (isVerified(this.list.status)) this.clearStoreRewardPoll()
        }
      })
    },
    // #endif
    returnBack() {
      setTimeout(() => {
        uni.navigateBack()
      }, 2500)
    },
    // 获取订单信息
    async findConfirmInfo({ formatname, notice = true, loading = true } = {}) {
      try {
        loading && this.$loading.show()
        const res = await apiOrderConfirm()
        // #ifdef MP-MEMBER
        // 过期返回上一页
        if (res && res.return_code === 36004) {
          this.returnBack()
        }
        // #endif
        if (this.$ck(res)) {
          const d = res.return_data || {}
          if (this.type === 5) {
            // 字段兼容：生日礼包有提示文案
            d.items.forEach(item => {
              item.failtip = '*此商品性质不支持退货服务'
            })
          }
          if (formatname) {
            // 字段兼容：多规格拼接
            d.items.forEach(item => {
              item.formatname = formatname
            })
          }

          this.list = d
          d?.address?.cityid && this.deliveryMode !== 1 && this.getFreight()
          if (notice) {
            // 万能零售无
            // #ifdef MP-GUIDE || MP-MEMBER
            // (0：实物；1：虚拟票券 4：联盟卡券；3：直充类（已下架） 10：服务商礼品)  实物、虚拟票券、服务商礼品才有订阅
            let state = d.items.every(item => {
              return [0, 1, 10].includes(item.isvirtual)
            })
            if (state) {
              this.fetchNotice()
            }
            // #endif
          }
        }
      } finally {
        loading && this.$loading.hide()
      }
    },

    // 点击确认兑换
    async handleSave(type = false) {
      this.showPrizeConfirm = false
      if (!this.isdistribution) return //地区不支持配送
      if (this.showAddress && (this.list.address === null || this.list.address.mobile === '')) {
        this.$msg('请选择收货地址')
        return
      }
      if (this.list.isneedidentitynumber && !this.form.useridentitynumber) {
        this.$msg('请填写身份证号')
        return
      }
      if (this.list.isneedidentitynumber && !isValidChineseID(this.form.useridentitynumber)) {
        this.$msg('请填写正确身份证号')
        return
      }
      // 如果是奖品，并且开启提示语
      if (this.list.isprizeorder && this.list.warmtips && !type) {
        return (this.showPrizeConfirm = true)
      }
      // 积分商城实物门店核销不需要消息通知
      !this.deliveryMode && (await this.requestSubscribeMsg(this.templateId))
      this.commitOrder()
    },
    commitOrder() {
      return new Promise(resolve => {
        this.$loading.show()
        apiOrderCommit({
          addressid:
            this.showAddress && this.list.address && this.list.address.addressid
              ? Number(this.list.address.addressid) || 0
              : 0, // 收货地址Id
          webchatnumber: this.form.webchatnumber || '', //微信号
          chargenumber: this.chargenumber,
          orderremark: this.form.orderremark || '', //订单备注
          actualamount: this.list.actualamount, //订单需支付的总价格(不含运费)
          totalpoint: this.list.paypoints, //总消耗积分
          deliveryfee: this.deliveryfee, //运费
          totalweight: this.list.weight, //商品总重:单位克
          useridentitynumber: this.form.useridentitynumber || '', //身份证号
          deliverymode: this.deliveryMode //配送方式 0：快递 1：门店自提
        }).then(res => {
          this.$loading.hide()
          const d = this.$toLowerKey(res, true)
          let { ordernumber, orderid, products } = d.return_data || {}
          if (d.return_code === 0) {
            ordernumber = ordernumber || ''
            this.list.ordernumber = ordernumber
            this.list.orderid = orderid || ''
            // #ifdef MP-GUIDE || MP-MEMBER
            this.addSubscribemsg(ordernumber)
            // #endif

            // #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP
            this.showFailCart = false
            // #endif

            // 如果是有现金和运费就调起支付功能
            if (this.deliveryfee || this.list.actualamount) {
              this.list.originalamount = ((this.list.actualamount || 0) * 100 + (this.deliveryfee || 0) * 100) / 100
              this.$refs.pay.PayOrder(this.list)
            } else {
              this.success()
            }
          } else if (d.return_code === 601017) {
            // #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP
            const p = products || []
            if (p.length > 0) {
              // 购物车结算失败
              this.failCarList = p.map(item => ({
                shoppingcartitemid: item.shoppingcartitemid,
                name: item.productname,
                formatname: item.types,
                picture: item.pic,
                quantity: item.quantity,
                failtip: item.return_msg
              }))
              this.showFailCart = true
            }
            // #endif
          } else {
            // #ifdef MP-MEMBER
            // 过期返回上一页
            if (d && d.return_code === 36004) {
              this.returnBack()
            }
            // #endif
            this.$msg(d.return_msg)
          }
          resolve()
        })
      })
    },
    // 支付成功回调
    async success() {
      // #ifdef MP-GUIDE || MP-MEMBER
      this.$loading.hide()
      const res = await apiOrderhandler({ ordernumber: this.list.ordernumber })
      if (res.return_code !== 0) this.msg = res.return_msg
      uni.redirectTo({
        url: `/packages/src/integral/pay?id=${this.list.ordernumber}&type=${this.type}&msg=${this.msg}&subcategory=${this.subcategory}`
      })
      // #endif
      // #ifdef MP-RETAIL || MP-CLOUDSHOP
      uni.redirectTo({
        url: `/packages/src/integral/pay?id=${this.list.ordernumber}&type=${this.type}&msg=${this.msg}&subcategory=${this.subcategory}`
      })
      // #endif
    },
    // 支付失败回调
    errFail() {
      this.$loading.hide()
      this.$msg('操作失败')
      setTimeout(() => {
        uni.redirectTo({
          url: `../order/detail?id=${this.list.orderid}&type=${this.type}`
        })
      }, 1000)
    },
    // #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP
    async onRemoveCart() {
      if (this.busy) return

      const failCartIds = this.failCarList.map(item => item.shoppingcartitemid)
      // 将失败礼品从购物车移除
      if (failCartIds.length > 0) {
        const del = await this.deleteCarts(failCartIds)
        if (!del) return
      }

      if (this.failCarList.length === this.list.items.length) {
        this.$msg('没有可下单的礼品', { duration: 2500 })
        setTimeout(() => {
          // 一般从购物车进来，直接返回上一页
          uni.navigateBack()
        }, 2500)
        return
      }
      this.busy = true
      // 移除失败礼品，剩下礼品重新校验并下单
      const newCartIds = this.cartIds.filter(item => !failCartIds.includes(item))
      const check = await this.checkOrder(newCartIds)
      if (!check) {
        this.busy = false
        return
      }

      await this.findConfirmInfo({ notice: false, loading: false })
      await this.commitOrder()
      this.busy = false
    },
    async checkOrder(shoppingcartitems) {
      const res = await apiCheckoutOrder({
        ordersourcetype: 6,
        shoppingcartitems
      })
      if (this.$ck(res)) {
        this.cartIds = (res.return_data.products || []).map(item => item.shoppingcartitemid)
        return true
      }
      return false
    },
    async deleteCarts(ids) {
      const res = await apiCartDelete({ ids })
      if (res.return_code !== 0) {
        this.$msg(res.return_msg)
        return false
      }
      return true
    },
    // #endif
    // 运费模板
    getFreight() {
      if (!this.showAddress) return
      const m = {
        0: {
          api: apiOrderFreightinfo,
          params: {
            productid: Number(this.productid), //商品ID (必填)
            weight: this.list.weight, //重量(必填)
            isfreightfree: this.list.isfreightfree, //运费模板ID，0：不用运费(必填)
            activityprizeid: this.activityprizeid, //奖项id
            actid: this.actid //活动id
          }
        },
        // #ifdef MP-GUIDE || MP-MEMBER || MP-CLOUDSHOP
        1: {
          api: apiGetCheckoutFreight,
          params: {}
        }
        // #endif
      }
      const mode = this.type === 6 ? 1 : 0
      m[mode]
        .api({
          cityid: this.list.address ? +this.list.address.cityid : 0, //收货城市Id(必填)
          ordersourcetype: this.type, //1：积分商城订单 2:扫码中奖订单 3：营销订单 5:红包订单
          ...m[mode].params
        })
        .then(res => {
          if (this.$ck(res)) {
            let { isdistribution, deliveryfee, freightinfos } = res.return_data
            if (this.type !== 6) {
              // 配送区域判断: 非购物车结算，一般只有单个礼品
              this.isdistribution = isdistribution
            } else {
              freightinfos = freightinfos || []
              this.isdistribution = freightinfos.length > 0 && freightinfos.every(item => item.isdistribution)
              const notDelivery = freightinfos.filter(item => !item.isdistribution).map(item => item.productid)
              this.list.items.forEach(item => {
                item.failtip = ''
                if (notDelivery.includes(item.productid)) {
                  item.failtip = '此礼品该地区不支持配送'
                }
              })
            }
            this.deliveryfee = deliveryfee || 0
          }
        })
    },

    // 门店兑奖二维码信息
    findCOde(id, ordersourcetype) {
      let typeEnum = {
        1: '积分商城订单',
        2: '扫码活动',
        3: '营销订单'
      }
      // #ifdef MP-GUIDE
      apiPrizeDetail({
        awardid: this.activityprizeid, // 领奖记录ID
        type: this.PrizeType // 0:红包；1积分；2：购物券；3：礼品
      }).then(res => {
        if (this.$ck(res)) {
          let data = JSON.parse(res.return_data)
          this.list = {
            code: data.awdcode,
            status: data.getStatus,
            isshowstore: 1,
            prizeimg: data.picPath,
            prizename: data.prizeName,
            quantity: 1,
            overtime: data.prizeproductreceivetime,
            winningtime: data.addTime,
            rewardsource: typeEnum[ordersourcetype]
          }
          new QRCode('myCanvas', {
            text: data.awdcodeqrcode,
            width: 150,
            height: 150,
            padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
            correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
            callback: res => {
              this.imgSrc = res.path
            }
          })
        }
      })
      // #endif

      // #ifndef MP-GUIDE
      this.$loading.show()
      const params = { awardid: Number(id), ordersourcetype }
      apiOrderStorerewarddetail(params).then(res => {
        this.$loading.hide()
        if (this.$ck(res)) {
          this.list = res.return_data || {}
          // #ifdef MP-MEMBER
          if (params && params.ordersourcetype == 2) {
          this.pollStoreRewardStatus(params)
          }
          // #endif
          new QRCode('myCanvas', {
            text: res.return_data.qrcodecontent,
            width: 150,
            height: 150,
            padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
            correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
            callback: res => {
              this.imgSrc = res.path
            }
          })
        }
      })
      // #endif
    },

    // 门店兑换  点击查看附近门店
    async handleCheckStore() {
      let res = await Map.getWgsInfo()
      if (res.code === 200) {
        this.goStorePage(res.data.gps)
      } else if (res.code === 1002) {
        let toastInfo = {
          status: true,
          title: '请先开启手机的GPS定位功能',
          buttonText: '知道了'
        }
        this.$refs.guideToast.setToastInfo(toastInfo)
      } else {
        this.goStorePage()
      }
    },
    goStorePage(param = {}) {
      let paramString = JSON.stringify(param)
      let storeids = JSON.stringify(this.list.storeids)
      if (paramString !== '{}') {
        // #ifdef MP-GUIDE
        uni.navigateTo({
          url: `/packages/src/integral/store?lat=${param.latitude}&lng=${param.longitude}&awdcode=${this.list.code}`
        })
        // #endif
        // #ifndef MP-GUIDE
        uni.navigateTo({
          url: `/personal/bring-coupon/store-list?gps=${paramString}&storeids=${storeids}`
        })
        // #endif
      } else {
        this.$msg('获取权限失败')
      }
    },
    // 点击跳转去收货地址
    handleOpenRess() {
      uni.navigateTo({
        url: '../address/list?entryType=1'
      })
    },
    async fetchNotice() {
      // 获取订阅消息模板ID
      let param = {}
      // #ifdef MP-GUIDE
      param = {
        js_code: await uniLogin(),
        type: 1
      }
      if (store.state.mpInfo) {
        param = {
          ...param,
          mpappid: store.state.mpInfo.mpAppID,
          mpmemberlogin: store.state.mpInfo.mpMemberLogin
        }
      }
      // #endif

      apiExpressTemplate(param).then(res => {
        if (this.$ck(res)) {
          this.templateId = res.return_data || []
        }
      })
    },
    // #ifdef MP-GUIDE || MP-MEMBER
    /** 添加订阅 */
    async addSubscribemsg(ordernumber) {
      // #ifdef MP-MEMBER
      if (!this.subscribedTempIds.length) return
      apiAddSubscribemsgRecord({
        TemplateIDs: this.subscribedTempIds, //消息模板id
        OrderNo: ordernumber
      }).then(res => {
        this.$ck(res)
      })
      // #endif
      // #ifdef MP-GUIDE
      if (!this.templateId.length) return
      let js_code = await uniLogin()
      apiAddSubscribemsgRecord({
        type: 1, //消息模板类型:1-发货通知消息
        templateid: this.templateId[0], //消息模板id
        keyword: ordernumber, //消息订阅关键字(根据消息类型唯一:1-订单号)
        js_code
      }).then(res => {
        this.$ck(res)
      })
      // #endif
    }
    // #endif
  }
}
</script>


<style lang="scss" scoped>
.settle-content {
  padding: 20rpx;
  position: relative;
  .settle-sty {
    background: #ffffff;
    padding: 30rpx 20rpx;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
  }

  .settle-address {
    .iconfont {
      font-size: 23rpx;
    }
    .address-top {
      .address-add {
        margin-left: 20rpx;
      }
    }
    .address-bom {
      margin-top: 17rpx;
      color: #666666;
    }
  }
  .settle-info {
    .info-item {
      padding-bottom: 30rpx;
      & + .info-item {
        padding-top: 30rpx;
        border-top: 1rpx solid #e5e5e5;
      }
    }
    .info-img {
      display: block;
      width: 160rpx;
      height: 160rpx;
    }
    .info-shop-top {
      font-weight: 700;
      color: #000000;
      line-height: 36rpx;
      margin-bottom: 20rpx;
    }
    .info-shop-size {
      font-size: 24rpx;
      font-weight: 500;
      color: #999999;
      line-height: 30rpx;
      margin-bottom: 20rpx;
    }
    .shop-price-ri {
      color: #666666;
    }
    .fail-tip {
      color: #ff0000;
    }
  }
  .settle-integral {
    .integral-box {
      border-bottom: 1px solid #eeeeee;
      .integral-int {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 26rpx;
        font-weight: 700;
        margin-bottom: 25rpx;
        .integral-points {
          color: #666666;
          font-weight: 500;
        }
      }
    }
    .integral-cope-right {
      color: $price-color;
    }
  }
  .settle-message {
    .message-border {
      border-bottom: 1px solid #eeeeee;
      padding-bottom: 25rpx;
    }
    .message-box {
      display: flex;
      align-items: center;
      .message-left {
        font-size: 26rpx;
        color: #666666;
        width: 120rpx;
        text-align: left;
        margin-right: 50rpx;
      }
    }
    .required {
      position: relative;
      &::after {
        content: '*';
        position: absolute;
        color: red;
        left: -12rpx;
      }
    }
  }

  .integral-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    .footer-confirm {
      width: 100%;
      background: #ffffff;
      padding: 25rpx 20rpx;
      padding-bottom: calc(constant(safe-area-inset-bottom));
      padding-bottom: calc(env(safe-area-inset-bottom));
      min-height: 135rpx;
      box-sizing: border-box;
      .footer-btn {
        background: var(--theme-color, $bg-color);
        border-radius: 40rpx;
        padding: 25rpx 0;
        font-weight: 700;
        text-align: center;
        font-size: 32rpx;
        line-height: 36rpx;
        /*  #ifdef MP-RETAIL  */
        color: #fff;
        /*  #endif  */
      }
      .footer-wite {
        color: rgba(0, 0, 0, 0.3);
      }
    }
    .integral-support {
      font-size: 22rpx;
      text-align: center;
      color: #ffffff;
      background: #666666;
      opacity: 0.8;
      padding: 10rpx 0;
    }
  }
}
.gap {
  height: 155rpx;
  height: calc(135rpx + constant(safe-area-inset-bottom));
  height: calc(135rpx + env(safe-area-inset-bottom));
}
.canvas-code {
  position: fixed;
  left: -999px;
  width: 150px;
  height: 150px;
}
</style>
