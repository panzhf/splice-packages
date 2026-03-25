<template>
  <scroll-view scroll-y scroll-with-animation class="list" :style="{ maxHeight: scrollViewHeight }">
    <view
      v-for="(item, index) in list"
      :key="index"
      class="list-item"
      :style="{ backgroundImage: `url(${baseStaticUrl}/football-bg.png)` }"
    >
      <view style="height: 72rpx">
        <!-- 百年不同 -->
        <view
          v-if="temaleteType === 1 && item.EstimatePrizeTime"
          class="header"
          :style="{ backgroundImage: `url(${baseStaticUrl}/start-mony.png)` }"
        >
          <text class="num" style="margin-right: 0rpx">开奖时间：{{ item.EstimatePrizeTime }}</text>
        </view>
        <view
          v-if="temaleteType !== 1 && strategy.IsShowAmount"
          class="header"
          :style="{ backgroundImage: `url(${baseStaticUrl}/start-mony.png)` }"
        >
          本局开奖金额：
          <text class="num">{{ item.Amount }}</text>
          元
        </view>
      </view>
      <view v-if="item.Status === 2" class="result-content">
        <view
          v-for="(child, t) in item.Ranks"
          :key="t"
          :class="[child.Name && child.Name !== '平局' ? 'item' : 'dian']"
        >
          <template v-if="child.Name && child.Name !== '平局'">{{ child.ActualScore || '' }}</template>
          <!-- 第一项和第三项都有值才显示 -->
          <template v-else>{{ item.Ranks[0].ActualScore && item.Ranks[2].ActualScore ? ':' : '' }}</template>
        </view>
      </view>
      <!-- <process :process="item.processData" class="process" /> -->
      <!-- 默认模式 -->
      <template v-if="!item.BetType">
        <view class="team-box flex">
          <view v-for="(child, q) in item.Ranks" :key="q" class="team flex-1">
            <!-- 只有双方队伍时 -->
            <template v-if="q == 1 && !child.Name">
              <image v-if="baseStaticUrl" :src="`${baseStaticUrl}/VS.png`" class="team-icon" mode="scaleToFill" />
              <view v-if="q == 1 && child.IsEquality" class="team-name fsz-30">平</view>
              <!-- 百年才有 -->
              <template v-if="temaleteType === 1 && strategy.IsShowAmount">
                <view class="money">{{ item.Amount }}</view>
                <view class="money-text">奖池金额（¥）</view>
              </template>
            </template>

            <template v-else>
              <image
                v-if="q == 1 && child.IsEquality"
                :src="baseStaticUrl + '/VS.png'"
                class="team-icon"
                mode="scaleToFill"
              />
              <image v-else :src="child.ImageUrl" class="team-icon" mode="scaleToFill" />
              <view v-if="q == 1 && child.IsEquality" class="team-name fsz-30">平</view>
              <view v-else class="team-name fsz-30">{{ child.Name }}</view>
              <!-- 百年定制 -->
              <template v-if="temaleteType === 1">
                <view
                  v-if="item.IsShowBetNum"
                  class="item-lable-bn"
                  :style="{ backgroundImage: `url(${baseStaticUrl}/myzs.png)` }"
                >
                  <view class="lable">支持总数</view>
                  <view class="lable-value">{{ child.BetNum }}</view>
                </view>
                <view class="item-lable-bn mt-15" :style="{ backgroundImage: `url(${baseStaticUrl}/myzs.png)` }">
                  <view class="lable">我的竞猜</view>
                  <view class="lable-value">{{ child.PersonalBetNum }}</view>
                </view>
              </template>

              <template v-else>
                <view v-if="item.IsShowBetNum" class="item-lable">竞猜总数 {{ child.BetNum }}</view>
                <view class="item-lable">我的竞猜 {{ child.PersonalBetNum }}</view>
              </template>
            </template>

            <template v-if="item.Status === 2 && item.MatchesResult && item.MatchesResult === child.ID">
              <view :class="['iconfont', 'state-icon', child.IsEquality ? 'iconpingju' : 'iconshengli']" />
            </template>
          </view>
        </view>
      </template>

      <!-- 投注项模式 -->
      <template v-if="item.BetType === 1">
        <view class="team-box flex p-none type2">
          <view
            v-for="(child, q) in item.Ranks"
            :key="q"
            :class="['team', q == 1 && child.IsEquality ? 'flex-2' : 'flex-3']"
          >
            <!-- 中间 -->
            <template v-if="q == 1">
              <image :src="baseStaticUrl + '/VS.png'" class="team-icon team-icon-t2" mode="scaleToFill" />
              <template v-if="strategy.IsShowAmount && temaleteType === 1">
                <view class="money">{{ item.Amount }}</view>
                <view class="money-text">奖池金额（¥）</view>
              </template>
              <view v-if="child.IsEquality" class="ping-box">
                <!-- <image
                  v-if="item.Status === 2 && item.MatchesResult && item.MatchesResult === child.ID"
                  :src="`${baseStaticUrl}/state-icon.png?v1`"
                  mode="scaleToFill"
                  class="state-img"
                /> -->
                <view class="ping-text">平局</view>
                <view v-if="item.IsShowBetNum" class="cont">
                  <view class="left">竞猜总数</view>
                  <view class="right">{{ child.BetNum }}</view>
                </view>
                <view class="cont">
                  <view class="left">我的竞猜</view>
                  <view class="right">{{ child.PersonalBetNum }}</view>
                </view>
              </view>
            </template>

            <!-- 两边 -->
            <template v-if="q !== 1 && !child.IsEquality">
              <view class="icon-box">
                <image :src="child.ImageUrl" class="team-icon" mode="scaleToFill" />
                <image
                  v-if="
                    item.Status === 2 &&
                    item.MatchesResult &&
                    child.BettingOptions &&
                    child.BettingOptions.some(v => v.ID === item.MatchesResult)
                  "
                  :src="`${baseStaticUrl}/state-icon.png?v2`"
                  mode="scaleToFill"
                  class="state-img"
                />
              </view>

              <view class="team-name fsz-30">{{ child.Name }}</view>
              <view class="title-text">
                <view v-if="item.IsShowBetNum" class="title">竞猜总数</view>
                <view class="title">我的竞猜</view>
              </view>
              <view
                v-for="(v, j) in child.BettingOptions"
                :key="j"
                :class="['item-lable-bn', 't2', j >= 1 ? 'mt-15' : '']"
                :style="{ backgroundImage: `url(${baseStaticUrl}/myzs2.png)` }"
              >
                <!-- <image
                  v-if="item.Status === 2 && item.MatchesResult && item.MatchesResult === v.ID"
                  :src="`${baseStaticUrl}/state-icon.png?v3`"
                  mode="scaleToFill"
                  class="state-img"
                /> -->
                <view class="lable">{{ v.Name }}</view>
                <view class="lable-value flex-1">
                  <view v-if="item.IsShowBetNum" class="sum-amount">{{ v.BetNum }}</view>
                  <view :class="['me-amount', item.IsShowBetNum ? '' : 'w100']">{{ v.PersonalBetNum }}</view>
                </view>
              </view>
            </template>
          </view>
        </view>
      </template>
      <view class="vote-btn-box">
        <image
          v-if="item.Status === 3 && baseStaticUrl"
          :src="`${baseStaticUrl}/vote-btn2.png`"
          :class="['vote-btn', item.BetType === 1 ? 'vote-btn-2' : '']"
          @tap="handleVote(item)"
        />
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>

      <image
        v-if="item.Status === 4 && baseStaticUrl"
        :src="`${baseStaticUrl}/dai.png`"
        :class="['vote-btn', item.BetType === 1 ? 'vote-btn-2' : '']"
      />
      <image v-if="item.Status === 1 && baseStaticUrl" :src="`${baseStaticUrl}/no-btn.png?v2`" class="vote-btn" />
      <view v-if="item.Status === 3" class="end-time">截止竞猜时间：{{ item.EndTime }}</view>
    </view>
    <none-data v-if="!list.length" text-color="#fff4db" />
    <!-- </view> -->
  </scroll-view>
