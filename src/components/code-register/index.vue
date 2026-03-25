<template>
  <common-popup v-model="dialogVisible" :max-size="true" type="confirm" :show-title="false" :pop-hide-button="true">
    <view class="content-box">
      <!-- 关闭按钮 -->
      <view class="close-btn" @tap="closeDialog">
        <text class="iconfont icon-close fs-20 c-6" />
      </view>

      <!-- 自定义标题和图标 -->
      <view class="custom-header flex flex-column flex-center mb-30">
        <text
          class="iconfont mb-20"
          :class="[isSuccess ? 'icon-success' : 'icon-fail']"
          :style="{ color: isSuccess ? '#58BE6B' : '#FF5C53' }"
        />
        <view class="title fs-36 fw-bold c-3">{{ dialogConfig.title }}</view>
      </view>

      <!-- 登记码 -->
      <view v-if="isSuccess" class="fs-28 c-6 tx-c mb-30">登记码: {{ registerInfo.logisticscode || '-' }}</view>
      <view v-else class="c-6 mb-30">{{ msg }}</view>

      <!-- 登记人信息区域 -->
      <view v-if="showInfo" class="info-box br-10">
        <view v-for="(item, index) in infoList" :key="index" class="info-item flex fs-28 c-3">
          <text class="label shrink-0 mr-10 tx-l">{{ item.label }}：</text>
          <text class="flex-1 tx-l">{{ registerInfo[item.prop] || '-' }}</text>
        </view>
      </view>

      <!-- 自定义按钮 -->
      <view class="btn-box flex mt-40">
        <!-- 查看登记明细按钮 -->
        <button v-if="registerInfo.activityid" class="detail-btn flex-1 fs-32 fw-bold mr-20" @tap="handleViewDetail">
          查看登记明细
        </button>
        <!-- 继续登记按钮 -->
        <button class="continue-btn flex-1 fs-32 fw-bold" @tap="handleContinue">{{ dialogConfig.confirmText }}</button>
      </view>
    </view>
  </common-popup>
</template>

<script>
import { apiRegisterPromotion } from 'packages/api/promotion-gift'
import subscribeMsg from 'packages/mixins/subscribe-msg'
import { noticeMixin, noticeMixin2 } from 'packages/mixins/subscribe-msg'

export default {
  name: 'RegisterSuccessDialog',
  mixins: [subscribeMsg, noticeMixin, noticeMixin2].filter(Boolean),
  data() {
    return {
      dialogVisible: false,
      isSuccess: true, // 登记是否成功
      dialogConfig: {
        title: '登记成功',
        confirmText: '继续登记'
      },
      msg: '',
      showInfo: true,
      registerInfo: {},
      _subscribeInited: false // 消息订阅是否已初始化
    }
  },
  computed: {
    infoList() {
      return [
        { label: '登记人', prop: 'writeoffname' },
        { label: '登记时间', prop: 'addtime' },
        { label: '登记结果', prop: 'triggertimes' },
        { label: '所属门店', prop: 'storename' }
      ]
    }
  },
  methods: {
    // 外部调用此方法，传入code，调用接口，显示弹窗
    async show(code) {
      this.registerInfo = {}
      if (!code) {
        return
      }

      const res = await apiRegisterPromotion({ logisticscode: code })

      // 判断是否成功
      this.isSuccess = res.return_code === 0
      this.msg = res.return_msg
      this.dialogConfig.title = this.isSuccess ? '登记成功' : '登记失败'

      // 消息订阅：仅登记成功时才初始化并拉取订阅配置，关闭时再调起订阅并上报
      if (this.isSuccess && !this._subscribeInited && this.initNotice) {
        this.subscribeSettings = await this.initNotice(556)
        if (this.subscribeSettings?.isopen && this.fetchNotice) {
          await this.fetchNotice(12)
        }
        this._subscribeInited = true
      }

      if (res.return_data) {
        this.showInfo = true
        const data = res.return_data
        this.registerInfo = {
          ...data,
          triggertimes: `第${data.triggertimes || 1}次`
        }
        this.showCode = true
        this.dialogVisible = true
      } else {
        // 失败时也显示弹窗
        this.showInfo = false
        this.showCode = false
        this.dialogVisible = true
      }
    },

    // 关闭弹窗
    hide() {
      this.dialogVisible = false
    },

    // 点击关闭按钮
    async closeDialog() {
      await this.subscribeAndReportOnClose()
      this.dialogVisible = false
    },

    // 关闭弹窗时调起订阅并上报（仅登记成功时才执行）
    async subscribeAndReportOnClose() {
      if (!this.isSuccess) return
      let subscriberesult = {}
      if (this.subscribeSettings?.isopen && this.noticeTempId && this.requestSubscribeMsg) {
        subscriberesult = await this.requestSubscribeMsg([this.noticeTempId])
      }
      if (this.reportNotice && subscriberesult && Object.keys(subscriberesult).length > 0) {
        this.reportNotice({
          subscriberesult,
          type: 12,
          orderid: this.registerInfo?.logisticscode || ''
        })
      }
    },

    // 继续登记 - 触发父组件的扫码方法
    async handleContinue() {
      await this.subscribeAndReportOnClose()
      this.dialogVisible = false
      this.$emit('continue')
    },

    // 查看登记明细
    async handleViewDetail() {
      await this.subscribeAndReportOnClose()
      this.dialogVisible = false
      this.$navPage(`/packages/src/pages/promotion-gift/record?activityid=${this.registerInfo.activityid}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.close-btn {
  position: absolute;
  top: -80rpx;
  right: -30rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.custom-header {
  margin-top: 45rpx;
  .icon-success,
  .icon-fail {
    line-height: 1;
    font-size: 90rpx;
  }
}

.info-box {
  background-color: #f5f5f5;
  padding: 24rpx 30rpx;
}

.info-item {
  line-height: 50rpx;
  .label {
    width: 140rpx;
  }
}

.btn-box {
  .detail-btn,
  .continue-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    &::after {
      border: none;
    }
  }

  .detail-btn {
    background: #fff;
    border: 2rpx solid var(--theme-color, #ff7640);
    color: var(--theme-color, #ff7640);
  }

  .continue-btn {
    background: var(--theme-color, #ff7640);
    border: none;
    color: #fff;
  }
}
.content-box {
  position: relative;
  margin: 0 -20rpx -20rpx;
}
</style>
