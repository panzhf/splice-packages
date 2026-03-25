import MD5 from 'blueimp-md5'
import { API_URL } from '@/config/index.js'
import { apiGetwxphonenumber } from '../api/address.js'
import { msg } from './index'
// #ifdef MP-CLOUDSHOP
import { toLowerKey } from 'miduo-utils'
// #endif
/** 对象属性值小写 */
function sortObjectKey(source) {
  if (!source) return
  let target = {}
  Object.keys(source)
    .sort()
    .forEach(key => {
      if (source[key] !== undefined) {
        target[key.toLowerCase()] = source[key]
      }
    })
  return _sortObjectKey(target)
}

function _sortObjectKey(source) {
  if (!source) return
  let target = {}
  Object.keys(source)
    .sort()
    .map(key => {
      if (source[key] !== undefined) {
        target[key] = source[key]
      }
    })
  return target
}

/** 将请求参数格式按键值对应的顺序转换成字符串 */
function paramStringify(data) {
  if (!data) return ''
  let str = []
  for (let i in data) {
    if (!Array.isArray(data[i])) {
      let val = data[i] + ''
      str.push(i + '' + val.toLowerCase())
    } else {
      let signVal = ''
      if (data[i].length > 0) {
        data[i].forEach(ele => {
          if (typeof ele === 'object') {
            var signelement = ''
            for (let item in sortObjectKey(ele)) {
              let eleVal = ele[item] + ''
              if (eleVal !== '') {
                signelement += item.toLowerCase() + eleVal.toLowerCase()
              }
            }
            signVal += signelement
          } else {
            signVal += ele
          }
        })
        str.push(i + '' + signVal)
      }
    }
  }
  return str.join('')
}

/** 导出加密请求头方法 */
export function defineConfig(data) {
  const timestamp = Math.round(new Date().getTime() / 1000).toString() || ''
  const Token = uni.getStorageSync('Token') || ''
  let tokenHeader = {}

  // 请求加参数加密
  let sortedParams = sortObjectKey(data)
  let signStr = paramStringify(sortedParams).trim()
  tokenHeader['TimeStamp'] = timestamp
  tokenHeader['Token'] = Token

  let sign = ''
  /* #ifdef H5-SCAN */
  const nonc = generateNumber(6)
  const apikey = getQuery('ctxId') // 扫码后url上截取的ctxid
  const openid = getQuery('openid') // 扫码后url上截取的openid
  tokenHeader['nonc'] = nonc
  tokenHeader['apikey'] = apikey
  tokenHeader['openid'] = openid
  sign = MD5(`${apikey}${nonc}${timestamp}${signStr}`)
  /* #endif */
  /* #ifndef H5-SCAN */
  sign = MD5(`${signStr}${timestamp}`)
  /* #endif */

  // 增加自定义headers
  Object.assign(tokenHeader, {
    Sign: sign
  })
  return tokenHeader
}

// 获取url参数对象
export function getUrlQuery(str) {
  let arr = str.split('&') // 先通过？分解得到？后面的所需字符串，再将其通过&分解开存放在数组里
  let obj = {}
  for (let i of arr) {
    obj[i.split('=')[0]] = i.split('=')[1] // 对数组每项用=分解开，=前为对象属性名，=后为属性值
  }
  return obj
}

// 获取url参数值
export function getQuery(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  let r = location.search.substring(1).match(reg)
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return ''
}

/**
 * 从 URL 字符串中取 key= 后的参数值（到 & 或 # 或结尾），仅匹配参数边界（? 或 & 后）
 * @param {string} str - URL 或查询字符串
 * @param {string} key - 参数名
 * @returns {string} 参数值，未找到返回空字符串
 */
export function getParam(str, key) {
  const prefix = key + '='
  let start = str.indexOf(prefix)
  while (start !== -1) {
    const prev = start === 0 ? '?' : str[start - 1]
    if (prev === '?' || prev === '&') {
      const valueStart = start + prefix.length
      let end = str.indexOf('&', valueStart)
      if (end === -1) end = str.indexOf('#', valueStart)
      if (end === -1) end = str.length
      return str.substring(valueStart, end).trim()
    }
    start = str.indexOf(prefix, start + 1)
  }
  return ''
}
// 跳转小程序
export function redirectToMp({ appId = '', path = '', envVersion = 'release' } = {}) {
  if (!appId && !path) return msg('跳转小程序失败，请检查小程序ID或页面路径是否正确')
  if (path && !path.startsWith('/')) path = `/${path}`
  uni.navigateToMiniProgram({
    appId,
    path,
    envVersion,
    fail(err) {
      // 打开失败
      if (!err.errMsg.includes('cancel')) {
        msg('跳转小程序失败，请检查小程序ID或页面路径是否正确')
      }
    }
  })
  return
}

// 转换导购小程序的路径
export function getGuideChangePath(link, memberlogin) {
  let url = encodeURIComponent(link)
  return `/brand/change?fromPage=guideassistant&m=${memberlogin}&url=${url}`
}

/**
 * 上传图片
 * @param urlSuf 请求路径‘api/’之后部分
 * @param imgSrc 图片路径
 */
