/* 正则集合 */
// 验证一般手机号格式
export const regMobile = d => /^(1[3-9])\d{9}$/.test(d)
// 验证短信验证码
export const regCode = d => /^\d{6}$/.test(d)
