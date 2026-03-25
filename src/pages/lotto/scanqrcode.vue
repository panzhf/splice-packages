<template>
  <view />
</template>

<script>
export default {
  onLoad() {
    /* #ifdef H5 */
    let aid = this.$route.query.aid
    let skin = this.$route.query.skin
    let m = this.$route.query.memberlogin
    let tempKey = this.$route.query.tempKey
    uni.redirectTo({
      url: `/pages/lotto/${skin}/scanqrcode?aid=${aid}&memberlogin=${m}&skin=${skin}&tempKey=${tempKey}`
    })
    /* #endif */
    /* #ifdef MP-WEIXIN */
    uni.redirectTo({
      // url: `/packages/src/pages/lotto/${skin}/scanqrcode?aid=${aid}&memberlogin=${m}&skin=${skin}&tempKey=${tempKey}`
      url: `/packages/src/pages/lotto/1/scanqrcode?aid=7971627c-a5ab-4d4f-9db1-e5a0582c6673&memberlogin=10003911&skin=1&tempKey=123`
    })
    /* #endif */
  }
}
</script>
