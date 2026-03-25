<template>
  <view class="card-container" :style="{ 'background-image': `url(${info.bgUrl})` }" @tap="navigateCard">
    <view v-if="gradeNumber > -1" class="flex flex-column flex-between info white-color">
      <view>
        <view class="grade-name fs-36">{{ info.gradeName }}</view>
        <view class="grade-num fs-24">
          {{ growText }}：
          <text class="grade-color">{{ info.growthValue }}</text>
        </view>
      </view>
      <view class="next flex flex-middle fs-24">
        <template v-if="isHighest">你已达到最高等级</template>
        <template v-else>
          距离升级还差
          <text class="fs-24 grade-color delta">{{ nextGradeDelta }}</text>
          {{ growText }}
          <view class="upgrade-btn ml-20 fs-22" @tap.stop="upgrade">如何升级{{ growText }}</view>
        </template>
      </view>
      <view class="progress-box bg-box">
        <image :src="PACKAGE_STATIC_URL + 'vip-card/progress-bg.png'" class="bar"></image>
      </view>
      <view class="progress-box active-box" :style="{ width: progressWidth * percent + 'rpx' }">
        <image
          :src="PACKAGE_STATIC_URL + 'vip-card/progress-active.png'"
          class="bar"
          :style="{ width: progressWidth + 'rpx' }"
        ></image>
      </view>
    </view>
    <view v-else class="white-color">
      <view class="flex flex-end flex-middle fs-28">
        {{ info.accountName }}
        <image :src="info.logo" class="mini-logo ml-20"></image>
      </view>
      <view class="grade-name fs-36">{{ info.gradeName }}</view>
      <image :src="PACKAGE_STATIC_URL + 'vip-card/wait-receive.png'" class="ribbon"></image>
    </view>
  </view>
</template>

<script>
import { packageStaticMixin } from 'packages/mixins/static-url'
import { apiGetMemberCenterInfo } from 'packages/api/member'
import { specialGrowth } from 'packages/config/custom'
export default {
  name: 'MemberCard',
  mixins: [packageStaticMixin],
  props: {
    gradeNumber: {
      type: Number,
      default: 0
    },
    memberLogin: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      info: {
        accountName: '',
        logo: '',
        bgUrl: '',
        gradeName: '',
        growthValue: '',
        nextGrowthValue: ''
      },
      progressWidth: 690
    }
  },
  computed: {
    growText() {
      return ~specialGrowth.indexOf(this.memberLogin) ? '活力值' : '成长值'
    },
    isHighest() {
      return this.info && this.info.nextGrowthValue === -1
    },
    nextGradeDelta() {
      return this.info.nextGrowthValue - this.info.growthValue
    },
    percent() {
      return this.isHighest ? 1 : Math.round((this.info.growthValue / this.info.nextGrowthValue) * 100) / 100
    }
  },
  mounted() {
    this.getInfo()
  },
  methods: {
    getInfo() {
      apiGetMemberCenterInfo().then(res => {
        const d = this.$toLowerKey(res, true)
        if (d.return_code === 0) {
          const { membercardinfo, upgraderules } = d.return_data
          this.info = {
            accountName: membercardinfo.accountname,
            logo: membercardinfo.showlogo,
            bgUrl: membercardinfo.backgroundmap,
            gradeName: membercardinfo.gradename,
            growthValue: upgraderules.dgradecondition,
            nextGrowthValue: upgraderules.gradecondition
          }
        }
      })
    },
    upgrade() {
      this.$emit('tip')
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
  color: #e6b684;
  font-weight: 500;
}
.next {
  align-self: flex-end;
}
.delta {
  margin: 0 4rpx;
}
.upgrade-btn {
  height: 42rpx;
  line-height: 42rpx;
  padding: 0 10rpx;
  border-radius: 30rpx;
  background: #e6b684;
  color: #111;
}
.mini-logo {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
}
</style>
