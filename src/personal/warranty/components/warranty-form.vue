<template>
  <view class="warranty-form" :class="{ disabled: disabled }">
    <view class="fw-bold fs-32 mt-20 ml-20">{{formTitle}}</view>
    <view v-if="formFields && formFields.length" class="form-box">
      <view v-for="(field, index) in formFields" :key="index">
        <!-- 单行文本 -->
        <info-cell
          v-if="field.componenttype === 'text'"
          :verify-color="'#ffa200'"
          is-middle
          is-input
          :is-needed="field.required"
          cell-style="padding-right:0;"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <view slot="right" class="flex flex-middle c-3">
            <input
              v-model.trim="formData[field.componentid]"
              type="text"
              class="input flex-1"
              :maxlength="field.maxlength"
              :disabled="disabled"
              placeholder-class="placeholder"
              :placeholder="getPlaceholder(field)"
            />
            <text v-if="field.maxlength" class="char-count">
              {{ getCharCount(field.componentid) }}/{{ field.maxlength }}
            </text>
          </view>
        </info-cell>

        <!-- 多行文本 -->
        <info-cell
          v-if="field.componenttype === 'textarea'"
          :verify-color="'#ffa200'"
          is-input
          cell-style="padding-top: 30rpx"
          :is-needed="field.required"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <view slot="right">
            <textarea
              v-model="formData[field.componentid]"
              :placeholder="getPlaceholder(field)"
              :maxlength="field.maxlength"
              :disabled="disabled"
              class="textarea"
            />
            <text v-if="field.maxlength" class="char-count textarea-count mb-20">
              {{ getCharCount(field.componentid) }}/{{ field.maxlength }}
            </text>
          </view>
        </info-cell>

        <!-- 姓名 -->
        <info-cell
          v-if="field.componenttype === 'username'"
          :verify-color="'#ffa200'"
          is-middle
          is-input
          :is-needed="field.required"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <input
            slot="right"
            v-model.trim="formData[field.componentid]"
            type="text"
            class="input"
            :maxlength="field.maxlength || 20"
            :disabled="disabled"
            placeholder-class="placeholder"
            :placeholder="getPlaceholder(field)"
          />
          <text v-if="field.maxlength" class="char-count textarea-count mb-20">
            {{ getCharCount(field.componentid) }}/{{ field.maxlength }}
          </text>
        </info-cell>

        <!-- 手机号 -->
        <info-cell
          v-if="field.componenttype === 'mobile'"
          :verify-color="'#ffa200'"
          is-middle
          :is-needed="field.required"
          :is-input="field.validate === 0 || !canGetPhoneNumber"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <!-- validate 为 0 或 次数不足需手输：使用可编辑输入框 -->
          <input
            v-if="field.validate === 0 || !canGetPhoneNumber"
            slot="right"
            v-model.trim="formData[field.componentid]"
            type="number"
            class="input"
            :maxlength="11"
            :disabled="disabled"
            placeholder-class="placeholder"
            :placeholder="getPlaceholder(field)"
          />
          <!-- 否则使用一键获取手机号 -->
          <view v-else slot="right" class="flex flex-middle c-3 phone-control-wrapper">
            <input
              :value="formData[field.componentid]"
              :placeholder="getPlaceholder(field)"
              disabled
              :maxlength="11"
              class="flex-1 input"
              placeholder-class="placeholder"
            />
            <button
              v-if="field.supportphoneverify || field.isdefault"
              plain="true"
              open-type="getPhoneNumber"
              :phone-number-no-quota-toast="false"
              class="get-phone-btn shrink-0"
              @getphonenumber="handleGetPhonenumber($event, field.componentid)"
            >
              微信授权手机号
            </button>
          </view>
        </info-cell>

        <!-- 地址 -->
        <view v-if="field.componenttype === 'location'">
          <!-- 如果 validate 为 0，使用省市区选择器 + 详细地址输入框 -->
          <template v-if="field.validate === 0">
            <info-cell :verify-color="'#ffa200'" is-middle :is-link="true" :is-needed="field.required">
              <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
              <view slot="right" class="flex" @click="handleOpenAddressPicker(field.componentid)">
                <view class="flex-1 ellipsis-2 tx-l c-3" :class="{ 'c-6': !getRegionDisplay(field.componentid) }">
                  {{ getRegionDisplay(field.componentid) || '请选择省市区' }}
                </view>
              </view>
            </info-cell>
            <address-picker
              :value="showAddressPicker[field.componentid] || false"
              :column-count="3"
              :address-layer="3"
              :default-regon="getDefaultRegion(field.componentid)"
              @input="val => handleAddressPickerInput(val, field.componentid)"
              @setAddress="addressList => handleAddressPickerConfirm(addressList, field.componentid)"
            />
            <info-cell
              :verify-color="'#ffa200'"
              is-middle
              is-input
              :is-needed="field.required"
              cell-style="padding-right:0;"
            >
              <view slot="left" class="c-3 left-wrap">详细地址</view>
              <view slot="right" class="flex flex-middle c-3">
                <input
                  :value="getAddressDetail(field.componentid)"
                  type="text"
                  class="input flex-1"
                  :maxlength="field.maxlength"
                  :disabled="disabled"
                  placeholder-class="placeholder"
                  placeholder="请输入详细地址"
                  @input="handleAddressDetailInput($event, field.componentid)"
                />
                <text v-if="field.maxlength" class="char-count">
                  {{ getAddressDetailCharCount(field.componentid) }}/{{ field.maxlength }}
                </text>
              </view>
            </info-cell>
          </template>
          <!-- 否则使用定位功能 -->
          <info-cell v-else :verify-color="'#ffa200'" is-middle :is-needed="field.required">
            <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
            <view slot="right" class="address-picker" @click="handleChooseAddress(field.componentid)">
              <view
                class="address-text c-3 flex-1 ellipsis-2 tx-l"
                :class="{ 'c-6': !getAddressDetailFull(field.componentid) }"
              >
                {{ getAddressDetailFull(field.componentid) || getPlaceholder(field) }}
              </view>
              <view class="mdfont icon-mdfont-address address-btn" @click.stop="handleChooseAddress(field.componentid)">
                <text class="fs-24 ml-10">获取定位</text>
              </view>
            </view>
          </info-cell>
        </view>

        <!-- 日期 -->
        <info-cell
          v-if="field.componenttype === 'date'"
          :verify-color="'#ffa200'"
          is-middle
          :is-link="true"
          :is-needed="field.required"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <picker
            slot="right"
            class="date-picker"
            mode="date"
            :value="formData[field.componentid]"
            :end="dateEnd"
            :disabled="disabled"
            @change="onDatePickerChange($event, field.componentid)"
          >
            <view class="flex">
              <view class="flex-1 ellipsis-2 tx-l c-3" :class="{ 'c-6': !formData[field.componentid] }">
                {{ formData[field.componentid] || getPlaceholder(field) }}
              </view>
            </view>
          </picker>
        </info-cell>

        <!-- 购买时间 -->
        <info-cell
          v-if="field.componenttype === 'purchasetime'"
          :verify-color="'#ffa200'"
          is-middle
          :is-link="true"
          :is-needed="field.required"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <picker
            slot="right"
            class="date-picker"
            mode="date"
            :value="formData[field.componentid]"
            :end="dateEnd"
            :disabled="disabled"
            @change="onDatePickerChange($event, field.componentid)"
          >
            <view class="flex">
              <view class="flex-1 ellipsis-2 tx-l c-3" :class="{ 'c-6': !formData[field.componentid] }">
                {{ formData[field.componentid] || getPlaceholder(field) }}
              </view>
            </view>
          </picker>
        </info-cell>

        <!-- 单选项 -->
        <info-cell
          v-if="field.componenttype === 'radio' && field.options && field.options.length > 0"
          :verify-color="'#ffa200'"
          is-middle
          :is-needed="field.required"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <view slot="right">
            <u-radio-group v-model="formData[field.componentid]">
              <u-radio
                v-for="(option, optIndex) in field.options"
                :key="optIndex"
                :name="option.label"
                active-color="#ffa200"
              >
                {{ option.label }}
              </u-radio>
            </u-radio-group>
          </view>
        </info-cell>

        <!-- 多选项 -->
        <info-cell
          v-if="field.componenttype === 'checkbox' && field.options && field.options.length > 0"
          :verify-color="'#ffa200'"
          is-middle
          :is-needed="field.required"
        >
          <view slot="left" class="c-3 left-wrap">{{ field.fieldname }}</view>
          <view slot="right">
            <u-checkbox-group @change="e => handleCheckboxChange(e, field.componentid, field.options)">
              <u-checkbox
                v-for="(option, optIndex) in field.options"
                :key="optIndex"
                v-model="option.checked"
                :name="option.label"
                active-color="#ffa200"
                :disabled="disabled"
              >
                {{ option.label }}
              </u-checkbox>
            </u-checkbox-group>
          </view>
        </info-cell>

        <!-- 图片 -->
        <view v-if="field.componenttype === 'image'">
          <info-cell :verify-color="'#ffa200'" is-middle :is-show-line="false" :is-needed="field.required">
            <view slot="left" class="c-3">{{ field.fieldname }}</view>
          </info-cell>
          <info-cell :verify-color="'#ffa200'" is-middle :is-two-line="false" is-input :is-show-left="false">
            <view slot="right" class="pb-20 upload-wrap">
              <upload
                multiple
                :value="formData[field.componentid]"
                :max-length="field.maximagecount || 3"
                size="120"
                :is-replace="false"
                :source-type="['camera']"
                @input="updateFormData(field.componentid, $event)"
              />
            </view>
          </info-cell>
        </view>

        <!-- 视频 -->
        <info-cell
          v-if="field.componenttype === 'video'"
          :verify-color="'#ffa200'"
          is-middle
          :is-show-line="false"
          :is-needed="field.required"
        >
          <view slot="left" class="c-3">{{ field.fieldname }}</view>
        </info-cell>
        <info-cell
          v-if="field.componenttype === 'video'"
          :verify-color="'#ffa200'"
          is-middle
          :is-two-line="false"
          is-input
          :is-show-left="false"
        >
          <view slot="right" class="pb-20 upload-wrap">
            <video-upload :value="formData[field.componentid]" @input="updateFormData(field.componentid, $event)" />
          </view>
        </info-cell>
      </view>
    </view>

    <!-- 手机号获取失败提示 -->
    <!-- #ifdef MP-WEIXIN -->
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" @close="onVerifyFail" />
    <!-- #endif -->
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import { getMobileNumber } from 'packages/utils/function'
/* #endif */
import InfoCell from 'packages/components/info-cell/info-cell'
import upload from 'packages/components/upload/upload'
import VideoUpload from 'packages/components/video-upload/video-upload.vue'
import AddressPicker from 'packages/components/address-picker/address-picker.vue'
import { deepClone } from 'packages/utils/function.js'
import { getUserLocation } from 'packages/utils/location-mp.js'
import { debounce } from 'lodash'
import dayjs from 'dayjs'
import { apiGetWarrantyFormComponents } from 'packages/api/warranty'

