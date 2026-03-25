import { mapGetters } from 'vuex'
const overdueMixin = {
  data() {
    return {
      showOverdueTips: false, // true为弹出过期弹窗
      showOverdueType: 0 // 0 过期提示  1 过期提示+需要提醒对资产进行处理
    }
  },
  computed: {
    // #ifdef MP-GUIDE
    isExpires() {
      return this.$store.state.isExpires || 0
    },
    // #endif
    // #ifndef MP-GUIDE
    ...mapGetters(['isExpires'])
    // #endif
  },
  methods: {
    overdueChecked() {
      this.isExpires && (this.showOverdueTips = true)
      return !this.isExpires
    }
  }
}
export default overdueMixin
