<template>
  <view class="bgc-f4">
    <view v-if="listData">
      <!-- 提现记录详情 -->
      <view class="detail-wrapper" style="min-height: 100vh">
        <view class="list-wrap">
          <view class="list-title">门店信息</view>
          <view class="item split-line flex">
            <view class="key">门店</view>
            <view class="value">
              {{ listData.storeinfo.storename || '-' }}
            </view>
          </view>
          <view class="item split-line flex">
            <view class="key">地址</view>
            <view class="value">
              {{ listData.storeinfo.province || '-' }}{{ listData.storeinfo.city || ''
              }}{{ listData.storeinfo.area || '' }}{{ listData.storeinfo.address || '' }}
            </view>
          </view>
          <view class="item split-line flex">
            <view class="key">负责人</view>
            <view class="value">
              {{ listData.storeinfo.leader || '-' }}
            </view>
          </view>
          <view class="item split-line flex fs-28 c-3">
            <view class="key">门店编号</view>
            <view class="value">
              {{ listData.storeinfo.storeno || '-' }}
            </view>
          </view>
        </view>

        <view class="list-wrap">
          <view class="list-title">卡券信息</view>
          <view class="coupon-item">
            <view class="coupon-code">券码：{{ listData.couponcode || '-' }}</view>
            <view class="flex">
              <view>
                <image class="coupon-pic" :src="listData.voucherimg" />
              </view>
              <view class="coupon-name ub-f1 ellipsis-2">{{ listData.vouchername || '-' }}</view>
            </view>
            <view class="coupon-time tx-c">
              <view class="line" />
              有效期：{{ listData.starttime || '' }} 至 {{ listData.endtime || '' }}
            </view>
          </view>
        </view>
      </view>
      <view style="height: 100rpx" />
      <view v-if="showModal">
        <view class="pop-mask" />
        <view class="pop-layer">
          <view v-if="modalContent.isSuccess" class="icon iconfont icon-success" />
          <view v-else class="icon iconfont icon-duihuan-fail" />
          <view class="c-3 fs-30 text">{{ modalContent.msg }}</view>
        </view>
      </view>
      <view class="" />

      <button
        :class="['comfirmBtn', !allow ? 'disabled' : '', busy ? 'loading' : '']"
        :loading="busy"
        @tap="handleWriteOff"
      >
        确定核销
      </button>
    </view>
    <!-- 缺省页 -->
    <view v-else style="min-height: 100vh">
      <none-data v-if="!loading" msg="无匹配门店信息，请重新扫码" class="none-data" />
    </view>

    <!-- 缺省页end -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetBringCheckConfirm, apiGetBringCheckCheck } from 'packages/api/bring-coupon'
