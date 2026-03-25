<template>
  <view class="upload-voucher">
    <view class="section-title">
      <text v-if="required" class="required">*</text>
      <text>请上传销售凭证{{ required ? '(必填)' : '' }}</text>
    </view>

    <view class="upload-area">
      <upload v-model="localImages" :max-length="maxLength" :size="130" />
    </view>
  </view>
</template>

<script>
import upload from 'packages/components/upload/upload'

export default {
  name: 'UploadVoucher',
  components: {
    upload
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    required: {
      type: Boolean,
      default: true
    },
    maxLength: {
      type: Number,
      default: 3
    }
  },
  computed: {
    localImages: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    value: {
      handler(newVal) {
        // 同步外部数据变化
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-voucher {
  margin-bottom: 20rpx;

  background: #fff;
  margin: 0 20rpx;
  border-radius: 10rpx;

  .section-title {
    padding: 30rpx 30rpx 20rpx;

    color: #333;

    font-size: 30rpx;
    font-weight: bold;

    .required {
      margin-right: 4rpx;

      color: #ff5235;
    }
  }

  .upload-area {
    padding: 0 30rpx 30rpx;
  }
}
</style>
