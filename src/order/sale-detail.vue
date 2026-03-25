<template>
  <view>
    <view v-if="!loading">
      <view class="header">
        <template v-if="[1, 2, 3].includes(afterSaleDetailStatus)">
          <view class="header-title" :class="{ small: afterSaleDetailStatus === 3 }">
            <text class="iconfont icondaifukuan mr-20" />
            {{
              afterSaleDetailStatus === 1
                ? '等待商家处理申请'
                : afterSaleDetailStatus === 2
                ? ' 售后申请已通过，请寄回商品给商家'
                : '商品已寄回，请等待商家确认收货和退款。'
            }}
          </view>
          <view v-if="[2, 3].includes(afterSaleDetailStatus)" class="address">退货地址：{{ address }}</view>
        </template>
        <template v-if="[4, 5, 6, 7].includes(afterSaleDetailStatus)">
          <view class="header-title head-fail">
            <text
              class="mdfont mr-20"
              :class="{
                iconduihuanchenggong: afterSaleDetailStatus === 4,
                iconduihuanshibai: [5, 6, 7].includes(afterSaleDetailStatus)
              }"
            />
            <span v-if="afterSaleDetailStatus === 4">退款成功，请注意查收</span>
            <span v-else-if="afterSaleDetailStatus === 6">商家拒绝您的售后申请</span>
            <span v-else>售后申请已关闭</span>
          </view>
          <view v-if="afterSaleDetailStatus === 6" class="close-tips">
            拒绝的原因：{{ afterSaleInfo.rejectremarks }}
          </view>
          <view v-else-if="afterSaleDetailStatus === 5" class="close-tips">关闭的原因：自行取消退款申请</view>
          <view v-else-if="afterSaleDetailStatus === 7" class="close-tips">关闭的原因：已发货</view>
          <view v-if="afterSaleDetailStatus === 7" class="store-tips mt-10">
            如果商家发货，退款将关闭，您可以再次发起申请
          </view>
          <template v-if="afterSaleDetailStatus === 4">
            <view class="close-tips fsz-28">退款金额：￥{{ afterSaleInfo.refundrecord.actualamount }}</view>
            <view class="store-tips mt-10">退款时间：{{ afterSaleInfo.refundrecord.refundtime }}</view>
          </template>
        </template>
      </view>
      <view class="content">
        <view v-if="afterSaleDetailStatus === 2" class="order-exchange block nt-20">
          <view class="order-row">
            <view class="order-label required">快递公司</view>
            <view class="order-value flex">
              <input
                v-model="form.deliverycompany"
                type="text"
                maxlength="10"
                placeholder-style="color:#aaa"
                class="form-input"
                placeholder="请输入快递公司名称"
              />
            </view>
          </view>
          <view class="order-row">
            <view class="order-label required">快递单号</view>
            <view class="order-value flex">
              <input
                v-model="form.deliveryno"
                type="text"
                maxlength="30"
                placeholder-style="color:#aaa"
                class="form-input"
                placeholder="请输入快递单号"
              />
            </view>
          </view>
        </view>
        <pruduct-info card-title="退款信息" class="block" :show-order-number="true" :order-info="orderInfo" />
        <view class="order-exchange block nt-20">
          <view class="label">售后详情</view>
          <view class="order-row pl-0">
            <view class="order-label">售后方式</view>
            <view class="order-value flex">{{ applySaleType }}</view>
          </view>
          <view class="order-row pl-0">
            <view class="order-label">退款金额</view>
            <view class="order-value flex">￥{{ afterSaleInfo.buyerrefundamount.toFixed(2) }}</view>
          </view>
          <view class="order-row pl-0">
            <view class="order-label">申请原因</view>
            <view class="order-value flex">{{ afterSaleInfo.applyreason }}</view>
          </view>
          <view class="order-row pl-0">
            <view class="order-label">备注信息</view>
            <view class="order-value flex">{{ afterSaleInfo.remarks || '无' }}</view>
          </view>
          <view class="order-row pl-0">
            <view class="order-label">上传凭证</view>
            <view class="order-value flex">
              <view v-if="afterSaleInfo.buyervoucherurls && afterSaleInfo.buyervoucherurls.length" class="photo-list">
                <image
                  v-for="(item, index) in afterSaleInfo.buyervoucherurls"
                  :key="index"
                  :src="item"
                  mode="aspectFill"
                  class="photo-item ml-10"
                  @click="handlePreview(item)"
                />
              </view>
              <text v-else>无</text>
            </view>
          </view>
          <view class="order-row pl-0">
            <view class="order-label">退款编号</view>
            <view class="order-value flex">{{ afterSaleInfo.tradeno }}</view>
          </view>
          <view class="order-row pl-0">
            <view class="order-label">申请时间</view>
            <view class="order-value flex">{{ afterSaleInfo.createtime }}</view>
          </view>
        </view>

        <view v-if="[1, 2].includes(afterSaleDetailStatus)" class="footer-confirm">
          <view class="footer-btn" @click="handleSubmit">
            {{ afterSaleDetailStatus === 1 ? '取消申请' : '提交申请' }}
          </view>
        </view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { previewImage } from 'packages/utils'
