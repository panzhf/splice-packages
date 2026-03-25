<template>
  <view class="progress-steps">
    <view class="steps-container">
      <view class="progress-line" :style="{ width: progressLineWidth }"></view>
      <view
        v-for="(step, index) in steps"
        :key="index"
        :class="[
          'step-item',
          {
            active: currentStep >= index + 1,
            current: currentStep === index + 1
          }
        ]"
      >
        <view class="step-circle">
          <text class="step-number">{{ index + 1 }}</text>
        </view>
        <text class="step-text">{{ step }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProgressSteps',
  props: {
    currentStep: {
      type: Number,
      default: 1,
      validator: value => value >= 1 && value <= 4
    },
    orderstatus: {
      type: Number,
      default: 0
    },
    forwardToGroup: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultSteps: ['提交订单', '转发到群', '订单审核', '红包到账']
    }
  },
  computed: {
    steps() {
      // 当 orderstatus 为 5 时，最后一步文案改为"审核不通过"
      const arr = this.defaultSteps.filter(item => {
        return this.forwardToGroup || item !== '转发到群'
      })
      if (this.orderstatus === 5) {
        arr[arr.length - 1] = '审核不通过'
      }
      return arr
    },
    progressLineWidth() {
      // 计算连接线宽度
      // 由于每个步骤宽度为25%，连接线应该0延伸到当前步骤圆圈中心
      const totalIntervals = this.steps.length // 3个间隔
      let progress = 0
      let halfStart = (0.5 / (totalIntervals + 1)) * 100
      if (this.currentStep === 1) {
        progress = halfStart
      } else {
        progress = halfStart + ((this.currentStep - 1) / totalIntervals) * 100
      }
      if (this.currentStep === totalIntervals) {
        progress = 100
      }
      return `${progress}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-steps {
  padding: 40rpx;

  .steps-container {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    &::before {
      position: absolute;
      z-index: 1;
      top: 23rpx;
      right: 0;
      left: 40rpx;

      height: 6rpx;

      content: '';

      background: #ccc;
    }

    .progress-line {
      position: absolute;
      z-index: 1;
      top: 23rpx;
      left: 0rpx;

      height: 6rpx;

      transition: width 0.3s ease;

      background: #34c759;
    }

    .step-item {
      position: relative;
      z-index: 2;

      display: flex;
      align-items: center;
      flex-direction: column;

      width: 25%;

      .step-circle {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 48rpx;
        height: 48rpx;
        border: 2rpx solid #fff;
        margin-bottom: 15rpx;

        color: #aaaaaa;
        border-radius: 50%;
        background: #cccccc;

        .step-number {
          color: #ffffff;

          font-size: 24rpx;
          font-weight: bold;
        }
      }

      .step-text {
        text-align: center;

        color: #999;

        font-size: 28rpx;
        line-height: 1.3;
      }

      &.active {
        .step-circle {
          background: #34c759;
        }

        .step-number {
          color: #fff;
        }

        .step-text {
          color: #34c759;
        }
      }

      &.current {
        .step-circle {
          background: #34c759;
          box-shadow: 0 0 0 3rpx rgba(52, 199, 89, 0.15);
        }

        .step-number {
          color: #fff;
        }

        .step-text {
          color: #34c759;
        }
      }
    }
  }
}
</style>
