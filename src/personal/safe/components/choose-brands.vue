<template>
  <view class="page-brand bg-f">
    <view v-if="brandList.length" class="brand-box">
      <view class="brand-select">请选择你要注销的品牌</view>
      <view v-for="(item, index) in brandList" :key="index" class="brand-item" @tap="handleSelect(item)">
        <view class="brand flex flex-middle">
          <image
            class="brand-avatar shrink-0"
            :src="item.memberloginheadpath ? item.memberloginheadpath : brandHeadDefault"
            mode="scaleToFill"
          />
          <view class="brand-info flex-1">
            <view class="name ellipsis">
              {{ item.memberloginname }}
            </view>
            <view class="fs-24 c-8">{{ item.companyname }}</view>
          </view>
          <text class="icon iconfont shrink-0 mr-40 fs-40" :class="item.checked ? 'icon-checked' : 'icon-unchecked'" />
        </view>
      </view>
    </view>
    <view v-if="brandList.length" class="safe-btns flex">
      <button class="safe-btn continue-btn" :disabled="disabled" @tap="handleNext">下一步</button>
    </view>
    <view class="blank-height" />
  </view>
</template>

<script>
import { getBrandList } from '@/utils/barnd'
export default {
  name: 'ChooseBrands',
  data() {
    return {
      brandList: []
    }
  },
  computed: {
    choosedList() {
      return this.brandList.filter(item => item.checked)
    },
    disabled() {
      return this.choosedList.length === 0
    }
  },
  mounted() {
    this.fetchBrandList()
  },
  methods: {
    handleSelect(item) {
      item.checked = !item.checked
    },
    async fetchBrandList() {
      // 获取品牌商信息
      let data = await getBrandList()
      if (!data) return
      const { totalcount, list } = data
      if (totalcount === 0) return this.$msg('品牌数量为0！')
      if (totalcount === 1) {
        this.$emit('setStep', 2)
        this.$emit('brands', list)
        return
      }
      this.brandList = list.map(item => {
        return { ...item, checked: false }
      })
    },
    handleChoose(item) {
      this.chooseValue = item.index
      this.reason = item.value
    },
    handleNext() {
      if (this.choosedList.length === 0) return
      this.$emit('reasonBtnBack', true)
      this.$emit('setStep', 2)
      this.$emit('brands', this.choosedList)
    }
  }
}
</script>

<style lang="scss" scoped>
.brand-box {
  padding: 0 54rpx;
  .brand-select {
    padding: 80rpx 0 60rpx;
    color: #000;
    text-align: center;
    font-size: 32rpx;
  }
  .brand-item {
    margin-bottom: 30rpx;
    .brand {
      width: 640rpx;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 62rpx;
      height: 124rpx;
      background: #fff;
      .brand-avatar {
        margin: 0 26rpx 0 40rpx;
        width: 68rpx;
        height: 68rpx;
        border-radius: 100%;
      }
      .brand-info {
        margin-right: 40rpx;
        text-align: left;
        width: 380rpx;
        .name {
          font-size: 32rpx;
          color: #2a2a2a;
          font-weight: 700;
        }
        .text {
          font-size: 24rpx;
          color: #888;
        }
      }
    }
    .icon-checked {
      color: #ff9933;
    }
    .icon-unchecked {
      color: #cccc;
    }
  }
}
</style>
