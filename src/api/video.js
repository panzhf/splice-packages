import { httpPost } from '@/utils/request'

let apiGetNextContent, apiGetPrize

// #ifdef MP-CLOUDSHOP
apiGetNextContent = data => httpPost(`ContentPromotion/GetNextContent`, data, { isMkt: true })
apiGetPrize = data => httpPost(`ContentPromotion/ReceivePrize`, data, { isMkt: true })
// #endif

export { apiGetNextContent, apiGetPrize }
