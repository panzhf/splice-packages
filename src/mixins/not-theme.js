// 兼容非零售小程序主题色，零售已在全局注入
export const notThemeMixin = {
  data() {
    return {
      themeVars: ''
    }
  }
}
