<template>
  <view />
</template>

<script>
import { getUrlQuery } from 'packages/utils/function'
import { apiGetActID } from 'packages/api/prizePool'
export default {
  onLoad(options) {
    // #ifdef H5
    uni.setStorageSync('firstUrl', location.href)
    let aid = this.$route.query.aid
    let skin = this.$route.query.skin
    let m = this.$route.query.memberlogin
    let pid = this.$route.query.pid || ''
    let scansuccess = this.$route.query.scansuccess || ''
    let awardId = this.$route.query.awardId
    uni.redirectTo({
      url: `/pages/lotto/${skin}/index?aid=${aid}&memberlogin=${m}&skin=${skin}${pid ? '&pid=' + pid : ''}${
        scansuccess ? '&scansuccess=' + scansuccess : ''
      }${awardId ? '&awardId=' + awardId : ''}`
    })
    // #endif

    /* #ifdef MP-WEIXIN */
    let obj = getUrlQuery(decodeURIComponent(options.scene))
    // 判断是否有带aid参数，没有需要拿id换取aid
    if (obj.aid) {
      uni.redirectTo({
        url: `/packages/src/pages/lotto/${obj.skin}/index?aid=${obj.aid}&memberlogin=${obj.m}&skin=${obj.skin}${
          obj.pid ? '&pid=' + obj.pid : ''
        }`
      })
    } else {
      this.handleGetId(obj)
    }
    /* #endif */
  },
  methods: {
    /* #ifdef MP-WEIXIN */
    handleGetId(obj) {
      let params = {
        id: obj.id,
        m: obj.m
      }
      apiGetActID(params).then(res => {
        uni.redirectTo({
          url: `/packages/src/pages/lotto/${res.return_skin}/index?aid=${res.return_data}&memberlogin=${obj.m}&skin=${
            res.return_skin
          }${obj.pid ? '&pid=' + obj.pid : ''}`
        })
      })
    }
    /* #endif */
  }
}
</script>
