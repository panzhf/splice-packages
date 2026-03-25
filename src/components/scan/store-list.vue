<template>
  <u-popup v-model="show" mode="center" border-radius="8" width="600rpx" height="700rpx" :mask-close-able="false">
    <view class="box">
      <view v-for="(item, index) in list" :key="index" class="item flex">
        <view class="left">
          <view class="name">{{ item.storename }}</view>
          <view class="title">负责人</view>
        </view>
        <view class="right">
          <view class="btn" @click="handleSelectStore(item)">选择</view>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script>
import { getQuery } from 'packages/utils/function'
import { apiGetStoreList } from 'packages/api/scan'
export default {
  props: {
    value: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      list: []
    }
  },
  computed: {
    show: {
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
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.list = []
          this.getData()
        }
      }
    }
  },
  methods: {
    handleSelectStore(item) {
      this.$emit('SelectStore', item)
    },
    getData() {
      let query = {}
      /* #ifdef H5 */
      query = {
        openId: getQuery('openId') || getQuery('openid') || getQuery('openidN'),
        memberlogin: getQuery('m')
      }
      /* #endif */
      apiGetStoreList(query).then(res => {
        const d = this.$toLowerKey(res, true)
        if (this.$ck(d)) {
          let list = d.return_data || []
          if (!list.length) {
            return this.$msg('未找到门店')
          }
          this.list = list
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding: 0 30rpx;
  .item {
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eeeeee;
    &:last-child {
      border: none;
    }
    .left {
      .name {
        font-size: 28rpx;
        font-weight: bold;
      }
      .title {
        border: 1px solid #aaaaaa;
        border-radius: 16rpx;
        display: inline-block;
        font-size: 22rpx;
        padding: 0rpx 8rpx;
        margin-top: 6rpx;
      }
    }
    .right {
      .btn {
        width: 120rpx;
        height: 52rpx;
        background: linear-gradient(90deg, #ffa200 0%, #ffd461 100%);
        border-radius: 26rpx;
        color: #fff;
        text-align: center;
        line-height: 52rpx;
      }
    }
  }
}
</style>
