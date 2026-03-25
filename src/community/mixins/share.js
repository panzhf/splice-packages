export default {
  data() {
    return {
      share: {
        title: '',
        path: '',
        imageUrl: ''
      }
    }
  },
  methods: {
    setShare(info) {
      let id = encodeURIComponent(`id=${info.communityid}`)
      let scene = `scene=${id}`
      this.share.path = `/packages/src/community/detail?${scene}`
      this.share.imageUrl = info.imageUrl
      this.share.title = info.content ? info.content : `你的朋友发布了种草，快来看看吧~`
    }
  },
  onShareAppMessage(e) {
    if (e.from === 'button') {
      return {
        title: this.share.title,
        path: this.share.path,
        imageUrl: this.share.imageUrl
      }
    }
  }
}
