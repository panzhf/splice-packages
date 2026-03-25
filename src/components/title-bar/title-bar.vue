<template>
  <view :style="wrapperHeight">
    <view
      v-if="!type"
      :class="['titlebar', isSettle == 2 ? 'settle' : isSettle == 1 ? 'bg-settle' : '']"
      :style="style + `;background-color:rgba(0,0,0,${opacity})`"
      @touchmove="() => {}"
    >
      <view bind:tap="handleBack" :class="['back', backColor ? backColor : '']" @tap="handleBack" />
      <!-- isSettle == 2 订单详情需要加上图标  默认不修改原本的 -->
      <view
        :style="{ flexDirection: isSettle == 2 ? 'row' : 'column' }"
        :class="['title', titleColor ? 'backcolor' : '']"
      >
        <slot name="iconHeader" />
        {{ title }}
      </view>
      <slot name="header" />
    </view>

    <template v-if="type === 'detail'">
      <view v-if="isShowInform" class="inform" :style="{ height: statusBarHeight }" />
      <view
        :style="style + `;background-color: ${bgcolor}`"
        :class="['titlebar2', showNavTitle && !isTransparent ? 'bgf' : '']"
        @touchmove="() => {}"
      >
        <view class="back-box" :class="iconMode ? 'mode-' + iconMode : ''">
          <view class="left" @tap="handleBack">
            <text class="iconfont iconjiantou1" />
          </view>
          <view class="right" @tap="handleHome">
            <text class="iconfont iconshouye-miaobianSVG" />
          </view>
        </view>
        <view v-if="showNavTitle" class="title" :style="{ color: textcolor }">{{ title }}</view>
        <slot name="header" />
      </view>
    </template>

    <template v-if="type === 'custom'">
      <view class="titlebar custom-content" :style="style + `;background-color: ${bgcolor}`" @touchmove.stop="() => {}">
        <view class="back-custom-box" @tap="handleHome">
          <text class="iconfont iconshouye-miaobianSVG" />
        </view>
        <view class="custom-title" :style="{ color: `${textcolor}` }">{{ title }}</view>
        <slot name="header" />
      </view>
    </template>
  </view>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    opacity: {
      type: Number,
      default: 1
    },
    type: {
      type: String,
      default: ''
    },
    showNavTitle: {
      type: Boolean,
      default: false
    },
    isTransparent: Boolean, // 导航栏透明
    backColor: {
      type: String,
      default: ''
    },
    titleColor: {
      type: Boolean,
      default: false
    },
    isCustomContent: {
      type: Boolean,
      default: false
    },
    bgcolor: {
      type: String,
      default: ''
    },
    textcolor: {
      type: String,
      default: '#000'
    },
    bgPic: {
      type: String,
      default: ''
    },
    isSettle: {
      // 确认订单需要改变头部颜色 默认 0 不改变原本的  1 订单过来变白色   2 门店兑奖需要变成黄色
      type: Number,
      default: 0
    },
    backHome: {
      // 点击返回跳回主页
      type: Boolean,
      default: false
    },
    showPlaceholder: Boolean, // 顶部占位，开启时最外层view有高度防止坍塌
    iconMode: {
      type: String,
      default: '' // 左侧图标：1、透明底白色字无分隔线
    }
  },
  data() {
    return {
      more: true
    }
  },
  computed: {
    statusBarHeight() {
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      return `${statusBarHeight}px`
    },
    style() {
      const statusBarHeight = Number(this.statusBarHeight.replace('px', ''))
      let style = []
      style.push(`padding-top:${statusBarHeight}px`)
      style.push(`height:${44 + statusBarHeight}px`)
      if (this.bgPic) {
        style.push(`background-image:url(${this.bgPic})`)
        style.push(`background-size:100% auto`)
      }
      return style.join(';')
    },
    wrapperHeight() {
      const statusBarHeight = Number(this.statusBarHeight.replace('px', ''))

      return this.showPlaceholder ? `height: ${44 + statusBarHeight}px;` : ''
    }
  },
  created() {
    // 是否有后续页面，允许返回
    const currentPages = getCurrentPages()
    this.more = currentPages.length > 1
  },
  methods: {
    handleBack() {
      if (this.more && !this.backHome) {
        uni.navigateBack()
      } else {
        this.handleHome()
      }
    },
    handleHome() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// page {
//   height: 100%;
// }
view {
  box-sizing: border-box;
}
.inform {
  background-color: #fff;
}
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
    left: 44px;

    display: flex;
    overflow: hidden;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    width: calc(100% - 88px);
    height: 44px;

    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    // word-break: break-all;

    color: #fff;

    font-size: 36rpx;
  }
  .backcolor {
    color: #000;
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

    border-bottom: #fff 2px solid;
    border-left: #fff 2px solid;
  }
  .black::after {
    display: block;

    width: 20rpx;
    height: 20rpx;

    content: '';
    transform: rotate(45deg);

    border-bottom: #000 2px solid;
    border-left: #000 2px solid;
  }
}
.settle {
  // background: $bg-color !important;
  background: var(--theme-color, $bg-color) !important;
}
.bg-settle {
  background: #fff !important;
}
.titlebar2 {
  position: fixed;
  z-index: 300;
  top: 0;
  left: 0;

  box-sizing: border-box;
  width: 100%;
  height: 64px;
  padding: 20px 0 0;

  transition: background-color 1s;

  color: #000;
  .back-box {
    // padding: 7px 0px;
    position: absolute;
    bottom: 7px;
    left: 7px;

    display: flex;

    width: 87px;
    height: 32px;

    border: 1px solid #f3f3f3;
    border-radius: 16px;
    background-color: rgba(255, 255, 255, 0.7);

    line-height: 30px;
    &::after {
      position: absolute;
      top: 7px;
      left: 50%;

      width: 1px;
      height: 18px;

      content: '';

      background: #f3f3f3;
    }
    &.mode-1 {
      border: none;
      background-color: transparent;
      color: #fff;
      &::after {
        content: none;
      }
    }
    .left,
    .right {
      display: flex;
      align-items: center;
      flex: 1;
      justify-content: center;
      .iconjiantou1 {
        transform: rotate(180deg);

        font-weight: 600;
      }
      .iconshouye-miaobianSVG {
        font-weight: 600;
      }
    }
  }
  .title {
    position: absolute;
    bottom: 0;
    left: 50%;

    overflow: hidden;

    max-width: calc(100% - 200px);
    height: 44px;

    transform: translateX(-50%);
    transform: translateX(-50%);
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    // word-break: break-all;

    color: #000;

    font-size: 32rpx;
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
.bgf {
  background-color: #fff;
}
.custom-content {
  .back-custom-box {
    position: absolute;
    z-index: 9999;
    bottom: 7px;
    left: 12rpx;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 90rpx;
    padding: 5px 7px;

    text-align: center;

    border: 1px solid #f3f3f3;
    border-radius: 15px;
    background-color: rgba(243, 243, 243, 1);
    .iconshouye-miaobianSVG {
      color: #000;

      font-weight: 600;
    }
  }
  .custom-title {
    overflow: hidden;

    box-sizing: border-box;
    // width: calc(100% - 140px);
    width: 100%;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // align-items: center;
    height: 44px;
    padding-right: 190rpx;
    padding-left: 190rpx;

    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    // word-break: break-all;

    color: #fff;

    font-size: 32rpx;
    font-weight: 500;
    line-height: 44px;
  }
}
</style>
