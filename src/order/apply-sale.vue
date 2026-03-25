<template>
  <view :style="themeVars">
    <view v-if="!loading">
      <view class="header">订单编号：{{ orderInfo.ordernumber }}</view>
      <view class="content">
        <pruduct-info class="block" :order-info="orderInfo" />
        <view class="order-exchange block nt-20">
          <view class="order-row">
            <view class="order-label required">售后方式</view>
            <view class="order-value flex">
              <view class="picker flex" @click="showSaleType = true">
                {{ saleText ? saleText : '请选择' }}
                <view class="mdfont icon-mdfont-more ml-20 fs-24" />
              </view>
            </view>
          </view>
          <view class="order-row">
            <view class="order-label required">申请原因</view>
            <view class="order-value flex">
              <view class="picker flex" @click="showReason = true">
                {{ form.applyreason ? form.applyreason : '请选择' }}
                <view class="mdfont icon-mdfont-more ml-20 fs-24" />
              </view>
            </view>
          </view>
          <view class="order-row">
            <view class="order-label required">退款金额</view>
            <view class="order-value flex">
              <input
                v-model="form.refundamount"
                :disabled="disabledInput"
                :cursor-spacing="100"
                type="digit"
                placeholder-style="color:#aaa"
                class="form-input"
                :placeholder="`最多可退回￥${totalPrice}元${deliveryFee ? `含运费${deliveryFee}元` : ''}`"
                @input="onRefundAmountInput"
              />
            </view>
          </view>
          <view class="order-row">
            <view class="order-label required">手机号码</view>
            <view class="order-value flex">
              <input
                v-model="form.mobile"
                :disabled="disabledInput"
                :cursor-spacing="100"
                type="number"
                placeholder-style="color:#aaa"
                class="form-input"
                placeholder="填写手机号码，以便商家联系您"
              />
            </view>
          </view>
          <view class="order-row">
            <view class="order-label" :class="{ required: isFileRequired }">上传凭证</view>
            <view class="order-value flex">
              <view class="flex photo-box">
                <upload
                  v-model="fileList"
                  class="mr-20"
                  item-style="width:100rpx;height:100rpx;border-radius: 10rpx;"
                  :max-length="3"
                />
                <view class="tips c-9 mt-20">（最多三张）</view>
              </view>
            </view>
          </view>
          <view class="order-row">
            <view class="order-label">备注信息</view>
            <view class="order-value flex">
              <textarea
                v-model="form.remark"
                :disabled="disabledInput"
                :cursor-spacing="100"
                type="text"
                maxlength="200"
                placeholder-style="color:#aaa"
                class="form-input textarea"
                placeholder="最多可填写200字"
              />
            </view>
          </view>
        </view>
        <view class="footer-confirm">
          <view class="footer-btn" @click="handleSubmit">提交申请</view>
        </view>
      </view>
      <u-select v-model="showSaleType" :list="typeList" @confirm="onConfirm(1, $event)" />
      <u-select v-model="showReason" :list="defaultReasonTypeList" @confirm="onConfirm(2, $event)" />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
