<template>
  <view class="member-sign flex flex-middle flex-between" :class="wrapperClass" :style="bgStyle">
    <view v-if="!isLogin" class="flex flex-middle" @tap="handleLogin">
      <image class="avatar" :src="PACKAGE_STATIC_URL + 'avatar.jpg'" alt="" />
      <view class="name">点击登录</view>
    </view>
    <template v-else>
      <template v-if="info.mode === 2">
        <view class="avatar-box">
          <image :src="HeadPath || PACKAGE_STATIC_URL + 'avatar.jpg'" alt="" class="avatar shrink-0" />
          <auth-button mode="3" />
        </view>
        <view class="flex-1 overflow-h">
          <view class="flex flex-middle name fs-30 fw-bold overflow-h">
            <view class="ellipsis p-r" :style="{ color: info.nicknameColor }">
              {{ NickName || '填写昵称' }}
              <auth-button mode="3" />
            </view>
            <view
              v-if="userGrade.gradenumber >= 0"
              class="iconfont fs-24"
              :class="[`iconv-${userGrade.gradenumber}`]"
              :style="{ color: info.levelColor }"
            />
          </view>
          <view v-if="userGrade.gradenumber >= 0" class="progresss flex flex-middle">
            <!-- #ifdef MP -->
            <progress
              :percent="percentage"
              :border-radius="4"
              stroke-width="8rpx"
              :activeColor="info.progressColor"
              :backgroundColor="info.progressBg"
              class="flex-1"
            />
            <!-- #endif -->
            <!-- #ifdef H5-DECORATE -->
            <u-line-progress
              :percent="percentage"
              :height="8"
              :active-color="info.progressColor"
              :inactive-color="info.progressBg"
              :show-percent="false"
              class="flex-1"
            />
            <!-- #endif -->
            <view
              v-if="userGrade.growthvalue"
              class="ml-10 progress-desc fs-24"
              :style="{ color: info.gradeTextColor2 }"
            >
              {{ userGrade.growthvalue }}
              <template v-if="userGrade.nextgrowthvalue > 0">/{{ userGrade.nextgrowthvalue }}</template>
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <view class="flex-1 flex flex-middle overflow-h">
          <view class="avatar-box">
            <image :src="HeadPath || PACKAGE_STATIC_URL + 'avatar.jpg'" alt="" class="avatar shrink-0" />
            <auth-button mode="3" />
          </view>
          <view class="overflow-h">
            <view class="name ellipsis">
              {{ NickName || '填写昵称' }}
              <auth-button mode="3" />
            </view>
            <view v-if="userGrade.gradenumber >= 0" class="flex flex-middle grade-info">
              <view
                class="badge flex flex-middle mr-20"
                :style="{ backgroundColor: info.gradeBgColor, color: info.gradeTextColor }"
                @tap="handleNavigate"
              >
                <view class="iconfont flex flex-middle flex-center mr-10" :class="[`iconv-${userGrade.gradenumber}`]" />
                <label class="badge-name shrink-0">{{ userGrade.gradename }}</label>
              </view>
              <label v-if="userGrade.growthvalue" class="fs-24">
                {{ userGrade.growthvalue }}
                <template v-if="userGrade.nextgrowthvalue > 0">/{{ userGrade.nextgrowthvalue }}</template>
              </label>
            </view>
          </view>
        </view>
        <image
          v-if="showSign"
          :src="currentSignData.status === 2 ? info.btnDisabledUrl : info.btnUrl"
          alt=""
          class="sign-btn"
          @tap="handleReward"
        />
      </template>
    </template>
    <auth-button />
  </view>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
/* #ifdef MP */
import { apiMyPageSetTask } from '@/api/home'
/* #endif */
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  name: 'MemberSign',
  mixins: [packageStaticMixin],
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
    },
    bgStyle() {
      let s = []
      if (this.info.mode === 2) {
        s.push(`background-color: ${this.info.bgColor}`)
        s.push(`color: ${this.info.nicknameColor}`)
      } else {
        s.push(`background-image: url(${this.info.bgUrl})`)
        s.push(`color: ${this.info.textColor}`)
      }
      return s.join(';')
    },
    wrapperClass() {
      return `mode-${this.info.mode || 1}`
    },
    ...mapState(['NickName', 'HeadPath', 'userGrade', 'isLogin']),
    ...mapGetters(['authState']),
    percentage() {
      if ([-2, -1].includes(this.userGrade.gradenumber)) {
        return 0
      }
      return this.userGrade.nextgrowthvalue > 0
        ? Math.ceil((this.userGrade.growthvalue / this.userGrade.nextgrowthvalue) * 100)
        : 100
    }
  },
  watch: {
    authState: {
      immediate: true,
      handler(v) {
        if (v) {
          this.$store.dispatch('updateMemberGrade')
        }
      }
    }
  },
  methods: {
    async handleReward() {
      /* #ifdef MP */
      const { id, missionrewards = [], status } = this.currentSignData
      if (status === 2) {
        // this.$msg('你已经签过到了~')
        return
      }
      this.$loading.show()
      let res = await apiMyPageSetTask({ id })
      this.$loading.hide()
      if (this.$ck(res)) {
        const prize = '签到成功' + missionrewards.reduce((acc, val) => (acc += ` +${val.rewardcontent}${val.name}`), '')
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
      /* #endif */
    },
    handleNavigate() {
      // -2.未开启会员卡 -1.未领卡 >=0会员等级
      if (this.userGrade.gradenumber === -1) {
        // 领取完会员卡回到首页时更新
        uni.navigateTo({ url: '/packages/src/member/card?refresh=1' })
      }
    },
    handleLogin() {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: member-sign;
.#{$prefix} {
  padding: 20rpx 30rpx;
  .p-r {
    position: relative;
  }
  &.mode-1 {
    background-size: cover;
    background-repeat: no-repeat;
    .avatar-box {
      position: relative;
    }
    .avatar {
      width: 98rpx;
      height: 98rpx;
      margin-right: 15rpx;
      border: 1px solid #fff;
    }
    .name {
      font-size: 32rpx;
      position: relative;
    }
    .grade-info {
      margin-top: 12rpx;
    }
    .badge {
      height: 38rpx;
      /* #ifdef MP */
      padding: 0 14rpx;
      /* #endif */
      /* #ifdef H5-DECORATE */
      padding-left: 14rpx;
      /* #endif */
      border-radius: 20rpx;
      font-size: 22rpx;
      .iconfont {
        /* #ifdef MP */
        width: 28rpx;
        height: 28rpx;
        font-size: 16rpx;
        /* #endif */
        /* #ifdef H5-DECORATE */
        width: 48rpx;
        height: 48rpx;
        font-size: 24rpx;
        transform: scale(0.5) translate(-20rpx);
        /* #endif */
        border-radius: 50%;
        background-color: #e1a900;
        color: #fff;
        text-align: center;
      }
      /* #ifdef H5-DECORATE */
      .badge-name {
        transform: translate(-20rpx);
      }
      /* #endif */
    }
    .sign-btn {
      width: 210rpx;
      height: 64rpx;
    }
  }
  &.mode-2 {
    .avatar {
      width: 88rpx;
      height: 88rpx;
      margin-right: 24rpx;
    }
    .iconfont {
      margin-left: 12rpx;
    }
    .progresss {
      width: 64%;
      margin-top: 12rpx;
    }
  }
  .avatar {
    border-radius: 50%;
  }
}
</style>
