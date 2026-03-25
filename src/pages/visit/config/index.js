// 客户类型配置
export const customerTypeOptions = [
  {
    val: 1,
    label: '门店'
  },
  {
    val: 2,
    label: '经销商'
  }
]

// 拜访状态配置
export const visitStatusType = [
  {
    val: 0,
    label: '未拜访'
  },
  {
    val: 1,
    label: '拜访中'
  },
  {
    val: 2,
    label: '已拜访'
  }
]

// 排序类型配置
export const sortType = {
  DISTANCE: 'distance', // 按距离
  VISIT_TIME: 'visitTime' // 按拜访时间
}

// 排序方向配置
export const sortOrder = {
  ASC: 1, // 升序
  DESC: 2 // 降序
}

