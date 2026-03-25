<template>
  <view v-if="isVisible" class="dialog">
    <view class="dialog-mask"></view>
    <view class="dialog-main">
      <view class="dialog-section">
        <view class="dialog-panel">
          <view class="content">
            <checkbox-group class="checkbox-group" @change="handlecheckboxChange">
              <label v-for="(item, index) in list" :key="index" class="checkbox-item">
                <checkbox :checked="handleCheckedItem(item)" :value="item" class="check-icon" color="#f02d17" />
                {{ item }}
              </label>
            </checkbox-group>
            <view class="empty">没有更多了</view>
          </view>
          <view class="dialog-footer">
            <view class="dialog-btn" @tap="handleClickCancel">取消</view>
            <view class="dialog-btn confirm" @tap="handleClickConfirm">确定</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  components: {},
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default() {
        return []
      }
    },
    selectedVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedList: [] // 已选列表
    }
  },
  watch: {
    isVisible(val) {
      if (val) {
        this.selectedList = this.selectedVal !== '' ? this.selectedVal.split('/') : []
      }
    }
  },
  methods: {
    // 选中状态
    handleCheckedItem(val) {
      return this.selectedList.includes(val)
    },
    // 取消
    handleClickCancel() {
      this.$emit('update:isVisible', false)
    },
    // 确定
    handleClickConfirm() {
      this.$emit('selectedList', this.selectedList)
      this.handleClickCancel()
    },
    // 多选框更改
    handlecheckboxChange(e) {
      this.selectedList = e.detail.value
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  position: relative;
  word-break: break-all;
  user-select: auto;
  z-index: 10000;
}
.dialog-mask,
.dialog-main {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  padding: 20rpx;
}
.dialog-mask {
  background-color: rgba(0, 0, 0, 0.7);
  pointer-events: auto;
}
.dialog-main {
  display: table;
  pointer-events: none;
}
.dialog-section {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
.dialog-panel {
  display: inline-block;
  width: 80%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  pointer-events: auto;
  padding: 20rpx;
}
.content {
  max-height: 400rpx;
  overflow-y: auto;
}
.checkbox-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .checkbox-item {
    width: 100%;
    padding: 20rpx 0;
    text-align: left;
    border-bottom: 1rpx dotted #999;
  }
}
.empty {
  padding: 28rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
.dialog-body {
  padding: 60rpx 68rpx;
  font-size: 32rpx;
  color: #333;
  line-height: 52rpx;
  max-height: 300px;
  overflow-y: auto;
}
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  vertical-align: middle;
  border-radius: 46rpx;
  text-align: center;
  font-size: 34rpx;
  color: #000;

  &.confirm {
    color: #dd2726;
  }
}
</style>
