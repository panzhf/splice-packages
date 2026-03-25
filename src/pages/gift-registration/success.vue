<template>
  <view class="gift-success-page flex flex-column p-r" :style="pageBgStyle">
    <image
      v-if="config.pageSetting.backgroundImage"
      class="success-page-bg" 
      :src="config.pageSetting.backgroundImage"
      mode="widthFix"
    />
    <!-- #ifdef MP-WEIXIN -->
    <title-bar :bgcolor="bgcolor" :textcolor="textcolor" :title="title" :is-back="showBack" />
    <!-- #endif -->
    <view v-if="configLoaded" class="success-wrapper" :style="{ paddingTop: top }">
      <view class="success-content">
        <image v-if="config.successIcon" class="success-image" :src="config.successIcon" mode="widthFix" />
        <view class="success-title" :style="tipTextStyle">
          {{ config.tipText.text || '登记成功' }}
        </view>
        <view class="success-link primary-btn plain" :style="detailLinkStyle" @tap="goRecords">查看登记详情</view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiGetActivity } from 'packages/api/gift-registration'
import { getOpenId, getMemberLogin } from './mixins'
import TitleBar from 'packages/components/title-bar/title-home.vue'

// 兼容接口 PascalCase / camelCase
const pick = (obj, ...keys) => {
  if (!obj) return undefined
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return undefined
}

const defaultConfig = {
  topNav: { title: '登记结果', backgroundColor: 'rgba(255, 255, 255, 0)', titleColor: '#000000' },
  pageSetting: { pageName: '登记结果', backgroundColor: '#fff', backgroundImage: '', topSpacing: 40 },
  successIcon: '',
  tipText: {
    text: '登记成功',
    fontSize: 15,
    fontWeight: 'bold',
    textColor: '#000000',
    detailLinkColor: '#2F7BFF',
    align: 'center',
    fontStyle: 'normal',
    letterSpacing: 0,
    backgroundColor: 'transparent'
  },
  detailButton: { textColor: '#FFA200', backgroundColor: '#FFFFFF' }
}

