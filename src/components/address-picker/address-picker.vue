<template>
  <choose-view
    v-model="showPicker"
    mode="mutil-column-auto"
    :list="cityArray"
    label-name="name"
    child-name="childrens"
    value-name="id"
    :column-count="columnCount"
    :default-value="defaultValue"
    @confirm="confirm"
  />
</template>

<script>
import ChooseView from 'packages/components/address-picker/comps/choose-view.vue'
import { apigetaddresscode } from 'packages/api/address.js'
// #ifdef H5-ACT
import { getQuery } from 'packages/utils/function'
// #endif
export default {
  components: {
    ChooseView
  },
  props: {
    columnCount: {
      // 显示列数默认是4， 当地址库只有三级时，columnCount必须传3 ；当地址库为四级时，columnCount可以传 3和4
      type: Number,
      default: 4
    },
    addressLayer: {
      // 地址库：接口返回的地址库数据层级  只有三级（省市区）和四级（省市区街道），默认为四级（4） ，三级传 3
      type: Number,
      default: 4
    },
    value: Boolean,
    defaultRegon: {
      type: Array,
      default: () => [0]
    }
  },
  data() {
    return {
      cityArray: [],
      defaultValue: [0]
    }
  },
  computed: {
    showPicker: {
      get() {
        if (this.cityArray.length > 0) {
          this.findIndex(this.defaultRegon)
        }
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
    const param = {}
    // #ifdef H5-ACT
    const m = getQuery('m') || getQuery('memberlogin')
    if (m) param.memberlogin = m
    // #endif
    apigetaddresscode(param).then(res => {
      uni.hideLoading()
      if (this.$ck(res, true)) {
        const city = this.$toLowerKey(res.return_data || [], true)
        this.cityArray = Object.freeze(city)
        this.findIndex(this.defaultRegon)
      }
    })
  },
  methods: {
    findIndex(ids) {
      //  获取省市区街道在数组的下标
      let indexes = []
      let currentData = this.cityArray
      for (let i = 0; i < ids.length; i++) {
        let foundIndex = -1
        for (let j = 0; j < currentData.length; j++) {
          if (currentData[j].id === ids[i]) {
            foundIndex = j
            break
          }
        }
        if (foundIndex === -1) {
          break
        }
        indexes.push(foundIndex)
        currentData = currentData[foundIndex].childrens
      }
      if (indexes.length < 4 && this.addressLayer === 4) {
        // 有些地区没有四级，默认补足长度
        this.defaultValue = indexes.concat(Array(4 - indexes.length).fill(0))
      } else {
        this.defaultValue = indexes
      }
    },
    confirm(e) {
      // 截取
      const v = this.columnCount ? e.slice(0, this.columnCount) : e
      this.$emit('setAddress', v)
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
