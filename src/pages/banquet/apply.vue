<template>
  <view v-show="!loading" class="apply" :style="themeVars">
    <view class="form-box">
      <u-form ref="uForm" :model="form" label-width="180" :error-type="['message', 'border', 'toast']">
        <u-form-item
          v-if="settings.banquetname.show"
          label="宴席主"
          prop="BanquetName"
          :required="settings.banquetname.required"
        >
          <u-input v-model="form.BanquetName" :clearable="false" placeholder="请输入宴席主姓名" :maxlength="10" />
        </u-form-item>
        <u-form-item
          v-if="settings.banquetphone.show"
          label="手机号"
          prop="BanquetPhone"
          :required="settings.banquetphone.required"
        >
          <u-input
            v-model="form.BanquetPhone"
            :clearable="false"
            placeholder="11位纯数字"
            type="number"
            :maxlength="11"
          />
        </u-form-item>
        <u-form-item
          v-if="settings.banquettype.show"
          label="宴席类型"
          prop="BanquetType"
          :required="settings.banquettype.required"
        >
          <u-input
            v-model="form.BanquetType"
            type="select"
            placeholder="请选择"
            disabled
            @click="showTypePicker = true"
          />
        </u-form-item>
        <u-form-item
          v-if="settings.banquettime.show"
          label="宴席时间"
          prop="BanquetTime"
          :required="settings.banquettime.required"
        >
          <u-input
            v-model="form.BanquetTime"
            type="select"
            placeholder="请选择"
            disabled
            @click="showTimePicker = true"
          />
        </u-form-item>
        <u-form-item
          v-if="settings.banquetrequiredamount.show"
          label="数量（瓶）"
          prop="BanquetRequiredAmount"
          :disabled="id"
          :required="settings.banquetrequiredamount.required"
        >
          <u-input
            v-model="form.BanquetRequiredAmount"
            :clearable="false"
            placeholder="请输入"
            type="number"
            :maxlength="5"
            :disabled="id"
          />
        </u-form-item>
        <u-form-item
          v-if="settings.banquetdesknum.show"
          label="桌数"
          prop="BanquetDeskNum"
          :required="settings.banquetdesknum.required"
        >
          <u-input
            v-model="form.BanquetDeskNum"
            :clearable="false"
            placeholder="请输入宴席桌数"
            type="number"
            :maxlength="5"
          />
        </u-form-item>
        <u-form-item
          v-if="settings.banquetroom.show"
          label="宴席厅"
          prop="BanquetRoom"
          :required="settings.banquetroom.required"
        >
          <u-input v-model="form.BanquetRoom" :clearable="false" placeholder="宴席厅名称" />
        </u-form-item>
        <u-form-item
          v-if="settings.banquetaddress.show"
          label="宴席地址"
          prop="BanquetAddress"
          :required="settings.banquetaddress.required"
        >
          <view class="flex flex-middle">
            <u-input
              ref="addressInput"
              v-model="fullAddress"
              :clearable="false"
              placeholder="请选择"
              placeholder-class="address-placeholder"
              maxlength="150"
              style="width: 400rpx"
              disabled
              @click="getDetailInfo"
            />
            <view class="icon iconfont icon-address-user fs-32" @tap.stop="getDetailInfo" />
          </view>
        </u-form-item>
        <u-form-item
          v-if="settings.banquetremark.show"
          label="备注"
          prop="BanquetRemark"
          :required="settings.banquetremark.required"
        >
          <u-input v-model="form.BanquetRemark" :clearable="false" placeholder="请输入" maxlength="150" />
        </u-form-item>
        <u-form-item
          v-if="settings.banquetimg.show"
          label="照片"
          desc="(限3张)"
          prop="BanquetImg"
          :required="settings.banquetimg.required"
        >
          <upload v-model="form.BanquetImg" :max-length="3" size="100" multiple />
        </u-form-item>
      </u-form>
    </view>
    <view class="btn-submit flex flex-middle fs-30 text-center">
      <view class="btn active flex-1" hover-class="button-action" @tap="handleSave">
        <u-loading v-if="btnLoading" mode="flower" />
        <template v-else>提 交</template>
      </view>
    </view>
    <u-picker
      v-model="showTypePicker"
      mode="selector"
      :default-selector="[0]"
      :range="selectorObj"
      range-key="codename"
      @confirm="typePickerConfirm"
    />
    <u-picker v-model="showTimePicker" mode="time" :params="pickerParams" @confirm="timePickerConfirm" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiBanquetGetDictionnaryList,
  apiBanquetApply,
  apiBanquetOrderDetail,
  apiBanquetUpdateOrder,
  apiBanquetOrdersMenu
} from 'packages/api/banquet'
import upload from 'packages/components/upload/upload'
import subscribeMsgMixin, { noticeMixin, noticeMixin2 } from 'packages/mixins/subscribe-msg'
export default {
  components: { upload },
  mixins: [subscribeMsgMixin, noticeMixin, noticeMixin2],
  data() {
    return {
      id: '',
      btnLoading: false,
      showTypePicker: false,
      showAddressPicker: false,
      showTimePicker: false,
      loading: true,
      pickerParams: {
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: false,
        second: false
      },
      selectorObj: [],
      form: {
        activityid: '',
        BanquetName: '',
        BanquetTime: '',
        BanquetRequiredAmount: '',
        BanquetDeskNum: '',
        BanquetType: '',
        BanquetPhone: '',
        BanquetAddress: '',
        Province: 0,
        City: 0,
        Area: 0,
        Street: 0,
        Longitude: '',
        Latitude: '',
        BanquetRemark: '',
        BanquetRoom: '',
        BanquetImg: []
      },
      settings: {
        banquetname: {
          show: 1,
          required: 1
        },
        banquetphone: {
          show: 1,
          required: 1
        },
        banquettype: {
          show: 1,
          required: 0
        },
        banquettime: {
          show: 1,
          required: 1
        },
        banquetrequiredamount: {
          show: 1,
          required: 1
        },
        banquetdesknum: {
          show: 0,
          required: 0
        },
        banquetroom: {
          show: 1,
          required: 0
        },
        banquetaddress: {
          show: 1,
          required: 1
        },
        banquetremark: {
          show: 0,
          required: 0
        },
        banquetimg: {
          show: 0,
          required: 0
        }
      },
      activityid: '',
      fullAddress: ''
    }
  },
  async onLoad(options) {
    this.form.activityid = options.activityid
    this.getTypeList()
    await this.getBanquetSetting()
    uni.removeStorageSync('storeRegisterAddress')
    if (options.id) {
      this.id = options.id
      this.getOrderDetail()
      uni.setNavigationBarTitle({
        title: '报名信息编辑'
      })
    } else {
      // 报名新增订阅消息
      this.subscribeSettings = await this.initNotice(546)
      this.subscribeSettings.isopen && this.fetchNotice(7)
    }
  },
  onShow() {
    this.setAddress()
  },
  onUnload() {
    uni.removeStorageSync('storeRegisterAddress')
  },
  methods: {
    setRules() {
      const that = this
      setTimeout(() => {
        const rules = {
          BanquetName: [
            {
              required: !!that.settings.banquetname.required,
              message: '请输入姓名',
              trigger: ['blur', 'change']
            }
          ],
          BanquetPhone: [
            {
              required: !!that.settings.banquetphone.required,
              message: '请输入手机号码',
              trigger: ['blur']
            },
            {
              validator: (rule, value, callback) => {
                return this.$u.test.mobile(value)
              },
              message: '请输入正确的手机号码',
              trigger: ['blur']
            }
          ],
          BanquetType: [
            {
              required: !!that.settings.banquettype.required,
              message: '请选择宴席类型',
              trigger: ['change']
            }
          ],
          BanquetTime: [
            {
              required: !!that.settings.banquettime.required,
              message: '请选择宴席时间',
              trigger: ['change']
            }
          ],

          BanquetRequiredAmount: [
            {
              required: !!that.settings.banquetrequiredamount.required,
              message: '请输入瓶数',
              trigger: ['blur', 'change'],
              validator: (rule, value) => {
                if (that.settings.banquetrequiredamount.required && !value && value !== 0) return false
                return true
              }
            },
            {
              validator: (rule, value, callback) => {
                let v = Number(value)
                if ((value || value === 0) && (!/^\d+$/.test(value) || !(v >= 1 && v <= 10000))) return false
                return true
              },
              message: '只支持1-10000瓶',
              trigger: ['blur']
            }
          ],
          BanquetDeskNum: [
            {
              required: !!that.settings.banquetdesknum.required,
              message: '请输入宴席桌数',
              trigger: ['blur', 'change'],
              validator: (rule, value, callback) => {
                if (that.settings.banquetdesknum.required && !value && value !== 0) {
                  callback(new Error('请输入宴席桌数'))
                } else callback()
              }
            },
            {
              message: '只支持1-99999桌',
              trigger: ['blur', 'change'],
              validator: (rule, value, callback) => {
                const v = Number(value)
                if ((value || value === 0) && (!/^\d+$/.test(value) || !(v >= 1 && v <= 99999))) {
                  callback(new Error('只支持1-99999桌'))
                } else callback()
              }
            }
          ],
          BanquetAddress: [
            {
              required: !!that.settings.banquetaddress.required,
              message: '请选择地址',
              trigger: ['blur', 'change']
            },
            {
              validator: (rule, value, callback) => {
                if (!that.form.Latitude || !that.form.Longitude) {
                  // 如果没有经纬度信息，提示用户重新选择地址
                  callback(new Error('暂未录入经纬度信息，请重新选择地址'))
                } else callback()
              },
              message: '暂未录入经纬度信息，请重新选择地址',
              trigger: ['blur', 'change']
            }
          ],
          BanquetRoom: [
            {
              required: !!that.settings.banquetroom.required,
              message: '请输入宴席厅',
              trigger: ['blur', 'change']
            }
          ],
          BanquetRemark: [
            {
              required: !!that.settings.banquetremark.required,
              message: '请输入备注',
              trigger: ['blur', 'change']
            }
          ],
          BanquetImg: [
            {
              required: !!that.settings.banquetimg.required,
              message: '请上传图片',
              trigger: ['blur', 'change'],
              validator: (rule, value, callback) => {
                return that.settings.banquetimg.required ? !!(value && value.length) : true
              }
            }
          ]
        }
        this.$refs.uForm.setRules(rules)
      }, 500)
    },
    getBanquetSetting() {
      apiBanquetOrdersMenu().then(res => {
        if (this.$ck(res, true) && res.return_data.fieldjson) {
          this.settings = JSON.parse(res.return_data.fieldjson)
          this.setRules()
        }
        this.loading = false
      })
    },
    getOrderDetail() {
      apiBanquetOrderDetail({
        orderid: this.id
      }).then(res => {
        this.loading = false
        if (this.$ck(res, true)) {
          let data = res.return_data
          const {
            banquetname,
            banquettime,
            banquetrequiredamount,
            banquetdesknum,
            banquettype,
            banquetphone,
            banquetaddress,
            province,
            city,
            area,
            street,
            longitude,
            latitude,
            banquetremark,
            banquetroom,
            banquetimg
          } = data
          this.form = {
            orderid: this.id,
            activityid: this.form.activityid,
            BanquetName: banquetname,
            BanquetTime: banquettime,
            BanquetRequiredAmount: banquetrequiredamount || '',
            BanquetDeskNum: banquetdesknum || '',
            BanquetType: banquettype,
            BanquetPhone: banquetphone,
            BanquetAddress: banquetaddress,
            Province: province,
            City: city,
            Area: area,
            Street: street,
            Longitude: longitude,
            Latitude: latitude,
            BanquetRemark: banquetremark,
            BanquetRoom: banquetroom,
            BanquetImg: banquetimg ? JSON.parse(banquetimg) : []
          }
          // 处理宴席地址
          this.handleBanquetAddress(data)
        }
      })
    },
    setAddress() {
      if (!uni.getStorageSync('storeRegisterAddress')) return
      let { province, city, area, street, address, lanandlat, provinceid, cityid, areaid, streetid } =
        uni.getStorageSync('storeRegisterAddress')
      this.fullAddress = (province || '') + (city || '') + (area || '') + (street || '') + (address || '')
      this.form.BanquetAddress = address || ''
      const latlog = lanandlat ? lanandlat.split(',') : []
      this.form.Latitude = Number(latlog[0])
      this.form.Longitude = Number(latlog[1])
      this.form.Province = provinceid
      this.form.City = cityid
      this.form.Area = areaid
      this.form.Street = streetid
      // 手动触发验证
      this.$refs.addressInput.handleBlur({
        detail: {
          value: this.fullAddress
        }
      })
    },
    handleBanquetAddress(data) {
      const {
        banquetaddress,
        provincename = '',
        streetname = '',
        cityname = '',
        areaname = '',
        province: provinceid,
        city: cityid,
        area: areaid,
        street: streetid,
        longitude,
        latitude
      } = data
      const addressInfo = {
        province: provincename,
        city: cityname,
        area: areaname,
        street: streetname,
        address: banquetaddress,
        provinceid,
        cityid,
        areaid,
        streetid,
        houseNumber: '',
        lanandlat: latitude || longitude ? `${latitude},${longitude}` : ''
      }
      this.fullAddress = provincename + cityname + areaname + streetname + (banquetaddress || '')

      uni.setStorageSync('storeRegisterAddress', addressInfo)
    },
    getDetailInfo() {
      // 地图定位
      // uni.chooseLocation({
      //   success: ({ address, latitude, longitude }) => {
      //     this.form.BanquetAddress = address
      //     // 手动触发验证
      //     this.$refs.addressInput.handleBlur({
      //       detail: {
      //         value: address
      //       }
      //     })
      //   }
      // })
      // 去选择地址, 使用接口转地址
      uni.navigateTo({
        url: `/packages/src/address/address?type=3`
      })
    },
    getTypeList() {
      apiBanquetGetDictionnaryList({
        type: 'banquet'
      }).then(res => {
        if (this.$ck(res)) {
          this.selectorObj = res.return_data || []
        }
      })
    },
    typePickerConfirm(e) {
      this.form.BanquetType = this.selectorObj[e[0]].codename
    },
    timePickerConfirm(e) {
      const selectedTime = `${e.year}-${e.month}-${e.day} ${e.hour}:00:00`
      const time = new Date(selectedTime)

      // 将当前时间截断到小时，只比较到小时级别
      const now = new Date()
      now.setMinutes(0, 0, 0)

      // 校验：选择的时间不能少于当前时间（精确到小时）
      if (time < now) {
        this.$msg('宴席时间不能小于当前时间')
        return
      }

      this.form.BanquetTime = selectedTime
    },
    async editOrder() {
      let data = { ...this.form }
      delete data.activityid
      delete data.storeid
      delete data.storename
      delete data.storeno
      let res = await apiBanquetUpdateOrder(data)
      if (this.$ck(res)) {
        this.$msg('编辑成功')
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    },
    handleSave() {
      if (this.btnLoading) return
      this.$nextTick(() => {
        this.$refs.uForm.validate(async valid => {
          if (valid) {
            if (this.id) {
              this.editOrder()
              return
            }
            this.btnLoading = true
            try {
              let subscriberesult = {}
              if (this.subscribeSettings.isopen) {
                subscriberesult = await this.requestSubscribeMsg([this.noticeTempId])
              }
              await this.requestSubscribeMsg([this.noticeTempId])
              let res = await apiBanquetApply(this.form)
              if (this.$ck(res)) {
                this.reportNotice({
                  subscriberesult,
                  type: 7,
                  orderid: res.return_data
                })
                this.$msg('报名成功', { icon: 'success', mask: true })
                setTimeout(() => {
                  uni.navigateBack()
                }, 2000)
              }
            } finally {
              this.btnLoading = false
            }
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.apply {
  padding: 20rpx;
  height: 100%;
  padding-bottom: 120rpx;
  overflow-y: auto;
  .form-box {
    background: #ffffff;
    border-radius: 10rpx;
    // padding-left: 36rpx;
    padding: 0 36rpx;
  }
  .icon-address-user {
    padding: 0 20rpx;
  }
  .btn-submit {
    position: fixed;
    bottom: 0;
    left: 0;

    width: 100%;
    // background-color: #fff;
    padding: 15rpx 20rpx;
    padding-bottom: 15rpx;
    padding-bottom: calc(constant(safe-area-inset-bottom) + 15rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 15rpx);
    box-sizing: border-box;
    z-index: 2;
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
