<template>
  <u-popup
    v-model="showDialog"
    mode="center"
    border-radius="10"
    :mask-custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    :mask-close-able="false"
    z-index="100"
    @close="close"
  >
    <view class="remind-dialog flex flex-column flex-middle text-center fs-32">
      <image :src="popupBg" class="popup-bg" />
      <view class="content">
        <template v-if="!!info.CurrentJackpotName">
          <template v-if="!!info.GapIntoJackpotName">
            <view>获得{{ info.AddChanceNum }}张拼图</view>
            <view>恭喜进入{{ info.IntoJackpotName || info.CurrentJackpotName }}</view>
            <view>还差1张即可参与{{ info.GapIntoJackpotName }}</view>
          </template>
          <template v-else>
            <view>获得{{ info.AddChanceNum }}张拼图</view>
            <view>恭喜进入{{ info.CurrentJackpotName }}</view>
          </template>
        </template>
        <template v-else>
          <template v-if="!!info.GapIntoJackpotName">
            <view>恭喜获得{{ info.AddChanceNum }}张拼图</view>
            <view>还差1张即可参与{{ info.GapIntoJackpotName }}</view>
          </template>
          <template v-else>
            <view>恭喜获得{{ info.AddChanceNum }}张拼图</view>
            <view>离瓜分奖池又进一步啦</view>
          </template>
        </template>
      </view>
      <view class="confirm-btn" @tap="handleConfirm">{{ btnText }}</view>
    </view>
  </u-popup>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
import commonMixin from '../mixins'
export default {
  name: 'RemindDialog',
  mixins: [packageStaticMixin, dialogMixin, commonMixin],
  props: {
    mode: {
      type: Number,
      default: 0 // 0.开奖提醒 1.倒计时关闭
    },
    delay: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      btnText: '',
      timer: null
    }
  },
  computed: {
    popupBg() {
      return `${this.PACKAGE_STATIC_URL}puzzle/popup-bg.png`
    },
    calcData() {
      const { value, mode } = this
      return { value, mode }
    }
  },
  watch: {
    calcData(v) {
      if (v.value) {
        if (v.mode === 1) {
          let TIME = this.delay
          this.btnText = `好的（${TIME}s后自动关闭）`
          this.timer = setInterval(() => {
            if (TIME <= 1) {
              clearInterval(this.timer)
              this.btnText = `好的`
              this.handleConfirm()
              return
            }
            TIME--
            this.btnText = `好的（${TIME}s后自动关闭）`
          }, 1000)
        } else {
          this.btnText = '开奖提醒我'
        }
      }
    }
  },
  methods: {
    handleConfirm() {
      this.timer && clearInterval(this.timer)
      this.close()
      this.$emit('refresh') // 点亮拼图
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: remind-dialog;
.#{$prefix} {
  width: 550rpx;
  border-radius: 20rpx;
  background-color: #fff;
  .popup-bg {
    position: absolute;
    right: 0;
    bottom: 0;
    @include wh(176rpx);
  }
  .content {
    padding: 80rpx 40rpx;
    line-height: 58rpx;
    font-weight: 500;
    color: #e33a00;
    z-index: 1;
  }
  .confirm-btn {
    min-width: 300rpx;
    padding: 0 48rpx;
    margin: 0 auto 50rpx;
    @include lh(75rpx);
    background: linear-gradient(180deg, #ff744f 0%, #fb4a0c 100%);
    border-radius: 38rpx;
    color: #fff;
    z-index: 1;
  }
}
</style>
