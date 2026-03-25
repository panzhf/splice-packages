<template>
  <view v-if="isShow" class="unlock-list-dialog-container">
    <view class="mask" @click="handleClickMask"></view>
    <view class="content" :style="{ backgroundImage: 'url(' + PopupBg + ')' }">
      <view class="name">
        <view class="title">
          您有
          <text class="num">{{ info.length }}</text>
          个红包券待解锁
        </view>
      </view>
      <view class="content-box">
        <scroll-view :scroll-top="0" scroll-y="true" class="scroll-Y">
          <!-- #ifdef H5 -->
          <view
            v-for="item in info"
            :key="item.CouponRecordID"
            class="scroll-view-item"
            :style="{
              backgroundImage: 'url(' + listBg + ')',
              backgroundSize: '100%'
            }"
          >
            <view class="left">
              <view class="title">{{ item.CouponName }}</view>
              <view class="money">￥{{ item.Amount }}</view>
              <countdown-theme
                ref="countDown"
                :end-time="item.EffectiveEndTime"
                :tips="`${item.Type == 1 ? `后过期，每小时贬值${item.DeclineRule}元` : '后过期'}`"
              ></countdown-theme>
            </view>
            <view class="right">
              <view class="tx-buttom" @tap="handleGetCouponExplain(item)">如何解锁</view>
            </view>
          </view>
          <!-- #endif -->
          <!-- #ifdef MP-WEIXIN -->
          <view
            v-for="item in info"
            :key="item.couponrecordid"
            class="scroll-view-item"
            :style="{
              backgroundImage: 'url(' + listBg + ')',
              backgroundSize: '100%'
            }"
          >
            <view class="left">
              <view class="title">{{ item.couponname }}</view>
              <view class="money">￥{{ item.amount }}</view>
              <countdown-theme
                ref="countDown"
                :end-time="item.effectiveendtime"
                :tips="`${item.type == 1 ? `后过期，每小时贬值${item.declinerule}元` : '后过期'}`"
              ></countdown-theme>
            </view>
            <view class="right">
              <view class="tx-buttom" @tap="handleGetCouponExplain(item)">如何解锁</view>
            </view>
          </view>
          <!-- #endif -->
        </scroll-view>
      </view>
      <view class="iconfont icon-close2 close-btn" @tap="handleCloseDialog"></view>
    </view>

    <!-- 提示弹窗 -->
    <Dialog ref="Dialog" />

    <!-- 如何解锁待解锁红包券说明弹窗 -->
    <hb-unlock-explain
      v-if="lockGuide.isVisible"
      :title="lockGuide.title"
      :content="lockGuide.content"
      @close="lockGuide.isVisible = false"
    ></hb-unlock-explain>
  </view>
</template>

<script>
/* #ifdef H5 */
import { apiGetCouponExplain } from '../../api/scan'
import { getQuery } from '../../utils/function'
/* #endif */
/* #ifdef MP-WEIXIN */
import { apiCouponExplain } from '../../api/scan'
import { getQuery } from '@/utils'
/* #endif */
import Dialog from './dialog'
import HbUnlockExplain from './hb-unlock-explain'
import { staticURL } from '@/config'
import CountdownTheme from './countdown-theme.vue'
export default {
  components: {
    CountdownTheme,
    Dialog,
    HbUnlockExplain
  },
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 弹窗内容
    info: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      PopupBg: staticURL(true) + 'bg_top.png',
      listBg: staticURL(true) + 'jsbg.png',
      unlockExplainImg: staticURL(true) + 'scan/hb-voucher__unlock-explain-pop__process.jpg',
      lockGuide: {
        isVisible: false,
        title: '红包券解锁攻略',
        content: ''
      }
    }
  },
  methods: {
    // 点击遮罩
    handleClickMask() {
      // this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    },
    // 如何解锁待解锁红包券
    handleGetCouponExplain(currentItem) {
      /* #ifdef H5 */
      apiGetCouponExplain({
        MemberLogin: getQuery('m'),
        CouponId: currentItem.CouponId // 券id
      })
        .then(res => {
          this.handleOpenLockGuide(res.return_data.Explain)
        })
        .catch(err => {
          this.$msg(err.return_msg)
        })
      /* #endif */
      /* #ifdef MP-WEIXIN */
      apiCouponExplain({
        CouponId: currentItem.couponid // 券id
      }).then(res => {
        if (res.return_code === 0) {
          this.handleOpenLockGuide(res.return_data.explain)
        } else {
          this.$msg(res.return_msg)
        }
      })
      /* #endif */
    },
    handleOpenLockGuide(content) {
      this.lockGuide.isVisible = true
      let str = content
      str = str.replace(
        /<img src([^>\s]+)(([^>]+)\s?style="(.*?)"\s?)?\/>/gi,
        '<img src$1 style="max-width:100%;height:auto;vertical-align:middle;" />'
      )
      this.lockGuide.content = str
    }
  }
}
</script>

