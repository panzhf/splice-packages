/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
const openLinkMixin = {
  methods: {
    handleOpenLink(item) {
      /* #ifdef MP-WEIXIN */
      navigateToMP({
        appId: item.Appid,
        path: item.Link,
        type: item.LinkType
      })
      /* #endif */
      /* #ifdef H5 */
      if (!item.H5Link) return
      // 处理扫码模板门店注册链接，自动补充dealerid参数
      let finalLink = item.H5Link
      if (finalLink.includes('storeBoss/storeRegister') && window.location.href.includes('scan-templates/')) {
        const urlObj = new URL(finalLink, window.location.origin)
        const params = urlObj.searchParams

        // 检查是否已存在dealerid相关参数
        const hasDealerId = params.has('fcdealerid') || params.has('dealerid') || params.has('dealerId')

        if (!hasDealerId) {
          // 从storage获取dealerid
          const scanDealerInfoData = uni.getStorageSync('scanDealerInfoData')
          if (scanDealerInfoData && scanDealerInfoData.dealerid) {
            // 判断URL是否已有参数
            const separator = finalLink.includes('?') ? '&' : '?'
            finalLink = `${finalLink}${separator}dealerid=${scanDealerInfoData.dealerid}`
          }
        }
      }
      location.href = finalLink
      /* #endif */
    }
  }
}
export default openLinkMixin
