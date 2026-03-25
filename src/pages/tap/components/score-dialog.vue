<template>
  <u-mask
    :show="showDialog"
    :zoom="false"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    z-index="100"
    @click="close"
  >
    <view
      class="score-dialog flex flex-column flex-middle"
      :style="{ backgroundImage: `url(${bgInfo.dialog})` }"
      :class="{ slide: showDialog }"
      @tap.stop="() => {}"
    >
      <view class="iconfont icon-close2 close-icon fw-bold" @tap.stop="close" />
      <image :src="modeLogo" class="logo" />
      <view class="rest-box text-center">
        <template v-if="mode === 2 && info.daylimit">
          <image :src="bgInfo.rest" class="bg" />
          <view class="text fw-bold fs-26">今日剩余参与次数：{{ scoreInfo.restChance }}</view>
        </template>
      </view>
      <view
        class="score-info flex flex-column flex-middle flex-center"
        :style="{ backgroundImage: `url(${bgInfo.point})` }"
      >
        <view v-if="isLoaded" class="score fw-bold">{{ mode === 1 ? myChance : scoreInfo.total }}</view>
        <view v-else class="mb-10"><u-loading size="40" color="#95020e" /></view>
        <view class="title fw-bold fs-26">我的{{ modeText }}</view>
      </view>
      <view class="btn-group">
        <view class="desc fs-24 text-center">
          <template v-if="mode === 1">
            <template v-if="btnText.status === 'active'">确认消耗 1 次机会参与拍一拍游戏？</template>
            <template v-else>{{ btnText.text }}</template>
          </template>
          <template v-else>
            <template v-if="btnText.status === 'active' && info.point">
              确认消耗 {{ info.point }} 积分参与拍一拍游戏？
            </template>
            <template v-else>{{ btnText.text }}</template>
          </template>
        </view>
        <image :src="changeBtn" class="confirm-btn" @tap.stop="handleExchange()" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
import { propMixin } from '../mixins'
import { apiGetPointAmount, apiWinChance } from 'packages/api/activity'
export default {
  name: 'ScoreDialog',
  mixins: [packageStaticMixin, dialogMixin, propMixin],
  props: {
    joinMode: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      myChance: 0, // 我的机会数（扫码获得，免费）
      scoreInfo: {
        total: 0,
        restChance: 0, // 剩余日参与次数（积分兑换，开启日参与限制）
        status: 0
      }, // 积分信息
      isLoaded: false, // 加载完成
      btnLoading: false // 按钮防重复
    }
  },
  computed: {
    isPoints() {
      // 开启积分兑换
      return [0, 2].includes(this.joinMode)
    },
    isScan() {
      // 开启扫码活动
      return [1, 2].includes(this.joinMode)
    },
    mode() {
      return this.isScan && (!this.isPoints || (this.isPoints && this.myChance > 0)) ? 1 : 2
    },
    modeText() {
      const d = ['机会', '积分']
      return d[this.mode - 1]
    },
    modeLogo() {
      return `${this.PACKAGE_STATIC_URL}tap/${this.mode === 1 ? 'tip-chance.png' : 'tip-point.png'}`
    },
    btnText() {
      let r = {
        status: 'active',
        text: ''
      }
      if (this.isScan && !this.isPoints && this.myChance === 0) {
        r.text = '无抽奖机会'
        r.status = 'disabled'
        return r
      }
      if (this.scoreInfo.total < this.info.point) {
        r.text = '积分不足'
        r.status = 'disabled'
        return r
      }
      if (this.scoreInfo.status === -2) {
        r.text = '总参与次数已用完'
        r.status = 'disabled'
      }
      if (this.scoreInfo.status === -1) {
        r.text = '今日参与次数已用完'
        r.status = 'disabled'
      }

      return r
    },
    changeBtn() {
      return `${this.PACKAGE_STATIC_URL}tap/${
        this.btnText.status === 'disabled' ? 'exchange-disabled.png' : 'exchange.png'
      }`
    },
    bgInfo() {
      return {
        dialog: `${this.PACKAGE_STATIC_URL}tap/score-bg.png`,
        rest: `${this.PACKAGE_STATIC_URL}tap/rest-bg.png`,
        point: `${this.PACKAGE_STATIC_URL}tap/point-bg.png`
      }
    }
  },
  methods: {
    async start() {
      if (this.btnLoading) return
      this.btnLoading = true
      await this.getInfo()
      this.btnLoading = false
      if (this.mode === 2 && this.info.point === 0) {
        // 开启积分兑换，但是免积分参与，直接开始“拍”
        this.handleExchange(true)
      } else {
        this.showDialog = true
      }
    },
    getInfo() {
      return new Promise(resolve => {
        this.isLoaded = false
        apiGetPointAmount({
          aid: this.info.actId
        })
          .then(res => {
            this.isLoaded = true
            this.scoreInfo.total = res.return_data.jfbalance
            this.scoreInfo.restChance = res.return_data.todayleftnum
            this.scoreInfo.status = res.return_freenum
            this.myChance = res.return_freenum
            resolve()
          })
          .catch(() => {
            this.isLoaded = true
            resolve()
          })
      })
    },
    handleExchange(showTip = false) {
      if (!this.isLoaded) return
      if (this.btnText.status === 'disabled') {
        if (showTip) {
          // 直接“拍”时不显示弹窗，需要提示
          this.$emit('tip', this.btnText.text)
        }
        return
      }
      if (this.btnLoading) return
      this.btnLoading = true
      apiWinChance({ aid: this.info.actId })
        .then(res => {
          this.btnLoading = false
          this.close()
          this.$emit('success', res.return_data) // 正常兑换获得参与机会
        })
        .catch(err => {
          this.btnLoading = false
          this.$msg(err.return_msg)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: score-dialog;
$color: #95020e;
.#{$prefix} {
  position: fixed;
  left: 0;
  bottom: 0;
  @include wh(100%, 738rpx);
  padding-top: 44rpx;
  @include round(20rpx 20rpx 0 0);
  @include box();
  transition: transform 0.25s;
  transform: translate3d(0, 100%, 0);
  color: $color;
  background-size: cover;
  &.slide {
    transform: translate3d(0, 0, 0);
  }
  .close-icon {
    position: absolute;
    top: -90rpx;
    right: 10rpx;
    font-size: 60rpx;
    color: #fff;
  }
  .logo {
    @include wh(386rpx, 34rpx);
  }
  .rest-box {
    position: relative;
    @include lh(50rpx);
    min-width: 380rpx;
    margin-top: 34rpx;
    .bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .text {
      position: relative;
    }
  }
  .score-info {
    @include wh(326rpx, 287rpx);
    margin-top: 40rpx;
    margin-bottom: 30rpx;
    background-size: cover;
    .score {
      font-size: 60rpx;
    }
  }
  .btn-group {
    .desc {
      height: 30rpx;
    }
  }
  .confirm-btn {
    display: block;
    @include whl(413rpx, 115rpx);
    margin: 24rpx auto 0;
  }
}
</style>
