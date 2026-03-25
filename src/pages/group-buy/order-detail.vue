<template>
  <view>
    <view v-if="!loading" class="page-group-buy fs-28 pb-30" :style="themeVars">
      <template v-if="info.orderstatus === 4">
        <view class="tips-time pl-30 fw-bold">自动结单时间：{{ formatTime(countdown) }}</view>
        <view style="height: 68rpx" />
      </template>
      <view class="box">
        <view class="status-row" :class="{ wait: [0, 1, 2].includes(info.orderstatus), err: info.orderstatus === 3 }">
          <view v-if="[0, 1, 3, 4, 7, 9].includes(info.orderstatus)" class="fw-bold fs-32">
            状态：{{ info.orderstatus | statusFilter }}
          </view>
          <view v-if="info.orderstatus === 3" class="mt-10">原因：{{ info.checkremark }}</view>
        </view>
        <view v-if="[3, 4, 7].includes(info.orderstatus)" class="audit-row pt-30 mt-30 c-6">
          <view class="item">订单审核时间：{{ info.checktime }}</view>
          <view class="item">订单审核人：{{ info.checkerno }} - {{ info.checkername }}</view>
        </view>
      </view>
      <view v-if="[7].includes(info.orderstatus)" class="box order-box">
        <view class="fs-30 fw-bold flex flex-middle flex-between">
          <text class="bg-title">奖品</text>
          <view
            v-if="existAwardRecord"
            class="tools fs-24 fw-medium flex flex-middle"
            @click="awardVisible = !awardVisible"
          >
            {{ awardVisible ? '收起' : '展开' }}
            <!-- #ifdef MP-RETAIL -->
            <text class="iconfont iconjiantou1 fs-20 ml-10" :class="{ rotate: awardVisible }" />
            <!-- #endif -->
            <!-- #ifdef MP-SALE -->
            <view class="iconfont iconjiantou fs-20 ml-10" :class="{ rotate: awardVisible }" />
            <!-- #endif -->
          </view>
          <view v-else>未中奖</view>
        </view>
        <view v-if="awardVisible" class="prize mt-20">
          <view v-if="existAwardRecord" class="mt-30 mb-30">
            <view class="mb-20 fw-bold">门店奖品</view>
            <view class="flex award-record award-record__header">
              <view class="left">奖励类型</view>
              <view class="right">奖励内容</view>
            </view>
            <view
              v-for="(item, index) in awardList"
              :key="index"
              class="flex award-record award-record__item fw-medium"
            >
              <view class="left">{{ item.computeway === 2 ? '开瓶' : '累计' }}奖励</view>
              <view class="right">
                {{ getShowValue(item) }}
              </view>
            </view>
          </view>
          <view class="item flex">
            <view class="label">发奖方式</view>
            <view class="flex-1">{{ info.drawtype === 1 ? '按开瓶数' : '按开瓶率' }}</view>
          </view>
          <view class="item flex">
            <view class="label">发奖时间</view>
            <view class="flex-1">{{ info.finishedordertime }}</view>
          </view>
        </view>
      </view>
      <view class="box">
        <view class="fs-30 mb-20 fw-bold"><text class="bg-title">团购商品</text></view>
        <view class="product-box flex">
          <image mode="aspectFit" :src="info.productimg" class="img" />
          <view class="ml-20 flex-1">
            <view class="title fw-medium">{{ info.productname }}</view>
            <view v-if="info.productformatname" class="mt-10 fs-24 c-6">{{ info.productformatname }}</view>
          </view>
        </view>
      </view>
      <view v-if="[4, 7].includes(info.orderstatus)" class="box order-box">
        <view class="item flex">
          <view class="label long">登记数量(瓶)</view>
          <view class="flex-1">{{ info.totaldeliveryamount }}</view>
        </view>
        <view class="item flex">
          <view class="label long">用酒数量(瓶)</view>
          <view class="flex-1">{{ info.totaluseamount }}</view>
        </view>
        <view class="item flex">
          <view class="label long">开瓶数量(瓶)</view>
          <view class="flex-1">{{ info.totalscannedamount }}</view>
        </view>
        <view class="item flex">
          <view class="label long">开瓶率</view>
          <view class="flex-1">{{ info.scannedrate }}%</view>
        </view>
      </view>
      <view class="box order-box">
        <view v-if="canDelete || canEdit" class="content flex flex-middle flex-end mb-20">
          <view
            v-if="canEdit"
            class="button warm flex flex-middle"
            :class="[disabledEdit ? 'disabled' : '']"
            @click="!disabledEdit && handleEdit()"
          >
            <!-- #ifdef MP-RETAIL -->
            <view class="iconfont iconedit mr-10 fs-24" />
            <!-- #endif -->
            <!-- #ifdef MP-SALE -->
            <view class="iconfont iconedit mr-10 fs-24" />
            <!-- #endif -->
            编辑
          </view>
          <view
            v-if="canDelete"
            class="button warm flex flex-middle"
            :class="[disabledDelete ? 'disabled' : '']"
            @click="!disabledDelete && handleDelete()"
          >
            <!-- #ifdef MP-RETAIL -->
            <view class="iconfont iconshanchu fs-28" />
            <!-- #endif -->
            <!-- #ifdef MP-SALE -->
            <view class="iconfont iconshanchu3 fs-28" />
            <!-- #endif -->
            删除
          </view>
          <!-- #ifdef MP-RETAIL -->
          <view
            v-if="!isNoDirectSales && (canDelete || canEdit)"
            class="iconfont iconexplain fs-40 ml-20"
            @click="showTips"
          />
          <!-- #endif -->
          <!-- #ifdef MP-SALE -->
          <view
            v-if="!isNoDirectSales && (canDelete || canEdit)"
            class="iconfont icontongjishuomingicon fs-40 ml-20"
            @click="showTips"
          />
          <!-- #endif -->
        </view>
        <view class="item flex">
          <view class="label">单号</view>
          <view class="flex-1 flex flex-middle flex-between">
            <view>{{ info.orderno }}</view>
          </view>
        </view>
        <view class="item flex">
          <view class="label">团购门店</view>
          <view class="flex-1">{{ info.storeno }}-{{ info.storename }}</view>
        </view>
        <view class="item flex">
          <view class="label">团购人</view>
          <view class="flex-1">{{ info.groupbuyername }}</view>
        </view>
        <view class="item flex">
          <view class="label">手机号</view>
          <view class="flex-1">{{ info.groupbuyerphone }}</view>
        </view>
        <view class="item flex">
          <view class="label">数量(瓶)</view>
          <view class="flex-1 flex flex-middle flex-between">
            {{ info.totaldeliveryamount }}瓶
            <view
              v-if="info.totaldeliveryamount > 0"
              class="code-record flex flex-middle flex-end fs-24"
              @tap="handleCodeRecord(0)"
            >
              查看物流码
              <!-- #ifdef MP-RETAIL -->
              <text class="iconfont iconjiantou1 fs-20 ml-10" />
              <!-- #endif -->
              <!-- #ifdef MP-SALE -->
              <view class="iconfont iconjiantou fs-20 ml-10" />
              <!-- #endif -->
            </view>
          </view>
        </view>
        <view class="item flex">
          <view class="label">备注</view>
          <view class="flex-1">{{ info.remark }}</view>
        </view>
        <view class="item flex">
          <view class="label">图片</view>
          <view class="flex-1 flex" :class="{ 'mb-10 mt-10': info.orderpicture.length > 0 }">
            <image
              v-for="(item, index) in info.orderpicture"
              :key="index"
              :src="item"
              mode="scaleToFill"
              class="img"
              @click="handleLookImg(item)"
            />
          </view>
        </view>
        <view class="item flex">
          <view class="label">提报时间</view>
          <view class="flex-1">{{ info.addtime }}</view>
        </view>
        <view class="item flex">
          <view class="label">提报人</view>
          <view class="flex-1">{{ info.applicantno }} - {{ info.applicantname }}</view>
        </view>
      </view>
      <view v-if="info.totalreturnedamount" class="box order-box">
        <view class="item flex">
          <view class="label">退货时间</view>
          <view class="flex-1">{{ info.lastreturnedtime }}</view>
        </view>
        <view class="item flex">
          <view class="label">退货数量</view>
          <view class="flex-1 flex flex-middle flex-between">
            {{ info.totalreturnedamount }}瓶
            <view
              v-if="info.totalreturnedamount > 0"
              class="code-record flex flex-middle flex-end fs-24"
              @tap="handleCodeRecord(1)"
            >
              查看物流码
              <!-- #ifdef MP-RETAIL -->
              <text class="iconfont iconjiantou1 fs-20 ml-10" />
              <!-- #endif -->
              <!-- #ifdef MP-SALE -->
              <view class="iconfont iconjiantou fs-20 ml-10" />
              <!-- #endif -->
            </view>
          </view>
        </view>
        <view class="item flex">
          <view class="label">退货人</view>
          <view class="flex-1">{{ info.lastreturnedmanno }} - {{ info.lastreturnedmanname }}</view>
        </view>
      </view>
      <template v-if="[0, 1, 4].includes(info.orderstatus)">
        <view style="height: 140rpx" />
        <view class="footer-btn flex flex-middle">
          <!-- #ifdef MP-RETAIL -->
          <!-- <button v-if="info.orderstatus === 0" class="flex-1 primary-btn size-small">提交</button> -->
          <!-- 待结单 根据配置显示扫码退货 -->
          <button
            v-if="info.orderstatus === 4 && settings.isreturn === 1"
            class="flex-1 primary-btn size-small"
            @tap="handleScanCodeReturn"
          >
            扫码退货
          </button>
          <!-- #endif -->
          <!-- #ifdef MP-SALE -->
          <template v-if="info.orderstatus === 1 && isSale">
            <!-- 待审核 只有厂家业务员可以操作 -->
            <button class="flex-1 primary-btn size-small plain" @tap="handleAudit(0, baseParams)">不通过</button>
            <button class="flex-1 primary-btn size-small" @tap="handleAudit(1, baseParams)">通过</button>
          </template>
          <template v-if="info.orderstatus === 4">
            <!-- 待结单 根据配置显示扫码退货 -->
            <button
              v-if="settings.isreturn === 1"
              class="flex-1 primary-btn size-small plain"
              @tap="handleScanCodeReturn"
            >
              扫码退货
            </button>
            <button v-if="isSale" class="flex-1 primary-btn size-small" @tap="handleFinishOrder">结单</button>
          </template>
          <!-- #endif -->
        </view>
      </template>
    </view>
    <code-record v-model="showCodeRecord" :mode="recordMode" :info="baseParams" />
    <!-- #ifdef MP-SALE -->
    <AuditPopup
      v-model="auditPopupVisible"
      :mode="auditPopup.checkresult"
      @confirm="handleAuditConfirm($event, 'detail')"
    />
    <finish-popup v-model="showFinishPopup" :info="info" @confirm="handleFinishConfirm" />
    <!-- #endif -->
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
import {
  apiOrderDetail,
  apiActivitySetting,
  apiDeleteOrder,
  // #ifdef MP-SALE
  apiFinishOrder
  // #endif
} from 'packages/api/group-buy'
import dayjs from 'dayjs'
import CodeRecord from './components/code-record.vue'
// #ifdef MP-SALE
import FinishPopup from './components/finish-popup.vue'
import AuditPopup from 'packages/components/audit-popup/audit-popup.vue'
// #endif
import {
  statusFilterMixin,
  orderConfigMixin,
  // #ifdef MP-SALE
  auditMixin
  // #endif
} from './mixins'
// #ifdef MP-RETAIL
import subscribeMsgMixin, { noticeMixin, noticeMixin2 } from 'packages/mixins/subscribe-msg'
// #endif
import { previewInListMixin } from 'packages/mixins/img'

