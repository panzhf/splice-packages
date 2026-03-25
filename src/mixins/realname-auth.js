import {
  apiGetRealnameAuthStatus,
  apiReportNoRemind,
  apiGetRealnameDisplayWindow,
  apiGetRealnameContract
} from 'packages/api/realname-auth'

/**
 * 根据接口返回的 name 和 iscertificate 判断认证状态
 * @param {Object} data - 接口返回的 return_data
 * @returns {Number} 0-未认证, 1-已认证, 2-未授权
 */
export function getAuthStatus(data) {
  if (!data) return 0
  // 有name且iscertificate=true，已认证
  if (data.name && data.iscertificate === true) {
    return 1
  }
  // 有name但iscertificate=false，未授权
  if (data.name && data.iscertificate === false) {
    return 2
  }
  // 其他为未认证
  return 0
}

/**
 * 获取实名认证接口所需的参数（mobile、memberlogin、brandName）
 * 逻辑与 wx-log.js 中 uploadLog 保持一致，兼容不同小程序端的存储结构
 * @returns {Object} { mobile, memberlogin, brandName }
 */
export function getRealnameAuthParams() {
  const getStorage = key => JSON.parse(uni.getStorageSync(key) || '{}')

  // 品牌商与个人信息 key，与 wx-log.js 保持一致
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
  let memberlogin = brand.memberlogin
  let brandName = brand.memberloginname
  // #ifdef MP-RETAIL
  memberlogin = brand.memberLogin
  brandName = brand.memberLoginName
  // #endif

  const { mobile } = getStorage(personKey)

  return {
    mobile: mobile || '',
    memberlogin: memberlogin || '',
    brandName: brandName || ''
  }
}

// import { realnameAuthNavigationMixin } from 'packages/mixins/realname-auth'
// 导航到实名认证页面（所有页面共用）
export const realnameAuthNavigationMixin = {
  methods: {
    // 跳转到实名认证页面
    navigateToRealnameAuth() {
      uni.navigateTo({
        url: '/packages/src/personal/realname-auth/index'
      })
    }
  }
}

// import { realnameAuthStatusMixin } from 'packages/mixins/realname-auth'
// 实名认证状态获取和文本显示（个人信息页使用）
export const realnameAuthStatusMixin = {
  data() {
    return {
      realnameAuthStatus: 0, // 0-未认证, 1-已认证
      realnameAuthEnabled: false // 当前品牌是否开通实名认证功能
    }
  },
  computed: {
    realnameAuthStatusText() {
      const statusMap = {
        0: '未认证',
        1: '已认证'
      }
      return statusMap[this.realnameAuthStatus] || '未认证'
    },
    // 是否展示实名认证入口（仅在品牌开通实名认证时展示）
    shouldShowRealnameAuth() {
      return this.realnameAuthEnabled
    }
  },
  methods: {
    // 获取实名认证状态（前置：先判断品牌是否开通实名认证）
    async fetchRealnameAuthStatus() {
      try {
        const { mobile, memberlogin } = getRealnameAuthParams()
        // 先判断当前品牌是否在实名认证名单内：
        // 接口返回 return_code === 0 即视为开通实名认证功能
        const contractRes = await apiGetRealnameContract({ memberlogin })
        const enabled = this.$ck(contractRes, false)
        this.realnameAuthEnabled = enabled
        if (!enabled) return

        // 品牌已开通实名认证，再去获取实名认证状态
        const res = await apiGetRealnameAuthStatus({ mobile, memberlogin })
        if (!this.$ck(res, false)) return
        const data = res.return_data
        this.realnameAuthStatus = getAuthStatus(data)
      } catch (error) {
        // 业务帮帮接口异常
      }
    }
  }
}

