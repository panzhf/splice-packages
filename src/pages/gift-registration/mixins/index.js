import { apigetaddresscode } from 'packages/api/address.js'
// #ifdef H5-ACT
import { getQuery } from 'packages/utils/function'
// #endif
// #ifdef MP-WEIXIN
import { getLocation } from 'packages/utils/getLocation'
// #endif

// 定位失败提示文案与 mock 坐标（供表单等复用）
export const LOCATION_MSG_MP = '参与活动需要先开启手机微信定位权限哦~'
export const LOCATION_MSG_H5 = '亲，该活动需要获取地理位置才能参与，请确保手机微信定位权限已开启'
// 与 turntable/puzzle 一致的开发环境 mock 坐标
export const MOCK_LAT = 23.1288877474089
export const MOCK_LNG = 113.37376345608519

// openId 持久化缓存 key
const OPENID_STORAGE_KEY = 'gift_registration_openId'
// memberlogin 持久化缓存 key（H5 下与 openid 一致：优先路由参数，其次读缓存）
const MEMBERLOGIN_STORAGE_KEY = 'gift_registration_memberlogin'

/**
 * 获取 openId：优先路由参数，其次读缓存
 * @param {Object} options - onLoad 的 options
 * @returns {string}
 */
export function getOpenId(options = {}) {
  const fromParams = options.openid || options.openId || ''
  if (fromParams) {
    uni.setStorageSync(OPENID_STORAGE_KEY, fromParams)
    return fromParams
  }
  return uni.getStorageSync(OPENID_STORAGE_KEY) || ''
}

/**
 * 获取 memberlogin：优先路由参数（m / memberlogin），其次读缓存（H5 下做持久化）
 * @param {Object} options - onLoad 的 options
 * @returns {string}
 */
export function getMemberLogin(options = {}) {
  const fromParams = options.m || options.memberlogin || ''
  if (fromParams) {
    uni.setStorageSync(MEMBERLOGIN_STORAGE_KEY, fromParams)
    return fromParams
  }
  return uni.getStorageSync(MEMBERLOGIN_STORAGE_KEY) || ''
}

export const locationMixin = {
  data() {
    return {
      currentLocation: null,
      currentAddress: '',
      // 逆解析出来的省市区街道（id）与详细地址信息
      // { provinceid, cityid, areaid, streetid, provincename, cityname, areaname, streetname, address, lanandlat }
      currentAddressInfo: null
    }
  },
  methods: {
    // 获取当前位置（参照大转盘/拼图：MP 用 getLocation，H5 用 $wechat.getLocation，开发环境 H5 用 mock 坐标）
    // 注意：H5 在微信内使用时，需在页面内先初始化微信 JSSDK（wx.config 且 jsApiList 含 'getLocation'），否则定位会失败。见 index.vue 的 initWxConfigForLocation。
    async getCurrentLocation() {
      // #ifdef MP-WEIXIN
      const Location = await getLocation()
      if (Location.latitude && Location.longitude) {
        const location = { latitude: Location.latitude, longitude: Location.longitude }
        this.currentLocation = location
        return location
      } 
      // #endif
      // #ifdef H5
      // 开发环境使用 mock 坐标（与 turntable/puzzle 一致）
      if (process.env.NODE_ENV === 'development') {
        const location = {
          latitude: MOCK_LAT,
          longitude: MOCK_LNG
        }
        this.currentLocation = location
        return location
      }
      return new Promise(resolve => {
        if (!this.$wechat || typeof this.$wechat.getLocation !== 'function') { 
          return resolve(null)
        }
        const onFail = () => { 
          resolve(null)
        }
        this.$wechat.getLocation({
          type: 'gcj02',
          success: res => {
            const location = { latitude: res.latitude, longitude: res.longitude }
            this.currentLocation = location
            resolve(location)
          },
          fail: onFail,
          cancel: onFail
        })
      })
      // #endif
    },
    // 获取位置和地址信息
    async getLocationAndAddress() {
      this.$loading.show()
      try {
        const location = await this.getCurrentLocation()
        if (!location) {
          this.currentAddressInfo = null
          this.currentAddress = ''
          return null
        }

        // 通过 apigetaddresscode 逆解析，获取省市区/街道 id + 详细地址
        try {
          let params = {
            lng: location.longitude,
            lat: location.latitude
          }
          // #ifdef H5-ACT
          const m = getQuery('m') || getQuery('memberlogin')
          if (m) params.memberlogin = m
          // #endif
          // #ifdef H5
          params.openID = this.openId || ''
          if (this.memberlogin) params.memberlogin = this.memberlogin
          // #endif
          const res = await apigetaddresscode(params)
          if (!this.$ck(res)) {
            throw new Error(res?.return_msg || '逆解析失败')
          }
          const raw = this.$toLowerKey(res.return_data || {}, true)
          const normalized = {
            provinceid: Number(raw.provinceid || 0),
            cityid: Number(raw.cityid || 0),
            areaid: Number(raw.areaid || 0),
            streetid: Number(raw.streetid || 0),
            provincename: String(raw.provincename || ''),
            cityname: String(raw.cityname || ''),
            areaname: String(raw.areaname || raw.districtname || ''),
            streetname: String(raw.streetname || ''),
            address: String(raw.address || '')
          }
          this.currentAddressInfo = normalized
          const address =
            (normalized.provincename || '') +
            (normalized.cityname || '') +
            (normalized.areaname || '') +
            (normalized.streetname || '') +
            (normalized.address || '')
          this.currentAddress = address
          return { location, address, addressInfo: normalized }
        } catch (e) {
          // 逆解析失败时，保留经纬度，但地址/省市区街道 id 置空（提交时会兜底成 0）
          this.currentAddressInfo = null
          this.currentAddress = ''
          return { location, address: '', addressInfo: null }
        }
      } finally {
        this.$loading.hide()
      }
    }
  }
}
