class Map {
  // 获得地理位置的授权状态 (1 同意过授权 2 拒绝过授权 3第一次询问授权)
  static async getLocationStatus() {
    return new Promise((resolve, reject) => {
      uni.getSetting({
        success: res => {
          if (res.authSetting['scope.userLocation'] === true) {
            resolve(1)
          } else if (res.authSetting['scope.userLocation'] === false) {
            resolve(2)
          } else {
            resolve(3)
          }
        },
        fail: res => {
          resolve(res)
        }
      })
    })
  }
  // 获取经纬度等信息
  static async getLocationInfo(type = 'gcj02') {
    // 可选值: wgs84 gcj02
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type,
        success(res) {
          resolve({ succeeded: true, data: res })
        },
        fail(res) {
          resolve({ succeeded: false, data: res })
        }
      })
    })
  }
  // 获取经纬度坐标信息
  static async getWgsInfo(type = 'gcj02') {
    let result = await Map.getLocationStatus()
    if (result === 1 || result === 3) {
      var locationInfo = await Map.getLocationInfo(type)
      if (locationInfo.succeeded) {
        let data = {
          longitude: locationInfo.data.longitude + '',
          latitude: locationInfo.data.latitude + ''
        }
        return { code: 200, data: { gps: data, errMsg: 'OK' } }
      } else {
        // 区分用户不开启GPS 和 拒绝授权 场景
        // getLocation:fail system permission denied (ios)
        // getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF (android)
        // errMsg: "getLocation:fail auth deny"
        if (
          locationInfo.data.errMsg.indexOf('fail auth deny') > -1 ||
          locationInfo.data.errMsg.indexOf('auth denied') > -1
        ) {
          return { code: 1001, data: { errMsg: '第一次授权就被拒绝' } }
        } else if (locationInfo.data.errCode || locationInfo.data.errMsg.indexOf('system permission denied') > -1) {
          return { code: 1002, data: { errMsg: '用户没开启GPS' } }
        } else {
          return { code: 1003, data: { errMsg: locationInfo.data.errMsg } }
        }
      }
    } else {
      return { code: 1004, data: { errMsg: '用户拒绝过授权' } }
    }
  }
}

export default Map
