// #ifndef MP-SALE
import { httpPost } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpPost as requestPost } from '@/utils/big-request'
// #endif

let apiAdConfig

// #ifdef MP-GUIDE
apiAdConfig = data => httpPost(`/guideassistant/api/adv/customadv`, data)
// #endif

// #ifdef MP-RETAIL
apiAdConfig = data => httpPost(`adv/customadv`, data)
// #endif

// #ifdef MP-DISTRIBUTION
apiAdConfig = data => httpPost(`adv/customadv`, data)
// #endif

// #ifdef MP-SALE
apiAdConfig = () => requestPost({ url: 'adv/customadv', options: { resolveData: 'all' } })
// #endif

export { apiAdConfig }