<style lang="scss" scoped>
.unlock-list-dialog-container {
  position: fixed;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  .state-img {
    position: absolute;
    bottom: 30rpx;

    width: 319rpx;
    height: 223rpx;
  }
  .mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;

    width: 680rpx;

    animation: tanchuang 0.4s ease-in-out;

    border-radius: 40rpx;
    background-image: linear-gradient(#e91f1f, #ff4147);
    background-repeat: no-repeat;
    background-size: 100%;
    .name {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;

      width: 100%;
      height: 220rpx;

      .title {
        text-align: center;

        color: #000000;

        font-family: PingFang SC Bold, PingFang SC Bold-Bold;
        font-size: 40rpx;
        font-weight: 700;
        line-height: 88rpx;
        .num {
          margin: 0 10rpx;

          color: #f0311d;
        }
      }
    }
    .content-box {
      width: 100%;
      padding: 0 25rpx;

      border-radius: 0 0 20rpx 20rpx;
      background-color: #fb383e;
      .scroll-Y {
        max-height: 700rpx;
        margin-top: 40rpx;
        margin-bottom: 25rpx;
        .scroll-view-item {
          display: flex;
          align-items: center;

          width: 100%;
          height: 198rpx;
          margin-bottom: 20rpx;
          padding: 20rpx;

          border-radius: 10rpx;
          background: linear-gradient(0deg, #ffe3a2 24%, #ffb347 100%);
          box-shadow: 0px 0px 30px 0px #ffffff inset;
          .left {
            flex: 1;
            .title {
              color: #000000;

              font-size: 28rpx;
              font-weight: 700;
            }
            .money {
              margin: 10rpx 0;

              color: #f0311d;

              font-family: PingFang SC Bold, PingFang SC Bold-Bold;
              font-size: 50rpx;
              font-weight: 700;
              line-height: 54rpx;
              &:first-letter {
                font-size: 40rpx;
              }
            }
            .time {
              display: flex;
              .time-box {
                display: flex;
                align-items: center;
                .time-item {
                  width: 36rpx;
                  height: 36rpx;

                  text-align: center;

                  color: #fff;
                  border-radius: 6rpx;
                  background-color: #000;

                  font-size: 24rpx;
                }
                .empty {
                  margin: 0 6rpx;
                }
              }
            }
          }
          .right {
            display: flex;
            align-items: center;
            justify-content: center;

            .tx-buttom {
              width: 110rpx;
              height: 50rpx;

              text-align: center;

              opacity: 1;
              color: #ffffff;
              border-radius: 25rpx;
              background: linear-gradient(0deg, #ff2529 0%, #ff5e1f 100%);

              font-size: 24rpx;
              line-height: 50rpx;
            }
          }
        }
      }
    }

    .close-btn {
      position: absolute;
      bottom: -150rpx;

      color: #fff;

      font-size: 72rpx;
    }
  }
}

@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
