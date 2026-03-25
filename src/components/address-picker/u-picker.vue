<template>
  <u-select
    v-model="showPicker"
    mode="mutil-column-auto"
    :list="cityArray"
    label-name="name"
    child-name="childrens"
    value-name="id"
    @confirm="confirm"
  />
</template>

<script>
import { apigetaddresscode } from 'packages/api/address.js'
export default {
  props: {
    value: Boolean
  },
  data() {
    return {
      cityArray: []
    }
  },
  computed: {
    showPicker: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
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
        this.cityArray = this.removeEmptyChildrens(city)
      }
    })
  },
  methods: {
    removeEmptyChildrens(data) {
      return data.map(item => {
        const newItem = { ...item }
        if (newItem.childrens && newItem.childrens.length > 0) {
          newItem.childrens = this.removeEmptyChildrens(newItem.childrens)
        }
        if (newItem.childrens && newItem.childrens.length === 0) {
          delete newItem.childrens
        }
        return newItem
      })
    },
    confirm(e) {
      this.$emit('setAddress', e)
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
