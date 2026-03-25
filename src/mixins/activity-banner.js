// 活动中心首页banner使用
// import activityBannerMixin from 'packages/mixins/activity-banner'
import { apiGetActivityBanner } from '@/api/activity'

export default {
  data() {
    return {
      activityList: [],
      showBanner: false
    }
  },
  methods: {
    fetchBannerList() {
      apiGetActivityBanner().then(res => {
        if (this.$ck(res)) {
          const d = res.return_data
          this.activityList = d ? [d] : []
        }
      })
    }
  }
}
