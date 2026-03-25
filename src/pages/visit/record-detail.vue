<template>
  <view class="page-visit detail-page">
    <!-- 客户信息 -->
    <customer-card
      :customer-info="recordInfo.customer"
      mode="detail"
    />

    <!-- 拜访历程 -->
    <view class="info-section">
      <view class="section-title">拜访历程</view>
      <view v-if="recordInfo.task" class="info-item">
        <view class="info-label">拜访任务：</view>
        <view class="info-value">{{ recordInfo.task.taskname || '--' }}</view>
      </view>
      <view class="info-item">
        <view class="info-label">拜访人：</view>
        <view class="info-value">{{ salesmanName }}</view>
      </view>
      <view class="info-item">
        <view class="info-label">抵达时间：</view>
        <view class="info-value">{{ recordInfo.arrivetime || '--' }}</view>
      </view>
      <view v-if="recordInfo.arrivetime" class="info-item">
        <view class="info-label">位置偏差：</view>
        <view class="info-value">{{ shouldShowDistance ? formatDistance(recordInfo.arrivedistance, '米') : '--' }}</view>
      </view>
      <view v-if="recordInfo.leavetime" class="info-item">
        <view class="info-label">离开时间：</view>
        <view class="info-value">{{ recordInfo.leavetime || '--' }}</view>
      </view>
      <view v-if="recordInfo.leavetime" class="info-item">
        <view class="info-label">位置偏差：</view>
        <view class="info-value">{{ shouldShowDistance ? formatDistance(recordInfo.leavedistance, '米') : '--' }}</view>
      </view>
      <view class="info-item">
        <view class="info-label">拜访用时：</view>
        <view class="info-value">{{ recordInfo.leavetime ? `${recordInfo.duration }分钟` : '进行中' }}</view>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="info-section">
      <view class="section-title">{{ formName || '表单内容' }}</view>
      <view v-for="(field, index) in formContent" :key="index" class="info-item info-col">
        <view class="info-label mb-10"> 
          {{ field.fieldname }}：
        </view>
        <view class="info-value">
          <!-- 图片字段 -->
          <view v-if="field.componenttype === 'image'" class="image-list">
            <template v-if="field.value && field.value.length > 0">
              <image
                v-for="(img, imgIndex) in field.value"
                :key="imgIndex"
                class="image-item"
                :src="img"
                mode="aspectFill"
                @tap="previewImage(img, field.value)"
              />
            </template>
            <view v-else>--</view>
          </view>
          <!-- 视频字段 -->
          <view v-else-if="field.componenttype === 'video'">
            <video v-if="field.value" :src="field.value" controls></video>
            <view v-else>--</view>
          </view>
          <view v-else-if="field.componenttype === 'checkbox'">
            <view v-if="field.value && field.value.length">{{field.value.join('、')}}</view>
            <view v-else>--</view>
          </view>
          <!-- 多行文本字段 -->
          <view v-else-if="field.componenttype === 'textarea'" class="textarea-value">{{ field.value || '--' }}</view>
          <!-- 文本字段 -->
          <view v-else>{{ field.value || '--' }}</view>
        </view>
      </view>
    </view>

    <!-- 评价信息 -->
    <view v-if="recordInfo.evaluatestatus" class="info-section">
      <view class="section-title">评价信息</view>
      <view class="info-item">
        <view class="info-label">评价结果：</view>
        <view class="info-value">{{ recordInfo.evaluateresult || '--' }}</view>
      </view>
      <view v-if="recordInfo.evaluateremark" class="info-item">
        <view class="info-label">备注：</view>
        <view class="info-value">{{ recordInfo.evaluateremark || '--' }}</view>
      </view>
    </view>
    <view v-else class="info-section">
      <view class="section-title">评价信息</view>
      <view class="info-item">
        <view class="info-label">评价状态：</view>
        <view class="info-value">待评价</view>
      </view>
    </view>

    <!-- 继续拜访按钮 -->
    <view 
      v-if="isVisiting"
      class="action-section-left" 
      @tap="handleContinueVisit"
    >
      <text>继续拜访</text>
    </view>
  </view>
</template>

<script>
import { apiGetVisitRecordDetail, apiGetTaskDetail } from 'packages/api/visit'
import { locationMixin } from './mixins'
import CustomerCard from './components/customer-card.vue'

export default {
  components: {
    CustomerCard
  },
  mixins: [locationMixin],
  data() {
    return {
      recordId: 0,
      recordInfo: {},
      formContent: [],
      formName: '' // 表单名称
    }
  },
  computed: {
    salesmanName() {
      if (this.recordInfo.salesman && this.recordInfo.salesman.salesmanname) {
        const name = this.recordInfo.salesman.salesmanname
        const no = this.recordInfo.salesman.salesmanno || ''
        return no ? `${name}(${no})` : name
      }
      return '--'
    },
    // 判断是否为拜访中状态（已抵达但未离开）
    isVisiting() {
      return !!(this.recordInfo.arrivetime && !this.recordInfo.leavetime)
    },
    // 判断是否显示位置偏差：customertype !== 2 时显示
    shouldShowDistance() {
      return !!(this.recordInfo.customer && this.recordInfo.customer.customertype !== 2 && this.recordInfo?.task?.distancelimit)
    }
  },
  onLoad(options) {
    // 全新功能：只认小写 recordid（兼容 id 仅用于页面能打开）
    this.recordId = options.recordid || options.id
  },
  onShow() {
    // 页面显示时刷新数据（避免首次加载时重复请求）
    this.getDetail()
  },
  methods: {
    async getDetail() {
      try {
        const res = await apiGetVisitRecordDetail({ recordid: this.recordId, id: this.recordId })
        if (this.$ck(res)) {
          const data = res.return_data
          this.recordInfo = data
          this.formContent = data.form.components
          this.formName = data.form?.formname || ''
        }
      } catch (error) {
        this.$msg('获取详情失败')
      }
    }, 
    // 预览图片
    previewImage(current, urls) {
      uni.previewImage({
        current: current,
        urls: urls
      })
    },
    // 继续拜访
    handleContinueVisit() {
      const customer = this.recordInfo.customer
      const task = this.recordInfo.task
      
      const customerId = customer?.customerid
      const taskId = task?.taskid
      
      if (!customerId || !taskId) {
        this.$msg('信息不完整，无法继续拜访')
        return
      }
      
      apiGetTaskDetail({ taskId, customerId }).then(res => {  
        if (this.$ck(res)) {
          // 任务存在，跳转到任务执行页面
          this.$navPage(`./task-execute?customerid=${customerId}&taskid=${taskId}`)
        } else {
          // 任务不存在或已失效
          this.$msg(res.return_msg)
        }
      }).catch(err => { 
        this.$msg(err.return_msg)
      })
        
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/detail.scss';

.required {
  color: #ff6955;
  margin-right: 4rpx;
}

.action-section-left {
  background-color: $uni-color-primary;
  border-radius: 40rpx;
  width: 710rpx;
  margin: 30rpx 20rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  color: #fff;
  font-size: 36rpx;
}
</style>