</template>

<script>
import NoneData from '@/components/none-data/index.vue'
// import Process from './process.vue'
export default {
  components: {
    NoneData
    // Process
  },
  props: {
    baseStaticUrl: {
      type: String,
      default: ''
    },
    temaleteType: {
      type: Number,
      default: 1
    },
    list: {
      type: Array,
      default: () => []
    },
    strategy: {
      type: Object,
      default: () => {
        return {
          IsShowAmount: false //显示金额
        }
      }
    }
  },
  data() {
    // Status  1待开奖2已开奖3投注中4待投注
    return {
      itemTheme: {
        textAlign: 'center',
        fontSize: '20rpx',
        lineHeight: '20rpx'
      },
      processArray1: [
        {
          number: 30,
          showText: true,
          style: {
            backgroundColor: '#E3003D',
            textAlign: 'center',
            fontSize: '20rpx',
            lineHeight: '20rpx',
            borderRadius: '10rpx',
            color: '#fff'
          }
        },
        {
          number: 70,
          showText: true,
          style: {
            backgroundColor: '#3965BE',
            textAlign: 'center',
            fontSize: '20rpx',
            lineHeight: '20rpx',
            borderRadius: '10rpx',
            color: '#fff'
          }
        },
        {
          number: 33,
          showText: true,
          style: {
            backgroundColor: '#FFF28F',
            textAlign: 'center',
            fontSize: '20rpx',
            lineHeight: '20rpx',
            color: '#E3003D',
            borderRadius: '10rpx'
          }
        }
      ],
      scrollViewHeight: ''
    }
  },
  mounted() {
    /* #ifdef H5 */
    this.scrollViewHeight = `calc(1100rpx - env(safe-area-inset-bottom))`
    /* #endif */
    /* #ifdef MP-WEIXIN */
    this.scrollViewHeight = `calc(1170rpx - env(safe-area-inset-bottom))`
    /* #endif */
  },
  methods: {
    handleVote(item) {
      this.$emit('Vote', item)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';

.list {
  .list-item {
    margin: 20rpx auto 0;
    @include bg();
    width: 670rpx;
    min-height: 370rpx;
    position: relative;
    &:first-child {
      margin: 10rpx auto 0;
    }
    .result-content {
      position: absolute;
      left: 50%;
      top: 76rpx;
      transform: translateX(-50%);
      display: flex;
      width: 300rpx;
      justify-content: space-between;
      color: #fff;
      font-size: 32rpx;
      font-weight: 700;
      .dian {
        width: 20rpx;
        display: flex;
        justify-content: center;
      }
      .item {
        flex: 1;
        display: flex;
        justify-content: center;
      }
    }
    .header {
      margin: 0 auto;
      width: 490rpx;
      height: 72rpx;
      @include bg();
      line-height: 72rpx;
      text-align: center;
      font-size: 30rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #fff;
      .num {
        color: #fdf327;
        margin-right: 10rpx;
      }
    }
  }
  .no-state {
    height: 400rpx;
  }
  .team-box {
    padding: 0 30rpx;
    justify-content: space-between;
    padding-bottom: 60rpx;
    .team {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20rpx;
      position: relative;
      .state-icon {
        position: absolute;
        top: 80rpx;
        font-size: 130rpx;
        color: #bf1541;
        left: 26rpx;
        font-weight: 500;
      }
      .money {
        color: #fff426;
        font-size: 40rpx;
        font-weight: bold;
        text-align: center;
      }
      .money-text {
        margin-top: 26rpx;
        font-size: 24rpx;
        color: #ffffff;
        text-align: center;
      }
      .team-icon {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        overflow: hidden;
      }
      .icon-box {
        position: relative;
        .state-img {
          position: absolute;
          width: 64rpx;
          height: 150rpx;
          top: -30rpx;
          right: -26rpx;
        }
      }
      .team-name {
        color: #fff;
        margin-top: 23rpx;
        font-weight: 700;
        text-align: center;
      }
      .item-lable {
        font-size: 22rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #fdf0be;
        margin-top: 10rpx;
      }
      .title-text {
        display: flex;
        padding-left: 70rpx;
        margin-top: 20rpx;
        .title {
          width: 36rpx;
          font-size: 16rpx;
          font-family: PingFang SC;
          font-weight: 500;
          font-style: italic;
          color: #fff;
          margin-left: 32rpx;
        }
      }
      .item-lable-bn {
        display: flex;
        margin-top: 10rpx;
        @include bg();
        width: 200rpx;
        .lable {
          font-size: 18rpx;
          font-family: PingFang SC;
          font-weight: 500;
          color: #fdf0be;
          width: 90rpx;
          text-align: center;
          // height: 30rpx;
          line-height: 30rpx;
        }
        .lable-value {
          font-size: 25rpx;
          font-family: PingFang SC;
          font-style: italic;
          color: #fff;
          width: 90rpx;
          text-align: center;
        }
      }
    }
  }
  .type2 {
    .team {
      .team-icon-t2 {
        width: 60rpx;
        height: 60rpx;
        margin-top: 50rpx;
      }
      .money {
        margin-top: 50rpx;
      }
      .money-text {
        margin-top: 0;
      }
      .ping-box {
        border: 1rpx solid #d40038;
        width: 150rpx;
        margin-top: 26rpx;
        position: relative;
        .state-img {
          position: absolute;
          top: -17rpx;
          right: -15rpx;
          width: 31rpx;
          height: 68rpx;
        }
        .ping-text {
          font-size: 18rpx;
          font-weight: bold;
          color: #ffffff;
          height: 32rpx;
          background: #d40038;
          text-align: center;
          line-height: 32rpx;
        }
        .cont {
          display: flex;
          align-items: center;
          .left {
            font-size: 14rpx;
            font-family: PingFang SC;
            font-weight: 500;
            font-style: italic;
            color: #fff;
            width: 70rpx;
            text-align: center;
          }
          .right {
            font-size: 22rpx;
            font-family: PingFang SC;
            color: #fff;
            flex: 1;
            text-align: center;
          }
        }
      }
    }

    .t2 {
      width: 230rpx;
      position: relative;
      .state-img {
        position: absolute;
        top: -10rpx;
        left: 52rpx;
        width: 31rpx;
        height: 68rpx;
      }
      .lable {
        width: 80rpx !important;
      }
      .lable-value {
        display: flex;
        .sum-amount,
        .me-amount {
          width: 80rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .w100 {
          width: 100%;
        }
      }
    }
  }
  .p-none {
    padding: 0 0 40rpx 0;
  }
  .process {
    position: absolute;
    width: 450rpx;
    height: 20rpx;
    left: 150rpx;
    top: 130rpx;
    border-radius: 10rpx;
    overflow: hidden;
  }
  .vote-btn-box {
    position: relative;
    margin: 0 auto;
    width: 230rpx;
    height: 75rpx;
    padding-bottom: 20rpx;
    display: block;
  }
  .vote-btn {
    margin: 0 auto;
    width: 230rpx;
    height: 75rpx;
    padding-bottom: 20rpx;
    display: block;
  }
  .vote-btn-2 {
    margin: 26rpx auto 0;
    width: 232rpx;
    height: 75rpx;
    padding-bottom: 20rpx;
    display: block;
  }
  .end-time {
    font-size: 24rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #fff426;
    text-align: center;
    margin-top: 8rpx;
    padding-bottom: 30rpx;
  }
  .mtop-60 {
    margin-top: 60rpx;
  }
}
</style>
