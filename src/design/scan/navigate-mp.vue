<template>
  <view class="navigate-button" :style="containerStyle">
    <view class="img-box">
      <!-- #ifdef MP-WEIXIN -->
      <image :src="imgUrl" mode="widthFix" class="image" @tap.stop="handleNavigate" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <div class="weapp-btn" v-html="btnWxHtml" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import navigateToMP from '@/utils/navigate-mp'
// #endif

import imgMixin from 'packages/mixins/img'

export default {
  mixins: [imgMixin],
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    params: {
      type: Object,
      default() {
        return {}
      }
    },
    mode: {
      type: Number,
      default: 1 // 1.默认，防伪查询页 2.点得奖等消费者模板
    }
  },
  data() {
    return {
      imgUrl: '',
      path: '',
      // #ifdef H5
      btnWxHtml: ''
      // #endif
    }
  },
  computed: {
    containerStyle() {
      let s = []
      s.push(`padding: 0 ${(this.info.gap || 0) * 2}rpx`)
      s.push(`margin-top: ${(this.info.topGap || 0) * 2}rpx`)
      return s.join(';')
    }
  },
  watch: {
    info: {
      handler(val) {
        this.imgUrl = this.formatImg(val.imgUrl)
        // 处理来源参数
        let sourceParams = ''
        if (this.mode === 1) {
          sourceParams = `miduo_transfer=${val.transfer}`
        }

        // 处理自定义参数
        const customParams = Object.entries(this.params)
          .map(([key, value]) => {
            if (key === 'miduo_code') {
              return `${key}=${encodeURIComponent(value)}`
            }
            // 其他参数保持原样
            return `${key}=${value}`
          })
          .join('&')

        // 合并所有参数
        const allParams = [customParams, sourceParams].filter(Boolean).join('&')
        // 判断path的连接符，如果path有?则需要加上&，否则需要加上?
        const join = val.path.includes('?') ? '&' : '?'
        this.path = `${val.path}${join}${allParams}`
        // #ifdef H5
        // #ifdef H5-DECORATE
        if (this.mode !== 1) {
          // 装修预览与防伪查询页条件编译平台相同，用mode区分
          this.btnWxHtml = `<img src="${this.imgUrl}" style="display:block;width: 100%;">`
          return
        }
        // #endif
        if (process.env.NODE_ENV === 'production') {
          const envVersion = this.info.envVersion || 'release'
          this.btnWxHtml = /*html*/ `
          <wx-open-launch-weapp id="launch-btn" appid="${this.info.appId}" path="${this.path}" env-version="${envVersion}" style="display:block;width: 100%;height: 100%;">
              <template type="text/wxtag-template">
                <style>.btn-icon,.img-icon{ display:block;width: 100%;}</style>
                <div class="btn-icon">
                  <img src="${this.imgUrl}" class="img-icon">
                </div>
              <template>
            </wx-open-launch-weapp>
          `
        } else {
          this.btnWxHtml = `<img src="${this.imgUrl}" style="display:block;width: 100%;">`
        }
        // #endif
      },
      immediate: true,
      deep: true
    }
  },
  // #ifdef H5
  mounted() {
    this.$nextTick(() => {
      const weappElement = document.getElementById('launch-btn')
      if (weappElement) {
        weappElement.addEventListener('error', () => {
          this.$msg('跳转小程序失败，请检查小程序AppID或页面路径是否正确', { duration: 4000 })
        })
      }
    })
  },
  // #endif
  methods: {
    handleNavigate() {
      // #ifdef MP-WEIXIN
      const envVersion = this.info.envVersion || 'release'
      navigateToMP({
        appId: this.info.appId,
        path: this.path,
        envVersion,
        onlyMp: true
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: 'navigate-button';
.#{$prefix} {
  overflow: hidden;
  .img-box {
    position: relative;
  }
  /* #ifdef MP-WEIXIN */
  .image {
    display: block;
    width: 100%;
    margin: 0 auto;
  }
  /* #endif */
}
</style>
