<template>
  <view class="gift-registration-form" :class="{ disabled: disabled }">
    <view v-if="formFields && formFields.length" class="form-box">
      <template v-for="(field, index) in formFields">
        <view v-if="!shouldHideMediaField(field)" :key="index" class="collect-group">
          <!-- 单行文本 -->
          <template v-if="field.componenttype === 'text'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control text-control">
              <input
                :value="localFormData[field.componentid]"
                type="text"
                class="collect-input"
                :maxlength="field.maxlength"
                placeholder-class="placeholder"
                :placeholder="getPlaceholder(field)"
                :disabled="disabled"
                @input="updateFormData(field.componentid, $event.detail.value)"
              />
              <text v-if="field.maxlength && !disabled" class="char-count">
                {{ getCharCount(field.componentid) }}/{{ field.maxlength }}
              </text>
            </view>
          </template>

          <!-- 多行文本 -->
          <template v-else-if="field.componenttype === 'textarea'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control textarea-control" :class="field.maxlength ? 'textarea-control-maxlength' : ''">
              <textarea
                :value="localFormData[field.componentid]"
                :placeholder="getPlaceholder(field)"
                :maxlength="field.maxlength"
                class="collect-input textarea-input"
                placeholder-class="placeholder"
                :disabled="disabled"
                @input="updateFormData(field.componentid, $event.detail.value)"
              />
              <text v-if="field.maxlength && !disabled" class="char-count textarea-count mr-20">
                {{ getCharCount(field.componentid) }}/{{ field.maxlength }}
              </text>
            </view>
          </template>

          <!-- 姓名 -->
          <template v-else-if="field.componenttype === 'username'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control text-control">
              <input
                :value="localFormData[field.componentid]"
                type="text"
                class="collect-input flex-1"
                :maxlength="usernameMaxlength(field)"
                placeholder-class="placeholder"
                :placeholder="getPlaceholder(field)"
                :disabled="disabled"
                @input="updateFormData(field.componentid, $event.detail.value)"
              />
              <text v-if="!disabled" class="char-count">
                {{ getCharCount(field.componentid) }}/{{ usernameMaxlength(field) }}
              </text>
            </view>
          </template>

          <!-- 手机号 -->
          <template v-else-if="field.componenttype === 'mobile'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control text-control phone-control-wrapper">
              <template v-if="useEditablePhoneInput(field)">
                <input
                  :value="localFormData[field.componentid]"
                  type="number"
                  class="collect-input flex-1"
                  :maxlength="11"
                  placeholder-class="placeholder"
                  :placeholder="getPlaceholder(field)"
                  :disabled="disabled"
                  @input="updateFormData(field.componentid, $event.detail.value)"
                />
              </template>
              <template v-else>
                <input
                  :value="localFormData[field.componentid]"
                  :placeholder="getPlaceholder(field)"
                  disabled
                  :maxlength="11"
                  class="collect-input flex-1"
                  placeholder-class="placeholder"
                />
                <button
                  v-if="field.validate || field.isdefault"
                  plain="true"
                  open-type="getPhoneNumber"
                  :phone-number-no-quota-toast="false"
                  class="get-phone-btn address-btn shrink-0"
                  @getphonenumber="handleGetPhonenumber($event, field.componentid)"
                >
                  <text class="fs-24">微信授权手机号</text>
                </button>
              </template>
            </view>
            <!-- #ifdef H5 -->
            <view v-if="needSmsVerify && field.validate !== 0 && !disabled" class="collect-group">
              <view class="collect-label">验证码</view>
              <view class="collect-control text-control code-control">
                <input
                  v-model.trim="smsCode"
                  type="number"
                  class="collect-input flex-1"
                  placeholder="请输入验证码"
                  placeholder-class="placeholder"
                  :disabled="disabled"
                />
                <view v-if="codeCountDown <= 0" class="code-button shrink-0" @tap="handleSendCode">获取验证码</view>
                <view v-else class="code-button code-button-disabled shrink-0">{{ codeCountDown }}秒后重试</view>
              </view>
            </view>
            <!-- #endif -->
          </template>

          <!-- 地址 -->
          <template v-else-if="field.componenttype === 'location'">
            <template v-if="field.validate === 0">
              <view class="collect-label">
                <text v-if="field.required" class="required">*</text>
                {{ field.fieldname }}
              </view>
              <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
              <view class="collect-control address-picker" @click="handleOpenAddressPicker(field.componentid)">
                <view class="picker-value flex-1 c-3" :class="{ 'c-6': !getRegionDisplay(field.componentid) }">
                  {{ getRegionDisplay(field.componentid) || (disabled ? '-' : '请选择省市区') }}
                </view>
              </view>
              <address-picker
                :value="showAddressPicker[field.componentid] || false"
                :column-count="3"
                :address-layer="3"
                :default-regon="getDefaultRegion(field.componentid)"
                @input="val => handleAddressPickerInput(val, field.componentid)"
                @setAddress="addressList => handleAddressPickerConfirm(addressList, field.componentid)"
              />
              <view class="collect-label mt-20">
                <text v-if="field.required" class="required">*</text>
                详细地址
              </view>
              <view class="collect-control text-control">
                <input
                  :value="getAddressDetail(field.componentid)"
                  type="text"
                  class="collect-input flex-1"
                  :maxlength="field.maxlength"
                  placeholder-class="placeholder"
                  :placeholder="disabled ? '-' : '请输入详细地址'"
                  :disabled="disabled"
                  @input="handleAddressDetailInput($event, field.componentid)"
                />
                <text v-if="field.maxlength && !disabled" class="char-count">
                  {{ getAddressDetailCharCount(field.componentid) }}/{{ field.maxlength }}
                </text>
              </view>
            </template>
            <template v-else>
              <view class="collect-label">
                <text v-if="field.required" class="required">*</text>
                {{ field.fieldname }}
              </view>
              <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
              <view class="collect-control address-picker" @click="handleChooseAddress(field.componentid)">
                <view
                  class="picker-value flex-1 c-3 ellipsis-2"
                  :class="{ 'c-6': !getAddressDetailFull(field.componentid) }"
                >
                  {{ getAddressDetailFull(field.componentid) || getPlaceholder(field) }}
                </view>
                <view
                  v-if="!disabled"
                  class="mdfont icon-mdfont-address address-btn"
                  @click.stop="handleChooseAddress(field.componentid)"
                >
                  <text class="fs-24 ml-10">获取定位</text>
                </view>
              </view>
            </template>
          </template>

          <!-- 日期（参照 warranty-form） -->
          <template v-else-if="field.componenttype === 'date'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control date-control">
              <picker
                class="date-picker"
                mode="date"
                :value="localFormData[field.componentid]"
                :end="dateEnd"
                :disabled="disabled"
                @change="onDatePickerChange($event, field.componentid)"
              >
                <view class="picker flex flex-middle justify-between">
                  <view
                    class="flex-1 ellipsis-2 tx-l c-2 picker-value"
                    :class="{ 'c-2': !localFormData[field.componentid] }"
                  >
                    {{ localFormData[field.componentid] || getPlaceholder(field) }}
                  </view>
                  <view v-if="!disabled" class="picker-arrow iconfont icongengduo fs-20 shrink-0" />
                </view>
              </picker>
            </view>
          </template>

          <!-- 单选项 -->
          <template v-else-if="field.componenttype === 'radio' && field.options && field.options.length > 0">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control radio-control" :class="{ 'is-disabled': disabled }">
              <u-radio-group
                :wrap="true"
                :value="localFormData[field.componentid]"
                @input="updateFormData(field.componentid, $event)"
              >
                <u-radio
                  v-for="(option, optIndex) in field.options"
                  :key="optIndex"
                  :name="option.label"
                  :active-color="verifyColor"
                >
                  <view class="option-label w-600">{{ option.label }}</view>
                </u-radio>
              </u-radio-group>
            </view>
          </template>

          <!-- 多选项（与 warranty-form 一致：直接使用 field.options） -->
          <template v-else-if="field.componenttype === 'checkbox' && field.options && field.options.length > 0">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control checkbox-control" :class="{ 'is-disabled': disabled }">
              <u-checkbox-group :wrap="true" @change="e => handleCheckboxChange(e, field.componentid, field.options)">
                <u-checkbox
                  v-for="(option, optIndex) in field.options"
                  :key="optIndex"
                  v-model="option.checked"
                  :name="option.label"
                  :active-color="verifyColor"
                >
                  <view class="option-label w-600">{{ option.label }}</view>
                </u-checkbox>
              </u-checkbox-group>
            </view>
          </template>

          <!-- 图片 -->
          <template v-else-if="field.componenttype === 'image'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control image-control">
              <!-- disabled 时按 record-detail 方式展示：图片列表可预览 -->
              <view v-if="disabled" class="image-list">
                <template v-if="getImageList(field.componentid).length > 0">
                  <image
                    v-for="(img, imgIndex) in getImageList(field.componentid)"
                    :key="imgIndex"
                    class="image-item"
                    :src="toHttpsUrl(img)"
                    mode="aspectFill"
                    @tap="() => previewImage(img, getImageList(field.componentid))"
                  />
                </template>
                <view v-else>--</view>
              </view>
              <upload
                v-else
                multiple
                :value="localFormData[field.componentid]"
                :max-length="field.maximagecount || 3"
                size="200"
                :delete-size="32"
                :is-replace="false"
                :source-type="['camera']"
                :modify="true"
                @input="updateFormData(field.componentid, $event)"
              />
            </view>
          </template>

          <!-- 视频 -->
          <template v-else-if="field.componenttype === 'video'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="collect-control video-control">
              <!-- disabled 时按 record-detail 方式展示：单个 video 带 controls，URL 正常拼接 http/域名 -->
              <view v-if="disabled">
                <video
                  v-if="localFormData[field.componentid]"
                  :src="toHttpsUrl(localFormData[field.componentid])"
                  controls
                  class="detail-video"
                />
                <view v-else>--</view>
              </view>
              <video-upload
                v-else
                :value="localFormData[field.componentid]"
                :modify="true"
                @input="updateFormData(field.componentid, $event)"
              />
            </view>
          </template>

          <!-- 礼品 -->
          <template v-else-if="field.componenttype === 'gift'">
            <view class="collect-label">
              <text v-if="field.required" class="required">*</text>
              {{ field.fieldname }}
            </view>
            <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
            <view class="gift-control">
              <gift-selector
                :ref="`field_${field.componentid}`"
                :value="localFormData[field.componentid]"
                :options="field.options || []"
                :support-multiple="!!field.supportmultiple"
                :active-color="verifyColor"
                :disabled="disabled"
                @input="updateFormData(field.componentid, $event)"
              />
            </view>
          </template>
        </view>
      </template>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" @close="onVerifyFail" />
    <!-- #endif -->
  </view>
