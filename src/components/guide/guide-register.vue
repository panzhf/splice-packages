<template>
  <view :style="themeVars">
    <template v-if="isLoaded">
      <view v-if="formType === 0" class="form-box">
        <view class="form-title">导购员信息</view>
        <view class="information bg-f">
          <info-cell is-middle is-input is-needed>
            <view slot="left">姓名</view>
            <view slot="right">
              <input
                slot="right"
                v-model.trim="form.realname"
                type="text"
                class="input"
                :maxlength="16"
                placeholder-class="placeholder"
                placeholder="请输入姓名"
              />
            </view>
          </info-cell>
          <info-cell is-middle is-needed is-input>
            <view slot="left">
              手机号
              <u-loading v-if="mobile.loading" mode="circle" class="mr-20" />
            </view>
            <input
              slot="right"
              v-model.trim="form.mobile"
              type="number"
              placeholder-class="placeholder"
              placeholder="默认为登录账号"
              :maxlength="11"
              class="input"
              :disabled="mobile.loading"
              @blur="validateMobile"
            />
          </info-cell>
          <view class="tx-r fs-20 primary-color mr-30 mt-10">
            {{ manual.mobileTips }}
          </view>
        </view>
      </view>
      <view v-if="showBaseInfo" class="form-box">
        <view class="information bg-f">
          <view v-if="showBaseTitle" class="form-title">基本信息</view>
          <template v-if="formType === 1">
            <info-cell is-middle is-input is-needed>
              <view slot="left">姓名</view>
              <view slot="right">
                <input
                  slot="right"
                  v-model.trim="form.realname"
                  type="text"
                  class="input"
                  :maxlength="16"
                  placeholder-class="placeholder"
                  placeholder="请输入姓名"
                />
              </view>
            </info-cell>
            <!-- 未激活可以修改，其它不能修改 -->
            <info-cell v-if="guideInfo.salerstate === 0" is-middle is-needed is-input>
              <view slot="left">手机号</view>
              <input
                slot="right"
                v-model.trim="form.mobile"
                type="number"
                placeholder-class="placeholder"
                placeholder="请输入手机号"
                :maxlength="11"
                class="input"
              />
            </info-cell>
            <info-cell v-else is-middle is-needed @tap="$msg('手机号不可修改！')">
              <view slot="left">手机号</view>
              <view slot="right" class="flex">
                {{ form.mobile }}
              </view>
            </info-cell>
          </template>
          <info-cell v-if="config.isshowbywechat" :is-needed="config.isrequiredbywechat" is-middle is-input>
            <view slot="left">微信号</view>
            <view slot="right">
              <input
                v-model.trim="form.wxno"
                type="text"
                class="input"
                maxlength="20"
                placeholder-class="placeholder"
                placeholder="请输入微信号"
              />
            </view>
          </info-cell>
          <info-cell
            v-if="config.isshowbyextensionagency"
            :is-needed="config.isrequiredbyextensionagency"
            is-middle
            is-input
          >
            <view slot="left">推广机构</view>
            <view slot="right">
              <input
                v-model.trim="form.extensionagency"
                type="text"
                class="input"
                maxlength="30"
                placeholder-class="placeholder"
                placeholder="请输入推广机构"
              />
            </view>
          </info-cell>
          <info-cell v-if="config.isshowbyjobno" :is-needed="config.isrequiredbyjobno" is-middle is-input>
            <view slot="left">工号</view>
            <view slot="right">
              <input
                v-model.trim="form.jobno"
                type="text"
                class="input"
                maxlength="30"
                placeholder-class="placeholder"
                placeholder="请输入工号"
              />
            </view>
          </info-cell>
          <template v-if="config.isshowbyaddress">
            <info-cell :is-needed="config.isrequiredbyaddress" is-link @tap="showAddRessPicker = true">
              <view slot="left">所在地区</view>
              <view slot="right" class="tx-l">
                {{ cityName || '请选择' }}
              </view>
            </info-cell>
            <info-cell :is-needed="config.isrequiredbyaddress" is-middle is-input>
              <view slot="left">详细地址</view>
              <view slot="right">
                <input
                  v-model.trim="form.address"
                  type="text"
                  class="input"
                  maxlength="50"
                  placeholder-class="placeholder"
                  placeholder="请输入详细地址"
                />
              </view>
            </info-cell>
          </template>
          <info-cell v-if="config.isshowbyuploadimg" :is-needed="config.isrequiredbyuploadimg" is-input is-middle>
            <view slot="left">上传图片</view>
            <view slot="right">
              <view class="cell-inner">
                <upload v-model="form.salerimg" :max-length="3" />
              </view>
            </view>
          </info-cell>
          <info-cell v-if="config.isshowbyremark" :is-needed="config.isrequiredbyremark" is-middle is-input>
            <view slot="left">备注</view>
            <view slot="right">
              <input
                v-model.trim="form.remark"
                type="text"
                class="input"
                maxlength="25"
                placeholder-class="placeholder"
                placeholder="备注内容最多25个字"
              />
            </view>
          </info-cell>
          <info-cell
            v-if="formType === 1"
            is-middle
            is-input
            @tap="![1, 2].includes(guideInfo.salerstate) ? $msg('账号状态不可修改！') : null"
          >
            <view slot="left">账号状态</view>
            <view slot="right" class="cell-inner flex">
              <switch
                v-if="[1, 2].includes(guideInfo.salerstate)"
                class="switch"
                type="switch"
                :checked="guideState"
                @change="handleSwitchChange()"
              />
              <text v-else>{{ guideInfo.salerstate | guideStatusFilter }}</text>
            </view>
          </info-cell>
        </view>
      </view>
      <view style="height: 240rpx" />
      <view class="btn-group">
        <button class="primary-btn round" hover-class="button-action" :disabled="loading" @tap="handleSubmit">
          {{ btnText }}
        </button>
      </view>
    </template>
    <address-picker
      v-model="showAddRessPicker"
      :default-regon="defaultRegon"
      :column-count="3"
      @setAddress="getAddress"
    />
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      max-size
      @close="onClose"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetConfig, apiCheckMobile } from 'packages/api/guide'
