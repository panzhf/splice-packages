// 此方法库禁止引入含有绝对路径文件
import wxLog from './wx-log'
/** 获取dom 元素信息 */
export function getDomInfo(dom, _this) {
  return new Promise(resolve => {
    const query = uni.createSelectorQuery().in(_this)
    query
      .select(dom)
      .boundingClientRect(data => {
        resolve(data)
      })
      .exec()
  })
}
// 下载图片
export function downLoadImg(url) {
  return new Promise(resolve => {
    uni.downloadFile({
      url,
      success(res) {
        resolve(res.tempFilePath)
      },
      fail(err) {
        wxLog.error({ function: 'downLoadImg', data: err })
        uni.showToast({
          title: '下载图片失败',
          icon: 'none'
        })
      }
    })
  })
}

// 获取图片信息
export function getImageInfo(url) {
  return new Promise(resolve => {
    uni.getImageInfo({
      src: url,
      success(res) {
        resolve(res)
      },
      fail(err) {
        wxLog.error({ function: 'getImageInfo', data: err })
        uni.showToast({
          title: '下载图片失败',
          icon: 'none'
        })
      }
    })
  })
}
// 3+2助手免登录：拼接跳转路径
export const formatPath = ({ path = '', scene = '' } = {}) => {
  // 零售有平台版和专属版
  if (['retailassistant', 'retailspecial'].includes(scene) && path && !path.startsWith('/pages/transfer/index')) {
    const token = uni.getStorageSync('storessotoken')
    // 店员没有免登录，保持原链接
    if (token) {
      path = `/pages/transfer/index?token=${token}&url=${encodeURIComponent(path)}`
    }
  }
  if (scene === 'guideassistant' && path && !path.startsWith('/pages/transfer/index')) {
    path = `/pages/transfer/index?token=${uni.getStorageSync('guidessotoken')}&url=${encodeURIComponent(path)}`
  }
  return path
}
