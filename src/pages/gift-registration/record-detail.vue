<template>
  <view>
    <view class="page-gift-registration custom-scan-container flex flex-column" :style="{ backgroundColor: pageBgColor }">
      <image v-if="bgUrl" :style="{ top: bgTop }" :src="bgUrl" mode="widthFix" class="bg" />
      <!-- #ifdef MP-WEIXIN -->
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="true" />
      <!-- #endif -->
      <view :style="{ paddingTop: top }" class="main form-container  mt-20">
        <!-- 标题区：取自 Components 中 ComponentType 为 title 的项 -->
        <view v-if="titleConfig && titleConfig.text" class="form-title-block" :style="titleStyle">
          {{ titleConfig.text }}
        </view>

        <view class="form-section gift-selector-disabled">
          <gift-registration-form
            :form-fields="formFields"
            :form-data="formData"
            :disabled="true"
          />
        </view>

        <!-- 底部按钮：返回登记记录，样式与 index 一致 -->
        <view class="submit-btn-container flex flex-middle p-r">
          <view
            class="record-btn shrink-0 flex-1"
            @tap="goBackToRecords"
          >
            返回登记记录
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiGetActivity, apiGetRecordDetail } from 'packages/api/gift-registration'
import { getOpenId, getMemberLogin } from './mixins'
import GiftRegistrationForm from './components/gift-registration-form.vue'
import TitleBar from 'packages/components/title-bar/title-home.vue'
import { staticURL } from '@/config'

