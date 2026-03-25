<template>
  <view v-if="showSupport || showVersion || showComplaint" class="copyright-container" :style="calcStyle">
    <view class="copyright">
      <view class="flex flex-column flex-middle">
        <view v-if="showSupport" class="mdfont icon-miduozhichi logo-icon" />
        <!-- #ifdef MP-WEIXIN -->
        <view v-if="showVersion" class="version" :style="versionStyle">{{ version }}</view>
        <!-- #endif -->
      </view>
      <view v-if="showComplaint" class="complaint" @tap="handleComplaint">
        <text class="iconfont icon-complaint edit-icon" />
        投诉
      </view>
    </view>
  </view>
</template>

<script>
/**
 * 底部版权 组件
 * @props {String} color 字体颜色
 * 使用方式 <md-copyright color="#5467ff" />
 */
/* #ifdef H5-ACT */
import { apiGetMenuList } from 'packages/api/activity'
/* #endif */
// #ifdef H5-SCAN
import { apiGetAccountInfo } from 'packages/api/scan'
// #endif

export default {
  name: 'MdCopyright',
  props: {
    color: {
      type: String,
      default: '#bbb'
    },
    bgColor: {
      type: String,
      default: '#f4f4f4'
    },
    customStyle: {
      type: String,
      default: ''
    },
    // #ifdef H5
    memberLogin: {
      type: String,
      default: ''
    },
    // #endif
    // #ifdef MP-WEIXIN
    showVersion: Boolean // 显示小程序版本，只有正式版才有
    // #endif
  },
  data() {
    return {
      // #ifdef MP-WEIXIN
      version: ''
      // #endif
    }
  },
  computed: {
    calcStyle() {
      const s = []
      s.push(`color: ${this.color}`)
      s.push(`background: ${this.bgColor}`)
      if (this.customStyle) {
        s.push(this.customStyle)
      }
      return s.join(';')
    },
    /* #ifdef H5 */
    complaintLink() {
      return this.$store.state?.copyright?.complaintlink
    },
    /* #endif */
    showSupport() {
      let t = true
      // #ifdef MP-MEMBER || MP-CLOUDSHOP
      t = !this.$store.state?.copyright?.isshowlogo
      // #endif
      // #ifdef H5
      t = !this.$store.state?.copyright?.isshowlogo
      // #endif
      return t
    },
    showComplaint() {
      let t = true
      // #ifdef MP-MEMBER || MP-CLOUDSHOP
      t = !this.$store.state?.copyright?.isshowcomplaint
      // #endif
      // #ifdef H5
      t = !this.$store.state?.copyright?.isshowcomplaint
      // #endif
      return t
    },
    // #ifdef MP-WEIXIN
    versionStyle() {
      return this.showVersion && this.showSupport ? 'margin-top: 16rpx;' : ''
    }
    // #endif
  },
  mounted() {
    // #ifdef H5
    this.$nextTick(() => {
      this.getMenuList()
    })
    // #endif
    // #ifdef MP-WEIXIN
    const { envVersion, version } = uni.getAccountInfoSync().miniProgram
    switch (envVersion) {
      case 'develop':
        this.version = '开发版'
        break
      case 'trial':
        this.version = '体验版'
        break
      case 'release':
        this.version = `版本号：V${version}`
        break
      default:
        break
    }
    // #endif
  },
  methods: {
    /* #ifdef H5 */
    getMenuList() {
      let api
      // #ifdef H5-ACT
      api = apiGetMenuList
      // #endif
      // #ifdef H5-SCAN
      api = apiGetAccountInfo
      // #endif
      // m： 扫码模板
      // memberlogin：期期抽奖/订单有礼/拍一拍
      // prop(memberLogin)：大转盘
      const m = this.$route.query.m || this.$route.query.memberlogin || this.memberLogin
      if (!m) {
        throw new Error('memberlogin is required')
      }
      api({ m }).then(res => {
        const d = this.$toLowerKey(res, true)
        let isshowlogo, isshowcomplaint
        // #ifdef H5-ACT
        isshowlogo = d.return_isshowlogo
        isshowcomplaint = d.return_isshowaccuse
        // #endif
        // #ifdef H5-SCAN
        isshowlogo = d.return_data.isshowlogo
        isshowcomplaint = d.return_data.isshowaccuse
        // #endif
        const h = location.host.includes('weixin12315.com') ? 'weixin12315.com' : 't.miduonet.com'
        const link = `https://my.${h}/usercenter/writecomplaint?m=${m}`
        this.$store.commit('copyright/setCopyright', { isshowlogo, isshowcomplaint, complaintlink: link })
      })
    },
    /* #endif */
    handleComplaint() {
      /* #ifdef MP-WEIXIN */
      let url = '/packages/src/rule/webview?pageType=complaint'
      // #ifdef MP-CLOUDSHOP
      url = '/pages/H5/webview?pageType=complaint'
      // #endif
      uni.navigateTo({
        url
      })
      /* #endif */
      /* #ifdef H5 */
      location.href = this.complaintLink
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
.copyright-container {
  padding: 40rpx 20rpx;
}

.copyright {
  position: relative;
  min-height: 30rpx; // 防止logo隐藏后高度坍塌
  font-size: 24rpx;
  .logo-icon {
    font-size: 24rpx;
  }
  .version {
    font-size: 24rpx;
  }
  .complaint {
    position: absolute;
    right: 0;
    top: 0;
  }
  .edit-icon {
    margin-right: 10rpx;
    font-size: 24rpx;
  }
}
</style>
