<template>
  <view class="count-box">
    <image :src="PACKAGE_STATIC_URL + 'tap/count-bg.png'" class="count-bg" />
    <view class="tip-box text-center fs-28 fw-bold" :style="{ color: info.textcolor }">
      <view class="desc">{{ info.desc }}</view>
    </view>
    <view class="time-box fw-bold">
      <view class="second">{{ timeInfo.second }}</view>
      <view class="tenths">{{ timeInfo.tenths }}</view>
      <view class="percentile">{{ timeInfo.percentile }}</view>
    </view>
    <view class="confirm-btn-box">
      <image :src="btnImg" class="confirm-btn" @tap="handleTap" />
      <!-- #ifdef MP-WEIXIN -->
      <auth-button :mode="2" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
import { apiGetPrize } from 'packages/api/activity'
import { packageStaticMixin } from 'packages/mixins/static-url'
import MD5 from 'blueimp-md5'

export default {
  name: 'CountBox',
  mixins: [packageStaticMixin],
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      timeInfo: {
        second: 0, // 秒数
        tenths: 0, // 十分位
        percentile: 0 // 百分位
      },
      timer: null,
      isCounting: false,
      btnLoading: false // 防重复
    }
  },
  computed: {
    btnImg() {
      return `${this.isCounting ? this.info.stopimg : this.info.clickimg}`
    },
    timeText() {
      return `${this.timeInfo.second}.${this.timeInfo.tenths}${this.timeInfo.percentile}`
    }
  },
  methods: {
    init() {
      this.isCounting = true
      this.initTimer()
    },
    reset() {
      clearInterval(this.timer)
      this.isCounting = false
      this.timeInfo = {
        second: 0,
        tenths: 0,
        percentile: 0
      }
    },
    handleTap() {
      if (!this.isCounting) {
        // 拍
        this.$emit('prepare')
      } else {
        // 停
        clearInterval(this.timer)
        if (this.btnLoading) return
        this.btnLoading = true
        this.drawPrize()
      }
    },
    initTimer() {
      this.timeInfo = {
        second: 0,
        tenths: 0,
        percentile: 0
      }
      const END_TIME = {
        second: 9,
        millisecond: 990
      }

      let ms = 0
      this.timer = setInterval(() => {
        ms += 10
        if (this.timeInfo.second >= END_TIME.second && ms > END_TIME.millisecond) {
          // 超过时间自动抽奖，但时间算“0.00”
          clearInterval(this.timer)
          this.isCounting = false
          this.drawPrize(true)
          return
        }
        this.timeInfo.percentile = (ms % 100) / 10
        if (ms >= 100 && ms % 100 === 0) {
          this.timeInfo.tenths += 1
        }
        if (ms >= 1000) {
          ms = 0
          this.timeInfo.tenths = 0
          this.timeInfo.second += 1
        }
      }, 10)
    },
    async drawPrize(isAuto = false) {
      let finalTime = isAuto ? '0.00' : this.timeText
      try {
        const sign = 'eb44dbba29864406847b584d4ebdd1fb'
        const res = await apiGetPrize(
          {
            aid: this.info.actId,
            clicktime: finalTime,
            validatecode: MD5(`${sign}${finalTime}`),
            credentials: this.info.credentials
          },
          { loading: true }
        )
        this.btnLoading = false
        const { return_code: code, return_index: prizeId, return_turntablelink: link } = res
        if (code === 0) {
          // 0:正常
          this.$emit('success', { prizeId, link, finalTime })
          return
        }
      } catch (err) {
        this.btnLoading = false
        const { return_code: code, return_index: prizeId, return_turntablelink: link, return_msg: msg } = err
        if (code === 30007) {
          // 30007:奖品发放失败
          this.$emit('success', { prizeId, link, finalTime })
          return
        }

        this.$emit('error', { code, msg })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: count-box;
.#{$prefix} {
  position: relative;
  height: 668rpx;
  .count-bg {
    position: absolute;
    top: 0;
    left: 0;
    @include wh(100%);
  }
  .tip-box,
  .time-box,
  .confirm-btn {
    position: relative;
  }
  .tip-box {
    padding-top: 68rpx;
    max-width: 558rpx;
    margin: 0 auto;
    white-space: nowrap;
    overflow: auto hidden;
    .desc {
      @include lh(75rpx);
    }
  }
  .time-box {
    height: 260rpx;
    margin-top: 33rpx;
    color: #95020e;
    font-size: 100rpx;
    .second,
    .tenths,
    .percentile {
      position: absolute;
      @include v-cen;
    }
    .second {
      left: 164rpx;
    }
    .tenths {
      left: 362rpx;
    }
    .percentile {
      left: 528rpx;
    }
  }
  .confirm-btn-box {
    position: relative;
    display: block;
    margin: 18rpx auto 0;
    @include wh(388rpx, 157rpx);
    .confirm-btn {
      display: block;
      @include wh(388rpx, 157rpx);
    }
  }
}
</style>
