// #ifdef MP-SALE
import { httpWrap as request } from '@/utils/big-request'
const requestGet = (url, data) => request({ url, data, type: 6, method: 'get' })
const requestPost = (url, data) => request({ url, data, type: 6, method: 'post' })
// #endif

let apiGetCustomerList, // 获取客户列表
  apiGetVisitRecordList, // 获取拜访记录列表
  apiGetCustomerTasks, // 获取客户可执行任务列表
  apiGetTaskDetail, // 获取任务详情和表单配置
  apiArrive, // 抵达签到
  apiSubmitForm, // 提交表单
  apiLeave, // 离开签退
  apiGetVisitRecordDetail // 获取拜访记录详情

// #ifdef MP-SALE
apiGetCustomerList = data => {
  return requestPost('mini/visit/customers', data)
} // 获取客户列表

apiGetVisitRecordList = data => {
  return requestPost('mini/visit/records', data)
} // 获取拜访记录列表

apiGetCustomerTasks = data => { 
  return requestGet(`mini/visit/customers/tasks`, data)
} // 获取客户可执行任务列表

apiGetTaskDetail = data => {
  return requestPost(`mini/visit/tasks`, data)
} // 获取任务详情和表单配置

apiArrive = data => { 
  return requestPost(`mini/visit/tasks/arrive`, data)
} // 抵达签到

apiSubmitForm = data => { 
  return requestPost(`mini/visit/tasks/submit`, data)
} // 提交表单

apiLeave = data => {
  const taskid = data.taskid
  return requestPost(`mini/visit/tasks/leave`, data)
} // 离开签退

apiGetVisitRecordDetail = data => {
  const recordid = data.recordid
  return requestGet(`mini/visit/records/${recordid}`, data)
} // 获取拜访记录详情
// #endif

export {
  apiGetCustomerList,
  apiGetVisitRecordList,
  apiGetCustomerTasks,
  apiGetTaskDetail,
  apiArrive,
  apiSubmitForm,
  apiLeave,
  apiGetVisitRecordDetail
}
