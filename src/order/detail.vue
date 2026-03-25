<template>
  <view :style="themeVars">
    <view v-if="list.items && list.items.length > 0" class="orderDetail-content" :style="{ 'padding-top': paddingTop }">
      <title-bar :title="title" back-color="black" title-color is-settle="2" class="title-bar">
        <span slot="iconHeader" class="iconfont find" :class="[iconTitle]" />
      </title-bar>
      <!-- #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP || MP-RETAIL -->
      <view v-if="countTag !== -1 && list.orderstatus == 1" class="time-box">
        剩
        <text class="time-text">{{ hour }}小时{{ minute }}分{{ second }}秒</text>
        自动关闭订单
      </view>
      <!-- #endif -->
      <store-code
        v-if="list.deliverymode === 1 && [3, 4].includes(list.orderstatus)"
        :img-src="codeImg"
        class="db mb-20"
        :list="list"
        @near="handleCheckStore"
      />
      <!-- 头部收货地址   只有实物奖品有运费才显示 -->
      <view
        v-if="list.isvirtual === 0 && list.addressinfo && list.addressinfo.mobile"
        class="orderDetail-address orderDetail-sty"
      >
        <view class="address-top">
          <view class="address-left">
            <span class="iconfont icondizhi" />
            <span class="address-add">{{ list.addressinfo.consignee }} {{ list.addressinfo.mobile }}</span>
          </view>
        </view>
        <view class="address-bom">
          <text v-if="list.addressinfo.provincename !== null">{{ list.addressinfo.provincename }}</text>
          <text v-if="list.addressinfo.cityname !== null">{{ list.addressinfo.cityname }}</text>
          <text v-if="list.addressinfo.countyname !== null">{{ list.addressinfo.countyname }}</text>
          <text v-if="list.addressinfo.addressdetail !== null">{{ list.addressinfo.addressdetail }}</text>
        </view>
      </view>

      <!-- 物流信息 -->
      <view
        v-if="
          list.isvirtual === 0 &&
          list.logistics.length > 0 &&
          list.logistics[0].details.length > 0 &&
          list.orderstatus != 5 &&
          list.orderstatus != 6 &&
          list.deliverymode != 1
        "
        class="orderDetail-address orderDetail-sty"
        @tap="handleLogistics()"
      >
        <view class="address-top">
          <view class="address-left">
            <span class="iconfont iconwuliuxinxi" />
            <span class="address-add">{{ list.logistics[0].details[0].content }}</span>
          </view>
          <view class="iconfont icon-more" />
        </view>
        <view class="address-bom">
          <text>{{ list.logistics[0].details[0].time }}</text>
        </view>
      </view>

      <!-- 礼品信息 -->
      <pruduct-info
        class="orderDetail-sty db"
        :show-total="false"
        :type="type"
        :subcategory="subcategory"
        :order-info="list"
        @handleCourier="handleCourier"
      />

      <!-- 付款信息 -->
      <view v-if="list.paypoints || list.actualamount || list.deliveryfee" class="orderDetail-exchange orderDetail-sty">
        <view v-if="list.paypoints" class="exchange-box">
          <view class="exchange-left">积分</view>
          <view class="">{{ list.paypoints }}</view>
        </view>
        <view v-if="list.actualamount" class="exchange-box">
          <view class="exchange-left">金额</view>
          <price mode="cash" :price="list.actualamount" double show-sign />
        </view>
        <view v-if="list.deliveryfee" class="exchange-box">
          <view class="exchange-left">运费</view>
          <price mode="cash" :price="list.deliveryfee" double show-sign />
        </view>
        <view v-if="list.paypoints || list.actualamount || list.deliveryfee || list.deliveryfee" class="exchange-box">
          <view class="exchange-left">实付</view>
          <view>
            <view class="exchange-right">
              <view v-if="list.paypoints">{{ list.paypoints }}积分</view>
              <view v-if="list.paypoints && (list.actualamount || list.deliveryfee)" style="margin: 0 5rpx">+</view>
              <price
                v-if="list.actualamount || list.deliveryfee"
                :price="(list.actualamount + list.deliveryfee).toFixed(2)"
                double
                show-sign
                mode="card"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 订单号 -->
      <view class="orderDetail-exchange orderDetail-sty">
        <view class="orderDetail-wxs">
          <view class="orderDetail-name">订单号</view>
          <view class="orderDetail-number">
            {{ list.ordernumber }}
            <text class="orderDetail-copy" @click="handleCopy(list.ordernumber)">复制</text>
          </view>
        </view>
        <view class="orderDetail-wxs">
          <view class="orderDetail-name">下单时间</view>
          <view class="orderDetail-number">{{ list.ordertime }}</view>
        </view>
        <view v-if="list.orderstatus === 6" class="orderDetail-wxs">
          <view class="orderDetail-name">退款时间</view>
          <view class="orderDetail-number">{{ list.refundordertime }}</view>
        </view>
      </view>
      <!-- 微信号 -->
      <view class="orderDetail-exchange orderDetail-sty">
        <view class="orderDetail-wxs">
          <view class="orderDetail-name">微信号</view>
          <view class="orderDetail-number">
            {{ list.wechat || '--' }}
            <text v-if="list.wechat" class="orderDetail-copy" @click="handleCopy(list.wechat)">复制</text>
          </view>
        </view>
        <view v-if="list.useridentitynumber" class="orderDetail-wxs">
          <view class="orderDetail-name">身份证号</view>
          <view class="orderDetail-number">{{ list.useridentitynumber }}</view>
        </view>
        <view class="orderDetail-wxs">
          <view class="orderDetail-name">订单留言</view>
          <view class="orderDetail-number">{{ list.orderremark }}</view>
        </view>
      </view>
    </view>
    <!-- #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP || MP-RETAIL -->
    <!-- 确认收货 继续支付 -->
    <view
      v-if="list.orderstatus == 3 || list.orderstatus == 1 || btnToview || list.isshowapplyafter"
      class="orderDetail-footer"
    >
      <!-- #ifdef MP-MEMBER || MP-GUIDE -->
      <view v-if="list.isshowapplyafter" class="footer-confirm" @click="handleSale()">
        <view class="footer-btn">{{ list.aftersalesauditstatus ? '售后详情' : '申请售后' }}</view>
      </view>
      <!-- #endif -->
      <!-- #ifdef MP-RETAIL || MP-CLOUDSHOP -->
      <view
        v-if="list.isshowapplyafter && list.aftersalesauditstatus"
        class="footer-confirm"
        @click="handleSaleDetail()"
      >
        <view class="footer-btn">售后详情</view>
      </view>
      <!-- #endif -->
      <view v-if="list.orderstatus == 3 && list.deliverymode === 0" class="footer-confirm" @click="handleConfirm(1)">
        <view class="footer-btn">确认收货</view>
      </view>
      <view v-if="list.orderstatus == 3 && list.deliverymode === 1" class="footer-confirm" @click="handleConfirm(2)">
        <view class="footer-btn">退 款</view>
      </view>
      <!-- #ifndef MP-RETAIL -->
      <view v-if="list.orderstatus == 1" class="footer-confirm" @click="showCancalPopup = true">
        <view class="footer-btn plan">取消订单</view>
      </view>
      <!-- #endif -->
      <view v-if="list.orderstatus == 1" class="footer-confirm" @click="handlePay()">
        <view class="footer-btn">继续支付</view>
      </view>
      <!-- #ifndef MP-RETAIL -->
      <view v-if="btnToview" class="footer-confirm">
        <view class="footer-btn" @click="handleToview">{{ btnToview }}</view>
      </view>
      <!-- #endif -->
    </view>
    <!-- #endif -->
    <common-popup
      v-model="commonPopup.showPopup"
      type="confirm"
      :title="commonPopup.title"
      :content="commonPopup.content"
      @confirm="popupSubmit"
    />
    <common-popup
      v-model="showCancalPopup"
      type="confirm"
      title="提示"
      :content="
        list.isoldmembershiporder
          ? '取消订单后，礼品将会回到您的账户上，您可在有效期内进入小程序个人中心“我的奖品”重新进行下单兑换'
          : '取消订单后，积分将原路退回到你的账上，是否确定？'
      "
      @confirm="cancalSubmit"
    />
    <!-- 奖品售后确认 -->
    <common-popup
      v-model="showSaleConfirm"
      type="confirm"
      title="提示"
      content="发起退款后，奖品将不予返还，确认申请售后吗？"
      @confirm="cancelSubmit"
    />
    <pay ref="pay" @success="success" />
    <canvas canvas-id="myCanvas" class="canvas-code" />
    <!-- #ifdef MP-MEMBER -->
    <service-group v-if="showServiceGroup" :is-custom-navbar="true" />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import titleBar from '../components/title-bar/title-bar'
