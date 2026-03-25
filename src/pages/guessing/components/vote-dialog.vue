<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view
      v-if="baseStaticUrl"
      class="vote-dialog flex flex-column"
      :style="{ backgroundImage: `url(${baseStaticUrl}/tcbj2.png)` }"
      @tap.stop="() => {}"
    >
      <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/title.png?v2`" class="title-icon" />
      <view class="content" :class="[info.voteData.BetType === 1 ? 'mt-200' : '']">
        <view class="num-text">
          你还有
          <text class="num">{{ info.usable }}</text>
          竞猜币
        </view>
        <template v-if="info.voteData.BetType === 0">
          <view class="team-box flex" :class="[isShowThree ? 'ping' : '']">
            <view
              v-for="(child, q) in info.voteData.Ranks"
              :key="q"
              class="team flex-1"
              :class="[child.IsEquality ? 'ping-team' : '']"
            >
              <!-- 可能有假数组 -->
              <template v-if="child.Name">
                <text v-if="q == 1 && child.IsEquality" class="ping-text">平</text>
                <image v-else :src="child.ImageUrl" class="team-icon" />
                <view v-if="!child.IsEquality" class="team-name fsz-30">{{ child.Name }}</view>
                <input v-model="child.BetNum" type="number" class="team-input" placeholder="请输入" maxlength="4" />
              </template>
            </view>
          </view>
          <image :src="`${baseStaticUrl}/queren2.png?v2`" class="vote-btn" @tap.stop="handleSubmit" />
        </template>
        <template v-if="info.voteData.BetType === 1">
          <template v-if="step === 1">
            <view class="team-box flex" :class="[isShowThree ? 'ping' : '']">
              <view
                v-for="(child, q) in info.voteData.Ranks"
                :key="q"
                class="team flex-1"
                :class="[child.IsEquality ? 'ping-team' : '']"
              >
                <!-- 可能有假数组 -->
                <template v-if="child.Name">
                  <image v-if="q == 1 && child.IsEquality" :src="`${baseStaticUrl}/VS.png`" class="team-icon" />
                  <image v-else :src="child.ImageUrl" class="team-icon" />
                  <view v-if="!child.IsEquality" class="team-name fsz-30">{{ child.Name }}</view>
                  <view v-else class="team-name fsz-30 ping-name">平局</view>
                  <!-- 开启平局，输入框模式 -->
                  <template v-if="IsEquality">
                    <input
                      v-if="child.IsEquality"
                      v-model="selectTeamData.BetNum"
                      type="number"
                      class="team-input"
                      placeholder="请输入"
                      maxlength="4"
                    />
                  </template>
                  <template v-else>
                    <image
                      v-if="child.IsEquality"
                      :src="`${baseStaticUrl}/tb2.png`"
                      class="select-team-button mt-42"
                      @click="handleSelectTeam(child)"
                    />
                    <image
                      v-else
                      :src="`${baseStaticUrl}/tb.png`"
                      class="select-team-button mt-50"
                      @click="handleSelectTeam(child)"
                    />
                  </template>
                </template>
              </view>
            </view>
            <image
              v-if="IsEquality"
              :src="`${baseStaticUrl}/queren2.png?v2`"
              class="vote-btn-3"
              @tap.stop="handleSubmit"
            />
            <view v-if="!IsEquality && info.voteData.SingleBetNum" class="text-tips">
              *单场最多可投{{ info.voteData.SingleBetNum }}个竞猜币
            </view>
          </template>
          <template v-if="step === 2">
            <view class="team-content">
              <image :src="selectTeamData.ImageUrl" class="team-icon" />
              <view class="name">{{ selectTeamData.Name }}</view>
              <scroll-view :scroll-y="true" class="input-box">
                <view v-for="(item, index) in selectTeamData.BettingOptions" :key="index" class="flex">
                  <view class="left">{{ item.Name }}</view>
                  <view class="right">
                    <input v-model="item.BetNum" type="number" placeholder="请输入" maxlength="4" />
                  </view>
                </view>
              </scroll-view>
              <image :src="`${baseStaticUrl}/queren2.png?v2`" class="vote-btn" @tap.stop="handleSubmit" />
            </view>
          </template>
        </template>
      </view>
      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2 fw-bold" @tap.stop="close" />
      </view>
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
export default {
  name: 'VoteDialog',
  mixins: [dialogMixin],
  props: {
    baseStaticUrl: {
      type: String,
      default: ''
    },
    info: {
      type: Object,
      default: () => {
        return {
          voteData: {
            Ranks: []
          }
        }
      }
    }
  },
  data() {
    return {
      step: 1, //1选择队伍 ，2 输入,
      selectTeamData: {},
      IsEquality: false //选择的是否平局
    }
  },
  computed: {
    isShowThree() {
      return this.info.voteData.Ranks.every(item => item.Name)
    }
  },
  watch: {
    showDialog(val) {
      if (!val) {
        this.step = 1
        this.IsEquality = false
      }
    }
  },
  methods: {
    handleSelectTeam(item) {
      let row = JSON.parse(JSON.stringify(item))
      this.IsEquality = row.IsEquality

      if (item.IsEquality) {
        row.BetNum = ''
      } else {
        row.BettingOptions = row.BettingOptions.map(element => {
          return {
            TeamId: element.ID,
            BetNum: '',
            Name: element.Name
          }
        })
        this.step = 2
      }
      this.selectTeamData = row
    },
    handleSubmit() {
      let arr = []
      // 区分模式
      if (this.info.voteData.BetType === 0) {
        arr = this.info.voteData.Ranks.map(item => {
          return {
            TeamId: item.ID,
            BetNum: Number(item.BetNum)
          }
        })
        if (!arr.some(item => item.BetNum > 0)) {
          return this.$msg('请确认竞猜数额')
        }
      } else {
        if (this.IsEquality && !this.selectTeamData.BetNum.trim()) {
          return this.$msg('请确认竞猜数额')
        }
        if (!this.IsEquality && !this.selectTeamData.BettingOptions.some(item => item.BetNum > 0)) {
          return this.$msg('请确认竞猜数额')
        }
        if (this.IsEquality) {
          arr = [
            {
              TeamId: this.selectTeamData.ID,
              BetNum: Number(this.selectTeamData.BetNum)
            }
          ]
        } else {
          arr = this.selectTeamData.BettingOptions.map(item => {
            return {
              BetNum: Number(item.BetNum),
              TeamId: item.TeamId
            }
          })
        }
      }

      this.$emit('handleVoteMatches', {
        ActId: this.info.aid,
        MatchId: this.info.voteData.ID,
        Memberlogin: this.info.voteData.MemberLogin,
        Ranks: arr
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: vote-dialog;
.fsz-30 {
  font-size: 30;
}
.mt-42 {
  margin-top: 42rpx;
}
.vote-btn-3 {
  width: 225rpx;
  height: 70rpx;
  margin: 30rpx auto 0;
  display: block;
}
.text-tips {
  font-size: 26rpx;
  font-family: PingFang SC;
  font-weight: 400;
  color: #f4dd56;
  text-align: center;
  margin-top: 140rpx;
}
.#{$prefix} {
  width: 600rpx;
  height: 810rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .content {
    margin-top: 240rpx;
    .num-text {
      margin-top: 40rpx;
      font-size: 32rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #b6d2ff;
      text-align: center;
      .num {
        color: #fff426;
        margin: 0 20rpx;
      }
    }
    .team-box {
      padding: 0 80rpx;
      justify-content: space-between;
      .team {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 60rpx;

        .team-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          overflow: hidden;
        }
        .team-name {
          color: #fff;
          margin-top: 23rpx;
          font-weight: 700;
          text-align: center;
        }
        .ping-name {
          font-weight: 400;
          color: #fbde99;
          background: linear-gradient(0deg, #fad272 0%, #fcf8f4 92.1142578125%);
          -webkit-text-fill-color: transparent;
          font-size: 34rpx;
          -webkit-background-clip: text;
          background-clip: text;
        }
        .team-input {
          margin-top: 22rpx;
          width: 180rpx;
          height: 70rpx;
          background: #eae5f3;
          border: 1rpx solid #303030;
          border-radius: 10rpx;
          text-align: center;
        }
        .select-team-button {
          width: 144rpx;
          height: 44rpx;
        }
      }
    }
    .ping {
      padding: 0 30rpx;
      .team {
        .team-input {
          width: 150rpx;
        }
      }
      .ping-team {
        .ping-text {
          font-size: 48rpx;
          font-weight: 700;
          color: #fff;
          margin-top: 20rpx;
        }
        .team-input {
          /* #ifdef MP-WEIXIN */
          margin-top: 75rpx;
          /* #endif */
          /* #ifdef H5 */
          margin-top: 68rpx;
          /* #endif */
        }
      }
    }
    .team-content {
      .team-icon {
        width: 110rpx;
        height: 110rpx;
        margin: 30rpx auto 0;
        border-radius: 50%;
        overflow: hidden;
        display: block;
      }
      .name {
        text-align: center;
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: bold;
        color: #ffffff;
        margin-top: 10rpx;
      }
      .input-box {
        height: 180rpx;
        overflow-y: scroll;
        margin-top: 20rpx;
        .left {
          color: #fbde99;
          background: linear-gradient(0deg, #fad272 0%, #fcf8f4 92.1142578125%);
          -webkit-text-fill-color: transparent;
          font-size: 36rpx;
          -webkit-background-clip: text;
          background-clip: text;
          font-weight: 700;
          width: 280rpx;
          margin-right: 32rpx;
          margin-left: 100rpx;
        }
        .right {
          width: 136rpx;
          height: 52rpx;
          background: #ffffff;
          border: 2px solid #134e02;
          input {
            width: 100%;
            font-size: 30rpx;
            height: 100%;
            padding-left: 14rpx;
          }
        }
      }
      .vote-btn {
        width: 225rpx;
        height: 70rpx;
        margin: 30rpx auto 0;
      }
    }
    .vote-btn {
      width: 225rpx;
      height: 70rpx;
      display: block;
      margin: 60rpx auto 0;
    }
  }
  .mt-200 {
    margin-top: 200rpx;
  }
  .title-icon {
    position: absolute;
    width: 472rpx;
    height: 60rpx;
    top: 140rpx;
    left: 76rpx;
  }
  .close-btn {
    position: absolute;
    left: 270rpx;
    bottom: -140rpx;
    margin-top: 60rpx;
    color: #fff;
    .iconfont {
      font-size: 60rpx;
    }
  }
}
</style>
