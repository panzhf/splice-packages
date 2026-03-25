<template>
  <view>
    <view v-if="!loading" class="page-appeal-detail">
      <view class="state-box">
        <view class="fs-30 fw-bold" :class="{ 'warn-color': info.status === 2, 'checked-color': info.status === 0 }">
          申诉状态：{{ info.status | stateFilter }}
        </view>
        <view v-if="info.status === 2" class="mt-10 fs-28 warn-color">原因：{{ info.cause }}</view>
      </view>
      <view class="list-box mt-20 fs-28">
        <view class="item flex flex-middle">
          <view class="label shrink-0">申诉订单：</view>
          {{ orderId }}
        </view>
        <view class="item flex flex-middle">
          <view class="label shrink-0">申诉时间：</view>
          {{ info.createdtime }}
        </view>
        <view class="item flex">
          <view class="label shrink-0">申诉原因：</view>
          <view>{{ info.remark }}</view>
        </view>
        <view v-if="info.pictures.length" class="item flex mt-20 mb-20">
          <view class="label shrink-0">照片：</view>
          <view class="flex-wrap">
            <image
              v-for="(item, index) in info.pictures"
              :key="index"
              :src="item"
              mode="aspectFill"
              class="img"
              @tap="handlePreview(item)"
            />
          </view>
        </view>
        <view v-if="info.status === 2" class="item flex flex-middle">
          <view class="label shrink-0">审核时间：</view>
          {{ info.checktime }}
        </view>
        <!-- #ifdef MP-SALE -->
        <view v-if="info.status === 2 && info.auditidea" class="item flex flex-middle">
          <view class="label shrink-0">申诉审核意见：</view>
          {{ info.auditidea }}
        </view>
        <!-- #endif -->
      </view>
      <template v-if="info.status === 0">
        <view style="height: 110rpx" />
        <view class="footer flex flex-middle">
          <button class="flex-1 primary-btn round size-small plain" hover-class="button-action" @tap="handleAudit(2)">
            审核不通过
          </button>
          <button class="flex-1 primary-btn round size-small ml-30" hover-class="button-action" @tap="handleAudit(1)">
            审核通过
          </button>
        </view>
      </template>
    </view>
    <AuditPopup
      v-model="showAudit"
      :mode="auditInfo.status === 1 ? 2 : 0"
      :isneedauditidea="isNeedAuditIdea"
      @confirm="onConfirm"
    />
  </view>
</template>

<script>
// 暂时只有业务帮帮使用
import { apiGetAppealRecord, apiOrderAppealCheck, apiBanquetOrdersMenu } from 'packages/api/banquet'
import { setTitleMixin } from 'packages/mixins/navigation'
import AuditPopup from 'packages/components/audit-popup/audit-popup.vue'
import { previewImage } from 'packages/utils'
export default {
  name: 'AppealDetail',
  components: { AuditPopup },
  filters: {
    stateFilter(v) {
      return v === 0 ? '待审核' : v === 1 ? '通过' : '不通过'
    }
  },
  mixins: [setTitleMixin],
  data() {
    return {
      orderId: 0,
      info: {
        status: -1, // 0.待审核 1.审核通过（一般进不来） 2.审核不通过
        remark: '',
        pictures: [],
        createdtime: '',
        cause: '', // 不通过原因
        checktime: '',
        auditidea: ''
      },
      showAudit: false,
      auditInfo: {
        status: 0, // 1.通过 2.不通过
        cause: '',
        auditidea: ''
      },
      loading: true,
      isNeedAuditIdea: false // 是否需填写审核意见，由 apiBanquetOrdersMenu 配置
    }
  },
  onLoad(options) {
    this.orderId = +options.orderid
    this.fetchBanquetSetting()
    this.getInfo()
  },
  methods: {
    async fetchBanquetSetting() {
      const res = await apiBanquetOrdersMenu()
      if (this.$ck(res) && res.return_data) {
        this.isNeedAuditIdea = !!res.return_data.isneedauditidea
      }
    },
    async getInfo() {
      try {
        const res = await apiGetAppealRecord({ orderid: this.orderId })
        if (this.$ck(res)) {
          const { status, remark, createdtime, cause, picturesjson, checktime, auditidea } = res.return_data
          this.info = {
            status,
            remark,
            pictures: JSON.parse(picturesjson || '[]'),
            createdtime,
            checktime,
            cause,
            auditidea: auditidea || ''
          }
          this.setTitle(status === 0 ? '申诉审核' : '申诉详情')
        }
      } finally {
        this.loading = false
      }
    },
    handleAudit(v) {
      this.auditInfo.cause = ''
      this.auditInfo.auditidea = ''
      this.auditInfo.status = v
      this.showAudit = true
    },
    onConfirm(cause, auditidea) {
      this.auditInfo.cause = cause || ''
      this.auditInfo.auditidea = auditidea || ''
      this.showAudit = false

      apiOrderAppealCheck({
        orderid: this.orderId,
        ...this.auditInfo
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('操作成功')
          setTimeout(() => {
            if (this.auditInfo.status === 2) {
              this.getInfo()
              return
            }
            uni.navigateBack()
          }, 1500)
        }
      })
    },
    handlePreview(url) {
      previewImage({ current: url, urls: this.info.pictures })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: page-appeal-detail;
.#{$prefix} {
  min-height: 100vh;
  background-color: #f6f7fc;
  .state-box,
  .list-box {
    padding: 30rpx;
    background-color: #fff;
  }
  .list-box {
    .item {
      line-height: 48rpx;
      color: #333;
    }
    .label {
      width: 200rpx;
      color: #666;
    }
    .img {
      @include wh(80rpx);
      margin-right: 10rpx;
      margin-bottom: 10rpx;
    }
  }
  .footer {
    position: fixed;
    left: 30rpx;
    right: 30rpx;
    bottom: 30rpx;
  }
}
</style>
