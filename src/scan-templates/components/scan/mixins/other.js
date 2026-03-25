import { staticURL } from '@/config'
export const otherMixin = {
  data() {
    return {}
  },
  computed: {
    // 头部的标题
    popTitleImg() {
      if (!this.winPageSetting) return staticURL(true) + ''
      return this.winPageSetting.winTopImg
    }
  }
}
