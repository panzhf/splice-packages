<template>
  <view class="container address-edit fs-28" :style="themeVars">
    <view class="address-info pl-20 pr-20">
      <view class="address-item flex flex-middle">
        <view class="mark">
          <text class="asterisk">*</text>
          收货人
        </view>
        <input
          v-model.trim="form.consignee"
          placeholder="请一定填写真实姓名，否则无法寄送"
          placeholder-class="address-placeholder"
          maxlength="10"
          class="flex-1"
        />
      </view>
      <view class="address-item flex flex-middle">
        <view class="mark">
          <text class="asterisk">*</text>
          手机号码
        </view>
        <input
          v-model="form.mobile"
          type="number"
          placeholder="11位手机号"
          placeholder-class="address-placeholder"
          maxlength="11"
          :focus="autoFocus"
          class="flex-1"
        />
        <button
          plain="true"
          :open-type="openType"
          :phone-number-no-quota-toast="false"
          class="telenumber fs-26"
          @getphonenumber="getPhonenumber"
        >
          一键获取手机号
        </button>
      </view>
      <view class="address-item flex flex-middle">
        <view class="mark">
          <text class="asterisk">*</text>
          选择地区
        </view>
        <view class="region-box flex-1 flex flex-middle">
          <address-picker ref="addresspicker" class="address-picker flex-1" @getAddress="getAddress" />
          <view class="icon iconfont icon-more fs-24" />
        </view>
      </view>
      <view class="address-item flex flex-middle">
        <view class="mark">
          <text class="asterisk">*</text>
          详细地址
        </view>
        <textarea
          v-model.trim="form.address"
          :auto-height="true"
          :cursor-spacing="100"
          placeholder="乡/镇、街道、门牌信息"
          placeholder-class="address-placeholder"
          maxlength="100"
          class="flex-1 text-input"
          @blur="onInputAddress"
        />
        <view v-if="showChooseIcon" class="icon iconfont icon-address-user fs-32" @tap.stop="getDetailInfo" />
      </view>
    </view>
    <view class="set-default flex flex-middle pl-20 pr-20 mt-30">
      <view class="mark flex-1">设为默认地址</view>
      <switch :checked="isChecked" class="check-icon" @change="onSwitchChange" />
    </view>
    <view class="btn-submit flex flex-middle fs-30 text-center">
      <view class="btn wechat flex-1" @tap="getWeChatAddress">从微信获取新地址</view>
      <view class="btn active flex-1 ml-20" @tap="handleSave">保 存</view>
    </view>
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" max-size @close="onVerifyFail" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import AddressPicker from './address-picker/address-picker.vue'
import { apiaAdressedit } from '../api/address.js'
import { getMobileNumber } from '../utils/function.js'
// #ifdef MP-MEMBER
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import { getExtConfig } from '@/config'
import { specialLogout } from 'packages/config/custom'
// #endif
import phoneVerifyMixin from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
// #ifdef MP-GUIDE
import store from '@/store'
// #endif
import { regMobile } from 'packages/utils/reg'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    AddressPicker,
    // #ifdef MP-MEMBER
    CommonPopup
    // #endif
  },
  mixins: [
    phoneVerifyMixin,
    privacyMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      form: {
        id: 0,
        consignee: '',
        mobile: '',
        provincename: '',
        cityname: '',
        countyname: '',
        provinceid: '',
        cityid: '',
        countyid: '',
        address: '',
        isdefault: 0
      },
      isChecked: false,
      code: '',
      showChooseIcon: true
    }
  },
  onLoad(options) {
    // #ifdef MP-MEMBER
    this.showChooseIcon = !specialLogout.includes(this.$toLowerKey(getExtConfig()).memberlogin)
    // #endif
    if (options.obj) {
      uni.setNavigationBarTitle({
        title: '编辑收货地址'
      })
      let data = JSON.parse(decodeURIComponent(options.obj))
      if (+data.isdefault === 1) {
        // 个别返回字符格式
        this.isChecked = true
      }
      this.form = data
      this.$refs.addresspicker.region = [data.provincename, data.cityname, data.countyname]
    } else {
      uni.setNavigationBarTitle({
        title: '新增收货地址'
      })
    }
  },
  methods: {
    getAddress(res) {
      this.form.provincename = res.Province.name
      this.form.cityname = res.City.name
      this.form.countyname = res.Area.name
      this.form.provinceid = res.Province.id
      this.form.cityid = res.City.id
      this.form.countyid = res.Area.id
    },
    onSwitchChange({ detail: { value } }) {
      this.isChecked = value
    },
    getDetailInfo() {
      // 地图定位
      uni.chooseLocation({
        success: ({ address }) => {
          this.form.address = address
        }
      })
    },
    async getPhonenumber(e) {
      // 获取手机号
      this.autoFocus = false
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) {
        let mpInfo = {}
        let memberlogin = ''

        // #ifdef MP-DISTRIBUTION || MP-GUIDE
        memberlogin = JSON.parse(uni.getStorageSync('currentBrandInfo') || '{}').memberlogin || ''
        // #endif

        // #ifdef MP-RETAIL
        memberlogin = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}').memberLogin || ''
        // #endif

        mpInfo = {
          memberlogin
        }

        // #ifdef MP-GUIDE
        // 尚未上线，搁置，先保留
        if (store.state.mpInfo) {
          mpInfo = {
            mpappid: store.state.mpInfo.mpAppID,
            mpmemberlogin: store.state.mpInfo.mpMemberLogin
          }
        }
        // #endif

        let param = {
          mobilecode: code
        }

        const r = await getMobileNumber(param, mpInfo)
        this.form.mobile = r.phonenumber || ''
      }
    },
    onInputAddress({ detail: { value } }) {
      // 过滤特殊字符
      this.form.address = (value || '').replace(/[\\~!¥￥%^&*+'\$;`]+/g, '')
    },
    getWeChatAddress() {
      // 获取微信收货地址
      uni.chooseAddress({
        success: res => {
          this.$loading.show()
          const {
            userName: consignee,
            detailInfo: address,
            telNumber: mobile,
            nationalCode: nationalcode,
            provinceName: provincename,
            cityName: cityname,
            countyName: countyname
          } = res
          const list = {
            id: 0,
            consignee,
            address,
            mobile,
            nationalcode,
            provincename,
            cityname,
            countyname,
            isdefault: 0,
            type: 1
          }
          apiaAdressedit(list)
            .then(res => {
              if (this.$ck(res, true)) {
                this.$msg('导入成功', { icon: 'success' })
                setTimeout(() => {
                  uni.navigateBack({ delta: 1 })
                }, 1500)
              }
            })
            .catch(err => {
              this.$msg(err.return_msg)
            })
          this.$loading.hide()
        }
      })
    },
    handleSave() {
      let resVerify = this.verifyForm()
      if (resVerify) return this.$msg(resVerify)
      this.saveAddress()
    },
    saveAddress() {
      this.$loading.show()
      const { id, consignee, mobile, provincename, provinceid, cityname, cityid, countyname, countyid, address } =
        this.form
      apiaAdressedit({
        id,
        consignee,
        mobile,
        provincename,
        provinceid,
        cityname,
        cityid,
        countyname,
        countyid,
        address,
        isdefault: this.isChecked ? 1 : 0
      })
        .then(res => {
          if (this.$ck(res)) {
            this.$msg('保存成功', { icon: 'success' })
            setTimeout(() => {
              this.updateFlag()
              uni.navigateBack({ delta: 1 })
            }, 1500)
          }
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    },
    updateFlag() {
      uni.$emit('updateFlag', true)
    },
    /** 表单验证 */
    verifyForm() {
      if (this.form.consignee.trim() === '') {
        return '请输入收货人姓名'
      }
      if (!/^([\u4e00-\u9fa5]|[a-zA-Z0-9]|[()]){1,30}$/.test(this.form.consignee)) {
        return '收货人姓名不能包含特殊字符'
      }
      if (this.form.mobile.trim() === '') {
        return '请输入手机号码'
      }
      if (!regMobile(this.form.mobile)) {
        return '请输入正确的手机号码'
      }
      if (this.$refs.addresspicker.region.length === 0) {
        return '请选择地区'
      }
      if (this.form.address.trim() === '') {
        return '请输入详细地址'
      }
      if (this.form.address.length > 100) return '详细地址不能超过100个字'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.address-edit {
  margin-top: 20rpx;
  color: #333;
  .icon {
    padding: 10rpx 0 10rpx 20rpx;
    color: #666;
  }
  .address-info,
  .set-default {
    background-color: #fff;
  }
  .address-item:not(:last-child) {
    border-bottom: 1rpx solid #eee;
  }
  .region-box,
  .address-picker {
    overflow: hidden;
  }

  .mark {
    width: 140rpx;
    padding: 36rpx 0;
    .asterisk {
      color: #dd2726;
    }
  }
  .text-input {
    padding: 10rpx 0;
  }
  .telenumber {
    color: #4b4;
    border: none;

    line-height: 90rpx;
  }
  .check-icon {
    transform: scale(0.8);
  }

  .btn-submit {
    position: fixed;
    bottom: 0;
    left: 0;

    width: 100%;
    background-color: #fff;
    padding: 15rpx 20rpx;
    padding-bottom: 15rpx;
    padding-bottom: calc(constant(safe-area-inset-bottom) + 15rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 15rpx);
    box-sizing: border-box;
    .btn {
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      &.active {
        color: #fff;
        background: var(--theme-color, $uni-color-primary);
      }
      &.wechat {
        color: #000;
        border: 1px solid #999;
      }
    }
  }
}
</style>
<style>
.address-placeholder {
  color: #ccc;
}
</style>
