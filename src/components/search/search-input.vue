<template>
  <view class="flex flex-middle flex-1">
    <view class="search-input flex flex-middle flex-1" :style="customStyle">
      <input
        v-model="val"
        class="search-value flex-1"
        placeholder-class="placeholder"
        :placeholder="placeholder"
        :maxlength="maxLength"
        @input="$emit('input', $event.target.value)"
        @confirm="handleSearch"
      />
      
      <!-- #ifdef MP-MEMBER -->
      <view
        v-show="val"
        class="icon iconfont icon-close2 fs-30 c-9 pt-30 pb-30 pl-30 pr-30"
        @tap="handleClearVal"
      ></view>
      <!-- #endif -->
      <!-- #ifndef MP-MEMBER -->
      <view
        v-show="val"
        class="icon iconfont icon-close-circle fs-30 c-9 pt-30 pb-30 pl-30 pr-30"
        @tap="handleClearVal"
      ></view>
      <!-- #endif -->
    </view>
    <view v-if="showSearchBtn" class="search-btn" :style="btnStyle" @tap="handleSearch">搜索</view>
  </view>
</template>

<script>
/*
父页面的调用：
<search-input v-model="keyValue" :placeholder="searchPlacehoder" @search="handleSearch"></search-input>
*/
export default {
  name: 'SearchInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入关键字'
    },
    maxLength: {
      type: Number,
      default: 100
    },
    showSearchBtn: {
      type: Boolean,
      default: true
    },
    customStyle: {
      type: String,
      default: ''
    },
    btnStyle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      val: ''
    }
  },
  computed: {},
  watch: {
    value(val) {
      this.val = val
    }
  },
  methods: {
    handleClearVal() {
      this.val = ''
      this.$emit('input', '')
      this.$emit('clearKeyword')
    },
    handleSearch() {
      this.$emit('search')
    },
    handleScan() {
      this.$emit('scan')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-input {
  background: #fff;
  padding: 0 0 0 32rpx;
  height: 76rpx;
  text-align: left;
  border-radius: 35rpx;
  line-height: 76rpx;
}
.search {
  &-value {
    flex: 1;
    display: block;
    line-height: 76rpx;
    height: 76rpx;
  }
  .icon-close-circle {
    padding: 20rpx;
  }
}
.search-btn {
  width: 120rpx;
  height: 76rpx;
  margin-left: 20rpx;
  text-align: center;
  line-height: 76rpx;
  background: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 35rpx;
}
</style>

