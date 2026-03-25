<template>
  <view class="page-visit task-execute-page">
    <!-- 客户信息 -->
    <customer-card :customer-info="customerInfo" mode="task">
      <template #action>
        <button v-if="!arriveInfo.arrived" class="arrive-btn primary" :disabled="arriving" @tap="handleArrive">
          <text class="iconfont iconqiandao fs-28"></text>
          抵达签到
        </button>
        <button v-else class="arrive-btn success" disabled>
          <text class="iconfont iconright fs-28"></text>
          已抵达
        </button>
      </template>
    </customer-card>

    <!-- 任务表单区域 -->
    <view class="form-section" :class="{ 'disabled-wrap': !arriveInfo.arrived || formSubmitted || leaveInfo.left }">
      <view class="form-title">
        {{ formName || '任务表单' }}
        <text v-if="!arriveInfo.arrived" class="section-desc">（抵达后解锁）</text>
      </view>

      <!-- 动态表单字段 -->
      <view class="form-content">
        <visit-form
          ref="visitForm"
          :form-fields="formFields"
          :form-data="formData"
          :watermark-meta="watermarkMeta"
          :disabled="!arriveInfo.arrived || formSubmitted || leaveInfo.left"
        />
        <view v-if="!formSubmitted" class="action-btn" :disabled="submitting" @tap="handleSubmitForm">提交</view>
        <view v-else class="action-btn" disabled>已提交</view>
      </view>
    </view>

    <!-- 离开签退区域 -->
    <view
      class="action-section-left"
      :class="{ disabled: !formSubmitted || leaveInfo.left || leaving }"
      @tap="handleLeave"
    >
      <text v-if="!leaveInfo.left">离开签退<text v-if="!formSubmitted || leaveInfo.left || leaving" class="fs-28">（提交表单后解锁）</text></text>
      <text v-else>已签退</text>
    </view>

    <!-- 错误提示框 -->
    <view v-if="showErrorDialog" class="error-dialog-container" @touchmove.stop="handleMove">
      <view class="error-dialog-content">
        <view class="error-icon-wrap">
          <text class="icon iconfont iconbaoxiaoshibai"></text>
        </view>
        <view class="error-title c-2 fs-32 fw-bold mt-10">{{ errorTitle }}</view>
        <view v-if="errorMessage" class="error-info c-6 mt-10 mb-50">
          <rich-text :nodes="errorMessage"></rich-text>
        </view>
        <view class="error-btn fs-30 primary-btn" @click="handleErrorDialogClose">知道了</view>
      </view>
    </view>
  </view>
</template>

<script>
import { locationMixin } from './mixins'
import { apiGetTaskDetail, apiArrive, apiSubmitForm, apiLeave } from 'packages/api/visit'
import VisitForm from './components/visit-form.vue'
import CustomerCard from './components/customer-card.vue'

