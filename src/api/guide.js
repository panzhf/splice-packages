// #ifdef MP-RETAIL
import { httpPost as retailPost, httpWrap as retailWrap } from '@/utils/request'
// #endif

let apiGetConfig, apiCheckMobile

// #ifdef MP-RETAIL
apiGetConfig = (data, loading = true) => retailPost('salermanage/getbasesetting', data, { loading }) // 1 获取导购基础配置
apiCheckMobile = (data, loading = true) =>
  retailWrap({ url: 'saler/checkmobile', method: 'post', type: 2, data, loading }) // 2 检测手机
// #endif

export { apiGetConfig, apiCheckMobile }
