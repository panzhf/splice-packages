const BASE_STYLE = {
  strike: 'text-decoration: line-through',
  table: 'border-collapse:collapse;width: 100%'
}
const baseBorderColor = '#000'
let borderColor = '#000'
// #ifdef MP-MEMBER
borderColor = '#ffe497'
// #endif

// import richTextMixin from 'packages/mixins/rich-text'
// 具有主题色
export default {
  data() {
    return {
      parseStyle: {
        ...BASE_STYLE,
        th: `border: 1px solid ${borderColor};text-align: center;min-width: 40px`,
        td: `border: 1px solid ${borderColor};min-width: 40px`
      }
    }
  }
}

// import { richText2Mixin } from 'packages/mixins/rich-text'
// 黑色边框表格，适用于白色背景等
export const richText2Mixin = {
  data() {
    return {
      parseStyle: {
        ...BASE_STYLE,
        th: `border: 1px solid ${baseBorderColor};text-align: center;min-width: 40px`,
        td: `border: 1px solid ${baseBorderColor};min-width: 40px`
      }
    }
  }
}