import userAuthHub from 'packages/utils/user-auth-hub.js'
import NoneData from 'packages/components/none-data/index.vue'
export default {
  components: {
    NoneData
  },
  data() {
    return {
      picDefault: '', // 缺省页
      defaultBtn: '扫一扫',
      textArray: ['无匹配门店信息，请重新扫码'], // 缺省页
      listData: {},
      showModal: false,
      allow: false,
      loading: true,
      busy: false, // 防重复请求标识
      modalContent: {
        isSuccess: true,
        code: 0,
        msg: ''
      },
      timer: '',
      param: {
        id: 0,
        storeid: ''
      }
    }
  },
  async onLoad(option) {
    let couponid = Number(option.couponid)
    let storeid = option.storeid
    this.param = {
      id: couponid,
      storeid: storeid
    }
    this.$loading.show()
    await this.fetchData()
    this.loading = false
    this.$loading.hide()
  },
  methods: {
    async handleWriteOff() {
      if (this.busy) return
      this.busy = true
      let res = await apiGetBringCheckCheck(this.param)
      this.busy = false
      this.loading = false
      this.modalContent = {
        isSuccess: res.return_code === 0,
        msg: res.return_msg,
        code: res.return_code
      }
      this.tapComfirm()
    },
    async fetchData() {
      let res = await apiGetBringCheckConfirm(this.param)
      if (this.$ck(res)) {
        this.allow = true
        this.listData = res.return_data
      } else {
        this.modalContent = {
          isSuccess: false,
          msg: res.return_msg,
          code: res.return_code
        }
        this.tapComfirm()
      }
    },
    tapComfirm() {
      clearTimeout(this.timer)
      this.showModal = true
      if (this.showModal) {
        this.timer = setTimeout(() => {
          this.showModal = false
          let id = this.param.id
          let result = this.modalContent.isSuccess
          userAuthHub.notify({ result: result, code: this.modalContent.code })
          uni.navigateBack({
            id: id
          })
          clearTimeout(this.timer)
        }, 2000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list-title {
  padding: 30rpx 0 10rpx 30rpx;
  color: #333;
  font-size: 32rpx;
  font-weight: 700;
}
.list-wrap {
  background-color: #fff;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
  .split-line:last-child {
    background: none !important;
  }
  .item {
    margin: 0 30rpx;
    padding: 40rpx 0;
    .key {
      width: 168rpx;
    }
    .value {
      flex: 1;
      width: 522rpx;
      text-align: right;
    }
  }
}

.comfirmBtn {
  width: 690rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(90deg, rgba(255, 162, 0, 1) 0%, rgba(255, 212, 97, 1) 100%);
  border-radius: 40rpx;
  position: fixed;
  bottom: 30rpx;
  left: 30rpx;
  font-size: 36rpx;
  color: #fff;
  &.disabled {
    background: linear-gradient(90deg, rgba(213, 213, 213, 1) 0%, rgba(224, 224, 224, 1) 100%) !important;
    box-shadow: none !important;
  }
}
.coupon-item {
  margin: 20rpx 30rpx;
  position: relative;
  border: 1rpx solid #e7e7e7;
  border-radius: 5rpx;
  &:after {
    position: absolute;
    width: 100%;
    height: 5rpx;
    content: '';
    background-color: #ffd386;
    left: 0;
    top: 0;
    border-top-right-radius: 5rpx;
    border-top-left-radius: 5rpx;
  }
}
.coupon-pic {
  width: 100rpx;
  height: 100rpx;
  border-radius: 5rpx;
  padding: 0 30rpx;
}
.coupon-name {
  color: #333;
  font-size: 28rpx;
  font-weight: 700;
  padding-right: 20rpx;
  height: 79rpx;
}
.coupon-code {
  color: #666;
  font-size: 28rpx;
  padding: 30rpx 0 25rpx 30rpx;
}
.coupon-time {
  color: #999;
  font-size: 24rpx;
  padding: 16px 0 10px;
  margin: 20rpx -1px 0 -1px;
  position: relative;
  overflow: hidden;
  .line {
    border-top: #ddd dashed 1px;
    position: absolute;
    background-color: #fff;
    z-index: 10;
    left: 0;
    width: 100%;
    top: 12rpx;
  }
  &:before {
    content: '';
    width: 20rpx;
    height: 20rpx;
    border: 1px solid #e7e7e7;
    border-radius: 50%;
    position: absolute;
    background-color: #fff;
    left: -10rpx;
    top: 0;
    z-index: 20;
  }
  &:after {
    content: '';
    width: 20rpx;
    height: 20rpx;
    border: 1px solid #e7e7e7;
    border-radius: 50%;
    border-right: none;
    position: absolute;
    background-color: #fff;
    right: -10rpx;
    top: 0;
    z-index: 20;
  }
}

.pop-mask {
  z-index: 190;
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.pop-layer {
  width: 500rpx;
  height: 286rpx;
  background: rgba(255, 255, 255, 1);
  border-radius: 10rpx;
  position: fixed;
  z-index: 200;
  top: 50%;
  left: 50%;
  margin: -143rpx 0 0 -250rpx;
  text-align: center;
  .icon {
    margin: 60rpx 0 30rpx;
    font-size: 80rpx;
    &.icon-success {
      color: #3daf35;
    }
    &.icon-duihuan-fail {
      color: #ffa200;
    }
  }
}
</style>
