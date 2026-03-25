<template>
  <view v-if="loaded" class="withdrawal-detail bg-f c-2a" style="min-height: 100vh">
    <view class="result tx-c">
      <view v-if="resultType === 1" class="icon mdfont icon-going result-icon checked-color" />
      <view v-else-if="resultType === 0" class="icon mdfont icon-success1 result-icon success-color" />
      <view v-else class="icon mdfont icon-fail result-icon error-color" />
      <view class="result-text fs-40 pt-30 pb-30">
        {{ resultType === 1 ? '提现中' : resultType === 0 ? '提现成功' : '提现失败' }}
      </view>
      <view class="result-reason fs-26 c-6">
        {{
          resultType === 1
            ? '预计24小时内到账，请留意微信到账结果'
            : resultType === 0
            ? '请查收"微信支付"的零钱入账通知'
            : wxretdesc
        }}
      </view>
    </view>
    <view class="account">
      <view class="account-item bd-e">
        <text class="key">提现金额</text>
        <view class="value checked-color-i">￥{{ inputMoney }}</view>
      </view>
      <view class="account-item bd-e">
        <text class="key">到账账户</text>
        <view class="value">{{ userInfo.nickname }}</view>
        <image
          class="avatar-48 ml-20"
          :src="userInfo.headpath ? userInfo.headpath : persoanalHeadDefault"
          mode="scaleToFill"
        />
      </view>
      <view class="account-item bd-e">
        <text class="key">提现时间</text>
        <view class="value">{{ createdtime }}</view>
      </view>
      <view class="account-item">
        <text class="key shrink-0">交易单号</text>
        <view class="value ml-10">{{ outtradeno }}</view>
      </view>
    </view>
    <view v-if="!fromPage" class="account">
      <view class="account-item" @tap="handleNavigation('/packages/src/personal/change/withdraw-record')">
        <text class="key">提现记录</text>
        <view class="value">
          <text class="icon mdfont icon-mdfont-more fs-24 c-2a" />
        </view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetWithdrawResult } from 'packages/api/balance'
import { staticURL } from '@/config'
export default {
  data() {
    return {
      resultType: -1, // 0成功 1处理中 2提现失败
      inputMoney: '', // 提现金额
      outtradeno: '', // 业务系统订单
      createdtime: '', // 创建时间
      wxretdesc: '', // 微信返回结果描述
      persoanalHeadDefault: staticURL(true) + 'default-avatar.png', // 缺省图片
      timer: undefined,
      fromPage: '',
      loaded: false,
      userInfo: {
        nickname: '',
        headpath: ''
      }
    }
  },
  async onLoad(options) {
    this.tradeno = options.tradeno
    this.apiGetAssetsListInfoFn()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    handleNavigation(url) {
      if (!url) return
      uni.redirectTo({
        url: url
      })
    },
    async apiGetAssetsListInfoFn() {
      try {
        let res = await apiGetWithdrawResult({
          tradeno: this.tradeno
        })
        this.loaded = true
        if (this.$ck(res, true)) {
          const data = res.return_data

          this.inputMoney = data.amount
          this.createdtime = data.tradetime
          this.remark = data.remark
          this.resultType = data.tradestate
          this.wxretdesc = data.reson
          this.outtradeno = data.tradeno
          this.userInfo.nickname = data.nickname
          this.userInfo.headpath = data.headpath
          if (this.resultType === 1) {
            // 只有当定时器不存在时才启动轮询
            if (!this.timer) {
              this.redoApiGetAssetsListInfoFn()
            }
          } else {
            // 状态不是"提现中"时，清除定时器
            if (this.timer) {
              clearInterval(this.timer)
              this.timer = null
            }
          }
        }
      } catch (error) {
        this.$msg(error.return_msg || '获取提现结果失败')
      }
    },
    redoApiGetAssetsListInfoFn() {
      // 每3秒查询一次
      this.timer = setInterval(() => {
        this.apiGetAssetsListInfoFn()
      }, 1000 * 3)
    }
  }
}
</script>

<style lang="scss" scoped>
.result {
  padding: 110rpx 0 30rpx;
  &-icon {
    font-size: 80rpx;
  }
  &-reason {
    padding-bottom: 70rpx;
  }
}
.account {
  margin: 0 30rpx 30rpx;
  padding: 10rpx 0;
  background: $uni-bg-color-light-grey;
  border-radius: 10rpx;
  &-item {
    display: flex;
    align-items: center;
    margin: 0 30rpx;
    height: 90rpx;
    font-size: 28rpx;
    .value {
      flex: 1;
      color: $uni-text-color-grey;
      text-align: right;
    }
  }
}
</style>