import { simplePopupMixin } from 'packages/mixins/common-popup'
import privacyMixin from 'packages/mixins/privacy'
import InfoCell from 'packages/components/info-cell/info-cell'
import upload from 'packages/components/upload/upload'
import AddressPicker from 'packages/components/address-picker/address-picker.vue'
import { regMobile } from 'packages/utils/reg'
import { guideStatusFilter } from 'packages/filters'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  name: 'RegisterStore',
  components: {
    InfoCell,
    upload,
    AddressPicker
  },
  filters: { guideStatusFilter },
  mixins: [
    simplePopupMixin,
    privacyMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    btnText: {
      type: String,
      default: '保存'
    },
    m: {
      type: String,
      default: ''
    },
    formType: {
      type: Number,
      default: -1 //0添加 1修改
    },
    guideInfo: {
      type: Object,
      default: () => {}
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cityName: '请选择地区',
      showAddRessPicker: false,
      isLoaded: false,
      guideState: false, // 导购状态 false 禁用
      form: {
        realname: '',
        mobile: '',
        wxno: '', //微信号
        province: 0, //省份ID
        city: 0, //城市ID
        area: 0, //地区ID
        address: '', //详细地址
        remark: '', //备注
        salerimg: [], //导购员图片地址，多图片以’,’分隔
        extensionagency: '', //推广机构
        jobno: '' //工号
      },
      config: {
        isshowbywechat: true,
        isrequiredbywechat: true,
        isshowbyextensionagency: true,
        isrequiredbyextensionagency: true,
        isshowbyjobno: true, //工号jobno
        isrequiredbyjobno: true, //工号jobno
        isshowbyaddress: true, //地址address
        isrequiredbyaddress: true, //地址address
        isshowbystore: true, //所属门店store
        isrequiredbystore: true, //所属门店store
        isshowbyuploadimg: true, //上传图片uploadimg
        isrequiredbyuploadimg: true, //上传图片uploadimg
        isshowbyremark: true, //备注remark
        isrequiredbyremark: false, //备注remark
        isshowbyprompt: false,
        prompttext: ''
      },
      manual: {
        mobileTips: '',
        checkLoading: false
      }
    }
  },
  computed: {
    defaultRegon() {
      const { province, city, area } = this.form
      return [province, city, area]
    },
    showBaseTitle() {
      const {
        isshowbywechat,
        isshowbyextensionagency,
        isshowbyjobno,
        isshowbyaddress,
        isshowbyuploadimg,
        isshowbyremark
      } = this.config
      return (
        this.formType === 0 &&
        (isshowbywechat ||
          isshowbyextensionagency ||
          isshowbyjobno ||
          isshowbyaddress ||
          isshowbyaddress ||
          isshowbyuploadimg ||
          isshowbyremark)
      )
    },
    showBaseInfo() {
      return this.showBaseTitle || this.formType !== 0
    }
  },
  mounted() {
    setTimeout(() => {
      this.init()
    }, 50)
  },
  methods: {
    handleSwitchChange() {
      this.guideState = !this.guideState
      if (!this.guideState) {
        this.showTips({ content: '禁用后，该导购员无法进行导购码扫描' })
      }
      this.$emit('changeState', this.guideState)
    },
    validateMobile() {
      // 添加手机校验 (修改导购不需要)
      this.manual.mobileTips = ''
      if (this.form.mobile === '') {
        return (this.manual.mobileTips = '手机号码不能为空')
      } else if (!regMobile(this.form.mobile)) {
        return (this.manual.mobileTips = '请输入正确的手机号')
      }
      // 请求接口判断手机号是否可以使用
      this.manual.checkLoading = true
      apiCheckMobile({
        m: this.m,
        mobile: this.form.mobile
      })
        .then(res => {
          this.manual.checkLoading = false
          if (!this.$ck(res)) {
            this.manual.mobileTips = res.return_msg
          }
        })
        .catch(() => {
          // 接口异常重置
          this.manual.checkLoading = false
        })
    },
    validateForm() {
      //校验
      if (!this.form.realname) {
        this.$msg(`请输入姓名`)
        return false
      }
      if (this.form.realname && !/^[a-zA-Z\u4e00-\u9fa5]+$/.test(this.form.realname)) {
        this.$msg(`姓名只能输入中英文`)
        return false
      }
      if (this.form.mobile === '') {
        this.$msg('手机号码不能为空')
        return false
      }
      if (!regMobile(this.form.mobile)) {
        this.$msg('请输入正确的手机号')
        return false
      }

      if (this.config.isshowbywechat) {
        if (this.config.isrequiredbywechat && !this.form.wxno.trim()) {
          this.$msg('请输入微信号')
          return false
        }
        if (/[\u4e00-\u9fa5]/.test(this.form.wxno)) {
          this.$msg('请输入正确的微信号')
          return false
        }
      }
      if (
        this.config.isshowbyextensionagency &&
        this.config.isrequiredbyextensionagency &&
        !this.form.extensionagency.trim()
      ) {
        this.$msg('请输入推广机构')
        return false
      }
      if (this.config.isshowbyjobno && this.config.isrequiredbyjobno && !this.form.jobno.trim()) {
        this.$msg('请输入工号')
        return false
      }
      if (this.config.isshowbyaddress && this.config.isrequiredbyaddress) {
        if (!this.form.province || !this.form.city) {
          this.$msg(`请选择所在地区`)
          return false
        }
        if (!this.form.address.trim()) {
          this.$msg(`请填写详细地址`)
          return false
        }
      }
      if (this.config.isshowbyuploadimg && this.config.isrequiredbyuploadimg && this.form.salerimg.length === 0) {
        this.$msg('请上传图片')
        return false
      }
      if (this.config.isshowbyremark && this.config.isrequiredbyremark && !this.form.remark.trim()) {
        this.$msg('请输入备注')
        return false
      }
      return true
    },
    async handleSubmit() {
      if (!this.validateForm()) return
      this.$emit('submit', this.form)
    },
    async init() {
      uni.showLoading({
        title: '加载中',
        mask: true
      })
      try {
        // 获取注册信息
        await this.getConfig()
        this.formType === 1 && (await this.initFormData())
        this.isLoaded = true
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        const errTips = e?.return_msg || JSON.stringify(e)
        this.showTips({ content: errTips || '服务器开小差，请重试！' })
        this.$uploadLog({
          type: 'register',
          desc: '添加/修改导购员',
          data: e,
          extend: { mobile: this.form.mobile || '' }
        })
      }
    },
    getConfig() {
      return new Promise((resolve, reject) => {
        apiGetConfig({ salergroupid: 0, memberlogin: this.m }, false)
          .then(res => {
            if (this.$ck(res)) {
              this.config = res.return_data
              resolve()
            } else {
              reject(res)
            }
          })
          .catch(e => {
            reject(e)
          })
      })
    },
    initFormData() {
      return new Promise(resolve => {
        const {
          provincename,
          cityname,
          areaname,
          wxno,
          province,
          city,
          area,
          address,
          remark,
          salerimg,
          isreviewstoreid,
          extensionagency,
          jobno,
          mobile,
          realname,
          salerstate
        } = this.guideInfo
        this.form = {
          provincename,
          cityname,
          areaname,
          wxno,
          province,
          city,
          area,
          address,
          remark,
          salerimg,
          isreviewstoreid,
          extensionagency,
          jobno,
          mobile,
          realname
        }
        this.cityName = `${provincename || ''}${cityname || ''}${areaname || ''}`.trim()
        // 正常 激活后禁用 才能修改状态
        this.guideState = salerstate === 1
        resolve()
      })
    },
    getAddress(e) {
      this.form.province = e[0].value
      this.form.city = e[1].value
      this.form.area = e[2].value
      this.cityName = `${e[0].label}${e[1].label}${e[2].label}`
    }
  }
}
</script>

<style lang="scss" scoped>
.form-box {
  margin: 20rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #fff;
  .form-title {
    position: relative;
    margin: 15rpx 20rpx;
    color: #000;
    font-size: 30rpx;
    font-weight: 700;
    /* #ifdef MP-RETAIL  */
    &::after {
      position: absolute;
      bottom: 2rpx;
      left: 0;
      width: 60rpx;
      height: 8rpx;
      content: '';
      opacity: 0.5;
      border-radius: 4rpx;
      // background: #ff7640;
      background: var(--theme-color, $uni-color-primary);
    }
    // #endif
  }
  .input {
    height: 108rpx;
    text-align: left;
    color: #000;
    line-height: 108rpx;
    &.input-disbaled {
      color: #ccc;
    }
  }
  .cell-inner {
    padding: 40rpx 40rpx 40rpx 0;
  }
}
.btn-group {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 30rpx;
  z-index: 200;
}
</style>
