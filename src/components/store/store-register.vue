<template>
  <view :style="themeVars">
    <template v-if="isLoaded">
      <template v-if="isMaster">
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
              <get-mobile v-if="!skipMobile" v-model="form.mobile" :memberlogin="m" class="mr-20" />
            </view>
          </info-cell>
          <VerifyCodeChange v-if="!skipMobile && !customYzm" v-model="byYzm" custom-class="pt-10 pb-20 mr-20" />
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
      </template>
      <template v-if="!isMaster && !isEdit">
        <view class="form-box">
          <view class="form-title">负责人信息</view>
          <info-cell v-if="rules.Name.show" is-middle is-input :is-needed="rules.Name.required">
            <view slot="left">负责人</view>
            <input
              slot="right"
              v-model.trim="form.leader"
              type="text"
              class="input"
              :maxlength="16"
              placeholder-class="placeholder"
              placeholder="请输入姓名"
            />
          </info-cell>
          <info-cell is-middle is-needed is-input>
            <view slot="left">
              手机号
              <u-loading v-if="manual.checkLoading" mode="circle" class="mr-20" />
            </view>
            <input
              slot="right"
              v-model.trim="form.mobile"
              type="number"
              placeholder-class="placeholder"
              placeholder="请输入手机号"
              :maxlength="11"
              class="input"
              :disabled="checkLoading"
              @blur="validateMobile"
            />
          </info-cell>
          <view class="tx-r fs-20 warn-color mr-30 mt-10">
            {{ manual.mobileTips }}
          </view>
        </view>
      </template>
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
          is-link
          :is-needed="rules.ShopAddress.required"
          @tap="handleEditAdress"
        >
          <view slot="left">门店地址</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ fullAddress || '选择省市区' }}
            </view>
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

        <template v-if="rules.TheirDealer.show">
          <!--多个经销商  -->
          <block v-if="multipleDealer">
            <info-cell
              is-middle
              :is-show-line="dealerLine"
              :is-needed="rules.TheirDealer.required"
              @tap="canModifyDealer ? (showDealer = true) : showDisabledTips(selectDealerTitle, true)"
            >
              <view slot="left">所属{{ selectDealerTitle }}</view>
              <view slot="right">
                <view v-if="canModifyDealer" class="flex flex-middle flex-end">
                  <view class="edit-btn">+添加</view>
                </view>
                <view v-if="!canModifyDealer" class="tx-l">{{ dealerNames }}</view>
              </view>
            </info-cell>
            <info-cell
              v-if="canModifyDealer && dealerList.length"
              :is-input="true"
              :is-middle="true"
              :is-show-left="false"
            >
              <view slot="right">
                <view class="flex-wrap">
                  <label-cell name-key="dealername" :list="dealerList" @del="handleDelDealer" />
                </view>
              </view>
            </info-cell>
          </block>
          <!--end  多个经销商  -->
          <!-- 单个经销商 -->
          <info-cell
            v-else
            is-middle
            is-link
            :is-needed="rules.TheirDealer.required"
            @tap="canModifyDealer ? (showDealer = true) : showDisabledTips(selectDealerTitle, true)"
          >
            <view slot="left">所属{{ selectDealerTitle }}</view>
            <view slot="right" class="flex">
              <view class="tx-l">{{ dealerList[0].dealername || '' }}</view>
            </view>
          </info-cell>
          <!--end 单个经销商 -->
        </template>
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
          is-link
          :is-needed="rules.StoreType.required"
          @tap="!shopTypeDisabled ? (showStore = true) : showDisabledTips('门店类型', true)"
        >
          <view slot="left">门店类型</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ storeInfo.name || '选择门店类型' }}
            </view>
          </view>
        </info-cell>
        <info-cell
          v-if="rules.ShopSize.show"
          is-middle
          is-link
          :is-needed="rules.ShopSize.required"
          @tap="!shopsizeDisabled ? (showShopSize = true) : showDisabledTips('店铺面积', true)"
        >
          <view slot="left">店铺面积</view>
          <view slot="right" class="flex">
            <view class="flex-1 ellipsis-2 tx-l">
              {{ shopSize.name || '选择店铺面积' }}
            </view>
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
          <MdTextarea
            slot="right"
            v-model="form.recommend"
            :disabled="recommendDisabled"
            placeholder="如：推荐菜、商品、房间"
            :max-length="200"
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
          <MdTextarea
            slot="right"
            v-model="form.characteristic"
            :disabled="characteristicDisabled"
            placeholder="如：免费停车、WIFI"
            :max-length="50"
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
          <MdTextarea
            slot="right"
            v-model="form.introduction"
            :disabled="introductionDisabled"
            placeholder="对品牌或门店的简单介绍"
            :max-length="300"
          />
        </info-cell>
      </view>
      <view v-if="!isMaster && isEdit" class="form-box mt-20">
        <view class="form-title">负责人信息</view>
        <info-cell v-if="rules.Name.show" is-middle is-input :is-needed="rules.Name.required">
          <view slot="left">负责人</view>
          <input
            slot="right"
            v-model.trim="form.leader"
            type="text"
            class="input"
            :maxlength="16"
            placeholder-class="placeholder"
            placeholder="请输入姓名"
          />
        </info-cell>
        <info-cell is-middle is-needed is-input>
          <view slot="left">手机号</view>
          <input
            slot="right"
            v-model.trim="form.mobile"
            type="number"
            placeholder-class="placeholder"
            placeholder="请输入手机号"
            :disabled="manual.accountStatus === 1"
            :maxlength="11"
            class="input"
            :class="manual.accountStatus === 1 ? 'input-disbaled' : ''"
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
      :selected-list="dealerIdList"
      :dxm-dealer-id="dxmDealerId"
      :multiple="multipleDealer"
      show-origin
      :lanandlat="form.lanandlat"
      @submit="onPickerConfirm($event, 'd')"
      @mulSubmit="onPickerConfirm($event, 'm-d')"
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
import MdTextarea from 'packages/components/easycom/md-textarea.vue'
import { apiGetRegisterInfo, apiValidateCode, apiGetStoreDetail, apiCheckMobile } from 'packages/api/store'
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
import InfoCell from 'packages/components/info-cell/info-cell'
import upload from 'packages/components/upload/upload'
import LabelCell from 'packages/components/label/index'
import userAuthHub from 'packages/utils/user-auth-hub'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  name: 'RegisterStore',
  components: {
    MdTextarea,
    VerifyCode,
    VerifyCodeChange,
    CodeTip,
    DealerPicker,
    StorePicker,
    AreaPicker,
    InfoCell,
    upload,
    LabelCell
  },
  mixins: [
    simplePopupMixin,
    phoneVerifyMixin,
    yzmMixin,
    codeTipMixin,
    privacyMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  props: {
    extraData: {
      // 目前仅用于激活传不可变参数值过来
      type: Object,
      default: () => {}
    },
    storeData: {
      type: Object,
      default: () => {}
    },
    needOpenid: Boolean, // 需要获取openid
    selectDealerTitle: {
      type: String,
      default: '上级'
    },
    btnText: {
      type: String,
      default: ''
    },
    openid: {
      type: String,
      default: ''
    },
    m: {
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
    multipleDealer: Boolean, // 多个经销商，需要后台设置为可选多个经销商
    canModifyDealer: Boolean, // 是否允许修改经销商
    registerType: {
      type: Number,
      default: 0 // 1激活（万能零售） 3(添加/修改门店) 新经销助手  4(添加/修改门店)业务帮帮
    },
    isEdit: Boolean, // true 修改[ 业务帮帮 新经销助手] false新增
    infoSource: {
      //获取门店数据：0 通过本地存储editStoreInfoTemp  1通过接口 2通过prop传
      type: Number,
      default: 0
    },
    relatedDealerId: {
      // > 0:获取经销商邀请注册的配置信息； 等于0:获取店老板自主注册的配置信息
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      showStoreData: false,
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
      remarkPlaceholder: '最多50个字',
      shopFor: [],
      license: [], // 营业执照
      shopPic: [], // 门店照片
      rules: {
        ShopNo: { show: 1, required: 1 },
        ShopName: { show: 1, required: 1 },
        ShopAddress: { show: 1, required: 1 }
      },
      dealerList: [],
      showDealer: false, // 显示所属上级弹窗
      storeInfo: {},
      shopSize: {},
      showStore: false, // 显示门店类型弹窗
      showShopSize: false, // 显示店铺面积弹窗
      btnLoading: false,
      validInfo: {},
      codeTips: '',
      oldData: {}, // 只用于激活
      addressInfo: {},
      authorizeurl: '',
      openId: '',
      manual: {
        // 手动添加或修改
        mobileTips: '', // 业务帮帮 新经销添加门店需要检测手机号
        checkLoading: false, //业务帮帮 新经销添加门店检测手机号的状态
        accountStatus: 0 //门店修改-： 3 -未激活可以修改手机号，  1正常状态不可修改
      }
    }
  },
  computed: {
    introductionDisabled() {
      return this.setFormDisabled('introduction', 'BriefIntro')
    },
    characteristicDisabled() {
      return this.setFormDisabled('characteristic', 'SellingPoint')
    },
    recommendDisabled() {
      return this.setFormDisabled('recommend', 'Recommend')
    },
    businessDisabled() {
      return this.setFormDisabled('businesshours', 'BusinessHours')
    },
    percapitaDisabled() {
      return this.setFormDisabled('percapita', 'PerPrice')
    },
    phonenoDisabled() {
      return this.setFormDisabled('phoneno', 'ShopPhone')
    },
    emailDisabled() {
      return this.setFormDisabled('email', 'Email')
    },
    qqnoDisabled() {
      return this.setFormDisabled('qqno', 'QQ')
    },
    wxnoDisabled() {
      return this.setFormDisabled('wxno', 'WeChat')
    },
    remarkDisabled() {
      return this.setFormDisabled('remark', 'Remark')
    },
    branchnameDisabled() {
      return this.setFormDisabled('branchname', 'PartShopName')
    },
    storeNameDisabled() {
      return this.setFormDisabled('storename', 'ShopName')
    },
    shopforDisabled() {
      return this.setFormDisabled('shopfor', 'ShopFor')
    },
    licenseDisabled() {
      return this.setFormDisabled('businesslicense', 'BusinessLicense')
    },
    leaderDisabled() {
      return this.setFormDisabled('leader', 'Name')
    },
    shopsizeDisabled() {
      return this.setFormDisabled('shopsize', 'ShopSize')
    },
    shopTypeDisabled() {
      return this.setFormDisabled('storetypeid', 'StoreType')
    },
    shoppicDisabled() {
      return this.setFormDisabled('storeimg', 'ShopPic')
    },
    dealerIdList() {
      return this.dealerList.map(item => item.id)
    },
    dealerNames() {
      return this.dealerList.map(item => item.dealername).join(',')
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
    isMaster() {
      // 店老板自主注册/激活
      return this.registerType === 1
    },
    dealerLine() {
      return !(this.canModifyDealer && this.dealerList.length)
    }
  },
  watch: {
    isLoaded(v) {
      if (v) {
        this.getOpenid()
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.init()
    }, 50)
    uni.$on('store-register-address', d => {
      this.addressInfo = d
      this.form.address = this.addressInfo.address + (this.addressInfo.houseNumber || '')
      this.form.lanandlat = this.addressInfo.lanandlat
    })
    uni.$on('phone-verify', () => {
      if (!this.skipMobile) {
        this.verifyState = true
        this.autoFocus = true
      }
    })
  },
  beforeDestroy() {
    uni.$off('phone-verify')
    uni.$off('store-register-address')
  },
  methods: {
    setFormDisabled(dataKey, ruleKey) {
      if (this.registerType === 1) {
        return this.oldData[dataKey] && this.rules[ruleKey]?.modify
      }
      return false
    },
    handleDelDealer(i) {
      this.dealerList.splice(i, 1)
    },
    async init() {
      if (!this.m) return this.$msg('参数错误！')
      if (this.registerType === 1) {
        if (!this.extraData) return this.$msg('参数错误！')
        // 激活带入的信息，因为读取门店信息是客户可是设置的，所以带过来在这里赋值。激活默认是显示第一个经销商，不可修改
        const { dealerid, dealername, mobile, storeno } = this.extraData
        // 激活 门店所属上级是跟随来源的（与门店带来的信息不一定相同，所以要单独赋值）
        this.dealerList.push({
          id: dealerid,
          dealername: dealername || ''
        })
        // 只有通过手机激活才能显示手机号，否则都不显示手机号 需要用户自己获取.通过登录激活 手机号不可修改
        this.form.mobile = mobile
        // 门店编号不可修改
        this.form.storeno = storeno
      } else {
        this.showStoreData = !!this.isEdit
      }
      this.needOpenid && (this.openId = this.openid || '')

      uni.showLoading({
        title: '加载中',
        mask: true
      })
      try {
        // 获取注册信息
        await this.getConfig()
        if (this.showStoreData) {
          if (this.infoSource === 1) {
            await this.getStoreData()
          } else if (this.infoSource === 2) {
            this.manual.accountStatus = this.storeData.status
            this.initFormData(this.storeData)
          } else {
            const storeInfo = uni.getStorageSync('editStoreInfoTemp') || {}
            this.manual.accountStatus = storeInfo.status
            this.initFormData(storeInfo)
          }
        }
        this.isLoaded = true
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        const errTips = e?.return_msg || JSON.stringify(e)
        this.showTips({ content: errTips })
        this.$uploadLog({
          type: 'registerStore',
          desc: this.registerType === 1 ? '激活门店' : '添加/修改门店',
          data: e,
          extend: { mobile: this.form.mobile || '' }
        })
      }
    },
    validateMobile() {
      // 手机校验 只判断添加门店(修改门店不校验)
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
        mobile: this.form.mobile,
        dealerid: this.relatedDealerId
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
    initFormData(storeData) {
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
        storetypename,
        mobile,
        dealers = [] // 业务帮帮
      } = storeData
      let oldData = {
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
        province: provincename || '',
        city: cityname || '',
        area: areaname || '',
        street: streetname || '',
        address: address || '',
        houseNumber: '',
        lanandlat: lanandlat || ''
      }
      percapita && (oldData.percapita = percapita)
      oldData = Object.keys(oldData).reduce((acc, key) => {
        if (oldData[key] !== undefined) {
          acc[key] = oldData[key] !== null ? oldData[key] : ''
        }
        return acc
      }, {})

      this.form = { ...this.form, ...oldData }
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

      if (this.registerType === 1) {
        // 特殊：激活需要比对旧数据
        this.oldData = { ...this.form, shopfor, businesslicense, storeimg }
      }

      if (!this.isMaster) {
        this.form.mobile = mobile
      }
      if (this.registerType === 4) {
        // 业务帮帮 多个经销商
        this.dealerList = [...dealers]
      }
    },
    async getConfig() {
      const js_code = await getJsCode()
      return new Promise((resolve, reject) => {
        let p = {
          js_code,
          m: this.m,
          d: this.relatedDealerId
        }
        apiGetRegisterInfo(p, false)
          .then(res => {
            if (this.$ck(res)) {
              const { basicsettings, authorizeurl } = res.return_data
              const { basic, leader, service, auditshop } = basicsettings
              this.needOpenid && (this.authorizeurl = authorizeurl)
              const e = ['Remark_TipMsg', 'LongiAndLati', 'Phone', 'Phone_SmsVerify', 'DefaPhoneToStoreNo']
              const rp = basic.find(i => i.code === 'Remark_TipMsg')
              this.remarkPlaceholder = rp?.title || '最多50个字'

              if (this.registerType === 1) {
                //  ** 激活  **
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
                const ln = leader.find(i => i.code === 'Name')
                this.leaderTitle = ln?.title || '姓名'
                this.leaderPlaceholder = `请输入${this.leaderTitle}`
                const registerItem = auditshop.filter(i => i.code === 'RegisterData')
                if (registerItem.length && registerItem[0].required) {
                  // 显示后台录入的门店信息
                  this.showStoreData = true
                }
              } else if ([3, 4].includes(this.registerType)) {
                // ** 3新经销助手  4业务帮帮  **
                const exCode = ['ShopNo', ...e, ...(this.isEdit ? ['WeChat', 'QQ', 'Email'] : [])]
                /*
                特殊规则：
                  isEdit:
                     false: 添加门店，按照后台正常返回显示
                     true: 编辑门店：（特殊处理）
                          显示：按照后台返回正常显示；
                          不显示：则默认显示，但不必填

                  业务帮帮：
                     添加:按照后台配置显示字段。
                     编辑:不显示服务信息、微信、qq、邮箱
                */
                this.rules = [
                  ...basic,
                  ...leader,
                  ...(!this.isEdit && service && this.registerType === 4 ? service : [])
                ]
                  .filter(i => !exCode.includes(i.code))
                  .reduce((acc, i) => {
                    acc[i.code] = {
                      show: this.isEdit && !i.show ? true : i.show,
                      required: this.isEdit && !i.show ? false : i.required
                    }
                    return acc
                  }, {})
              }
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
    async getStoreData() {
      const js_code = await getJsCode()
      return new Promise((resolve, reject) => {
        apiGetStoreDetail(
          {
            js_code,
            memberlogin: this.m,
            storeno: this.form.storeno
          },
          false
        )
          .then(res => {
            if (this.$ck(res)) {
              this.initFormData(res.return_data)
              resolve()
            } else {
              reject(res)
            }
          })
          .catch(() => {
            reject()
          })
      })
    },
    handleEditAdress() {
      uni.setStorageSync('storeRegisterAddress', this.addressInfo)
      // 如果是用户自主注册，需要加上&m=this.m
      uni.navigateTo({
        url: `/packages/src/address/address?type=1`
      })
    },
    showDisabledTips(name, status) {
      status && this.$msg(`${name}不可修改`)
    },
    onPickerConfirm(e, type) {
      if (!e) return
      if (type === 'd') {
        this.dealerList = []
        this.dealerList.push(e)
        this.showDealer = false
      } else if (type === 'm-d') {
        this.dealerList = [...e]
        this.showDealer = false
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
      if (this.rules.TheirDealer?.show && this.rules.TheirDealer?.required && !this.dealerList.length) {
        this.$msg('请选择所属' + this.selectDealerTitle)
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
    async mobileValidated() {
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
    leaderValidated() {
      const leader = this.isMaster ? this.leaderTitle : '负责人姓名'
      if (this.rules.Name?.show) {
        if (this.rules.Name?.required && !this.form.leader) {
          this.$msg(`请输入${leader}`)
          return false
        }
        if (this.form.leader && !/^[a-zA-Z\u4e00-\u9fa5]+$/.test(this.form.leader)) {
          this.$msg(`${leader}只能输入中英文`)
          return false
        }
      }
      if (!this.form.leader) {
        // 特殊处理：当姓名字段不需要填写，则自动将门店名称过滤赋值给姓名
        this.form.leader = this.form.storename
          .match(/[a-zA-Z\u4e00-\u9fa5]+/g)
          ?.join('')
          ?.substring(0, 16)
      }
      return true
    },
    async handleSubmit() {
      // 第三方 添加，负责人显示在前面。门店负责人自己填写，手机号在前
      if (!this.isMaster && !this.leaderValidated()) return
      if (!(await this.mobileValidated())) return
      if (this.isMaster && !this.leaderValidated()) return
      if (!this.validateForm()) return
      // 自主注册和激活需要openid， 手动添加不需要
      if (!this.openId && this.needOpenid) {
        this.operaType = 1
        this.popContent = '暂未获取微信授权信息，请重新授权'
        this.popConfirmText = '重新授权'
        this.showPopup = true
        return
      }
      // 限制了图片数量，某些ios能选多张，所以做了截取
      const businesslicense = this.license.slice(0, 1).join(',')
      const storeimg = this.shopPic.slice(0, 9).join(',')
      const shopfor = this.shopFor.slice(0, 1).join(',')
      const param = {
        shopfor, // 字符串
        businesslicense, // 字符串
        storeimg, // 字符串
        ...this.form
      }
      // 需要看各个功能需要的参数类型，各个端不同
      if (this.registerType === 1) {
        param.dealerid = this.dealerIdList[0]
      } else if (this.registerType === 4) {
        param.dealerids = this.dealerIdList
      }

      param.percapita = Number(param.percapita || 0)
      this.needOpenid && (param.openid = this.openId)
      this.$emit('submit', param)
    },
    onClose() {
      if (this.operaType === 1) {
        this.getOpenid()
      }
    },
    async getOpenid() {
      if (this.needOpenid && !this.openId) {
        uni.setStorageSync('authorizeUrl', this.authorizeurl)
        let authInfo = await new Promise(resolve => {
          userAuthHub.subscribe(resolve)
          uni.navigateTo({
            url: `/packages/src/rule/auth`
          })
        })
        if (authInfo.openid) {
          this.openId = authInfo.openid
          if (this.operaType === 1) {
            this.$msg('授权成功！')
            this.operaType = 0
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-box {
  margin: 20rpx;
  padding: 20rpx 0 20rpx 20rpx;
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
.edit-btn {
  padding: 0 20rpx;
  height: 50rpx;
  line-height: 50rpx;
  background: #ffffff;
  border: 1px solid $uni-color-edit;
  color: $uni-color-edit;
  border-radius: 24rpx;
  white-space: nowrap;
  font-size: 24rpx;
}
</style>
