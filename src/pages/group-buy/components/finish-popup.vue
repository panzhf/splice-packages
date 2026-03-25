<template>
  <common-popup v-model="showDialog" type="confirm" title="结单提示" max-size @confirm="handleConfirm">
    <view class="over-info fs-32 fw-medium">
      <view class="mt-30">
        登记数量：
        <text class="primary-color fw-medium">{{ info.totaldeliveryamount }}</text>
      </view>
      <view class="mt-30 flex">
        <view class="flex-1">
          开瓶数量：
          <text class="primary-color fw-medium">{{ info.totalscannedamount }}</text>
        </view>
        <view class="flex-1">
          开瓶率：
          <text class="primary-color fw-medium">{{ info.scannedrate }}%</text>
        </view>
      </view>
      <view class="mt-30 fs-24 c-6">
        结单后不能再执行送货，退货操作。且奖品的发放也会根据结单时产生的数据为准。是否确定结单？
      </view>
    </view>
  </common-popup>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
export default {
  name: 'FinishPopup',
  mixins: [dialogMixin],
  props: {
    info: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