export function uploadImage(urlSuf, imgSrc) {
  return new Promise((resolve, reject) => {
    uni.showLoading({
      title: '请稍等...',
      mask: true
    })
    let url = API_URL + urlSuf
    uni.uploadFile({
      url: url,
      filePath: imgSrc,
      header: {
        ...defineConfig({}),
        'content-type': 'multipart/form-data'
      },
      name: 'path',
      formData: {
        path: imgSrc
      },
      success: res => {
        let _res = JSON.parse(res.data)
        if (_res.return_code === 0) {
          resolve(_res)
        } else {
          uni.showToast({
            icon: 'none',
            mask: true,
            title: _res.return_msg
          })
          reject(_res)
        }
        uni.hideLoading()
      },
      fail: err => {
        let _err = JSON.parse(err.data)
        uni.showToast({
          icon: 'none',
          mask: true,
          title: _err.return_msg
        })
        reject(_err)
        uni.hideLoading()
      }
    })
  })
}
// 下载图片,下载到本地，供绘图使用
export function downLoadImg(url) {
  return new Promise(resolve => {
    let result = ''
    uni.getImageInfo({
      src: url,
      success(res) {
        result = res.path
        resolve(result)
      },
      fail() {
        uni.showToast({
          title: '下载图片失败',
          icon: 'none'
        })
      }
    })
  })
}

// 获取手机号码
export function getMobileNumber(data, mpInfo = {}) {
  return new Promise(resolve => {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
    let param = {}
    // 新版解密方式，只需手机号授权组件回调的code
    param.mobilecode = data.mobilecode
    apiGetwxphonenumber({ ...param, ...mpInfo }).then(res => {
      uni.hideLoading()
      // #ifdef MP-CLOUDSHOP
      res = toLowerKey(res, true)
      // #endif
      if (res.return_code === 0 && res.return_data?.phonenumber) {
        resolve(res.return_data)
      } else {
        uni.showToast({
          title: '获取手机号码失败，请重试',
          icon: 'none'
        })
        resolve({ phonenumber: '' })
      }
    })
  })
}

/**
 * 深拷贝
 */
export function deepClone(val) {
  if (Object.prototype.toString.call(val) === '[object Object]') {
    const obj = {}
    for (const key in val) {
      obj[key] = deepClone(val[key])
    }
    return obj
  } else if (Array.isArray(val)) {
    return val.map(item => deepClone(item))
  } else {
    return val
  }
}

/*生成随机数*/
// @ts-ignore
export function generateNumber(bit = 6) {
  // @ts-ignore
  const random = parseInt(Math.random() * 1000000)
  if (random < Math.pow(10, bit - 1)) {
    return generateNumber(bit)
  }
  return random
}

/** 获取dom 元素信息 */
export function getDomInfo(dom, _this, isAll = false) {
  return new Promise(resolve => {
    const query = uni.createSelectorQuery().in(_this)
    if (isAll) {
      query
        .selectAll(dom)
        .boundingClientRect(function (rects) {
          resolve(rects)
        })
        .exec()
    } else {
      query
        .select(dom)
        .boundingClientRect(function (data) {
          resolve(data)
        })
        .exec()
    }
  })
}
/** 属性值为 null 的值改成空字符串 '' */
export function replaceNullWithEmptyString(obj) {
  for (let prop in obj) {
    if (obj[prop] === null) {
      obj[prop] = ''
    } else if (typeof obj[prop] === 'object') {
      replaceNullWithEmptyString(obj[prop])
    }
  }
  return obj
}

export function _getSetting(field) {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      success(res) {
        const scope = 'scope.' + field
        uni.authorize({
          scope,
          success() {
            res.authSetting[scope] = true
            resolve(res)
          },
          fail() {
            reject()
          }
        })
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

/** 检查是否授权 */
export async function getSetting(field) {
  try {
    let setting = await _getSetting(field)
    return setting.authSetting['scope.' + field] ? Promise.resolve(setting) : Promise.reject()
  } catch (e) {
    return Promise.reject()
  }
}
/** 打开设置 */
export function openSetting() {
  return new Promise((resovle, reject) => {
    uni.openSetting({
      success(res) {
        resovle(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
export function getLocation({ loading, title = '获取位置信息中~' } = {}) {
  return new Promise((resolve, reject) => {
    loading && uni.showLoading({ title, mask: true })
    setTimeout(() => {
      uni.getLocation({
        type: 'gcj02',
        success(res) {
          resolve(res)
        },
        fail(err) {
          reject(err)
        },
        complete() {
          loading && uni.hideLoading()
        }
      })
    }, 500)
  })
}
// 校验身份证是否合法
export function isValidChineseID(id) {
  const idCardRegex =
    /^(^[1-9]\d{7}(0\d|1[0-2])([0-2]\d|3[01])\d{3}$)|(^[1-9]\d{5}(19|20)\d{2}(0\d|1[0-2])([0-2]\d|3[01])\d{3}(\d|X|x)$)$/
  return idCardRegex.test(id)
}

// 判断是否在时间范围内
export function isCurrentDateTimeInRange(startDateTime, endDateTime) {
  const currentTime = new Date()
  return currentTime >= new Date(startDateTime) && currentTime <= new Date(endDateTime)
}
