<template>
  <u-mask :show="showDialog" :zoom="false" :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }" z-index="100">
    <view class="expense-loading flex flex-middle flex-center flex-column text-center">
      <view class="mdfont icon-loading loading" />
      <view class="title fs-32 fw-bold mt-40 mb-20">数据处理中，请稍后...</view>
      <view class="tip fs-24 fw-medium c-6 mb-30">数据量越大，等待时间越长，可稍后在“报销记录”中查看结果</view>
      <view class="close-btn fs-32 fw-medium" @tap="handleClose">关闭提示</view>
    </view>
  </u-mask>
</template>

<script>
// 扫码报销使用，异步报销（新经销、业务帮帮）
import {
  apiExpenseTaskResult,
  apiExpenseTaskCheck,
  // #ifdef MP-DISTRIBUTION
  apiExpenseTaskCheckDelear
  // #endif
} from '@/api/expense'
import dialogMixin from 'packages/mixins/dialog'
export default {
  name: 'ExpenseLoading',
  mixins: [dialogMixin],
  props: {
    taskId: {
      type: Number,
      default: 0
    },
    mode: {
      type: String,
      default: 'store' // store: 门店 dealer: 经销商
    },
    targetId: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      timer: null,
      inTaskId: 0
    }
  },
  watch: {
    showDialog(val) {
      if (val) {
        if (this.taskId) {
          // 传入任务id说明是通过点击报销按钮触发
          this.timer = setInterval(() => {
            this.getTaskResult(this.taskId)
          }, 3000)
        }
      }
      // else {
      //   this.resetTimer()
      // }
    }
  },
  beforeDestroy() {
    this.resetTimer()
  },
  methods: {
    async init() {
      // 页面初始通过ref调用
      this.resetTimer()
      await this.checkTask()
      if (this.inTaskId) {
        this.getTaskResult(this.inTaskId)
        this.timer = setInterval(() => {
          this.getTaskResult(this.inTaskId, false)
        }, 30000)
      }
    },
    checkTask() {
      const o = {
        store: {
          api: apiExpenseTaskCheck,
          param: {
            storeid: this.targetId
          }
        },
        // #ifdef MP-DISTRIBUTION
        dealer: {
          api: apiExpenseTaskCheckDelear,
          param: {
            dealerid: this.targetId
          }
        }
        // #endif
      }
      return new Promise(resolve => {
        o[this.mode].api(o[this.mode].param).then(res => {
          if (res.return_code === 0 && res.return_data) {
            this.inTaskId = res.return_data?.taskid
            this.$emit('pending')
          } else {
            this.inTaskId = 0
            this.$emit('done')
          }
          resolve()
        })
      })
    },
    getTaskResult(taskid, isNavigate = true) {
      apiExpenseTaskResult({ taskid }).then(res => {
        if (this.$ck(res)) {
          const {
            return_data: { uploadfilestatus: status, errormessage: msg }
          } = res
          // 1.导入中 2.执行中 3.导入完成 4.导入失败
          if ([3, 4].includes(status)) {
            this.resetTimer()
            this.$emit('done') // 重置pending
            // 弹窗时，跳转报销结果页，交由页面处理
            isNavigate && this.$emit('success', { status, msg })
            // 重新进入，或关闭弹窗停留当前页，简单提示
            if (!isNavigate) {
              this.$emit('refresh')
              status === 3 ? this.$msg('报销成功', { icon: 'success' }) : this.$msg('报销失败')
            }
            this.showDialog = false
          }
        }
      })
    },
    resetTimer() {
      this.timer && clearInterval(this.timer)
      this.timer = null
    },
    handleClose() {
      this.resetTimer()
      this.timer = setInterval(() => {
        this.getTaskResult(this.taskId, false)
      }, 30000)
      this.$emit('refresh')
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: expense-loading;
.#{$prefix} {
  position: fixed;
  padding: 0 60rpx;
  background-color: #fff;
  @include wh(580rpx, 442rpx);
  @include round(15rpx);
  @include hv-cen;
  @include box;
  .loading {
    color: $uni-color-primary;
    font-size: 56rpx;
    animation: loading 2s linear infinite;
  }
  .title,
  .close-btn {
    color: #000;
  }
  .tip {
    line-height: 40rpx;
  }
  .close-btn {
    @include whl(260rpx, 68rpx, 64rpx);
    @include round(34rpx);
    border: 1px solid #aaa;
  }
}
@keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
