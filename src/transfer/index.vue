<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
// 针对宝洁扫码中转定制页
import { apiStoreAuthentication } from 'packages/api/store'
import { getUrlQuery } from '@/utils/index'
import { mapState } from 'vuex'
/* #ifdef MP-RETAIL */
import { apiGetRegisterInfo, apiCheckregister, apijiajiehsiSaomaLog, apiCheckopenidisscan } from '@/api/common'
import userAuthHub from 'packages/utils/user-auth-hub'
import { getJsCode } from '@/utils/set-mp'
/* #endif */
export default {
  computed: {
    ...mapState('scanTransfer', ['transfer'])
  },
  onLoad(options) {
    const query = options.scene ? getUrlQuery(decodeURIComponent(options.scene)) : options
    /* #ifdef MP-RETAIL */
    if (!query.m) return this.jumpHome()
    /* #endif */
    /* #ifndef MP-RETAIL */
    if (!query.m || !query.storeno) return this.jumpHome()
    /* #endif */
    query.transfer && this.$store.commit('scanTransfer/setTransfer', +query.transfer)

    this.initOption(query)
  },
  onShow() {
    this.$refs.privacyPopup && this.$refs.privacyPopup.refresh()
  },
  methods: {
    async initOption(options) {
      // #ifdef MP-RETAIL
      // 储存中转页的参数
      uni.removeStorageSync('scanOptions')
      uni.setStorageSync('scanCustomOptions', options)
      // #endif
      this.$log.info({
        type: 'scancode',
        desc: '宝洁中转页-页面参数',
        data: JSON.stringify(options || {})
      })
      const code = decodeURIComponent(options.code || '')
      let res
      /* #ifdef MP-RETAIL */
      const registerParams = { js_code: await getJsCode(), m: options.m, d: 0 }
      const registerRes = await apiGetRegisterInfo(registerParams, false)
      this.$log.info({
        api: 'retailcommon/getregisterinfobymandd',
        type: 'scancode',
        desc: '宝洁中转页-获取是否已登录和authorizeurl',
        data: JSON.stringify({
          params: registerParams,
          res: registerRes
        })
      })
      if (this.$ck(registerRes)) {
        const { authorizeurl, islogin } = registerRes.return_data
        const scanCodeUrl = `/packages/src/scan-templates/transfer?q=${encodeURIComponent(code)}&transfer=${
          this.transfer
        }`
        let redirectUrl = code ? scanCodeUrl : `/packages/src/transfer/scan-pg`
        let isregisterdisabled = false
        let scanErrorUrl = '/packages/src/store-action/scan-error'
        const memberLoginType = options.type === 'Tide' || options.type === 'tide' ? 1 : 2
        uni.setStorageSync('authorizeUrl', authorizeurl)
        let authInfo = await new Promise(resolve => {
          userAuthHub.subscribe(resolve)
          uni.navigateTo({
            url: `/packages/src/rule/auth`
          })
        })
        this.$store.dispatch('updateStoreRegisterAuthResult', {
          openid: authInfo.openid
        })
        // 汰渍扫码
        if (memberLoginType === 1) {
          // 汰渍需要判断是否首次扫码拦截
          const scanParams = {
            memberLogin: options.m,
            accessToken: authInfo.accesstoken,
            openid: authInfo.openid,
            memberLoginType: memberLoginType,
            code, // 传入code，用于汰渍区分是否首次扫码
            transfer: this.transfer
          }
          const scanRes = await apiCheckopenidisscan(scanParams)
          isregisterdisabled = scanRes.return_data?.isregisterdisabled || false
          this.$log.info({
            api: 'retailcommon/checkopenidisscan',
            type: 'scancode',
            desc: '宝洁中转页-获取登录信息',
            data: JSON.stringify({
              params: scanParams,
              res: scanRes
            })
          })
        }
        // 这里请求接口获取登录信息
        // 佳洁士的需要写日志
        if (memberLoginType === 2) {
          // 如果重定向重新登录就不用在写一次日志
          if (!options.isRedirectLogin) {
            const logParams = {
              memberLogin: options.m,
              accessToken: authInfo.accesstoken,
              openid: authInfo.openid,
              code,
              storeno: options.storeno, // 门店唯一编码
              rdname: options.rdname ? decodeURIComponent(options.rdname) : '', // 分销商名称
              userid: options.userid ? decodeURIComponent(options.userid) : '', // 门店编码
              transfer: this.transfer,
              memberLoginType: memberLoginType
            }
            apijiajiehsiSaomaLog(logParams).then(logRes => {
              this.$log.info({
                api: 'retailcommon/checkregister',
                type: 'scancode',
                desc: '宝洁中转页-佳洁士日志',
                data: JSON.stringify({
                  logParams,
                  logRes
                })
              })
            })
          }
        }
        // 已经登录的直接跳去登录页
        if (islogin) {
          if (isregisterdisabled) {
            // 未注册错误页
            redirectUrl = `${scanErrorUrl}?backHome=1`
          }
          uni.redirectTo({ url: redirectUrl })
          return
        }
        // 已经登录的直接跳去登录页
        if (islogin) {
          uni.redirectTo({ url: redirectUrl })
          return
        }
        const params = {
          memberLogin: options.m,
          accessToken: authInfo.accesstoken,
          openid: authInfo.openid,
          storeno: options.storeno, // 门店唯一编码
          memberLoginType: memberLoginType,
          code, // 传入code，用于汰渍区分是否首次扫码
          transfer: this.transfer,
          registerMobileType: 1 // 不校验手机是否激活
        }
        res = await apiCheckregister(params)
        this.$log.info({
          api: 'retailcommon/checkregister',
          type: 'scancode',
          desc: '宝洁中转页-获取登录信息',
          data: JSON.stringify({
            params,
            res
          })
        })
        if (res) {
          const { ssotoken, storeid } = res.return_data || {}
          // 用户没注册，先注册
          // 用户已注册→是否带二维码→是，活动页
          //                      →否，定制中转页（扫一扫）
          // 被拦截的要去错误页
          if (isregisterdisabled) {
            if (storeid && ssotoken) {
              redirectUrl = `${scanErrorUrl}?backHome=1`
              uni.reLaunch({
                url: `/pages/transfer/index?token=${ssotoken}&url=${encodeURIComponent(redirectUrl)}&storeid=${storeid}`
              })
            } else {
              uni.reLaunch({ url: scanErrorUrl })
            }
            return
          }
          // 注册走自动登录+跳转
          if (storeid && ssotoken) {
            uni.reLaunch({
              url: `/pages/transfer/index?token=${ssotoken}&url=${encodeURIComponent(redirectUrl)}&storeid=${storeid}`
            })
          } else {
            // 汰渍的为1，宝洁非汰渍的为2
            redirectUrl = code ? scanCodeUrl : `/packages/src/store-action/register-success-pg`
            const url = `/pages/register-store/index?m=${options.m}&s=10&storeno=${
              options.storeno || ''
            }&memberLoginType=${memberLoginType}&isCustom=1&redirecturl=${encodeURIComponent(redirectUrl)}`

            uni.reLaunch({ url })
          }
        } else {
          this.$log.error({
            api: 'store/StoreAuthentication',
            type: 'scancode',
            desc: '宝洁中转页-门店响应',
            data: JSON.stringify(res || {})
          })
        }
      }

      /* #endif */
      /* #ifndef MP-RETAIL */
      res = await apiStoreAuthentication({
        code,
        storeno: options.storeno, // 门店唯一编码
        rdname: options.rdname ? decodeURIComponent(options.rdname) : '', // 分销商名称
        userid: options.userid ? decodeURIComponent(options.userid) : '', // 门店编码
        transfer: this.transfer
      })
      if (this.$ck(res)) {
        const { storeid } = res.return_data
        // 用户没注册，先注册
        // 用户已注册→是否带二维码→是，活动页
        //                      →否，定制中转页（扫一扫）
        const url = storeid
          ? code
            ? `/packages/src/scan-templates/transfer?q=${encodeURIComponent(code)}&transfer=${this.transfer}`
            : `/packages/src/transfer/scan-pg`
          : `/packages/src/store-action/register?m=${options.m}&s=10&storeno=${options.storeno}`

        uni.redirectTo({ url })
      } else {
        this.$log.error({
          api: 'store/StoreAuthentication',
          type: 'scancode',
          desc: '宝洁中转页-门店响应',
          data: JSON.stringify(res || {})
        })
      }
      /* #endif */
    },
    jumpHome() {
      this.$msg('参数错误')
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 3000)
    }
  }
}
</script>
