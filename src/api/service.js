// #ifndef MP-SALE
import { httpGet } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpGet as requestGet } from '@/utils/big-request'
// #endif

let apiServiceConfig
// #ifdef MP-MEMBER
apiServiceConfig = data => httpGet(`/memberclub/api/v1/me/getCustomerCenterConfig`, data)
// #endif

// #ifdef MP-GUIDE
apiServiceConfig = data => httpGet(`/guideassistant/api/guidercenter/getCustomerCenterConfig`, data)
// #endif

// #ifdef MP-RETAIL
apiServiceConfig = data => httpGet(`personalCenter/getCustomerCenterConfig`, data)
// #endif

// #ifdef MP-DISTRIBUTION
apiServiceConfig = data => httpGet(`distributionCenter/getCustomerCenterConfig`, data)
// #endif

// #ifdef MP-SALE
apiServiceConfig = () => requestGet({ url: 'salesmana/getCustomerCenterConfig', options: { resolveData: 'all' } })
// #endif

export { apiServiceConfig }
