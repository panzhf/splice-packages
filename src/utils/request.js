import { baseURL } from '@/config'

import { defineConfig } from './function'

async function request(config) {
  let { options, ...other } = config
  let url = baseURL + config.url
  const NEW_OPTIONS = { loading: true, loadingText: '加载中...', ...options }
  // 本地调试，需要在配置中心开启调试模式
  // openid在【商户后台】-【客户】-【用户列表】-【用户详情】
  let debugParam = {}
  if (process.env.NODE_ENV === 'development') {
    debugParam.DebugOpenID = 'o5yCX0kd0QONCMtUZaX7Of6N9m4k'
  }
  const res = await _request(
    {
      header: {
        'content-type': 'application/json',
        ...debugParam,
        ...defineConfig(config.data),
        DebugOpenID: '33'
      },
      ...other,
      url: url
    },
    NEW_OPTIONS
  )

  if ([0, '0'].includes(res.data.return_code) || [0, '0'].includes(res.data.Return_code)) {
    return Promise.resolve(res.data)
  } else {
    return Promise.reject(res.data)
  }
}

function _request(data, options) {
  return new Promise((resovle, reject) => {
    options.loading &&
      uni.showLoading({
        title: options.loadingText,
        mask: false
      })
    uni.request({
      ...data,
      success(res) {
        resovle(res)
      },
      fail(err) {
        reject(err)
      },
      complete() {
        options.loading && uni.hideLoading()
      }
    })
  })
}

export default request

export const httpPost = (url, data, options) => request({ url, data, method: 'POST', options })
export const httpGet = (url, data, options) => request({ url, data, method: 'GET', options })
