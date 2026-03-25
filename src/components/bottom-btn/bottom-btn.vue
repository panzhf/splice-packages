<template>
  <view class="btn-wrapper">
    <!-- #ifdef H5 -->
    <div v-if="info.H5 && info.H5.JumpType === 1" v-html="wxTag" />
    <image
      v-else
      :src="formatImg(info.H5.BtnImgPath)"
      :style="btnsize"
      :class="{ 'button-action': isTap }"
      class="btn"
      @tap="handleNavigate"
    />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <image
      :src="formatImg(info.Mp.BtnImgPath)"
      :style="btnsize"
      :class="{ 'button-action': isTap }"
      class="btn"
      @tap="handleNavigate"
    />
    <!-- #endif -->
  </view>
</template>

<script>
/* #ifdef MP-WEIXIN */
import navigateToMP from '@/utils/navigate-mp'
/* #endif */
import imgMixin from 'packages/mixins/img'
export default {
  name: 'CustomButton',
  mixins: [imgMixin],
  props: {
    info: {
      type: Object,
      default: () => ({})
    },
    // #ifdef MP-CLOUDSHOP
    mpInfo: {
      type: Object,
      default: () => ({
        appid: ''
      })
    },
    navigateMp: Boolean,
    // #endif
    width: {
      type: Number,
      default: 240 // 按钮宽度，单位rpx
    },
    height: {
      type: Number,
      default: 80
    },
    isThirdOpen: Boolean
  },
  data() {
    return {
      isTap: false
    }
  },
  computed: {
    btnsize() {
      let style = []
      style.push(`width: ${this.width}rpx; height: ${this.height}rpx`)
      return style.join(';')
    },
    /* #ifdef H5 */
    wxTag() {
      const newImg = this.formatImg(this.info.H5.BtnImgPath)
      const newWidth = uni.upx2px(this.width) + 'px'
      const newHeight = uni.upx2px(this.height) + 'px'
      let r = ''
      if (process.env.NODE_ENV === 'production') {
        r = /*html*/ `<wx-open-launch-weapp username="${this.info.H5.OriginalId}" path="${this.info.H5.JumpUrl}">
  <template>
    <style>.btn-icon { width: ${newWidth}; height: ${newHeight}; }</style>
    <img src="${newImg}" class="btn-icon" />
  </template>
</wx-open-launch-weapp>
        `
      } else {
        r = `<view style="width: ${newWidth}; height: ${newHeight};" class="mock-btn">wx-open-launch-weapp 模拟按钮</view>`
      }
      return r
    }
    /* #endif */
  },
  methods: {
    handleNavigate() {
      this.isTap = true
      setTimeout(() => {
        this.isTap = false
      }, 200)
      /* #ifdef H5 */
      if (this.isThirdOpen) {
        // 第三方对接，小程序里面嵌套webview，跳本小程序页面
        this.$emit('third-navigate', this.info.Mp)
        return
      }
      if (!this.info.H5.JumpUrl) return
      location.href = this.info.H5.JumpUrl
      /* #endif */

      /* #ifdef MP-WEIXIN */
      // #ifdef MP-CLOUDSHOP
      if (this.navigateMp && !this.mpInfo.ishasminiprogram) return this.$msg('请联系品牌授权会员小程序哦')
      // #endif
      const path = this.info.Mp.JumpUrl
      let appId = this.info.Mp.AppId
      // #ifdef MP-CLOUDSHOP
      // 云店暂无我的奖品，互动营销应用跳转到【会员小程序-我的奖品页】
      if (path.startsWith('/personal/prize/list')) {
        appId = this.info.Mp.AppId || this.mpInfo.appid
      }
      // #endif
      navigateToMP({
        appId,
        path
      })
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
/* #ifdef H5 */
$prefix: btn-wrapper;
.#{$prefix} {
  ::v-deep {
    .mock-btn {
      display: block;
      box-sizing: border-box;
      color: #fff;
      background-color: #42b983;
      text-align: center;
      border-radius: 4px;
    }
  }
}
/* #endif */

.btn {
  transition: transform 0.2s;
}
.button-action {
  transform: scale(0.98);
}
</style>