// #ifdef MP-GUIDE
import { uniLogin } from 'packages/utils/login.js'
// #endif
import subscribeMsg from 'packages/mixins/subscribe-msg' // 消息订阅
import PruductInfo from './components/pruduct-info.vue'
import upload from 'packages/components/upload/upload'
import {
  apiOrderdetail,
  apiApplyAfterSales,
  apiGetAfterSaleMsgTemplateId,
  apiAddSubscribemsgRecord
} from '../api/order.js'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    PruductInfo,
    upload
  },
  mixins: [
    subscribeMsg,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      loading: true,
      fileList: [],
      orderInfo: {
        item: [],
        actualamount: 0,
        deliveryfee: 0
      },
      showSaleType: false,
      showReason: false,
      defaultReasonTypeList: [
        { label: '买/卖双方协商一致', value: 1 },
        { label: '买错/买多/不想要', value: 2 },
        { label: '商品质量问题', value: 3 },
        { label: '未收到货', value: 4 },
        { label: '其它问题', value: 5 }
      ],
      saleText: '',
      form: {
        applyway: -1, // 售后方式
        applyreason: '',
        refundamount: '', // 退款金额
        mobile: '',
        remark: '',
        orderid: ''
      },
      reasonValue: 0 //原因类型
    }
  },
  computed: {
    // 凭证是否必填
    isFileRequired() {
      return [3, 5].includes(this.reasonValue)
    },
    // 禁用输入框
    disabledInput() {
      return this.showSaleType || this.showReason
    },
    typeList() {
      const allTypes = [
        { label: '仅退款', value: 0 },
        { label: '未收到货，我要退款', value: 1 },
        { label: '我要退货退款', value: 2 }
      ]
      // 订单状态为2（待发货）时，只能选择“仅退款”
      if (this.orderInfo.orderstatus === 2) {
        return [allTypes[0]]
      }
      return allTypes.slice(1)
    },
    // 总价格
    totalPrice() {
      return (this.orderInfo.actualamount + this.orderInfo.deliveryfee).toFixed(2)
    },
    // 运费
    deliveryFee() {
      return this.orderInfo.deliveryfee ? this.orderInfo.deliveryfee.toFixed(2) : ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.orderid = options.id
      this.getData(options.id)
      this.fetchNotice()
    }
  },
  methods: {
    // 获取接口数据
    getData(orderid) {
      this.loading = true
      apiOrderdetail(Number(orderid)).then(res => {
        if (this.$ck(res)) {
          this.loading = false
          const { return_data: data } = res
          this.orderInfo = data
          this.form.orderid = orderid
          setTimeout(() => {
            this.form.refundamount = this.totalPrice // 初始化退款金额为订单总价
            if (this.orderInfo.orderstatus === 2) {
              this.form.applyway = 0 // 如果订单状态是待发货，默认选择仅退款
              this.saleText = '仅退款'
            }
          }, 500)
        }
      })
    },
    onConfirm(type, val) {
      const { label, value } = val[0]
      if (type === 1) {
        this.form.applyway = value
        this.saleText = label
      } else if (type === 2) {
        this.form.applyreason = label
        this.reasonValue = value
      }
    },
    onRefundAmountInput(e) {
      let val = e.detail.value
      // 只允许数字和小数点，且最多两位小数，不能以小数点开头
      val = val.replace(/[^\d.]/g, '') // 只保留数字和小数点
      val = val.replace(/^\./g, '') // 开头不能是小数点
      val = val.replace(/\.{2,}/g, '.') // 只保留第一个小数点
      val = val.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
      val = val.replace(/^(\d+)\.(\d{0,2}).*$/, '$1.$2') // 最多两位小数
      this.$nextTick(() => {
        this.form.refundamount = val
      })
    },
    async handleSubmit() {
      if (this.form.refundamount > Number(this.totalPrice)) {
        return this.$msg('退款金额大于最大退款金额，请修改')
      }
      if (this.form.applyway === -1) {
        this.$msg('请选择售后方式')
        return
      }
      if (!this.form.applyreason) {
        this.$msg('请选择申请原因')
        return
      }
      if (!this.form.refundamount) {
        this.$msg('请输入退款金额')
        return
      }
      if (!this.form.mobile) {
        this.$msg('请填写手机号码')
        return
      }

      // 新增手机号格式校验
      const mobileReg = /^1[3-9]\d{9}$/
      if (!mobileReg.test(this.form.mobile)) {
        this.$msg('请输入正确的手机号码')
        return
      }
      if (this.isFileRequired && !this.fileList.length) {
        this.$msg('请上传图片凭证')
        return
      }
      await this.requestSubscribeMsg(this.templateId)

      // 提交逻辑
      const query = {
        ...this.form,
        voucherurls: this.fileList
      }
      apiApplyAfterSales(query)
        .then(res => {
          if (this.$ck(res)) {
            this.addSubscribemsg(this.orderInfo.ordernumber)
            this.$msg('申请提交成功')
            setTimeout(() => {
              uni.redirectTo({
                url: `/packages/src/order/sale-detail?id=${this.orderInfo.ordernumber}`
              })
            }, 1500)
          }
        })
        .catch(err => {
          this.$msg(err.return_msg || '提交失败，请稍后再试')
        })
    },
    async fetchNotice() {
      let query = {}
      // #ifdef MP-GUIDE
      query = {
        type: 530,
        js_code: await uniLogin()
      }
      // #endif
      apiGetAfterSaleMsgTemplateId(query).then(res => {
        if (this.$ck(res)) {
          this.templateId = res.return_data || []
        }
      })
    },
    async addSubscribemsg(ordernumber) {
      if (!this.subscribedTempIds.length) return
      let query = {}
      // #ifdef MP-GUIDE
      query = {
        type: 2, //消息模板类型:1-发货通知消息
        templateid: this.subscribedTempIds[0], //消息模板id
        keyword: ordernumber, //消息订阅关键字(根据消息类型唯一:1-订单号)
        js_code: await uniLogin() //小程序登录凭证
      }
      // #endif
      // #ifdef MP-MEMBER
      query = {
        TemplateIDs: this.subscribedTempIds, //消息模板id
        OrderNo: ordernumber
      }
      // #endif
      apiAddSubscribemsgRecord(query).then(res => {
        this.$ck(res)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
.header {
  background-color: #fff;
  padding: 32rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #eee;
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
      .photo-box {
        flex-direction: column;
        align-items: flex-end;
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
}

.tips {
  font-size: 24rpx;
}
.footer-confirm {
  width: 100%;
  // background: #ffffff;
  padding: 25rpx 20rpx;
  .footer-btn {
    background: var(--theme-color, $bg-color);
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
