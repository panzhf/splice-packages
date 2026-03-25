<template>
  <view>
    <steps
      :list="numList"
      mode="number"
      un-active-color="rgba(255, 255, 255, 0.5)"
      active-color="#fff"
      :current="value"
      :active-number-style="`color: ${color}`"
      active-text-style="color:#FFF"
      un-active-number-style="color:#fff"
      line-color="rgba(255, 255, 255, 0.5)"
    />
  </view>
</template>

<script>
import steps from './steps.vue'
export default {
  components: {
    steps
  },
  props: {
    value: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#ff7640'
    }
  },
  data() {
    return {
      numList: [
        {
          name: '确认参与'
        },
        {
          name: '上传照片'
        },
        {
          name: '等待审核'
        },
        {
          name: '获得奖励'
        }
      ]
    }
  }
}
</script>
