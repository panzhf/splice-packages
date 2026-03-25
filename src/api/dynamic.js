import { httpPost, httpGet } from '@/utils/request'
// 获取动态的栏目信息
export const apiCatlogList = data => httpPost('/memberclub/api/v1/catalog/list', data)
// 动态文章列表信息
export const apiBlogList = data => httpPost('/memberclub/api/v1/blog/list', data)
// 动态文章发表评论 1=发表评论，2=删除评论
export const apiBlogReviewed = data => httpPost('/memberclub/api/v1/blog/reviewed', data)
// 动态文章评论列表
export const apiBlogReviewlist = data => httpPost('/memberclub/api/v1/blog/reviewlist', data)
// 动态文章详情
export const apiBlogDetail = data => httpGet('/memberclub/api/v1/blog/detail', data)
// 动态文章阅读时间
export const apiBlogGetreadtime = data => httpGet('/memberclub/api/v1/blog/getreadtime', data)
// 动态文章分享
export const apiBlogShare = data => httpGet('/memberclub/api/v1/blog/share', data)
// 文章点赞列表
export const apiBlogPraiselist = data => httpPost('/memberclub/api/v1/blog/praiselist', data)
// 动态文章点赞
export const apiBlogPraised = data => httpPost('/memberclub/api/v1/blog/praised', data)
// 新增文章阅读记录
export const apiBlogRead = data => httpPost('/memberclub/api/v1/blog/read', data)
