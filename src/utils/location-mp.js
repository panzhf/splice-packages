import QQMapWX from './qqmap-wx-jssdk.js'
import { specialDistrict } from 'packages/config/custom'
import { apiGetBackWardsLocation } from 'packages/api/common'
import { ck as $ck } from 'packages/utils/index'
import { toLowerKey as $toLowerKey } from 'miduo-utils'

// #ifndef MP-CLOUDSHOP || MP-MEMBER
import wxLog from './wx-log' 
// #endif
// #ifdef H5-ACT
import { getQuery } from './function'
// #endif
export function getLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success(res) {
        resolve(res)
      },
      fail(err) {
        // #ifndef MP-CLOUDSHOP || MP-MEMBER
        wxLog && wxLog.error({
          type: 'getLocation fail location',
          data: JSON.stringify(err)
        })
        // #endif 
        if (
          err.errMsg === 'getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF' ||
          err.errMsg === 'getLocation:fail system permission denied'
        ) {
          // 安卓没有开启定位总开关
          // 苹果没有开启定位总开关 或 定位权限没有授权给微信
          resolve({
            longitude: '',
            latitude: '',
            status: 1
          })
          return
        }
        if (err.errMsg === 'getLocation:fail:system permission denied') {
          // 安卓定位权限没有授权给微信
          uni.showModal({
            title: '温馨提示',
            content: '检测到微信未开启定位权限，是否去设置打开？',
            confirmText: '去开启',
            cancelText: '取消',
            success({ confirm }) {
              if (confirm) {
                wx.openAppAuthorizeSetting()
              } else {
                reject({
                  longitude: '',
                  latitude: ''
                })
              }
            }
          })
        }
        uni.getSetting({
          success({ authSetting }) {
            if (!authSetting['scope.userLocation']) {
              uni.showModal({
                title: '温馨提示',
                content: '检测到小程序未开启定位权限，是否去设置打开？',
                confirmText: '去开启',
                cancelText: '取消',
                success({ confirm }) {
                  if (confirm) {
                    uni.openSetting({
                      success({ authSetting }) {
                        if (authSetting['scope.userLocation']) {
                          getLocation().then(res => {
                            resolve(res)
                          })
                        } else {
                          resolve({
                            longitude: '',
                            latitude: ''
                          })
                        }
                      }
                    })
                  } else {
                    resolve({
                      longitude: '',
                      latitude: ''
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  })
}

/*逆解析多个端公用*/
export function reverseGeocoder(latitude, longitude) {
  return new Promise((resolve, reject) => {
    if (latitude && longitude) {
      // 多个key均衡使用频率
      const keys = ['CFXBZ-JJPW6-HNSSY-E5ENG-WOKW5-WHBDJ', '2XBBZ-N52KU-PTRVC-2YG4P-64OE6-BNBVD']
      const key = keys[new Date().getTime() % keys.length]
      const qqmapsdk = new QQMapWX({
        key
      })
      qqmapsdk.reverseGeocoder({
        location: {
          latitude,
          longitude
        },
        success(res) {
          if (res.status === 0) {
            let { province, city, district } = res.result.address_component
            const town = res.result.address_reference?.town?.title || ''
            const replaceName = (province === city ? city : province + city) + district
            if (!district || specialDistrict.includes(district)) {
              district = town
            }
            resolve({
              province,
              city,
              district,
              town,
              address: res.result.address,
              street:
                res.result.address.replace(replaceName, '') +
                res.result?.formatted_addresses?.recommend.replace(district, '')
            })
          } else {
            reject(new Error('location is null'))
          }
        },
        fail(err) {
          reject(err)
        }
      })
    } else {
      reject(new Error('latitude or longitude is null'))
    }
  })
}

export function chooseLocation(skipChoose) {
  return new Promise((resolve, reject) => {
    getLocation()
      .then(res => {
        const d = res.latitude && res.longitude
        if ((res.status && !d) || (!res.status && d)) {
          // 有经纬度，会员、云店不用选点，直接接口解析地址
          if (d && !skipChoose) {
            return resolve({
              latitude: res.latitude,
              longitude: res.longitude
            })
          }
          uni.chooseLocation({
            success: function (res) {
              if (res.address) {
                resolve({
                  latitude: res.latitude,
                  longitude: res.longitude,
                  address: res.address.trim() || ''
                })
              } else {
                reject(false)
              }
            }
          })
        }
      })
      .catch(err => {
        wxLog.error({
          type: 'getLocation catch location',
          data: JSON.stringify(err)
        })
      })
  })
}

// 逆解析,根据经纬度解析地址
export function GetBackwardsLocation(lanAndLat) {
  return new Promise((resolve, reject) => {
    reverseGeocoder(lanAndLat.latitude, lanAndLat.longitude).then(resData => {
      if (resData) {
        const { province, city, district, town = '' } = resData
        const replaceField = (district === town ? '' : district) || city || province
        const locAddress = lanAndLat.address.split(replaceField)
        const backAddress = resData.address.split(replaceField)
        // console.log('replaceField', replaceField)
        // console.log('locAddress', locAddress)
        // console.log('backAddress', backAddress)
        let address =
          (locAddress.length && locAddress[locAddress.length - 1]) ||
          (backAddress.length && backAddress[backAddress.length - 1])
        // console.log('address', address)
        let data = {
          lonandlat: lanAndLat.latitude + ',' + lanAndLat.longitude,
          address,
          province,
          city,
          town: district === town ? '' : town, // 镇/街道
          district
        }
        resolve(data)
      } else {
        reject(false)
      }
    })
  })
}

// 使用接口逆解析地址
export async function getApiLocationInfo(data) {
  let params = data
  // 其他附加数据
  let otherData = {}
  // #ifdef H5-ACT
  params = {
    lng: data.longitude,
    lat: data.latitude,
    memberlogin: getQuery('m') || getQuery('memberlogin')
  }
  // #endif
  // #ifdef MP-RETAIL || MP-SALE
  params = {
    lng: data.longitude,
    lat: data.latitude
  }
  // #endif
  return new Promise((resolve, reject) => {
    apiGetBackWardsLocation(params).then(res => {
      res = $toLowerKey(res, true)
      if ($ck(res)) {
        let provinceid,
          provincename,
          cityname,
          cityid,
          areaname,
          areaid
        // #ifdef MP-CLOUDSHOP
        ;({
          provinceregionalid: provinceid,
          provinceregionalname: provincename,
          cityregionalname: cityname,
          cityregionalid: cityid,
          districtregionalname: areaname,
          districtregionalid: areaid
        } = res.return_data)
        // #endif
        // #ifdef MP-RETAIL || MP-SALE
        ;({
          province: provinceid,
          provincename,
          cityname,
          city: cityid,
          areaname: areaname,
          area: areaid
        } = res.return_data)
        const { street, streetname, address, streetnumber } = res.return_data
        const replaceField = address.includes(streetname) ? streetname : areaname || cityname
        const locAddress = address.split(replaceField)
        // 额外参数
        otherData = {
          streetid: street,
          streetname,
          address: streetnumber || (locAddress.length && locAddress[locAddress.length - 1]),
          lanandlat: data.latitude + ',' + data.longitude
        }
        // #endif
        // #ifndef MP-CLOUDSHOP || MP-RETAIL || MP-SALE
        ;({ provinceid, provincename, cityname, cityid, areaname, areaid } = res.return_data)
        // #endif
        // 逆解析结果中的详细地址，会员小程序与 H5（含 H5-ACT）均需要
        // #ifdef MP-MEMBER
        otherData.address = res.return_data.address
        // #endif  
        // #ifdef H5-ACT
        otherData.address = res.return_data.address
        // #endif
        resolve({
          provinceid,
          provincename,
          cityname,
          cityid,
          areaname,
          areaid,
          ...data,
          ...otherData
        })
      } else {
        reject()
      }
    })
  })
}

// 获取用户的地址位置
//是否跳转选点
export async function getUserLocation({
  skipChoose = true, // 是否用地图选点
  useTencentMapAPI = true, // 是否用腾讯地图逆解析 \否则接口解析
  isReturnProvinceCity = true // 是否返回省市区
} = {}) {
  let location = await chooseLocation(skipChoose)
  if (!location) {
    uni.showToast({
      title: '获取地理位置失败，请重试',
      icon: 'none'
    })
    // 显式返回，符合 consistent-return 规则
    return null // 直接返回，避免后续代码执行
  }
  if (!isReturnProvinceCity) return location

  // 使用三元运算符简化条件判断
  let locationInfo = useTencentMapAPI ? await GetBackwardsLocation(location) : await getApiLocationInfo(location)

  return locationInfo
}
