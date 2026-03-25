// #ifndef MP-SALE
import { httpPost, httpGet } from '@/utils/request'
// #endif
// #ifdef MP-SALE
import { httpGet as requestGet } from '@/utils/big-request'
// #endif
// #ifdef MP-CLOUDSHOP
import { apiDecodeMobile } from '@/api/MiniUser'
// #endif

let apiAddresslist, apiaAdressedit, apiAddressdelete, apigetaddresscode, apiGetwxphonenumber
// #ifdef MP-MEMBER
apiAddresslist = data => httpGet(`/memberclub/api/v1/me/addresslist`, data)
apiaAdressedit = data => httpPost(`/memberclub/api/v1/me/addressedit`, data)
apiAddressdelete = data => httpGet(`/memberclub/api/v1/me/addressdelete/${data.id}`)
apigetaddresscode = data => httpGet(`/memberclub/api/v1/common/getaddresscode`, data)
// apiGetwxphonenumber = data => httpPost(`/memberclub/api/v1/common/getwxphonenumber`, data)
apiGetwxphonenumber = data => httpGet(`/memberclub/api/v1/common/getwxphonenumberbycode`, data)
// #endif

// #ifdef MP-GUIDE
apiAddresslist = data => httpGet(`/guideassistant/api/guidercenter/getaddresslist`, data)
apiaAdressedit = data => httpPost(`/guideassistant/api/guidercenter/addoreditaddress`, data)
apiAddressdelete = data => httpPost(`/guideassistant/api/guidercenter/deleteaddress`, { id: data.id })
// 获取城市地址编号
apigetaddresscode = data => httpGet(`/guideassistant/api/retailcommon/getaddresscode`, data, { requireAuth: false })
// 获取手机号
apiGetwxphonenumber = data => httpPost(`/guideassistant/api/retailcommon/getwxphonenumber`, data)
// #endif

// #ifdef MP-RETAIL
apiAddresslist = data => httpGet(`storemanage/getdeliveryaddresslist`, data)
apiaAdressedit = data => httpPost(`storemanage/editdeliveryaddress`, data)
apiAddressdelete = data => httpPost(`storemanage/deldeliveryaddress`, { id: data.id })
apigetaddresscode = data => httpGet(`retailcommon/getaddresscode`, data)
apiGetwxphonenumber = data => httpPost(`retailcommon/getwxphonenumber`, data)
// #endif

// #ifdef MP-DISTRIBUTION
apiAddresslist = data => httpGet(`dealermanage/getdeliveryaddresslist`, data)
apiaAdressedit = data => httpPost(`dealermanage/editdeliveryaddress`, data)
apiAddressdelete = data => httpPost(`dealermanage/deldeliveryaddress`, { id: data.id })
apigetaddresscode = data => httpGet(`retailcommon/getaddresscode`, data)
apiGetwxphonenumber = data => httpPost(`commanage/getwxphonenumber`, data)
// #endif

// #ifdef MP-SALE
apigetaddresscode = () => requestGet({ url: 'user/getaddresscode' }) //省市区地址
// #endif

// #ifdef MP-CLOUDSHOP
apiAddresslist = data => httpGet(`JiFenMall/addresslist`, data)
apiaAdressedit = data => httpPost(`JiFenMall/addressedit`, data)
apiAddressdelete = data => httpGet(`JiFenMall/addressdelete`, { id: data.id })
apigetaddresscode = data => httpGet(`Common/GetAddressCode`, data)
apiGetwxphonenumber = apiDecodeMobile
// #endif

// #ifdef H5-ACT
// h5-act 时使用 api/Common/GetAddressLibraryTree
apigetaddresscode = data => httpGet(`Common/GetAddressLibraryTree`, data, { isMkt: true })
// #endif

export { apiAddresslist, apiaAdressedit, apiAddressdelete, apigetaddresscode, apiGetwxphonenumber }
