<template>
  <view class="card-container" :style="{ 'background-image': `url(${value.BackgroundMap})` }" @tap="navigateCard">
    <view v-if="gradeNumber > -1" class="flex flex-column flex-between info">
      <view>
        <view class="grade-name fs-36">{{ value.DGradeName }}</view>
        <view class="grade-num fs-24">
          成长值：
          <text class="grade-color">{{ value.DGradeCondition }}</text>
        </view>
      </view>
      <view class="next flex flex-middle fs-24">
        <template v-if="isHighest">你已达到最高等级</template>
        <template v-else>
          距离升级还差
          <text class="fs-24 grade-color">{{ nextGradeDelta }}</text>
          成长值
          <view class="upgrade-btn ml-20 fs-22" @tap.stop="upgrade">如何升级成长值?</view>
        </template>
      </view>
      <view class="progress-box bg-box">
        <image :src="progressBg" class="bar"></image>
      </view>
      <view class="progress-box active-box" :style="{ width: progressWidth * percent + 'rpx' }">
        <image :src="progressActive" class="bar" :style="{ width: progressWidth + 'rpx' }"></image>
      </view>
    </view>
    <view v-else class="white-color">
      <view class="flex flex-end flex-middle fs-28">
        {{ value.AccountName }}
        <image :src="value.ShowLogo" class="mini-logo ml-20"></image>
      </view>
      <view class="grade-name fs-36">{{ value.DGradeName }}</view>
      <image :src="ribbon" class="ribbon"></image>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MemberCard',
  props: {
    value: {
      type: Object,
      default() {
        return {
          AccountName: '',
          ShowLogo: '',
          BackgroundMap: '',
          DGradeCondition: 0,
          DGradeName: '',
          DGradeNumber: 0,
          GradeCondition: 0
        }
      }
    },
    gradeNumber: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      ribbon: require('./images/wait-receive.png'),
      progressActive: require('./images/progress-active.png'),
      progressBg: require('./images/progress-bg.png'),
      progressWidth: 690
    }
  },
  computed: {
    isHighest() {
      return this.value && this.value.GradeCondition === -1
    },
    nextGradeDelta() {
      return this.value.GradeCondition - this.value.DGradeCondition
    },
    percent() {
      return this.isHighest ? 1 : Math.round((this.value.DGradeCondition / this.value.GradeCondition) * 100) / 100
    }
  },
  methods: {
    upgrade() {
      this.$navigate('/cloudStore/member/increaseGrowth')
    },
    navigateCard() {
      this.$emit('navigate')
    }
  }
}
</script>

<style lang="scss" scoped>
.card-container {
  position: relative;
  width: 690rpx;
  height: 345rpx;
  box-sizing: border-box;
  padding: 43rpx 30rpx 30rpx 36rpx;
  border-radius: 12rpx;
  background-size: cover;
  background-repeat: no-repeat;
}
.info {
  height: 100%;
}
.ribbon {
  position: absolute;
  width: 130rpx;
  height: 50rpx;
  right: -10rpx;
  bottom: 30rpx;
}
.progress-box {
  position: absolute;
  top: 88rpx;
  right: 0;
  left: 0;
  height: 139rpx;
  &.bg-box {
    z-index: 4;
  }
  &.active-box {
    overflow: hidden;
    z-index: 5;
    width: 0;
    transition: width 2s;
  }
  .bar {
    width: 100%;
    height: 100%;
  }
}
.grade-name {
  margin-bottom: 10rpx;
  font-size: 36rpx;
  font-weight: bold;
}
.grade-color {
  color: #fe9b00;
  font-weight: 500;
}
.next {
  align-self: flex-end;
}
.upgrade-btn {
  height: 42rpx;
  line-height: 42rpx;
  padding: 0 10rpx;
  border-radius: 4rpx;
  background: #fe9b00;
  color: #fff;
}
.mini-logo {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
}
</style>
