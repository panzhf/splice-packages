/**
 * 分享有礼设置共用
 * 备注：
 * actType: 0.大转盘 1.刮刮卡 2.签到 3.签到特殊 4.问卷调查 5.投票评选 6.砍价
 * 7.梦想助力 8.微现场 9.摇一摇 10.口令红包 11.集字有礼 12.营销活动
 * 13.竞猜 14.消消乐 17.期期抽奖 19.集拼图 20.拍一拍 22.竞猜分豪礼
 */
import { apiGetShareInfo, apiAssistant } from 'packages/api/share-activity'
import { toLowerKey } from 'miduo-utils'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      shareInfo: {
        isenableentrance: false,
        isenableshareaward: false,
        awardperiodnum: '',
        winnumperperiod: '',
        themaxwinnumeveryone: '',
        themaxsharenumperday: ''
      },
      shareUser: {
        id: '',
        user: '',
        t: ''
      }
    }
  },
  computed: {
    ...mapState(['miniopenid'])
  },
  methods: {
    getShareInfo({ actId, actType }) {
      apiGetShareInfo({ aid: actId, acttype: actType }).then(res => {
        if (res.return_code === 0 && res.return_data) {
          const d = toLowerKey(res.return_data, true)
          if (!d.contentjson) return
          const c = toLowerKey(JSON.parse(d.contentjson), true)
          const { rule, ...other } = c
          const p = { shareId: d.id, ...other, ...rule, actId, actType }
          this.shareInfo = p
          uni.setStorageSync('shareActivity', p)
        }
      })
    },
    initShare(options) {
      if (options.shareId && options.shareUser && options.t) {
        this.shareUser = {
          id: options.shareId,
          user: options.shareUser,
          t: options.t
        }
        this.miniopenid && this.doShare()
      }
    },
    doShare() {
      apiAssistant(this.shareUser)
        .then(() => {
          this.$msg('助力成功', {
            duration: 5000,
            icon: 'none',
            mask: true
          })
        })
        .catch(() => {})
    }
  }
}
