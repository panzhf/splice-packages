<template>
  <view>
    <view class="page-gift-registration custom-scan-container flex flex-column" :style="{ backgroundColor: pageBgColor }">
      <image v-if="bgUrl" :style="{ top: bgTop }" :src="bgUrl" mode="widthFix" class="bg" />
      <!-- #ifdef MP-WEIXIN -->
      <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
      <!-- #endif --> 
      <view v-if="activityId" :style="{ paddingTop: top }" class="main flex-1 form-container mt-20">
      <!-- 标题区：取自 Components 中 ComponentType 为 title 的项 -->
      <view v-if="titleConfig && titleConfig.text" class="form-title-block" :style="titleStyle">
        {{ titleConfig.text }}
      </view>

      <!-- 表单区域 -->
      <view class="form-section">
        <gift-registration-form
          ref="giftForm"
          :form-fields="formFields"
          :disabled="submitting"
          :open-id="openId"
          :memberlogin="memberlogin"
          :activity-id="activityId"
        />
      </view>

      <!-- 提交按钮：表单配置拉取成功后才展示 -->
      <view v-if="formConfigLoaded" class="submit-btn-container flex flex-middle p-r" :style="submitBtnContainerStyle">
        <view class="record-btn flex-1" @tap="goRecords">查看登记记录</view>
        <view
          class="submit-btn flex-1"
          :style="submitBtnStyle"
          :class="{ disabled: submitting }"
          @tap="handleSubmit"
        >
          {{ submitting ? '提交中...' : '立即登记' }}
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>
    </view>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { getUrlQuery } from 'packages/utils/function'
import {
  apiGetActivity,
  apiSubmitRegistration,
  apiValidateSmsVerifyCode
} from 'packages/api/gift-registration'
import GiftRegistrationForm from './components/gift-registration-form.vue'
import TitleBar from 'packages/components/title-bar/title-home.vue'
import { locationMixin, getOpenId, getMemberLogin, LOCATION_MSG_MP, LOCATION_MSG_H5 } from './mixins'
import { getPage } from 'packages/utils/index'
import { staticURL } from '@/config'
// #ifdef H5
import { apiGetwxdata } from 'packages/api/common'
// #endif