export default {
  components: {
    CodeRecord,
    // #ifdef MP-SALE
    FinishPopup,
    AuditPopup
    // #endif
  },
  mixins: [
    statusFilterMixin,
    orderConfigMixin,
    previewInListMixin,
    // #ifdef MP-SALE
    auditMixin,
    // #endif
    // #ifdef MP-RETAIL
    subscribeMsgMixin,
    noticeMixin,
    noticeMixin2
    // #endif
  ],
  data() {
    return {
      loading: true,
      orderNo: '',
      // #ifdef MP-SALE
      storeId: 0,
      showFinishPopup: false,
      // #endif
      info: {},
      countdown: 0,
      recordMode: 1,
      showCodeRecord: false,
      awardVisible: false,
      awardList: [],
      existAwardRecord: false,
      interval: null,
      settings: {},
      isNativeAction: false, // 原生行为会触发onShow
      showPopup: false,
      popType: 'tip',
      popTitle: '提示',
      popContent: '',
      popConfirmText: '确定',
      popCancelText: '取消',
      popOperateType: '' // 弹窗操作类型: edit, delete, tip
    }
  },
  computed: {
    // #ifdef MP-SALE
    isSale() {
      // 厂家业务员
      return this.$store.state.userinfo.dealerid === 0
    },
    // #endif
    baseParams() {
      return {
        activityid: this.info.activityid,
        orderno: this.info.orderno,
        // #ifdef MP-SALE
        storeid: this.info.storeid
        // #endif
      }
    },
    // 编辑权限
    canEdit() {
      return this.getConfigShow('iseditorder')
    },
    disabledEdit() {
      return !this.getOrderRoleAllow('iseditororder')
    },
    // 删除权限
    canDelete() {
      return this.getConfigShow('isdeleteorder')
    },
    disabledDelete() {
      return !this.getOrderRoleAllow('isdeleteorder')
    }
  },
  onLoad(options) {
    this.orderNo = options.orderno
    // #ifdef MP-SALE
    options.storeid && (this.storeId = +options.storeid)
    // #endif
  },
  onShow() {
    if (this.isNativeAction) {
      this.isNativeAction = false
      return
    }
    this.getData()
  },
  beforeDestroy() {
    this.interval && clearInterval(this.interval)
  },
  methods: {
    async getData() {
      try {
        const res = await apiOrderDetail({
          // #ifdef MP-SALE
          storeid: this.storeId,
          // #endif
          orderno: this.orderNo
        })
        if (this.$ck(res)) {
          const { existawardrecord, awardrecords, ...rest } = res.return_data
          this.existAwardRecord = existawardrecord
          this.awardList = awardrecords || []
          this.info = rest
          if (this.info.orderstatus === 4) {
            this.updateCountdown()
            this.interval = setInterval(this.updateCountdown, 1000) // 每秒更新一次倒计时
            this.fetchSettings()
          }
        }
      } finally {
        this.loading = false
      }
    },
    async fetchSettings() {
      const res = await apiActivitySetting()
      if (this.$ck(res)) {
        this.settings = res.return_data
      }
    },
    updateCountdown() {
      const currentTime = dayjs()
      const endTime = dayjs(this.info.settlementtime)
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
    },
    handleCodeRecord(mode) {
      this.showCodeRecord = true
      this.recordMode = mode
    },
    handleScanCodeReturn() {
      let url = `./scan?activityid=${this.info.activityid}&orderno=${this.info.orderno || ''}&actiontype=1`
      // #ifdef MP-SALE
      url += `&storeId=${this.info.storeid}`
      // #endif
      this.$navPage(url)
    },
    handleLookImg(item) {
      this.isNativeAction = true
      this.handlePreview(item, this.info.orderpicture)
    },
    getShowValue(item) {
      return item.prizetype === 14
        ? `返货券（${item.productname}）* ${item.amount}`
        : item.prizetype === 10
        ? `红包${item.productname}`
        : item.productname
    },
    // #ifdef MP-SALE
    handleFinishOrder() {
      this.showFinishPopup = true
    },
    async handleFinishConfirm() {
      try {
        const res = await apiFinishOrder(this.baseParams)
        if (this.$ck(res)) {
          this.showFinishPopup = false
          this.$store.commit('updateRefreshTag', true)
          this.$msg('结单成功')
          this.interval && clearInterval(this.interval)
          setTimeout(() => {
            this.getData()
          }, 1500)
        }
      } catch (error) {
        this.$msg(error.return_msg)
      }
    },
    // #endif
    handleEdit() {
      if (!this.canEdit) {
        return
      }
      // 跳转到编辑页面
      let url = `./apply?activityid=${this.info.activityid}&orderno=${this.info.orderno}&isedit=1`
      // #ifdef MP-SALE
      if (this.info.storeid) {
        url += `&storeid=${this.info.storeid}`
      }
      // #endif
      this.$navPage(url)
    },
    handleDelete() {
      if (!this.canDelete) {
        return
      }
      this.popOperateType = 'delete'
      this.popType = 'confirm'
      this.popTitle = '提示'
      this.popConfirmText = '确定'
      this.popCancelText = '取消'

      // 根据订单状态显示不同的提示信息
      if (this.info.orderstatus === 1) {
        this.popContent = '该订单商品已登记，删除订单后，已登记的商品将自动执行回退处理，是否确定删除？'
      } else if (this.info.orderstatus === 4) {
        // 待结单状态，检查是否有开瓶记录
        if (this.info.totalscannedamount > 0) {
          this.popType = 'tip'
          this.popContent = '该订单商品已有开瓶记录，不允许删除订单！'
          this.popConfirmText = '确定'
          this.popCancelText = ''
        } else if (!this.settings.isreturn) {
          this.popType = 'tip'
          this.popContent = '您没有退货权限，无法删除订单！'
          this.popConfirmText = '确定'
          this.popCancelText = ''
        } else {
          this.popContent = '该订单商品已登记，删除订单后，已登记的商品将自动执行退货，是否确定删除？'
        }
      } else {
        this.popContent = '删除订单后你将看不到此订单，是否确定删除？'
      }
      this.showPopup = true
    },
    showTips() {
      this.popOperateType = 'tip'
      this.popType = 'tip'
      this.popTitle = '说明'
      this.popConfirmText = '关闭'
      this.popCancelText = ''
      this.popContent = `编辑：仅能编辑自己提交的订单 ，且厂家业务员未编辑过，且订单为：待审核、待结单状态时的报名信息。（厂家业务员编辑过时，无法修改，若需要修改时，则联系厂家业务员修改）
      <br />删除：仅能删除自己提交的订单 ，且订单为：待审核、审核不通过、待结单、已取消状态时的订单。`

      // #ifdef MP-SALE
      // 根据业务员类型显示不同的说明
      if (this.salemanType === 1 && !this.isNoDirectSales) {
        // 厂家业务员直营
        this.popContent = `编辑：仅能编辑自己提交的订单 ，且订单为：待审核、待送货、待结单 状态时的报名信息。
        <br />删除：仅能删除自己提交的订单 ，且订单为：未通过、待审核、待送货、待结单 状态时的订单。`
      }
      // #endif

      this.showPopup = true
    },
    async handleConfirm() {
      if (this.popOperateType === 'delete') {
        // 删除订单
        const res = await apiDeleteOrder({
          orderno: this.info.orderno
        })
        if (this.$ck(res)) {
          this.showPopup = false
          this.$msg('删除成功')
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        }
      } else {
        this.showPopup = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/common.scss';
@import './styles/detail.scss';
</style>
