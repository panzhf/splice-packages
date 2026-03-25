<template>
  <view>
    <view v-if="weeklyMission.weeklymissionitems.length > 0" class="weekly">
      <view v-if="info.isShowTitle" class="header">
        <text class="theme">{{ info.title }}</text>
        <text class="date">（{{ weeklyMission.starttime }}至{{ weeklyMission.endtime }}）</text>
      </view>
      <view class="task-list-box">
        <view
          v-for="(item, index) in weeklyMission.weeklymissionitems"
          :key="index"
          class="item"
          :style="{ backgroundColor: `${textStyle[index] && textStyle[index][0]}` }"
        >
          <view class="alpha" :style="{ backgroundImage: `url(${weeklyBg})` }">
            <view class="title">
              {{ item.name }}
              <text class="count">(完成{{ item.current }}/{{ item.total }})</text>
            </view>
            <view class="percent" :style="{ width: `${percentWidth}px` }">
              <view
                class="number"
                :style="{ width: `${item.total === 0 ? 0 : (percentWidth * item.current) / item.total}px` }"
              />
            </view>
          </view>
          <view v-if="item.status === 0" class="beta" @tap="accomplishTask(item.missionrewards, item.name)">
            <image class="logo" :src="chestClose" />
            <view class="deal-btn" :style="{ backgroundColor: `${textStyle[index] && textStyle[index][1]}` }">
              <text class="deal-txt" :style="{ color: `${textStyle[index] && textStyle[index][2]}` }">查看奖励</text>
            </view>
          </view>
          <view v-else-if="item.status === 1" class="beta p-r" @tap="handleReward(item.id, item.missionrewards)">
            <image class="logo" :src="chestClose" />
            <view class="deal-btn" :style="{ backgroundColor: `${textStyle[index] && textStyle[index][1]}` }">
              <text class="deal-txt" :style="{ color: `${textStyle[index] && textStyle[index][2]}` }">领取奖励</text>
            </view>
            <auth-button />
          </view>

          <view v-else-if="item.status === 2" class="beta">
            <image class="logo" :src="chestOpen" />
            <view class="deal-btn" :style="{ backgroundColor: `${textStyle[index] && textStyle[index][1]}` }">
              <text class="deal-txt received" :style="{ color: `${textStyle[index] && textStyle[index][3]}` }">
                已领取
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <week-tip ref="weeklyTip" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import WeekTip from './components/week-tip.vue'
/* #ifdef MP */
import { apiMyPageSetTask } from '@/api/home'
/* #endif */
export default {
  components: {
    WeekTip
  },
  props: {
    weeklyMission: {
      type: Object,
      default: () => {
        return {
          starttime: '',
          endtime: '',
          weeklymissionitems: []
        }
      }
    },
    // weekTask: {
    //   type: Array,
    //   default: () => []
    // },
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      chestOpen: staticURL() + 'chest/open.png',
      chestClose: staticURL() + 'chest/close.png?v=2',
      weeklyBg: staticURL() + 'weekly-bg.png',
      textStyle: [
        ['#FCF6EE', '#FFE4B0', '#6B542B', '#CBB489'],
        ['#ECF8FE', '#C6ECFE', '#2878A2', '#86B7D1'],
        ['#E5F9F1', '#BFF1DD', '#23A772', '#8CD2B6'],
        ['#FBEEF3', '#FBDEEA', '#995571', '#DAB1C2']
      ]
    }
  },
  computed: {
    percentWidth() {
      return uni.getSystemInfoSync().windowWidth * (350 / 750)
    }
  },
  methods: {
    // 未完成任务弹框提醒
    accomplishTask(prizelist, name) {
      this.$refs.weeklyTip.showToast(prizelist, name)
    },
    async handleReward(id, prizeList) {
      /* #ifdef MP */
      this.$loading.show()
      let res = await apiMyPageSetTask({ id })
      this.$loading.hide()
      if (this.$ck(res, true)) {
        let membergrade =
          res['return_data'] && res['return_data']['membergrade'] ? res['return_data']['membergrade'] : {}
        // prizelist 是全部的奖励内容，随机奖励不一定能获取，接口新增 getrewards
        let getrewards = res['return_data']['getrewards'] ? res['return_data']['getrewards'] : []
        this.$emit('receiveDailyPrize', membergrade, getrewards)
      }
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
.weekly {
  padding: 24rpx 26rpx;
  background: #fff;
  .header {
    margin-bottom: 4rpx;
  }
  .theme {
    font-size: 32rpx;
    font-family: PingFang-SC-Bold;
    font-weight: bold;
    color: rgba(0, 0, 0, 1);
  }
  .date {
    font-size: 24rpx;
    color: rgba(102, 102, 102, 1);
  }
  .task-list-box {
    .item {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 130rpx;
      background-color: #fcf6ee;
      border-radius: 10rpx;
      margin-top: 20rpx;
      overflow: hidden;
      .alpha {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 500rpx;
        height: 130rpx;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        .title {
          font-size: 26rpx;
          color: #333;
          font-weight: bold;
          padding: 0 0 20rpx 26rpx;
          .count {
            font-size: 24rpx;
            color: #333;
          }
        }
        .percent {
          position: relative;
          width: 175px;
          height: 15rpx;
          margin-left: 26rpx;
          background: rgba(255, 255, 255, 1);
          border-radius: 8px;
          .number {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 15rpx;
            background: linear-gradient(#ffa200 0%, #fee34d 100%);
            border-radius: 8rpx;
          }
        }
      }
      .beta {
        display: flex;
        height: 100%;
        .logo {
          width: 183rpx;
          height: 135rpx;
          margin-right: 108rpx;
        }
        .deal-btn {
          position: absolute;
          top: -35rpx;
          right: -108rpx;
          width: 200rpx;
          height: 200rpx;
          border-radius: 50%;
          background-color: #ffe4b0;
          display: flex;
          align-items: center;
          .deal-txt {
            color: #6b542b;
            font-size: 24rpx;
            width: 80rpx;
            padding: 0 0 0 25rpx;
          }
          .received {
            padding: 0 0 0 10rpx;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
.p-r {
  position: relative;
}
</style>
