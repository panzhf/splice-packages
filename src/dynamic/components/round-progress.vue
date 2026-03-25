<template>
  <view class="cirqueFixed">
    <view class="cirqueBox">
      <view class="cirqueRed"></view>
      <view id="circleAnimate" class="cirqueGrey" :style="{ animationDuration: `${totalSeconds}s` }"></view>
    </view>
    <view class="cirqueTime">
      <i v-if="winShow" class="iconvip iconvipgou"></i>
      <view v-else class="text">{{ num }}</view>
    </view>
  </view>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      setTime: null,
      timer: null,
      num: 0,
      totalSeconds: 10,
      winShow: false
    }
  },
  methods: {
    drowProgress(id, w, h, c, t) {
      this.draw(id, w, h, c, t)
    },
    draw(id, w, h, c, t) {
      // 倒计时
      this.totalSeconds = t
      this.num = t
      if (t === 0) return
      this.setTime = setInterval(() => {
        this.num--
        if (this.num === 0) {
          clearInterval(this.setTime)
          this.winShow = true
          this.$emit('updateTimer')
        }
      }, 1000)
    }
  },

  onLoad() {},
  onUnload() {
    clearInterval(this.setTime)
    clearInterval(this.timer)
  }
}
</script>


<style lang="scss" scoped>
.cirqueFixed {
  position: fixed;
  right: -30px;
  top: 45%;
  transform: scale(0.3);
  background-color: #efefef;
  border-radius: 50%;
  box-shadow: 0px 0px 10px 0px rgba(228, 226, 252, 1);
}
.cirqueBox {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  -webkit-mask: radial-gradient(transparent, transparent 58px, #fff 0);
  mask: radial-gradient(transparent 58px, #fff 0);
}
.cirqueRed {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: #ffb332;
  z-index: 1;
}
.cirqueGrey {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: #fff;
  z-index: 2;
  animation-fill-mode: forwards;
  animation-name: mymove;
  animation-timing-function: linear;
  animation-delay: 1s;
  // animation-duration: 20s;
}
.cirqueTime {
  line-height: 140px;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 4;
  transform: translate(-50%, -50%);
  text-align: center;
  .text {
    font-size: 60px;
    font-family: PingFang SC;
    font-weight: 500;
    color: #000;
  }
  .iconvipgou {
    color: #ffb432;
    font-size: 50px;
  }
}
@keyframes mymove {
  0% {
    clip-path: polygon(70px 70px, 70px -300px, -300px 70px, 70px 440px, 440px 70px, 70px -300px);
  }
  25% {
    clip-path: polygon(70px 70px, 70px -300px, -300px 70px, 70px 440px, 440px 70px, 440px 70px);
  }
  50% {
    clip-path: polygon(70px 70px, 70px -300px, -300px 70px, 70px 440px, 70px 440px, 70px 440px);
  }
  75% {
    clip-path: polygon(70px 70px, 70px -300px, -300px 70px, -300px 70px, -300px 70px, -300px 70px);
  }
  100% {
    clip-path: polygon(70px 70px, 70px -300px, 70px -300px, 70px -300px, 70px -300px, 70px -300px);
  }
}
</style>