// import { realnameAuthPopupMixin } from 'packages/mixins/realname-auth'
// 实名认证弹窗逻辑（首页使用，包含"7天内不再提示"上报）
export const realnameAuthPopupMixin = {
  data() {
    return {
      showRealnameAuthPopup: false,
      realnameAuthPopupMode: 1 // 1-强制认证模式, 2-提示认证模式
    }
  },
  methods: {
    // 检查实名认证状态并显示弹窗
    async checkRealnameAuthStatus() {
      try {
        const { mobile, memberlogin } = getRealnameAuthParams()
        // 判断是否需要弹窗：
        // - 接口返回 return_code === 0 且 return_data.isdisplay === true 时，展示弹窗
        // - return_data.isexceedmaxamount === true 时，使用强制提醒模式（mode=1），否则为普通提示模式（mode=2）
        const windowRes = await apiGetRealnameDisplayWindow({ mobile, memberlogin })
        if (!this.$ck(windowRes, false)) return
        const data = windowRes.return_data || {}
        if (!data || data.isdisplay !== true) return

        // 根据是否超过最大金额，决定弹窗模式
        this.realnameAuthPopupMode = data.isexceedmaxamount ? 1 : 2
        this.showRealnameAuthPopup = true
      } catch (error) {
        // 静默失败，不影响页面正常使用
      }
    },
    // 实名认证弹窗确认
    handleRealnameAuthConfirm() {
      this.showRealnameAuthPopup = false
      uni.navigateTo({
        url: '/packages/src/personal/realname-auth/index'
      })
    },
    // 实名认证弹窗取消
    handleRealnameAuthCancel() {
      this.showRealnameAuthPopup = false
    },
    // 实名认证弹窗"7天内不再提示"上报
    async handleRealnameAuthNoRemind() {
      try {
        const { mobile, memberlogin } = getRealnameAuthParams()
        await apiReportNoRemind({ mobile, memberlogin })
      } catch (error) {
        console.log('上报"7天内不再提示"失败:', error)
      }
    }
  }
}

// import { realnameAuthPopupSimpleMixin } from 'packages/mixins/realname-auth'
// 实名认证弹窗简单逻辑（提现页使用，不包含"7天内不再提示"上报）
export const realnameAuthPopupSimpleMixin = {
  data() {
    return {
      showRealnameAuthPopup: false
    }
  },
  methods: {
    // 检查实名认证状态（返回布尔值，表示是否需要显示弹窗）
    async checkRealnameAuthStatus() {
      try {
        const { mobile, memberlogin } = getRealnameAuthParams()
        // 先判断当前品牌是否在实名认证名单内，未开通则无需弹窗
        try {
          const contractRes = await apiGetRealnameContract({ memberlogin })
          if (!this.$ck(contractRes, false)) return false
        } catch (e) {
          return false
        }

        // 使用实名认证状态接口判断是否需要弹窗：
        // - 已实名认证（status=1）则不弹窗
        // - 未认证/未授权（status=0 / 2）则弹窗
        const res = await apiGetRealnameAuthStatus({ mobile, memberlogin })
        if (!this.$ck(res, false)) return true
        const data = res.return_data || {}
        const status = getAuthStatus(data)
        if (status === 1) return false

        // 只要未完成实名认证，这里就返回 true，具体展示由使用方控制
        return true
      } catch (error) {
        // 静默失败，不影响提现流程
        let result = false
        // #ifndef MP-SALE
        result = false
        // #endif
        // #ifdef MP-SALE
        // 业务帮帮接口走catch
        result = true
        // #endif
        return result
      }
    },
    // 实名认证弹窗确认
    handleRealnameAuthConfirm() {
      this.showRealnameAuthPopup = false
      uni.navigateTo({
        url: '/packages/src/personal/realname-auth/index'
      })
    },
    // 实名认证弹窗取消（「下次再说」）：关闭弹窗后继续跳转提现页
    handleRealnameAuthCancel() {
      this.showRealnameAuthPopup = false
      // #ifdef MP-RETAIL
      if (this.listData) {
        const total = this.listData.total
        const allow = !!this.listData.isenablewithdraw
        uni.navigateTo({
          url: `/packages/src/personal/change/withdraw?total=${total}&allow=${+allow}`
        })
      }
      // #endif
      // #ifdef MP-GUIDE
      this.handleWithdrawal(false)
      // #endif
      // #ifdef MP-SALE
      this.handleWithdrawal(false)
      // #endif
    }
  }
}
