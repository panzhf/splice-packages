<template>
  <view class="visit-form" :class="{ disabled: disabled }">
    <view v-for="(field, index) in formFields" :key="index" class="collect-group">
      <view class="collect-label">
        <text v-if="field.required" class="required">*</text>
        {{ field.fieldname }}
      </view>
      <view v-if="field.fielddesc" class="field-desc word-break">{{ field.fielddesc }}</view>
      <!-- 单行文本 -->
      <view v-if="field.componenttype === 'text'" class="collect-control text-control">
        <input
          :value="localFormData[field.componentid]"
          placeholder="请输入"
          :maxlength="field.maxlength"
          class="collect-input"
          @input="updateFormData(field.componentid, $event.detail.value)"
        />
        <view v-if="field.maxlength" class="char-count">
          {{ getCharCount(field.componentid) }}/{{ field.maxlength }}
        </view>
      </view>
      <!-- 多行文本 -->
      <view
        v-if="field.componenttype === 'textarea'"
        class="collect-control textarea-control"
        :class="field.maxlength ? 'textarea-control-maxlength' : ''"
      >
        <textarea
          :value="localFormData[field.componentid]"
          @input="updateFormData(field.componentid, $event.detail.value)"
          placeholder="请输入"
          :maxlength="field.maxlength"
          class="collect-input textarea-input"
        />
        <view v-if="field.maxlength" class="char-count">
          {{ getCharCount(field.componentid) }}/{{ field.maxlength }}
        </view>
      </view>
      <!-- 图片 -->
      <view v-if="field.componenttype === 'image'" class="collect-control image-control">
        <visit-upload
          :value="localFormData[field.componentid]"
          @input="updateFormData(field.componentid, $event)"
          :max-length="field.maximagecount || 3"
          :enable-watermark="!!field.supportwatermark"
          :watermark-meta="watermarkMeta"
          size="100"
          multiple
        />
      </view>
      <!-- 单选项 -->
      <view
        v-if="field.componenttype === 'radio' && field.options && field.options.length > 0"
        class="collect-control radio-control"
      >
        <radio-group :data-index="index" class="radio-group mb-10" @change="handleRadioChange">
          <label v-for="(option, optIndex) in field.options" :key="optIndex" class="radio-label">
            <radio
              class="check-icon"
              :value="option.label"
              :checked="localFormData[field.componentid] === option.label"
              width="40rpx"
              color="#3246C3"
            />
            {{ option.label }}
          </label>
        </radio-group>
      </view>
      <!-- 多选项 -->
      <view
        v-if="field.componenttype === 'checkbox' && field.options && field.options.length > 0"
        class="collect-control checkbox-control mb-10"
      >
        <visit-checkbox
          :ref="`checkbox_${field.componentid}`"
          :field="{ ...field, value: localFormData[field.componentid] }"
        />
      </view>
      <!-- 日期 -->
      <view v-if="field.componenttype === 'date'" class="collect-control date-control">
        <picker
          style="width: 100%"
          mode="date"
          :value="localFormData[field.componentid]"
          @change="handleDateChange($event, field.componentid)"
        >
          <view class="picker mb-20 mt-10 flex">
            <view class="picker-value flex-1 c-2">
              {{ localFormData[field.componentid] || '请选择' }}
            </view>
            <view class="picker-arrow iconfont iconjiantou fs-20" />
          </view>
        </picker>
      </view>
      <!-- 视频 -->
      <view v-if="field.componenttype === 'video'" class="collect-control video-control">
        <visit-video-upload
          :value="localFormData[field.componentid]"
          @input="updateFormData(field.componentid, $event)"
        />
      </view>
    </view>
  </view>
</template>

<script>
import VisitUpload from './visit-upload.vue'
import VisitVideoUpload from './visit-video-upload.vue'
import VisitCheckbox from './visit-checkbox.vue'

