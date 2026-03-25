<template>
  <view class="btn-wrapper" :style="btnStyle">
    <!-- #ifdef H5 -->
    <div class="btn-content" v-html="wxTag" />
    <view>{{ info.tipsText }}</view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  name: 'DrowBtn',
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isTap: false,
      wxTag: ''
    }
  },
  watch: {
    info: {
      immediate: true,
      deep: true,
      handler(v) {
        v && this.updateWxTag()
      }
    }
  },
  methods: {
    btnStyle() {
      let s = []
      this.info.textColor && s.push(`color: ${this.info.textColor || 'white'}`)
      this.info.textFontSize && s.push(`font-size: ${this.info.textFontSize}px`)
      this.info.fontWeight && s.push(`font-weight: ${this.info.fontWeight || 'normal'}`)
      return s.join(';')
    },
    updateWxTag() {
      // 如果 appid 和 username 都为空，无法使用 wx-open-launch-weapp
      if (!this.info.appid && !this.info.username) {
        this.wxTag = ''
        return
      }
      let r = ''
      let s = []
      this.info.width && s.push(`width: ${this.info.width}`)
      this.info.height && s.push(`height: ${this.info.height || '100%'}`)
      this.info.fontWeight && s.push(`font-weight: ${this.info.fontWeight || 'normal'}`)
      let str = s.join(';')
      // 构建属性字符串，只传入有效值
      let attrs = []
      if (this.info.appid) attrs.push(`appid="${this.info.appid}"`)
      if (this.info.username) attrs.push(`username="${this.info.username}"`)
      if (this.info.path) attrs.push(`path="${this.info.path}"`)
      r = /*html*/ `<wx-open-launch-weapp ${attrs.join(' ')} style="display:block;width: 100%;height: 100%;">
            <template>
              <style>.btn-icon { display:block;width: 100%;${str} }</style>
              <div class="btn-icon"></div>
            </template>
          </wx-open-launch-weapp>
        `
      this.wxTag = r
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-wrapper {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  .btn-content {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
  }
}
</style>
