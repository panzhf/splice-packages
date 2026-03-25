<template>
  <view :style="themeVars">
    <view v-if="!loading" class="detail">
      <view v-if="info.orderstatus === 3" class="tips-time">自动结单时间：{{ formatTime(countdown) }}</view>
      <view v-if="info.orderstatus === 3" style="height: 60rpx" />
      <view class="block">
        <view v-if="[1, 3, 4, 5, 6, 7, 8].includes(info.orderstatus)" class="title bg">
          状态：{{ setStateText(info.orderstatus) }}
        </view>
        <view v-if="info.orderstatus === 0" class="title way">状态：报名审核</view>
        <view v-if="info.orderstatus === 2" class="title fail">状态：未通过</view>

        <!-- 未通过、待送货、待结单 -->
        <template v-if="[2, 1, 3].includes(info.orderstatus)">
          <view v-if="info.orderstatus === 2" class="fail-tips mt-20">审批意见：{{ info.checkremark }}</view>
          <view class="time-info mt-30 border">
            <view class="row">订单审核时间：{{ info.checktime }}</view>
            <view class="row">订单审核人：{{ info.checkerno }} - {{ info.checkername }}</view>
          </view>
        </template>
        <!-- 结单通过 -->
        <template v-if="[5].includes(info.orderstatus)">
          <view v-if="info.finishedcheckremark" class="fail-tips mt-20">
            审核意见：{{ info.finishedcheckremark || '-' }}
          </view>
          <view class="time-info mt-30 border">
            <view class="row">结单审核时间：{{ info.finishedchecktime || '-' }}</view>
            <view class="row">结单审核人：{{ info.finishedcheckerno }} - {{ info.finishedcheckername }}</view>

            <view class="row">结单时间：{{ info.finishedordertime || '-' }}</view>
            <view class="row">结单人：{{ info.finishedordermanname || '-' }}</view>

            <view class="row">订单审核时间：{{ info.checktime || '-' }}</view>
            <view class="row">订单审核人：{{ info.checkerno }} - {{ info.checkername }}</view>
          </view>
        </template>
        <!-- 结单审核 -->
        <template v-if="info.orderstatus === 7">
          <view class="time-info mt-30 border">
            <view class="row">结单时间：{{ info.finishedordertime || '-' }}</view>
            <view class="row">结单人：{{ info.finishedordermanname || '-' }}</view>
            <view class="row">订单审核时间：{{ info.checktime || '-' }}</view>
            <view class="row">订单审核人：{{ info.checkerno }} - {{ info.checkername }}</view>
          </view>
        </template>
        <!-- 结单未通过 -->
        <template v-if="info.orderstatus === 6 || info.orderstatus === 8">
          <view class="fail-tips mt-20">审核意见：{{ info.finishedcheckremark || '-' }}</view>
          <view class="time-info mt-30 border">
            <view class="row">结单审核时间：{{ info.finishedchecktime || '-' }}</view>
            <view class="row">结单审核人：{{ info.finishedcheckerno }} - {{ info.finishedcheckername }}</view>

            <view class="row">结单时间：{{ info.finishedordertime || '-' }}</view>
            <view class="row">结单人：{{ info.finishedordermanname || '-' }}</view>

            <view class="row">订单审核时间：{{ info.checktime || '-' }}</view>
            <view class="row">订单审核人：{{ info.checkerno }} - {{ info.checkername }}</view>
          </view>
          <view v-if="getConfigShow('isappealorder')" class="appeal-btn">
            <view class="btn flex flex-middle flex-center" @click="goAppeal">
              {{ info.isbanquetappealedit ? '查看申诉' : '申诉' }}
            </view>
          </view>
        </template>
      </view>
      <view v-if="[3, 5, 6, 7].includes(info.orderstatus)" class="block mt-20">
        <view class="title bg mb-20">宴席产品</view>
        <view class="row flex fsz-28">
          <view class="left">登记数量（瓶）</view>
          <view class="right flex flex-1">{{ info.totaldeliveryamount }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">用酒数量（瓶）</view>
          <view class="right flex flex-1">{{ info.totaluseamount }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">开瓶数量（瓶）</view>
          <view class="right flex flex-1">{{ info.totalscannedamount }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">开瓶率</view>
          <view class="right flex flex-1">{{ info.scannedrate }}%</view>
        </view>
        <view class="prodect-box flex mt-20">
          <image mode="aspectFit" :src="info.productimg" class="img" />
          <view class="right flex-1">
            <view class="title">{{ info.productname }}</view>
            <view v-if="info.productformatname" class="sku">{{ info.productformatname }}</view>
          </view>
        </view>
      </view>
      <!-- 搭赠产品 -->
      <view v-if="[3, 5, 6, 7, 8].includes(info.orderstatus) && info.gifttotaldeliveryamount" class="block mt-20">
        <view class="title bg mb-20">
          搭赠产品
          <text class="c-6 fs-26 fw-normal">（不纳入发奖策略）</text>
        </view>
        <view class="row flex fsz-28">
          <view class="left">登记数量（瓶）</view>
          <view class="right flex flex-1">{{ info.gifttotaldeliveryamount }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">开瓶数量（瓶）</view>
          <view class="right flex flex-1">{{ info.gifttotalscannedamount }}</view>
        </view>
        <view class="prodect-box flex mt-30">
          <image mode="aspectFit" :src="info.giftproductimg" class="img" />
          <view class="right flex-1">
            <view class="title">{{ info.giftproductname }}</view>
            <view v-if="info.giftproductformatname" class="sku">{{ info.giftproductformatname }}</view>
          </view>
        </view>
      </view>
      <!-- 已结单 -->
      <view v-if="[5].includes(info.orderstatus)" class="block mt-20">
        <view class="row flex fsz-28">
          <view class="title bg left flex-1">奖品{{ !info.awardrecord.length ? '：未中奖' : '' }}</view>
          <view v-if="info.awardrecord.length" class="right">
            <view class="tools" @click="awardVisable = !awardVisable">
              {{ awardVisable ? '收起' : '展开' }}
              <text class="iconfont icon-arrow-right" :class="awardVisable ? 'rotate-top' : ''" />
            </view>
          </view>
        </view>

        <template v-if="awardVisable">
          <view class="prize">
            <view v-if="storeAward.length" class="item mt-30 mb-10">
              <view class="mb-20 fw-weight-bold">门店奖品</view>
              <view class="flex award-record award-record-header fw-bold">
                <view class="left">奖励类型</view>
                <view class="right">奖励内容</view>
              </view>
              <view v-for="(item, index) in storeAward" :key="index" class="flex award-record border-bottom">
                <view class="left">{{ item.computeway === 2 ? '开瓶' : '累计' }}奖励</view>
                <view class="right">
                  <rich-text :nodes="getShowValue(item)" />
                </view>
              </view>
            </view>
            <view v-if="extraAward.length" class="item mt-30 mb-10">
              <view class="mb-20 fw-weight-bold">额外奖品</view>
              <view class="flex award-record award-record-header fw-bold">
                <view class="left">奖励类型</view>
                <view class="right">奖励内容</view>
              </view>
              <view v-for="(item, index) in extraAward" :key="index" class="flex award-record border-bottom">
                <view class="left">{{ item.computeway === 2 ? '开瓶' : '累计' }}奖励</view>
                <view class="right">
                  <rich-text :nodes="getShowValue(item)" />
                </view>
              </view>
            </view>
          </view>
          <view v-if="info.awardrecord.length" class="time-info">
            <view class="row">发奖方式：{{ info.drawtype === 1 ? '按开瓶数' : '按开瓶率' }}</view>
            <view class="row mt-10">发奖时间：{{ info.awardrecord[0].getproducttime || '' }}</view>
          </view>
        </template>
      </view>
      <view v-if="[1, 3, 4, 5, 6, 7, 8].includes(info.orderstatus) && info.orderpicture" class="block mt-20">
        <view class="title bg">照片</view>
        <view class="imgs flex mt-20">
          <image
            v-for="(item, index) in info.orderpicture.picturesjson"
            :key="index"
            mode="aspectFit"
            :src="item"
            class="photo"
            @click="handleLookImg(item, info.orderpicture.picturesjson)"
          />
        </view>
        <view class="time-info mt-30 border">
          <view class="row">上传时间：{{ info.orderpicture.createdtime }}</view>
          <view class="row">上传人：{{ info.orderpicture.uploadmanname }}</view>
        </view>
      </view>
      <view v-if="[3, 4, 5, 6, 7, 8].includes(info.orderstatus) && info.deliveryamountcount" class="block mt-20">
        <view class="row flex fsz-28">
          <view class="left">送货时间</view>
          <view class="right flex flex-1">
            <view class="content">{{ info.lastdeliverytime }}</view>
            <view class="tools" @click="handleGetRecord(true)">
              物流码
              <text class="iconfont icon-arrow-right" />
            </view>
          </view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">送货数量（瓶）</view>
          <view class="right flex flex-1">{{ info.deliveryamountcount }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">送货人</view>
          <view class="right flex flex-1">{{ info.lastdelivermanname || '-' }}</view>
        </view>
      </view>
      <view v-if="[3, 4, 5, 6, 7, 8].includes(info.orderstatus) && info.totalreturnedamount" class="block mt-20">
        <view class="row flex fsz-28">
          <view class="left">退货时间</view>
          <view class="right flex flex-1">
            <view class="content">{{ info.lastreturnedtime }}</view>
            <view class="tools" @click="handleGetRecord(false)">
              物流码
              <text class="iconfont icon-arrow-right" />
            </view>
          </view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">退货数量（瓶）</view>
          <view class="right flex flex-1">{{ info.totalreturnedamount }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left">退货人</view>
          <view class="right flex flex-1">{{ info.lastreturnedmanname || '-' }}</view>
        </view>
      </view>

      <view class="block mt-20">
        <view class="row flex fsz-28 mb-20">
          <view class="title bg flex-1">报名信息</view>
          <view class="right flex">
            <view class="content flex flex-middle flex-1">
              <view
                class="btn warm flex flex-middle"
                :class="[getConfigShow('iseditorder') ? '' : 'disabled']"
                @click="handleEdit"
              >
                <view class="iconfont iconedit mr-10 fs-24" />
                编辑
              </view>
              <view
                class="btn warm flex flex-middle"
                :class="[getConfigShow('isdeleteorder') ? '' : 'disabled']"
                @click="handleDelete"
              >
                <view class="iconfont iconshanchu mr-10 fs-28" />
                删除
              </view>
              <view class="iconfont iconexplain fs-40 ml-20" @click="showTips" />
            </view>
          </view>
        </view>
        <view class="row flex fsz-28">
          <view class="left w170">单号</view>
          <view class="right flex flex-1">
            {{ info.id }}
          </view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">门店名称</view>
          <view class="right flex flex-1">{{ info.storename }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">门店编号</view>
          <view class="right flex flex-1">{{ info.storeno }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">宴席主</view>
          <view class="right flex flex-1">{{ info.banquetname }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">手机号</view>
          <view class="right flex flex-1">
            <view class="content">
              {{ info.banquetphone }}
              <text class="btn" @click="handleCopy(info.banquetphone)">复制</text>
              <text class="btn" @click="phoneCall(info.banquetphone)">拨打</text>
            </view>
          </view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">宴席类型</view>
          <view class="right flex flex-1">{{ info.banquettype }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">宴席时间</view>
          <view class="right flex flex-1">{{ info.banquettime }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">数量（瓶）</view>
          <view class="right flex flex-1">{{ info.banquetrequiredamount }}瓶</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">桌数</view>
          <view v-if="info.banquetdesknum" class="right flex flex-1">{{ info.banquetdesknum }}桌</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">宴席地址</view>
          <view class="right flex flex-1">{{ info.banquetaddress }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">宴席厅</view>
          <view class="right flex flex-1">{{ info.banquetroom }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">备注</view>
          <view class="right flex flex-1">{{ info.banquetremark }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">报名时间</view>
          <view class="right flex flex-1">{{ info.createdtime }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">报名人</view>
          <view class="right flex flex-1">{{ info.applicantname }}</view>
        </view>
        <view class="row flex fsz-28 mt-20">
          <view class="left w170">照片</view>
          <view class="right flex-1">
            <image
              v-for="(item, index) in info.banquetimg"
              :key="index"
              :src="item"
              mode=""
              class="banquet-img"
              @click="handleLookImg(item, info.banquetimg)"
            />
          </view>
        </view>
      </view>
      <view style="height: 200rpx" />
      <view v-if="![0, 2, 4, 5, 6, 7, 8].includes(info.orderstatus)" class="btn-submit flex flex-middle fs-30 text-center">
        <view
          v-if="getConfigShow('isfinishorder')"
          class="btn plan active flex-1"
          hover-class="button-action"
          @tap="handleOverOrder"
        >
          结单
        </view>
        <view
          v-if="getConfigShow('isdeliver') ? [3].includes(info.orderstatus) : false"
          class="btn active flex-1"
          hover-class="button-action"
          @tap="handleHuo(false)"
        >
          退货
        </view>
        <view
          v-if="getConfigShow('isuploadimg')"
          class="btn active flex-1"
          hover-class="button-action"
          @tap="photoVisible = true"
        >
          上传照片
        </view>
        <view
          v-if="getConfigShow('isdeliver')"
          class="btn active flex-1"
          hover-class="button-action"
          @tap="handleHuo(true)"
        >
          送货登记
        </view>
      </view>
    </view>
    <photo-update v-model="photoVisible" :info="info" :orderid="id" @success="getDetail" />
    <common-popup v-model="overPopup.visible" type="confirm" title="结单提示" @confirm="handleOverOrderConfirm">
      <view class="over-info">
        <view class="c-6 fs-24" style="margin-top: -20rpx;">（宴席产品）</view>
        <view class="row tx-l">
          登记数量：
          <text class="num">{{ info.totaldeliveryamount }}</text>
        </view>
        <view class="row flex">
          <view class="flex-1 tx-l">
            开瓶数量：
            <text class="num">{{ info.totalscannedamount }}</text>
          </view>
          <view class="flex-1 tx-l">
            开瓶率：
            <text class="num">{{ info.scannedrate }}%</text>
          </view>
        </view>
        <view class="tips tx-l">
          结单后不能再执行送货，退货操作。且奖品的发放也会根据结单时产生的数据为准。是否确定结单？
        </view>
      </view>
    </common-popup>
    <common-popup
      v-model="detailPopup.visible"
      :pop-hide-button="true"
      type="tip"
      title="查看明细"
      class="table-popup"
      custom-style="width:700rpx"
      @confirm="handleConfirm"
    >
      <view class="table-info">
        <scroll-view scroll-y class="table">
          <view class="th flex">
            <text class="item flex-1">物流码</text>
            <text class="item" style="width: 200rpx">时间</text>
            <text class="item" style="width: 180rpx">操作人</text>
          </view>
          <view v-for="(item, index) in list" :key="index" class="td flex">
            <text class="item flex-1">
              {{ item.smallserialnumber }}
              <text v-if="item.isgiftproduct" class="primary-color mdfont icon-dazeng ml-10"></text>
            </text>
            <text class="item pl-10 pr-10" style="width: 200rpx">{{ item.createdtime }}</text>
            <text class="item" style="width: 180rpx">{{ item.delivermanname || item.returnedmanname }}</text>
          </view>
          <none-data v-if="!list.length" custom-style="padding: 100rpx 0" msg="暂无记录" class="none-data" />
        </scroll-view>

        <text class="iconfont icon-close2" @click="detailPopup.visible = false" />
      </view>
    </common-popup>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    >
      <view class="tx-l">
        <rich-text :nodes="popContent" />
      </view>
    </common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import dayjs from 'dayjs'
import {
  apiBanquetOrderDetail,
  apiBanquetFinishorder,
  apiOrderDeliveryList,
  apiOrderReturnEdList,
  apiBanquetDeleteOrder
} from 'packages/api/banquet.js'
import PhotoUpdate from './components/photo-update.vue'
import NoneData from '@/components/none-data/none-data.vue'
import feastConfigMixin from './mixins/feast-config.js'
import { activityCheckMixin } from 'packages/mixins/activity-check'
import { previewImage, getPage, hbTypeName } from 'packages/utils'
export default {
  components: {
    PhotoUpdate,
    NoneData
  },
  mixins: [feastConfigMixin, activityCheckMixin],
  data() {
    return {
      ispreviewImage: false,
      interval: null,
      loading: true,
      id: '',
      photoVisible: false,
      overPopup: {
        visible: false
      },
      detailPopup: {
        visible: false
      },
      info: {},
      rewardTypeOption: [
        //  奖品类型
        {
          val: -1,
          label: '全部'
        },
        {
          val: 0,
          label: '报名审核'
        },
        {
          val: 2,
          label: '未通过'
        },
        {
          val: 1,
          label: '待送货'
        },
        {
          val: 3,
          label: '待结单'
        },
        {
          val: 4,
          label: '结单中'
        },
        {
          val: 5,
          label: '结单通过'
        },
        {
          val: 6,
          label: '结单未通过'
        },
        {
          val: 7,
          label: '已结单待审核'
        },
        {
          val: 8,
          label: '已申诉待审核'
        }
      ],
      list: [],
      countdown: 0,

      awardVisable: false,

      popOperateType: '', // 弹窗操作类型
      showPopup: false,
      popType: 'tip', //弹窗类型
      popTitle: '', //  弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '去设置', // 弹窗确认按钮文案
      popCancelText: '跳过', // 弹窗取消按钮文案
      storeAward: [], // 门店奖励
      extraAward: [] // 额外奖励
    }
  },
  onLoad(options) {
    this.id = options.id
  },
  onShow() {
    if (this.ispreviewImage) {
      return (this.ispreviewImage = false)
    }
    clearInterval(this.interval)
    if (this.photoVisible) return

    let page = getPage()
    const options = page.query
    if (options.m) {
      // 没有m：小程序页面跳转。有m：消息订阅进入，得检验
      const r = this.checkBrand({ m: options.m, t: 2 })
      if (!r) return
    }
    this.getDetail()
  },
  beforeDestroy() {
    clearInterval(this.interval) // 组件销毁时清除定时器
  },
  methods: {
    handleDelete() {
      if (!this.getConfigShow('isdeleteorder')) {
        return
      }
      this.popOperateType = 'delete'
      this.showPopup = true
      this.popTitle = '提示'
      this.popConfirmText = '确定'
      if (this.info.orderstatus === 3) {
        if (this.info.totalscannedamount > 0 || this.info.gifttotalscannedamount > 0) {
          // 显示提示信息
          this.popType = 'tip'
          this.popContent = '该订单商品已有开瓶记录，不允许删除订单。'
        } else {
          // 显示提示信息
          this.popType = 'confirm'
          this.popContent = '该订单已有商品登记，删除订单后，已登记的商品将自动执行退货，是否确定删除？'
          this.popCancelText = '取消'
        }
      } else {
        // 显示提示信息
        this.popType = 'confirm'
        this.popContent = '删除订单后你将看不到此订单，是否确定删除？'
        this.popCancelText = '取消'
      }
    },
    handleEdit() {
      if (!this.getConfigShow('iseditorder', this.info)) {
        return
      }
      uni.navigateTo({ url: `/packages/src/pages/banquet/apply?activityid=${this.info.activityid}&id=${this.id}` })
    },
    goAppeal() {
      uni.navigateTo({
        url: `/packages/src/pages/banquet/appeal?orderid=${this.id}&mode=${this.info.isbanquetappealedit ? 1 : 0}`
      })
    },
    showTips() {
      // 显示提示信息
      this.popOperateType = 'tip'
      this.popType = 'tip'
      this.popTitle = '说明'
      this.popContent = `编辑：仅能编辑自己提交的订单 ，且厂家业务员未编辑过，且订单为：报名审核、待送货、待结单状态时的报名信息。
      （厂家业务员编辑过时，无法修改，若需要修改时，则联系厂家业务员修改）
      <br />删除：仅能删除自己提交的订单 ，且订单为：未通过、报名审核、待送货、待结单状态时的订单`
      this.popConfirmText = '关闭'
      this.showPopup = true
    },
    deleteOrder() {
      apiBanquetDeleteOrder({ orderid: this.id }).then(res => {
        if (this.$ck(res)) {
          this.$msg('删除成功')
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        }
      })
    },
    handleConfirm() {
      // 显示提示信息
      this.showPopup = false
      switch (this.popOperateType) {
        case 'edit':
          break
        case 'delete':
          // 删除
          this.deleteOrder()
          break
      }
    },

    handleLookImg(url, arr) {
      this.ispreviewImage = true
      previewImage({
        current: url,
        urls: arr
      })
    },
    handleGetRecord(state) {
      let fn = state ? apiOrderDeliveryList : apiOrderReturnEdList
      fn({
        orderid: this.id
      }).then(res => {
        if (this.$ck(res)) {
          this.list = res.return_data || []
          this.detailPopup.visible = true
        }
      })
    },
    // 产品显示
    getShowValue(prizes) {
      if (prizes.producttype === 9) return `产品（${prizes.productname}）`
      let rewards = []
      if (prizes.point) {
        rewards.push(`积分（${prizes.point}）`)
      }
      if (prizes.hbid) {
        rewards.push(`￥${prizes.hbmoney && prizes.hbmoney.toFixed(2)}${hbTypeName(prizes.hbtype)}`)
      }
      if (prizes.shouvouid) {
        rewards.push(`返货券（${prizes.shouvouname}）* ${prizes.shouvouamount}`)
      }
      return rewards.join('<br />')
    },
    // 结单
    handleOverOrderConfirm() {
      apiBanquetFinishorder({ orderid: this.id }).then(res => {
        if (this.$ck(res)) {
          this.overPopup.visible = false
          this.$msg('结单成功')
          setTimeout(() => {
            this.getDetail()
          }, 1000)
        }
      })
    },
    handleOverOrder() {
      this.overPopup.visible = true
    },
    handleHuo(state) {
      uni.navigateTo({
        url: `/packages/src/pages/banquet/scan?orderid=${this.id}&actiontype=${state ? '0' : '1'}&totalamount=${
          this.info.banquetrequiredamount
        }&activityid=${this.info.prizepoolactivityid}`
      })
    },
    phoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },
    // 复制
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
    setStateText(val) {
      return this.rewardTypeOption.filter(item => item.val === val)[0].label
    },
    getDetail() {
      clearInterval(this.interval)
      apiBanquetOrderDetail({
        orderid: this.id
      }).then(res => {
        if (this.$ck(res)) {
          this.loading = false
          res.return_data.orderpicture &&
            (res.return_data.orderpicture.picturesjson = JSON.parse(res.return_data.orderpicture.picturesjson))
          res.return_data.banquetimg && (res.return_data.banquetimg = JSON.parse(res.return_data.banquetimg))
          const awardrecordList = res.return_data.awardrecord || []
          this.storeAward = awardrecordList.filter(item => item.producttype !== 9)
          this.extraAward = awardrecordList.filter(item => item.producttype === 9)
          this.info = res.return_data
          if (this.info.orderstatus === 3) {
            this.updateCountdown()
            this.interval = setInterval(this.updateCountdown, 1000) // 每秒更新一次倒计时
          }
        }
      })
    },
    updateCountdown() {
      const currentTime = dayjs()
      const endTime = dayjs(this.info.finishedordertime)
      this.countdown = endTime.diff(currentTime, 'second')
      if (this.countdown <= 0) {
        clearInterval(this.interval)
      }
    },
    formatTime(seconds) {
      if (seconds <= 0) return '已结单，请刷新'

      const days = Math.floor(seconds / 86400) // 一天有 86400 秒
      seconds %= 86400
      const hours = Math.floor(seconds / 3600) // 一小时有 3600 秒
      seconds %= 3600
      const minutes = Math.floor(seconds / 60)
      seconds = seconds % 60
      return `${days}天 ${hours}时 ${minutes}分 ${seconds}秒`
    }
  }
}
</script>

<style lang="scss" scoped>
.detail {
  padding: 20rpx 20rpx 80rpx 20rpx;
  .tips-time {
    height: 68rpx;
    line-height: 68rpx;
    background: #fff5f1;
    color: #ff5e33;
    font-weight: bold;
    padding-left: 20rpx;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 2;
  }
  .block {
    background: #ffffff;
    border-radius: 10rpx;
    padding: 30rpx;
    position: relative;
    .border {
      border-top: 1rpx solid #e7e7e7;
    }
    .border-bottom {
      border-bottom: 1rpx solid #e7e7e7;
    }
    .title {
      font-size: 30rpx;
      font-weight: bold;
    }
    .way {
      color: var(--theme-color, #ff7640);
    }
    .fail-tips {
      font-size: 28rpx;
      font-weight: 500;
      color: #f35854;
    }
    .fail {
      color: #f35854;
    }
    .bg {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 60rpx;
        height: 8rpx;
        background: var(--theme-color, #ff7640);
        opacity: 0.5;
        border-radius: 4rpx;
        bottom: 0;
        left: 0;
      }
    }
    .prize {
      margin-top: 20rpx;
      font-size: 28rpx;
      font-family: PingFang SC;
      // font-weight: bold;
      color: #333333;
      .award-record-header {
        background: #f4f4f4;
        color: #666666;
        line-height: 24rpx;
      }
      .award-record {
        padding: 20rpx 0;
        font-weight: 500;
        .left {
          width: 250rpx;
          padding-left: 20rpx;
        }
      }
    }
    .time-info {
      padding-top: 30rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #666666;
    }
    .imgs {
      flex-wrap: wrap;
      .photo {
        width: 126rpx;
        height: 126rpx;
        margin-right: 5rpx;
        margin-top: 5rpx;
      }
    }
    .row {
      .left {
        width: 220rpx;
        color: #666;
      }
      .w170 {
        width: 170rpx;
      }
      .right {
        justify-content: space-between;
        word-break: break-all;
        .tools {
          font-size: 24rpx;
          font-weight: 500;
          color: #0f80ff;
          .icon-arrow-right {
            font-size: 20rpx;
            margin-left: 10rpx;
            display: inline-block;
          }
          .rotate-top {
            font-size: 20rpx;
            transform: rotate(-90deg);
          }
        }
        .content {
          .btn {
            border: 1px solid #0f80ff;
            border-radius: 21rpx;
            padding: 4rpx 10rpx;
            font-size: 24rpx;
            font-weight: 500;
            color: #0f80ff;
            margin-left: 10rpx;
            &.warm {
              border-color: var(--theme-color, $uni-color-primary);
              color: var(--theme-color, $uni-color-primary);
            }
            &.disabled {
              border-color: #aaaaaa;
              color: #aaaaaa;
            }
          }
          .iconexplain {
            color: var(--theme-color, $uni-color-primary);
          }
        }
      }
    }
    .appeal-btn {
      position: absolute;
      right: 30rpx;
      top: 30rpx;
      .btn {
        width: 140rpx;
        height: 48rpx;
        line-height: 48rpx;
        border-radius: 24rpx;
        font-size: 28rpx;
        border: 1px solid var(--theme-color, $uni-color-primary);
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
  .banquet-img {
    width: 80rpx;
    height: 80rpx;
    margin-right: 6rpx;
  }
  .btn-submit {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding-left: 30rpx;
    padding-right: 30rpx;
    padding-bottom: 15rpx;
    padding-bottom: calc(constant(safe-area-inset-bottom) + 15rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 15rpx);
    box-sizing: border-box;
    .btn {
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      & + .btn {
        margin-left: 20rpx;
      }
      &.active {
        color: #fff;
        background: var(--theme-color, $uni-color-primary);
      }
      &.wechat {
        color: #000;
        border: 1px solid #999;
      }
      &.plan {
        background: #fff;
        border: 1rpx solid var(--theme-color, $uni-color-primary);
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
}
.over-info {
  font-size: 32rpx;
  font-weight: 500;
  .tips {
    font-size: 24rpx;
    font-weight: 500;
    color: #666666;
    margin-top: 36rpx;
  }
  .row {
    margin-top: 30rpx;
  }
  .num {
    color: #ff5e33;
  }
}
.table-popup {
  ::v-deep .common-popup.small {
    width: 600rpx;
    overflow: visible;
    .content {
      padding: 0;
    }
  }
  .table-info {
    position: relative;
    .icon-close2 {
      position: absolute;
      font-size: 70rpx;
      color: #fff;
      bottom: -160rpx;
      left: 50%;
      transform: translateX(-50%);
    }
    .table {
      height: 600rpx;
      padding: 0 30rpx;
      box-sizing: border-box;
    }
    .th {
      background: #f5f5f5;
      height: 62rpx;
      line-height: 62rpx;
    }
    .td {
      word-break: break-all;
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eeeeee;
    }
  }
}
.prodect-box {
  box-sizing: border-box;

  .img {
    width: 120rpx;
    height: 120rpx;
    background: #eaeaea;
    border-radius: 10rpx;
  }

  .right {
    margin-left: 24rpx;

    .title {
      font-size: 28rpx;
      font-weight: 500;
      color: #2a2a2a;
    }

    .sku {
      font-size: 28rpx;
      font-weight: 500;
      color: #999999;
    }
  }
}
.fw-weight-bold {
  font-weight: bold;
}
</style>
