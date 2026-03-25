import { staticURL } from '@/config'
export const userMixin = {
  data() {
    return {}
  },
  create() {},
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return statusBarHeight
    },
    // 主题
    theme() {
      return this.customScanConfigs?.WinningPage?.theme || 1
    },

    // 是否显示奖项,中奖页与重复中奖分开设置
    showPrize() {
      if (this.theme === 2) {
        const winningShowPrize = this.customScanConfigs?.WinningPage?.showPrize
        const reuseShowPrize = this.customScanConfigs?.ReuseWinningPage?.showPrize

        return (this.isFristAward ? winningShowPrize : reuseShowPrize) ?? winningShowPrize ?? true
      }
      return true
    },

    // 头部的标题
    popTitleImg() {
      if (!this.winPageSetting) return staticURL(true) + ''
      if (this.theme === 2) {
        return this.winPageSetting.winTopImg2
      }
      return this.winPageSetting.winTopImg
    },
    themeStyleClass() {
      switch (this.theme) {
        case 2:
          return 'theme-style-second'
        default:
          return ''
      }
    },
    // 奖项的样式
    customAwardTextStyle() {
      let styleStr = ''
      let { prizeColor, prizeBgColor } = this?.winPageSetting || {}
      if (this.theme === 2) {
        if (prizeColor) {
          styleStr += `color: ${prizeColor};`
        }
        if (prizeBgColor) {
          styleStr += `background: ${prizeBgColor};`
        }
      } else if (this.theme === 1) {
        styleStr += this.customTextBaseStyle('prizeBase', this.baseWinPageSetting)
      }
      return styleStr
    },
    customPrizeTipStyle() {
      if (this.theme === 1) {
        return this.customTextBaseStyle('prizeTip', this.baseWinPageSetting)
      }
    },
    customJoinTimeBaseStyle() {
      if (this.theme === 1) {
        return this.customTextBaseStyle('joinTimeBase', this.winPageSetting)
      }
    },

    // 指令文案定制样式
    customCommandTextStyle() {
      let styleStr = ''
      styleStr += this.customTextBaseStyle('commandText', this.winPageSetting)
      return styleStr
    },
    // 奖项内容具体样式配置
    customPrizeContentStyle() {
      let styleStr = ''
      styleStr += this.customTextBaseStyle('prizeNameText', this.winPageSetting)
      return styleStr
    },

    contentStyle() {
      // 顶部适配
      let style = ''
      /* #ifdef MP-WEIXIN */
      if (this.theme === 2) {
        let top = `${44 + this.statusBarHeight}px`
        style = `margin-top: ${top};height: calc(100vh - ${top});`
      }
      /* #endif */
      return style
    },

    // 给奖品重新排序
    list() {
      const list = []
      if (this.prizeInfo.IsProduct) {
        list.push({
          IsProduct: 1
        })
      }
      if (this.prizeInfo.IsGetVolume && this.prizeInfo.VolumeType === 2) {
        list.push({
          IsGetVolume: 1
        })
      }
      if (this.prizeInfo.IsGetHb) {
        list.push({
          IsGetHb: 1
        })
      }
      if (this.prizeInfo.IsGetVolume && this.prizeInfo.VolumeType !== 2) {
        list.push({
          IsGetVolume: 1
        })
      }
      if (this.prizeInfo.IsGetDraw) {
        list.push({
          IsGetDraw: 1
        })
      }
      if (this.prizeInfo.Point) {
        list.push({
          Point: 1
        })
      }
      return list
    }
  },
  watch: {
    theme: {
      handler() {
        // 默认图改
        this.setDefaultIcon()
      },
      immediate: true
    },
    'prizeInfo.VolumeType': {
      handler() {
        // 默认图改
        this.setDefaultIcon()
      },
      immediate: true
    }
  },
  methods: {
    customTextBaseStyle(key, info) {
      let styleStr = ''
      const textFontSize = info?.[`${key}FontSize`] || 0
      const textColor = info?.[`${key}Color`] || ''
      const textBgColor = info?.[`${key}BgColor`] || ''
      const textTopGap = info?.[`${key}TopGap`] || 0
      if (textColor) {
        styleStr += `color: ${textColor};`
      }
      if (textFontSize) {
        styleStr += `font-size: ${textFontSize * 2}rpx; line-height: ${textFontSize * 2 + 2}rpx;`
      }
      if (textBgColor) {
        styleStr += `background: ${textBgColor};`
      }
      if (textTopGap) {
        styleStr += `margin-top: ${textTopGap * 2}rpx`
      }
      return styleStr
    },
    // 奖品默认图改
    setDefaultIcon() {
      if (this.theme === 2) {
        this.hongImg = staticURL(true) + 'scan/award/hb.png'
        this.kaquanImg =
          staticURL(true) + (this.prizeInfo.VolumeType === 3 ? 'scan/award/unlock-hb.png' : 'scan/award/volume.png')
        this.jfImg = staticURL(true) + 'scan/award/point.png'
        this.chanceImg = staticURL(true) + 'scan/award/change.png'
      } else {
        this.hongImg = staticURL(true) + 'hong.jpg'
        this.kaquanImg = staticURL(true) + 'kaquan.jpg'
        this.jfImg = staticURL(true) + 'jifengIcon.jpg'
        this.chanceImg = staticURL(true) + 'jihui.jpg'
      }
    },
    // 解锁红包倒计时的样式
    unlockTimeStyle(index) {
      if (index === 0) {
        return this.prizeBtnStyle(index)
      }
      // 显式返回，符合 consistent-return 规则
      return {}
    },
    // 指引按钮的样式
    prizeBtnStyle(index) {
      let styleObj = {}
      if (this.theme === 2) {
        let { receiveBtnColor, receiveBtnBgColor } = this.winPageSetting
        if (index !== 0) {
          let { tipColor } = this.winPageSetting
          if (tipColor) {
            styleObj.color = tipColor
          }
        } else {
          if (receiveBtnColor) {
            styleObj.color = receiveBtnColor
          }
          if (receiveBtnBgColor) {
            styleObj.background = receiveBtnBgColor
          }
        }
      } else {
        styleObj.background = `url(${this.customImg.btnBg}) 100%/100%`
      }
      return styleObj
    }
  }
}
