<template>
  <!-- 质保服务组件 -->
  <view>
    <view v-if="warrantyData && warrantyData.goodsid" class="warranty-service" :style="bgStyle">
      <image v-if="bgImageUrl" :src="bgImageUrl" mode="widthFix" class="bg" />
      <!-- 产品图片 -->
      <view v-if="info.productImage && info.productImage.show && warrantyData.goodspic" class="product-image-wrapper">
        <image :src="warrantyData.goodspic" mode="widthFix" class="product-image" />
      </view>
      <!-- 质保信息字段列表 -->
      <template v-for="(item, index) in warrantyFields">
        <view v-if="isShowField(item)" :key="index" class="flex item-wrap">
          <view
            class="label"
            :style="{
              color: item.labelColor || '#666',
              fontWeight: item.labelFontWeight || 'normal',
              width: maxLabelwidth
            }"
          >
            {{ item.label }}：
          </view>
          <view
            class="content flex-1"
            :style="{
              color: item.valueColor || '#333',
              fontWeight: item.valueFontWeight || 'normal'
            }"
            @tap="handleFieldClick(item)"
          >
            <template v-if="item.value === 'goodsname'">
              {{ warrantyData | productNameFilter }}
            </template>
            <template v-else-if="item.value === 'goodsno'">
              {{ warrantyData | productNoFilter }}
            </template>
            <template v-else-if="item.value === 'marketprice'">
              ￥{{ warrantyData[item.value] | cashFixedTwo }}
            </template>
            <template v-else-if="item.value === 'warrantydays'">
              {{
                showCountdown
                  ? warrantyData.warrantystarttime
                    ? `${formatDate(warrantyData.warrantystarttime)} ~ ${formatDate(warrantyData.warrantyendtime)}`
                    : '-'
                  : '已过期'
              }}
            </template>
            <template v-else>
              {{ warrantyData[item.value] || '-' }}
            </template>
          </view>
        </view>
      </template>
      <!-- 倒计时组件 -->
      <view v-if="showCountdown" class="countdown-wrapper">
        <countdown-timer
          :end-time="warrantyData.warrantyendtime"
          :show-day="true"
          title="保修期剩余天数"
          :on-end="handleCountdownEnd"
          :theme-rgb="info.countdownTextColor"
        />
      </view>
      <!-- 质保信息登记入口 -->
      <view v-if="showRegistrationEntry" class="registration-entry" @tap="handleRegistrationClick">
        <image v-if="registrationImageUrl" :src="registrationImageUrl" mode="widthFix" class="registration-image" />
        <view v-if="info.registrationTip" class="registration-tip" :style="tipStyle">
          {{ info.registrationTip }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import { staticURL } from '@/config'
import { apiGetWarrantyServiceInfo, apiValidateRegisterEntry } from 'packages/api/warranty'
import { productNameFilter, productNoFilter } from 'packages/mixins/warranty-product'
import { cashFixedTwo } from 'packages/filters'
import CountdownTimer from './countdown-timer.vue'

export default {
  name: 'WarrantyService',
  components: {
    CountdownTimer
  },
  filters: {
    productNameFilter,
    productNoFilter,
    cashFixedTwo
  },
  props: {
    // 配置信息对象
    info: {
      type: Object,
      default() {
        return {
          bgUrl: '',
          bgColor: '',
          gap: 15,
          fontSize: 13, 
          // 倒计时组件主题：baseColor + 透明度（boxBgOpacity/boxBorderOpacity/secondaryOpacity，默认 0.2/0.3/0.7）
          countdownTheme: {},
          // 登记入口提示文案颜色（默认 #fff7ed 浅白）
          registrationTipColor: '#fff7ed',
          productImage: {
            show: false
          },
          warrantyFields: [],
          registrationImage: {
            imgUrl: ''
          },
          registrationTip: ''
        }
      }
    },
    // 防伪码（外部传入）
    code: {
      type: String,
      default: ''
    },
    // 活动ID（外部传入）
    codeId: {
      type: [String, Number],
      default: ''
    },
    // 防伪产品信息（外部传入）
    fwInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      // 接口返回的质保服务数据
      warrantyData: {}
    }
  },
  computed: {
    // 背景图片URL（带默认值）
    bgImageUrl() {
      return this.info.bgUrl
    },
    // 质保信息字段列表（计算属性）
    warrantyFields() {
      const fields = [...(this.info.warrantyFields || [])]

      // 如果已登记，添加保修期剩余字段
      if (this.warrantyData.isregistered) {
        fields.push({
          label: '保修期',
          value: 'warrantydays',
          labelColor: this.info.warrantyPeriod?.labelColor || '#000',
          labelFontWeight: this.info.warrantyPeriod?.labelFontWeight || 'normal',
          valueColor: this.info.warrantyPeriod?.valueColor || '#000',
          valueFontWeight: this.info.warrantyPeriod?.valueFontWeight || 'normal'
        })
      }

      return fields
    },
    // 最大标签宽度
    maxLabelwidth() {
      let max = this.warrantyFields.reduce((pre, cur) => (cur.label.length > pre ? cur.label.length : pre), 0)
      return `${(max + 1) * 2 * (this.info.fontSize || 13)}rpx`
    },
    // 背景样式
    bgStyle() {
      let s = []
      let info = this.info
      if (info.fontSize) {
        s.push(`font-size:${info.fontSize * 2}rpx;`)
      }
      // 背景颜色：优先使用配置值，否则使用默认值
      const bgColor = info.bgColor || ''
      s.push(`background-color:${bgColor};`)
      if (info.gap !== undefined) {
        s.push(`margin: 0 ${info.gap * 2}rpx`)
      }
      return s.join(';')
    },
    // 提示文案样式
    tipStyle() {
      let s = []
      if (this.info.fontSize) {
        s.push(`font-size:${this.info.fontSize * 2}rpx;`)
      }
      const tipColor = this.info.registrationTipColor || '#fff7ed'
      s.push(`color:${tipColor};`)
      return s.join(';')
    }, 
    // 登记入口图片URL（带默认值）
    registrationImageUrl() {
      return this.info.registrationImage.imgUrl || staticURL(true) + 'warranty/register-btn.png'
    },
    // 是否显示登记入口
    showRegistrationEntry() {
      const hasWarrantyCode = this.warrantyData.isregistered
      return !hasWarrantyCode && this.registrationImageUrl
    },
    // 是否显示倒计时
    showCountdown() {
      return (
        this.warrantyData.isregistered && this.warrantyData.warrantydays && parseInt(this.warrantyData.warrantydays) > 0
      )
    }
  },
  created() {
    this.getServiceInfo()
  },
  methods: {
    // 格式化日期为 yyyy-mm-dd
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('YYYY-MM-DD')
    },
    // 根据 code 查询质保服务信息
    async getServiceInfo() {
      const params = {}
      if (this.codeId) {
        params.scanID = this.codeId
      }
      apiGetWarrantyServiceInfo(params)
        .then(res => {
          if (this.$ck(res, true)) {
            const d = this.$toLowerKey(res, true)
            const data = d.return_data || {}
            this.warrantyData = {
              ...data,
              goodspic: this.fwInfo.fwproimgurl
            }
          }
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    },
    // 倒计时结束回调
    handleCountdownEnd() {
      // 倒计时结束后重新获取服务信息
      this.getServiceInfo()
    },
    // 判断字段是否显示
    isShowField(item) {
      // 只要配置了字段就显示，即使值为空也显示（显示"-"）
      return !!item && !!item.value
    },
    // 处理字段点击（服务热线可以点击拨打电话）
    handleFieldClick(item) {
      if (item.value === 'serviceline') {
        const phone = this.warrantyData.serviceline
        phone &&
          uni.makePhoneCall({
            phoneNumber: phone,
            fail: () => {
              this.$msg('拨打失败，请检查电话号码')
            }
          })
      }
    },
    // 处理登记入口点击
    async handleRegistrationClick() {
      // 调用校验接口，检查是否允许登记
      const params = {}
      if (this.codeId) {
        params.scanID = this.codeId
      }
      apiValidateRegisterEntry(params)
        .then(res => {
          if (this.$ck(res)) {
            const d = this.$toLowerKey(res, true)
            const data = d.return_data || {}
            // 只有当返回的 canregister 为 true 时，才允许跳转
            if (data.canregister) {
              // 跳转到质保登记表单页面，传递防伪码
              uni.navigateTo({
                url: `/packages/src/personal/warranty/register?codeid=${this.codeId}`
              })
            } else {
              // 如果不允许登记，可以显示提示信息
              this.$msg(data.message)
            }
          }
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixins.scss';
$prefix: warranty-service;
.#{$prefix} {
  border-radius: 8rpx;
  padding: 40rpx;
  position: relative;
  overflow: hidden;

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-image-wrapper {
    position: relative;
    margin-bottom: 30rpx;
    text-align: center;

    .product-image {
      max-width: 100%;
      height: auto;
    }
  }

  .item-wrap {
    position: relative;
    z-index: 1;
    align-items: flex-start;

    & + .item-wrap {
      margin-top: 20rpx;
    }

    .label {
      text-align: right;
      flex-shrink: 0;
      margin-right: 16rpx;
    }

    .content {
      text-align: left;
      overflow-wrap: break-word;
      word-break: break-all;
      flex: 1;
    }
  }

  .countdown-wrapper {
    position: relative;
    z-index: 1;
    margin-top: 40rpx; 
  }

  .registration-entry {
    position: relative;
    z-index: 1;
    margin-top: 40rpx;
    text-align: center;

    .registration-image {
      max-width: 100%;
      height: auto;
    }

    .registration-tip {
      margin-top: 20rpx;
      /* color 由 tipStyle 动态配置 */
      opacity: 0.7;
      line-height: 1.5;
    }
  }
}
</style>