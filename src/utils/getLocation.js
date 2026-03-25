export async function getLocation() {
  let location = await _getLocation()
  if (location.longitude && location.latitude) {
    return Promise.resolve({
      longitude: location.longitude,
      latitude: location.latitude
    })
  } else {
    let setting = await _getSetting()
    if (!setting.authSetting['scope.userLocation']) {
      const modal = await _showModal({
        content: '检测到你没打开定位权限，是否去设置打开？',
        confirmText: '确认',
        cancelText: '取消'
      })
      if (modal.confirm) {
        await _openSetting()
        setting = await _getSetting()
        if (setting.authSetting['scope.userLocation']) {
          location = await getLocation()
          return Promise.resolve({
            longitude: location.longitude,
            latitude: location.latitude
          })
        } else {
          return Promise.resolve({
            longitude: '',
            latitude: ''
          })
        }
      } else {
        return Promise.resolve({
          longitude: '',
          latitude: ''
        })
      }
    } else {
      return Promise.resolve({
        longitude: '',
        latitude: ''
      })
    }
  }
}
export function _getLocation(type) {
  return new Promise(resolve => {
    uni.getLocation({
      type: type || 'gcj02',
      success(res) {
        resolve(res)
      },
      fail() {
        resolve({
          longitude: '',
          latitude: ''
        })
      }
    })
  })
}

export function _getSetting() {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
export function _openSetting() {
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
export function _showModal(opts) {
  return new Promise((resovle, reject) => {
    uni.showModal({
      content: opts.content,
      confirmText: opts.confirm || '确认',
      cancelText: opts.cancelText || '取消',
      success(res) {
        resovle(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
