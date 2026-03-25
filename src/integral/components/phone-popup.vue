<template>
  <viwe>
    <common-popup v-model="showPhonePopup" type="confirm" title="填写手机号码" max-size @confirm="handleSubmit">
      <view class="phone-c">
        <view class="tips">请输入您的手机号码，礼品将会发送至对应手机账号上</view>
        <view class="phone-box">
          <input
            v-model="phone"
            type="number"
            class="flex-1 fs-28"
            placeholder="请一键获取或手动输入"
            :focus="autoFocus"
          />
          <button
            class="btn"
            :open-type="openType"
            :phone-number-no-quota-toast="false"
            @getphonenumber="handleGetPhoneNumber"
          >
            一键获取手机号
          </button>
        </view>
        <!-- <view class="handle-box">
          <view class="btn close" @click="showPhonePopup = false">取消</view>
          <view class="btn" @click="handleSubmit">确认</view>
        </view> -->
      </view>
    </common-popup>
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" max-size @close="onVerifyFail" />
  </viwe>
</template>

<script>
// #ifdef MP-MEMBER || MP-CLOUDSHOP
// 导购服务商礼品兑换，会员小程序用不上
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
// #endif
import phoneVerifyMixin from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
import { getMobileNumber } from 'packages/utils/function'
import store from '@/store'
import { regMobile } from 'packages/utils/reg'
export default {
  // #ifdef MP-MEMBER || MP-CLOUDSHOP
  components: {
    CommonPopup
  },
  // #endif
  mixins: [phoneVerifyMixin, privacyMixin],
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      phone: '',
      code: ''
    }
  },
  computed: {
    showPhonePopup: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      }
    }
  },
  methods: {
    async handleGetPhoneNumber(e) {
      this.autoFocus = false
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) {
        let mpInfo = {}
        // #ifdef MP-GUIDE
        if (store.state.mpInfo) {
          mpInfo = {
            mpappid: store.state.mpInfo.mpAppID,
            mpmemberlogin: store.state.mpInfo.mpMemberLogin
          }
        }
        // #endif
        let res = await getMobileNumber({ mobilecode: code }, mpInfo)
        this.phone = res.phonenumber || ''
      }
    },
    handleSubmit() {
      if (!regMobile(this.phone)) {
        this.$msg('请输入正确的手机号')
        return
      }
      this.$emit('submit', this.phone)
    }
  }
}
</script>

<style lang="scss" scoped>
.phone-c {
  .tips {
    font-size: 24rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #2a2a2a;
    text-align: left;
  }
  .phone-box {
    border-bottom: 1px solid #aaaaaa;
    display: flex;
    padding: 30rpx 0;
    justify-content: space-between;
    .btn {
      line-height: 44rpx;
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #1e8dff;
      background: #fff;
    }
  }
  .handle-box {
    display: flex;
    .btn {
      width: 200rpx;
      height: 72rpx;
      background: linear-gradient(90deg, #f2bc64 0%, #ffe29a 100%);
      border-radius: 36rpx;
      line-height: 72rpx;
      font-size: 30rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #9a4802;
      margin: 50rpx auto 0;
    }
    .close {
      background: #fff;
      color: #666;
      border: 1rpx solid #666;
      font-weight: 400;
    }
  }
}
</style>
