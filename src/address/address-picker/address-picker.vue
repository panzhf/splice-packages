<template>
  <view>
    <picker
      mode="multiSelector"
      :value="citysIndex"
      :range="cityArray"
      range-key="name"
      @columnchange="columChange"
      @change="onPickerChangeDiy"
    >
      <view class="picker">
        <!-- <slot name="result" :region="region"></slot> -->
        <view class="picker-result" :style="customStyle">
          <view v-if="region[0]" class="title">{{ region[0] }} {{ region[1] }} {{ region[2] }}</view>
          <view v-else class="title placeholder">省、市、区 / 县</view>
        </view>
      </view>
    </picker>
  </view>
</template>

<script>
import { apigetaddresscode } from '../../api/address.js'
// #ifdef MP-GUIDE
import store from '@/store'
// #endif
// #ifdef MP-GUIDE || MP-DISTRIBUTION
import { uniLogin } from '../../utils/login.js'
// #endif
// #ifdef H5-ACT
import { getQuery } from '../../utils/function.js'
// #endif
export default {
  props: {
    customStyle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      citysIndex: [0, 0, 0],
      cityArray: [],
      region: []
    }
  },
  async created() {
    uni.showLoading({
      title: '加载中'
    })
    let param = {}
    // #ifdef MP-GUIDE
    if (store.state.mpInfo) {
      param = {
        mpappid: store.state.mpInfo.mpAppID,
        mpmemberlogin: store.state.mpInfo.mpMemberLogin,
        js_code: await uniLogin()
      }
    }
    // #endif
    // #ifdef MP-DISTRIBUTION
    param = {
      js_code: await uniLogin()
    }
    // #endif

    // #ifdef H5-ACT
    const memberlogin = getQuery('m') || getQuery('memberlogin')
    if (memberlogin) {
      param = { ...param, memberlogin }
    }
    // #endif

    apigetaddresscode(param).then(res => {
      uni.hideLoading()
      // #ifdef MP-CLOUDSHOP
      res = this.$toLowerKey(res, true)
      if (typeof res.return_data === 'string') {
        res.return_data = JSON.parse(res.return_data)
        res = this.$toLowerKey(res, true)
      }
      // #endif
      let city = res.return_data
      let cityArray = [[], [], []]
      city.forEach(item => {
        cityArray[0].push(item)
      })
      cityArray[1] = city[0].childrens
      cityArray[2] = city[0].childrens[0].childrens
      this.cityArray = cityArray
    })
  },
  methods: {
    columChange(v) {
      //省区索引
      let index = v.detail.column
      //值索引
      let value = v.detail.value
      if (index === 0) {
        this.$set(this.cityArray, 1, this.cityArray[0][value].childrens)
        this.$set(this.cityArray, 2, this.cityArray[0][value].childrens[0].childrens)
        this.citysIndex = [value, 0, 0]
      }
      //市改变时
      if (index === 1) {
        this.$set(this.cityArray, 2, this.cityArray[1][value].childrens)
        this.citysIndex[1] = value
      }
      if (index === 2) {
        this.citysIndex[2] = value
      }
    },
    onPickerChangeDiy(v) {
      let province = !isNaN(v.detail.value[0]) && v.detail.value[0] !== '' ? v.detail.value[0] : 0
      let city = !isNaN(v.detail.value[1]) && v.detail.value[1] !== '' ? v.detail.value[1] : 0
      let region = !isNaN(v.detail.value[2]) && v.detail.value[2] !== '' ? v.detail.value : 0
      if (Array.isArray(region)) {
        region = region[2]
      }
      let s = this.cityArray[0][province]
      let shi = this.cityArray[0][province].childrens[city]
      let qu = this.cityArray[0][province].childrens[city].childrens[region]
      // 省市区
      this.region = [s.name, shi.name, qu.name, s.id, shi.id, qu.id]
      this.$emit('getAddress', { Province: s, City: shi, Area: qu })
    }
  }
}
</script>

<style lang="scss" scoped>
.picker {
  // 需高度撑起
  height: 106rpx;
  line-height: 106rpx;
  color: #333;
  font-size: 28rpx;
}
.picker-result {
  .title {
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-all;
  }
  .placeholder {
    color: #ccc;
  }
}
</style>
