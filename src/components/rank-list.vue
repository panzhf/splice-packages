<template>
  <view class="bubble-wrap" :class="position === 1 ? 'bnht-rank-list' : ''" :style="customStyle">
    <view v-for="(item, index) in myWinnerList" :key="index" :class="['prizetit animated', item.className]">
      <image class="headimg" :src="item.imgPath" mode="scaleToFill" />
      <view class="icontxt">{{ item.nickName }} 抽中了{{ item.remark }}</view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    // 显示位置 0：左 1：中
    position: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default() {
        return []
      }
    },
    customStyle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultHeadImg: staticURL(true) + 'scan/default-head-img.png',
      myWinnerList: [],
      winnerList: []
    }
  },
  watch: {
    list(val) {
      if (val.length > 0) {
        this.winnerList = JSON.parse(JSON.stringify(this.list))
        this.initWinArr(this.winnerList)
        this.bubbleFadeInOut()
      }
    }
  },
  methods: {
    formatNickname(nickName) {
      if (nickName.length === 0) {
        return '未关注'
      }
      if (nickName.length >= 2) {
        // nickName = nickName.substring(0, 1) + '***' + nickName.substring(nickName.length - 1)
        let n = Array.from(nickName)
        nickName = n.slice(0, 1) + '***' + n.slice(n.length - 1)
      }
      return nickName
    },
    // 滚动动态
    bubbleFadeInOut() {
      this.interval = setInterval(() => {
        let temp = this.winnerList.shift()
        if (this.myWinnerList.length >= 10) {
          this.myWinnerList = []
        }
        this.myWinnerList.push({
          nickName: this.formatNickname(temp.nickName),
          imgPath: temp.imgPath || this.defaultHeadImg,
          remark: temp.remark,
          className: 'fadeOutUpDelay'
        })
        if (this.winnerList.length === 0) {
          this.winnerList = JSON.parse(JSON.stringify(this.list))
          this.initWinArr(this.winnerList)
        }
      }, 4000)
    },
    initWinArr(winnerList) {
      let arr = []
      for (let item of winnerList) {
        let remarks = item.remark
        for (let remark of remarks) {
          arr.push({
            nickName: this.formatNickname(item.nickName),
            imgPath: item.imgPath || this.defaultHeadImg,
            remark: remarks
          })
        }
      }
      this.winnerList = arr
    }
  }
}
</script>

<style lang="scss" scoped>
.bubble-wrap {
  position: absolute;
  /* #ifdef H5 */
  top: 828rpx;
  /* #endif */
  /* #ifdef MP-WEIXIN */
  top: 950rpx;
  /* #endif */

  &.bnht-rank-list {
    position: relative;
    top: 0;
    padding: 20rpx 0;
    margin-bottom: 40rpx;
    /* #ifdef H5 */
    left: 50%;
    transform: translateX(-286rpx);
    /* #endif */
    /* #ifdef MP-WEIXIN */
    margin-left: 12%;
    /* #endif */

    // .prizetit {
    //   width: 530rpx;

    // .icontxt {
    //   width: 500rpx;
    // }
    // }
  }

  .animated {
    animation-duration: 0.8s;
    animation-fill-mode: both;
  }
  .prizetit {
    position: absolute;
    display: flex;
    opacity: 0;
    max-width: 300rpx;
    padding: 4rpx 0 4rpx 6rpx;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 28rpx;
    left: 0rpx;
    overflow: hidden;
    .icontxt {
      font-size: 24rpx;
      color: #fff;
      text-align: left;
      line-height: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      // float: left;
      // width: 270rpx;
      margin-left: 10rpx;
      margin-top: 10rpx;
    }
    .headimg {
      flex-shrink: 0;
      width: 44rpx;
      height: 44rpx;
      border-radius: 50%;
    }
  }
}
.fadeOutUpDelay {
  animation-name: fadeInOut;
  animation-duration: 4s !important;
}
@keyframes fadeInOut {
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }

  33.3% {
    opacity: 1;
    transform: none;
  }

  66.6% {
    opacity: 1;
    transform: none;
  }

  to {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
  }
}
.fadeOutUpDelay2 {
  opacity: 1 !important;
}
</style>