export default {
  components: { TitleBar },
  data() {
    return {
      activityId: 0,
      recordId: 0,
      openId: '',
      memberlogin: '',
      showBack: true,
      title: '登记结果',
      bgcolor: '#fff',
      textcolor: '#000',
      config: { ...defaultConfig },
      configLoaded: false
    }
  },
  computed: {
    // 顶部适配，与 index 一致
    top() {
      let style = ''
      const topSpacing = this.config.pageSetting.topSpacing ?? 30 + 10
      /* #ifdef MP-WEIXIN */
      const statusBarHeight = Number(uni.getSystemInfoSync().statusBarHeight) || 0
      style = `${44 + statusBarHeight + topSpacing * 2}px`
      /* #endif */
      /* #ifdef H5 */
      style = `${topSpacing * 2}px`
      /* #endif */
      return style
    }, 
    pageBgStyle() {
      return { backgroundColor: this.config.pageSetting.backgroundColor || '#fff' }
    },
    // 动态样式返回字符串，与 index.vue 一致，兼容小程序 :style 解析
    tipTextStyle() {
      const t = this.config.tipText
      if (!t) return ''
      const s = []
      const fs = t.fontSize || 20
      s.push(`font-size: ${Number(fs) * 2}rpx`)
      if (t.fontWeight) s.push(`font-weight: ${t.fontWeight}`)
      if (t.textColor) s.push(`color: ${t.textColor}`)
      if (t.align) s.push(`text-align: ${t.align}`)
      if (t.fontStyle) s.push(`font-style: ${t.fontStyle}`)
      if (t.letterSpacing != null) s.push(`letter-spacing: ${t.letterSpacing}px`)
      if (t.backgroundColor) s.push(`background-color: ${t.backgroundColor}`)
      return s.join(';')
    },
    detailLinkStyle() {
      const btn = this.config.detailButton || {}
      const tip = this.config.tipText || {}
      const color = btn.textColor || tip.detailLinkColor || '#FFA200'
      const bg = btn.backgroundColor || '#FFFFFF'
      const s = []
      s.push(`color: ${color}`)
      s.push(`border-color: ${color}`)
      s.push(`background-color: ${bg}`)
      return s.join(';')
    }
  },
  onLoad(options) {
    this.activityId = Number(options.activityid || options.id || 0)
    this.recordId = Number(options.recordid || 0)
    this.openId = getOpenId(options)
    this.memberlogin = getMemberLogin(options)
    this.showBack = getCurrentPages().length > 1
    this.getSuccessConfig()
  },
  methods: {
    normalizeImageUrl(url) {
      if (!url || typeof url !== 'string') return ''
      return url.trim().indexOf('//') === 0 ? `https:${url}` : url
    },
    getSuccessIconUrl(raw) {
      const s = pick(raw, 'SuccessIcon', 'successIcon')
      if (typeof s === 'string') return s
      return (s && pick(s, 'IconUrl', 'iconUrl')) || pick(raw, 'IconUrl', 'iconUrl') || ''
    },
    async getSuccessConfig() {
      if (!this.activityId) return
      this.$loading.show()
      try {
        const res = await apiGetActivity({
          activityID: this.activityId,
          openID: this.openId || '',
          memberLogin: this.memberlogin || ''
        })
        if (!this.$ck(res)) return

      const data = res.return_data || {}
      const raw = data.SuccessPageConfig || data.successPageConfig || {}
      const pageSetting = { ...defaultConfig.pageSetting, ...pick(raw, 'PageSetting', 'pageSetting') }
      const topNav = { ...defaultConfig.topNav, ...pick(raw, 'TopNav', 'topNav') }
      const tipTextRaw = pick(raw, 'TipText', 'tipText') || {}
      const detailBtnRaw = pick(raw, 'DetailButton', 'detailButton') || {}

      const bgImg = pick(pageSetting, 'BackgroundImage', 'backgroundImage')
      const successIconUrl = this.getSuccessIconUrl(raw)

      this.config = {
        topNav: {
          ...topNav,
          title:
            pick(topNav, 'Title', 'title') ?? pick(pageSetting, 'PageName', 'pageName') ?? defaultConfig.topNav.title,
          backgroundColor: pick(topNav, 'BackgroundColor', 'backgroundColor') ?? topNav.backgroundColor,
          titleColor: pick(topNav, 'TitleColor', 'titleColor') ?? topNav.titleColor
        },
        pageSetting: {
          ...this.config.pageSetting,
          pageName: pick(pageSetting, 'PageName', 'pageName') ?? pageSetting.pageName,
          backgroundColor: pick(pageSetting, 'BackgroundColor', 'backgroundColor') ?? pageSetting.backgroundColor,
          backgroundImage: bgImg ? this.normalizeImageUrl(String(bgImg)) : '',
          topSpacing: pick(pageSetting, 'TopSpacing', 'topSpacing') ?? pageSetting.topSpacing
        },
        successIcon: successIconUrl ? this.normalizeImageUrl(successIconUrl) : this.config.successIcon,
        tipText: {
          ...this.config.tipText,
          text: pick(tipTextRaw, 'Text', 'text') ?? defaultConfig.tipText.text,
          fontSize: pick(tipTextRaw, 'FontSize', 'fontSize'),
          fontWeight: pick(tipTextRaw, 'FontWeight', 'fontWeight'),
          textColor: pick(tipTextRaw, 'TextColor', 'textColor'),
          detailLinkColor: pick(tipTextRaw, 'DetailLinkColor', 'detailLinkColor'),
          align: pick(tipTextRaw, 'Align', 'align'),
          fontStyle: pick(tipTextRaw, 'FontStyle', 'fontStyle'),
          letterSpacing: pick(tipTextRaw, 'LetterSpacing', 'letterSpacing'),
          backgroundColor: pick(tipTextRaw, 'BackgroundColor', 'backgroundColor')
        },
        detailButton: {
          ...this.config.detailButton,
          textColor: pick(detailBtnRaw, 'TextColor', 'textColor') ?? this.config.detailButton.textColor,
          backgroundColor:
            pick(detailBtnRaw, 'BackgroundColor', 'backgroundColor') ?? this.config.detailButton.backgroundColor
        }
      }

      this.title = this.config.topNav.title || '登记结果'
      this.bgcolor = this.config.topNav.backgroundColor ?? '#fff'
      this.textcolor = this.config.topNav.titleColor ?? '#000'
      this.configLoaded = true
      } catch (e) {
        this.$msg(e?.return_msg || e?.message || '请求失败，请重试')
      } finally {
        this.$loading.hide()
      }
    },
    goRecords() {
      const q = `openid=${encodeURIComponent(this.openId || '')}&m=${encodeURIComponent(this.memberlogin || '')}`
      const url = this.recordId
        ? `./record-detail?recordid=${this.recordId}&activityid=${this.activityId || ''}&${q}`
        : `./records?activityid=${this.activityId}&${q}`
      uni.redirectTo({ url })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';

.gift-success-page {
  position: relative;
  min-height: 100vh;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  background: #fff;
}

.success-page-bg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 0;
  width: 100%;
  /* #ifdef H5 */
  width: 100%;
  margin: 0 auto;
  margin-bottom: -170rpx;
  transform: translateY(-170rpx);
  /* #endif */
}

.success-content {
  position: relative;
  z-index: 1;
  width: 100%;
  text-align: center;
  padding: 0 20rpx 40rpx;
}

.success-link.primary-btn {
  display: block;
  border-radius: 44rpx;
  width: 400rpx;
  margin: 0 auto;
  color: #FFA200;
}
.gift-success-page {
  min-height: 100vh;

  .success-image {
    width: 300rpx;
    margin: 0 auto 20rpx;
  }

  .success-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #222;
    margin-top: 20rpx;
    margin-bottom: 100rpx;
    text-align: center;
  }

  .success-link {
    margin-top: 20rpx;
    font-size: 26rpx;
  }
}
</style>
