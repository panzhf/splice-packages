<template>
  <view>
    <view v-if="isShow" class="collect-dialog-container">
      <view class="mask" @click="handleClickMask" />
      <view class="content">
        <!-- 如果只验证了手机号，并且是小程序 -->
        <template v-if="showNewGetPhone">
          <view class="new-phone-popup center flex-column">
            <view class="iconfont iconshouji center flex-column mt-50" />
            <view class="title mt-30">绑定手机号</view>
            <view class="tips">请先绑定手机号再进行领奖</view>
            <!-- 没开启手机验证或者次数不足，需手输 -->
            <template v-if="!canGetPhoneNumber">
              <input
                v-model.trim="form.Mobile"
                type="number"
                placeholder="请输入手机号"
                :maxlength="11"
                :focus="autoFocus"
                class="custom-input mt-30"
              />
              <button class="telenumber center mb-70 mt-60" @click="onPhoneConfirm">确 认</button>
            </template>
            <template v-else>
              <button
                plain="true"
                open-type="getPhoneNumber"
                :phone-number-no-quota-toast="false"
                class="telenumber center mb-70 mt-60"
                @getphonenumber="handleGetPhonenumber($event, 'submit')"
              >
                <text class="iconfont iconwechat center mr-20" />
                微信用户一键绑定
              </button>
            </template>
            <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog" />
          </view>
        </template>
        <template v-else>
          <view class="title" :style="{ backgroundImage: 'url(' + titleBgImg + ')' }">
            请先完善资料再{{ mode === 1 ? '领取' : '领奖' }}
          </view>
          <scroll-view scroll-y class="collect-body">
            <view class="padding-30">
              <view v-if="info.IsCheckName" class="collect-group">
                <view class="collect-label">姓名</view>
                <view class="collect-control">
                  <input v-model="form.name" type="text" placeholder="请输入姓名" class="collect-input" />
                </view>
              </view>
              <view v-if="info.IsCheckPhone" class="collect-group">
                <view class="collect-label">手机号码</view>
                <view class="collect-control">
                  <!-- #ifdef H5 -->
                  <input v-model="form.Mobile" type="number" placeholder="请输入手机号" class="collect-input" />
                  <!-- #endif -->
                  <!-- #ifdef MP-WEIXIN -->
                  <input
                    v-model="form.Mobile"
                    type="number"
                    :placeholder="phonePlaceholder"
                    :disabled="canGetPhoneNumber"
                    :focus="autoFocus"
                    class="collect-input mobile-input"
                  />
                  <button
                    v-if="info.IsCheckMessage"
                    plain="true"
                    open-type="getPhoneNumber"
                    :phone-number-no-quota-toast="false"
                    class="telenumber"
                    :style="{ backgroundImage: 'url(' + wxBgImg + ')' }"
                    @getphonenumber="handleGetPhonenumber"
                  >
                    一键获取
                  </button>
                  <!-- #endif -->
                </view>
              </view>
              <!-- #ifdef H5 -->
              <view v-if="info.IsCheckPhone && info.IsCheckMessage" class="collect-group">
                <view class="collect-label">验证码</view>
                <view class="collect-control">
                  <input v-model="form.Code" type="number" placeholder="请输入验证码" class="collect-input" />
                  <view v-if="time <= 0" class="code-button" @tap="handleCode">获取验证码</view>
                  <view v-else class="code-button">{{ time }}秒后重试</view>
                </view>
              </view>
              <!-- #endif -->
              <view v-if="info.IsCollectWXNo" class="collect-group">
                <view class="collect-label">微信号</view>
                <view class="collect-control">
                  <input v-model="form.WeiXin" type="text" placeholder="请输入微信号" class="collect-input" />
                </view>
              </view>
              <view v-if="info.IsCollectIDCard" class="collect-group">
                <view class="collect-label">身份证号</view>
                <view class="collect-control">
                  <input v-model="form.IDCard" type="idcard" placeholder="请输入身份证号" class="collect-input" />
                </view>
              </view>
              <view v-if="info.IsCollectSex" class="collect-group">
                <view class="collect-label">性别</view>
                <view class="collect-control">
                  <picker class="select-picker" :range="Sexarray" :value="sexValue" @change="handleRadioChange">
                    <view class="uni-input">{{ Sexarray[sexValue] }}</view>
                  </picker>
                  <view class="down-arrow iconfont iconjiantou1 c-6 fs-28" />
                </view>
              </view>

              <view v-if="info.IsCollectBirthday" class="collect-group">
                <view class="collect-label">生日</view>
                <view class="collect-control">
                  <view class="picker" @click="isShowDatePicker = true">
                    <view class="picker-value">{{ form.Birthday || '请选择' }}</view>
                  </view>
                  <view class="down-arrow iconfont iconjiantou1 c-6 fs-28" />
                </view>
              </view>
              <template v-if="form.ListFieldCustomerInfo">
                <view
                  v-for="(item, index) in form.ListFieldCustomerInfo"
                  :key="index"
                  class="collect-group"
                  :class="'field-input-type' + item.fieldInputType"
                >
                  <view class="collect-label">{{ item.fieldName }}</view>
                  <!-- 多项选择框（多选） -->
                  <view v-if="item.fieldType == 3 && item.fieldInputType == 2" class="field-type2-tips">
                    {{ item.fieldTip || '请选择' }}
                  </view>
                  <view v-if="item.fieldType == 3 && item.fieldInputType == 2" class="field-type2">
                    <checkbox-group :data-index="index" class="field-type2-group" @change="handlecheckboxChange">
                      <label v-for="(child, q) in item.fieldOptions" :key="q" class="field-type2-label">
                        <checkbox :value="child" class="check-icon" color="#f02d17" />
                        {{ child }}
                      </label>
                    </checkbox-group>
                  </view>
                  <view v-else class="collect-control">
                    <!-- 日期选择框 -->
                    <!-- #ifdef MP-WEIXIN -->
                    <picker
                      v-if="item.fieldType == 4"
                      class="picker"
                      mode="date"
                      @change="handleDateChangeTypeDiy($event, index)"
                    >
                      <view class="picker-value">{{ item.FieldValue || item.fieldTip || '请选择' }}</view>
                    </picker>
                    <!-- #endif -->
                    <!-- #ifdef H5 -->
                    <u-input
                      v-if="item.fieldType == 4"
                      class="picker"
                      :placeholder="item.FieldValue || item.fieldTip || '请选择'"
                      @click="handleDateChangeTypeDiy($event, index)"
                    />
                    <!-- #endif -->
                    <view v-if="item.fieldType == 4" class="down-arrow iconfont iconjiantou1 c-6 fs-28" />
                    <!-- 单行文本框 -->
                    <input
                      v-if="item.fieldType == 1"
                      v-model="item.FieldValue"
                      :placeholder="item.fieldTip || '请输入'"
                      :maxlength="item.fieldMaxLength"
                      class="collect-input"
                      @input="handleTextChange(item, index)"
                    />
                    <text v-if="item.fieldType == 1 && item.fieldUnit" class="unit">{{ item.fieldUnit }}</text>
                    <!-- 多项选择框（下拉） -->
                    <view
                      v-if="item.fieldType == 3 && item.fieldInputType == 1"
                      class="flex"
                      @click="handleChooseMultiterm(item, index)"
                    >
                      <input
                        v-model="item.FieldValue"
                        type="text"
                        :placeholder="item.fieldTip || '请输入'"
                        class="collect-input"
                        disabled
                      />
                      <view class="down-arrow iconfont iconjiantou1 fs-28" />
                    </view>
                    <!-- 单项选择框 -->
                    <radio-group
                      v-if="item.fieldType == 2"
                      class="radio-group"
                      :data-index="index"
                      @change="handleRadioChangeDiy"
                    >
                      <label v-for="(child, q) in item.fieldOptions" :key="q" class="radio-label">
                        <radio class="check-icon" :value="child" color="#f02d17" />
                        {{ child }}
                      </label>
                    </radio-group>
                  </view>
                </view>
              </template>
            </view>
          </scroll-view>

          <view class="collect-footer flex flex-column flex-middle">
            <view v-if="info.IsCheckUserPrompt" class="collect-remark padding-30">
              温馨提示：{{ info.UserPromptMsg }}
            </view>
            <view class="collect-submit flex flex-center flex-middle padding-30" @tap="handleSubmit">
              {{ mode === 1 ? '立即领取' : '去领奖' }}
            </view>
            <view class="rule-box">
              <icon
                :type="agreeRule ? 'success' : 'circle'"
                class="icon-checked"
                size="34rpx"
                :color="agreeRule ? '#f0311d' : '#ccc'"
                @tap="agreeRule = !agreeRule"
              />
              <view class="rule-text">
                阅读并同意
                <text class="rule-link" @tap.stop="handleLinkRule(privacyRuleNo, 'rule')">《隐私政策》</text>
                和
                <text class="rule-link" @tap.stop="handleLinkRule(userRuleNo, 'rule')">《用户协议》</text>
                <text v-if="showmerchantprivacystatement" class="rule-link" @tap.stop="handleLinkRule(businessRuleNo, 'business')">《商家隐私声明》</text>
              </view>
            </view>
          </view>
          <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog" />
        </template>
      </view>

      <multiterm-select-dialog
        :is-visible.sync="isShowMultitermDialog"
        :list="multitermList"
        :selected-val="selectedVal"
        @selectedList="handleUpdateMultitermSelectList"
      />
      <u-picker v-model="isShowDatePicker" mode="time" @confirm="handleDateChange">请选择</u-picker>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <CommonPopup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" @close="onVerifyFail" />
    <!-- #endif -->
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiSetUserInfo, apiSendCode, apiSetAwardUserInfo } from 'packages/api/scan'
import MultitermSelectDialog from 'packages/components/popup/multiterm-select.vue'
/* #ifdef MP-WEIXIN */
import { getMobileNumber } from 'packages/utils/function'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
import phoneVerifyMixin from 'packages/mixins/phone-verify'
/* #endif */
/* #ifdef H5 */
import { getQuery } from 'packages/utils/function'
/* #endif */
import { regMobile } from 'packages/utils/reg'
import ruleConfigMixin from 'packages/utils/rules-config'
export default {
  components: {
    MultitermSelectDialog,
    // #ifdef MP-WEIXIN
    CommonPopup
    // #endif
  },
  mixins: [
    // #ifdef MP-WEIXIN
    phoneVerifyMixin,
    // #endif
    ruleConfigMixin
  ],
  props: {
    mode: {
      type: Number,
      default: 0 // 0 用户字段 1 领奖字段登记
    },
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 弹窗内容
    infoConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    openId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShowDatePicker: false,
      info: {},
      timer: null,
      time: 0,
      date: '',
      titleBgImg: staticURL(true) + 'scan/collect-dialog-title-bg.png', // 标题背景图
      wxBgImg: staticURL(true) + 'scan/weixin-icon.png', //微信一键登录图
      downImg: staticURL(true) + 'scan/collect-dialog-down.jpg', // 向下箭头
      form: {
        Birthday: '',
        IDCard: '',
        ListFieldCustomerInfo: [],
        Mobile: '',
        Sex: 1,
        WeiXin: ''
      },
      disabled: false, //判断如果点击了一键获取手机号获取完成就不给人修改
      agreeRule: false, // 是否同意授权
      // isCheckUser: returnData.IsCheckUser, // 是否开启身份验证
      // isCheckMessage: returnData.IsCheckMessage, // 是否开启手机短信验证
      // isCheckName: returnData.IsCheckName, // 是否填写名称
      // isCheckPhone: returnData.IsCheckPhone, // 是否验证手机
      // isCollectBirthday: returnData.IsCollectBirthday, // 是否收集生日
      // isCollectIDCard: returnData.IsCollectIDCard, // 是否收集身份证号码
      // isCollectSex: returnData.IsCollectSex, // 是否收集性别
      // isCollectWXNo: returnData.IsCollectWXNo // 是否收集微信
      Sexarray: ['男', '女'],
      sexValue: 0,
      isShowMultitermDialog: false, // 是否先多项选择框弹窗
      multitermList: [], // 多项选择框列表
      selectedVal: '', // 多项选择框已选值
      currentChangeIndex: -1 // 当前修改多项选择框索引
    }
  },
  computed: {
    showNewGetPhone() {
      // 判断是否只有获取手机号一个选项,不管开不开启手机验证
      /* #ifdef MP-WEIXIN */
      return (
        !this.info.IsCheckName &&
        this.info.IsCheckPhone &&
        !this.info.IsCollectWXNo &&
        !this.info.IsCollectIDCard &&
        !this.info.IsCollectSex &&
        !this.info.IsCollectBirthday &&
        !this.form.ListFieldCustomerInfo.length
      )
      /* #endif */
      /* #ifdef H5 */
      return false // eslint-disable-line
      /* #endif */
    },
    canGetPhoneNumber() {
      // 开启手机验证且次数充足，只能一键获取手机号
      return this.info.IsCheckMessage && !this.verifyState
    },
    phonePlaceholder() {
      return this.canGetPhoneNumber ? '请点击一键获取手机号' : '请输入手机号'
    }
  },
  watch: {
    infoConfig: {
      handler(val) {
        if (val && JSON.stringify(val) !== '{}') {
          let obj = JSON.parse(JSON.stringify(val))
          let row = []
          if (obj.UserInfo.ListFieldCustomerInfo) {
            obj.UserInfo.ListFieldCustomerInfo.forEach(item => {
              let fieldOptions = []
              if (item.fieldType === 3 || item.fieldType === 2) {
                fieldOptions = item.fieldOptions.split('/')
              }
              let objItem = {
                FieldId: String(item.id),
                FieldValue: item.fieldValue || '',
                fieldType: item.fieldType,
                fieldName: item.fieldName,
                fieldMaxLength: item.fieldMaxLength,
                fieldTip: item.fieldTip,
                fieldInputType: item.fieldInputType,
                fieldUnit: item.fieldUnit,
                fieldOptions,
                fieldDefaultValue: item.fieldDefaultValue
              }
              row.push(objItem)
            })
          }
          obj.UserInfo.ListFieldCustomerInfo = row
          if (this.mode === 1) {
            obj.UserInfo.name = ''
            obj.UserInfo.Mobile = ''
          }
          this.form = obj.UserInfo
          this.info = val
          this.disabled = false
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleCode() {
      if (!this.form.Mobile) {
        return this.$msg('请先填写手机号')
      }
      if (!/^1\d{10}$/.test(this.form.Mobile)) {
        return this.$msg('请填写正确的手机号')
      }
      /* #ifdef MP-WEIXIN */
      apiSendCode({
        Mobile: this.form.Mobile
      })
        .then(res => {
          if (this.$ck(res)) {
            this.$msg('验证码发送成功', { icon: 'success' })
            let TIME = 60
            this.timer = setInterval(() => {
              TIME--
              this.time = TIME
              if (TIME <= 0) {
                clearInterval(this.timer)
                this.timer = null
              }
            }, 1000)
          }
        })
        .catch(() => {
          this.time = 0
        })
      /* #endif */
      /* #ifdef H5 */
      apiSendCode({
        mobile: this.form.Mobile,
        OpenID: this.openId,
        m: getQuery('m'),
        IsUpdatePhone: this.mode === 1 ? 0 : 1
      })
        .then(res => {
          this.$msg('验证码发送成功', { icon: 'success' })
          let TIME = 60
          this.timer = setInterval(() => {
            TIME--
            this.time = TIME
            if (TIME <= 0) {
              clearInterval(this.timer)
              this.timer = null
            }
          }, 1000)
        })
        .catch(err => {
          this.$msg(err.return_msg)
          this.time = 0
        })
      /* #endif */
    },
    // 点击遮罩
    handleClickMask() {
      this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    },
    handleDateChange(e) {
      this.form.Birthday = `${e.year}-${e.month}-${e.day}`
    },
    /** 动态表单日期选择赋值 */
    handleDateChangeTypeDiy(e, index) {
      /* #ifdef H5 */
      this.$emit('date', index)
      /* #endif */
      /* #ifdef MP-WEIXIN */
      let val = e.target.value
      this.$set(this.form.ListFieldCustomerInfo[index], 'FieldValue', val)
      /* #endif */
    },
    // 日期选择确定回调
    dateConfirm(index, val) {
      this.$set(this.form.ListFieldCustomerInfo[index], 'FieldValue', val)
    },
    /** 动态多选赋值 */
    handlecheckboxChange(e) {
      let index = e.currentTarget.dataset.index
      let val = e.target.value
      this.$set(this.form.ListFieldCustomerInfo[index], 'FieldValue', val.join('/'))
    },
    // 单行文本更改校验去除
    handleTextChange(item, index) {
      // 只能输入文字，输入其他去除
      if (item.fieldInputType === 4) {
        const reg = new RegExp(/[^\u2E80-\uFE4F]/g)
        let val = item.FieldValue.replace(reg, '')
        setTimeout(() => {
          this.$set(this.form.ListFieldCustomerInfo[index], 'FieldValue', val)
        }, 1)
      }
      // 只能输入数字小数点
      if (item.fieldInputType === 5) {
        const reg = new RegExp(/[^\d.]/g)
        let val = item.FieldValue.replace(reg, '')
        setTimeout(() => {
          this.$set(this.form.ListFieldCustomerInfo[index], 'FieldValue', val)
        }, 1)
      }
    },
    // 多项选择框下拉类型
    handleChooseMultiterm(item, index) {
      this.multitermList = item.fieldOptions
      this.selectedVal = item.FieldValue
      this.currentChangeIndex = index
      this.isShowMultitermDialog = true
    },
    // 多项选择框下拉类型值更新
    handleUpdateMultitermSelectList(list) {
      this.form.ListFieldCustomerInfo[this.currentChangeIndex].FieldValue = list.join('/')
    },
    /** 动态单选赋值 */
    handleRadioChangeDiy(e) {
      let index = e.currentTarget.dataset.index
      let val = e.target.value
      this.$set(this.form.ListFieldCustomerInfo[index], 'FieldValue', val)
    },
    handleRadioChange(e) {
      this.sexValue = e.detail.value
      this.form.Sex = e.detail.value === 0 ? 1 : 2
    },
    async handleSubmit() {
      if (this.info.IsCheckName) {
        if (!this.form.name) {
          return this.$msg('请输入姓名！')
        }
      }
      if (this.info.IsCheckPhone) {
        if (!this.form.Mobile) {
          return this.$msg('请输入手机号码！')
        }
        if (!regMobile(this.form.Mobile)) {
          return this.$msg('请输入正确的手机号码！')
        }
        // #ifdef H5
        if (this.info.IsCheckMessage) {
          // 只有验证手机时，绕过验证码验证
          if (!this.form.Code && !this.showNewGetPhone) {
            return this.$msg('请输入验证码！')
          }
        }
        // #endif
      }
      if (this.info.IsCollectWXNo) {
        if (!this.form.WeiXin) {
          return this.$msg('请输入微信号！')
        }
        if (this.form.WeiXin < 6 && this.form.WeiXin > 20) {
          return this.$msg('请输入正确的微信号！')
        }
      }
      if (this.info.IsCollectIDCard) {
        if (!this.form.IDCard) {
          return this.$msg('请先输入身份证号！')
        }
        if (
          !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(
            this.form.IDCard
          )
        ) {
          return this.$msg('请输入正确的身份证号！')
        }
      }

      if (this.info.IsCollectSex) {
        this.form.Sex = this.sexValue === 0 ? 1 : this.form.Sex
        this.info.UserInfo.Sex = this.sexValue === 0 ? 1 : this.form.Sex
      }

      if (this.info.IsCollectBirthday) {
        if (!this.form.Birthday) {
          return this.$msg('请选择出生日期！')
        }
      }

      for (let field of this.form.ListFieldCustomerInfo) {
        if (field.fieldType === 1) {
          if (!field.fieldDefaultValue && field.FieldValue.trim() === '') {
            return this.$msg('请输入' + field.fieldName + '！')
          }
        }

        if (field.fieldType === 2 && field.FieldValue === '') {
          return this.$msg('请选择' + field.fieldName + '！')
        }

        if (field.fieldType === 3) {
          field.FieldValue = field.FieldValue || []
          if (field.FieldValue.length === 0) {
            return this.$msg('请勾选' + field.fieldName + '！')
          }
        }

        if (field.fieldType === 4 && field.FieldValue === '') {
          return this.$msg('请输入' + field.fieldName + '！')
        }
      }

      if (!this.agreeRule) {
        return this.$msg('请先阅读并同意协议')
      }

      let newForm = JSON.parse(JSON.stringify(this.form))

      for (let field of newForm.ListFieldCustomerInfo) {
        if (field.fieldType === 1 && field.fieldDefaultValue) {
          // 输入框设置了默认值，若没填写赋默认值提交
          if (field.FieldValue.trim() === '') {
            field.FieldValue = field.fieldDefaultValue
          }
        }
      }
      let query = {
        ...this.info,
        ...newForm
      }
      if (this.mode === 1) {
        query.AwardRecordId = this.infoConfig.prizeid
        query.activityid = this.infoConfig.activityid
        query.activitytitle = this.infoConfig.activitytitle
        query.codeid = this.infoConfig.codeid
      }
      const api = this.mode === 1 ? apiSetAwardUserInfo : apiSetUserInfo

      /* #ifdef H5 */
      query.m = getQuery('m')
      query.OpenId = this.openId
      query.WXNo = this.form.WeiXin
      query.UserName = this.form.name
      api(query)
        .then(res => {
          this.$emit('update:isShow', false)
          if (this.mode === 1) {
            this.$emit('collect')
          } else {
            this.$emit('success')
          }
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      this.$loading.show()
      let res = await api(query)
      this.$loading.hide()
      if (this.$ck(res, true)) {
        this.$emit('update:isShow', false)
        if (this.mode === 1) {
          this.$emit('collect')
        } else {
          this.$emit('success')
        }
      }
      /* #endif */
    },
    /* #ifdef MP-WEIXIN */
    // 点击一键获取手机号
    async handleGetPhonenumber(e, submit) {
      this.autoFocus = false
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) {
        try {
          let result = await getMobileNumber({ mobilecode: code })
          if (result) {
            this.form.Mobile = result.phonenumber || ''
            this.disabled = true
            // 是否自动提交
            if (submit) {
              this.onPhoneConfirm()
            }
          }
        } catch (error) {
          this.$log.error({
            type: 'auth',
            desc: '手机号授权',
            data: JSON.stringify(error)
          })
        }
      }
    },
    onPhoneConfirm() {
      // 绕过协议
      this.agreeRule = true
      this.handleSubmit()
    },
    /* #endif */
    // 跳转规则页面
    handleLinkRule(applyNo, type) {
      // #ifdef MP-WEIXIN
      uni.navigateTo({
        url: `/packages/src/rule/webview?pageType=${type}&applyNo=` + applyNo
      })
      // #endif
      // #ifdef H5
      const l = location
      const h = l.host.includes('weixin12315.com') ? 'weixin12315.com' : 't.miduonet.com'
      const m = getQuery('m')
      let q = `?applyno=${applyNo}`
      type === 'business' && (q += `&m=${m}`)
      location.href = `${l.protocol}//mini.${h}/rule/pages/detail${q}`
      // #endif
    }
  }
}
</script>
<style lang="scss" scoped>
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.collect-dialog-container {
  position: fixed;
  z-index: 100;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  .mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;

    width: 650rpx;
    min-height: 416rpx;

    border-radius: 15rpx;
    background-color: #fff;
    .new-phone-popup {
      width: 100%;
      .iconshouji {
        width: 150rpx;
        height: 150rpx;

        border-radius: 50%;
        background: linear-gradient(0deg, #f0f0f0 0%, #ffffff 100%);

        font-size: 80rpx;
      }
      .title {
        color: #222222;

        font-size: 32rpx;
        font-weight: bold;
      }
      .tips {
        color: #666666;

        font-size: 28rpx;
        font-weight: 500;
      }
      .telenumber {
        width: 450rpx;
        height: 80rpx;
        margin: 60rpx 0 70rpx 0;

        color: #fff;
        border: none;
        border-radius: 40rpx;
        background: #1abf1a;
      }
      .custom-input {
        width: 400rpx;
        padding: 10rpx 0;

        border-bottom: 1rpx solid #ccc;
      }
    }
    .padding-30 {
      padding: 0 30rpx;
    }
    .title {
      position: relative;
      z-index: 200;

      display: flex;
      align-items: center;
      justify-content: center;

      width: 459rpx;
      height: 70rpx;
      padding-bottom: 8rpx;

      transform: translateY(-8rpx);

      color: #fff;
      background-repeat: no-repeat;
      background-size: 100%;

      font-size: 32rpx;
      font-weight: bold;
    }

    .collect-body {
      position: relative;
      z-index: 300;

      overflow: hidden auto;

      box-sizing: border-box;
      width: 100%;
      max-height: 786rpx;

      .collect-group {
        display: flex;
        align-items: center;

        margin-bottom: 30rpx;

        &.field-input-type2 {
          align-items: start;
          flex-wrap: wrap;

          margin: 40rpx 0;

          .collect-control {
            background-color: #fff;
          }
          .field-type2-tips {
            flex: 1;
            /* #ifdef H5 */

            margin-top: 4rpx;

            color: #aaa;
            /* #endif */
          }
          .field-type2 {
            width: 100%;
          }
          .field-type2-group {
            display: flex;
            flex-wrap: wrap;
          }
          .field-type2-label {
            box-sizing: border-box;
            min-width: 33%;
            margin-top: 30rpx;
            padding-right: 10rpx;
          }
          .check-icon {
            transform: scale(0.7);
          }
        }

        &.field-input-type3,
        &.field-input-type4,
        &.field-input-type5 {
          .collect-control {
            display: flex;
            .collect-input {
              flex: 1;
            }
            .unit {
              margin-right: 30rpx;
            }
          }
        }

        &:last-child {
          margin-bottom: 0;
        }
        &:first-child {
          margin-top: 43rpx;
        }
        .code-button {
          position: absolute;
          z-index: 1000;
          top: 0;
          right: 20rpx;

          width: 140rpx;
          height: 80rpx;

          text-align: right;

          color: #2d86ff;

          font-size: 24rpx;
          font-weight: 500;
          line-height: 80rpx;
        }
        .collect-label {
          flex-shrink: 0;

          min-width: 110rpx;
          margin-right: 10rpx;

          color: #333;

          font-size: 28rpx;
          font-weight: bold;
        }

        .collect-control {
          position: relative;

          display: flex;
          align-items: center;
          flex: 1;
          flex-wrap: wrap;

          width: 440rpx;
          min-height: 80rpx;
          padding-left: 30rpx;

          border-radius: 40rpx;
          background: #f6f6f6;
          .down-arrow {
            position: absolute;
            top: 30rpx;
            right: 30rpx;

            width: 30rpx;
          }
          .iconjiantou1 {
            color: #666;
            transform: rotate(90deg);
          }
          .collect-input {
            width: 100%;

            font-size: 28rpx;

            &.mobile-input {
              width: 220rpx;
            }
          }
          .select-picker {
            position: relative;
            z-index: 1;

            width: 100%;
            height: 100%;

            line-height: 80rpx;
          }
          .radio-group {
            display: flex;
            flex-wrap: wrap;
            .radio-label {
              width: 200rpx;
              margin: 10rpx 0;

              word-break: break-all;
            }
          }
          .check-icon {
            transform: scale(0.7);
          }
        }
        .telenumber {
          position: absolute;
          z-index: 1000;
          top: 20rpx;
          right: 0rpx;

          width: 160rpx;
          height: 40rpx;
          padding-left: 30rpx;

          text-align: center;

          color: rgba(68, 187, 68, 1);
          border: 0;
          background-repeat: no-repeat;
          background-position: left center;
          background-size: 30rpx;

          font-size: 24rpx;
          line-height: 40rpx;
        }
      }

      .picker {
        position: relative;
        z-index: 1;

        width: 100%;
        height: 100%;

        .picker-value {
          display: flex;
          align-items: center;

          width: 416rpx;
          height: 88rpx;
        }
      }
    }

    .collect-footer {
      z-index: 999;

      display: flex;
      align-items: center;
      flex-direction: column;

      width: 100%;
      padding: 28rpx 0;
      .collect-remark {
        width: 100%;
        margin-bottom: 20rpx;

        color: #fb4c0e;

        font-size: 22rpx;
      }

      .collect-submit {
        width: 400rpx;
        height: 80rpx;

        color: #fff;
        border-radius: 40rpx;
        background-image: linear-gradient(180deg, #ff744f 0%, #fb4a0c 100%);

        font-size: 32rpx;
        font-weight: 700;
      }
    }
  }

  .close-btn {
    position: absolute;
    bottom: -80rpx;
    left: 50%;

    transform: translate(-50%, 50%);

    color: #fff;

    font-size: 72rpx;
  }

  .rule-box {
    display: flex;
    align-items: center;

    width: 100%;
    margin-top: 32rpx;
    padding-left: 20rpx;

    text-align: center;

    font-size: 22rpx;
    .rule-text {
      margin-left: 6rpx;
      .rule-link {
        color: #4a93fe;
      }
    }
  }
}

@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
