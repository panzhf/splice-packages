/*
 * @Author: hishion
 * @Date: 2021-07-15 14:01:31
 * @Description 订阅消息。只有用户发生点击行为或支付回调后才能调起。
 */
const subscribeMsgMixin = {
  data() {
    return {
      noticeTempId: '', // 订阅消息id
      noticeTempList: [], // 订阅消息id集合
      subscribedTempIds: [] // 已经订阅的模板ID集合
    }
  },
  methods: {
    requestSubscribeMsg(tempIds) {
      this.subscribedTempIds = [] // 清空已订阅的模板ID集合
      return new Promise(resolve => {
        // 传入模板id集合，[this.noticeTempId]，或者 this.noticeTempList
        if (tempIds.length === 0) {
          setTimeout(() => {
            resolve()
          }, 300)
        }
        uni.requestSubscribeMessage({
          tmplIds: tempIds,
          success: res => {
            // 遍历对象，value 的值为accept时候，把key 整成数组存入this.subscribedTempIds
            this.subscribedTempIds = Object.keys(res).filter(key => res[key] === 'accept')
            // res格式为 {'TEMPLATE_ID': 'accept'|'rject'|'ban'|'filter'}
            resolve(res) // 传递结果出去，页面进行业务处理
          },
          fail: res => {
            const msg = {
              // 10001: '模块ID为空',
              10002: '请求消息列表失败，请检查网络',
              10003: '订阅消息失败，请检查网络',
              10004: '参数类型错误',
              10005: '小程序退后台无法展示 UI',
              20001: '模板ID不存在，或者和模板类型不对应',
              20002: '模板消息类型需要同种类型',
              20003: '模板消息数量超过上限',
              20004: '您设置了不接收订阅消息',
              20005: '小程序被禁封'
            }

            if (res.errCode === 20004) {
              uni.showModal({
                title: msg[`${res.errCode}`],
                cancelText: '确定',
                confirmText: '去开启',
                success(res) {
                  if (res.confirm) {
                    uni.openSetting({
                      withSubscriptions: true,
                      complete() {
                        resolve()
                      }
                    })
                  } else {
                    resolve()
                  }
                }
              })
            } else {
              msg[`${res.errCode}`] && this.$msg(msg[`${res.errCode}`])
              resolve()
            }
          }
        })
      })
    }
  }
}

export default subscribeMsgMixin

// #ifdef MP-RETAIL
import { apiGetSubscribeTemplateId } from '@/api/cloud-store'
import { apiSubscribeSetting, apiSubscribeReport } from '@/api/message'
import { getJsCode } from '@/utils/set-mp'
// 零售助手订阅消息，一般搭配上面的subscribeMsgMixin使用
export const noticeMixin = {
  data() {
    return {
      subscribeSettings: {} // 订阅消息配置
    }
  },
  methods: {
    initNotice(nodecode) {
      // 543.零钱提现到账 546.宴席有礼订单审核 547.陈列有礼订单审核 548.陈列有礼活动开始 550 门店动销 556 登记有礼
      // 551 团购有礼
      const validNodecodes = [543, 546, 547, 548, 550, 551, 556]
      if (!nodecode || !validNodecodes.includes(nodecode)) {
        return Promise.resolve({})
      }

      return new Promise(resolve => {
        apiSubscribeSetting({ nodecode }).then(res => {
          let settings = {}
          if (this.$ck(res)) {
            settings.isopen = !!res.return_data?.status && !!res.return_data?.enableretailassistantsubscribe
          }
          resolve(settings)
        })
      })
    },
    async fetchNotice(type) {
      // 4.陈列有礼（订单审核、活动开始）8.陈列有礼订单审核 9.陈列有礼活动开始
      // 6.零钱提现到账 7.宴席有礼订单审核 10.动销有礼 11.团购有礼 12.登记有礼
      const validTypes = [4, 8, 9, 6, 7, 10, 11, 12]
      if (!type || !validTypes.includes(type)) {
        return
      }
      apiGetSubscribeTemplateId({
        js_code: await getJsCode(),
        type
      }).then(res => {
        const l = res.return_data || []
        if ([4, 8, 9].includes(type)) {
          this.noticeTempList = l
        }
        if ([6, 7, 10, 11, 12].includes(type)) {
          this.noticeTempId = l[0]
        }
      })
    }
  }
}

// 陈列有礼组件设计问题，拆分
export const noticeMixin2 = {
  methods: {
    async reportNotice({ subscriberesult, type, orderid = '' } = {}) {
      if (!subscriberesult || Object.keys(subscriberesult).length === 0) return

      const validTypes = [4, 8, 9, 6, 7, 10, 11, 12]
      if (!type || !validTypes.includes(type)) return

      // msgsendtype  135.零钱提现到账 138.宴席有礼订单审核 139.陈列有礼订单审核 140.陈列有礼活动开始 141.推荐有礼
      // 11.团购有礼 12.登记有礼
      const msgSendTypes = {
        6: 135,
        7: 138,
        8: 139,
        9: 140,
        10: 318,
        11: 319,
        12: 141
      }
      let list = []

      if ([4, 8, 9].includes(type)) {
        list = this.noticeTempList.map((item, index) => {
          if (subscriberesult[item] === 'accept') {
            return {
              templateid: item,
              msgsendtype: type === 4 ? msgSendTypes[index === 0 ? 8 : 9] : msgSendTypes[type]
            }
          }
        })
      }
      if ([6, 7, 10, 11, 12].includes(type)) {
        if (subscriberesult[this.noticeTempId] === 'accept') {
          list.push({
            templateid: this.noticeTempId,
            msgsendtype: msgSendTypes[type]
          })
        }
      }
      // 开发工具上有多个模板，只能返回一个
      list = list.filter(Boolean)
      // 没有订阅数据不上报
      if (list.length === 0) return
      // 提现不用orderid
      apiSubscribeReport({
        keyword: `${orderid}`,
        list,
        js_code: await getJsCode()
      })
    }
  }
}
// #endif
