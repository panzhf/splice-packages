// import imgMixin from 'packages/mixins/img'
export default {
  methods: {
    formatImg(link) {
      if (!link) return ''
      return link.replace(/^(http:)?(\/\/)/, 'https:$2')
    }
  }
}

// import { previewMixin } from 'packages/mixins/img'
import { previewImage } from 'packages/utils'
export const previewMixin = {
  methods: {
    handlePreview(current) {
      previewImage({ current })
    }
  }
}

export const previewInListMixin = {
  methods: {
    handlePreview(current, urls) {
      previewImage({ current, urls })
    }
  }
}
