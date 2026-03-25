<template>
  <view>
    <view v-if="!loading" class="card">
      <view class="isolation" />
      <view class="information">
        <image :src="information.collarcardinfo.backgroundmap" class="bgj" />
        <view class="user flex flex-middle flex-end">
          <view>{{ information.collarcardinfo.accountname }}</view>
          <image :src="information.collarcardinfo.accountlogo" mode="aspectFit" :lazy-load="true" />
        </view>
        <view class="grade">{{ information.collarcardinfo.gradename }}</view>
        <view class="state">
          <view class="iconfont icondaijihuo" />
          待领取
        </view>
      </view>
      <view
        v-if="tipsList.length || information.cardinstal.ispoints == 1 || information.cardinstal.iswxhb == 1"
        class="text"
        @tap="tipsUp(2)"
      >
        <view class="iconfont iconjihuojiangliicon" />
        领卡奖励
      </view>
      <!-- fieldtype： 0.基础字段，内置不可更改; >=1 自定义字段 -->
      <!-- 1.输入框 2.单项选择框 3.多项选择框  4.日期选择框 -->
      <view class="from-box">
        <view class="from">
          <block v-if="information.cardinstal && information.cardinstal.isbasicsinfo == 1">
            <view class="flex title">
              <image :src="require('./img/crown.png')" />
              会员信息
            </view>
            <view
              v-for="(item, index) in information.selectedlist"
              :key="index"
              :class="['user', 'ub', 'ub-ac', item.fieldname == '生日' ? 'birthday-tip' : '']"
            >
              <view class="mark ub ub-ac">
                <view :class="['mtt', item.isrequired ? 'required' : '']">{{ item.fieldname }}</view>
              </view>
              <view v-if="item.fieldtype == 1 || item.fieldtype == 0" class="ub-f1 ub ub-ac">
                <picker
                  v-if="item.fieldname == '生日'"
                  mode="date"
                  name="Birthday"
                  :value="item.text"
                  :end="dateEnd"
                  @change="onPickerChange($event, item)"
                >
                  <view class="picker" :style="{ color: !item.text ? '#666' : '#333' }">
                    {{ !item.text ? '请选择日期' : item.text }}
                  </view>
                </picker>
                <template v-else-if="item.fieldname == '地区'">
                  <view class="flex-1 fs-26" :style="{ color: !item.text ? '#666' : '#333' }" @click="chooseLocation()">
                    {{ !item.text ? '请点击"获取定位"' : item.text }}
                  </view>
                  <view class="mdfont icon-mdfont-address fs-26" @click="chooseLocation()">
                    <text class="fs-24 ml-10">获取定位</text>
                  </view>
                </template>
                <view v-else-if="item.fieldname == '性别'">
                  <u-radio-group v-model="item.text">
                    <u-radio :name="1" active-color="#ffa200">男</u-radio>
                    <u-radio :name="2" active-color="#ffa200">女</u-radio>
                  </u-radio-group>
                </view>
                <template v-else>
                  <input
                    v-if="item.fieldtype == 0"
                    :value="item.text"
                    :type="item | inputType"
                    :placeholder="item | formatPlaceholder"
                    placeholder-class="c-6"
                    :maxlength="item | calcMaxlength"
                    :disabled="item | checkDisabled"
                    :focus="item.fieldname == '手机' && autoFocus"
                    @input="inputValue(item, $event)"
                  />
                  <input
                    v-else
                    :value="item.text"
                    :type="item | inputType"
                    :placeholder="item | formatPlaceholder"
                    placeholder-class="c-6"
                    :maxlength="item | calcMaxlength"
                    :disabled="item | checkDisabled"
                    :focus="item.fieldname == '手机' && autoFocus"
                    @input="inputValue(item, $event)"
                  />
                </template>
                <!-- isrequired 0.非必填、不验证手机 1.必填、不验证手机 2.必填、验证手机。接口会将2处理成1返回 -->
                <!-- isopenmobileverify 0.不验证手机 1.验证手机 -->
                <button
                  v-if="item.fieldname == '手机' && item.isopenmobileverify == 1"
                  plain="true"
                  open-type="getPhoneNumber"
                  :phone-number-no-quota-toast="false"
                  class="get-mobile"
                  @getphonenumber="getPhonenumber"
                >
                  获取手机号码
                </button>
              </view>
              <view
                v-if="item.fieldtype == 2 || item.fieldtype == 3"
                class="ub-f1 fl ub-ac"
                style="overflow: hidden"
                :class="{ 'c-6': !item.text }"
                @tap="boxChoice(item)"
              >
                <view>{{ item.text ? item.text : item.fieldtip ? item.fieldtip : '请选择' }}</view>
                <view class="iconfont iconarrow-d" style="font-size: 13rpx" />
              </view>
              <view v-if="item.fieldtype == 4" :class="['ub-f1', 'ub', 'ub-ac']">
                <picker
                  mode="date"
                  name="Birthday"
                  :value="item.text"
                  :end="dateEnd"
                  @change="onPickerChange($event, item)"
                >
                  <view class="picker" :style="{ color: !item.text ? '#666' : '#333' }">
                    {{ item.text ? item.text : item.fieldtip ? item.fieldtip : '请选择日期' }}
                  </view>
                </picker>
              </view>
              <view v-if="item.fieldname == '生日'" class="birthday-tips">
                <text class="iconfont iconjingshiicon" style="color: #ffca95; margin-right: 8rpx" />
                生日信息提交后不可修改
              </view>
            </view>
          </block>
          <!-- 标签 -->
          <view v-if="information.cardinstal.activationlabels.length > 0" class="autograph">
            <view class="autograph-tit">
              <text :class="{ 'mtt required': information.cardinstal.labelrequired }">
                {{ information.cardinstal.labelname }}
              </text>
              <text>{{ information.cardinstal.labeltip }}</text>
            </view>
            <view class="autograph-item">
              <view
                v-for="(item, index) in information.cardinstal.activationlabels"
                :key="index"
                :class="[item.choice ? 'on' : '']"
                @tap="handautograph(item)"
              >
                {{ item.labelname }}
              </view>
            </view>
          </view>
          <!-- 协议 -->
          <view v-if="information.cardinstal.isagreement === 1" class="agreement">
            <checkbox-group @change="checkboxChange">
              <checkbox :checked="checkedCd" />
            </checkbox-group>
            <view class="mintext">
              我已经阅读并接受
              <text class="rule" @tap="tipsUp(1)">《会员规则协议》</text>
            </view>
          </view>
        </view>
      </view>
      <view class="btn" @tap="handCarry">立即领取</view>
    </view>
    <award-dialogs
      v-if="isShow"
      :text.sync="information.cardinstal.agreementcontent"
      :tips-type.sync="tipsType"
      :tips-list.sync="tipsList"
      :tips-obj.sync="tipsObj"
      @clone="clone"
    />
    <multiple v-if="isbox.isShow" :tips-obj.sync="objdata" @clone="clone" />
    <CommonPopup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" @close="onVerifyFail" />
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiGetmemberFormData,
  apiGetCouponList,
  apiSetReceiveCard,
  apiGetHongBaoCardListInfo,
  apiGetPickUpCouponList
} from '../api/member.js'
import { apiGetCustomerGrade } from '@/api/mini-user.js'
import AwardDialogs from './components/award-dialog.vue'
import multiple from './components/boxMultiple.vue' // 组件
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import phoneVerifyMixin from 'packages/mixins/phone-verify'
import { getUrlQuery } from 'packages/utils/function'
import { getMobileNumber } from 'packages/utils/function'
import { regMobile } from 'packages/utils/reg'
import dayjs from 'dayjs'
import { getUserLocation } from 'packages/utils/location-mp.js'
import { debounce } from 'lodash'
let vm
export default {
  components: {
    AwardDialogs,
    multiple,
    CommonPopup
  },
  filters: {
    checkDisabled(item) {
      if (item.fieldname !== '手机') return false
      if (item.isopenmobileverify === 1) {
        // 验证手机时，次数不足变手输
        return !vm.verifyState
      }
      return false
    },
    formatPlaceholder(item) {
      if (item.fieldname !== '手机') return item.fieldtip || '请输入'
      if (item.isopenmobileverify === 1) {
        return vm.verifyState ? '请输入手机号' : '请点击一键获取手机号'
      }
      return '请输入手机号'
    },
    calcMaxlength(item) {
      if (item.fieldname !== '手机') return item.fieldmaxlength || 30
      return 11
    },
    inputType(item) {
      return item.fieldname === '手机' ? 'number' : 'text'
    }
  },
  mixins: [phoneVerifyMixin],
  data() {
    return {
      tipsListT: [],
      tipsListB: [],
      loading: true,
      time1: 0,
      time2: 0,
      checkedCd: false,
      Name: '',
      Mobile: '',
      Code: '',
      Birthday: '',
      information: {},
      disabled: false,
      btnTitle: '获取验证码', //验证码文本
      dateEnd: '', //当前时间
      isShow: false,
      tipsType: 1, //1 规则 2 奖励
      tipsList: [], //券
      tipsObj: {}, //积分+红包
      wxConfig: null,
      // 0：关闭，1开启 控制显示
      form: {
        isCode: 0,
        isName: 0,
        isMobile: 0,
        isBirthday: 0
      },
      // 0：非必填，1必填 控制是否必填
      forms: {
        isCode: 0,
        isName: 0,
        isMobile: 0,
        isBirthday: 0
      },
      isbox: {
        isShow: false
      },
      objdata: {},
      scene: '',
      tfid: 0,
      needRefreshGrade: 0,
      locationInfo: {},
      flag: false
    }
  },
  beforeCreate() {
    vm = this
  },
  async onLoad(option) {
    let scene = option.scene ? option.scene : option.apply
    if (scene && scene.includes('tfid')) {
      const { tfid } = getUrlQuery(decodeURIComponent(scene))
      this.tfid = tfid
      scene = ''
    }

    if (scene) {
      this.scene = scene
    }

    option.refresh && (this.needRefreshGrade = Number(option.refresh))
  },
  async onShow() {
    // #ifdef MP-WEIXIN
    // 防止隐私不触发
    this.$refs.privacyPopup.refresh()
    // #endif
    // 获取现在时间
    this.dateEnd = dayjs().format('YYYY-MM-DD')

    await this.handleGetReceiveCardInfo()
  },
  methods: {
    async handleGetReceiveCardInfo() {
      // this.GetReceiveCardInfo()
      try {
        let res = await apiGetCustomerGrade()
        if (res.return_data.gradenumber === -1) {
          this.GetReceiveCardInfo()
        } else if (res.return_data.gradenumber === -2) {
          this.$msg('品牌未开启会员卡')
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/index/index'
            })
          }, 2000)
        } else {
          // 2022.6修改跳转页面，从会员等级说明到首页
          uni.redirectTo({
            url: '/pages/index/index'
          })
        }
      } catch (err) {
        //nothing
      }
    },

    // async
    onPickerChange(e, index) {
      let value = e.detail.value
      this.information.selectedlist.map(item => {
        if (item.fieldname === index.fieldname) {
          item.text = value
        }
      })
    },
    // 获取信息
    async GetReceiveCardInfo() {
      let res = await apiGetmemberFormData({ InviterKey: this.scene })
      this.loading = false
      if (this.$ck(res, true)) {
        res.return_data.selectedlist.map(item => {
          // 表单
          item.text = ''
          if (item.fieldtype === 2 || item.fieldtype === 3) {
            item.fieldoptionsd = item.fieldoptions.split('/').map(option => ({
              name: option,
              check: false
            }))
          }
        })
        if (res.return_data.cardinstal.activationlabels) {
          res.return_data.cardinstal.activationlabels.forEach(item => {
            // 表单
            item.choice = false
          })
        }
        this.information = Object.assign(res.return_data, this.information)
        this.wxConfig = res.return_data.wxcardconfig
        if (res.return_data.cardinstal) {
          this.tipsObj = {
            points: this.information.cardinstal.ispoints === 1 ? this.information.cardinstal.points : '',
            wxHb: this.information.cardinstal.iswxhb
          }
          await this.GetCouponList()
          await this.GetHongBg()
          await this.GetPickUp()
        }
        // 判断是否有基础信息地区设置
        const hasRegion = res.return_data.selectedlist?.some(item => item.fieldname === '地区' && item.fieldtype === 0)
        if (hasRegion && !this.flag) {
          this.flag = true
          this.chooseLocation()
        }
      } else {
        uni.showToast({
          title: res.return_msg,
          icon: 'none'
        })
      }
    },
    // 获取用户当前地址
    chooseLocation: debounce(function () {
      // 使用箭头函数确保 this 指向 Vue 实例
      ;(async () => {
        let resData = await getUserLocation({
          skipChoose: false, // 是否用地图选点
          useTencentMapAPI: false // 是否用腾讯地图逆解析
        })
        this.locationInfo = resData
        const { provincename, cityname, areaname } = resData
        this.information.selectedlist.forEach(item => {
          if (item.fieldname === '地区' && item.fieldtype === 0) {
            item.text = `${provincename}${cityname}${areaname}`
          }
        })
      })()
    }, 300), // 300毫秒的防抖时间
    // 获取手机号
    async getPhonenumber(e) {
      this.autoFocus = false
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) {
        let r = await getMobileNumber({ mobilecode: code })
        let phonenumber = r.phonenumber || ''
        this.information.selectedlist.map(item => {
          // 表单
          if (item.fieldname === '手机') {
            item.text = phonenumber
          }
        })
      }
    },
    inputValue(type, e) {
      var value = e.detail.value
      this.information.selectedlist.map(item => {
        // 表单
        if (item.fieldname === type.fieldname) {
          item.text = value
        }
      })
    },
    checkboxChange(e) {
      let val = e.detail.value.length
      this.checkedCd = val === 1
    },
    handCarry() {
      // 验证表单
      const { cardinstal, selectedlist } = this.information
      if (cardinstal.isbasicsinfo) {
        const validationMessages = {
          生日: '请选择生日日期',
          地区: '请选择地区',
          性别: '请选择性别'
        }
        for (let item of selectedlist) {
          if (item.isrequired && !item.text) {
            if ([0, 1].includes(item.fieldtype)) {
              return this.$msg(validationMessages[item.fieldname] || `请填写${item.fieldname}`)
            }

            if ([2, 3].includes(item.fieldtype)) {
              return this.$msg(`最少选择一个${item.fieldname}`)
            }
            if (item.fieldtype === 4) {
              return this.$msg('请选择日期')
            }
          }
          if (item.fieldname === '手机' && item.isrequired && !regMobile(item.text)) {
            return this.$msg('手机号格式错误')
          }
        }
      }
      // 验证标签
      if (cardinstal.labelrequired && !(cardinstal.activationlabels || []).some(item => item.choice)) {
        return this.$msg('最少选择一个标签')
      }
      // 验证规则
      if (cardinstal.isagreement && !this.checkedCd) {
        return this.$msg('请选择勾选会员协议')
      }
      this.inspect()
    },
    // 提交
    inspect() {
      // 整理数据
      let data = {
        Name: '',
        Mobile: '',
        Code: '',
        Birthday: '',
        Tdcode: '',
        Weixin: '',
        TfId: '',
        provincename: '',
        cityname: '',
        areaname: '',
        latitude: 0,
        longitude: 0,
        sex: 0, //0 未知 1男 2 女
        list: [], //标签
        FieldList: [] //自定义字段
      }
      this.information.selectedlist.map(item => {
        //表单数据拼接
        if (item.fieldname === '手机') data.Mobile = item.text
        if (item.fieldname === '姓名') data.Name = item.text
        if (item.fieldname === '生日') data.Birthday = item.text
        if (item.fieldname === '微信号') data.Weixin = item.text
        if (item.fieldname === '身份证号') data.Tdcode = item.text
        if (item.fieldname === '地区' && item.fieldtype === 0) {
          data.provincename = this.locationInfo.provincename || ''
          data.cityname = this.locationInfo.cityname || ''
          data.areaname = this.locationInfo.areaname || ''
          data.latitude = this.locationInfo.latitude || 0
          data.longitude = this.locationInfo.longitude || 0
        }
        if (item.fieldname === '性别' && item.fieldtype === 0) {
          data.sex = item.text || 0
        }
        if (item.fieldtype !== 0) {
          data.FieldList.push({
            Id: item.labelid,
            Name: item.fieldname,
            Type: item.fieldtype,
            Value: item.text
          })
        }
      })
      if (this.information.cardinstal.activationlabels) {
        this.information.cardinstal.activationlabels.map(item => {
          // 标签拼接
          if (item.choice) data.list.push(item.labelid)
        })
      }
      const time2 = +new Date()
      if (time2 - this.time1 < 1000) {
        wx.showToast({
          title: '操作过快，请稍后重试',
          // 提示的内容,
          icon: 'none',
          duration: 2000 // 延迟时间
        })
        return
      }
      this.$loading.show()
      this.time1 = +new Date()
      data.inviteropenid = this.information.inviteropenid
      data.labelidlist = this.information.labelidlist
      data.TfId = this.tfid

      apiSetReceiveCard(data).then(async res => {
        this.$loading.hide()
        if (this.$ck(res, false)) {
          let return_data = res.return_data
          if (!this.wxConfig) {
            this.$msg('领取成功')
            this.$store.dispatch('updateMemberGrade')
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/index/index'
              })
            }, 1000)
          } else {
            this.tipsType = 3
            this.tipsList = return_data
            this.tipsObj = {
              points: '',
              wxHb: ''
            }
            this.isShow = true
            this.addCard()
          }
        } else {
          let msg = res.return_msg
          this.$msg(msg)
          if (msg === '您已经是会员了') {
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/index/index'
              })
            }, 2000)
          }
        }
      })
    },
    // 添加卡包
    addCard() {
      let that = this
      let cardExt = {
        timestamp: this.wxConfig.timestamp,
        signature: this.wxConfig.signature,
        nonce_str: this.wxConfig.noncestr,
        code: ''
      }
      cardExt = JSON.stringify(cardExt)
      wx.addCard({
        cardList: [
          {
            cardId: that.wxConfig.cardid,
            cardExt: cardExt
          }
        ],
        success() {
          that.handleGetReceiveCardInfo()
        },
        fail() {
          that.handleGetReceiveCardInfo()
        }
      })
    },
    tipsUp(type) {
      this.tipsType = type
      this.isShow = true
    },
    clone(data) {
      this.isShow = false
      this.isbox.isShow = false
      if (data) {
        // 修改选中状态
        data.fieldoptionsd.map(items => {
          items.check = false
          if (data.fieldtype === 3) {
            // 多选
            data.text.length > 0 &&
              data.text.map(itemt => {
                if (itemt === items.name) {
                  items.check = true
                }
              })
          } else {
            // 单选
            if (data.text === items.name) {
              items.check = true
            }
          }
        })
        this.information.selectedlist.map(item => {
          if (item.fieldname === data.fieldname) {
            item.fieldoptionsd = data.fieldoptionsd
            if (item.fieldtype === 3) {
              item.text = data.text.length > 0 ? data.text.join('、') : ''
            } else {
              item.text = data.text
            }
          }
        })
      } else if (this.tipsType === 3) {
        this.addCard()
      }
    },
    // 卡券结构
    GetCouponList() {
      let data = JSON.parse(this.information.cardinstal.voucherjson)
      if (data.length > 0) {
        this.$loading.show()
        let list = []
        data.map(item => {
          list.push(item.VoucherID)
        })
        apiGetCouponList({
          coupon_Ids: list.join(',')
        }).then(res => {
          this.$loading.hide()
          if (this.$ck(res, true)) {
            let resData = res.return_data
            if (this.information.cardinstal.isvoucher === 1) {
              data.map(item => {
                resData.map(child => {
                  if (item.VoucherID == child.id) {
                    this.tipsList.push({
                      title: child.title,
                      type: item.Type,
                      num: item.Number
                    })
                  }
                })
              })
            }
          }
        })
      }
    },

    // 红包券结构
    GetHongBg() {
      let data = JSON.parse(this.information.cardinstal.hongbaocardjson)
      if (data.length > 0) {
        this.$loading.show()
        let list = []
        data.map(item => {
          list.push(item.HongBaoCardID)
        })
        apiGetHongBaoCardListInfo({
          ids: list.join(',')
        }).then(res => {
          this.$loading.hide()
          if (this.$ck(res, true)) {
            let resData = res.return_data
            if (this.information.cardinstal.ishongbaocard === 1) {
              data.map(item => {
                resData.map(child => {
                  if (item.HongBaoCardID === child.id) {
                    this.tipsList.push({
                      title: child.couponname,
                      type: 3,
                      num: item.Number
                    })
                  }
                })
              })
            }
          }
        })
      }
    },

    //提领券
    GetPickUp() {
      let data = JSON.parse(this.information.cardinstal.voucherjson)
      let dataT = data.filter(res => res.Type === 2)
      if (dataT.length > 0) {
        this.$loading.show()
        let list = []
        dataT.map(item => {
          list.push(item.VoucherID)
        })
        apiGetPickUpCouponList({
          coupon_Ids: list.join(',')
        }).then(res => {
          this.$loading.hide()
          if (this.$ck(res, true)) {
            let resData = res.return_data
            if (this.information.cardinstal.isvoucher === 1) {
              dataT.map(item => {
                resData.map(child => {
                  if (item.VoucherID == child.id) {
                    this.tipsList.push({
                      title: child.title,
                      type: 2,
                      num: item.Number
                    })
                  }
                })
              })
            }
          }
        })
      }
    },

    // 标签多选
    handautograph(index) {
      this.information.cardinstal.activationlabels.map(item => {
        if (item.labelid === index.labelid) {
          item.choice = !item.choice
        }
      })
    },
    boxChoice(index) {
      // 打开选择窗口
      this.isbox.isShow = true
      this.objdata = index
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  padding-bottom: 110rpx;
  .isolation {
    height: 67rpx;
  }
  .information {
    position: relative;
    width: 626rpx;
    height: 314rpx;
    margin: 0 63rpx 31rpx;
    .bgj {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    .user,
    .grade {
      padding: 0 38rpx;
    }
    .user {
      color: #fff;
      padding: 14rpx 38rpx 63rpx 38rpx;
      font-size: 30rpx;
      font-family: Microsoft YaHei;
      font-weight: 400;
      view {
        margin-right: 22rpx;
      }
      image {
        width: 59rpx;
        height: 59rpx;
        border-radius: 50%;
        background: #fff;
      }
    }
    .grade {
      line-height: 33rpx;
      margin-bottom: 46rpx;
      color: #fff;
      font-size: 38rpx;
      font-weight: bold;
      font-family: Microsoft YaHei;
    }
    .state {
      position: absolute;
      right: 0;
      display: inline-block;
      width: 136rpx;
      height: 52rpx;
      line-height: 52rpx;
      color: #fff;
      text-align: right;
      padding-right: 18rpx;
      .iconfont {
        position: absolute;
        height: 100%;
        font-size: 85rpx;
        right: -23rpx;
        z-index: -1;
        color: rgb(176, 176, 176);
      }
    }
  }
  .text {
    display: flex;
    justify-content: flex-end;
    margin: 0 63rpx 53rpx;
    font-size: 26rpx;
    font-family: Microsoft YaHei;
    font-weight: 400;
    color: #666666;
    line-height: 30rpx;
    .iconfont {
      margin-right: 16rpx;
    }
  }
  .from-box {
    padding: 0 20rpx;
    margin-bottom: 50rpx;
    .from {
      border-radius: 10rpx;
      padding: 0 30rpx 0 40rpx;
      background: #fff;
      .iconfont {
        font-size: 25rpx;
      }
      .flex {
        display: flex;
      }
      .user {
        position: relative;
        padding: 26rpx 0;
        // height: 100rpx;
        // line-height: 100rpx;
        border-bottom: 1px solid #ccc;
      }
      .title {
        padding: 30rpx 0;
        color: #343434;
        font-size: 34rpx;
        font-family: Microsoft YaHei;
        font-weight: 400;
        image {
          width: 40rpx;
          height: 40rpx;
          margin-right: 29rpx;
        }
      }
      input,
      .picker,
      textarea {
        width: 100%;
        font-size: 26rpx;
        color: #333;
      }
      picker {
        width: 100%;
      }
      .mark {
        position: relative;
        width: 180rpx;
      }
      .verification {
        input {
          width: 70%;
        }
        .code {
          padding-left: 24rpx;
          border-left: 1px solid #ccc; //#DEDEDE
          font-size: 30rpx;
          font-family: Microsoft YaHei;
          font-weight: 400;
          color: #343434;
        }
      }
      .birthday-tip {
        margin-bottom: 50rpx;
      }
      .birthday-tips {
        position: absolute;
        bottom: -90rpx;
        left: 0;
        padding: 40rpx 0;
        color: #ff7940;
        font-size: 24rpx;
      }
    }
  }

  .autograph {
    .autograph-tit {
      position: relative;
      padding: 20rpx 0;
      text:last-child {
        margin-left: 10rpx;
        color: #ccc;
        font-size: 26rpx;
      }
    }
    .autograph-item {
      display: flex;
      flex-wrap: wrap;
      view {
        font-size: 28rpx;
        padding: 8rpx 30rpx;
        border-radius: 40px;
        border: 1px solid #ddd;
        float: left;
        margin-right: 20rpx;
        margin-bottom: 20rpx;
        line-height: 1;
        height: auto;
        background: #fff;
      }
      .on {
        color: $uni-color-primary;
        border: 1px solid $uni-color-primary;
      }
    }
  }
  .agreement {
    display: flex;
    padding: 60rpx 0;
    color: #ccc;
    font-size: 26rpx;
    text {
      color: #000;
    }
    .mintext {
      margin-top: 5rpx;
      color: #000;
      .rule {
        color: #0aa6ff;
      }
    }
  }
  .btn {
    position: fixed;
    bottom: 28rpx;
    bottom: constant(28rpx + safe-area-inset-bottom);
    bottom: env(28rpx + safe-area-inset-bottom);
    text-align: center;
    color: #fff;
    width: 690rpx;
    left: 30rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
    border-radius: 40rpx;
    font-size: 36rpx;
    font-weight: 600;
  }
  .fl {
    display: flex;
    view:first-child {
      flex: 1;
    }
  }
}
.mtt {
  &.required::after {
    content: '*';
    position: absolute;
    top: 50%;
    left: -20rpx;
    transform: translateY(-50%);
    color: #ffa200;
  }
}
.get-mobile {
  width: 300rpx;
  display: block;
  border: none;
  font-size: 26rpx;
  color: #0aa6ff;
}
// 修改原有组件的样式
checkbox {
  transform: scale(0.7) translateY(-2px); // transform-origin: center right;
}
</style>
