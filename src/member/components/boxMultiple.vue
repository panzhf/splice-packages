<template>
  <view class="serviceAssembly">
    <view class="serviceAssembly-cover" @tap="getClose" />
    <view class="serviceAssembly-main">
      <template v-if="tipsObj.fieldtype == 3">
        <!-- 多选 -->
        <checkbox-group @change="checkboxChange">
          <label v-for="(item, index) in tipsObj.fieldoptionsd" :key="index" class="flex flex-middle mb-10">
            <view class="weui-cell__hd">
              <checkbox :value="item.name" :checked="item.check" />
            </view>
            <view class="weui-cell__bd">{{ item.name }}</view>
          </label>
        </checkbox-group>
      </template>
      <template v-else>
        <radio-group @change="radioChange">
          <label v-for="(item, index) in tipsObj.fieldoptionsd" :key="index" class="flex flex-middle mb-20">
            <view>
              <radio :value="item.name" :checked="item.check" />
            </view>
            <view class="ml-10">{{ item.name }}</view>
          </label>
        </radio-group>
      </template>
      <view class="btn text-center" @tap="getClose">确定</view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    tipsObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      value: '', //接收单选
      values: [] //接收多选
    }
  },
  methods: {
    getClose() {
      const data = this.tipsObj
      let arr = []
      if (data.fieldtype == 3) {
        if (JSON.stringify(this.values) == '[]') {
          data.fieldoptionsd.map(item => {
            if (item.check) {
              arr.push(item.name)
              data.text = arr
            }
          })
        } else {
          data.text = this.values
        }
      } else {
        if (!this.value) {
          data.fieldoptionsd.map(item => {
            if (item.check) {
              data.text = item.name
            }
          })
        } else {
          data.text = this.value
        }
      }
      this.$emit('clone', data)
    },
    radioChange(e) {
      this.value = e.detail.value
    },
    checkboxChange(e) {
      this.values = e.detail.value
    }
  }
}
</script>
<style lang="scss" scoped>
.serviceAssembly {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .serviceAssembly-cover {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    // display: none;
    z-index: 99999;
  }

  .serviceAssembly-main {
    width: 480rpx;
    // height: 197rpx;
    // opacity: 1;
    height: auto;
    max-height: 740rpx;
    overflow: hidden scroll;
    padding: 40rpx;
    // transition-duration: 300ms;
    // transform: translate3d(0, 0, 0) scale(1);
    // transition-property: transform, opacity;
    font-size: 16px;
    border-radius: 20rpx;
    background-color: #fff;
    color: #333;
    z-index: 99999;

    .btn {
      width: 150rpx;
      margin: 30rpx auto 0;
      padding: 10rpx;
      border-radius: 10rpx;
      color: #fff;
      background: red;
    }
  }
}
</style>

