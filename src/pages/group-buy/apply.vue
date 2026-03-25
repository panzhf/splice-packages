<template>
  <view :style="themeVars">
    <view v-if="!loading" class="page-group-buy">
      <view class="pd-info box flex fs-28">
        <image class="cover shrink-0" :src="product.img" />
        <view class="flex-1 ml-20">
          <view class="name">{{ product.name }}</view>
          <view v-if="product.skuName" class="count mt-10 fs-24 c-6">{{ product.skuName }}</view>
        </view>
      </view>
      <!-- #ifdef MP-SALE -->
      <view class="form-info box">
        <u-form label-width="140">
          <u-form-item label="代报门店" required>
            <u-input
              v-model="storeName"
              type="select"
              placeholder="请选择门店"
              :disabled="isEdit || initStoreId"
              @click="handleShowStore"
            />
          </u-form-item>
          <view v-if="showStoreTips" class="tips pt-10 pb-10">{{ errTip }}</view>
        </u-form>
      </view>
      <!-- #endif -->
      <view v-if="!isEdit" class="scan-info box">
        <view class="title fs-28 flex flex-middle flex-between mb-30">
          团购商品登记
          <view class="scan-btn fs-24" @tap="handleScan">{{ info.totalscanamount ? '继续扫码' : '扫码登记' }}</view>
        </view>
        <view class="flex flex-middle fs-32">
          <view class="flex-1">
            物流码数量：
            <text class="primary-color">{{ info.totalscanamount }}</text>
          </view>
          <view class="flex-1">
            商品登记数量：
            <text class="primary-color">{{ info.totallogisticscode }}</text>
          </view>
        </view>
        <view
          v-if="info.totalscanamount > 0"
          class="code-record flex flex-middle flex-end fs-24"
          @tap="handleCodeRecord"
        >
          查看已扫物流码
          <!-- #ifdef MP-RETAIL -->
          <text class="iconfont iconjiantou1 fs-20 ml-10" />
          <!-- #endif -->
          <!-- #ifdef MP-SALE -->
          <view class="iconfont iconjiantou fs-20 ml-10" />
          <!-- #endif -->
        </view>
      </view>
      <view v-show="showFormBox" class="form-info box">
        <u-form ref="uForm" :model="form" label-width="140" :error-type="['toast']">
          <u-form-item
            v-if="settings.groupbuyername.show"
            label="团购人"
            prop="groupbuyername"
            :required="settings.groupbuyername.required"
          >
            <u-input v-model="form.groupbuyername" :clearable="false" placeholder="请输入团购人姓名" :maxlength="10" />
          </u-form-item>
          <u-form-item
            v-if="settings.groupbuyerphone.show"
            label="手机号"
            prop="groupbuyerphone"
            :required="settings.groupbuyerphone.required"
          >
            <u-input
              v-model="form.groupbuyerphone"
              :clearable="false"
              placeholder="11位纯数字"
              type="number"
              :maxlength="11"
            />
          </u-form-item>
          <u-form-item
            v-if="settings.orderpicture.show"
            label="上传照片"
            desc="(最多3张)"
            prop="orderpicture"
            :required="settings.orderpicture.required"
          >
            <upload v-model="form.orderpicture" :max-length="3" size="100" multiple :is-replace="false" />
          </u-form-item>
          <u-form-item
            v-if="settings.remark.show"
            label="备注"
            prop="remark"
            :required="settings.remark.required"
            class="custom-input"
          >
            <u-input v-model="form.remark" :clearable="false" placeholder="请输入备注文案" maxlength="20" />
          </u-form-item>
          <div class="tx-r fs-24 count-tip pb-20">{{ remarkCount }}/20</div>
        </u-form>
      </view>
      <view style="height: 150rpx" />
      <view class="btn-info flex flex-middle">
        <button v-if="query.orderno && !isEdit" class="primary-btn plain round flex-1" @tap="handleCancel">取消</button>
        <button
          class="primary-btn round flex-1"
          :class="{ disabled: !isEdit && !info.totallogisticscode }"
          @tap="handleSubmit"
        >
          提 交
        </button>
      </view>
    </view>
    <code-record v-model="showCodeRecord" :info="query" />
    <common-popup
      v-model="showPopup"
      type="confirm"
      :title="popTitle"
      :content="popContent"
      @confirm="onPopupConfirm"
    />
    <!-- #ifdef MP-SALE -->
    <store-picker
      v-model="showStorePicker"
      :show-all-store="false"
      :select-id="query.storeid"
      @submit="handleSelectStore"
    />
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup />
    <!-- #endif -->
  </view>
