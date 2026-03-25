import MD5 from 'blueimp-md5'

// 生成随机数
export function generateNumber(bit = 6) {
  const random = Math.floor(Math.random() * 1000000)
  if (random < Math.pow(10, bit - 1)) {
    return generateNumber(bit)
  }
  return random
}

// 自定义请求头
export default function defineConfig(config) {
  const timestamp = Math.floor(new Date().valueOf() / 1000)
  const random = generateNumber(6)
  const apikey = ''
  const salt = ''
  const signStr = (salt + apikey + timestamp + random).trim()
  // 增加自定义headers
  Object.assign(config.headers, {
    timestamp: timestamp,
    sign: MD5(signStr),
    nonc: random,
    apikey: apikey
  })
  return config
}
