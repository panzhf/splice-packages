<template>
  <view v-if="dayTask.length > 0" class="task">
    <view v-if="info.isShowTitle" class="daily">{{ info.title }}</view>
    <view v-for="(item, index) in dayTask" :key="index" class="item flex flex-between">
      <view class="alpha">
        <image v-if="item.type == 1" class="logo" :src="`${staticURL}home/login.png`" />
        <image v-if="item.type == 2" class="logo" :src="`${staticURL}home/buy.png`" />
        <image v-if="item.type == 3" class="logo" :src="`${staticURL}home/good.png`" />
        <image v-if="item.type == 4" class="logo" :src="`${staticURL}home/write.png`" />
        <image v-if="item.type == 9" class="logo" :src="`${staticURL}home/read.png`" />
      </view>
      <view class="beta flex flex-between">
        <view class="flex flex-between body">
          <view class="info">
            <view class="title">
              {{ item.name }}
              <text>({{ item.current }}</text>
              <text>/{{ item.total }})</text>
            </view>
            <view class="flex-wrap">
              <view v-for="(missionreward, missionrewards) in item.missionrewards" :key="missionrewards">
                <view class="content flex flex-middle flex-center">
                  <view v-if="missionreward.rewardtype === 1" class="icon iconfont icon-huoli2" />
                  <view v-if="missionreward.rewardtype === 2" class="icon iconfont icon-jifen2" />
                  <view v-if="missionreward.rewardtype === 3" class="icon iconfont icon-hongbao2" />
                  <view class="message" :style="{ backgroundImage: `url(${staticURL}home/daily-circle2.png)` }">
                    {{ missionreward.name }} + {{ missionreward.rewardcontent }}
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-if="item.status === 0" style="position: relative">
            <!-- #ifdef MP -->
            <auth-button v-if="![3, 4, 9].includes(item.type)" />
            <!-- #endif -->
            <view class="home-btn base-btn flex flex-middle flex-center" @tap="handleOpenBox(item.type)">
              {{ item.statusname }}
            </view>
          </view>
          <!-- 签到初始status为1，其他为0 -->
          <view
            v-if="item.status === 1"
            :data-id="item.id"
            :data-type="item.type"
            :data-prizelist="item['missionrewards']"
            class="p-r"
          >
            <!-- #ifdef MP -->
            <auth-button />
            <!-- #endif -->
            <view class="home-btn base-btn flex flex-middle flex-center" @tap="handleReward(item.id, item.type)">
              {{ item.statusname }}
            </view>
          </view>

          <view v-if="item.status === 2" class="complete-box flex flex-center">
            <view class="complete icon iconfont icon-complete" />
          </view>
        </view>
      </view>
    </view>
    <!-- #ifdef MP -->
    <sign-tip ref="loginTip" :info="info.btns" @LevelUpgrade="LevelUpgrade" />
    <!-- #endif -->
  </view>
</template>
<script>
import { staticURL } from '@/config'
/* #ifdef MP */
import { apiMyPageSetTask } from '@/api/home'
import SignTip from './components/sign-tip.vue'
/* #endif */
export default {
  /* #ifdef MP */
  components: {
    SignTip
  },
  /* #endif */
  props: {
    dayTask: {
      type: Array,
      default: () => []
    },
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      staticURL: staticURL()
    }
  },
  methods: {
    /* #ifdef MP */
    LevelUpgrade(val) {
      this.$emit('LevelUpgrade', val)
    },
    /* #endif */
    async handleReward(id, type) {
      /* #ifdef MP */
      this.$loading.show()
      let res = await apiMyPageSetTask({ id })
      this.$loading.hide()
      if (this.$ck(res)) {
        // 每日任务领奖成功 弹框提示 但弹框隐藏，才去判断是否升级再去展示升级特效
        let prizeList = res.return_data.getrewards
        let membergrade = res?.return_data?.membergrade || {}
        this.$refs.loginTip.showToast(prizeList, type, membergrade)
      }
      /* #endif */
    },
    handleOpenBox(type) {
      /* #ifdef MP */
      if (type === 2) {
        // 加入标识，防止触发onshow函数接口
        uni.setStorageSync('isScan', '1')
        uni.scanCode({
          success: res => {
            let { result } = res
            result = result.trim()
            if (!result) {
              return this.$msg('扫码失败，请重试')
            }
            this.$emit('scanData', encodeURIComponent(res.result))
          },
          fail: res => {
            this.$msg('扫码失败，请重试')
          },
          complete() {
            uni.removeStorageSync('isScan')
          }
        })
      } else if (~[3, 4, 9].indexOf(type)) {
        // 点赞、评论、阅读
        uni.navigateTo({
          url: '/packages/src/dynamic/list'
        })
      }
      /* #endif */
    }
  }
}
</script>

<style lang="scss" scoped>
.task {
  padding: 24rpx 26rpx 2rpx 26rpx;
  background: #fff;
  .daily {
    font-size: 32rpx;
    font-family: PingFang-SC-Bold;
    font-weight: bold;
    color: rgba(0, 0, 0, 1);
    padding: 0 0 25rpx;
  }
  .item {
    padding: 22rpx 0 22rpx 20rpx;
    margin-bottom: 30rpx;
    background: #fff;
    border-radius: 10rpx;
    box-shadow: 0px 2px 6px #e5e5e5;
    .alpha {
      .logo {
        width: 96rpx;
        height: 96rpx;
      }
    }
    .beta {
      flex: 1;
      .body {
        margin-left: 26rpx;
        flex: 1;
        align-items: center;
        .title {
          font-size: 28rpx;
          font-family: PingFang-SC-Bold;
          font-weight: bold;
          color: rgba(51, 51, 51, 1);
          padding-bottom: 19rpx;
        }
        .content {
          margin: 0 4rpx 10rpx 0;
          height: 32rpx;
          line-height: 32rpx;
          flex-wrap: wrap;
          transform: translateX(-16rpx);
          .icon {
            font-size: 32rpx;
            color: rgb(236, 184, 114);
            transform: translateX(16rpx);
          }
          .message {
            font-size: 22rpx;
            color: rgba(197, 150, 86, 1);
            padding: 0 20rpx 0 25rpx;
            height: 32rpx;
            background-repeat: no-repeat;
            background-size: auto 100%;
            background-position: right;
          }
        }
        .home-btn {
          width: 140rpx;
          height: 62rpx;
          font-size: 28rpx;
          border-radius: 31rpx;
          margin-right: 20rpx;
        }
        .complete-box {
          /* width: 140rpx; */
          margin-right: 30rpx;
        }
        .complete {
          font-size: 76rpx;
          color: rgba(255, 162, 1, 1);
        }
      }
    }
  }
}
.p-r {
  position: relative;
}
</style>
