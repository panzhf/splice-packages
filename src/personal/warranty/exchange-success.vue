<template>
  <view class="container">
    <!-- 成功头部 -->
    <view class="success-header tx-c pt-40">
      <text class="iconfont icon-success success-icon"></text>
      <view class="success-title fs-36 mt-30">换新成功</view>
    </view>

    <!-- 换新结果信息 -->
    <view class="info-content">
      <view
        v-for="(block, blockIdx) in contentBlocks"
        :key="blockIdx"
        class="block c-3"
        :class="{ 'bd-e': blockIdx < contentBlocks.length - 1 }"
      >
        <view v-if="block.title" class="mb-20">{{ block.title }}</view>
        <view v-for="(row, rowIdx) in block.fields" :key="rowIdx" class="row flex fs-28 c-6 mt-10">
          <view class="left c-6">{{ row.label }}</view>
          <view class="right flex flex-1" :class="row.className">
            {{ getFieldValue(row.prop) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位，避免内容被固定按钮遮挡 -->
    <view class="bottom-footer-gap"></view>

    <!-- 底部按钮（固定） -->
    <view class="btn-wrap btn-wrap--fixed">
      <view class="btn-row flex">
        <view class="exchange-btn exchange-btn--plain flex-1 mr-20" @tap="goHome">返回首页</view>
        <view class="exchange-btn exchange-btn--primary flex-1" @tap="goRecord">查看换新记录</view>
      </view>
    </view>
  </view>
</template>

<script>
const STORAGE_KEY = 'WARRANTY_EXCHANGE_SUCCESS_RESULT'

export default {
  name: 'ExchangeSuccess',
  data() {
    return {
      result: {}
    }
  },
  computed: {
    contentBlocks() {
      return [
        {
          fields: [
            { label: '服务单号', prop: 'serviceno' },
            { label: '服务时间', prop: 'servicetime' }
          ]
        },
        {
          title: '旧产品',
          fields: [
            { label: '产品名称', prop: 'oldgoodsname' },
            { label: '质保码ID', prop: 'oldcodestr' },
            { label: 'SN码', prop: 'oldsmallserialnumber' }
          ]
        },
        {
          title: '新产品',
          fields: [
            { label: '产品名称', prop: 'newgoodsname' },
            { label: '质保码ID', prop: 'newcodestr' },
            { label: 'SN码', prop: 'newsmallserialnumber' }
          ]
        },
        {
          fields: [
            { label: '继承保修期', prop: 'inheritedwarranty', className: 'primary-color' },
            { label: '剩余保修期', prop: 'remainingdays', className: 'primary-color' }
          ]
        }
      ]
    },
    inheritedWarrantyRange() {
      const s = this.result.inheritedwarrantystarttime
      const e = this.result.inheritedwarrantyendtime
      if (!s && !e) return '-'
      return (s || '') + '~' + (e || '')
    }
  },
  onLoad() {
    let data = {}
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) data = JSON.parse(raw)
    this.result = { ...data }
  },
  onUnload() {
    uni.removeStorageSync(STORAGE_KEY)
  },
  methods: {
    getFieldValue(prop) {
      const v = this.result[prop]
      switch (prop) {
        case 'remainingdays':
          return (v ?? 0) + '天'
        case 'inheritedwarranty':
          return this.inheritedWarrantyRange
        default:
          return v || '-'
      }
    },
    goHome() {
      uni.reLaunch({ url: '/pages/index/index' })
    },
    goRecord() {
      uni.reLaunch({
        url: '/packages/src/personal/warranty/store-exchange?tab=1'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #fff;
  min-height: 100vh;
}

.success-header {
  margin-bottom: 50rpx;
  .success-icon {
    font-size: 110rpx;
    color: #58be6b;
  }
  .success-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.info-content {
  padding: 0 20rpx;
  margin: 20rpx;
  padding-bottom: 0;
  background: #f7f7f7;
  border-radius: 10px;
  .block {
    padding: 30rpx 0;
  }
}

.btn-wrap {
  padding: 20rpx;

  &--fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0; 
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  }
} 

.title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;

  &.bg {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      width: 60rpx;
      height: 8rpx;
      background: var(--theme-color, #ff7640);
      opacity: 0.5;
      border-radius: 4rpx;
      bottom: 0;
      left: 0;
    }
  }
}

.row {
  font-size: 28rpx; 
  color: #333333;

  .left {
    width: 200rpx; 
  }
}

.exchange-btn {
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;

  &--plain {
    border: 1rpx solid var(--theme-color, $uni-color-primary);
    color: var(--theme-color, $uni-color-primary);
    background: #fff;
  }

  &--primary {
    border: 1rpx solid var(--theme-color, $uni-color-primary);
    color: #fff;
    background: var(--theme-color, $uni-color-primary);
  }
}
</style>
