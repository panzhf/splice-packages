export const uniLogin = () => {
  return new Promise((resolve, reject) => {
    uni.login({
      success: res => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(res)
        }
      },
      fail: err => {
        reject(err)
      }
    })
  })
}
