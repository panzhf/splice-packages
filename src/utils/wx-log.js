const mpLog = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null

let systemInfo = uni.getStorageSync('systemInfo')
if (!systemInfo) {
  const { brand, model, system } = uni.getSystemInfoSync()
  systemInfo = { brand, model, system }
  uni.setStorageSync('systemInfo', { brand, model, system })
}

// 自带系统信息上传日志，页面使用: this.$log.info()
// 传参格式为对象 {key: value}，若value非基础类型自行JSON.stringify转换。
const log = {
  info() {
    if (!mpLog) return
    mpLog.info({ ...arguments, systemInfo })
  },
  warn() {
    if (!mpLog) return
    mpLog.warn({ ...arguments, systemInfo })
  },
  error() {
    if (!mpLog) return
    mpLog.error({ ...arguments, systemInfo })
  },
  setFilterMsg(msg) {
    // 从基础库2.7.3开始支持
    if (!mpLog || !mpLog.setFilterMsg) return
    if (typeof msg !== 'string') return
    mpLog.setFilterMsg(msg)
  }
}
export default log

// #ifdef MP-DISTRIBUTION || MP-SALE || MP-RETAIL || MP-GUIDE
export const uploadLog = ({ logType = 'info', type = '', desc = '', data = {}, extend = {} } = {}) => {
  // logType: info | error | warn | setFilterMsg
  // type: login | logout | auth | scancode | asset | order | pay | upload | account | system | other
  let memberloginname = ''
  let memberlogin = ''
  let brandKey = 'currentBrandInfo'
  let personKey = 'personalInfo'
  const getStorage = key => JSON.parse(uni.getStorageSync(key) || '{}')
  // #ifdef MP-SALE
  personKey = 'currentUserInfo'
  // #endif
  // #ifdef MP-RETAIL
  brandKey = 'storeSettingInfo'
  personKey = 'accountinfo'
  // #endif
  const brand = getStorage(brandKey)
  memberloginname = brand.memberloginname
  memberlogin = brand.memberlogin
  // #ifdef MP-RETAIL
  memberloginname = brand.memberLoginName
  memberlogin = brand.memberLogin
  // #endif
  const { mobile } = getStorage(personKey)
  const extendInfo = {
    memberloginname,
    memberlogin,
    mobile,
    ...extend
  }
  log[logType]({
    type,
    desc,
    data: JSON.stringify(data || {}),
    extend: JSON.stringify(extendInfo)
  })
}
// #endif
