// #ifdef MP-RETAIL
import { httpGet as retailGet } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpWrap as saleWrap } from '@/utils/big-request'
// #endif
// #ifdef MP-DISTRIBUTION
import { httpGet as distributionGet } from '@/utils/request'
// #endif

let apiGetWaitSubsidygoodsvoucherstatistics

// #ifdef MP-RETAIL
apiGetWaitSubsidygoodsvoucherstatistics = (data, loading = true) =>
  retailGet('writeoff/getwaitsubsidygoodsvoucherstatistics', data, { loading })
// #endif

// #ifdef MP-SALE
apiGetWaitSubsidygoodsvoucherstatistics = data =>
  saleWrap({
    url: 'writeoff/getwaitsubsidygoodsvoucherstatistics',
    type: 3,
    method: 'get',
    data
  })
// #endif

// #ifdef MP-DISTRIBUTION
apiGetWaitSubsidygoodsvoucherstatistics = () => distributionGet('writeoff/getwaitsubsidygoodsvoucherstatistics')
// #endif

export { apiGetWaitSubsidygoodsvoucherstatistics }
