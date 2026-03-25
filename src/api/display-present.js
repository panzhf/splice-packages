import { httpPost } from '@/utils/request'

// 时间列表
export function apiGetTimeList(data) {
  return httpPost('activitymanage/getlayoutactivityperiods', data, { loading: false })
}
// 活动详情
export function apiGetActivitDetail(data) {
  return httpPost('activitymanage/getlayoutactivitytask', data)
}
// 接受任务
export function apiTakeTask(data) {
  return httpPost('activitymanage/acceptlayoutactivitytask', data)
}
// 提交图片审核
export function apiSubmitStoreLayout(data) {
  return httpPost('activitymanage/submitstorelayout', data)
}
// 添加模板
export function apiAddTemplate(data) {
  return httpPost('activitymanage/addlayoutactivitymessage', data, { loading: false })
}
// 参与记录
export function apiGetRecordList(data) {
  return httpPost('activitymanage/getlayoutactivityjoinrecords', data)
}
