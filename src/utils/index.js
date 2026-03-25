import MD5 from 'blueimp-md5'

/**
 * 接口统一判断，挂载Vue使用 this.$ck(res) {}
 * @param {Object} res 接口响应
 * @param {Boolean} showMsg 是否自动提示错误信息
 */
export const ck = (
  res = {},
  showMsg = true,
  { codeKey = 'return_code', msgKey = 'return_msg', successCode = [0, '0'], excludeCode = [30006, '30006'] } = {}
) => {
  if (successCode.includes(res[codeKey])) {
    return true
  } else {
    if (!showMsg) return false
    if (!excludeCode.includes(res[codeKey])) {
      msg(res[msgKey])
    }
    return false
  }
}
/**
 * 提示，挂载Vue使用 this.$msg('hello')
 * @param {String} title 提示信息
 * @param {Object} config 配置图标、时间等
 */
export const msg = (title, { icon = 'none', duration = 2000, mask = true } = {}) => {
  title &&
    uni.showToast({
      title,
      duration,
      mask,
      icon
    })
}

export const loading = {
  show(title = '加载中') {
    uni.showLoading({
      title,
      mask: true
    })
  },
  hide() {
    uni.hideLoading()
  }
}

export function getPages() {
  return getCurrentPages()
}

// 获取当前页面实例
export function getCurrentPage(pages) {
  !pages && (pages = getPages())
  return pages[pages.length - 1]
}

// 根据页面层级获取实例，默认当前页面
export const getPage = (delta = 0) => {
  const pages = getCurrentPages()
  const page = pages[pages.length - delta - 1]
  let pageIns = null
  /* #ifdef MP */
  pageIns = page.$vm.$mp
  /* #endif */
  /* #ifdef H5 */
  pageIns = page.$mp
  /* #endif */
  return pageIns
}

// 将十六进制颜色转化为rgba格式
export function hex2rgb(color, opacity = 1) {
  if (!color) return ''
  return `rgba(${parseInt('0x' + color.slice(1, 3))}, ${parseInt('0x' + color.slice(3, 5))}, ${parseInt(
    '0x' + color.slice(5, 7)
  )}, ${opacity})`
}

// 基础库比较
export function compareVersion(v2) {
  let v1 = uni.getSystemInfoSync().SDKVersion
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return true
    } else if (num1 < num2) {
      return false
    }
  }

  return false
}

// 截取物流码
// https://miduo1031.yuque.com/czwdbc/cv2gk6/kgepcy
export function extractCode(code) {
  code = code.toString()
  if (code === '') return ''
  if (code.includes('-') && code.includes('/')) {
    return code.substring(code.lastIndexOf('-') + 1)
  } else if (['&c=', '?t=', '?c='].some(elem => code.includes(elem))) {
    return code.substring(code.lastIndexOf('=') + 1)
  } else if (code.includes('/')) {
    return code.substring(code.lastIndexOf('/') + 1)
  } else if (code.includes('[')) {
    return code.substring(0, code.indexOf('['))
  }
  return code
}
// #ifdef H5
// 微信开发者工具
export const isDevtool = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('wechatdevtools')
}
// #endif

// 图片预览，current是必须的，若没有urls则用current
export const previewImage = ({ current, urls = [] }) => {
  const formatUrl = url => url.replace(/^(http:)?(\/\/)/, 'https:$2')
  current = formatUrl(current)
  urls = urls.map(formatUrl)
  if (urls.length === 0) urls = [current]
  uni.previewImage({
    current,
    urls
  })
}
// 红包类型 0-微信红包；1-红包零钱；2-企业付款红包；3-品牌红包；
export function hbTypeName(v) {
  const o = {
    0: '微信红包',
    1: '红包零钱',
    2: '企业付款红包',
    3: '品牌红包'
  }
  return o[v] || ''
}

/**
 * 生成唯一ID（基于MD5哈希，16位十六进制字符串）
 * @returns {String} 16位唯一ID
 * @example
 * generateUniqueId() // 'a1b2c3d4e5f6g7h8'
 */
export function generateUniqueId() {
  const timestamp = Date.now()
  const random1 = Math.floor(Math.random() * 1000000)
  const random2 = Math.floor(Math.random() * 1000000)
  const random3 = Math.random().toString(36).substring(2)
  const performanceNow = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Math.random()
  const uniqueStr = `${timestamp}_${random1}_${random2}_${random3}_${performanceNow}`
  const md5Hash = MD5(uniqueStr)
  // 返回前16位
  return md5Hash.substring(0, 16)
}
