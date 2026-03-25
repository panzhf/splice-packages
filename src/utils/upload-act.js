/**
 * h5-act 活动页面上传工具（无需登录）
 * 使用 gift-registration 的 Image 上传接口
 */
import { baseURL } from '@/config'
import { defineConfig, getQuery } from './function'
import { msg, compareVersion } from './index'
import { apiUploadImageURL, apiUploadMediaURL } from '../api/gift-registration'

const formatSize = (size = 0) => {
  if (size < 1024) return `${size}B`
  else if (size < 1024 * 1024) return `${Math.floor(size / 1024)}KB`
  else return `${Math.floor(size / 1024 / 1024)}MB`
}
const formatMedia = type => {
  if (type.length === 1) {
    if (type[0] === 'image') return '图片'
    else return '视频'
  } else return '文件'
}

/** 将 memberlogin 拼接到 URL 查询参数（从路由 getQuery('m') 获取） */
function appendMemberLoginToUrl(url) {
  const memberlogin = getQuery('m') || getQuery('memberlogin')
  if (!memberlogin) return url
  const sep = url.indexOf('?') === -1 ? '?' : '&'
  return `${url}${sep}memberlogin=${encodeURIComponent(memberlogin)}`
}

/**
 * 选择图片，根据 resolve 是否为空判断成功
 * `const paths = await chooseImg(); if (paths?.length) { ... }`
 * @param {Object} options - mediaType、sizeType、sourceType、limit、maxsize、count
 * @returns {Promise<string[]|undefined>} 选中图片的临时路径数组，取消或失败为 undefined
 */
export function chooseImg({
  mediaType = ['image'],
  sizeType = ['original', 'compressed'],
  sourceType = ['album', 'camera'],
  limit = true,
  maxsize = 10 * 1024 * 1024,
  count = 1
} = {}) {
  if (count > 9 || count < 1) {
    throw new Error('最多可选文件数：1~9')
  }
  // H5 无 SDKVersion，走 chooseImage
  const sysInfo = uni.getSystemInfoSync() || {}
  const newVersion = sysInfo.SDKVersion && compareVersion('2.10.0')
  return new Promise(resolve => {
    if (newVersion) {
      uni.chooseMedia({
        count,
        mediaType,
        sizeType,
        sourceType,
        success: ({ tempFiles }) => {
          if (limit && tempFiles.some(item => item.size > maxsize)) {
            return msg(`${formatMedia(mediaType)}最大${formatSize(maxsize)}`)
          }
          resolve(tempFiles.map(item => item.tempFilePath))
        },
        fail(res) {
          !res.errMsg.includes('cancel') && msg('请稍后重试')
          resolve()
        }
      })
    } else {
      uni.chooseImage({
        count,
        sizeType,
        sourceType,
        success: (res) => {
          const tempFiles = res.tempFiles || (res.tempFilePaths || []).map(p => ({ path: p }))
          if (limit && tempFiles.some(item => (item.size || 0) > maxsize)) {
            return msg(`图片最大${formatSize(maxsize)}`)
          }
          resolve(tempFiles.map(item => item.path || item.tempFilePath))
        },
        fail(res) {
          !res.errMsg.includes('cancel') && msg('请稍后重试')
          resolve()
        }
      })
    }
  })
}

/**
 * 上传图片
 * @param {String} filePath 文件路径
 * @returns {Promise}
 */
export function uploadImg(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: appendMemberLoginToUrl(`${baseURL}${apiUploadImageURL}`),
      filePath,
      name: 'Images',
      header: {
        ...defineConfig({})
      },
      success: res => {
        try {
          const d = JSON.parse(res.data)
          if (d.return_code === 0 || d.return_code === '0') {
            resolve(d)
          } else {
            msg(d.return_msg || '上传失败，请重试')
            reject(d)
          }
        } catch (e) {
          msg('上传失败，请重试')
          reject(e)
        }
      },
      fail: err => {
        msg('上传失败，请重试')
        reject(err)
      }
    })
  })
}

/**
 * 上传视频
 * @param {String} filePath 文件路径
 * @returns {Promise}
 */
export function uploadVideo(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: appendMemberLoginToUrl(`${baseURL}${apiUploadMediaURL}`),
      filePath,
      name: 'Video',
      header: {
        ...defineConfig({})
      },
      success: res => {
        try {
          const d = JSON.parse(res.data)
          if (d.return_code === 0 || d.return_code === '0') {
            resolve(d)
          } else {
            msg(d.return_msg || '上传失败，请重试')
            reject(d)
          }
        } catch (e) {
          msg('上传失败，请重试')
          reject(e)
        }
      },
      fail: err => {
        msg('上传失败，请重试')
        reject(err)
      }
    })
  })
}
