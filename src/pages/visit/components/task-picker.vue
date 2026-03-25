<template>
  <u-popup v-model="show" mode="bottom" border-radius="30" @close="handleClose">
    <view class="task-picker">
      <view class="picker-header fs-30 fw-bold">
        选择拜访任务 
      </view>
      <scroll-view class="task-list" scroll-y="true" :show-scrollbar="false">
        <view
          v-for="(item, index) in taskList"
          :key="index"
          class="task-item"
          @tap="handleSelect(item)"
        >
          <view class="task-info">
            <view class="task-name fs-28 fw-bold">{{ item.taskname }}</view>
            <view class="task-desc fs-24 c-6">{{ item.taskdesc }}</view>
          </view>
        </view>
        <view v-if="showNoneData" class="none-data">
          <NoneData :msg="noneDataMsg" />
        </view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script>
import NoneData from '@/components/nodata.vue'

export default {
  components: {
    NoneData
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    customerInfo: {
      type: Object,
      default: () => null
    },
    customerType: {
      type: Number,
      default: 0
    },
    taskList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: this.value
    }
  },
  watch: {
    value(val) {
      this.show = val
    },
    show(val) {
      this.$emit('input', val)
    }
  },
  computed: {
    showNoneData() {
      return this.taskList.length === 0
    },
    noneDataMsg() {
      return '暂无可执行的任务'
    }
  },
  methods: {
    handleSelect(task) {
      this.$emit('select', task)
    },
    handleClose() {
      this.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.task-picker {
  max-height: 80vh;
  min-height: 50vh;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;

  .picker-header {
    display: flex;
    justify-content: center;
    align-items: center; 
    padding: 30rpx 0 10rpx; 
    color: #3D3D3D; 
  }

  .task-list {
    max-height: 60vh;
    padding: 0 0 30rpx 20rpx;
    overflow: hidden;
    box-sizing: border-box;

    .task-item {
      padding: 30rpx 20rpx 30rpx 0;
      @include border-bottom(#e4e8fe); 
      .task-info {
        .task-name {
          color: #222;
          margin-bottom: 10rpx;
        }

        .task-desc {
          color: #666;
          word-break: break-all;
          white-space: pre-wrap;
        }
      }
    }

    .none-data {
      padding: 100rpx 0;
    }
  }
}
</style>

