<template>
  <view>
    <!--头部 start-->
    <view
      v-if="!type"
      class="titlebar"
      :style="style + `background-color:rgba(0,0,0,${opacity})`"
      @touchmove.stop="() => {}"
    >
      <!--返回按钮 end-->
      <!--返回按钮 start-->
      <view bind:tap="handleBack" :class="['back', backColor ? backColor : '']" @tap="handleBack" />
      <!--返回按钮 end-->
      <!--标题 start-->
      <view :class="['title', titleColor ? 'backcolor' : '']">{{ title }}</view>
      <!--标题 end-->
      <!--标题-slot start-->
      <slot name="header" />
      <!--标题-slot end-->
    </view>
    <!--头部 end-->
    <!--头部 start-->
    <block v-if="type === 'detail'">
      <view v-if="isShowInform" class="inform" :style="{ height: statusBarHeight }" />
      <view :style="style" :class="['titlebar2']" @touchmove.stop="() => {}">
        <!--返回按钮 start-->
        <!-- <view bind:tap="handleBack" @tap='handleBack' class="back"/>  -->
        <view class="back-box">
          <view class="left" @tap="handleBack">
            <text class="iconfont iconjiantou1" />
          </view>
          <view class="right" @tap="handleHome">
            <text class="iconfont iconshouye-miaobianSVG" />
          </view>
        </view>
        <!--返回按钮 end-->
        <!--标题 start-->
        <view v-if="showNavTitle" class="title" :style="{ color: `${textcolor}` }">{{ title }}</view>
        <!--标题 end-->
        <!--标题-slot start-->
        <slot name="header" />
        <!--标题-slot end-->
      </view>
    </block>
    <!--头部 end-->
    <!--头部 start-->
    <block v-if="type === 'custom'">
      <!--头部 start-->
      <view class="titlebar custom-content" :style="style + `background-color: ${bgcolor}`" @touchmove.stop="() => {}">
        <!--回到首页返回按钮 start-->
        <view class="back-custom-box" @tap="handleHome">
          <text class="iconfont iconshouye-miaobianSVG" />
        </view>
        <!--返回按钮 end-->
        <!--标题 start-->
        <view class="custom-title" :style="{ color: `${textcolor}` }">{{ title }}</view>
        <!--标题 end-->
        <!--标题-slot start-->
        <slot name="header" />
        <!--标题-slot end-->
      </view>
      <!--头部 end-->
    </block>
    <!--头部 end-->
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
    isShowInform: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      more: true
    }
  },
  computed: {
    style() {
      /**
       * 顶部适配
       */
      const statusBarHeight = wx.getSystemInfoSync().statusBarHeight
      const style = `padding-top:${statusBarHeight}px; height:${44 + statusBarHeight}px;`
      return style
    },
    statusBarHeight() {
      const statusBarHeight = wx.getSystemInfoSync().statusBarHeight
      return `${statusBarHeight}px`
    }
  },
  /**
   * 创建组件
   */
  created() {
    /**
     * 是否有后续页面，允许返回
     */
    const currentPages = getCurrentPages()
    if (currentPages.length > 1) {
      this.more = true
    } else {
      this.more = false
    }
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
    },
    handleHome() {
      uni.redirectTo({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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
    word-break: break-all;

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

  .back:after {
    display: block;

    width: 20rpx;
    height: 20rpx;

    content: '';
    transform: rotate(45deg);

    border-bottom: #fff 2px solid;
    border-left: #fff 2px solid;
  }
  .black:after {
    display: block;

    width: 20rpx;
    height: 20rpx;

    content: '';
    transform: rotate(45deg);

    border-bottom: #000 2px solid;
    border-left: #000 2px solid;
  }
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
    position: absolute;
    bottom: 7px;
    left: 12rpx;

    display: flex;

    width: 150rpx;
    padding: 5px 0;

    border: 1px solid #f3f3f3;
    border-radius: 15px;
    background-color: rgba(243, 243, 243, 0.6);
    &:after {
      position: absolute;
      left: 75rpx;

      width: 2rpx;
      height: 34rpx;

      content: '';

      background: #f3f3f3;
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
    left: 100px;

    overflow: hidden;

    width: 360rpx;
    height: 44px;

    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-all;

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

  .back:after {
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
    width: 100%;
    height: 44px;
    padding-right: 190rpx;
    padding-left: 190rpx;

    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-all;

    color: #fff;

    font-size: 32rpx;
    font-weight: 500;
    line-height: 44px;
  }
}
@font-face {
  font-family: 'iconfont'; /* Project id 2786807 */

  src: url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAMEAAsAAAAABrwAAAK3AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACCcAqBLIE0ATYCJAMICwYABCAFhGcHPBv8BRHVk2tkf4BsyAZqD4SAmsLaclcN0n5H4UWshw48MFcQAX8AAAAAgOCB3x/vufgkk8AmjopbgzLUnMToKL3NufrKRZihnH0gh76QtMPssuzBPSjj8unAVwe2J0AAZwMMRMztr0Doanllvp4kfYABYNSl/A3ogRfAv9J/SqPSOqXTgQUw+kDp1RIKRTgTD3oU1Gt9DUBGPIIALImXSxaXltVhO9Y9N4EnjT0oIKsVY8OD3ZjrMBpNc+YITNGdGnEAE5A75QOG/dHnxWd15iAxUdgNVVTSx60+O3PUijGo1/7ztdH7JGACKCAaaBB13ekKoxBNvMLSrQmkzRoB7zaMwIXYtR2h/jq72hoAbyrfk+Kpt1otAdDJcAYoGfUGkAnm87vPwEqWtrseCrV6yW3w3O6I/qMXkCunLXedFWqgT1qJ1WfPdv8EQ4vO9Xhj1zV5aubJNMcdDl7BAcF/gxf8zbnfhc5k9fij/0gd7YrtHE842q5HOY3/v7zQ/ILQKlcInwo788Xq6zq8t9O3vc/uIt8AGKsn9f3M39B0PVWKXfY3czQAb+xwFDTWYF4wP5tbwK/T20CiNiIgdZOivZKMUUkJWDoxMNh+R2/HWpxuMS8wx+lGvWZ4ZVCYE0hpLhImWJEIU8zJgSVRSvZb4WTKKIS2AEKtEwjsnYHElstQ2LtNae4ZTHD1HqbY+wdLGjY2p1kRmuO3glYxgPtB63ki16yR0RvGdbBSl3ihLC2NQZWX5dwRJ5Qp1izvWKsSkPAIB3kfDgPDLNyh1zypzk1RUNNLcs+j2QpaxQDcD7SeJwrIWvy+G8Z1sAJSr7QsLTUOKrkSoI7aBHXdyTnLO9ZUCZCQ7AgOehoOA4O5eVqHXnNpRHJuFA6JUC1f3zR+PUn1YVtlzqo4PvH6w2xsLTuvZLq/jsYAAA==')
    format('woff2');
}

.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.iconshouye-miaobianSVG:before {
  content: '\e6eb';
}
</style>
