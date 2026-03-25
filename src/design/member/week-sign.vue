<template>
  <view v-if="showSign" class="week-sign flex flex-middle" :style="{ backgroundImage: `url(${info.bgUrl})` }">
    <view class="task-box flex-1 flex flex-middle flex-between">
      <image :src="info.iconUrl" alt="" class="task-icon" />
      <view class="ml-20 flex-1">
        <view class="title">{{ currentSignData.name }}</view>
        <view class="progresss flex flex-middle">
          <!-- #ifdef MP -->
          <progress
            :percent="Math.ceil((currentSignData.current / currentSignData.total) * 100)"
            :border-radius="10"
            stroke-width="20rpx"
            :activeColor="info.progressColor"
            backgroundColor="#F1F5FF"
            class="flex-1"
          ></progress>
          <!-- #endif -->
          <!-- #ifdef H5-DECORATE -->
          <u-line-progress
            :percent="Math.ceil((currentSignData.current / currentSignData.total) * 100)"
            :height="20"
            :active-color="info.progressColor"
            inactive-color="#F1F5FF"
            :show-percent="false"
            class="flex-1"
          ></u-line-progress>
          <!-- #endif -->
          <label class="ml-20 progress-desc">{{ currentSignData.current }}/{{ currentSignData.total }}天</label>
        </view>
        <view class="prize">
          <label v-for="(item, index) in currentSignData.missionrewards" :key="index" class="prize-item">
            <template v-if="item.granttype === 0">+{{ item.rewardcontent }}{{ item.name }}</template>
          </label>
        </view>
      </view>
      <image
        v-if="currentSignData.status > 0"
        :src="currentSignData.status === 2 ? info.btnDisabledUrl : info.btnUrl"
        alt=""
        class="sign-btn ml-20"
        @tap="handleReward"
      />
    </view>
    <auth-button />
  </view>
</template>

<script>
import { apiMyPageSetTask } from '@/api/home'
export default {
  name: 'WeekSign',
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    taskList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    showSign() {
      return this.taskList.length > 0 && this.taskList.some(item => item.type === 1)
    },
    currentSignData() {
      return this.taskList.find(item => item.type === 1) || {}
    }
  },
  methods: {
    async handleReward() {
      const { id, status } = this.currentSignData
      if (status === 2) {
        // this.$msg('你已经领取奖励了~')
        return
      }
      this.$loading.show()
      let res = await apiMyPageSetTask({ id })
      this.$loading.hide()
      if (this.$ck(res)) {
        const { getrewards = [] } = res.return_data
        const prize = '领取成功' + getrewards.reduce((acc, val) => (acc += ` +${val.rewardcontent}${val.name}`), '')
        uni.showToast({
          title: prize,
          icon: 'none',
          duration: 3000,
          success: () => {
            setTimeout(() => {
              this.$emit('receive')
            }, 1500)
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: week-sign;
.#{$prefix} {
  position: relative;
  height: 230rpx;
  padding: 0 30rpx;
  background-size: cover;
  background-repeat: no-repeat;
  .task-box {
    height: 180rpx;
    padding: 0 24rpx;
    background-color: #fff;
    border-radius: 30rpx;
  }
  .task-icon {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
  }
  .title {
    font-size: 30rpx;
    font-weight: bold;
  }
  .progresss {
    margin-top: 12rpx;
  }
  .progress-desc {
    color: #666;
    font-size: 22rpx;
  }
  .prize {
    margin-top: 12rpx;
    color: #d6181d;
    font-size: 22rpx;
    .prize-item {
      margin-right: 8rpx;
    }
  }
  .sign-btn {
    width: 120rpx;
    height: 64rpx;
  }
}
</style>