</template>

<script>
import upload from 'packages/components/upload/upload'
import CodeRecord from './components/code-record.vue'
import {
  apiActivityDetail,
  apiActivitySetting,
  apiDeliveryStatistics,
  apiIsCanApply,
  apiApply,
  apiEditOrder,
  apiOrderDetail
} from 'packages/api/group-buy'

// #ifdef MP-SALE
import StorePicker from '@/components/people-picker/store-picker.vue'
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
// #ifdef MP-RETAIL
import subscribeMsgMixin, { noticeMixin, noticeMixin2 } from 'packages/mixins/subscribe-msg'
// #endif
import { cancelMixin } from './mixins'
export default {
  components: {
    upload,
    CodeRecord,
    // #ifdef MP-SALE
    StorePicker
    // #endif
  },
  mixins: [
    // #ifdef MP-SALE
    notThemeMixin,
    // #endif
    // #ifdef MP-RETAIL
    subscribeMsgMixin,
    noticeMixin,
    noticeMixin2,
    // #endif
    cancelMixin
  ],
  data() {
    return {
      loading: true,
      isEdit: false, // 是否是编辑模式
      info: {
        totalscanamount: 0, // 物流码数量
        totallogisticscode: 0 // 商品登记数量
      },
      product: {
        name: '',
        skuName: '',
        img: ''
      },
      settings: {
        groupbuyername: {
          show: 1,
          required: 1
        },
        groupbuyerphone: {
          show: 1,
          required: 1
        },
        remark: {
          show: 1,
          required: 0
        },
        orderpicture: {
          show: 1,
          required: 0
        }
      },
      query: {
        orderno: '',
        activityid: 0,
        // #ifdef MP-SALE
        storeid: 0
        // #endif
      },
      form: {
        groupbuyername: '',
        groupbuyerphone: '',
        remark: '',
        orderpicture: []
      },
      showCodeRecord: false,
      btnLoading: false,
      // #ifdef MP-SALE
      initStoreId: 0, // 待提交订单已存在门店
      storeName: '',
      showStorePicker: false,
      showStoreTips: false,
      errTip: '此门店不符合参与资格'
      // #endif
    }
  },
  computed: {
    remarkCount() {
      return this.form.remark.trim().length
    },
    showFormBox() {
      return Object.values(this.settings).some(item => item.show)
    }
  },
  async onLoad(options) {
    this.query.activityid = +options.activityid
    // 说明有待提交订单（订单列表-待提交订单；落地页-参加活动）
    options.orderno && this.setOrderNo(options.orderno)

    // #ifdef MP-SALE
    // 订单列表-待提交订单，携带门店数据回显
    if (options.storeid) {
      this.query.storeid = +options.storeid
      this.initStoreId = +options.storeid
    }
    options.storename && (this.storeName = decodeURIComponent(options.storename))
    // #endif

    await this.getInfo()
    // 判断是否是编辑模式
    if (options.orderno && options.isedit === '1') {
      this.isEdit = true
      uni.setNavigationBarTitle({
        title: '编辑订单'
      })
      await this.getOrderDetail()
    }

    // #ifdef MP-RETAIL
    // 零售有消息订阅
    if (!this.isEdit) {
      this.subscribeSettings = await this.initNotice(551)
      this.subscribeSettings.isopen && this.fetchNotice(11)
    }
    // #endif
  },
  onReady() {
    this.setRules()
  },
  onShow() {
    // 如果有待提交订单数据，先获取记录（编辑模式不需要）
    if (this.query.orderno && !this.isEdit) {
      this.getCount()
    }
  },
  methods: {
    setOrderNo(no) {
      this.query.orderno = no
    },
    async getInfo() {
      this.loading = true
      try {
        const res = await apiActivityDetail({ activityid: this.query.activityid })
        if (this.$ck(res)) {
          let { productname, productformatname, productimg } = res.return_data
          this.product = {
            name: productname,
            skuName: productformatname,
            img: productimg
          }
        }
      } finally {
        this.loading = false
      }
    },
    async getOrderDetail() {
      const res = await apiOrderDetail({
        orderno: this.query.orderno,
        // #ifdef MP-SALE
        storeid: this.query.storeid
        // #endif
      })
      if (this.$ck(res)) {
        const data = res.return_data
        // 设置商品信息
        this.product = {
          name: data.productname,
          skuName: data.productformatname,
          img: data.productimg
        }
        // 设置表单信息
        this.form = {
          groupbuyername: data.groupbuyername || '',
          groupbuyerphone: data.groupbuyerphone || '',
          remark: data.remark || '',
          orderpicture: data.orderpicture || []
        }
        // #ifdef MP-SALE
        // 设置门店信息
        if (data.storeid) {
          this.query.storeid = data.storeid
          this.initStoreId = data.storeid
          this.storeName = `${data.storeno}-${data.storename}`
        }
        // #endif
      }
    },
    async setRules() {
      const res = await apiActivitySetting()
      if (this.$ck(res)) {
        const d = this.$toLowerKey(JSON.parse(res.return_data.fieldjson), true)
        // 合并设置，保留默认值，避免旧数据缺少字段
        this.settings = {
          groupbuyername: d.groupbuyername || this.settings.groupbuyername,
          groupbuyerphone: d.groupbuyerphone || this.settings.groupbuyerphone,
          remark: d.remark || this.settings.remark,
          orderpicture: d.orderpicture || this.settings.orderpicture
        }
      }
      const rules = {
        groupbuyername: {
          required: !!this.settings.groupbuyername.required,
          message: '请输入团购人姓名',
          trigger: ['blur', 'change']
        },
        groupbuyerphone: [
          {
            required: !!this.settings.groupbuyerphone.required,
            message: '请输入手机号码',
            trigger: ['blur', 'change']
          },
          {
            validator: (_rule, value) => {
              // 如果字段不是必填且值为空，通过验证
              if (!this.settings.groupbuyerphone.required && (!value || !value.trim())) {
                return true
              }
              // 如果有值，校验手机号格式
              return value && this.$u.test.mobile(value)
            },
            message: '请输入正确的手机号码',
            trigger: ['blur', 'change']
          }
        ],
        orderpicture: {
          required: !!this.settings.orderpicture.required,
          message: '请上传照片',
          trigger: 'change',
          validator: (rule, value, callback) => {
            return this.settings.orderpicture.required ? !!(value && value.length) : true
          }
        },
        remark: {
          required: !!this.settings.remark.required,
          message: '请填写订单备注',
          trigger: 'blur'
        }
      }
      // 检查 uForm 是否存在，避免 v-show 为 false 时 refs 为 undefined
      this.$refs.uForm && this.$refs.uForm.setRules(rules)
    },
    async getCount() {
      const res = await apiDeliveryStatistics({
        activityid: this.query.activityid,
        orderno: this.query.orderno,
        // #ifdef MP-SALE
        storeid: this.query.storeid
        // #endif
      })
      if (this.$ck(res)) {
        this.info = { ...this.info, ...res.return_data }
      }
    },
    resetCount() {
      this.info = {
        totalscanamount: 0,
        totallogisticscode: 0
      }
    },
    // #ifdef MP-SALE
    handleShowStore() {
      if (this.initStoreId || this.isEdit) return
      this.showStorePicker = true
    },
    async handleSelectStore(e) {
      this.query.storeid = 0
      this.storeName = ''
      try {
        const res = await apiIsCanApply({
          activityid: this.query.activityid,
          storeid: e.storeid
        })
        if (this.$ck(res)) {
          const { iscanapplyfor, waitsubmitorderinfo } = res.return_data
          if (iscanapplyfor) {
            this.showStoreTips = false
            this.query.storeid = e.storeid
            this.storeName = e.storename
            if (waitsubmitorderinfo) {
              // 该门店有待提交订单，设置订单号
              !this.query.orderno && this.setOrderNo(waitsubmitorderinfo.orderno)
              this.getCount()
            } else {
              this.setOrderNo('')
              this.resetCount()
            }
          } else {
            this.errTip = '此门店不符合参与资格'
            this.showStoreTips = true
            this.$msg('此门店不符合参与资格')
            this.resetCount()
          }
        } else if (res.return_code === -1) {
          // 其他异常，如没有一物一码权限
          this.errTip = res.return_msg
          this.showStoreTips = true
          this.resetCount()
        }
      } catch (error) {
        if (error.return_code === -1) {
          // 其他异常，如没有一物一码权限
          this.errTip = error.return_msg
          this.showStoreTips = true
          this.resetCount()
        } else {
          this.errTip = '此门店不符合参与资格'
          this.showStoreTips = true
          this.$msg('此门店不符合参与资格')
          this.resetCount()
        }
      }
    },
    // #endif
    handleSubmit() {
      // #ifdef MP-SALE
      if (!this.query.storeid || this.showStoreTips) return this.$msg('请选择代报门店')
      // #endif
      // 编辑模式不需要验证商品登记
      if (!this.isEdit && !this.info.totallogisticscode) {
        return this.$msg('请登记团购商品')
      }
      if (this.showFormBox) {
        this.$refs.uForm.validate(valid => {
          if (valid) {
            const r = this.validateForm()
            if (!r.isValid) {
              return this.$msg(r.message)
            }
            this.showTips({
              type: 'submit',
              content: '确认提交吗？'
            })
          }
        })
      } else {
        this.showTips({
          type: 'submit',
          content: '确认提交吗？'
        })
      }
    },
    async submitInfo() {
      // #ifdef MP-RETAIL
      let subscriberesult = {}
      if (!this.isEdit && this.subscribeSettings.isopen) {
        subscriberesult = await this.requestSubscribeMsg([this.noticeTempId])
      }
      if (!this.isEdit) {
        await this.requestSubscribeMsg([this.noticeTempId])
      }
      // #endif
      if (this.btnLoading) return
      this.btnLoading = true
      try {
        // 编辑模式使用 EditOrder 接口，新增模式使用 SubmitOrder 接口
        const apiMethod = this.isEdit ? apiEditOrder : apiApply
        const res = await apiMethod({ ...this.form, ...this.query })
        if (this.$ck(res)) {
          this.$msg(this.isEdit ? '编辑成功' : '提报成功', { icon: 'success' })
          this.$store.commit('updateRefreshTag', true)
          // #ifdef MP-RETAIL
          if (!this.isEdit && this.subscribeSettings.isopen) {
            this.reportNotice({
              subscriberesult,
              type: 11,
              orderid: this.query.orderno
            })
          }
          // #endif
          setTimeout(() => {
            if (this.isEdit) {
              // 编辑完成返回详情页
              uni.navigateBack()
            } else {
              // 新增完成跳转到详情页
              let params = `orderno=${this.query.orderno}`
              // #ifdef MP-SALE
              params += `&storeid=${this.query.storeid}`
              // #endif
              uni.redirectTo({
                url: `./order-detail?${params}`
              })
            }
          }, 1500)
        }
      } catch (error) {
        this.$msg(error.return_msg)
      } finally {
        this.btnLoading = false
      }
    },
    validateForm() {
      if (this.settings.groupbuyername.required && !this.form.groupbuyername?.trim()) {
        return { isValid: false, message: '请输入团购人姓名' }
      }
      if (this.settings.groupbuyerphone.required && !this.form.groupbuyerphone?.trim()) {
        return { isValid: false, message: '请输入手机号码' }
      }
      if (this.settings.groupbuyerphone.required && !this.$u.test.mobile(this.form.groupbuyerphone)) {
        return { isValid: false, message: '请输入正确的手机号码' }
      }
      if (this.settings.orderpicture.required && (!this.form.orderpicture || !this.form.orderpicture.length)) {
        return { isValid: false, message: '请上传照片' }
      }
      if (this.settings.remark.required && !this.form.remark?.trim()) {
        return { isValid: false, message: '请填写订单备注' }
      }

      return { isValid: true, message: '' }
    },
    handleCodeRecord() {
      this.showCodeRecord = true
    },
    handleScan() {
      let url = `./scan?activityid=${this.query.activityid}&orderno=${this.query.orderno || ''}&actiontype=0`
      // #ifdef MP-SALE
      if (!this.query.storeid || this.showStoreTips) return this.$msg('请选择代报门店')
      url += `&storeId=${this.query.storeid}`
      // #endif
      this.$navPage(url)
    },
    cancelCb() {
      this.$store.commit('updateRefreshTag', true)
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/common.scss';
@import './styles/apply.scss';
</style>
