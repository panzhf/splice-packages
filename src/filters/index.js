export const timeFilter = (t, type = 'date') => {
  if (!t) return ''
  const [date, time] = t.split(' ')
  return type === 'date' ? date : time
}

export const changeResultText = i => {
  const text = {
    0: '提现成功',
    1: '处理中',
    2: '提现失败'
  }
  return text[i]
}

export const cashFixedTwo = (i = 0) => {
  return Number(i).toFixed(2)
}

export const guideStatusFilter = v => {
  // 4未激活已禁用
  const o = {
    0: '未激活',
    1: '正常',
    2: '已禁用',
    4: '已禁用',
    5: '已注销'
  }
  return o[v]
}

export const storeStatusFilter = v => {
  // 0-禁用,1-启用,3-未激活 4、未激活已禁用
  const o = {
    0: '已禁用',
    1: '正常',
    3: '未激活',
    4: '已禁用'
  }
  return o[v] || ''
}

export const guideAuditStatusFilter = v => {
  const o = {
    0: '待审核',
    1: '审核通过',
    2: '审核不通过'
  }
  return o[v] || ''
}

//  奖品类型: 2-微信红包,3-红包零钱,4-企业付款红包,10-品牌红包
export const rewardTypesFilter = v => {
  const o = {
    2: '微信红包',
    3: '红包零钱',
    4: '企业付款红包',
    10: '品牌红包'
  }
  return o[v]
}
