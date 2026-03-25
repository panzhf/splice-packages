<template>
  <u-mask
    :show="showDialog"
    :zoom="false"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.8)' }"
    z-index="100"
    @click="close"
  >
    <view
      class="score-dialog flex flex-column flex-middle flex-center"
      :class="{ slide: showDialog }"
      @tap.stop="() => {}"
    >
      <view class="iconfont icon-close2 close-icon fw-bold" @tap.stop="close" />
      <image :src="PACKAGE_STATIC_URL + 'puzzle/score-header.png'" class="logo" />
      <view class="score-info text-center">
        <view class="title fw-bold fs-26">我的积分</view>
        <view v-if="isLoaded" class="score">{{ scoreInfo.total }}</view>
        <u-loading v-else size="60" color="#ca3c1c" />
      </view>
      <view class="btn-group">
        <view class="fs-24 text-center">每{{ info.point }}积分可兑换一次抽奖机会</view>
        <view class="confirm-btn fs-32 text-center" :class="[btnText.status]" @tap.stop="handleExchange">
          {{ btnLoading ? '兑换中...' : btnText.text }}
        </view>
      </view>
    </view>
  </u-mask>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import dialogMixin from 'packages/mixins/dialog'
import commonMixin from '../mixins'
import { apiGetPointAmount, apiWinActivityChanceByPoint } from 'packages/api/prizePool'
export default {
  name: 'ScoreDialog',
  mixins: [packageStaticMixin, dialogMixin, commonMixin],
  data() {
    return {
      scoreInfo: {
        total: 0,
        status: 0
      }, // 积分信息
      isLoaded: false, // 加载完成
      btnLoading: false // 按钮防重复
    }
  },
  computed: {
    btnText() {
      let r = {
        status: 'active',
        text: '立即兑换'
      }
      if (this.scoreInfo.total < this.info.point) {
        r.text = '积分不足'
        r.status = 'disabled'
        return r
      }
      if (this.scoreInfo.status === -1) {
        r.text = '今日兑换次数已用完'
        r.status = 'disabled'
      }
      if (this.scoreInfo.status === -2) {
        r.text = '本期兑换次数已用完'
        r.status = 'disabled'
      }

      return r
    }
  },
  watch: {
    value(v) {
      if (v) {
        this.getInfo()
      }
    }
  },
  methods: {
    getInfo() {
      this.isLoaded = false
      apiGetPointAmount({
        aid: this.info.actId
      }).then(res => {
        this.isLoaded = true
        this.scoreInfo.total = res.return_data
        this.scoreInfo.status = res.return_freenum
      })
    },
    handleExchange() {
      if (!this.isLoaded) return
      if (this.btnText.status === 'disabled') return
      if (this.btnLoading) return
      this.btnLoading = true
      let param = `${this.info.actId}&periodId=${this.info.periodId}`
      apiWinActivityChanceByPoint(param, { latlng: '', qqLatLng: '' }, { loading: true })
        .then(res => {
          // 还属于当前分期
          this.btnLoading = false
          // this.$msg('兑换成功')
          this.close()
          this.$emit('change') // 正常兑换获得拼图
        })
        .catch(err => {
          this.btnLoading = false
          if (err.return_code === 40000) {
            // 刚好进入下一期
            // this.$msg('兑换成功')
            this.close()
            this.$emit('change-refresh') // 拼图活动刷新+获得拼图
          } else if (err.return_code === 30047) {
            //  活动结束
            this.$msg(err.return_msg)
            this.close()
            this.$emit('refresh') // 拼图活动刷新
          } else {
            this.$msg(err.return_msg)
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: score-dialog;
$color: #ca3c1c;
.#{$prefix} {
  position: fixed;
  left: 0;
  bottom: 0;
  @include wh(100%, 643rpx);
  padding: 0 60rpx;
  @include round(20rpx 20rpx 0 0);
  @include box();
  transition: transform 0.25s;
  transform: translate3d(0, 100%, 0);
  border: 10rpx solid #b6200d;
  border-bottom: none;
  background-color: #ffdcab;
  color: $color;
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
    @include wh(558rpx, 90rpx);
  }
  .score-info {
    margin-top: 90rpx;
    margin-bottom: 90rpx;
    .title {
      margin-bottom: 10rpx;
      color: #000;
    }
    .score {
      font-size: 60rpx;
    }
  }
  .confirm-btn {
    @include whl(400rpx, 75rpx);
    margin: 20rpx auto 0;
    @include round(38rpx);
    color: #fff;
    background-color: $color;
    &.disabled {
      color: #ffdcab;
      background-color: #dbbb8f;
    }
  }
}
</style>