export default {
  components: {
    GiftRegistrationForm,
    TitleBar
  },
  data() {
    return {
      openId: '',
      memberlogin: '',
      recordId: 0,
      activityId: 0,
      recordDetail: null,
      formFields: [],
      formData: {},
      pageConfig: {
        pageName: '登记详情',
        backgroundColor: '#f4f4f4',
        backgroundImage: '',
        navigationBarBackgroundColor: '',
        titleColor: '#000',
        topSpacing: 44
      },
      pageBgColor: '#f4f4f4',
      bgUrl: staticURL(true) + 'gift-registration/bg.png',
      bgcolor: '',
      textcolor: '#000',
      title: '登记详情',
      titleConfig: null // Components 中 ComponentType 为 title 的项（标题区文案与样式）
    }
  },
  computed: {
    titleStyle() {
      const c = this.titleConfig
      if (!c) return ''
      const s = []
      if (c.fontSize) {
        s.push(`font-size: ${c.fontSize}px`)
      }
      if (c.fontWeight) {
        s.push(`font-weight: ${c.fontWeight}`)
      }
      if (c.color) {
        s.push(`color: ${c.color}`)
      }
      if (c.gap) {
        const gapVal = c.gap * 2
        s.push(`padding-left: ${gapVal}rpx`)
        s.push(`padding-right: ${gapVal}rpx`)
      }
      return s.join(';')
    },
    top() {
      // 顶部适配，与 index 一致
      let style = ''
      const topSpacing = this.pageConfig.topSpacing ?? 30 + 10
      /* #ifdef MP-WEIXIN */
      const statusBarHeight = Number(uni.getSystemInfoSync().statusBarHeight) || 0
      style = `${44 + statusBarHeight + topSpacing * 2}px`
      /* #endif */
      /* #ifdef H5 */
      style = `${topSpacing * 2}px`
      /* #endif */
      return style
    },
    bgTop() {
      let style = ''
      /* #ifdef H5 */
      style = '0'
      /* #endif */
      return style
    }
  },
  onLoad(options) {
    this.recordId = Number(options.recordid || options.id || 0)
    this.activityId = Number(options.activityid || options.activityId || 0)
    this.openId = getOpenId(options)
    this.memberlogin = getMemberLogin(options)
    this.getRecordDetail()
  },
  methods: {
    getRecordValue(primaryKey, fallbackKey, defaultValue = '--') {
      if (!this.recordDetail) return defaultValue
      const primary = this.recordDetail[primaryKey]
      if (primary !== undefined && primary !== null && primary !== '') return primary
      if (!fallbackKey) return defaultValue
      const fallback = this.recordDetail[fallbackKey]
      return fallback !== undefined && fallback !== null && fallback !== '' ? fallback : defaultValue
    },
    async getRecordDetail() {
      if (!this.recordId) return
      const params = { id: this.recordId }
      // #ifdef H5
      if (this.openId) {
        params.openID = this.openId || ''
      }
      params.memberLogin = this.memberlogin || ''
      // #endif
      const res = await apiGetRecordDetail(params)
      if (this.$ck(res)) {
        const data = res.return_data || {}
        const normalizedDetail = {
          ...data,
          addtime: data.addtime || data.AddTime,
          rulename: data.rulename || data.RuleName,
          giftname: data.giftname || data.GiftNames
        }
        this.recordDetail = normalizedDetail
        if (!this.activityId && (data.ActivityID || data.activityid)) {
          this.activityId = Number(data.ActivityID || data.activityid)
        }
        const fields =
          data.formFields || data.formfields || data.FormFields || data.form?.components || []
        // 与 index 一致：过滤掉 submit、divider、title，详情页不展示提交按钮和标题组件
        this.formFields = fields
          .map(field => this.normalizeField(field))
          .filter(field => {
            if (!field) return false
            const type = (field.componenttype || '').toLowerCase()
            return type !== 'submit' && type !== 'divider' && type !== 'title'
          })
        this.initFormData()
        await this.applyPageConfig()
      }
    },
    /** 拉取活动装修配置并应用（与 index 一致） */
    async applyPageConfig() {
      if (!this.activityId) return
      try {
        const params = { activityID: this.activityId, openID: this.openId || '' }
        // #ifdef H5
        params.memberLogin = this.memberlogin || ''
        // #endif
        const res = await apiGetActivity(params)
        if (!this.$ck(res)) return
        const data = res.return_data || {}
        const pageCfg = data.PageConfig || {}
        this.pageConfig = {
          pageName: this.pageConfig.pageName,
          backgroundColor: pageCfg.BackgroundColor || '',
          backgroundImage: pageCfg.BackgroundImage || '',
          navigationBarBackgroundColor: pageCfg.NavigationBarBackgroundColor,
          titleColor: pageCfg.TitleColor,
          topSpacing: pageCfg.TopSpacing
        }
        this.pageBgColor = (this.pageConfig.backgroundColor || '#f4f4f4') + ''
        this.bgUrl = this.pageConfig.backgroundImage || staticURL(true) + 'gift-registration/bg.png'
        this.bgcolor = this.pageConfig.navigationBarBackgroundColor || ''
        this.textcolor = this.pageConfig.titleColor || '#000'
        // 标题区：从 Components 中取 ComponentType 为 title 的项（与 index 一致）
        const rawFields = data.Components || []
        const titleComp = rawFields.find(f => (f.ComponentType || '').toLowerCase() === 'title')
        this.titleConfig = titleComp
          ? {
              text: titleComp.FieldName || titleComp.FieldDesc || '',
              fontSize: titleComp.TextFontSize,
              fontWeight: titleComp.FontWeight,
              color: titleComp.TextColor,
              gap: titleComp.Gap
            }
          : null
      } catch (e) {
        console.warn('登记详情拉取活动装修失败', e)
      }
    },
    normalizeField(field) {
      if (!field) return null
      const componenttype = (
        field.componenttype ||
        field.componentType ||
        field.ComponentType ||
        ''
      ).toLowerCase()
      const rawValue = field.value || field.fieldValue || field.fieldvalue || field.FieldValue || ''
      let options = this.normalizeOptions(
        componenttype,
        field.Options || field.options || field.giftoptions || field.giftOptions || []
      )
      // 与 index 一致：Options 为空时从已保存的 value 反推 options，避免单选/多选展示为空
      if (componenttype === 'gift' && options.length === 0) {
        options = this.normalizeGiftOptionsFromValue(rawValue)
      }
      if (componenttype === 'radio' && options.length === 0) {
        options = this.normalizeRadioOptionsFromValue(rawValue)
      }
      if (componenttype === 'checkbox' && options.length === 0) {
        options = this.normalizeCheckboxOptionsFromValue(rawValue)
      }
      const value = this.normalizeSelectValue(
        componenttype,
        this.normalizeFieldValue(componenttype, rawValue),
        options
      )
      console.log('field', field, componenttype, value)
      return {
        ...field,
        componenttype,
        componentid:
          field.ComponentID ||
          field.componentID ||
          field.componentid ||
          field.id ||
          field.FieldName ||
          field.fieldName ||
          field.fieldname ||
          field.FieldCode ||
          field.fieldCode ||
          field.fieldcode,
        fieldname: field.fieldname || field.fieldName || field.FieldName || '',
        fielddesc: field.fielddesc || field.fieldDesc || field.FieldDesc || '',
        required: field.Required !== undefined ? field.Required : !!field.required,
        defaultvalue: field.DefaultValue || field.defaultValue || field.defaultvalue || '',
        maxlength: field.MaxLength || field.maxLength || field.maxlength || 0,
        maximagecount: field.MaxImageCount || field.maxImageCount || field.maximagecount || 0,
        supportmultiple: field.SupportMultiple,
        supportwatermark: field.SupportWatermark || field.supportWatermark || field.supportwatermark || false,
        options,
        value
      }
    },
    normalizeGiftOptionsFromValue(rawValue) {
      if (!rawValue) return []
      let parsed = rawValue
      if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim()
        if (!trimmed) return []
        try {
          parsed = JSON.parse(trimmed)
        } catch (error) {
          return []
        }
      }
      if (!Array.isArray(parsed)) return []
      return parsed
        .map(item => this.normalizeOption('gift', item))
        .filter(Boolean)
    },
    /** 单选 Options 为空时，从已保存的 value 生成单条 option（与 index 对 gift 的处理一致） */
    normalizeRadioOptionsFromValue(rawValue) {
      if (rawValue === undefined || rawValue === null) return []
      let label = ''
      if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim()
        if (!trimmed) return []
        try {
          const parsed = JSON.parse(trimmed)
          const v = parsed?.label ?? parsed?.Label ?? parsed?.value ?? parsed?.Value ?? parsed
          label = v !== undefined && v !== null ? String(v) : trimmed
        } catch (e) {
          label = trimmed
        }
      } else {
        label = String(rawValue)
      }
      return [{ label, value: label }]
    },
    /** 多选 Options 为空时，从已保存的 value（数组或 JSON 字符串）生成 options */
    normalizeCheckboxOptionsFromValue(rawValue) {
      const values = this.normalizeFieldValue('checkbox', rawValue)
      if (!Array.isArray(values) || values.length === 0) return []
      return values.map(item => ({ label: String(item), value: String(item) }))
    },
    normalizeFieldValue(componenttype, rawValue) {
      if (rawValue === undefined || rawValue === null) {
        return componenttype === 'image' || componenttype === 'checkbox' || componenttype === 'gift'
          ? []
          : ''
      }
      if (typeof rawValue !== 'string') {
        if (componenttype === 'gift' && Array.isArray(rawValue)) {
          return rawValue
            .map(item => item?.GiftID || item?.giftID || item?.giftId || item?.giftid)
            .filter(item => item !== undefined && item !== null && item !== '')
        }
        if (componenttype === 'checkbox' && Array.isArray(rawValue)) {
          return rawValue
            .map(item => item?.label || item?.Label || item?.name || item)
            .filter(item => item !== undefined && item !== null && item !== '')
        }
        return rawValue
      }
      const trimmed = rawValue.trim()
      if (!trimmed) return rawValue
      if (
        componenttype === 'checkbox' ||
        componenttype === 'gift' ||
        componenttype === 'image' ||
        componenttype === 'video'
      ) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            if (componenttype === 'gift') {
              return parsed
                .map(item => item?.GiftID || item?.giftID || item?.giftId || item?.giftid)
                .filter(item => item !== undefined && item !== null && item !== '')
            }
            if (componenttype === 'checkbox') {
              return parsed
                .map(item => item?.label || item?.Label || item?.name || item)
                .filter(item => item !== undefined && item !== null && item !== '')
            }
            if (componenttype === 'video') {
              return parsed[0] || ''
            }
            return parsed
          }
        } catch (error) {
          return rawValue
        }
      }
      return rawValue
    },
    normalizeOptions(componenttype, options) {
      if (!options) return []
      if (!Array.isArray(options)) return []
      return options
        .map(opt => {
          if (typeof opt === 'string') {
            try {
              const parsed = JSON.parse(opt)
              return this.normalizeOption(componenttype, parsed)
            } catch (e) {
              return { label: opt, value: opt }
            }
          }
          return this.normalizeOption(componenttype, opt)
        })
        .filter(Boolean)
    },
    normalizeOption(componenttype, opt) {
      if (!opt) return null
      if (componenttype === 'gift') {
        // 统一处理大小写字段名,转换为小写格式（与 index 一致）
        const giftid = opt.GiftID || opt.giftID || opt.giftId || opt.giftid || 0
        const giftname = opt.GiftName || opt.giftName || opt.giftname || opt.Label || opt.label || ''
        const giftno = opt.GiftNo || opt.giftNo || opt.giftno || opt.value || ''
        return {
          label: giftname,
          value: String(giftid),
          giftid: giftid,
          giftname: giftname,
          giftno: giftno
        }
      }
      const label =
        opt.Label ||
        opt.label ||
        opt.Name ||
        opt.name ||
        opt.Text ||
        opt.text ||
        opt.Value ||
        opt.value ||
        ''
      const value = opt.Value || opt.value || label
      if (!label && !value) return null
      return {
        label: label || String(value),
        value: String(value)
      }
    },
    /**
     * 将单选/多选的值（可能为 value/code）转为展示用文案（label），与 visit 详情页一致：
     * 单选返回单条展示文案，多选返回展示文案数组（可用于 join('、') 等）
     */
    normalizeSelectValue(componenttype, value, options) {
      if (componenttype !== 'radio' && componenttype !== 'checkbox') return value
      const valueToLabel = new Map()
      for (const opt of options) {
        if (!opt) continue
        const display = opt.label ?? opt.value
        if (display == null) continue
        if (opt.label != null) valueToLabel.set(String(opt.label), display)
        if (opt.value != null) valueToLabel.set(String(opt.value), display)
      }
      const toLabel = v => valueToLabel.get(String(v)) ?? v
      if (componenttype === 'radio') {
        if (value === undefined || value === null || value === '') return value
        return toLabel(value)
      }
      if (componenttype === 'checkbox') {
        const arr = Array.isArray(value) ? value : value != null && value !== '' ? [value] : []
        return arr.map(toLabel).filter(v => v != null && v !== '')
      }
      return value
    },
    initFormData() {
      const formData = {}
      this.formFields.forEach(field => {
        const key = field.componentid
        if (!key) return
        if (field.componenttype === 'gift') {
          const rawGift = field.value || []
          if (field.supportmultiple) {
            formData[key] = Array.isArray(rawGift)
              ? rawGift.map(item => String(item))
              : []
          } else {
            if (Array.isArray(rawGift)) {
              formData[key] = String(rawGift[0] || '')
            } else if (typeof rawGift === 'object' && rawGift) {
              const giftId =
                rawGift.giftid || rawGift.giftId || rawGift.GiftID || rawGift.giftID || ''
              formData[key] = String(giftId)
            } else {
              formData[key] = String(rawGift || '')
            }
          }
          return
        }
        if (field.componenttype === 'location') {
          const rawValue = field.value ?? field.fieldValue ?? field.fieldvalue ?? field.FieldValue ?? ''
          let locVal = rawValue
          if (typeof locVal === 'string' && locVal.trim()) {
            try {
              locVal = JSON.parse(locVal)
            } catch (e) {
              locVal = null
            }
          }
          const emptyLoc = {
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
          formData[key] = locVal && typeof locVal === 'object' ? locVal : emptyLoc
          return
        }
        const isArrayType = field.componenttype === 'image' || field.componenttype === 'checkbox'
        formData[key] = isArrayType ? field.value || [] : field.value || ''
      })
      this.formData = formData
    },
    goBackToRecords() {
      if (this.activityId) {
        uni.redirectTo({
          url: `./records?activityid=${this.activityId}&openid=${encodeURIComponent(this.openId || '')}&m=${encodeURIComponent(this.memberlogin || '')}`
        })
      } else {
        uni.navigateBack()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';

/* 与 index 一致的容器与背景图层级 */
.page-gift-registration.custom-scan-container {
  position: relative;
  min-height: 100vh;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  .bg {
    position: absolute;
    width: 100%;
    z-index: 0;
    /* #ifdef H5 */
    width: 100%;
    margin-bottom: -170rpx;
    transform: translateY(-170rpx);
    /* #endif */
  }

  .main {
    position: relative;
    z-index: 1;
  }
}

.form-container {
  margin: 20rpx;
  padding-bottom: 40rpx;
}

.form-title-block {
  margin-bottom: 24rpx;
  line-height: 1.4;
}

.form-section {
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0px 0px 6px 0px rgba(50, 70, 195, 0.1);
}

.submit-btn-container {
  padding: 10rpx 0;
  gap: 20rpx;
}

.record-btn {
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  color: #333333;
  background-color: #fff;
  border: 1rpx solid #CCCCCC;
  border-radius: 44rpx;
  text-align: center;
  white-space: nowrap;
}
</style>
<!-- 小程序端样式隔离导致组件内 ::v-deep 无法穿透 u-checkbox，在此用页面级非 scoped 样式覆盖 -->
<style lang="scss">
/* #ifdef MP-WEIXIN */
/* 仅未选中时给 icon-wrap 配背景 */
.gift-selector-disabled .u-checkbox__icon-wrap:not(.u-checkbox__icon-wrap--checked) {
  background-color: #f5f5f5 !important;
}
.gift-selector-disabled .u-radio__icon-wrap:not(.u-radio__icon-wrap--checked) {
  background-color: #f5f5f5 !important;
}
/* #endif */
</style>
