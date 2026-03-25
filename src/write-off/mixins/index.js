import { staticURL } from '@/config'
import { apiGetStoreSSOToken } from 'packages/api/write-off'
// #ifdef MP-WEIXIN
import { apiGetSpecialMpInfo } from '@/api/home'
import navigateToMP from '@/utils/navigate-mp'
// #endif
// #ifdef H5
import { apiGetMiniProgramSpecialInfo } from 'packages/api/write-off'
import { formatPath } from 'packages/utils/utils'
// #endif

export const scanCodeMixin = {
  data() {
    return {
      code: '', // 核销码
      status: '', // 0：核销成功 其他：核销失败，20005：已被核销
      errMsg: '', //失败原因
      info: {}, // 核销结果数据
      success: staticURL(true) + 'write-off/success.png',
      fail: staticURL(true) + 'write-off/fail.png',
      mpInfoCache: null, // 专属小程序信息缓存
      // #ifdef H5
      wxTag1: '',
      wxTag2: ''
      // #endif
    }
  },
  methods: {
    async getSpecialMpInfo() {
      let api = null
      // #ifdef MP-WEIXIN
      api = apiGetSpecialMpInfo
      // #endif
      // #ifdef H5
      api = apiGetMiniProgramSpecialInfo
      // #endif
      const res = await api({
        applicationScenario: 14,
        // #ifdef H5
        memberlogin: this.options.m
        // #endif
      })
      if (this.$ck(res)) {
        this.mpInfoCache = this.$toLowerKey(res.return_data || {}, true)
      }
    },
    async getStoreSSOToken() {
      const res = await apiGetStoreSSOToken({
        code: this.code,
        // #ifdef H5
        openid: this.options.openid,
        m: this.options.m
        // #endif
      })
      if (this.$ck(res, false)) {
        const storeSSOToken = res.return_data?.storessotoken || ''
        uni.setStorageSync('storessotoken', storeSSOToken)
      }
    },
    getPath(type) {
      const { isspecial } = this.mpInfoCache
      const pages = {
        1: '/pages/management/verification-mgm?type=7',
        2: '/pagesA/scan/index'
      }
      return {
        scene: isspecial ? 'retailspecial' : 'retailassistant',
        path: pages[type]
      }
    },
    // #ifdef MP-WEIXIN
    navigateToVerificationPage(type = 1) {
      navigateToMP(this.getPath(type))
    },
    async handleNav(type = 1) {
      // 优先使用缓存数据
      if (this.mpInfoCache) {
        this.navigateToVerificationPage(type)
        return
      }

      // 如果没有缓存，则请求接口并缓存结果
      await this.getSpecialMpInfo()
      this.navigateToVerificationPage(type)
    },
    // #endif
    // #ifdef H5
    async initWxTag() {
      await this.getSpecialMpInfo()
      const { username } = this.mpInfoCache

      const path1 = formatPath(this.getPath(1))
      const path2 = formatPath(this.getPath(2))
      if (process.env.NODE_ENV === 'production') {
        this.wxTag1 = /*html*/ `
      <wx-open-launch-weapp id="launch-btn" username="${username}" path="${path1}" style="position: absolute;top: 0;left: 0;display:block;width: 100%;height: 100%;">
          <template type="text/wxtag-template">
            <style>.btn-icon{ display:block;width: 100%;opacity: 0;}</style>
            <div class="btn-icon">
              查看核销记录
            </div>
          <template>
        </wx-open-launch-weapp>
      `
        this.wxTag2 = /*html*/ `
      <wx-open-launch-weapp id="launch-btn" username="${username}" path="${path2}" style="position: absolute;top: 0;left: 0;display:block;width: 100%;height: 100%;">
          <template type="text/wxtag-template">
            <style>.btn-icon{ display:block;width: 100%;opacity: 0;}</style>
            <div class="btn-icon">
              连续核销
            </div>
          <template>
        </wx-open-launch-weapp>
      `
      } else {
        this.wxTag1 = ``
        this.wxTag2 = ``
      }
    }
    // #endif
  }
}