export default {
  components: {
    VisitUpload,
    VisitVideoUpload,
    VisitCheckbox
  },
  props: {
    formFields: {
      type: Array,
      default: () => []
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    watermarkMeta: {
      type: Object,
      default: () => ({})
    },
    // 是否禁用表单字段
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localFormData: {}
    }
  },
  watch: {
    formData: {
      handler(newVal) {
        // 深度监听 formData 变化，同步到本地数据
        this.localFormData = this.$deepClone(newVal || {})
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 更新表单数据（不触发事件，避免频繁触发）
    updateFormData(key, value) {
      this.$set(this.localFormData, key, value)
    },
    // 获取完整的表单数据（在保存时调用）
    getFormData() {
      // 先同步所有 checkbox 的值到表单数据
      this.formFields.forEach(field => {
        if (field.componenttype === 'checkbox') {
          const ref = this.$refs[`checkbox_${field.componentid}`]
          // 如果是数组（多个 checkbox），取第一个
          const checkboxComponent = Array.isArray(ref) ? ref[0] : ref
          if (checkboxComponent && checkboxComponent.getValue) {
            const value = checkboxComponent.getValue()
            this.$set(this.localFormData, field.componentid, value)
          }
        }
      })
      // 返回深拷贝的表单数据
      return this.$deepClone(this.localFormData)
    },
    handleRadioChange(e) {
      if (this.disabled) return
      const index = e.currentTarget.dataset.index
      const field = this.formFields[index]
      const value = e.detail.value
      this.updateFormData(field.componentid, value)
    },
    handleDateChange(e, key) {
      if (this.disabled) return
      this.updateFormData(key, e.detail.value)
    },
    // 获取字符数
    getCharCount(componentId) {
      const value = this.localFormData[componentId]
      return value ? String(value).length : 0
    }
  }
}
</script>

<style lang="scss" scoped>
.visit-form {
  position: relative;

  .collect-group {
    padding: 30rpx 0 10rpx;
    @include border-bottom(#cccccc);
    &:first-child {
      padding-top: 10rpx;
    }

    .collect-label {
      color: 222;
      font-size: 30rpx;
      margin-bottom: 10rpx;

      .required {
        color: #ff6955;
        margin-right: 4rpx;
      }
    }

    .field-desc {
      font-size: 24rpx;
      color: #aaaaaa;
      margin-bottom: 10rpx;
    }

    .collect-control {
      position: relative;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      min-height: 80rpx;
      padding-left: 0;
      background: transparent;
      width: 100%;

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

      &.text-control {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .collect-input {
          flex: 1;
        }
      }

      &.textarea-control {
        position: relative;
        .collect-input {
          width: 100%;
        }

        .char-count {
          position: absolute;
          bottom: 10rpx;
          right: 0;
        }
      }
      .textarea-control-maxlength { 
        padding-bottom: 40rpx;
      }

      .collect-input {
        font-size: 30rpx;
        color: #222;
        background: transparent;
        border: none;

        &.textarea-input {
          min-height: 140rpx;
          padding: 20rpx 0;
        }
      }

      .char-count {
        font-size: 24rpx;
        color: #999;
        white-space: nowrap;
        flex-shrink: 0;
      }

      &.date-control {
        background: transparent;
        padding: 0;
        min-height: auto;
      }

      .picker {
        position: relative;
        z-index: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .picker-value {
          font-size: 28rpx;
          color: #222222;
        }

        .picker-arrow {
          color: #666666;
          transform: rotate(0deg);
        }
      }

      &.radio-control {
        background: transparent;
        padding: 0;
        margin-left: -10rpx;
      }

      .radio-group {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0;

        .radio-label {
          width: 100%;
          margin: 10rpx 0;
          word-break: break-all;
          font-size: 28rpx;
          color: #222;
        }

        .check-icon {
          transform: scale(0.7);
        }
      }

      &.checkbox-control {
        background: transparent;
        padding: 0;
        align-items: start;
        flex-wrap: wrap;
        width: 100%;
      }

      &.image-control {
        background: transparent;
        margin: 10rpx 0 20rpx;

        .upload-tip {
          width: 100%;
          margin-bottom: 10rpx;
          font-size: 26rpx;
          color: #666;
        }
      }
    }
  }
}
</style>
