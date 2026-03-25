<template>
  <view>
    <picker
      mode="multiSelector"
      name="region"
      :value="citysIndex"
      :range="cityArray"
      range-key="name"
      @columnchange="columChange"
      @change="onPickerChangeDiy"
    >
      <view class="picker-wrap">
        <view :class="['picker', 'empty', disabled ? 'disabled' : '']">
          <slot name="result" :region="region" />
        </view>
      </view>
    </picker>
  </view>
</template>

<script>
import { apigetaddresscode } from 'packages/api/address.js'
export default {
  data() {
    return {
      citysIndex: [0, 0, 0],
      cityArray: [],
      region: []
    }
  },
  created() {
    uni.showLoading({
      title: '加载中'
    })
    apigetaddresscode().then(res => {
      uni.hideLoading()
      if (this.$ck(res, true)) {
        let city = res.return_data
        let cityArray = [[], [], []]
        city.forEach(item => {
          cityArray[0].push(item)
        })
        cityArray[1] = city[0].childrens
        cityArray[2] = city[0].childrens[0].childrens
        this.cityArray = cityArray
      }
    })
  },
  methods: {
    columChange(v) {
      //省区索引
      let index = v.detail.column
      //值索引
      let value = v.detail.value
      if (index == 0) {
        this.$set(this.cityArray, 1, this.cityArray[0][value].childrens)
        this.$set(this.cityArray, 2, this.cityArray[0][value].childrens[0].childrens)
        this.citysIndex = [value, 0, 0]
      }
      //市改变时
      if (index == 1) {
        this.$set(this.cityArray, 2, this.cityArray[1][value].childrens)
        this.citysIndex[1] = value
      }
      if (index == 2) {
        this.citysIndex[2] = value
      }
    },
    onPickerChangeDiy(v) {
      let province = !isNaN(v.detail.value[0]) && v.detail.value[0] != '' ? v.detail.value[0] : 0
      let city = !isNaN(v.detail.value[1]) && v.detail.value[1] != '' ? v.detail.value[1] : 0
      let region = !isNaN(v.detail.value[2]) && v.detail.value[2] != '' ? v.detail.value : 0
      if (Array.isArray(region)) {
        region = region[2]
      }
      let s = this.cityArray[0][province]
      let shi = this.cityArray[0][province].childrens[city]
      let qu = this.cityArray[0][province].childrens[city].childrens[region]
      // 省市区
      this.region = [s.name, shi.name, qu.name]
      this.$emit('getAddress', { Province: s, City: shi, Area: qu })
    }
  }
}
</script>

<style lang="scss" scoped>
.picker-wrap {
  position: relative;
  // width: 175rpx;
  .empty {
    .iconjiantou {
      position: absolute;
      left: -140rpx;
      top: 140%;
      transform-origin: 50% 50%;
      transform: rotate(90deg) translateY(-50%);
      font-size: 10rpx;
    }
  }
  .picker {
    width: 95%;
    // position: relative;
    color: #333;
    font-size: 26rpx;
  }
  .ut-s {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    outline: 0 !important;
    word-break: break-all;
  }
  .iconjiantou {
    position: absolute;
    right: 0;
    top: 50%;
    transform-origin: 50% 0;
    transform: rotate(90deg) translateY(-50%);
    font-size: 10rpx;
  }
  .iconjiantou-country {
    right: 98rpx;
  }
}
</style>