import price from '../components/price/price'
import pay from '../components/pay/pay'
import PruductInfo from './components/pruduct-info.vue'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import { apiOrderdetail, apiCancalOrder, apiOrderOrderreceiving, apiRefundOrder } from '../api/order.js'
import { getPage } from 'packages/utils/index'
// #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP
import { filterSuccess, filterSuccessBtn } from '../utils/orders.js'
// #endif
// #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP || MP-RETAIL
import dayjs from 'dayjs'
import TimeMinxs from 'packages/mixins/times.js'
import { apiGetModuleSetting } from '../api/order.js'
// #endif
// #ifdef MP-MEMBER
import ServiceGroup from 'packages/components/service-group'
// #endif
// #ifdef MP-MEMBER || MP-CLOUDSHOP
import { apiGetCodeImg } from 'packages/api/bring-coupon'
// #endif
import StoreCode from './components/store-code.vue'
import { getUserLocation } from 'packages/utils/location-mp.js'
// #ifdef MP-GUIDE || MP-RETAIL
import QRCode from 'packages/utils/qr-code.js'
// #endif
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    titleBar,
    price,
    pay,
    CommonPopup,
    // #ifdef MP-MEMBER
    ServiceGroup,
    // #endif
    StoreCode,
    PruductInfo
  },
  mixins: [
    // #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP || MP-RETAIL
    TimeMinxs,
    // #endif
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      // #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP
      url: '', //跳转路径
      btnToview: '', //跳转路径
      // #endif
      paddingTop: '',
      list: {}, //订单详情数据
      title: '', // 头部标题
      iconTitle: '', // 头部icon
      type: 1, //跳转详情携带type
      id: '', //跳转详情携带id
      subcategory: 0, //跳转兑换详情携带参数
      orderid: 0, //订单id,
      showCancalPopup: false,
      showServiceGroup: false,
      showSaleConfirm: false,
      codeImg: '',
      commonPopup: {
        showPopup: false,
        title: '收货提示',
        content: '请确认是否已经收到货？',
        type: 1 // 1 确认收货 2 退款
      },
      // #ifdef MP-MEMBER
      isConfirmDelivery: false,
      isConfirmDeliveryState: false
      // #endif
    }
  },
  onLoad(options) {
    const { system, windowHeight } = uni.getSystemInfoSync()
    const isIPhoneX = !!(system.toLowerCase().search('ios') + 1) && windowHeight >= 812
    this.paddingTop = isIPhoneX ? '190rpx' : '150rpx'
  },
  onShow() {
    // #ifdef MP-MEMBER
    if (this.isConfirmDelivery) {
      this.isConfirmDelivery = false
      if (this.isConfirmDeliveryState) {
        apiOrderOrderreceiving({ orderid: Number(this.orderid) }).then(res => {
          if (this.$ck(res)) {
            this.$msg('操作成功')
            this.list = {}
            this.getData(this.orderid)
            this.refreshList()
          }
        })
      }
      this.isConfirmDeliveryState = false
      return
    }
    // #endif
    let page = getPage()
    const options = page.query
    if (options.id) {
      this.orderid = options.id
      this.type = options.type || 1
      this.subcategory = options.subcategory
      this.getData(options.id)
      // #ifdef MP-MEMBER
      this.getModuleSetting()
      // #endif
    }
  },
  methods: {
    cancelSubmit() {
      this.showSaleConfirm = false
      uni.navigateTo({
        url: `/packages/src/order/apply-sale?id=${this.orderid}`
      })
    },
    handleSaleDetail() {
      uni.navigateTo({
        url: `/packages/src/order/sale-detail?id=${this.list.ordernumber}`
      })
    },
    handleSale() {
      // 售后申请状态 0 未申请； 1 申请中； 2 申请通过
      if (this.list.aftersalesauditstatus === 0) {
        return (this.showSaleConfirm = true)
      } else {
        this.handleSaleDetail()
      }
    },
    async handleCheckStore() {
      let resData = await getUserLocation({
        skipChoose: false, // 是否用地图选点
        useTencentMapAPI: false, // 是否用腾讯地图逆解析
        isReturnProvinceCity: false // 是否返回省市区
      })
      uni.navigateTo({
        url: `./store-list?gps=${JSON.stringify(resData)}`
      })
    },
    getModuleSetting() {
      apiGetModuleSetting().then(res => {
        if (this.$ck(res)) {
          this.showServiceGroup = !!res.return_data.customaccountstate
        }
      })
    },
    // #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP
    handleToview() {
      uni.redirectTo({
        url: this.url
      })
    },

    // #endif
    endTime() {
      this.getData(this.orderid)
    },
    // 获取接口数据
    getData(orderid) {
      apiOrderdetail(Number(orderid)).then(res => {
        if (this.$ck(res)) {
          // refreshList
          let data = res.return_data || {}
          // 如果订单状态从待收货、核销变成已完成，刷新列表
          if (this.list.orderstatus === 3 && data.orderstatus === 4) {
            this.refreshList()
          }
          this.list = data
          // 头部标题  orderstatus   1 待支付、2 待发货、3 待收货、4 已完成、5 已取消、6 退款订单、7 处理中
          this.title = this.filtertitle(data.orderstatus)
          this.iconTitle = this.filterIcon(data.orderstatus)
          // #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP
          let lipintype = data.items[0]?.lipintype
          if (
            [2, 3, 4].includes(this.list.orderstatus) &&
            lipintype &&
            [2, 4, 6, 7, 8, 9].includes(Number(lipintype))
          ) {
            this.url = filterSuccess(lipintype, orderid, this.type, this.subcategory) // 跳转路径
            this.btnToview = filterSuccessBtn(lipintype) //按钮
          }
          // #endif
          // #ifdef MP-MEMBER || MP-GUIDE || MP-CLOUDSHOP || MP-RETAIL
          if (data.orderstatus === 1) {
            let time = {
              StartTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              EndTime: data.systemcloseordertime
            }

            this.timeCount(time)
          }
          // #endif
          // 轮询逻辑,新经销和业务帮帮没有接入订单，所以无条件编译
          // 订单状态为已接单或配送中且配送方式为上门配送时，获取二维码
          // 订单状态为已接单或已完成，且配送方式为上门配送时，获取二维码
          // 获取核销二维码
          if ([3, 4].includes(data.orderstatus) && data.deliverymode === 1 && !this.codeImg) {
            this.getCodeImg()
          }
          // 订单状态为已接单且配送方式为上门配送时，启动轮询，否则清除轮询
          if (data.orderstatus === 3 && data.deliverymode === 1) {
            if (!this.timer) {
              this.timer = setInterval(() => this.getData(this.orderid), 2000)
            }
          } else if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        }
      })
    },
    getCodeImg() {
      // #ifdef MP-MEMBER || MP-CLOUDSHOP
      apiGetCodeImg({ content: decodeURIComponent(this.list.checkcode) }).then(res => {
        if (this.$ck(res)) {
          this.codeImg = res.return_data.qrcode
        }
      })
      // #endif
      // #ifdef MP-GUIDE || MP-RETAIL
      new QRCode('myCanvas', {
        text: this.list.checkcode,
        width: 150,
        height: 150,
        padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
        correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
        callback: res => {
          this.codeImg = res.path
        }
      })
      // #endif
    },
    // 点击按钮确认收货
    handleConfirm(type = 1) {
      this.commonPopup = {
        showPopup: true,
        title: type === 1 ? '收货提示' : '温馨提示',
        content: type === 1 ? '请确认是否已经收到货？' : '退款后将不可取消，支付积分将原路返回您的账户，是否确认退款？',
        type: type // 1 确认收货 2 退款
      }
    },
    popupSubmit() {
      // #ifdef MP-MEMBER
      if (this.commonPopup.type === 1) {
        const transactionId = this.list.transactionid || this.list.TransactionId
        const isEnableWechatDelivery = this.list.isenablewechatdelivery ?? this.list.IsEnableWechatDelivery
        if (transactionId && isEnableWechatDelivery) {
          this.commonPopup.showPopup = false
          this.isConfirmDelivery = true
          this.isConfirmDeliveryState = false
          wx.openBusinessView({
            businessType: 'weappOrderConfirm',
            extraData: {
              transaction_id: transactionId
            },
            success: (res) => {
              this.isConfirmDeliveryState = res?.extraData?.status === 'success'
            }
          })
          return
        }
      }
      // #endif
      let fn = {
        1: {
          fn: apiOrderOrderreceiving,
          query: { orderid: Number(this.orderid) }
        },
        2: {
          fn: apiRefundOrder,
          query: { OrderNumber: this.list.ordernumber }
        }
      }

      this.commonPopup.showPopup = false
      fn[this.commonPopup.type].fn(fn[this.commonPopup.type].query).then(res => {
        if (this.$ck(res)) {
          this.$msg('操作成功')
          setTimeout(() => {
            this.list = {}
            this.getData(this.orderid)
            this.refreshList()
          }, 1000)
        }
      })
    },
    cancalSubmit() {
      this.showCancalPopup = false
      apiCancalOrder({ ordernumber: this.list.ordernumber }).then(res => {
        if (this.$ck(res)) {
          this.$msg('操作成功')
          setTimeout(() => {
            this.list = {}
            this.getData(this.orderid)
            this.refreshList()
            this.clearCount()
          }, 1000)
        }
      })
    },
    // 继续支付
    handlePay() {
      this.list.originalamount = ((this.list.actualamount || 0) * 100 + (this.list.deliveryfee || 0) * 100) / 100
      this.$refs.pay.PayOrder(this.list)
    },
    // 支付成功回调
    async success() {
      this.$loading.hide()
      this.list = {}
      this.getData(this.orderid)
      this.refreshList()
    },
    refreshList() {
      uni.$emit('update-order')
    },
    // 跳转商品详情
    handleCourier(item) {
      let status = this.list.isoldmembershiporder
      // #ifdef MP-MEMBER
      // 扫码订单礼品放开限制
      status = +this.subcategory !== 6 && status
      // #endif
      // #ifdef MP-RETAIL
      status = true
      // #endif
      if (status) {
        return this.$msg('当前礼品不支持查看详情哦')
      }
      //  type 1 积分兑换   2，3 扫码，智能营销
      if (Number(this.type) === 2) {
        this.id = item.activityid
      } else {
        this.id = item.goodsid
      }
      uni.navigateTo({
        url: `/packages/src/integral/detail?id=${this.id}&type=${this.type}&btn=1&subcategory=${this.subcategory}`
      })
    },
    handleCopy(data) {
      uni.setClipboardData({
        data,
        success() {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          })
        }
      })
    },
    // 跳转物流追踪
    handleLogistics() {
      uni.navigateTo({
        url: `./logistics?orderid=${this.orderid}`
      })
    },
    // 筛选头部标题
    filtertitle(val) {
      // 1 待支付、2 待发货、3 待收货、4 已完成、5 已取消、6 退款订单、7 处理中
      switch (val) {
        case 1:
          return '待付款'
        case 2:
          return '待发货'
        case 3:
          return this.list.deliverymode === 1 ? '待核销' : '待收货'
        case 4:
          return '兑换成功'
        case 5:
          return '兑换失败'
        case 6:
          return '退款订单'
        case 7:
          return '订单处理中'
        default:
          break
      }
    },
    // 筛选头部icon图标
    filterIcon(val) {
      switch (val) {
        case 1:
          return 'icondaifukuan'
        case 2:
          return 'icondaifahuo'
        case 3:
          return this.list.deliverymode === 1 ? '' : 'icondaifahuo'
        case 4:
          return 'iconduihuanchenggong'
        case 5:
          return 'icon-duihuan-fail'
        case 7:
          return 'icondaifukuan'
        default:
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.orderDetail-content {
  padding: 20rpx 20rpx 140rpx;
  .title-bar ::v-deep .backcolor {
    color: $order-text-color;
  }
  .title-bar ::v-deep .black {
    &::after {
      border-left: $order-text-color 2px solid;
      border-bottom: $order-text-color 2px solid;
    }
  }
  .find {
    font-size: 35rpx;
    margin-right: 20rpx;
  }
  &::after {
    content: '';
    width: 100%;
    height: 170rpx;
    // background: $bg-color;
    background: var(--theme-color, $bg-color);
    position: absolute;
    left: 0;
    top: 100rpx;
    z-index: 10;
  }
  .orderDetail-sty {
    background: #ffffff;
    padding: 30rpx 20rpx;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
    position: relative;
    z-index: 99;
  }
  .time-box {
    position: relative;
    z-index: 99;
    font-weight: 500;
    margin: 10rpx 0 30rpx 0;
    // #ifdef MP-RETAIL
    color: #fff;
    // #endif
    .time-text {
      color: #ff6440;
      margin: 0 10rpx;
      font-weight: 700;
      // #ifdef MP-RETAIL
      color: #ffdc1d;
      // #endif
    }
  }
  .orderDetail-address {
    position: relative;
    z-index: 99;
    .iconfont {
      font-size: 26rpx;
    }
    .address-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .address-left {
        font-size: 28rpx;
        // font-weight: 700;
        .address-add {
          font-weight: 700;
          margin-left: 20rpx;
        }
        .icondizhi {
          font-size: 28rpx;
        }
      }
      .icon-more {
        font-size: 20rpx;
        font-weight: 700;
      }
    }
    .address-bom {
      font-size: 24rpx;
      margin-top: 17rpx;
      color: #666666;
    }
  }
  .orderDetail-info {
    position: relative;
    z-index: 99;
    .info-top {
      font-size: 28rpx;
      font-weight: 700;
      margin-bottom: 20rpx;
    }
    .info-content {
      display: flex;
      overflow: hidden;
      align-items: center;
      & + .info-content {
        margin-top: 20rpx;
        padding-top: 20rpx;
        border-top: 1rpx solid #e5e5e5;
      }
      .info-img {
        width: 160rpx;
        height: 160rpx;
        text-align: center;
        position: relative;
      }
      .info-shop {
        margin-left: 20rpx;
        width: 72%;
        .info-shop-top {
          font-size: 28rpx;
          font-weight: 700;
          text-align: left;
          color: #000000;
          line-height: 36rpx;
          margin-bottom: 20rpx;
        }
        .info-shop-size {
          font-size: 24rpx;
          font-weight: 500;
          text-align: left;
          color: #999999;
          line-height: 30rpx;
          margin-bottom: 20rpx;
        }
        .info-shop-price {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 24rpx;
          .shop-price-le {
            display: flex;
            font-weight: 700;
            align-items: center;
          }
          .shop-price-ri {
            color: #666666;
          }
        }
      }
    }
  }

  .orderDetail-exchange {
    .exchange-box {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #000;
      border-bottom: 2rpx solid #eeeeee;
      padding-bottom: 25rpx;
      margin-top: 30rpx;
      font-weight: 700;
      justify-content: space-between;
      .exchange-left {
        color: #666666;
        width: 170rpx;
        text-align: left;
        margin-right: 30rpx;
        font-weight: 500;
      }
      &:nth-child(1) {
        margin-top: 0;
      }
      &:nth-last-child(1) {
        border-bottom: 2rpx solid transparent;
        padding-bottom: 0;
      }
      .exchange-right {
        font-weight: bold;
        margin-left: 30rpx;
        display: flex;
        align-items: center;
        font-size: 30rpx;
        // color: $price-color;
        color: var(--theme-color, $price-color);
      }
    }
    .orderDetail-wxs {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #000;
      padding-bottom: 25rpx;
      font-weight: 500;
      margin-top: 30rpx;
      border-bottom: 2rpx solid #eeeeee;
      &:nth-child(1) {
        margin-top: 0;
      }
      &:nth-last-child(1) {
        border-bottom: 2rpx solid transparent;
        padding-bottom: 0;
      }
      .orderDetail-name {
        width: 120rpx;
        margin-right: 55rpx;
        color: #666666;
        text-align: left;
      }
      .orderDetail-number {
        width: 73%;
        .orderDetail-copy {
          border: 1rpx solid #aaaaaa;
          border-radius: 18rpx;
          padding: 2rpx 12rpx;
          margin-left: 40rpx;
          font-size: 22rpx;
        }
      }
    }
  }
}
.orderDetail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  z-index: 100;
  .footer-confirm {
    width: 100%;
    padding: 25rpx 20rpx;
    .footer-btn {
      // background: $bg-color;
      background: var(--theme-color, $bg-color);
      border-radius: 44rpx;
      padding: 25rpx 0;
      font-weight: 700;
      text-align: center;
      font-size: 32rpx;
      line-height: 36rpx;
      color: $order-text-color;
      &.plan {
        background-color: #fff;
        border: 1px solid #999999;
        height: 44rpx;
        height: 100%;
      }
    }
  }
  // 自动给第一个按钮加plan样式（如果有多个按钮）
  .footer-confirm:not(:last-child) .footer-btn {
    background-color: #fff;
    border: 1px solid #999999;
    color: $order-text-color;
    /* #ifndef MP-CLOUDSHOP */
    height: 44rpx;
    height: 100%;
    /* #endif */
  }
}
.db {
  display: block;
}
.canvas-code {
  position: fixed;
  left: -9999px;
  width: 150px;
  height: 150px;
}
</style>