</template>

<script>
import { deepClone } from 'packages/utils/function'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import upload from 'packages/components/upload/upload'
import VideoUpload from 'packages/components/video-upload/video-upload.vue'
import GiftSelector from './gift-selector.vue'
import AddressPicker from 'packages/components/address-picker/address-picker.vue'
import { getUserLocation, getApiLocationInfo } from 'packages/utils/location-mp.js'
// #ifdef MP-WEIXIN
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import { getMobileNumber } from 'packages/utils/function'
// #endif
// #ifdef H5
import { apigetaddresscode } from 'packages/api/address.js'
import { LOCATION_MSG_H5, MOCK_LAT, MOCK_LNG } from '../mixins'
import { apiSendSmsVerifyCode } from 'packages/api/gift-registration'
// #ifdef H5-ACT
import { getQuery } from 'packages/utils/function'
// #endif
// #endif

export default {
  components: {
    upload,
    VideoUpload,
    GiftSelector,
    AddressPicker,
    // #ifdef MP-WEIXIN
    CommonPopup
    // #endif
  },
  props: {
    formFields: {
      type: Array,
      default: () => []
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    verifyColor: {
      type: String,
      default: '#FFA200'
    },
    // #ifdef H5
    openId: { type: String, default: '' },
    memberlogin: { type: String, default: '' },
    activityId: { type: Number, default: 0 }
    // #endif
  },
  data() {
    return {
      localFormData: {},
      showAddressPicker: {},
      dateEnd: '',
      /** 防止重复调用地址获取 */
      flag: false,
      // #ifdef H5
      smsCode: '',
      codeCountDown: 0,
      codeTimer: null,
      // #endif
      showVerifyFail: false,
      canGetPhoneNumber: true
    }
  },
  computed: {
    // #ifdef H5
    /** H5 且存在开启验证的手机字段时需展示验证码（参照 collect-dialog IsCheckPhone && IsCheckMessage） */
    needSmsVerify() {
      return this.formFields && this.formFields.some(f => f && f.componenttype === 'mobile' && f.validate !== 0)
    }
    // #endif
  },
  created() {
    this.dateEnd = dayjs().format('YYYY-MM-DD')
  },
  beforeDestroy() {
    // #ifdef H5
    if (this.codeTimer) {
      clearInterval(this.codeTimer)
      this.codeTimer = null
    }
    // #endif
  },
  watch: {
    formData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal || {}).length > 0) {
          this.localFormData = deepClone(newVal || {})
          this.syncCheckboxChecked()
        }
      },
      immediate: true,
      deep: true
    },
    formFields: {
      handler(fields) {
        if (!fields || !fields.length) return
        if (Object.keys(this.localFormData).length === 0) {
          this.initFormDataFromFields()
          // 判断是否有地址组件（location 类型且不是普通输入框）
          const hasLocation = fields.some(f => f.componenttype === 'location' && f.validate !== 0)
          if (hasLocation && !this.flag) {
            this.flag = true
            const locationField = fields.find(f => f.componenttype === 'location' && f.validate !== 0)
            if (locationField) {
              this.handleChooseAddress(locationField.componentid)
            }
          }
        } else {
          this.syncCheckboxChecked()
        }
      },
      immediate: true
    }
  },
  methods: {
    getPlaceholder(field, isValidation = false) {
      if (this.disabled) return ''
      const fieldName = field.fieldname || ''
      const type = field.componenttype
      switch (type) {
        case 'image':
        case 'video':
          return `请拍摄${fieldName}`
        case 'text':
        case 'textarea':
        case 'username':
        case 'mobile':
          // 微信环境下 validate 不为 0 时支持授权获取手机号，提示「请获取」；否则「请输入」
          if (field.validate === 1 && type === 'mobile') {
            return this.canGetPhoneNumber ? `请获取${fieldName}` : `请输入${fieldName}`
          }
          return `请输入${fieldName}`
        case 'location':
          return field.validate === 0 ? `请输入${fieldName}` : isValidation ? `请获取${fieldName}` : '请点击获取定位'
        case 'date':
        case 'radio':
        case 'checkbox':
          return `请选择${fieldName}`
        case 'gift':
          return `请选择${fieldName}`
        default:
          return `请输入${fieldName}`
      }
    },
    initFormDataFromFields() {
      const data = {}
      this.formFields.forEach(field => {
        const key = field.componentid
        if (!key) return
        if (field.componenttype === 'location') {
          data[key] = {
            provinceid: '',
            cityid: '',
            areaid: '',
            provincename: '',
            cityname: '',
            areaname: '',
            address: '',
            longitude: 0,
            latitude: 0,
            fulladdress: ''
          }
        } else if (field.componenttype === 'checkbox') {
          data[key] = field.value && Array.isArray(field.value) ? [...field.value] : []
        } else {
          const isArrayType =
            field.componenttype === 'image' || (field.componenttype === 'gift' && field.supportmultiple)
          data[key] = isArrayType ? field.value || [] : field.value || field.defaultvalue || ''
        }
      })
      this.localFormData = deepClone(data)
      this.syncCheckboxChecked()
    },
    syncCheckboxChecked() {
      if (!this.formFields || !this.formFields.length) return
      this.formFields.forEach(field => {
        if (field.componenttype !== 'checkbox' || !field.options || !field.options.length) return
        const selectedArr = Array.isArray(this.localFormData[field.componentid])
          ? this.localFormData[field.componentid]
          : []
        field.options.forEach(opt =>
          this.$set(opt, 'checked', selectedArr.includes(opt.label) || selectedArr.includes(opt.value))
        )
      })
    },
    updateFormData(key, value) {
      if (this.disabled) return
      this.$set(this.localFormData, key, value)
    },
    /** disabled 时图片/视频无值则整块不显示 */
    shouldHideMediaField(field) {
      if (!this.disabled) return false
      if (field.componenttype === 'image') {
        return this.getImageList(field.componentid).length === 0
      }
      if (field.componenttype === 'video') {
        return !this.localFormData[field.componentid]
      }
      return false
    },
    /** 图片/视频 URL 处理：协议相对(//)或 http 转 https */
    toHttpsUrl(url) {
      return url ? String(url).replace(/^(http:)?(\/\/)/, 'https://') : ''
    },
    // 获取图片列表（用于 disabled 时展示，与 record-detail 一致）
    getImageList(componentId) {
      const val = this.localFormData[componentId]
      if (!val) return []
      return Array.isArray(val) ? val : [val]
    },
    // 预览图片（与 record-detail 一致，URL 做 http 拼接处理）
    previewImage(current, urls) {
      const list = Array.isArray(urls) ? urls : [urls]
      uni.previewImage({
        current: this.toHttpsUrl(current),
        urls: list.map(u => this.toHttpsUrl(u))
      })
    },
    // 获取完整的表单数据（与 warranty-form 一致）
    getFormData() {
      this.formFields.forEach(field => {
        if (field.componenttype === 'checkbox') {
          const value = Array.isArray(field.options) ? field.options.filter(o => o.checked).map(o => o.label) : []
          this.$set(this.localFormData, field.componentid, value)
        } else if (field.componenttype === 'gift') {
          const ref = this.$refs[`field_${field.componentid}`]
          const target = Array.isArray(ref) ? ref[0] : ref
          if (target && target.getValue) {
            const value = target.getValue()
            this.$set(this.localFormData, field.componentid, value)
          }
        }
      })
      return deepClone(this.localFormData)
    },
    // 校验表单（与 warranty-form 一致，返回 Promise）
    validate() {
      return new Promise((resolve, reject) => {
        const formData = this.getFormData()
        const isValid = this.validateForm(formData)
        if (isValid) resolve(true)
        else reject(false)
      })
    },
    validateForm(formData) {
      for (const field of this.formFields) {
        if (!field || !field.componentid) continue
        if (field.required) {
          const value = formData[field.componentid]
          let isEmpty = false
          if (field.componenttype === 'location') {
            const addr = value && typeof value === 'object' && (value.fulladdress || value.address)
            isEmpty = !addr || String(addr).trim() === ''
          } else if (Array.isArray(value)) {
            isEmpty = value.length === 0
          } else if (typeof value === 'string') {
            isEmpty = !value || value.trim() === ''
          } else {
            isEmpty = !value
          }
          if (isEmpty) {
            this.$msg(this.getPlaceholder(field, true))
            return false
          }
        }
        if (field.componenttype === 'mobile') {
          const mobile = formData[field.componentid]
          if (mobile) {
            const mobileReg = /^1[3-9]\d{9}$/
            if (!mobileReg.test(String(mobile))) {
              this.$msg('请输入正确的手机号')
              return false
            }
          }
        }
      }
      // #ifdef H5
      if (this.needSmsVerify) {
        if (!this.smsCode || !String(this.smsCode).trim()) {
          this.$msg('请输入验证码！')
          return false
        }
      }
      // #endif
      return true
    },
    getActionText(componentType) {
      const actionMap = {
        image: '上传',
        video: '上传',
        gift: '选择',
        date: '选择',
        radio: '选择',
        checkbox: '选择',
        location: '获取',
        default: '输入'
      }
      return actionMap[componentType] || actionMap.default
    },
    // #ifdef H5
    /** 获取验证码（参照 collect-dialog handleCode） */
    handleSendCode() {
      const mobileField = this.formFields && this.formFields.find(f => f && f.componenttype === 'mobile')
      const mobile = mobileField ? this.localFormData[mobileField.componentid] : ''
      if (!mobile) {
        return this.$msg('请先填写手机号')
      }
      if (!/^1\d{10}$/.test(String(mobile))) {
        return this.$msg('请填写正确的手机号')
      }
      apiSendSmsVerifyCode({
        mobile: String(mobile).trim(),
        OpenID: this.openId || '',
        m: this.memberlogin || ''
      })
        .then(res => {
          if (this.$ck && this.$ck(res)) {
            this.$msg('验证码发送成功', { icon: 'success' })
            let time = 60
            this.codeCountDown = time
            this.codeTimer = setInterval(() => {
              time--
              this.codeCountDown = time
              if (time <= 0) {
                clearInterval(this.codeTimer)
                this.codeTimer = null
              }
            }, 1000)
          }
        })
        .catch(err => {
          this.codeCountDown = 0
          this.$msg(err && err.return_msg ? err.return_msg : '验证码发送失败')
        })
    },
    getSmsCode() {
      return this.smsCode || ''
    },
    getNeedSmsVerify() {
      return this.needSmsVerify
    },
    /** 供父组件提交时获取手机号（H5 验证码校验用） */
    getMobileForVerify() {
      const mobileField = this.formFields && this.formFields.find(f => f && f.componenttype === 'mobile')
      const mobile = mobileField ? this.localFormData[mobileField.componentid] : ''
      return mobile ? String(mobile).trim() : ''
    },
    // #endif
    // 构建提交数据（与 warranty-form 一致，返回 FormData 数组）
    buildSubmitData() {
      const formData = this.getFormData()
      return this.formFields.map(field => ({
        ComponentID: field.componentid,
        ComponentType: field.componenttype,
        FieldName: field.fieldname,
        FieldValue: this.formatFieldValue(field, formData[field.componentid])
      }))
    },
    formatFieldValue(field, value) {
      if (!value && value !== 0) return ''
      const type = field.componenttype
      if (type === 'gift') {
        const serializeGift = gift => {
          if (!gift) return null
          const giftid = Number(gift.giftid ?? 0)
          const giftname = gift.giftname || ''
          const giftno = gift.giftno || ''
          if (!giftid && !giftname && !giftno) return null
          return { GiftID: giftid, GiftName: giftname, GiftNo: giftno }
        }
        const findGiftFromOptions = rawValue => {
          if (rawValue === undefined || rawValue === null || rawValue === '') return null
          const options = field.options || []
          const matched = options.find(
            opt => String(opt.value) === String(rawValue) || String(opt.giftid) === String(rawValue)
          )
          return serializeGift(matched)
        }
        if (Array.isArray(value)) {
          const giftArray = value
            .map(v => (typeof v === 'object' ? serializeGift(v) : findGiftFromOptions(v)))
            .filter(Boolean)
          return JSON.stringify(giftArray)
        }
        if (typeof value === 'object') {
          const payload = serializeGift(value)
          return payload ? JSON.stringify([payload]) : ''
        }
        const payload = findGiftFromOptions(value)
        if (payload) {
          return JSON.stringify([payload])
        }
      }
      if (type === 'image' || type === 'checkbox') {
        if (Array.isArray(value)) return JSON.stringify(value)
      }
      if (type === 'video') {
        return value ? JSON.stringify([value]) : ''
      }
      if (type === 'location' && value && typeof value === 'object') {
        return JSON.stringify(value)
      }
      return String(value)
    },
    // 获取用户当前地址：小程序与 warranty-form 一致；H5 使用微信 JSSDK 或 mock 坐标 + 接口逆解析
    handleChooseAddress: debounce(function (componentId) {
      if (this.disabled) return
      ;(async () => {
        try {
          let resData = null
          // #ifdef MP-WEIXIN
          resData = await getUserLocation({
            skipChoose: false, // 是否用地图选点
            useTencentMapAPI: false // 是否用腾讯地图逆解析
          })
          // #endif
          // #ifdef H5
          let Location = null
          if (process.env.NODE_ENV === 'development') {
            Location = { latitude: MOCK_LAT, longitude: MOCK_LNG }
          } else if (this.$wechat && typeof this.$wechat.getLocation === 'function') {
            Location = await new Promise(resolve => {
              this.$loading.show('获取地理位置中')
              this.$wechat.getLocation({
                type: 'gcj02',
                success: res => {
                  resolve({ latitude: res.latitude, longitude: res.longitude })
                },
                fail: () => resolve(null),
                cancel: () => resolve(null),
                complete: () => {
                  this.$loading.hide()
                }
              })
            })
          }
          if (!Location || !Location.latitude || !Location.longitude) {
            if (process.env.NODE_ENV !== 'development') {
              this.$msg(LOCATION_MSG_H5)
            }
            return
          }
          resData = await getApiLocationInfo({
            latitude: Location.latitude,
            longitude: Location.longitude
          })
          // #endif
          if (resData) {
            this.updateFormData(componentId, resData)
          }
        } catch (error) {
          console.error('获取地址失败：', error)
        }
      })()
    }, 300),
    getRegionDisplay(componentId) {
      const data = this.localFormData[componentId]
      if (!data || typeof data !== 'object') return ''
      const { provincename, cityname, areaname } = data
      return [provincename, cityname, areaname].filter(Boolean).join('')
    },
    handleOpenAddressPicker(componentId) {
      if (this.disabled) return
      this.$set(this.showAddressPicker, componentId, true)
    },
    handleAddressPickerInput(val, componentId) {
      this.$set(this.showAddressPicker, componentId, val)
    },
    // 处理地址选择器确认（用于 location 类型且 validate 为 0），与 warranty-form 一致
    handleAddressPickerConfirm(addressList, componentId) {
      if (this.disabled) return
      const [
        { value: provinceid, label: provincename } = {},
        { value: cityid, label: cityname } = {},
        { value: areaid, label: areaname } = {}
      ] = addressList
      const regionData = this.localFormData[componentId] || {}
      this.updateFormData(componentId, {
        provinceid,
        cityid,
        areaid,
        provincename,
        cityname,
        areaname,
        address: regionData.address
      })
      this.$set(this.showAddressPicker, componentId, false)
    },
    getDefaultRegion(componentId) {
      const regionData = this.localFormData[componentId]
      if (regionData && (regionData.provinceid || regionData.cityid || regionData.areaid)) {
        return [regionData.provinceid, regionData.cityid, regionData.areaid].filter(Boolean)
      }
      return []
    },
    handleAddressDetailInput(e, componentId) {
      if (this.disabled) return
      const address = e.detail && e.detail.value ? e.detail.value.trim() : ''
      const regionData = this.localFormData[componentId] || {}
      this.updateFormData(componentId, {
        ...regionData,
        address
      })
    },
    getAddressDetail(componentId) {
      const data = this.localFormData[componentId]
      return data && typeof data === 'object' && data.address ? data.address : ''
    },
    getFullAddress(data) {
      if (!data) return ''
      const { address, streetname, areaname, cityname, provincename } = data
      const replaceField = address?.includes(streetname) ? streetname : areaname || cityname || provincename
      const locAddress = address ? address.split(replaceField) : []
      const lastAddress = locAddress.length && locAddress[locAddress.length - 1]
      return `${provincename || ''}${cityname || ''}${areaname || ''}${streetname || ''}${lastAddress || ''}`
    },
    getAddressDetailFull(componentId) {
      const data = this.localFormData[componentId]
      return this.getFullAddress(data)
    },
    getAddressDetailCharCount(componentId) {
      const address = this.getAddressDetail(componentId)
      return address ? String(address).length : 0
    },
    handleRadioChange(e, componentId) {
      if (this.disabled) return
      const value = e.detail !== undefined ? e.detail : e
      this.updateFormData(componentId, value)
    },
    onDatePickerChange(e, componentId) {
      if (this.disabled) return
      const value = e.detail && e.detail.value !== undefined ? e.detail.value : e.detail
      this.updateFormData(componentId, value)
    },
    handleCheckboxChange(e, fieldId, options) {
      if (this.disabled) return
      // 与 warranty-form 一致：优先从事件取选中值，避免 v-model 未及时更新
      const selectedValues =
        e && e.detail && Array.isArray(e.detail.value)
          ? e.detail.value
          : Array.isArray(e)
          ? e
          : Array.isArray(options)
          ? options.filter(o => o.checked).map(o => o.label)
          : []
      this.updateFormData(fieldId, selectedValues)
      if (Array.isArray(options)) {
        options.forEach(opt =>
          this.$set(opt, 'checked', selectedValues.includes(opt.label) || selectedValues.includes(opt.value))
        )
      }
    },
    // #ifdef MP-WEIXIN
    async handleGetPhonenumber(e, componentId) {
      const { errMsg, code, errno } = e.detail || {}
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) {
        try {
          const result = await getMobileNumber({ mobilecode: code })
          if (result && result.phonenumber) {
            this.updateFormData(componentId, result.phonenumber)
          }
        } catch (error) {
          this.showVerifyFail = true
        }
      }
    },
    onVerifyFail() {
      this.showVerifyFail = false
      this.canGetPhoneNumber = false
    },
    // #endif
    getCharCount(componentId) {
      const value = this.localFormData[componentId]
      return value ? String(value).length : 0
    },
    /** 是否使用可输入的手机号框：H5 下一律可输入（无 getPhoneNumber 能力），小程序下按配置与授权能力 */
    useEditablePhoneInput(field) {
      // #ifdef H5
      return true
      // #endif
      // #ifndef H5
      return field.validate === 0 || !this.canGetPhoneNumber
      // #endif
    },
    // 姓名字段最大长度，默认 20
    usernameMaxlength(field) {
      return field.maxlength || 20
    }
  }
}
</script>