export default {
  components: {
    GiftRegistrationForm,
    TitleBar
  },
  mixins: [locationMixin],
  data() {
    return {
      firstInit: true,
      activityId: 0,
      openId: '',
      unionId: '',
      memberlogin: '',
      appid: '',
      activityInfo: {},
      formConfig: {},
      titleConfig: null, // Components 中 ComponentType 为 title 的项（标题区文案与样式）
      formFields: [],
      pageConfig: {
        pageName: '礼品领取登记',
        backgroundColor: '#ffffff',
        backgroundImage: ''
      },
      pageBgColor: '#f4f4f4',
      bgUrl: staticURL(true) + 'gift-registration/bg.png',
      bgcolor: '',
      textcolor: '#000',
      title: '礼品领取登记',
      showBack: false,
      submitBtnConfig: null, // 由接口 SubmitBtnConfig 配置立即登记按钮样式
      submitting: false,
      formConfigLoaded: false // 表单配置拉取成功后才为 true，用于控制操作按钮展示
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
    submitBtnContainerStyle() {
      const c = this.submitBtnConfig
      if (!c) return ''
      const s = []
      if (c.gap) {
        s.push(`gap: ${c.gap * 2}rpx`)
      }
      if (c.topGap) {
        s.push(`padding-top: ${c.topGap * 2}rpx`)
      }
      return s.join(';')
    },
    top() {
      // 顶部适配（必须返回字符串，否则小程序解析 :style 时会报 t.substring is not a function）
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
      // 顶部适配
      let style = ''
      /* #ifdef H5 */
      style = `0`
      /* #endif */
      return style
    },
    submitBtnStyle() {
      const c = this.submitBtnConfig
      const s = []
      const start = (c && c.bgGradientStart) || '#FFA200'
      const end = (c && c.bgGradientEnd) || '#FFD461'
      s.push(`background: linear-gradient(90deg, ${start} 0%, ${end} 100%)`)
      s.push(`color: ${(c && c.textColor) || '#ffffff'}`)
      if (c && c.textFontSize) {
        s.push(`font-size: ${c.textFontSize * 2}rpx`)
      }
      if (c && c.fontWeight) {
        s.push(`font-weight: ${c.fontWeight}`)
      }
      return s.join(';')
    }
  },
  created() {
    const currentPages = getCurrentPages()
    this.showBack = currentPages.length > 1
  },
  onLoad() {},
  async onShow() {
    // #ifdef MP-WEIXIN
    this.$refs.privacyPopup?.refresh()
    // #endif

    const page = getPage()
    const options = page?.query || {}
    /* #ifdef MP-WEIXIN */
    // scene 解码参照 banquet：有 aid 或 scene 即可，scene 解码后取 aid
    if (!options.aid && !options.scene) return this.$msg('链接格式不正确')
    if (this.firstInit) {
      const query = options.scene ? getUrlQuery(decodeURIComponent(options.scene)) : options
      const aid = query.aid
      if (!aid) return this.$msg('链接格式不正确')
      this.activityId = Number(aid)
      this.memberlogin = query.m || options.m || ''
      this.openId = getOpenId(options)
      this.unionId = options.unionid || options.unionId || ''
      this.appid = options.appid || options.appID || ''
      await this.initPage()
    }
    /* #endif */

    /* #ifdef H5 */
    if (!options.aid) return this.$msg('链接格式不正确')
    if (this.firstInit) {
      this.activityId = Number(options.aid)
      this.openId = getOpenId(options)
      this.memberlogin = getMemberLogin(options) // 优先路由参数，其次持久化缓存
      this.unionId = options.unionid || options.unionId || ''
      this.appid = options.appid || options.appID || ''
      await this.initPage()
    }
    /* #endif */

    this.firstInit = false
  },
  methods: {
    async initPage() {
      await this.getActivityDetail()
    },
    async getActivityDetail() {
      if (!this.activityId) return this.$msg('参数错误')
      let res
      try {
        // #ifdef H5
        res = await apiGetActivity({
          activityID: this.activityId,
          openID: this.openId || '',
          memberLogin: this.memberlogin || ''
        })
        // #endif
        // #ifdef MP-WEIXIN
        // 小程序环境下，需要显式传递openID
        res = await apiGetActivity({
          activityID: this.activityId,
          openID: this.openId,
          memberLogin: this.memberlogin || ''
        })
        // #endif
      } catch (e) {
        this.$msg(e?.return_msg || e?.message || '请求失败，请重试')
        return
      }
      if (!this.$ck(res, true)) return

      const data = res.return_data || {}
      this.activityInfo = data 
      this.formConfig = {
        formId: data.FormID,
        formName: data.FormName || '礼品领取登记'
      }

      // 标题区：从 Components 中取 ComponentType 为 title 的项
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

      // PageConfig：页面配置
      const pageCfg = data.PageConfig || {}
      this.pageConfig = {
        pageName: pageCfg.PageName || data.FormName || '礼品领取登记',
        backgroundColor: pageCfg.BackgroundColor || '',
        backgroundImage: pageCfg.BackgroundImage || '',
        navigationBarBackgroundColor: pageCfg.NavigationBarBackgroundColor,
        titleColor: pageCfg.TitleColor,
        topSpacing: pageCfg.TopSpacing
      }
      this.title = this.pageConfig.pageName
      this.pageBgColor = (this.pageConfig.backgroundColor || '#f4f4f4') + ''
      this.bgUrl = this.pageConfig.backgroundImage || staticURL(true) + 'gift-registration/bg.png'
      this.bgcolor = this.pageConfig.navigationBarBackgroundColor || ''
      this.textcolor = this.pageConfig.titleColor || '#000'

      // SubmitBtnConfig：立即登记按钮样式
      const btnCfg = data.SubmitBtnConfig || {}
      this.submitBtnConfig = {
        textColor: btnCfg.TextColor,
        bgGradientStart: btnCfg.BgGradientStart,
        bgGradientEnd: btnCfg.BgGradientEnd,
        radius: btnCfg.Radius,
        textFontSize: btnCfg.TextFontSize,
        gap: btnCfg.Gap,
        topGap: btnCfg.TopGap,
        fontWeight: btnCfg.FontWeight
      }

      // 直接从 Components 数组获取表单字段（不含 submit/divider/title），在 H5 定位初始化完成后再赋值，避免表单 watch 提前触发 handleChooseAddress
      this.formFields = rawFields
        .map(field => this.normalizeField(field))
        .filter(field => {
          // 过滤掉submit和divider等不需要填写的组件
          if (!field) return false
          const type = field.componenttype
          return type !== 'submit' && type !== 'divider' && type !== 'title'
        })
      
      this.formConfigLoaded = true

      // 需要定位时：H5 必须先完成 JSSDK 初始化后再 getLocationAndAddress，再设 formFields，这样表单回显地址时 $wechat 已就绪（与小程序一致：初始化时获取定位并回显）
      const hasLocationField = rawFields.some(
        f => (f.ComponentType || f.componentType || f.componenttype || '').toLowerCase() === 'location'
      )
      const needLocation = data.EnableLocationLimit || hasLocationField
      if (needLocation) {
        // #ifdef H5
        await this.initWxConfigForLocation()
        // #endif
        if (data.EnableLocationLimit) {
          await this.getLocationAndAddress()
        }
      } 
    },
    // #ifdef H5
    /** H5 微信 JSSDK 初始化，用于 getLocation（与大转盘一致：apiGetwxdata + config + ready） */
    initWxConfigForLocation() {
      if (process.env.NODE_ENV === 'development') return Promise.resolve()
      return new Promise((resolve) => {
        apiGetwxdata({
          aid: this.activityId,
          url: typeof location !== 'undefined' ? location.href : ''
        })
          .then(res => {
            const d = res.return_data
            if (!d) {
              resolve()
              return
            }
            this.$wechat.config({
              debug: false,
              appId: d.appid,
              timestamp: d.timestamp,
              nonceStr: d.noncestr,
              signature: d.signature,
              jsApiList: ['getLocation']
            })
            this.$wechat.ready(() => resolve())
          })
          .catch(e => {
            console.warn('礼品登记 H5 微信 config 初始化失败', e)
            resolve()
          })
      })
    },
    // #endif
    normalizeField(field) {
      if (!field) return null

      // 统一处理大小写字段名
      const componenttype = (
        field.ComponentType ||
        field.componentType ||
        field.componenttype ||
        ''
      ).toLowerCase()

      const componentid =
        field.ComponentID || field.componentID || field.componentid || field.id

      // 处理选项数据 - 支持Options数组
      const options = this.normalizeOptions(
        field.Options || field.options || field.giftoptions || field.giftOptions || []
      )

      return {
        componenttype,
        componentid,
        options,
        fieldname: field.FieldName || field.fieldName || field.fieldname || '',
        fielddesc: field.FieldDesc || field.fieldDesc || field.fielddesc || '',
        required: field.Required !== undefined ? field.Required : !!field.required,
        defaultvalue: field.DefaultValue || field.defaultValue || field.defaultvalue || '',
        maxlength: field.MaxLength || field.maxLength || field.maxlength || 0,
        maximagecount: field.MaxImageCount || field.maxImageCount || field.maximagecount || 0,
        supportmultiple: field.SupportMultiple || field.supportMultiple || field.supportmultiple || false,
        validate: field.Validate || field.validate || 0,
        value: field.value || field.Value || ''
      }
    },
    normalizeOptions(options) {
      if (!options) return []
      if (!Array.isArray(options)) return []
      return options
        .map(opt => {
          if (typeof opt === 'string') {
            try {
              const parsed = JSON.parse(opt)
              return this.normalizeOption(parsed)
            } catch (e) {
              return { label: opt, value: opt }
            }
          }
          return this.normalizeOption(opt)
        })
        .filter(Boolean)
    },
    normalizeOption(opt) {
      if (!opt) return null
      // 统一处理大小写字段名,转换为小写格式
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
    },
    async handleSubmit() {
      if (this.submitting) return
      if (!this.activityId) return this.$msg('参数错误')

      // 校验与构建提交数据（与 warranty register 一致，由表单组件负责）
      try {
        await this.$refs.giftForm.validate()
      } catch {
        return
      }
      // #ifdef H5
      // 开启了校验时，提交前必须校验验证码
      if (this.$refs.giftForm.getNeedSmsVerify && this.$refs.giftForm.getNeedSmsVerify()) {
        const mobile = this.$refs.giftForm.getMobileForVerify && this.$refs.giftForm.getMobileForVerify()
        const code = this.$refs.giftForm.getSmsCode ? String(this.$refs.giftForm.getSmsCode()).trim() : ''
        if (!code) {
          return this.$msg('请输入验证码')
        }
        if (!mobile) {
          return this.$msg('请先填写手机号')
        }
        try {
          await apiValidateSmsVerifyCode({
            MemberLogin: this.memberlogin || '',
            Mobile: mobile,
            OpenID: this.openId || '',
            Code: code
          })
        } catch (err) {
          return this.$msg(err && err.return_msg ? err.return_msg : '验证码错误')
        }
      }
      // #endif
      const formDataArray = this.$refs.giftForm.buildSubmitData()

      // EnableLocationLimit 为 true 时才获取定位与逆解析信息（省市区街道 id + 详细地址）
      if (this.activityInfo.EnableLocationLimit) {
        await this.getLocationAndAddress()
        // 参照大转盘：需要定位但未授权时拦截，弹窗提示开启定位
        if (!this.currentLocation) {
          /* #ifdef MP-WEIXIN */
          this.$msg(LOCATION_MSG_MP)
          /* #endif */
          /* #ifdef H5 */
          this.$msg(LOCATION_MSG_H5)
          /* #endif */
          return
        }
      }

      let params
      // #ifdef H5
      params = {
        ActivityID: this.activityId,
        OpenID: this.openId || '', // H5 从路由参数取
        MemberLogin: this.memberlogin || '',
        // 省市区街道：按接口约定传 id；未获取定位则传 0
        Province: Number(this.currentAddressInfo?.provinceid || 0),
        City: Number(this.currentAddressInfo?.cityid || 0),
        Area: Number(this.currentAddressInfo?.areaid || 0),
        Street: Number(this.currentAddressInfo?.streetid || 0),
        // Address 仅传详细地址（不包含省市区街道名称）
        Address: this.currentAddressInfo?.address || '',
        Longitude: Number(this.currentLocation?.longitude || 0),
        Latitude: Number(this.currentLocation?.latitude || 0),
        FormData: formDataArray
      }
      if (this.$refs.giftForm.getNeedSmsVerify && this.$refs.giftForm.getNeedSmsVerify()) {
        params.Code = this.$refs.giftForm.getSmsCode() || ''
      }
      // #endif
      // #ifdef MP-WEIXIN
      // 小程序：openId 从路由参数取，其他用户信息由 auth-button 写入 Vuex/storage
      params = {
        ActivityID: this.activityId,
        OpenID: this.openId || '',
        UnionID: this.unionId || uni.getStorageSync('unionId') || '',
        NickName: (this.$store && this.$store.state && this.$store.state.NickName) || '',
        Avatar: (this.$store && this.$store.state && this.$store.state.HeadPath) || '',
        Mobile: uni.getStorageSync('user_mobile') || '',
        // 省市区街道：按接口约定传 id；未获取定位则传 0
        Province: Number(this.currentAddressInfo?.provinceid || 0),
        City: Number(this.currentAddressInfo?.cityid || 0),
        Area: Number(this.currentAddressInfo?.areaid || 0),
        Street: Number(this.currentAddressInfo?.streetid || 0),
        // Address 仅传详细地址（不包含省市区街道名称）
        Address: this.currentAddressInfo?.address || '',
        Longitude: Number(this.currentLocation?.longitude || 0),
        Latitude: Number(this.currentLocation?.latitude || 0),
        FormData: formDataArray
      }
      // #endif

      this.submitting = true
      try {
        const res = await apiSubmitRegistration(params)
        if (this.$ck(res)) {
          const data = res.return_data || {}
          const recordId = data.RecordId || 0
          const url = `./success?activityid=${this.activityId}&recordid=${recordId}&openid=${encodeURIComponent(this.openId || '')}&m=${encodeURIComponent(this.memberlogin || '')}`
          uni.redirectTo({ url })
        } else {
          this.$msg(res.return_msg || '提交失败')
        }
      } catch (error) {
        this.$msg(error?.return_msg || '提交失败')
      } finally {
        this.submitting = false
      }
    },
    goRecords() {
      uni.navigateTo({
        url: `./records?activityid=${this.activityId}&openid=${encodeURIComponent(this.openId || '')}&m=${encodeURIComponent(this.memberlogin || '')}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';

/* 与 custom-scan 一致的容器与背景图层级 */
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

.submit-btn {
  height: 80rpx; 
  border-radius: 44rpx;
  line-height: 80rpx;
  text-align: center;
  border: none;

  &::after {
    border: none;
  }

  &.disabled {
    background: #cccccc !important;
    color: #ffffff !important;
  }
}
</style> 
