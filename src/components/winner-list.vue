<template>
  <view v-if="show" class="bubble-wrap">
    <view
      v-for="(item, index) in myWinnerList"
      :key="index"
      class="bubble-item flex flex-middle"
      :class="item.className"
    >
      <image class="headimg" :src="item.imgPath" />
      <view class="ellipsis ml-10 fs-24">恭喜 {{ item.nickName }} {{ item.remark }}</view>
    </view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  mixins: [packageStaticMixin],
  props: {
    show: Boolean,
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      myWinnerList: [],
      winnerList: [],
      count: 0,
      timer: null
    }
  },
  computed: {
    listLength() {
      return this.list.length
    },
    calcData() {
      const { show, list } = this
      return { show, list }
    }
  },
  watch: {
    calcData: {
      immediate: true,
      deep: true,
      handler(val) {
        this.clearTime()
        if (val.show && val.list.length > 0) {
          this.initWinArr(val.list)
          this.bubbleFadeInOut()
        }
      }
    }
  },
  beforeDestroy() {
    this.clearTime()
  },
  methods: {
    clearTime() {
      this.myWinnerList = []
      this.count = 0
      clearInterval(this.timer)
      this.timer = null
    },
    // 滚动动态
    bubbleFadeInOut() {
      this.timer = setInterval(async () => {
        if (this.count === this.list.length) {
          this.myWinnerList = []
          this.count = 0
          await this.sleep(500)
        }
        let temp = this.winnerList[this.count]
        temp.className = 'animate'
        this.myWinnerList.push(temp)
        this.count++
      }, 4000)
    },
    initWinArr(list) {
      const l = JSON.parse(JSON.stringify(list))
      this.winnerList = l.map(item => {
        return {
          nickName: this.formatNickname(item.customernickname),
          imgPath: this.formatHead(item.headimg),
          remark: item.text
        }
      })
    },
    formatNickname(nickName) {
      if (nickName.length === 0) {
        return '微信用户'
      }
      if (nickName.length >= 2) {
        let n = Array.from(nickName) // 防止一些昵称带表情等特殊字符，截取有问题
        nickName = n.slice(0, 1) + '***' + n.slice(n.length - 1)
      }
      return nickName
    },
    formatHead(img) {
      return img || this.PACKAGE_STATIC_URL + 'avatar.jpg'
    },
    sleep(time) {
      return new Promise(resolve => {
        setTimeout(resolve, time)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bubble-wrap {
  position: absolute;
  /* #ifdef MP-WEIXIN */
  top: 405rpx;
  /* #endif */
  /* #ifdef H5 */
  top: 305rpx;
  /* #endif */

  .bubble-item {
    position: absolute;
    z-index: 20;
    left: 20rpx;
    opacity: 0;
    padding-right: 30rpx;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 30rpx;
    overflow: hidden;
    color: #fff;
    animation-fill-mode: forwards;
    .headimg {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
    }
  }
}
.animate {
  animation-name: fadeInOut;
  animation-duration: 4s;
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
</style>