import PruductInfo from './components/pruduct-info.vue'
import { apiAfterSalesDetail, apiConfirmReturnPackage, apiCancelAfterSales } from '../api/order.js'
export default {
  components: {
    PruductInfo
  },
  data() {
    return {
      id: 0,
      address: '', // 收货地址
      orderInfo: {
        items: [],
        actualamount: 0,
        deliveryfee: 0,
        ordernumber: 0
      },
      loading: true,
      fileList: [],
      form: {
        orderid: '',
        aftersaleid: '',
        deliverycompany: '',
        deliveryno: '',
        deliveryremarks: ''
      },
      afterSaleInfo: {
        applyway: 0, // 申请方式:0 未发货退款  1:未收到货,我要退款 2 退货退款 3 换货
        aftersaleid: 0, // 售后ID
        orderid: 0, // 订单ID
        ordertradeno: '', // 订单号
        returnrecord: {
          receivername: '', // 收货人姓名
          receivermobile: '', // 收货人手机
          receiveraddress: '' // 收货地址
        },
        refundrecord: {
          refundtype: 0, // 退款类型
          originalamount: 0, // 应退金额
          actualamount: 0, // 实退金额
          refundstatus: 0, // 退款状态
          refundway: '', // 退款方式
          refundtime: '', // 退款时间
          refundreason: '', // 退款原因
          remarks: '' // 备注
        },
        rejectremarks: '',
        buyerrefundamount: 0, // 买家退款金额
        createtime: '' // 申请时间
      },
      afterSaleDetailStatus: 0 // 售后状态 1 等待商家处理申请；2 售后申请通过，商品待寄回；3商品已寄回，待收货和退款；4退款成功；5售后关闭（消费者取消）；6商家拒绝收货申请；7商家发货关闭
    }
  },
  computed: {
    applySaleType() {
      const typeMap = {
        1: '仅退款',
        2: '退货退款',
        3: '换货'
      }
      return typeMap[this.afterSaleInfo.applyway] || '未知申请方式'
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.getData()
    }
  },
  methods: {
    // 获取接口数据
    getData() {
      this.loading = true
      apiAfterSalesDetail({
        orderNumber: this.id
      }).then(d => {
        const res = this.$toLowerKey(d, true)
        if (this.$ck(res)) {
          this.loading = false
          const { return_data: data } = res
          const { returnconsignee, returnmobile, returnprovince, returncity, returncounty, returnaddress } =
            data.aftersaleinfo
          this.address = `${returnconsignee}，${returnmobile}，${returnprovince}${returncity}${returncounty}${returnaddress}`
          this.afterSaleInfo = data.aftersaleinfo
          this.orderInfo = {
            items: data.orderitems,
            actualamount: data.actualamount,
            deliveryfee: data.deliveryfee,
            ordernumber: data.outtradeno
          }
          this.afterSaleDetailStatus = data.aftersaledetailstatus
          this.form.orderid = data.orderid
          this.form.aftersaleid = this.afterSaleInfo.id
        }
      })
    },
    handleSubmit() {
      if (this.afterSaleDetailStatus === 1) {
        return this.cancelApply()
      }
      if (!this.form.deliverycompany) {
        this.$msg('请输入快递公司名称')
        return
      }
      if (!this.form.deliveryno) {
        this.$msg('请输入快递单号')
        return
      }
      apiConfirmReturnPackage(this.form)
        .then(res => {
          if (this.$ck(res)) {
            this.$msg('提交成功')
            setTimeout(() => {
              this.getData()
            }, 1000)
          }
        })
        .catch(err => {
          this.$msg(err.return_msg || '提交失败，请稍后再试')
        })
    },
    // 取消申请
    cancelApply() {
      apiCancelAfterSales({
        AfterSaleTradeNo: this.afterSaleInfo.tradeno
      })
        .then(res => {
          if (this.$ck(res)) {
            this.$msg('取消成功')
            setTimeout(() => {
              this.getData()
            }, 1000)
          }
        })
        .catch(err => {
          this.$msg(err.return_msg || '提交失败，请稍后再试')
        })
      this.$emit('cancelApply')
    },
    handlePreview(url) {
      previewImage({ current: url, urls: this.afterSaleInfo.buyervoucherurls })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';

.header {
  background-color: #fff;
  padding: 32rpx 40rpx;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #eee;
  .header-title {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20rpx;
    font-size: 36rpx;
    color: #ff6440;
    font-weight: 700;
    .iconfont {
      font-weight: 400;
      font-size: 42rpx;
    }
  }
  .close-tips {
    font-size: 24rpx;
    color: #ff6440;
    margin-top: 20rpx;
    font-weight: 700;
    text-align: center;
  }
  .fsz-28 {
    font-size: 28rpx;
  }
  .store-tips {
    color: #666;
    font-size: 24rpx;
    text-align: center;
  }
  .head-fail {
    color: #000;
  }
  .small {
    font-size: 32rpx;
    .iconfont {
      font-weight: 400;
      font-size: 38rpx;
    }
  }
  .address {
    font-size: 24rpx;
    text-align: center;
  }
}
.content {
  padding: 20rpx;
}
.block {
  display: block;
  background: #ffffff;
  padding: 30rpx 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}
.order-exchange {
  .label {
    font-size: 28rpx;
    color: #000000;
    font-weight: 700;
    margin-bottom: 10rpx;
  }
  .order-row {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #000;
    padding-bottom: 25rpx;
    font-weight: 500;
    margin-top: 30rpx;
    border-bottom: 2rpx solid #eeeeee;
    padding-left: 20rpx;
    &:nth-child(1) {
      margin-top: 0;
    }
    &:nth-last-child(1) {
      border-bottom: 2rpx solid transparent;
      padding-bottom: 0;
    }
    .order-label {
      width: 150rpx;
      margin-right: 55rpx;
      color: #666666;
      text-align: left;
    }
    .order-value-parent {
      display: flex;
      justify-content: flex-end;
    }
    .order-value {
      width: 100%;
      justify-content: flex-end;
      word-break: break-all;
      .picker {
        align-items: center;
      }
      .form-input {
        width: 100%;
        text-align: right;
      }
      .textarea {
        height: 150rpx;
      }
      .photo-list {
        width: 100%;
        justify-content: flex-end;
        display: flex;
        .photo-item {
          width: 100rpx;
          height: 100rpx;
          border-radius: 4rpx 4rpx 4rpx 4rpx;
        }
      }
    }
    .required {
      position: relative;
      &::before {
        content: '*';
        position: absolute;
        top: 4rpx;
        left: -20rpx;
        color: #ff4d4f;
        margin-right: 8rpx;
        font-size: 28rpx;
        line-height: 1;
      }
    }
  }
  .pl-0 {
    padding-left: 0;
  }
}
.footer-confirm {
  width: 100%;
  padding: 25rpx 20rpx;
  box-sizing: border-box;
  .footer-btn {
    background: $bg-color;
    border-radius: 40rpx;
    padding: 25rpx 0;
    font-weight: 700;
    text-align: center;
    font-size: 32rpx;
    line-height: 36rpx;
    color: $order-text-color;
  }
}
</style>
