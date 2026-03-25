// 位置相关混入
export const locationMixin = {
  methods: {
    // 获取当前位置（仅返回位置信息，不获取地址）
    async getCurrentLocation(type) {
      return new Promise((resolve) => {
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            if (res.latitude && res.longitude) {
              resolve({
                latitude: res.latitude,
                longitude: res.longitude
              })
            } else {
              resolve(null)
            }
          },
          fail: (error) => { 

            // 检查小程序权限
            uni.getSetting({
              success: ({ authSetting }) => {
                if (!authSetting['scope.userLocation']) {
                  // 权限未授权
                  let tips = ''
                  switch (type) {
                    case 'signin':
                      tips = '检测到你没打开定位权限，需要位置权限才能进行签到，是否去设置打开？'
                      break
                    case 'signout':
                      tips = '检测到你没打开定位权限，需要位置权限才能进行签退，是否去设置打开？'
                      break
                    default: 
                      tips = '检测到你没打开定位权限，无法获取客户与您的距离，是否去设置打开？'
                      break
                  }
                  uni.showModal({
                    title: '提示',
                    content: tips,
                    confirmText: '去开启',
                    cancelText: '取消', 
                    success: (res) => {
                      if (res.confirm) {
                        uni.openSetting({
                          success: (settingRes) => {
                            if (settingRes.authSetting['scope.userLocation']) {
                              this.getCurrentLocation(type).then(result => resolve(result))
                            } else {
                              resolve(null)
                            }
                          }
                        })
                      } else {
                        resolve(null)
                      }
                    }
                  })
                } else {
                  // 权限已授权，但可能是手机定位服务未开启
                  uni.showModal({
                    title: '提示',
                    content: '微信不能确认你的位置，你可以通过以下操作提高微信的定位精准度，在位置设置中打开GPS和无线网络',
                    confirmText: '去开启',
                    cancelText: '取消',
                    success({ confirm }) {
                      if (confirm) {
                        wx.openAppAuthorizeSetting()
                      } else {
                        resolve(null)
                      }
                    }
                  })
                }
              },
              fail: () => resolve(null)
            })
          }
        })
      })
    },
    // 验证位置信息是否有效
    isValidLocation(location) {
      return location && location.latitude && location.longitude
    },
    // 获取地址信息（使用接口解析，失败时返回空字符串）
    async getAddressByLocation(location) {
      if (!location?.latitude || !location?.longitude) {
        return ''
      }

      try {
        const { apiGetCityCommanageDetail } = await import('@/api/banquet')
        const { getJsCode } = await import('@/utils/set-mp.js')
        
        // 获取 memberlogin
        let memberlogin = ''
        try {
          const userInfo = JSON.parse(uni.getStorageSync('currentUserInfo') || '{}')
          memberlogin = userInfo.memberlogin || ''
        } catch (e) {
          console.warn('获取用户信息失败:', e)
        }

        // 调用逆解析地址接口
        const cityData = await apiGetCityCommanageDetail({
          lat: location.latitude,
          lng: location.longitude,
          js_code: await getJsCode(),
          memberlogin: memberlogin
        })

        if (this.$ck(cityData, false)) {
          const data = cityData.return_data
          // 拼接省市区街道+地址
          const addressParts = []
          if (data.provincename) addressParts.push(data.provincename)
          if (data.cityname) addressParts.push(data.cityname)
          if (data.areaname) addressParts.push(data.areaname)
          if (data.forthstreet) addressParts.push(data.forthstreet)
          if (data.address) addressParts.push(data.address)
          
          return addressParts.join('') || ''
        }
      } catch (error) {
        console.warn('获取地址失败:', error)
      }

      return ''
    },
    // 获取位置和地址信息
    async getLocationAndAddress(type) {
      const location = await this.getCurrentLocation(type)
      if (!location) {
        return null
      }

      const address = await this.getAddressByLocation(location)
      return { location, address }
    },
    // 格式化距离显示
    // @param {Number} distance - 距离（米）
    // @param {String} unit - 单位，'m' 或 '米'，默认为 'm'
    formatDistance(distance, unit = 'm') {
      if (!distance && distance !== 0) return ''
      const meterUnit = unit === '米' ? '米' : 'm'
      const kmUnit = unit === '米' ? '公里' : 'km'
      if (distance < 1000) {
        return `${distance}${meterUnit}`
      } else if (distance < 10000) {
        return `${(distance / 1000).toFixed(1)}${kmUnit}`
      } else {
        return `>10${kmUnit}`
      }
    }
  }
} 

// 列表加载更多混入
export const listMixin = {
  data() {
    return {
      list: [],
      paging: {
        page: 1,
        pageSize: 10
      },
      hasMore: true,
      busy: false,
      loading: true
    }
  },
  methods: {
    // 重置数据
    async resetData() {
      this.list = []
      this.paging.page = 1
      this.hasMore = true
      this.busy = false
      this.loading = true
    },
    // 处理响应数据
    dealRes({ res, nextPage, listProp = 'list' }) {
      const data = res.return_data || {}
      const items = data[listProp] || []
      const total = data.total || 0

      if (nextPage === 1) {
        this.list = items
      } else {
        this.list = [...this.list, ...items]
      }

      this.paging.page = nextPage
      this.hasMore = this.list.length < total
      this.loading = false
    }
  }
}