export default {
  name: 'WarrantyForm',
  components: {
    /* #ifdef MP-WEIXIN */
    CommonPopup,
    /* #endif */
    InfoCell,
    upload,
    VideoUpload,
    AddressPicker
  },
  props: {
    // 防伪码
    codeId: {
      type: String,
      required: true
    },
    watermarkMeta: {
      type: Object,
      default: () => ({})
    },
    // 是否禁用表单字段
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formFields: [], // 表单字段配置
      formData: {},
      loading: false, // 加载状态
      showVerifyFail: false,
      canGetPhoneNumber: true,
      formTitle: '',
      showAddressPicker: {}, // 控制每个地址选择器的显示/隐藏
      dateEnd: '', // 日期选择器最大日期（当天），格式 YYYY-MM-DD，参考 card.vue
      flag: false // 防止重复调用地址获取
    }
  },
  created() {
    this.dateEnd = dayjs().format('YYYY-MM-DD')
    this.loadFormComponents()
  },
  methods: {
    // 加载表单组件配置
    async loadFormComponents() {
      const res = await apiGetWarrantyFormComponents({ scanID: this.codeId })
        .then(res => {
          if (this.$ck(res, true)) {
            const d = this.$toLowerKey(res, true)
            const formData = d.return_data || {}
            this.formTitle = formData.formname

            this.formFields = (formData.components || []).map(comp => {
              // 接口返回已经是小写字段名
              let options = comp.options || []
              // 如果是 checkbox 类型，将 options 转换为带 checked 的对象数组
              if (comp.componenttype === 'checkbox' && Array.isArray(options) && options.length > 0) {
                options = options.map(opt => {
                  // 如果已经是对象，直接使用；如果是字符串，转换为对象
                  if (typeof opt === 'object' && opt !== null) {
                    return {
                      label: opt.label || opt.text || '',
                      checked: opt.checked || false
                    }
                  } else {
                    return {
                      label: String(opt),
                      checked: false
                    }
                  }
                })
              }
              return {
                componentid: comp.componentid,
                componenttype: comp.componenttype,
                fieldname: comp.fieldname,
                fielddesc: comp.fielddesc,
                required: comp.required,
                defaultvalue: comp.defaultvalue || '',
                maxlength: comp.maxlength,
                options: options,
                maximagecount: comp.maximagecount || 0,
                isdefault: comp.isdefault || false,
                validate: comp.validate !== undefined ? comp.validate : 1,
                supportphoneverify: comp.supportphoneverify || false
              }
            })

            // 初始化表单数据
            this.initFormData()

            // 通知父组件表单是否加载完成及是否有表单字段
            this.$emit('form-ready', { hasFields: this.formFields.length > 0 })

            // 判断是否有地址组件（location类型且不是普通输入框）
            const hasLocation = this.formFields?.some(
              field => field.componenttype === 'location' && field.validate !== 0
            )
            if (hasLocation && !this.flag) {
              this.flag = true
              // 找到第一个地址组件并初始化获取地址
              const locationField = this.formFields.find(
                field => field.componenttype === 'location' && field.validate !== 0
              )
              if (locationField) {
                this.handleChooseAddress(locationField.componentid)
              }
            }
          }
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    },
    // 根据字段类型获取默认
    // 根据字段类型和字段名返回默认 placeholder 或验证消息
    getPlaceholder(field, isValidation = false) {
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
          // 如果 validate 为 0，使用普通输入框的提示
          if (field.validate === 1 && type === 'mobile') {
            return this.canGetPhoneNumber ? `请获取${fieldName}` : `请输入${fieldName}`
          }
          return `请输入${fieldName}`
        case 'location':
          // 如果 validate 为 0，使用普通输入框
          if (field.validate === 0) {
            return `请输入${fieldName}`
          }
          // 验证消息返回带字段名的提示，placeholder 返回固定文本
          return isValidation ? `请获取${fieldName}` : '请点击获取定位'
        case 'date':
        case 'purchasetime':
        case 'radio':
        case 'checkbox':
          return `请选择${fieldName}`
        default:
          return `请输入${fieldName}`
      }
    },
    // 初始化表单数据
    initFormData() {
      const data = {}
      this.formFields.forEach(field => {
        const componentId = field.componentid
        // 根据字段类型初始化不同的默认值
        if (field.componenttype === 'checkbox' || field.componenttype === 'image') {
          data[componentId] = [] // 多选项和图片初始化为数组
        } else if (field.componenttype === 'location') {
          data[componentId] = {
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
        } else {
          data[componentId] = field.defaultvalue || '' // 使用默认值或空字符串
        }
      })
      this.formData = data
    },
    // 更新表单数据（用于非 v-model 的场景，如图片、视频上传组件）
    updateFormData(key, value) {
      if (this.disabled) return
      this.formData[key] = value
    },
    // 获取字符数
    getCharCount(componentId) {
      const value = this.formData[componentId]
      if (value === null || value === undefined) return 0
      return String(value).length
    },
    // 构建提交数据（用于提交到接口）
    buildSubmitData() {
      const formData = deepClone(this.formData)
      const formDataArray = []
      this.formFields.forEach(field => {
        const componentId = field.componentid
        const componentType = field.componenttype
        const fieldName = field.fieldname
        let fieldValue = formData[componentId]

        // 根据字段类型处理值
        if (['location', 'image', 'checkbox'].includes(componentType) && typeof fieldValue === 'object') {
          // 图片字段：转换为JSON字符串
          fieldValue = JSON.stringify(fieldValue)
        }
        if (componentType === 'video') {
          fieldValue = fieldValue ? JSON.stringify([fieldValue]) : ''
        }

        formDataArray.push({
          ComponentID: componentId,
          ComponentType: componentType,
          FieldName: fieldName,
          FieldValue: fieldValue || ''
        })
      })
      return formDataArray
    },
    // 校验表单
    validate() {
      return new Promise((resolve, reject) => {
        const isValid = this.validateForm(this.formData)
        if (isValid) {
          resolve(true)
        } else {
          reject(false)
        }
      })
    },
    // 校验表单必填项
    validateForm(formData) {
      if (!this.formFields || !this.formFields.length) return true

      for (const field of this.formFields) {
        if (!field.required) continue

        const value = formData[field.componentid]
        // 判断值是否为空（参照 src\personal\info\index.vue）
        let isEmpty = false
        if (Array.isArray(value)) {
          // 数组类型：检查长度
          isEmpty = value.length === 0
        } else if (typeof value === 'string') {
          // 字符串类型：去除空格后检查是否为空
          isEmpty = !value || value.trim() === ''
        } else {
          // 其他类型：检查是否为 null、undefined 或空字符串
          isEmpty = !value
        }

        if (isEmpty) {
          const message = this.getPlaceholder(field, true)
          this.$msg(message)
          return false
        }

        // 手机号格式校验
        if (field.componenttype === 'mobile' && value) {
          // 确保值为字符串且去除空格后不为空
          const phoneValue = String(value).trim()
          if (phoneValue) {
            // 检查 uView 的 test.mobile 方法是否存在
            const isValid = this.$u && this.$u.test && this.$u.test.mobile(phoneValue)
            if (!isValid) {
              this.$msg('手机号格式错误')
              return false
            }
          }
        }
      }
      return true
    },
    // 日期选择（原生 picker change），参考 card.vue
    onDatePickerChange(e, componentId) {
      const value = e.detail.value
      this.formData[componentId] = value
    },
    // 处理多选项变化
    handleCheckboxChange(selectedValues, fieldId, options) {
      if (this.disabled) return
      // 直接存储数组数据
      this.updateFormData(fieldId, selectedValues)
    },
    /* #ifdef MP-WEIXIN */
    // 获取手机号
    async handleGetPhonenumber(e, componentId) {
      const { errMsg, code, errno } = e.detail
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
    /* #endif */
    // 获取用户当前地址
    handleChooseAddress: debounce(function (componentId) {
      if (this.disabled) return
      ;(async () => {
        try {
          let resData = await getUserLocation({
            skipChoose: false, // 是否用地图选点
            useTencentMapAPI: false // 是否用腾讯地图逆解析
          })
          if (resData) {
            this.updateFormData(componentId, resData)
          }
        } catch (error) {
          console.error('获取地址失败：', error)
        }
      })()
    }, 300), // 300毫秒的防抖时间

    // 获取三级地址的显示文本
    getRegionDisplay(componentId) {
      const { provincename, cityname, areaname } = this.formData[componentId] || []
      return [provincename, cityname, areaname].join('')
    },
    // 打开地址选择器
    handleOpenAddressPicker(componentId) {
      if (this.disabled) return
      this.$set(this.showAddressPicker, componentId, true)
    },
    // 处理地址选择器的 v-model 输入
    handleAddressPickerInput(val, componentId) {
      this.$set(this.showAddressPicker, componentId, val)
    },
    // 处理地址选择器确认（用于location类型且validate为0）
    handleAddressPickerConfirm(addressList, componentId) {
      if (this.disabled) return
      // addressList 是地址对象数组，每个对象包含 id 和 name
      const [
        { value: provinceid, label: provincename } = {},
        { value: cityid, label: cityname } = {},
        { value: areaid, label: areaname } = {}
      ] = addressList
      const regionData = this.formData[componentId] || {}
      this.updateFormData(componentId, {
        provinceid,
        cityid,
        areaid,
        provincename,
        cityname,
        areaname,
        address: regionData.address
      })
      // 关闭选择器
      this.$set(this.showAddressPicker, componentId, false)
    },
    // 获取默认选中的地址ID数组（用于address-picker组件的defaultRegon属性）
    getDefaultRegion(componentId) {
      const regionData = this.formData[componentId]
      if (regionData && regionData.province && regionData.city && regionData.area) {
        // 返回ID数组，如果存储的是名称则返回空数组让组件自己处理
        return [regionData.province, regionData.city, regionData.area]
      }
      return []
    },
    // 处理详细地址输入
    handleAddressDetailInput(e, componentId) {
      if (this.disabled) return
      const address = e.detail.value.trim()
      const regionData = this.formData[componentId]
      this.updateFormData(componentId, {
        ...regionData,
        address
      })
    },
    // 获取详细地址
    getAddressDetail(componentId) {
      const regionData = this.formData[componentId]
      return regionData?.address
    },
    getFullAddress(data) {
      if (!data) return ''
      const { address, streetname, areaname, cityname, provincename } = data 
      const replaceField = address?.includes(streetname) ? streetname : areaname || cityname || provincename
      const locAddress = address.split(replaceField)
      const lastAddress = locAddress.length && locAddress[locAddress.length - 1]
      return `${provincename || ''}${cityname || ''}${areaname || ''}${streetname || ''}${lastAddress || ''}`
    },
    getAddressDetailFull(componentId) {
      const regionData = this.formData[componentId]
      return this.getFullAddress(regionData)
    },
    // 获取详细地址字符数
    getAddressDetailCharCount(componentId) {
      const address = this.getAddressDetail(componentId)
      return address ? String(address).length : 0
    }
  }
}
</script>

<style lang="scss" scoped>
.warranty-form {
  position: relative;

  .loading-container {
    min-height: 200rpx;
    padding: 60rpx 0;
  }

  .form-box {
    padding: 0 20rpx 20rpx;
    border-radius: 20rpx;

    .input {
      height: 108rpx;
      text-align: left;
      color: #333;
      line-height: 108rpx;
      font-size: 30rpx;
    }

    .textarea {
      width: 100%;
      min-height: 200rpx;
      text-align: left;
      color: #333;
      font-size: 30rpx;
    }

    .placeholder {
      color: #aaaaaa;
    }

    .char-count {
      font-size: 24rpx;
      color: #999;
      margin-left: 20rpx;
      flex-shrink: 0;
    }

    .textarea-count {
      display: block;
      text-align: right;
      margin-top: 10rpx;
      margin-left: 0;
    }

    .date-picker {
      width: 100%;
    }
  }

  .phone-control-wrapper {
    width: 100%;

    .get-phone-btn {
      width: 200rpx;
      line-height: 40rpx;
      height: 42rpx;
      border-radius: 20rpx;
      padding: 0;
      margin: 0;
      margin-left: 20rpx;
      font-size: 24rpx;
      color: #0aa6ff;
      border: 1rpx solid #0aa6ff;

      &::after {
        border: none;
      }
    }
  }

  .address-btn {
    color: #0aa6ff;
  }

  .address-picker {
    position: relative;
    z-index: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 80rpx;

    .address-text {
      font-size: 30rpx;
      word-break: break-all;
    }

    .picker-arrow {
      color: #666666;
      transform: rotate(0deg);
      flex-shrink: 0;
      margin-left: 20rpx;
    }
  }
}
.upload-wrap {
  margin-left: -20rpx;
  margin-right: -10rpx;
  margin-bottom: 20rpx;
}
.left-wrap {
  max-width: 160rpx;
}
.c-6 {
  color: #666 !important;
}
</style>
