/**
 * 消息订阅升级
 * 会员小程序：个人中心-我的奖品，点击菜单时；扫码模板中奖/重复领奖弹窗，包含实物、提领券，点击去使用按钮
 */
import { apiGetPrizeMsgTemplate } from 'packages/api/my'
import subscribeMsgMixin from './subscribe-msg'

// 个人中心用
export const subscribePrizeMixin = {
  mixins: [subscribeMsgMixin],
  methods: {
    fetchTemplates({ product = false, bringcoupon = false } = {}) {
      return new Promise(resolve => {
        apiGetPrizeMsgTemplate({
          haveProduct: product,
          haveExchangeVoucher: bringcoupon
        })
          .then(res => {
            const { templateids = [] } = res.return_data
            this.noticeTempList = templateids
            resolve()
          })
          .catch(() => {
            resolve()
          })
      })
    }
  }
}

// 扫码模板用：结合上面的 `subscribePrizeMixin`
export const subscribePrizeJudgeMixin = {
  methods: {
    async initTemplateSetting(prizeInfo) {
      let setting = {}
      if (prizeInfo.IsProduct && prizeInfo.IsVirtual === 0) {
        setting.product = true
      }
      if (prizeInfo.IsGetVolume && prizeInfo.VolumeType === 2) {
        setting.bringcoupon = true
      }
      this.fetchTemplates(setting)
    }
  }
}
