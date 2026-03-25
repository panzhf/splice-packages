/**
 * 消息订阅升级
 * 会员小程序：个人中心页面，点击底部导航栏个人中心tab时
 */
import { apiGetMyPageMsgTemplate, apiNeedSubscribeMsgTemplate, apiAddMessageSubscribeRecord } from 'packages/api/my'
import subscribeMsgMixin from './subscribe-msg'

// 常量定义
const MSG_TYPE = 128 // 128.积分清零
const SCENE_MEMBER = 3 // 会员小程序
const SCENE_CLOUDSHOP = 10 // 云店小程序

// 个人中心用
export const subscribeMeMixin = {
  mixins: [subscribeMsgMixin],
  data() {
    return {
      templateItems: [] // 保存模板完整信息 [{templateid, msgsendtype}]
    }
  },
  methods: {
    /**
     * 获取场景值：3.会员小程序 10.云店小程序
     */
    getScene() {
      let scene = SCENE_MEMBER
      // #ifdef MP-CLOUDSHOP
      scene = SCENE_CLOUDSHOP
      // #endif
      return scene
    },
    /**
     * 判断是否需要订阅
     */
    async checkNeedSubscribe(scene) {
      const res = await apiNeedSubscribeMsgTemplate({
        scene,
        type: MSG_TYPE
      })
      if (this.$ck(res)) {
        return !!res.return_data?.needsubscribe
      }
      return false
    },
    /**
     * 获取消息模板列表
     */
    async getTemplateList(scene) {
      const res = await apiGetMyPageMsgTemplate({
        scene,
        type: [MSG_TYPE]
      })
      if (this.$ck(res)) {
        const items = res.return_data?.items || []
        // 保存完整的模板信息
        this.templateItems = items
        // 返回 templateid 数组用于订阅
        return items.map(item => item.templateid)
      }
      this.templateItems = []
      return []
    },
    /**
     * 获取订阅模板列表
     */
    async fetchTemplates() {
      const scene = this.getScene()

      // 判断是否需要订阅
      const needSubscribe = await this.checkNeedSubscribe(scene)
      if (!needSubscribe) {
        this.noticeTempList = []
        this.templateItems = []
        return
      }

      // 获取模板列表
      this.noticeTempList = await this.getTemplateList(scene)
    },
    /**
     * 处理个人中心订阅消息流程
     * 先判断是否需要订阅，如果需要则获取模板并请求订阅
     */
    async handleMeSubscribe() {
      await this.fetchTemplates()
      if (!this.noticeTempList?.length) return

      await this.requestSubscribeMsg(this.noticeTempList)

      // 订阅成功后，记录订阅信息
      if (this.subscribedTempIds?.length) {
        await this.addMessageSubscribeRecord()
      }
    },
    /**
     * 添加订阅记录
     */
    async addMessageSubscribeRecord() {
      if (!this.subscribedTempIds?.length || !this.templateItems?.length) return

      const scene = this.getScene()
      // 根据订阅成功的 templateid 匹配对应的 msgsendtype
      const list = this.subscribedTempIds
        .map(templateid => {
          const item = this.templateItems.find(t => t.templateid === templateid)
          return item
            ? {
                templateid,
                msgsendtype: item.msgsendtype
              }
            : null
        })
        .filter(Boolean)

      if (!list.length) return

      // 云店小程序时获取当前门店ID
      let storeid = 0
      // #ifdef MP-CLOUDSHOP
      const storeInfo = getApp()?.globalData?.storeInfo
      storeid = storeInfo?.Id || 0
      // #endif

      await apiAddMessageSubscribeRecord({
        scene,
        storeid, // 云店小程序传入当前门店ID
        keyword: '', // 可选
        list
      })
    }
  }
}
