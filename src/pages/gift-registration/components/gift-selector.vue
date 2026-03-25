<template>
  <view class="gift-selector" :class="{ 'is-disabled': disabled }">
    <u-radio-group
      v-if="!supportMultiple" 
      :wrap="true"
      :value="radioValue"
      :active-color="activeColor"
      @input="handleRadioInput"
    >
      <u-radio v-for="option in options" :key="option.value" :name="option.value">
        <view class="option-label">
          {{ option.label }}
        </view>
      </u-radio>
    </u-radio-group>
    <u-checkbox-group v-else :wrap="true" @change="handleCheckboxChange">
      <u-checkbox
        v-for="option in checkboxOptions"
        :key="option.value"
        v-model="option.checked"
        :name="option.value"
        :active-color="activeColor"
      >
        <view class="option-label">
          {{ option.label }}
        </view>
      </u-checkbox>
    </u-checkbox-group>
  </view>
</template>

<script>
export default {
  name: 'GiftSelector',
  props: {
    value: {
      type: [String, Number, Array],
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    },
    supportMultiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    activeColor: {
      type: String,
      default: '#3246C3'
    }
  },
  data() {
    return {
      checkboxOptions: []
    }
  },
  computed: {
    radioValue() {
      if (this.supportMultiple) return ''
      return this.value ?? ''
    }
  },
  watch: {
    options: {
      handler() {
        this.buildCheckboxOptions()
      },
      immediate: true
    },
    value: {
      handler() {
        this.buildCheckboxOptions()
      },
      deep: true
    }
  },
  methods: {
    buildCheckboxOptions() {
      if (!this.supportMultiple || !this.options || !this.options.length) {
        this.checkboxOptions = []
        return
      }
      const selected = Array.isArray(this.value) ? [...this.value] : []
      this.checkboxOptions = this.options.map(opt => ({
        ...opt,
        checked: selected.includes(opt.value)
      }))
    },
    handleRadioInput(val) {
      if (this.disabled) return
      this.$emit('input', val)
    },
    handleCheckboxChange(e) {
      if (this.disabled) return
      // 优先用事件里的选中值（与表单 checkbox 一致），避免 v-model 未及时更新
      const fromEvent = e && e.detail && Array.isArray(e.detail.value) ? e.detail.value : null
      const selected = fromEvent !== null ? fromEvent : this.checkboxOptions.filter(o => o.checked).map(o => o.value)
      this.checkboxOptions.forEach(opt => (opt.checked = selected.includes(opt.value)))
      this.$emit('input', selected)
    },
    getValue() {
      if (this.supportMultiple) {
        return this.checkboxOptions.filter(o => o.checked).map(o => o.value)
      }
      return this.radioValue
    }
  }
}
</script>

<style lang="scss" scoped>
.gift-selector {
  width: 100%;
}
.option-label {
  padding-top: 14rpx;
  padding-bottom: 14rpx;
  width: 600rpx;
}

/* disabled 时通过 pointer-events 禁止点击，不使用 :disabled */
.gift-selector.is-disabled {
  pointer-events: none;
} 
</style>
