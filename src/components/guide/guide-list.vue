<template>
  <view class="list-line flex flex-middle" @tap.stop="handleClick">
    <view class="list-line__value flex flex-1">
      <v-img
        v-if="!isAudit"
        :src="item.salerimg || defaultHeading"
        class="avatar shrink-0 mr-20"
        mode="scaleToFill"
        :size="90"
      />
      <view class="info flex-1">
        <view class="fs-30 fw-bold">{{ item.realname || '' }}</view>
        <view class="mt-10 fs-24 c-6">
          <text v-if="isAudit">手机号码：</text>
          {{ item.mobile || '' }}
        </view>
        <view v-if="isAudit" class="fs-24 c-6 mt-10">申请时间：{{ item.addtime || '' }}</view>
      </view>
    </view>
    <view class="list-line__result">
      <!--  审核状态（0：未审核 1：审核通过 2：审核未通过） -->
      <text v-if="isAudit" :class="[getStatusColor(2, item.checkstate)]">
        {{ item.checkstate | guideAuditStatusFilter }}
      </text>
      <!-- 账号状态 0未激活 1正常 2已禁用 4未激活已禁用 -->
      <text v-else :class="[getStatusColor(1, item.salerstate)]">
        {{ item.salerstate | guideStatusFilter }}
      </text>
    </view>

    <view class="list-line__more icon mdfont icon-mdfont-more c-3" />
  </view>
</template>
<script>
import { guideStatusFilter, guideAuditStatusFilter } from 'packages/filters'
export default {
  filters: { guideStatusFilter, guideAuditStatusFilter },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    isAudit: {
      // true 审核列表
      type: Boolean,
      default: false
    },
    defaultHeading: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick() {
      this.$emit('tap')
    },
    getStatusColor(type, v) {
      if (type === 1) {
        switch (v) {
          case 0:
            return 'primary-color'
          case 2:
            return 'error-color'
          case 4:
            return 'error-color'
          default:
            return 'c-2'
        }
      } else if (type === 2) {
        switch (v) {
          case 0:
            return 'primary-color'
          case 2:
            return 'error-color'
          default:
            return 'c-2'
        }
      }
      return ''
    }
  }
}
</script>
<style lang="scss" scoped>
.list {
  &-line {
    padding: 30rpx;
    background-color: #fff;
    border-radius: 10rpx;
    &__value {
      margin-right: 30rpx;
      .avatar {
        width: 90rpx;
        height: 90rpx;
        border-radius: 8rpx;
        overflow: hidden;
      }
    }
    &__result {
      text-align: right;
      font-size: 24rpx;
    }
    &__more {
      margin-left: 10rpx;
      &.icon-mdfont-more {
        font-size: 20rpx;
      }
    }
  }
}
</style>
