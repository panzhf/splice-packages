// 接入使用的应用需安装依赖 `yarn add crypto-js`
// 目前使用：新经销助手、万能零售助手、金牌导购员、业务帮帮、会员小程序
import aes from 'crypto-js/aes'
import encHex from 'crypto-js/enc-hex'
import encUtf8 from 'crypto-js/enc-utf8'
import modeEcb from 'crypto-js/mode-ecb'
import pad from 'crypto-js/pad-pkcs7'
import { lib } from 'crypto-js/core'

const ORIGIN_KEY = 'A21693DA36ED635C1E314887C41450E851E79121A21693DA36ED635C1E314887C41450E851E79121'
const key = ORIGIN_KEY.substring(0, 64)
const iv = ORIGIN_KEY.substring(0, 32)

export const encrypt = v => {
  if (!v) return ''
  const encrypted = aes.encrypt(v, encHex.parse(key), {
    iv: encHex.parse(iv),
    mode: modeEcb,
    padding: pad
  })
  return encrypted.ciphertext.toString().toUpperCase()
}
// 解密
export const decrypt = v => {
  if (!v) return ''
  const cipherParams = lib.CipherParams.create({
    ciphertext: encHex.parse(v)
  })

  const decrypted = aes.decrypt(cipherParams, encHex.parse(key), {
    iv: encHex.parse(iv),
    mode: modeEcb,
    padding: pad
  })

  return decrypted.toString(encUtf8).toUpperCase()
}
