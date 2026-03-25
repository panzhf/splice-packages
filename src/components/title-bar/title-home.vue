<template>
  <view class="titlebar" :style="style" @touchmove.stop="() => {}">
    <view v-if="isBack && more" class="back" @tap="handleBack" />
    <view class="title" :style="{ color: `${textcolor}` }">{{ title }}{{ TestFlag ? '--' + TestFlag : '' }}</view>
    <slot name="header" />
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    bgcolor: {
      type: String,
      default: ''
    },
    textcolor: {
      type: String,
      default: '#000'
    },
    // opacity: {
    //   type: Number,
    //   default: 1
    // },
    isBack: Boolean
  },
  data() {
    return {
      more: true,
      TestFlag: ''
    }
  },
  computed: {
    style() {
      // 顶部适配
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      let styles = []
      styles.push(`padding-top: ${statusBarHeight}px`)
      styles.push(`height: ${44 + statusBarHeight}px`)
      this.bgcolor && styles.push(`background: ${this.bgcolor}`)
      return styles.join(';')
    }
  },
  created() {
    // 是否有后续页面，允许返回
    const currentPages = getCurrentPages()
    this.more = currentPages.length > 1
    this.TestFlag = uni.getStorageSync('TestFlag') || ''
  },
  methods: {
    handleBack() {
      if (this.more) {
        uni.navigateBack()
      } else {
        uni.redirectTo({
          url: '/pages/index/index'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// page {
//   height: 100%;
// }
.titlebar {
  position: fixed;
  z-index: 300;
  top: 0;
  left: 0;

  box-sizing: border-box;
  width: 100%;
  height: 64px;
  padding: 20px 0 0;

  color: #000;
  .title {
    position: absolute;
    bottom: 0;
    left: 50%;

    overflow: hidden;

    max-width: calc(100% - 190px);
    height: 44px;

    transform: translateX(-50%);
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    // word-break: break-all;

    font-size: 16px;
    font-weight: 500;
    line-height: 44px;
  }
  .back {
    position: absolute;
    bottom: 0;
    left: 0;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    width: 44px;
    height: 44px;
  }

  .back::after {
    display: block;

    width: 20rpx;
    height: 20rpx;

    content: '';
    transform: rotate(45deg);

    border-bottom: #000 2px solid;
    border-left: #000 2px solid;
  }
}
</style>
