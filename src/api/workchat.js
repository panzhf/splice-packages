import { httpPost } from '@/utils/request'
export function apiWorkchatGetactivity(data) {
  return httpPost(`joinwecomgift/getactinfo`, data, { isMkt: true })
}
export function apiWorkchatReceivePrize(data) {
  return httpPost(`joinwecomgift/receiveprize`, data, { isMkt: true })
}
