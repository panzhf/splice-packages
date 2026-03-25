<template>
  <view>
    <template v-if="isLoaded">
      <view class="form-box">
        <view class="form-title">负责人信息</view>
        <template v-if="customYzm">
          <info-cell is-middle is-needed is-input>
            <view slot="left">手机号</view>
            <input
              slot="right"
              v-model.trim="form.mobile"
              type="number"
              placeholder-class="placeholder"
              placeholder="请输入手机号"
              :maxlength="11"
              :focus="autoFocus"
              class="input"
            />
          </info-cell>
          <info-cell is-middle is-needed is-input>
            <view slot="left" class="text-left">验证码</view>
            <view slot="right" class="flex flex-middle">
              <input
                v-model.trim="yzm"
                type="number"
                placeholder="请输入验证码"
                placeholder-class="placeholder"
                :maxlength="6"
                class="flex-1 input"
                @focus="toggleBlur(0)"
                @blur="toggleBlur(1)"
              />
              <VerifyCode :mobile="form.mobile" />
            </view>
          </info-cell>
          <CodeTip :value="yzm" :is-blur="isCodeBlur" custom-style="padding-left: 202rpx" />
        </template>
        <info-cell
          v-if="!customYzm"
          :is-middle="true"
          :is-two-line="false"
          :is-needed="true"
          :cell-style="cellStyle"
          @tap="showDisabledTips('手机号', skipMobile)"
        >
          <view slot="left">手机号</view>
          <view slot="right" class="flex flex-middle">
            <view class="tx-l flex-1">{{ form.mobile }}</view>
            <get-mobile v-if="!skipMobile" v-model="form.mobile" :memberlogin="m" />
          </view>
        </info-cell>
        <VerifyCodeChange v-if="!skipMobile && !customYzm" v-model="byYzm" custom-class="pt-10 pb-20" />
        <info-cell
          v-if="rules.Name.show"
          is-middle
          is-input
          :is-needed="rules.Name.required"
          @tap="showDisabledTips(leaderTitle, leaderDisabled)"
        >
          <view slot="left">{{ leaderTitle }}</view>
          <input
            slot="right"
            v-model.trim="form.leader"
            type="text"
            class="input"
            :maxlength="16"
            placeholder-class="placeholder"
            :placeholder="leaderPlaceholder"
            :disabled="leaderDisabled"
          />
        </info-cell>
      </view>
      <view class="form-box">
        <view class="form-title">基本信息</view>
        <info-cell
          v-if="rules.ShopNo.show"
          :is-middle="true"
          :is-needed="rules.ShopNo.required"
          :cell-style="cellStyle"
          @tap="showDisabledTips('门店编号', true)"
        >
          <view slot="left">门店编号</view>
          <view slot="right" class="flex">
            <view class="tx-l flex-1">{{ form.storeno }}</view>
          </view>
        </info-cell>

        <info-cell
          v-if="rules.ShopName.show"
          is-middle
          is-input
          :is-needed="rules.ShopName.required"
          @tap="showDisabledTips('门店名称', storeNameDisabled)"
        >
          <view slot="left">门店名称</view>
          <input
            slot="right"
            v-model.trim="form.storename"
            type="text"
            class="input"
            :maxlength="30"
            placeholder-class="placeholder"
            placeholder="最多30个字"
            :disabled="storeNameDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.PartShopName.show"
          is-middle
          is-input
          :is-needed="rules.PartShopName.required"
          @tap="showDisabledTips('分店名', branchnameDisabled)"
        >
          <view slot="left">分店名</view>
          <input
            slot="right"
            v-model.trim="form.branchname"
            type="text"
            class="input"
            :maxlength="10"
            placeholder-class="placeholder"
            placeholder="最多10个字"
            :disabled="branchnameDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.ShopAddress.show"
          is-middle
          :is-needed="rules.ShopAddress.required"
          @tap="handleEditAdress"
        >
          <view slot="left">门店地址</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ fullAddress || '选择省市区' }}
            </view>
            <view class="icon iconfont icon-arrow-right fs-20" />
          </view>
        </info-cell>
        <view v-if="rules.ShopFor.show">
          <info-cell is-middle :is-show-line="false" :is-needed="rules.ShopFor.required">
            <view slot="left">
              门头照
              <text class="fs-22 c-9 ml-10">(需要看到完整的门店名称和招牌)</text>
            </view>
          </info-cell>
          <info-cell is-middle :is-two-line="false" is-input :is-show-left="false">
            <view slot="right" class="pb-20">
              <upload v-model="shopFor" :modify="!shopforDisabled" @tap="showDisabledTips('门头照', shopforDisabled)" />
            </view>
          </info-cell>
        </view>
        <view v-if="rules.BusinessLicense.show">
          <info-cell is-middle :is-show-line="false" :is-needed="rules.BusinessLicense.required">
            <view slot="left">
              营业执照
              <text class="fs-22 c-9 ml-10">(彩色照片，并在有效期内)</text>
            </view>
          </info-cell>
          <info-cell is-middle :is-two-line="false" is-input :is-show-left="false">
            <view slot="right" class="pb-20">
              <upload
                v-model="license"
                :modify="!licenseDisabled"
                @tap="showDisabledTips('营业执照', licenseDisabled)"
              />
            </view>
          </info-cell>
        </view>
        <info-cell
          v-if="rules.TheirDealer.show"
          is-middle
          :is-needed="rules.TheirDealer.required"
          @tap="canModifyDealer ? (showDealer = true) : showDisabledTips('所属上级', true)"
        >
          <!-- 所属上级不能修改 -->
          <view slot="left">所属上级</view>
          <view slot="right" class="flex">
            <view class="flex-1 tx-l">
              {{ dealerInfo.dealername }}
            </view>
            <view v-if="canModifyDealer" class="icon iconfont icon-arrow-right fs-20" />
          </view>
        </info-cell>
        <info-cell
          v-if="rules.Remark.show"
          is-middle
          is-input
          :is-needed="rules.Remark.required"
          @tap="showDisabledTips('备注', remarkDisabled)"
        >
          <view slot="left">备注</view>
          <input
            slot="right"
            v-model.trim="form.remark"
            class="input"
            :maxlength="50"
            placeholder-class="placeholder"
            :placeholder="remarkPlaceholder"
            :disabled="remarkDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.StoreType.show"
          is-middle
          :is-needed="rules.StoreType.required"
          @tap="!shopTypeDisabled ? (showStore = true) : showDisabledTips('门店类型', true)"
        >
          <view slot="left">门店类型</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ storeInfo.name || '选择门店类型' }}
            </view>
            <view class="icon iconfont icon-arrow-right fs-20" />
          </view>
        </info-cell>
        <info-cell
          v-if="rules.ShopSize.show"
          is-middle
          :is-needed="rules.ShopSize.required"
          @tap="!shopsizeDisabled ? (showShopSize = true) : showDisabledTips('店铺面积', true)"
        >
          <view slot="left">店铺面积</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ shopSize.name || '选择店铺面积' }}
            </view>
            <view class="icon iconfont icon-arrow-right fs-20" />
          </view>
        </info-cell>

        <info-cell
          v-if="rules.WeChat.show"
          is-middle
          is-input
          :is-needed="rules.WeChat.required"
          @tap="showDisabledTips('微信号', wxnoDisabled)"
        >
          <view slot="left">微信号</view>
          <input
            slot="right"
            v-model.trim="form.wxno"
            class="input"
            :maxlength="20"
            placeholder-class="placeholder"
            placeholder="最多20个字"
            :disabled="wxnoDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.QQ.show"
          is-middle
          is-input
          :is-needed="rules.QQ.required"
          @tap="showDisabledTips('QQ号', qqnoDisabled)"
        >
          <view slot="left">QQ号</view>
          <input
            slot="right"
            v-model.trim="form.qqno"
            class="input"
            :maxlength="15"
            type="number"
            placeholder-class="placeholder"
            placeholder="最多15个字"
            :disabled="qqnoDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.Email.show"
          is-middle
          is-input
          :is-needed="rules.Email.required"
          @tap="showDisabledTips('邮箱', emailDisabled)"
        >
          <view slot="left">邮箱</view>
          <input
            slot="right"
            v-model.trim="form.email"
            class="input"
            :maxlength="50"
            placeholder-class="placeholder"
            placeholder="最多50个字"
            :disabled="emailDisabled"
          />
        </info-cell>
      </view>
      <view v-if="showServiceBlock" class="form-box">
        <view class="form-title">服务信息</view>
        <view v-if="rules.ShopPic.show">
          <info-cell is-middle :is-show-line="false" :is-needed="rules.ShopPic.required">
            <view slot="left">
              门店图片
              <text class="fs-22 c-9 ml-10">(最多9张)</text>
            </view>
          </info-cell>
          <info-cell is-middle :is-two-line="false" is-input :is-show-left="false">
            <view slot="right" class="pb-20">
              <upload
                v-model="shopPic"
                :max-length="9"
                :modify="!shoppicDisabled"
                @tap="showDisabledTips('门店图片', shoppicDisabled)"
              />
            </view>
          </info-cell>
        </view>
        <info-cell
          v-if="rules.ShopPhone.show"
          is-middle
          is-input
          :is-needed="rules.ShopPhone.required"
          @tap="showDisabledTips('门店电话', phonenoDisabled)"
        >
          <view slot="left">门店电话</view>
          <input
            slot="right"
            v-model.trim="form.phoneno"
            class="input"
            :maxlength="20"
            placeholder-class="placeholder"
            placeholder="最多20个字"
            :disabled="phonenoDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.PerPrice.show"
          is-middle
          is-input
          :is-needed="rules.PerPrice.required"
          @tap="showDisabledTips('人均价格', percapitaDisabled)"
        >
          <view slot="left">人均价格</view>
          <input
            slot="right"
            v-model.trim="form.percapita"
            class="input"
            :maxlength="10"
            placeholder-class="placeholder"
            placeholder="单位（元），例如88.88"
            :disabled="percapitaDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.BusinessHours.show"
          is-middle
          is-input
          :is-needed="rules.BusinessHours.required"
          @tap="showDisabledTips('营业时间', businessDisabled)"
        >
          <view slot="left">营业时间</view>
          <input
            slot="right"
            v-model.trim="form.businesshours"
            class="input"
            :maxlength="20"
            placeholder-class="placeholder"
            placeholder="10:00~21:00"
            :disabled="businessDisabled"
          />
        </info-cell>
        <info-cell
          v-if="rules.Recommend.show"
          is-input
          cell-style="padding-top: 30rpx"
          :is-needed="rules.Recommend.required"
          @tap="showDisabledTips('推荐', recommendDisabled)"
        >
          <view slot="left">推荐</view>
          <md-textarea
            slot="right"
            v-model="form.recommend"
            :disabled="recommendDisabled"
            placeholder="如：推荐菜、商品、房间"
            :max-length="200"
            @blur="form.recommend = $event.detail.value"
          />
        </info-cell>
        <info-cell
          v-if="rules.SellingPoint.show"
          is-input
          cell-style="padding-top: 30rpx"
          :is-needed="rules.SellingPoint.required"
          @tap="showDisabledTips('特色服务', characteristicDisabled)"
        >
          <view slot="left">特色服务</view>
          <md-textarea
            slot="right"
            v-model="form.characteristic"
            :disabled="characteristicDisabled"
            placeholder="如：免费停车、WIFI"
            :max-length="50"
            @blur="form.characteristic = $event.detail.value"
          />
        </info-cell>
        <info-cell
          v-if="rules.BriefIntro.show"
          is-input
          cell-style="padding-top: 30rpx"
          :is-needed="rules.BriefIntro.required"
          @tap="showDisabledTips('简介', introductionDisabled)"
        >
          <view slot="left">简介</view>
          <md-textarea
            slot="right"
            v-model="form.introduction"
            :disabled="introductionDisabled"
            placeholder="对品牌或门店的简单介绍"
            :max-length="300"
            @blur="form.introduction = $event.detail.value"
          />
        </info-cell>
      </view>
      <view style="height: 240rpx" />
      <view class="btn-group">
        <button class="primary-btn round" hover-class="button-action" :disabled="loading" @tap="handleSubmit()">
          {{ btnText }}
        </button>
      </view>
    </template>
    <dealer-picker
      ref="dealerPickerRef"
      v-model="showDealer"
      :memberlogin="m"
      :dealer-id="dealerInfo.id"
      :dxm-dealer-id="dxmDealerId"
      show-origin
      :lanandlat="form.lanandlat"
      @submit="onPickerConfirm($event, 'd')"
    />
    <store-picker
      v-model="showStore"
      :memberlogin="m"
      :store-id="storeInfo.id"
      @submit="onPickerConfirm($event, 's')"
    />
    <area-picker
      v-model="showShopSize"
      :size-id="shopSize.id"
      :memberlogin="m"
      @submit="onPickerConfirm($event, 'a')"
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
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" max-size @close="onVerifyFail" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
// 部分模块与组件目前只适合万能零售端使用，若其他端要用到该注册组件，需要调整
import { apiGetRegisterInfo, apiValidateCode } from '@/api/common'
import { apiGetStoreDetail } from '@/api/activation'
import VerifyCode from '@/components/verify-code'
import DealerPicker from 'packages/components/people-picker/dealer-picker.vue'
import StorePicker from 'packages/components/people-picker/store-picker.vue'
import AreaPicker from 'packages/components/people-picker/area-picker.vue'
import VerifyCodeChange from 'packages/components/phone-verify/change.vue'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import { simplePopupMixin } from 'packages/mixins/common-popup'
import phoneVerifyMixin, { yzmMixin, codeTipMixin } from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
import { uniLogin as getJsCode } from 'packages/utils/login.js'
import { regMobile, regCode } from 'packages/utils/reg'
export default {
  name: 'RegisterStore',
  components: {
    VerifyCode,
    VerifyCodeChange,
    CodeTip,
    DealerPicker,
    StorePicker,
    AreaPicker
  },
  mixins: [simplePopupMixin, phoneVerifyMixin, yzmMixin, codeTipMixin, privacyMixin],
  props: {
    btnText: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    skipMobile: {
      // true 直接显示 无需获取手机号
      type: Boolean,
      default: false
    },
    canModifyDealer: {
      // 是否允许修改经销商，默认不可以
      type: Boolean,
      default: false
    },
    registerType: {
      type: Number,
      default: 1 // 1激活 2注册
    },
    invieteDealerId: {
      // >0:获取经销商邀请注册的配置信息；等于0:获取店老板自主注册的配置信息
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      m: '', // 品牌编号
      isLoaded: false,
      leaderTitle: '',
      leaderPlaceholder: '',
      dxmDealerId: 0, // 动销码所属上级id
      cellStyle: 'padding-right: 0',
      operaType: 0, // 1 openid授权提示
      form: {
        mobile: '',
        leader: '',
        storeno: '',
        storename: '',
        branchname: '',
        address: '',
        lanandlat: '',
        remark: '',
        storetypeid: 0,
        shopsize: '',
        wxno: '',
        qqno: '',
        email: '',
        phoneno: '',
        percapita: '',
        businesshours: '',
        recommend: '',
        characteristic: '',
        introduction: ''
      },
      remarkPlaceholder: '',
      shopFor: [], // 门头照
      license: [], // 营业执照
      shopPic: [], // 门店照片
      rules: {
        ShopNo: { show: 1, required: 1 },
        ShopName: { show: 1, required: 1 },
        ShopAddress: { show: 1, required: 1 }
      },
      dealerInfo: {
        //所属上级（0：总部）
        id: -1,
        dealername: ''
      },
      showDealer: false, // 所属上级
      storeInfo: {},
      shopSize: {},
      showStore: false, // 门店类型
      showShopSize: false, // 店铺面积
      btnLoading: false,
      validInfo: {},
      selectStore: {}, // 选择门店
      codeTips: '',
      oldData: {},
      addressInfo: {},
      authorizeurl: ''
    }
  },
  computed: {
    introductionDisabled() {
      return this.oldData.introduction && this.rules.BriefIntro?.modify
    },
    characteristicDisabled() {
      return this.oldData.characteristic && this.rules.SellingPoint?.modify
    },
    recommendDisabled() {
      return this.oldData.recommend && this.rules.Recommend?.modify
    },
    businessDisabled() {
      return this.oldData.businesshours && this.rules.BusinessHours?.modify
    },
    percapitaDisabled() {
      return this.oldData.percapita && this.rules.PerPrice?.modify
    },
    phonenoDisabled() {
      return this.oldData.phoneno && this.rules.ShopPhone?.modify
    },
    emailDisabled() {
      return this.oldData.email && this.rules.Email?.modify
    },
    qqnoDisabled() {
      return this.oldData.qqno && this.rules.QQ?.modify
    },
    wxnoDisabled() {
      return this.oldData.wxno && this.rules.WeChat?.modify
    },
    remarkDisabled() {
      return this.oldData.remark && this.rules.Remark?.modify
    },
    branchnameDisabled() {
      return this.oldData.branchname && this.rules.PartShopName?.modify
    },
    storeNameDisabled() {
      return this.oldData.storename && this.rules.ShopName?.modify
    },
    shopforDisabled() {
      return this.oldData.shopfor && this.rules.ShopFor?.modify
    },
    licenseDisabled() {
      return this.oldData.businesslicense && this.rules.BusinessLicense?.modify
    },
    leaderDisabled() {
      return this.oldData.leader && this.rules.Name?.modify
    },
    shopsizeDisabled() {
      return this.oldData['shopsize'] && this.rules['ShopSize']?.modify
    },
    shopTypeDisabled() {
      return this.oldData['storetypeid'] && this.rules['StoreType']?.modify
    },
    shoppicDisabled() {
      return this.oldData.storeimg && this.rules.ShopPic?.modify
    },
    customYzm() {
      // 验证码模式
      return !this.skipMobile && this.isYzmMode
    },
    isValidMobile() {
      return regMobile(this.form.mobile) && (this.customYzm ? regCode(this.yzm) : true)
    },
    isValid() {
      return !!this.form.mobile && (this.isYzmMode ? regCode(this.yzm) : true)
    },
    showServiceBlock() {
      const k = ['ShopPic', 'ShopPhone', 'PerPrice', 'BusinessHours', 'Recommend', 'SellingPoint', 'BriefIntro']
      return k.some(item => !!this.rules[item]?.show)
    },
    fullAddress() {
      const { province, city, area, street, address, houseNumber } = this.addressInfo
      return (
        (province || '') +
        (city || '') +
        (area || '') +
        (area === street ? '' : street || '') +
        (address || '') +
        (houseNumber || '')
      )
    },
    storeRegisterAddress() {
      return this.$store.state.storeRegisterAddress
    },
    openId() {
      return this.$store.state.storeRegisterAuthResult?.openid || ''
    }
  },
  watch: {
    openId(v) {
      if (this.operaType === 1 && v) {
        this.$msg('授权成功！')
        this.operaType = 0
      }
    },
    storeRegisterAddress(v) {
      if (v) {
        // console.log('新地址:', v)
        this.addressInfo = v
        this.form.address = this.addressInfo.address + (this.addressInfo.houseNumber || '')
        this.form.lanandlat = this.addressInfo.lanandlat
      }
    },
    isLoaded(v) {
      if (v) {
        // console.log(v)
        this.getOpenid()
      }
    }
  },
  mounted() {
    uni.$on('phone-verify', () => {
      if (!this.skipMobile) {
        this.verifyState = true
        this.autoFocus = true
      }
    })
  },
  beforeDestroy() {
    uni.$off('phone-verify')
  },
  methods: {
    async initSetting(data) {
      if (!(data && data.m)) return this.$msg('参数错误！')
      const { m, dealerid, dealername, mobile, storeno } = data
      this.m = m
      this.form.dealerid = dealerid || 0
      if (this.registerType === 1) {
        // 激活带入的信息
        this.dealerInfo = {
          id: dealerid,
          dealername: dealername || ''
        }
        // 只有通过手机激活才能显示手机号，否则都不显示手机号 需要用户自己获取.通过登录激活 手机号不可修改
        this.form.mobile = mobile
        // 门店编号不可修改
        this.form.storeno = storeno
      }
      let p = {
        js_code: await getJsCode(),
        m: this.m,
        d: this.invieteDealerId
      }
      uni.showLoading({
        title: '加载中',
        mask: true
      })
      const res = await apiGetRegisterInfo(p, false)
      if (this.$ck(res)) {
        const { basicsettings, authorizeurl } = res.return_data
        const { basic, leader, service, auditshop } = basicsettings
        const e = ['Remark_TipMsg', 'LongiAndLati', 'Phone', 'Phone_SmsVerify', 'DefaPhoneToStoreNo']
        this.rules = [...basic, ...leader, ...(service || [])]
          .filter(i => !e.includes(i.code))
          .reduce((acc, i) => {
            acc[i.code] = {
              show: i.show,
              required: i.required,
              modify: i.modify
            }
            return acc
          }, {})
        // console.log('this.rules', this.rules)
        const ln = leader.find(i => i.code === 'Name')
        this.leaderTitle = ln?.title || '姓名'
        this.leaderPlaceholder = `请输入${this.leaderTitle}`
        const rp = basic.find(i => i.code === 'Remark_TipMsg')
        this.remarkPlaceholder = rp?.title || '最多50个字'
        this.authorizeurl = authorizeurl
        const registerItem = auditshop.filter(i => i.code === 'RegisterData')
        if (this.registerType === 1 && registerItem.length && registerItem[0].required) {
          // 显示后台录入的门店信息
          this.getStoreData()
        } else {
          this.isLoaded = true
          uni.hideLoading()
        }
      } else {
        uni.hideLoading()
      }
    },
    async getStoreData() {
      const res = await apiGetStoreDetail(
        {
          js_code: await getJsCode(),
          memberlogin: this.m,
          storeno: this.form.storeno
        },
        false
      )
      if (this.$ck(res)) {
        const {
          leader,
          storeno,
          storename,
          branchname,
          address,
          remark,
          storetypeid,
          shopsize,
          wxno,
          qqno,
          email,
          phoneno,
          percapita,
          businesshours,
          recommend,
          characteristic,
          introduction,
          provincename,
          streetname,
          cityname,
          areaname,
          lanandlat,
          shopfor,
          businesslicense,
          storeimg,
          storetypename
        } = res.return_data
        const oldData = {
          leader,
          storeno,
          storename,
          branchname,
          address,
          lanandlat,
          remark,
          storetypeid,
          shopsize,
          wxno,
          qqno,
          email,
          phoneno,
          businesshours,
          recommend,
          characteristic,
          introduction
        }
        this.addressInfo = {
          province: provincename,
          city: cityname,
          area: areaname,
          street: streetname,
          address,
          houseNumber: '',
          lanandlat
        }
        percapita && (oldData.percapita = percapita)
        for (let key in oldData) {
          if (oldData[key] === null) {
            oldData[key] = ''
          }
        }
        this.form = { ...this.form, ...oldData }
        // console.log('this.form', this.form)
        shopfor && this.shopFor.push(shopfor)
        storeimg && (this.shopPic = storeimg.split(','))
        businesslicense && this.license.push(businesslicense)
        storetypeid > 0 &&
          (this.storeInfo = {
            id: storetypeid,
            name: storetypename
          })
        shopsize &&
          (this.shopSize = {
            id: 0,
            name: shopsize
          })
        this.oldData = { ...this.form, shopfor, businesslicense, storeimg }
        this.isLoaded = true
      }
      uni.hideLoading()
    },
    handleEditAdress() {
      this.$store.dispatch('updateStoreRegisterInfo', {
        ...this.addressInfo
      })
      uni.navigateTo({
        url: `/shop/address/edit?m=${this.m}`
      })
    },
    showDisabledTips(name, status) {
      status && this.$msg(`${name}不可修改`)
    },
    onPickerConfirm(e, type) {
      if (!e) return
      if (type === 'd') {
        const { id, dealername } = e
        this.dealerInfo = {
          id,
          dealername
        }
        this.form.dealerid = id
      } else if (type === 'a') {
        const { id, name } = e
        this.shopSize = {
          id,
          name
        }
        this.form.shopsize = name
      } else {
        const { id, name } = e
        this.storeInfo = {
          id,
          name
        }
        this.form.storetypeid = id
      }
    },
    validateForm() {
      if (this.rules.ShopNo?.show) {
        if (this.rules.ShopNo?.required && !this.form.storeno) {
          this.$msg('请输入门店编号')
          return false
        }
        if (this.form.storeno && !/^[A-Za-z0-9_-]+$/.test(this.form.storeno)) {
          this.$msg('门店编号仅含英文、数字、英文符号“-” “_”', { duration: 3000 })
          return false
        }
      }
      if (this.rules.ShopName?.required && !this.form.storename) {
        this.$msg('请输入门店名称')
        return false
      }
      if (this.rules.PartShopName?.show && this.rules.PartShopName?.required && !this.form.branchname) {
        this.$msg('请输入分店名')
        return false
      }
      if (this.rules.ShopAddress?.required && !this.form.lanandlat) {
        this.$msg('暂未录入经纬度信息，请重新选择门店地址')
        return false
      }
      if (this.rules.ShopFor?.show && this.rules.ShopFor?.required && this.shopFor.length === 0) {
        this.$msg('请上传门头照')
        return false
      }
      if (this.rules.BusinessLicense?.show && this.rules.BusinessLicense?.required && this.license.length === 0) {
        this.$msg('请上传营业执照')
        return false
      }
      if (this.rules.TheirDealer?.show && this.rules.TheirDealer?.required && this.form.dealerid === -1) {
        this.$msg('请选择所属上级')
        return false
      }
      if (this.rules.Remark?.show && this.rules.Remark?.required && !this.form.remark) {
        this.$msg('请输入备注')
        return false
      }
      if (this.rules.StoreType?.show && this.rules.StoreType?.required && !this.form.storetypeid) {
        this.$msg('请选择门店类型')
        return false
      }
      if (this.rules.ShopSize?.show && this.rules.ShopSize?.required && this.form.shopsize === '') {
        this.$msg('请选择店铺面积')
        return false
      }

      if (this.rules.WeChat?.show) {
        if (this.rules.WeChat?.required && !this.form.wxno) {
          this.$msg('请输入微信号')
          return false
        }
        if (/[\u4e00-\u9fa5]/.test(this.form.wxno)) {
          this.$msg('请输入正确的微信号')
          return false
        }
      }
      if (this.rules.QQ?.show) {
        if (this.rules.QQ?.required && !this.form.qqno) {
          this.$msg('请输入QQ号')
          return false
        }
        if (this.form.qqno && !/^\d+$/.test(this.form.qqno)) {
          this.$msg('请输入正确的QQ号')
          return false
        }
      }
      if (this.rules.Email?.show) {
        if (this.rules.Email?.required && !this.form.email) {
          this.$msg('请输入邮箱')
          return false
        }
      }
      if (!this.showServiceBlock) return true
      if (this.rules.ShopPic?.show && this.rules.ShopPic?.required && this.shopPic.length === 0) {
        this.$msg('请上传门店图片')
        return false
      }
      if (this.rules.ShopPhone?.show) {
        if (this.rules.ShopPhone?.required && !this.form.phoneno) {
          this.$msg('请输入门店电话')
          return false
        }
        if (this.form.phoneno && !/^[\d-]+$/.test(this.form.phoneno)) {
          this.$msg('请输入正确的门店电话')
          return false
        }
      }
      if (this.rules.PerPrice?.show) {
        if (this.rules.PerPrice?.required && this.form.percapita === '') {
          this.$msg('请输入人均价格')
          return false
        }
        if (this.form.percapita && !/^([1-9]\d*|0)(\.\d{1,2})?$/.test(this.form.percapita)) {
          this.$msg('人均价格请输入数字，最多包含2位小数')
          return false
        }
      }
      if (this.rules.BusinessHours?.show && this.rules.BusinessHours?.required && !this.form.businesshours) {
        this.$msg('请输入营业时间')
        return false
      }
      if (this.rules.Recommend?.show && this.rules.Recommend?.required && !this.form.recommend) {
        this.$msg('请输入推荐信息')
        return false
      }
      if (this.rules.SellingPoint?.show && this.rules.SellingPoint?.required && !this.form.characteristic) {
        this.$msg('请输入特色服务')
        return false
      }
      if (this.rules.BriefIntro?.show && this.rules.BriefIntro?.required && !this.form.introduction) {
        this.$msg('请输入简介')
        return false
      }
      return true
    },
    async validateLeader() {
      const mobile = this.form.mobile
      //校验
      if (mobile === '') {
        this.$msg('手机号码不能为空')
        return false
      }

      if (this.customYzm) {
        if (!regMobile(mobile)) {
          this.$msg('请输入正确的手机号')
          return false
        }
        if (!this.yzm) {
          this.$msg('请输入验证码')
          return false
        }
        if (!regCode(this.yzm)) {
          this.$msg('请输入正确的验证码')
          return false
        }
      }
      if (this.rules.Name?.show) {
        if (this.rules.Name?.required && !this.form.leader) {
          this.$msg(`请输入${this.leaderTitle}`)
          return false
        }
        if (this.form.leader && !/^[a-zA-Z\u4e00-\u9fa5]+$/.test(this.form.leader)) {
          this.$msg(`${this.leaderTitle}只能输入中英文`)
          return false
        }
      }

      if (this.customYzm && !this.validInfo[`${mobile}_${this.yzm}`]) {
        const v = await apiValidateCode({
          mobile,
          checkcode: this.yzm
        })
        if (!this.$ck(v)) return false
        // 检验成功后不再次校验
        this.validInfo[`${mobile}_${this.yzm}`] = true
      }
      return true
    },
    async handleSubmit() {
      // console.log(this.form)
      const leaderValidated = await this.validateLeader()
      if (!leaderValidated) return
      if (!this.validateForm()) return
      if (!this.openId) {
        this.operaType = 1
        this.popContent = '暂未获取微信授权信息，请重新授权'
        this.popConfirmText = '重新授权'
        this.showPopup = true
        return
      }
      const businesslicense = this.license.length ? this.license[0] : ''
      const storeimg = this.shopPic.slice(0, 9).join(',')
      const param = {
        shopfor: this.shopFor.length ? [this.shopFor[0]] : [], //数组
        businesslicense, // 字符串
        storeimg, // 字符串
        ...this.form
      }
      param.dealerid = param.dealerid === -1 ? 0 : param.dealerid
      param.percapita = Number(param.percapita || 0)
      param.openid = this.openId
      // 注册需要特殊处理：当姓名字段不需要填写，则自动将门店名称过滤赋值给姓名
      if (this.form.leader === '' && this.registerType === 2) {
        param.leader = this.form.storename
          .match(/[a-zA-Z\u4e00-\u9fa5]+/g)
          .join('')
          .substring(0, 16)
      }
      // console.log('表单数据', param)
      this.$emit('submit', param)
    },
    handleChoose(i) {
      this.selectStore = i
    },
    onClose() {
      if (this.operaType === 1) {
        this.getOpenid()
      }
    },
    getOpenid() {
      uni.setStorageSync('registerAuthorizeUrl', this.authorizeurl)
      uni.navigateTo({
        url: `/pages/index/auth-webview?from=registerstore`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/register-result.scss';
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
    &::after {
      position: absolute;
      bottom: 2rpx;
      left: 0;
      width: 60rpx;
      height: 8rpx;
      content: '';
      opacity: 0.5;
      border-radius: 4rpx;
      background: #ff7640;
    }
  }
  .input {
    height: 108rpx;
    text-align: left;
    color: #000;
    line-height: 108rpx;
  }
}
.mobile-btn {
  width: 200rpx;
  padding: 12rpx;
  color: #0f80ff;
  border: 1rpx solid #0f80ff;
  border-radius: 28rpx;
  background-color: #fff;
  font-size: 24rpx;
  font-weight: 500;
}
.btn-group {
  position: fixed;
  left: 30rpx;
  right: 30rpx;
  bottom: 30rpx;
  z-index: 200;
}
.store-item + .store-item {
  margin-top: 10rpx;
}
</style>
