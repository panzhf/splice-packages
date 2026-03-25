<template>
  <u-mask :show="showDialog" :zoom="false" :custom-style="{ background: 'rgba(0, 0, 0, 0.7)' }" z-index="100">
    <view class="ad-dialog flex flex-column flex-middle flex-center">
      <view class="ad-container">
        <scroll-view scroll-y class="scroll-box">
          <image :src="info.imgurl" mode="widthFix" class="img" @tap="handleNavigate" />
        </scroll-view>
        <view class="close-box flex flex-column flex-middle">
          <view class="iconfont icon-close2 iconguanbi1" @tap="onClose" />
        </view>
      </view>
    </view>
  </u-mask>
</template>

<script>
import { redirectToMp } from 'packages/utils/function.js'
import { apiAdConfig } from 'packages/api/custom-ad.js'
export default {
  name: 'CustomAd',
  data() {
    return {
      showDialog: false,
      info: {}
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      let res = await apiAdConfig()
      if (this.$ck(res, true)) {
        const { enable, appid, path, url } = res.return_data
        if (enable) {
          this.info = {
            imgurl: url,
            appId: appid,
            path
          }
          this.showDialog = enable
        }
      }
    },
    handleNavigate() {
      const { appId, path } = this.info
      if (!path) return
      redirectToMp({ appId, path })
      this.onClose()
    },
    onClose() {
      this.showDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.ad-dialog {
  height: 100%;
}
.ad-container {
  width: 550rpx;
}
.scroll-box {
  height: 720rpx;
  overflow: hidden;
}
.img {
  display: block;
  width: 100%;
}
.close-box {
  .iconfont {
    color: #fff;
    font-size: 60rpx;
  }
}
</style>
