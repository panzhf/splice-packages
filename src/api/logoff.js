import { httpPost } from '@/utils/request'
let apiLogoff
// #ifdef MP-MEMBER
apiLogoff = data => httpPost(`/memberclub/api/v1/me/logoff`, data)
// #endif
// #ifdef MP-GUIDE
apiLogoff = data => httpPost(`/guideassistant/api/guidercenter/logoff`, data)
// #endif
export { apiLogoff }