export default {
  components: {
    VisitForm,
    CustomerCard
  },
  mixins: [locationMixin],
  data() {
    return {
      customerInfo: {},
      formFields: [],
      formData: {},
      formName: '', // 表单名称
      taskname: '', // 任务名称
      watermarkMeta: {
        salesmanname: ''
      },
      arriveInfo: {
        arrived: false,
        arrivetime: '',
        location: '',
        distance: 0
      },
      leaveInfo: {
        left: false,
        leavetime: '',
        location: '',
        distance: 0
      },
      formSubmitted: false,
      arriving: false,
      leaving: false,
      submitting: false,
      taskId: 0,
      customerId: 0,
      recordId: 0, // 拜访记录ID
      distanceLimit: 500, // 距离限制（米）
      durationLimit: 30, // 时长限制（分钟）
      // 错误提示框相关
      showErrorDialog: false,
      errorTitle: '',
      errorMessage: '',
      shouldGoBack: false, // 是否需要在关闭错误对话框后返回上一页
      // 返回拦截相关
      isSaving: false // 是否正在保存
      // 水印改为"按字段组件 supportwatermark 单独控制"，无需页面级开关
    }
  },
  onLoad(options) {
    // 全新功能：只认小写路由参数
    this.taskId = options.taskid
    this.customerId = options.customerid
    this.initData()
  },
  onShow() {
    // 页面显示时，根据任务状态启用/禁用返回拦截
    this.updateBackIntercept()
  },
  onUnload() {
    this.disableBackIntercept()
    // 如果任务未完成，尝试保存草稿
    // 注意：onUnload 中无法等待异步操作完成，直接调用接口（不等待结果）
    if (!this.formSubmitted && !this.leaveInfo.left && !this.isSaving) {
      this.saveFormDraft()
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      await this.getTaskDetail()
    },
    // 获取任务详情
    async getTaskDetail() {
      const res = await apiGetTaskDetail({ taskId: this.taskId, customerId: this.customerId })
      if (this.$ck(res)) {
        const data = res.return_data
        this.customerInfo = data.customer
        // 处理表单字段，解析 radio 和 checkbox 的 options
        const formFields = (data.form.components || []).map(field => {
          if (!field) return field

          const isOptionType = field.componenttype === 'radio' || field.componenttype === 'checkbox'
          if (!isOptionType) return field

          const processedField = { ...field }
          if (Array.isArray(field.options)) {
            processedField.options = field.options
              .map(opt => {
                if (typeof opt === 'string') {
                  try {
                    return JSON.parse(opt)
                  } catch (e) {
                    return null
                  }
                }
                return opt
              })
              .filter(opt => opt !== null)
          } else {
            processedField.options = []
          }
          return processedField
        })
        // 初始化表单数据（在字段处理完成后）
        this.initFormData(formFields)
        this.formName = data.form.formname
        this.recordId = data.recordid
        this.taskname = data.taskname

        this.arriveInfo = {
          arrived: !!data.arrivetime,
          arrivetime: data.arrivetime,
          location: null,
          distance: data.arrivedistance || 0
        }

        this.leaveInfo = {
          left: !!data.leavetime,
          leavetime: data.leavetime,
          location: null,
          distance: data.leavedistance || 0
        }

        this.formSubmitted = data.form.formstatus === 1

        this.distanceLimit = data.distancelimit
        this.durationLimit = data.durationlimit

        const userInfo = JSON.parse(uni.getStorageSync('currentUserInfo') || '{}')
        this.watermarkMeta = {
          salesmanname: userInfo.name || '',
          address: data.address || '',
          arriveDistance: this.formatDistance(data.arrivedistance || 0, '米')
        }
        // 初始化完成后，更新返回拦截状态
        this.updateBackIntercept()
      }
    },
    // 初始化表单数据
    initFormData(formFields) {
      const formData = {}
      formFields.forEach(field => {
        if (!field?.componentid) return

        const key = field.componentid
        const isArrayType = field.componenttype === 'image' || field.componenttype === 'checkbox'
        formData[key] = isArrayType ? (field.value || []) : (field.value || '')

        // 确保 checkbox 和 radio 字段有 options 数组
        if ((field.componenttype === 'checkbox' || field.componenttype === 'radio') && !Array.isArray(field.options)) {
          field.options = []
        }
      })
      this.formData = this.$deepClone(formData)
      this.formFields = formFields
    },
    // 抵达签到
    async handleArrive() {
      // customertype 为 2 时，不需要获取地理位置
      const needLocation = this.customerInfo.customertype !== 2
      
      let locationData = null
      if (needLocation) {
        // 先获取位置信息，不设置状态
        locationData = await this.getLocationAndAddress('signin')
        if (!locationData) {
          return
        }
      }
      
      // 位置信息获取成功后，在请求接口前才设置状态
      this.arriving = true
      try {
        const params = {
          taskId: this.taskId,
          customerId: this.customerId
        }
        
        // 根据是否需要位置信息，传递经纬度和地址
        if (needLocation && locationData) {
          const { location, address } = locationData
          params.latitude = location.latitude
          params.longitude = location.longitude
          params.address = address
        } else {
          // customertype 为 2 时，传空字符串
          params.latitude = 0
          params.longitude = 0
          params.address = ''
        }
        
        const res = await apiArrive(params)

        if (this.$ck(res, false)) {
          const recordId = res.return_data?.recordid
          if (!recordId) {
            this.handleApiError(res, 0)
          } else {
            this.$msg('签到成功', { icon: 'success' })
            setTimeout(async () => {
              await this.getTaskDetail()
            }, 1000)
          }
        } else {
          this.handleApiError(res, 0)
        }
      } catch (error) {
        this.handleApiError(error, 0)
      } finally {
        // 接口响应完成后，无论成功失败都恢复状态
        this.arriving = false
      }
    },
    // 获取表单数据（同步 checkbox 并返回完整数据）
    getFormData() {
      if (this.$refs.visitForm && this.$refs.visitForm.getFormData) {
        return this.$refs.visitForm.getFormData()
      }
      return this.formData
    },
    // 校验表单必填项
    validateForm(formData) {
      for (const field of this.formFields) {
        const value = formData[field.componentid]
        if (field.required && (Array.isArray(value) ? value.length === 0 : !value)) {
          // 根据字段类型显示不同的提示语
          let message = ''
          const fieldName = field.fieldname || ''
          
          switch (field.componenttype) {
            case 'image':
            case 'video':
              message = `请拍摄${fieldName}`
              break
            case 'text':
            case 'textarea':
              message = `请输入${fieldName}`
              break
            case 'date':
            case 'radio':
            case 'checkbox':
              message = `请选择${fieldName}`
              break
            default:
              message = `请输入${fieldName}`
          }
          
          this.$msg(message)
          return false
        }
      }
      return true
    },
    // 提交表单
    async handleSubmitForm() {
      // 获取最新的表单数据
      const formData = this.getFormData()

      if (!this.validateForm(formData)) {
        return
      }

      this.submitting = true
      try {
        const res = await apiSubmitForm({
          taskId: this.taskId,
          recordId: this.recordId,
          formData: JSON.stringify(formData),
          isDraftSave: 0
        })
        if (this.$ck(res)) {
          this.$msg('提交成功', { icon: 'success' })
          setTimeout(async () => {
            await this.getTaskDetail()
            this.updateBackIntercept()
          }, 1000)
        }
      } finally {
        this.submitting = false
      }
    },
    // 离开签退
    async handleLeave() {
      if (!this.formSubmitted || this.leaveInfo.left || this.leaving) {
        return
      }

      // customertype 为 2 时，不需要获取地理位置
      const needLocation = this.customerInfo.customertype !== 2
      
      let locationData = null
      if (needLocation) {
        // 先获取位置信息，不设置状态
        locationData = await this.getLocationAndAddress('signout')
        if (!locationData) {
          return
        }
      }
      
      // 位置信息获取成功后，在请求接口前才设置状态
      this.leaving = true
      try {
        const params = {
          taskId: this.taskId,
          recordId: this.recordId
        }
        
        // 根据是否需要位置信息，传递经纬度和地址
        if (needLocation && locationData) {
          const { location, address } = locationData
          params.latitude = location.latitude
          params.longitude = location.longitude
          params.address = address
        } else {
          // customertype 为 2 时，传空字符串
          params.latitude = 0
          params.longitude = 0
          params.address = ''
        }
        
        const res = await apiLeave(params)

        if (this.$ck(res, false)) {
          const recordId = res.return_data?.recordid
          if (!recordId || recordId === 0) {
            this.handleApiError(res, 1)
          } else {
            const data = res.return_data
            this.leaveInfo = {
              left: true,
              leavetime: data.leaveTime || data.leavetime,
              location: locationData?.location || null,
              distance: data.distance || data.leavedistance
            }
            this.$msg('签退成功', { icon: 'success' })
            this.disableBackIntercept()
            setTimeout(() => {
              uni.navigateBack()
            }, 1000)
          }
        } else {
          this.handleApiError(res, 1)
        }
      } catch (error) {
        this.handleApiError(error, 1)
      } finally {
        // 接口响应完成后，无论成功失败都恢复状态
        this.leaving = false
      }
    },
    // 保存表单草稿（返回时调用，异步）
    async saveFormDraft() {
      // 获取最新的表单数据
      const formData = this.getFormData()
      const res = await apiSubmitForm({
        taskId: this.taskId,
        recordId: this.recordId,
        formData: JSON.stringify(formData),
        isDraftSave: 1
      }) 
    },
    // 统一处理API错误
    handleApiError(error, action) {
      const errorData = error.return_data || {}
      const errorMsg = error.return_msg || ''
      const actionName = action === 0 ? '抵达' : '离开'

      // 处理距离超出限制错误
      if (errorData.distance) {
        this.showErrorDialog = true
        this.shouldGoBack = false
        this.errorTitle = '距离超出限制'
        this.errorMessage = `距离客户位置超出${errorData.distance}米，无法签到。请到指定位置后重新点击"${actionName}"`
        return
      }

      // 处理拜访时长不足错误
      if (errorData.durationlimit) {
        this.showErrorDialog = true
        this.shouldGoBack = false
        this.errorTitle = '拜访时长不足'
        this.errorMessage = `拜访时长限制：${errorData.durationlimit || 0}分钟 <br />当前已拜访时长：${
          errorData.duration || 0
        }分钟`
        return
      }

      // 其他错误情况
      this.showErrorDialog = true
      this.shouldGoBack = true
      this.errorMessage = errorMsg
    },
    // 处理错误对话框关闭
    handleErrorDialogClose() {
      this.showErrorDialog = false
      if (this.shouldGoBack) {
        // 延迟返回，确保对话框关闭动画完成
        setTimeout(() => {
          uni.navigateBack()
        }, 300)
      }
    },
    // 阻止弹窗背景滚动
    handleMove() {},
    // 更新返回拦截状态
    updateBackIntercept() {
      const shouldIntercept = this.arriveInfo.arrived && !this.formSubmitted && !this.leaveInfo.left
      if (shouldIntercept) {
        this.enableBackIntercept()
      } else {
        this.disableBackIntercept()
      }
    },
    // 启用返回拦截
    enableBackIntercept() {
      uni.enableAlertBeforeUnload({
        message: `您尚未完成${this.taskname}的拜访任务，是否确认返回？`
      })
    },
    // 禁用返回拦截
    disableBackIntercept() {
      uni.disableAlertBeforeUnload()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/task-execute.scss';

.disabled-wrap {
  opacity: 0.4;
  pointer-events: none;
}

.form-content {
  padding: 20rpx 0;
}

.error-dialog-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);

  .error-dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 540rpx;
    min-height: 300rpx;
    border-radius: 20rpx;
    background-color: #fff;
    animation: tanchuang 0.4s ease-in-out;

    .error-icon-wrap {
      padding-top: 80rpx;
      margin-bottom: 20rpx;
      .icon {
        font-size: 80rpx;
        color: #ff6955;
      }
    }

    .error-info {
      max-width: 480rpx;
      font-size: 28rpx;
      word-break: break-all;
      white-space: pre-line;
      text-align: center;
    }

    .error-btn {
      width: 320rpx;
      height: 72rpx;
      margin-bottom: 40rpx;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      justify-content: center;
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
