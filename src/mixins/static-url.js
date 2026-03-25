/*
 * 挂载静态资源路径，H5模式支持Vue.prototype，小程序不支持
 * 以mixin形式混入，为了不添加无用变量，将主库和组件库路径分隔
 * <image :src="STATIC_URL + 'avatar.png'" />
 * <image :src="PACKAGE_STATIC_URL + 'avatar.png'" />
 */
import { staticURL } from '@/config'

export const staticMixin = {
  data() {
    return {
      STATIC_URL: staticURL()
    }
  }
}

export const packageStaticMixin = {
  data() {
    return {
      PACKAGE_STATIC_URL: staticURL(true)
    }
  }
}