<style lang="scss" scoped>
.gift-registration-form {
  position: relative;

  .form-box {
    padding: 20rpx 30rpx;
    border-radius: 20rpx;
    background-color: #fff;
  }

  .collect-group {
    padding: 30rpx 0 10rpx;

    &:first-child {
      padding-top: 10rpx;
    }

    .collect-label {
      color: #222;
      font-size: 30rpx;
      margin-bottom: 10rpx;
      font-weight: bold;

      .required {
        color: #ff6955;
        margin-right: 4rpx;
      }
    }

    .field-desc {
      font-size: 24rpx;
      color: #aaaaaa;
      margin-bottom: 10rpx;
    }

    .collect-control {
      position: relative;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding-left: 0;
      background: transparent;
      width: 100%;

      &.text-control {
        display: flex;
        align-items: center;
        gap: 20rpx;
        border: 1rpx solid #dddddd;
        border-radius: 10rpx;
        padding: 0 20rpx;
        box-sizing: border-box;

        .collect-input {
          flex: 1;
          border: none;
          padding: 0;
          border-radius: 0;
        }
      }

      &.textarea-control {
        position: relative;
        align-items: flex-start;

        .collect-input {
          width: 100%;
        }

        .char-count {
          position: absolute;
          bottom: 10rpx;
          right: 0;
        }
      }

      .textarea-control-maxlength {
        padding-bottom: 40rpx;
      }

      .collect-input {
        font-size: 30rpx;
        color: #222;
        background: transparent;
        text-align: left;
        height: 80rpx;
        line-height: 80rpx;
        padding: 0 20rpx;
        box-sizing: border-box;
        border: 1rpx solid #dddddd;
        border-radius: 10rpx;

        /* 单行文本/姓名：边框在父级 .text-control 上，输入框无边框 */
        .text-control & {
          border: none;
          padding: 0;
          border-radius: 0;
        }

        &.textarea-input {
          height: 200rpx;
          padding: 10rpx 15rpx 20rpx;
          line-height: 1.5;
        }
      }

      .placeholder {
        color: #aaaaaa;
      }

      .char-count {
        font-size: 24rpx;
        color: #999;
        white-space: nowrap;
        flex-shrink: 0;
      }

      &.date-control {
        border: 1rpx solid #dddddd;
        border-radius: 10rpx;
        padding: 0 20rpx;
        box-sizing: border-box;
        min-height: 80rpx;

        .date-picker {
          width: 100%;
        }
      }

      .picker {
        position: relative;
        z-index: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .picker-value {
          font-size: 28rpx;
          color: #222222;
        }

        .picker-arrow {
          color: #666666;
        }
      }

      /* 单选/多选（参照 gift-selector：wrap + option-label） */
      &.radio-control,
      &.checkbox-control {
        background: transparent;
        padding: 0;
        width: 100%;
      }

      /* disabled 时通过 pointer-events 禁止点击，不使用 :disabled */
      &.radio-control.is-disabled,
      &.checkbox-control.is-disabled {
        pointer-events: none;
      }

      &.code-control {
        width: 100%;
        gap: 20rpx;

        .code-button {
          flex-shrink: 0;
          padding: 0;
          font-size: 24rpx;
          color: #0aa6ff;
          line-height: 1.5;

          &.code-button-disabled {
            color: #999;
          }
        }
      }

      &.phone-control-wrapper {
        width: 100%;
        gap: 20rpx;

        .get-phone-btn {
          width: auto;
          line-height: 1.5;
          height: auto;
          padding: 0;
          margin: 0;
          font-size: 24rpx;
          color: #0aa6ff;
          border: none;
          background: transparent;

          &::after {
            border: none;
          }
        }
      }

      &.address-picker {
        position: relative;
        z-index: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10rpx 20rpx;
        box-sizing: border-box;
        border: 1rpx solid #dddddd;
        border-radius: 10rpx;
        min-height: 80rpx;
        cursor: pointer;

        .picker-value {
          font-size: 30rpx;
          word-break: break-all;
        }
      }

      .address-btn {
        color: #0aa6ff;
      }

      &.image-control,
      &.video-control {
        background: transparent;
        margin: 10rpx 0 20rpx;
        width: 100%;
      }

      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;

        .image-item {
          width: 127rpx;
          height: 127rpx;
          border-radius: 8rpx;
        }
      }

      .detail-video {
        width: 100%;
        max-width: 100%;
      }

      &.video-control {
        display: block;
        ::v-deep .video-upload {
          display: block;
          width: 100%;
        }
      }

      &.gift-control {
        background: transparent;
        padding: 0;
        width: 100%;
      }
    }
  }
} 

.c-6 {
  color: #999 !important;
} 
.option-label {
  padding-top: 14rpx;
  padding-bottom: 14rpx;
  width: 600rpx;
}
.disabled {
  .text-control, .date-control, .address-picker, .textarea-control {
    background: #f5f5f5 !important;
  }
}
</style>
