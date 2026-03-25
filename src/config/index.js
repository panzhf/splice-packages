/* 配置提交一次即可，后续没有新增配置时请勿提交 */

let domain = '' // 基础域名
let baseURL = '' // 请求接口域名
let staticDomain = '' // 静态域名
let staticVer = '' // 静态站版本号
// #ifdef MP-WEIXIN
// 获取第三方配置
export function getExtConfig() {
  if (process.env.NODE_ENV === 'production') {
    console.log('ext', uni.getExtConfigSync())
    return uni.getExtConfigSync ? uni.getExtConfigSync() : {}
  }
  return {
    memberLogin: '10003911',
    appID: 'wx5e946f6691f8d27e'
  }
}
domain = 'https://mini.t.miduonet.com'
baseURL = `${domain}/memberclub/api/v1/`
// 规则中心域名
export const ruleUrl = `${domain}/rule/`
// 投诉页面域名
export const usercenterUrl = 'https://my.t.miduonet.com/'
// 静态域名
staticDomain = 'https://stati.t.miduonet.com/'
// #endif

// #ifdef H5-ACT
baseURL = `/api/`
staticDomain = window.staticurl
staticVer = window.ver
if (process.env.NODE_ENV === 'development') {
  // baseURL = 'http://192.168.5.248:8065/api/'
  baseURL = '/mkt/api/'
  staticDomain = 'https://stati.t.miduonet.com/'

}
// #endif
// #ifdef H5-SCAN
staticDomain = window.staticurl
staticVer = window.ver
if (process.env.NODE_ENV === 'development') {
  baseURL = `/mock`
  staticDomain = 'https://stati.t.miduonet.com/'
}
// #endif

export { baseURL, staticVer }
/**
 * 动态配置静态资源路径
 * e.g 会员小程序图片 `${staticURL()}avatar.png`
 *      组件库/包图片 `${staticURL(true)}scan.png`
 * @param {Boolean} isPackages 默认小程序图片，传true表示组件库/包的图片
 * @returns String
 */
export const staticURL = (isPackages = false) => {
  if (isPackages) return `${staticDomain}activity-packages/`
  return `${staticDomain}user-mp/`
}
