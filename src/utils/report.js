import { apiBIReport } from 'packages/api/report'
import dayjs from 'dayjs'
import { toLowerKey } from 'miduo-utils'
import { encrypt } from './crypto-aes'

function getStorage(key) {
  const storageData = uni.getStorageSync(key)
  if (storageData) {
    try {
      return toLowerKey(JSON.parse(storageData))
    } catch (e) {
      return null
    }
  }
  return null
}
function mergeData(data, additionalData) {
  if (additionalData && typeof additionalData === 'object') {
    return { ...data, ...additionalData }
  }
  return data
}
export const reportLog = options => {
  return new Promise(resolve => {
    // 固定参数
    let data = {
      eventCode: options.scene,
      date: dayjs().format('YYYYMMDD'),
      source: 1,
      isActive: 1
    }
    let brandKey = 'currentBrandInfo'
    let personKey = 'personalInfo'

    // #ifdef MP-SALE
    personKey = 'currentUserInfo'
    // #endif
    // #ifdef MP-RETAIL
    brandKey = 'storeSettingInfo'
    personKey = 'accountinfo'
    // #endif
    const brand = getStorage(brandKey)
    const person = getStorage(personKey)
    if (!brand || !person) return false
    // 固定参数
    data = mergeData(data, {
      memberLogin: brand.memberlogin,
      memberLoginName: brand.memberloginname
    })
    // #ifdef MP-DISTRIBUTION
    data = mergeData(data, {
      dealerId: brand.dealerid,
      dealerName: brand.dealername,
      roleType: brand.roletype,
      openid: encrypt(person?.openid)
    })
    // #endif
    // #ifdef MP-RETAIL
    data = mergeData(data, {
      storeId: brand.storeid,
      storeName: brand.mainpartname,
      openid: encrypt(person?.openid)
    })
    // #endif
    // #ifdef MP-GUIDE
    data = mergeData(data, {
      salerId: brand.salerid,
      openid: encrypt(person?.openid)
    })
    // #endif
    // #ifdef MP-SALE
    data = mergeData(data, {
      salesmanId: person.salesmanid
    })
    const account = getStorage('accountinfo')
    account &&
      (data = mergeData(data, {
        openid: encrypt(account.openid)
      }))
    // #endif
    apiBIReport(data)
    resolve()
  })
}
