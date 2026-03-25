<template>
  <view>
    <u-popup v-model="dialogVisible" mode="top" :mask-close-able="false">
      <view class="pop-box fs-28">
        <view class="lable-title">兑换方式</view>
        <view class="scarch-box mb40">
          <view :class="['scarch-item', paging.hgWay === -1 ? 'search-active' : '']" @click="handleSelectClassType(-1)">
            全部
          </view>
          <view :class="['scarch-item', paging.hgWay === 0 ? 'search-active' : '']" @click="handleSelectClassType(0)">
            纯积分
          </view>
          <view :class="['scarch-item', paging.hgWay === 1 ? 'search-active' : '']" @click="handleSelectClassType(1)">
            积分+现金兑换
          </view>
        </view>
        <!-- 隐藏弹窗类型切换，直接页面上切换 -->
        <!-- <view v-if="classList.length" class="lable-title">礼品分类</view>
        <scroll-view v-if="classList.length" scroll-y="true" class="scarch">
          <view class="scarch-box">
            <view
              :class="['scarch-item', paging.categoryId === 0 ? 'search-active' : '']"
              @click="handleSelectClass({ id: 0 })"
            >
              全部
            </view>
            <view
              v-for="item in classList"
              :key="item.id"
              :class="['scarch-item', paging.categoryId === item.id ? 'search-active' : '']"
              @click="handleSelectClass(item)"
            >
              {{ item.typename }}
            </view>
          </view>
        </scroll-view> -->
        <button type="primary" size="large" class="sub-button" @click="handleSubmit">确定</button>
      </view>
    </u-popup>
  </view>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    classList: {
      type: Array,
      default: () => []
    },
    paging: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogVisible: this.show
    }
  },
  watch: {
    dialogVisible(val) {
      this.$emit('update:show', val)
    },
    show(val) {
      this.dialogVisible = val
    }
  },
  methods: {
    handleSubmit() {
      this.dialogVisible = false
      this.$emit('submit')
    },
    handleSelectClass(item) {
      let query = JSON.parse(JSON.stringify(this.paging))
      query.categoryId = item.id
      this.$emit('query', query)
    },
    handleSelectClassType(val) {
      let query = JSON.parse(JSON.stringify(this.paging))
      query.hgWay = val
      this.$emit('query', query)
    }
  }
}
</script>

<style lang="scss" scoped>
.pop-box {
  padding: 25rpx 22rpx;
  .lable-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  .scarch-box {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 20rpx 20rpx;
    .scarch-item {
      /* #ifdef MP-CLOUDSHOP */
      box-sizing: border-box;
      /* #endif */
      border: 1px solid #aaaaaa;
      border-radius: 34rpx;
      height: 68rpx;
      line-height: 68rpx;
      min-width: 223rpx;
      text-align: center;
    }
    .search-active {
      background: #ffd461;
      font-weight: bold;
      border: none;
    }
  }
  .mb40 {
    margin-bottom: 40rpx;
  }
  .scarch {
    max-height: 300rpx;
  }
  .sub-button {
    margin-top: 60rpx;
    height: 80rpx;
    background: #ffd461;
    border-radius: 40rpx;
    line-height: 80rpx;
    font-size: 32rpx;
    color: #000;
    font-weight: bold;
  }
}
</style>
