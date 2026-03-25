<template>
  <view v-if="checkedList && checkedList.length > 0" class="visit-checkbox">
    <view 
      class="checkbox-item" 
      v-for="(option, optIndex) in checkedList" 
      :key="optIndex"
      @click="toggleCheck(optIndex)"
    >
      <u-checkbox :name="option.label" :value="option.checked" active-color="#3246C3" :disabled="disabled">
        {{ option.label }}
      </u-checkbox>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VisitCheckbox',
  props: {
    // 字段对象，包含 options、componentid 和 value
    field: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 组件内定义的 checked 状态数组
      checkedList: []
    }
  },
  created() {
    // 初始化时处理值和勾选状态
    this.initCheckedList()
  },
  methods: {
    // 初始化选中状态到 checkedList（根据 field.value 数组中是否包含对应的 label 值）
    initCheckedList() {
      const options = this.field?.options || []
      const selectedValues = this.field?.value || []
      const selectedArray = Array.isArray(selectedValues) ? selectedValues : []
      
      // 初始化 checkedList 数组
      this.checkedList = options
        .map(option => {
          const optionLabel = option?.label || ''
          // 当 value 数组值中包含有对应的 label 值的时候 checked 为 true
          return {
            label: optionLabel,
            checked: selectedArray.includes(optionLabel)
          }
        })
        .filter(item => item.label)
    }, 
    // 获取当前选中的值（供父组件在保存时调用）
    getValue() {
      return this.checkedList
        .filter(option => option && option.checked)
        .map(option => option.label)
        .filter(label => label) // 过滤掉空值
    },
    // 重置为初始值（如果需要）
    reset() {
      this.initCheckedList()
    },
    // 切换勾选状态（点击整个区域时触发）
    toggleCheck(index) {
     this.checkedList[index].checked = !this.checkedList[index].checked
    }
  }
}
</script>

<style lang="scss" scoped>
.visit-checkbox {  
  margin-top: 10rpx;
  width: 320px;
  .checkbox-item { 
    margin-bottom: 20rpx;  
    width: 100%; 
  }
}
</style>
