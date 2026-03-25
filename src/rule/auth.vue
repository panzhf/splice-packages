<template>
  <web-view :src="authorizeUrl" @message="onMessage" />
</template>

<script>
import userAuthHub from 'packages/utils/user-auth-hub'
export default {
  data() {
    return {
      authorizeUrl: ''
    }
  },
  onShow() {
    this.authorizeUrl = uni.getStorageSync('authorizeUrl')
  },
  methods: {
    async onMessage(e) {
      let { openid, AccessToken } = e.detail.data[0]
      userAuthHub.notify({ openid, accesstoken: AccessToken })
    }
  }
}
</script>
