// #ifdef H5-SCAN
import { apiGetAccountInfo } from 'packages/api/scan'
// #endif
// #ifdef MP-MEMBER
import { apiGetMpSetting } from '@/api/mini-user'
import { getExtConfig } from '@/config'
// #endif

/**
 * 协议配置 Mixin
 * 用于获取和管理协议配置（用户协议、隐私政策、商家隐私声明）
 * 仅在会员小程序和H5环境下加载配置
 */
const ruleConfigMixin = {
  data() {
    return {
      // 协议配置，直接使用接口返回的 protocolConfig 格式
      ruleConfig: null
    }
  },
  async created() {
    // #ifdef H5-SCAN
    // H5环境下自动加载协议配置 
    await this.loadRuleConfig()
    // #endif
    // #ifdef MP-MEMBER
    // 会员小程序环境下自动加载协议配置,已有配置直接读取
    if (this.mpSetting?.protocolconfig) {
      this.ruleConfig = this.mpSetting?.protocolconfig
    } else {
      await this.loadRuleConfig()
    }
    // #endif
  },
  computed: { 
    /**
     * 获取用户协议编号
     */
    userRuleNo() {
      let defaultRule = '100000026'
      // #ifdef MP-GUIDE
      defaultRule = '100000037'
      // #endif
      return (this.ruleConfig && this.ruleConfig.useragreement) || defaultRule
    },
    /**
     * 获取隐私政策编号
     */
    privacyRuleNo() {
      return (this.ruleConfig && this.ruleConfig.privacypolicy) || '100000024'
    },
    /**
     * 获取商家隐私声明编号
     */
    businessRuleNo() {
      return (this.ruleConfig && this.ruleConfig.merchantprivacystatement) || '100000030'
    },
    /**
     * 获取商家隐私声明是否显示，根据是否有配置来判断是否隐藏, 默认显示
     */
    showmerchantprivacystatement() {
      return this.ruleConfig ? this.ruleConfig.showmerchantprivacystatement : 1
    },
    /**
     * 获取注销协议编号
     */
    loginOutRuleNo() {
       /*
        --注销协议--
        会员小程序: 100000034
        导购小程序: 100000035
      */
      let defaultRule = '100000034'
      // #ifdef MP-GUIDE
      defaultRule = '100000035'
      // #endif
      return (this.ruleConfig && this.ruleConfig.cancellationagreement) || defaultRule
    }
  },
  methods: {
    /**
     * 加载协议配置
     * 会员小程序使用 apiGetMpSetting，H5使用 apiGetAccountInfo
     */
    async loadRuleConfig() {
      let res
      // #ifdef H5-SCAN
      // H5 使用 apiGetAccountInfo
      const m = this.$route.query.m || this.$route.query.memberlogin || this.memberLogin
      res = await apiGetAccountInfo({ m })
      // #endif
      // #ifdef MP-MEMBER
      // 会员小程序使用 apiGetMpSetting
      res = await apiGetMpSetting({
        memberlogin: getExtConfig().memberLogin
      })
      // #endif

      if (this.$ck(res, true) && res.return_data) {
        const data = this.$toLowerKey(res.return_data, true)
        this.ruleConfig = data.protocolconfig
      }
    }
  }
}

export default ruleConfigMixin
