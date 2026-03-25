<template>
  <!-- #ifdef H5 -->
  <view v-show="isShow" class="win-dialog-container" :style="{ 'z-index': zIndex }">
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <view v-if="isShow" class="win-dialog-container" :style="{ 'z-index': zIndex }">
      <!-- #endif -->
      <view class="mask" @click="handleClickMask" />
      <view class="iconfont icon-close2 close-btn" @click="handleCloseDialog" />
      <view class="content">
        <image
          class="pop__title"
          :style="{ width: isFristAward ? '500rpx' : '634rpx', height: isFristAward ? '142rpx' : '196rpx' }"
          :src="popTitleImg"
          mode="scaleToFill"
        />
        <view class="pop__content">
          <view class="pop__bg-top">
            <image class="pop__bg-top-img" style="width: 628rpx; height: 60rpx" :src="bgTopImg" mode="scaleToFill" />
          </view>
          <view class="dialog-content-title" :style="{ backgroundImage: 'url(' + bgCenterImg + ')' }">
            <view class="award-name">你获得了{{ prizeInfo.PrizeName }}</view>
            <view class="award-time">参与时间：{{ prizeInfo.Addtime }}</view>
          </view>
          <view class="pop__bg-center" :style="{ backgroundImage: 'url(' + bgCenterImg + ')' }">
            <!-- 红包零钱 -->
            <view
              v-if="prizeInfo.IsGetHb"
              class="pop__prize-item"
              :style="{ backgroundImage: 'url(' + prizeBgImg + ')' }"
            >
              <image class="prize-icon" :src="hongImg" mode="widthFix" />
              <view>
                <view class="prize-name ellipsis">{{ prizeInfo.PrizeHbName }}</view>
                <view
                  v-if="!prizeInfo.IsHbsendResult && ['发放中', '发放成功（待到账）'].includes(prizeInfo.HbSendResult)"
                  class="prize-desc ellipsis-2"
                >
                  <!-- <image :src="hbLoading"  mode="scaleToFill" class="img-loading" /> -->
                  <!-- 红包已发出，请到微信上查阅（若未到账请联系客服补发） -->
                  {{
                    prizeInfo.HbType === 1 ? '发放中，稍后可到“我的奖品”中查看' : '红包已发出，稍后可到“微信钱包”查收~'
                  }}
                </view>
                <view v-else class="prize-desc ellipsis-2">{{ prizeInfo.PrizeHbReceiveDesc }}</view>
              </view>
              <view
                v-if="prizeInfo.HbType === 1 && prizeInfo.IsHbsendResult"
                class="prize-btn"
                :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                @tap="handlewithdraw(prizeInfo.prizeHbReceiveDescLink)"
              >
                {{ prizeInfo.prizeHbReceiveDescText }}
              </view>
              <template v-else>
                <!-- #ifdef H5 -->
                <view
                  v-if="prizeInfo.HbSendResult == '发放失败' && prizeInfo.prizeHbReceiveDescLink"
                  class="prize-btn"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  @tap="handlewithdraw(prizeInfo.prizeHbReceiveDescLink)"
                >
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  v-if="prizeInfo.HbSendResult == '发放失败'"
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  open-type="contact"
                >
                  联系客服
                </button>
                <!-- #endif -->
              </template>
            </view>
            <!-- 券 -->
            <view
              v-if="prizeInfo.IsGetVolume"
              class="pop__prize-item"
              :style="{ backgroundImage: 'url(' + prizeBgImg + ')' }"
            >
              <image v-if="prizeInfo.VolumeType === 2" class="prize-icon" :src="prizeInfo.VoucherImg" mode="widthFix" />
              <image v-else class="prize-icon" :src="kaquanImg" mode="widthFix" />
              <view>
                <view class="prize-name ellipsis">
                  {{ prizeInfo.VolumeType === 0 ? prizeInfo.ParValue : '' }}{{ prizeInfo | volumeType }}
                </view>
                <view class="prize-desc ellipsis-2">
                  <text v-if="prizeInfo.VolumeStatus === 2">发放中，稍后可到“我的奖品”中查看</text>
                  <text v-else-if="prizeInfo.VolumeStatus === 0">抱歉，卡券发放失败，请联系客服进行补发</text>
                  <text v-else-if="[0, 1, 2, 14].indexOf(prizeInfo.VolumeType) > -1">
                    {{ prizeInfo.PrizeVolumeReceiveDesc }}
                  </text>
                  <text
                    v-else-if="
                      prizeInfo.VolumeType === 3 &&
                      prizeInfo.VolumeStatus == 1 &&
                      prizeInfo.PrizeVolumeState != 2 &&
                      new Date(
                        prizeInfo.PrizeVolumeEffectiveEndTime
                          ? prizeInfo.PrizeVolumeEffectiveEndTime.replace(/-/g, '/')
                          : ''
                      ).getTime() <= Date.now()
                    "
                  >
                    <!-- 已过期状态 -->
                    已过期
                  </text>
                  <view v-else-if="prizeInfo.VolumeType === 3" class="hbvoucher-countdown">
                    <text v-if="countTimeItem.day > 0" class="hbvoucher-countdown-item">{{ countTimeItem.day }}</text>
                    <text v-if="countTimeItem.day > 0" style="color: #999" class="hbvoucher-countdown-colon">天</text>
                    <text class="hbvoucher-countdown-item">{{ countTimeItem.newhour }}</text>
                    <text class="hbvoucher-countdown-colon">:</text>
                    <text class="hbvoucher-countdown-item">{{ countTimeItem.minute }}</text>
                    <text class="hbvoucher-countdown-colon">:</text>
                    <text class="hbvoucher-countdown-item">{{ countTimeItem.second }}</text>
                    <text class="hbvoucher-countdown-colon">:</text>
                    <text class="hbvoucher-countdown-item hbvoucher-countdown-item--last">
                      {{ countTimeItem.millisecond }}
                    </text>
                    <text class="hbvoucher-countdown-tips">后过期</text>
                    <text v-if="prizeInfo.PrizeVolumeCouponType === 1" class="hbvoucher-countdown-tips">
                      ,每小时贬值{{ prizeInfo.PrizeVolumeDeclineRule }}元
                    </text>
                  </view>
                  <text v-else>已到账，可商城下单抵扣</text>
                </view>
              </view>
              <!-- 右侧按钮 -->
              <view v-if="prizeInfo.VolumeStatus === 2" />
              <template v-else-if="prizeInfo.VolumeStatus === 0">
                <!-- #ifdef H5 -->
                <view class="prize-btn" :style="{ backgroundImage: 'url(' + btnImg + ')' }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  open-type="contact"
                >
                  联系客服
                </button>
                <!-- #endif -->
              </template>
              <template v-else-if="prizeInfo.VolumeStatus == 1">
                <view
                  v-if="
                    prizeInfo.VolumeType === 3 &&
                    prizeInfo.PrizeVolumeState != 2 &&
                    new Date(
                      prizeInfo.PrizeVolumeEffectiveEndTime
                        ? prizeInfo.PrizeVolumeEffectiveEndTime.replace(/-/g, '/')
                        : ''
                    ).getTime() <= Date.now()
                  "
                  class="prize-btn"
                >
                  已过期
                </view>
                <view
                  v-else-if="prizeInfo.VolumeType === 3"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  class="prize-btn"
                  @tap="handleGetCouponExplain"
                >
                  如何解锁
                </view>
                <view v-else class="prize-btn" :style="{ backgroundImage: 'url(' + btnImg + ')' }" @tap="handleVolume">
                  去使用
                </view>
              </template>
            </view>
            <!-- 积分 -->
            <view
              v-if="prizeInfo.Point"
              class="pop__prize-item"
              :style="{ backgroundImage: 'url(' + prizeBgImg + ')' }"
            >
              <image class="prize-icon" :src="jfImg" mode="widthFix" />
              <view>
                <view class="prize-name ellipsis">{{ prizeInfo.Point }}积分</view>
                <view class="prize-desc ellipsis-2">
                  <text v-if="prizeInfo.PointSendResult === 0">发放中，稍后可到“我的积分”中查看</text>
                  <text v-else-if="prizeInfo.PointSendResult === 2">抱歉，积分发放失败，请联系客服进行补发</text>
                  <text v-else>
                    {{ prizeInfo.PrizePointReceiveDesc }}
                  </text>
                </view>
              </view>
              <!-- PointSendResult 0：发放中；1：发放成功；2：发放失败； 4：补发成功； -->
              <view
                v-if="prizeInfo.PointSendResult === 1 || prizeInfo.PointSendResult === 4"
                class="prize-btn"
                :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                @tap="handlePoint(prizeInfo.PrizePointReceiveDescLink)"
              >
                去兑换
              </view>
              <template v-else-if="prizeInfo.PointSendResult === 2">
                <!-- #ifdef H5 -->
                <view class="prize-btn" :style="{ backgroundImage: 'url(' + btnImg + ')' }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  open-type="contact"
                >
                  联系客服
                </button>
                <!-- #endif -->
              </template>
            </view>
            <!-- 参与机会 -->
            <view
              v-if="prizeInfo.IsGetDraw"
              class="pop__prize-item"
              :style="{ backgroundImage: 'url(' + prizeBgImg + ')' }"
            >
              <image class="prize-icon" :src="chanceImg" mode="widthFix" />
              <view>
                <view class="prize-name ellipsis">
                  {{ prizeInfo.DrawNum
                  }}{{
                    prizeInfo.DrawActSetting && prizeInfo.DrawActSetting.DrawChanceTitleType === 1
                      ? prizeInfo.DrawActSetting.DrawChanceTitle
                      : '次参与机会'
                  }}
                </view>
                <view v-if="[0, 3].includes(prizeInfo.drawsendresult)" class="prize-desc ellipsis-2">
                  发放中，稍后可到“我的奖品”中查看
                </view>
                <view v-else-if="prizeInfo.IsDrawSendResult" class="prize-desc ellipsis-2">
                  <template v-if="prizeInfo.DrawActSetting && prizeInfo.DrawActSetting.DrawActAwardAlertMsg !== ''">
                    {{ prizeInfo.DrawActSetting.DrawActAwardAlertMsg }}
                  </template>
                  <template v-else>{{ prizeInfo.DrawActTitle }}（30天内参与有效）</template>
                </view>
                <view v-else class="prize-desc ellipsis-2">
                  <template v-if="prizeInfo.DrawActSetting && prizeInfo.DrawActSetting.DrawActSendErrorAlertMsg !== ''">
                    {{ prizeInfo.DrawActSetting.DrawActSendErrorAlertMsg }}
                  </template>
                  <template v-else>
                    {{ prizeInfo.DrawRemark }}
                  </template>
                </view>
              </view>
              <view
                v-if="[1, 4].includes(prizeInfo.drawsendresult)"
                class="prize-btn"
                :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                @tap="handleDraw(prizeInfo.DrawCenterUrl)"
              >
                去参与
              </view>
              <template v-else-if="[2, 5].includes(prizeInfo.drawsendresult)">
                <!-- #ifdef H5 -->
                <view class="prize-btn" :style="{ backgroundImage: 'url(' + btnImg + ')' }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  open-type="contact"
                >
                  联系客服
                </button>
                <!-- #endif -->
              </template>
            </view>
            <!-- 礼品 -->
            <view
              v-if="prizeInfo.IsProduct"
              class="pop__prize-item"
              :style="{ backgroundImage: 'url(' + prizeBgImg + ')' }"
            >
              <image class="prize-icon" :src="prizeInfo.PicUrl1" mode="widthFix" />
              <view>
                <view class="prize-name ellipsis">{{ prizeInfo.PrizeProductTitle }}</view>
                <view v-if="prizeInfo.IsVirtual == 2" class="prize-desc ellipsis-2">
                  <block v-if="[0, 3].includes(prizeInfo.ProductSendResult)">
                    发放中，稍后可到“我的奖品”中查看领取
                  </block>
                  <block v-else-if="[1, 4].includes(prizeInfo.ProductSendResult)">卡券已放入卡包，可点击查看使用</block>
                  <block v-else-if="[2, 5].includes(prizeInfo.ProductSendResult)">
                    抱歉，卡券发放失败，请联系客服进行补发
                  </block>
                </view>
                <view v-else-if="prizeInfo.PrizeProductVaildDay > 0" class="prize-desc ellipsis-2">
                  {{
                    prizeInfo.GoodsGiftPrice > 0
                      ? `支付￥${prizeInfo.GoodsGiftPrice}可领，限${prizeInfo.PrizeProductVaildDay}天内领取有效`
                      : `限${prizeInfo.PrizeProductVaildDay}天内领取有效，请立即领取`
                  }}
                </view>
              </view>
              <block v-if="prizeInfo.IsVirtual == 2 && [0, 3].includes(prizeInfo.ProductSendResult)" />
              <template v-else-if="prizeInfo.IsVirtual == 2 && [2, 5].includes(prizeInfo.ProductSendResult)">
                <!-- #ifdef H5 -->
                <view class="prize-btn" :style="{ backgroundImage: 'url(' + btnImg + ')' }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  open-type="contact"
                >
                  联系客服
                </button>
                <!-- #endif -->
              </template>
              <block v-else-if="prizeInfo.IsGetProduct && prizeInfo.IsVirtual === 2">
                <view
                  v-if="[1, 4].includes(prizeInfo.ProductSendResult)"
                  class="prize-btn"
                  :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                  @tap="handleGoCard(false)"
                >
                  去使用
                </view>
              </block>
              <view
                v-else-if="prizeInfo.IsGetProduct"
                class="prize-btn gray"
                :style="{ backgroundImage: 'url(' + btnImg + ')' }"
              >
                已领取
              </view>
              <view
                v-else-if="!prizeInfo.IsGetProduct && prizeInfo.PrizeProductVaildDay > 0"
                class="prize-btn"
                :style="{ backgroundImage: 'url(' + btnImg + ')' }"
                @tap="handleReceive(false)"
              >
                {{ prizeInfo.IsVirtual === 2 ? '去使用' : '去领取' }}
              </view>
              <view v-else class="prize-btn" :style="{ backgroundImage: 'url(' + btnImg + ')' }">已失效</view>
            </view>
          </view>
          <view class="pop__bg-bottom">
            <image class="bottom-img" style="width: 628rpx; height: 165rpx" :src="bgBottomImg" mode="scaleToFill" />
            <p v-if="prizeInfo.SharePrizeDesc" class="pop__desc">{{ prizeInfo.SharePrizeDesc }}</p>
          </view>
        </view>
        <view v-if="isAutoJump && showJump" class="auto-jump-text">
          <text class="auto-jump-time">{{ autoJumpPageTime }}</text>
          秒后即将跳转
          <text v-if="autoJumpInfo.SaoMaResultAutoJumpPageText !== ''">
            ，{{ autoJumpInfo.SaoMaResultAutoJumpPageText }}
          </text>
        </view>
      </view>

      <!-- 提示弹窗 -->
      <Dialog ref="Dialog" />
      <Dialog2 ref="CardDialog" @layer-close="handleGoCard(true)" />
      <Dialog3 ref="ReceiveDialog" @layer-close="handleReceive(true)" />

      <!-- 如何解锁待解锁红包券说明弹窗 -->
      <hb-unlock-explain
        v-if="lockGuide.isVisible"
        :title="lockGuide.title"
        :content="lockGuide.content"
        @close="lockGuide.isVisible = false"
      />
      <!-- #ifdef MP-WEIXIN -->
    </view>
    <!-- #endif -->
    <!-- #ifdef H5 -->
  </view>
  <!-- #endif -->
</template>

<script>
import { apiGetHbState, apiGetAwardGrantState } from 'packages/api/scan'
/* #ifdef H5 */
import { apiGetCouponExplain } from 'packages/api/scan'
import { getQuery } from 'packages/utils/function'
/* #endif */

/* #ifdef MP-WEIXIN */
import { apiCouponExplain } from 'packages/api/scan'
import { getQuery as getQueryMp } from '@/utils'
import navigateToMP from '@/utils/navigate-mp'
import { subscribePrizeMixin, subscribePrizeJudgeMixin } from 'packages/mixins/subscribe-prize'
/* #endif */
import Dialog from './dialog'
import HbUnlockExplain from './hb-unlock-explain'
import dayjs from 'dayjs'
import { staticURL } from '@/config'
import { packageStaticMixin } from 'packages/mixins/static-url'
export default {
  components: {
    Dialog,
    Dialog2: Dialog,
    Dialog3: Dialog,
    HbUnlockExplain
  },
  filters: {
    volumeType(val) {
      if (val.VolumeType === 0) {
        return '元购物券'
      } else if (val.VolumeType === 3) {
        let amount = val.PrizeVolumeCouponType === 0 ? val.PrizeVolumeAmount : val.PrizeVolumeUnlockAmount
        return `${amount}元${val.VolumeTitle}`
      } else if ([1, 2].includes(val.VolumeType)) {
        return val.VolumeTitle
      }
    }
  },
  mixins: [
    packageStaticMixin,
    // #ifdef MP-WEIXIN
    subscribePrizeMixin,
    subscribePrizeJudgeMixin
    // #endif
  ],
  props: {
    zIndex: {
      type: Number,
      default: 20000
    },
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 是否首次领奖
    isFristAward: {
      type: Boolean,
      default: false
    },
    // 是否自动跳转
    isAutoJump: {
      type: Boolean,
      default: false
    },
    // 自动跳转信息
    autoJumpInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    // 奖项信息
    prizeInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    // 奖项id
    activityId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      hbLoading: staticURL(true) + 'scan/hb-loading.gif',
      bgTopImg: staticURL(true) + 'scan/win-dialog-bg-top2.png',
      bgCenterImg: staticURL(true) + 'scan/win-dialog-bg-center.png',
      bgBottomImg: staticURL(true) + 'scan/win-dialog-bg-bottom.png',
      btnImg: staticURL(true) + 'scan/win-dialog-bg-btn.png',
      winTitleImg: staticURL(true) + 'scan/win-dialog-win-title.png',
      againTitleImg: staticURL(true) + 'scan/win-dialog-again-title.png',
      defaultPrizeIcon: staticURL(true) + 'scan/win-dialog-prize-icon.jpg',
      prizeBgImg: staticURL(true) + 'scan/win-dialog-prize-bg.png',
      hongImg: staticURL(true) + 'hong.jpg',
      kaquanImg: staticURL(true) + 'kaquan.jpg',
      suohongImg: staticURL(true) + 'suohongbao.jpg',
      jfImg: staticURL(true) + 'jifengIcon.jpg',
      chanceImg: staticURL(true) + 'jihui.jpg',
      unlockExplainImg: staticURL(true) + 'scan/hb-voucher__unlock-explain-pop__process.jpg',
      countTimeItem: {
        timeType: 0, // 0关闭 1 开始
        diff: 0,
        day: 0,
        newhour: 0,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      },
      countTag: -1,
      autoJumpPageTimer: null, // 自动跳转定时器
      autoJumpPageTime: 1, // 自动跳转时间
      lockGuide: {
        isVisible: false,
        title: '红包券解锁攻略',
        content: ''
      },
      requestCountOfUnionCard: 7,
      requestCountOfVirtual: 7,
      showJump: true
    }
  },
  computed: {
    popTitleImg() {
      return this.isFristAward ? this.winTitleImg : this.againTitleImg
    }
  },
  watch: {
    prizeInfo: {
      handler(val) {
        if (JSON.stringify(val) !== '{}') {
          if (val.IsGetVolume && val.VolumeType === 3) {
            let startTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
            let t = dayjs(val.PrizeVolumeEffectiveEndTime)
            this.countTimeItem.diff = Math.floor(t.diff(startTime))
            this.countTimeItem.timeType = 1
            this.countDown()
          }
          if (
            val.IsGetHb &&
            ['发放中', '发放成功（待到账）'].includes(val.HbSendResult) &&
            this.requestCountOfUnionCard !== 0
          ) {
            this.requestCountOfUnionCard = 7
            this.getHbState(val.AwardId)
          }
          // 联盟卡券轮询
          if (
            val.IsProduct &&
            val.IsVirtual === 2 &&
            (!val.ProductSendResult || [0, 3].includes(val.ProductSendResult))
          ) {
            this.requestCountOfVirtual = 7
            this.getVirtualState(val.AwardId)
          }
          // #ifdef MP-WEIXIN
          // 消息订阅
          this.initTemplateSetting(val)
          // #endif
        }
      },
      immediate: true
    },
    isShow(val) {
      if (val && this.isAutoJump) {
        this.showJump = true
        this.handleAutoJumpPage()
      }
      if (val) {
        this.requestCountOfUnionCard = 7
      }
    }
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.autoJumpPageTimer)
    this.clearCount()
  },
  methods: {
    getHbState(AwardId) {
      if (!this.isShow) return
      if (this.requestCountOfUnionCard <= 0) {
        let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
        prizeInfo.HbSendResult = '发放中'
        prizeInfo.PrizeHbReceiveDesc =
          prizeInfo.HbType === 1 ? '发放中，稍后可到“我的奖品”中查看' : '红包已发出，稍后可到“微信钱包”查收~'
        this.$emit('update:prizeInfo', prizeInfo)
        return false
      }
      let query = {
        AwardId
      }
      /* #ifdef H5 */
      query.Memberlogin = getQuery('m')
      /* #endif */
      apiGetHbState(query).then(res => {
        if (this.$ck(res)) {
          if (['发放失败'].includes(res.return_data.HbSendResult)) {
            let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
            prizeInfo.HbSendResult = '发放失败'
            prizeInfo.PrizeHbReceiveDesc = res.return_data.HbRemark || '抱歉，红包发放失败，请联系客服进行补发'
            this.$emit('update:prizeInfo', prizeInfo)
          } else if (['发放中', '发放中（待到账）'].includes(res.return_data.HbSendResult)) {
            setTimeout(() => {
              this.requestCountOfUnionCard--
              this.getHbState(AwardId)
            }, 3000)
          } else {
            let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
            prizeInfo.HbSendResult = '发放成功'
            prizeInfo.PrizeHbReceiveDesc =
              prizeInfo.HbType === 1
                ? '已到账，请到“个人中心-我的零钱”中查看提现'
                : prizeInfo.HbType === 0
                ? '已到账，请返回微信(公众号/服务通知)领取(24小时内有效)'
                : '已到账，请到“微信钱包”中查看'
            this.$emit('update:prizeInfo', prizeInfo)
          }
        }
      })
    },
    getVirtualState(AwardId) {
      if (this.requestCountOfVirtual <= 0) {
        return false
      }
      let query = {
        AwardId
      }
      /* #ifdef H5 */
      query.m = getQuery('m')
      /* #endif */
      apiGetAwardGrantState(query).then(res => {
        if (this.$ck(res)) {
          if ([0, 3].includes(res.return_data.ProductSendResult)) {
            setTimeout(() => {
              this.requestCountOfVirtual--
              this.getVirtualState(AwardId)
            }, 3000)
          } else {
            let prizeInfo = JSON.parse(JSON.stringify(this.prizeInfo))
            prizeInfo.ProductSendResult = res.return_data.ProductSendResult
            this.$emit('update:prizeInfo', prizeInfo)
          }
        }
      })
    },
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
    // 调起倒计时
    countDown() {
      this.countTag = setInterval(() => {
        if (this.countTimeItem.timeType === 1) {
          this.countTimeItem.diff = this.countTimeItem.diff - 100
          if (this.countTimeItem.diff > 0) {
            this.formatTime(this.countTimeItem)
          } else {
            this.countTimeItem.timeType = 0
            this.clearCount()
          }
        }
      }, 100)
    },
    // 计算倒计时
    formatTime(item) {
      this.countTimeItem.day = Math.floor(this.countTimeItem.diff / 1000 / (60 * 60 * 24))
      this.countTimeItem.newhour = this.padNum(Math.floor((this.countTimeItem.diff / 1000 / (60 * 60)) % 24))
      this.countTimeItem.hour = this.padNum(Math.floor(this.countTimeItem.diff / 1000 / (60 * 60)))
      this.countTimeItem.minute = this.padNum(parseInt((this.countTimeItem.diff / 1000 / 60) % 60))
      this.countTimeItem.second = this.padNum(parseInt((this.countTimeItem.diff / 1000) % 60))
      this.countTimeItem.millisecond = parseInt((this.countTimeItem.diff / 100) % 10)
    },
    // 计算数字
    padNum(v) {
      return v < 10 ? `0${v}` : `${v}`
    },
    // 清除倒计时
    clearCount() {
      clearInterval(this.countTag)
      this.countTag = null
    },
    /** 去使用券 */
    async handleVolume() {
      /* #ifdef H5 */
      location.href = this.prizeInfo.PrizeVolumeReceiveDescLink
      /* #endif */
      /* #ifdef MP-WEIXIN */
      let url
      if (this.prizeInfo.VolumeType === 0) {
        // 购物券
        url = '/personal/coupon/list'
      } else if (this.prizeInfo.VolumeType === 1) {
        // 第三方卡券
        let { id } = getQueryMp(this.prizeInfo.ThirdCardDetailUrl)
        url = `/personal/prize/third-voucher?id=${id}&type=1`
      } else if (this.prizeInfo.VolumeType === 2) {
        // 提领券
        url = '/personal/bring-coupon/list'
      } else if (this.prizeInfo.VolumeType === 3) {
        // 红包券
        url = '/personal/my-voucher/list'
      }
      if (this.prizeInfo.VolumeType === 2) {
        await this.requestSubscribeMsg(this.noticeTempList)
      }
      uni.navigateTo({
        url
      })
      /* #endif */
    },
    // 如何解锁待解锁红包券
    handleGetCouponExplain() {
      /* #ifdef H5 */
      apiGetCouponExplain({
        MemberLogin: getQuery('m'),
        CouponId: this.prizeInfo.PrizeVolumeCouponId // 券id
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
        CouponId: this.prizeInfo.PrizeVolumeCouponId // 券id
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
    },
    /** 联盟卡券跳转 */
    handleGoCard(isOpened) {
      // 开启了礼品领取说明
      if (this.prizeInfo.ProductGetRemark !== '' && !isOpened) {
        this.$refs.CardDialog.open({
          content: decodeURI(this.prizeInfo.ProductGetRemark),
          btns: [
            {
              text: '我知道了'
            }
          ]
        })
        return
      }
      /* #ifdef H5 */
      location.href = this.prizeInfo.AwardURL
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: '/packages/src/union-card/list'
      })
      /* #endif */
    },
    // 去提现
    handlewithdraw(link) {
      /* #ifdef H5 */
      location.href = link
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: '/personal/change/index'
      })
      /* #endif */
    },
    // 前往积分商城
    handlePoint(link) {
      /* #ifdef H5 */
      location.href = link
      /* #endif */
      /* #ifdef MP-WEIXIN */
      uni.navigateTo({
        url: '/packages/src/integral/index'
      })
      /* #endif */
    },
    // 参与机会抽奖
    handleDraw(link) {
      /* #ifdef H5 */
      location.href = link
      /* #endif */
      /* #ifdef MP-WEIXIN */
      if (this.prizeInfo.DrawMpUrl) {
        uni.navigateTo({
          url: '/' + this.prizeInfo.DrawMpUrl
        })
      } else {
        this.$emit('qrcode', this.prizeInfo.DrawCenterUrl)
      }
      /* #endif */
    },
    // 礼品
    async handleReceive(isOpened, isCollect = false) {
      // 开启了礼品领取说明
      if (this.prizeInfo.ProductGetRemark !== '' && !isOpened) {
        this.$refs.ReceiveDialog.open({
          content: decodeURI(this.prizeInfo.ProductGetRemark),
          btns: [
            {
              text: '我知道了'
            }
          ]
        })
        return
      }
      if (!isCollect && this.prizeInfo.IsVirtual === 0) {
        this.$emit('register')
        return
      }
      /* #ifdef H5 */
      if (this.prizeInfo.IsVirtual === 0) {
        if (this.prizeInfo.ProductGetType === 0) {
          //邮寄方式
          location.href = this.prizeInfo.GetAwardByKuaiDiUrl
        } else if (this.prizeInfo.ProductGetType === 1) {
          //线下门店领取
          location.href = this.prizeInfo.GetAwardByDealerUrl
        } else {
          //客户选择（邮寄方式、线下门店领取）
          // Vue.prototype.$giftReceivePop().open({
          //   expressLink: this.prizeInfo.GetAwardByKuaiDiUrl,
          //   dealerLink: this.prizeInfo.GetAwardByDealerUrl
          // })
          let that = this
          uni.showActionSheet({
            itemList: ['快递邮寄', '线下门店领取'],
            success: function (res) {
              if (res.tapIndex === 0) {
                location.href = that.prizeInfo.GetAwardByKuaiDiUrl
              } else {
                location.href = that.prizeInfo.GetAwardByDealerUrl
              }
            }
          })
        }
      } else if (this.prizeInfo.IsVirtual === 2) {
        //联盟卡券
        location.href = this.prizeInfo.AwardURL
      } else {
        //虚拟票券 或直冲类（1||3）
        location.href = this.prizeInfo.GetAwardByKuaiDiUrl
      }

      /* #endif */
      /* #ifdef MP-WEIXIN */
      // 首次领奖联盟卡券
      if (this.prizeInfo.IsVirtual === 2) {
        this.handleGoCard(true)
        return
      }
      await this.requestSubscribeMsg(this.noticeTempList)
      // ProductGetType  0：邮寄，1：线下，2：两种
      if (this.prizeInfo.ProductGetType === 0) {
        uni.redirectTo({
          url: `/packages/src/integral/detail?type=2&id=${this.prizeInfo.AwardId}&activityprizeid=${this.prizeInfo.SaoMaActivityPrizeID}&subcategory=6&actid=${this.activityId}`
        })
      } else if (this.prizeInfo.ProductGetType === 1) {
        uni.redirectTo({
          url: `/packages/src/integral/settle?type=4&id=${this.prizeInfo.AwardId}&ordersourcetype=2`
        })
      } else {
        this.$emit('open')
      }
      /* #endif */
    },
    // 领奖自动跳转
    handleAutoJumpPage() {
      this.autoJumpPageTime = Number(this.autoJumpInfo.SaoMaResultAutoJumpPageTime)
      this.autoJumpPageTimer = setInterval(() => {
        let pages = getCurrentPages()
        const page = `/${pages[pages.length - 1].route}`
        if (!page.includes('/scan-templates/')) {
          this.showJump = false
          return clearInterval(this.autoJumpPageTimer)
        }
        if (this.autoJumpPageTime <= 0) {
          clearInterval(this.autoJumpPageTimer)
          /* #ifdef H5 */
          let path = this.autoJumpInfo.SaoMaResultAutoJumpPagePath.includes('http')
            ? this.autoJumpInfo.SaoMaResultAutoJumpPagePath
            : '//' + this.autoJumpInfo.SaoMaResultAutoJumpPagePath
          location.href = path
          /* #endif */
          /* #ifdef MP-WEIXIN */
          console.log('微信自动跳转', this.autoJumpInfo.SaoMaResultAutoJumpPagePathSetting)
          this.handleCloseDialog()
          const current = this.autoJumpInfo.SaoMaResultAutoJumpPagePathSetting
          if (current.JumpType === 1 || current.JumpType === 2) {
            uni.navigateTo({
              url: current.JumpType === 2 ? '/' + current.Link : current.Link
            })
            return
          }
          if (current.JumpType === 3) {
            if (current.MpAppID === '') {
              navigateToMP({
                path: current.Link
              })
            } else {
              navigateToMP({
                appId: current.MpAppID,
                path: current.Link,
                onlyMp: true
              })
            }
            return
          }
          if (current.JumpType === 4) {
            navigateToMP({
              path: current.Link,
              type: 7
            })
            return
          }
          /* #endif */
          return
        }
        this.autoJumpPageTime--
      }, 1000)
    },
    clearAutoJumpPage() {
      clearInterval(this.autoJumpPageTimer)
      this.handleCloseDialog()
    },
    /* #ifdef H5 */
    // 联系客服
    handleContactUs() {
      location.href = this.prizeInfo.ContactUs.ButtonLink
    }
    /* #endif */
  }
}
</script>

<style lang="scss" scoped>
.win-dialog-container {
  position: fixed;
  z-index: 20000;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .content {
    position: relative;
    /* #ifdef MP-WEIXIN */
    top: 100rpx;
    animation: tanchuang 0.4s ease-in-out;
    /* #endif */
    .pop__title {
      position: absolute;
      top: -160rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 500rpx;
    }
    .pop__content {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .pop__bg-top {
      position: relative;
      width: 628rpx;
      transform: translateY(12rpx);
      .pop__bg-top-img {
        width: 628rpx;
      }
    }

    .dialog-content-title {
      position: relative;
      background-size: 100%;
      padding-top: 12rpx;
      padding-bottom: 30rpx;
      .award-name {
        position: relative;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 628rpx;
        margin-bottom: 8rpx;
        color: #000;
        font-size: 36rpx;
        font-weight: bold;
        text-align: center;

        &::before {
          content: '';
          position: relative;
          width: 86rpx;
          height: 4rpx;
          margin-right: 20rpx;
          background-image: linear-gradient(to left, #d38216, #ffe5c1);
        }

        &::after {
          content: '';
          position: relative;
          width: 86rpx;
          height: 4rpx;
          margin-left: 20rpx;
          background-image: linear-gradient(to right, #d38216, #ffe5c1);
        }
      }

      .award-time {
        position: relative;
        top: 60%;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        text-align: center;
        font-size: 24rpx;
        color: #000;
        opacity: 0.7;
      }
    }

    .pop__bg-center {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      width: 628rpx;
      height: 100%;
      max-height: 450rpx;
      overflow-y: auto;
      background-size: 100%;
      background-repeat: repeat-y;

      .pop__prize-item {
        display: flex;
        align-items: center;
        padding: 0 46rpx;
        width: 580rpx;
        height: 122rpx;
        margin-top: 34rpx;
        background-size: 100%;
        background-repeat: no-repeat;
        z-index: 100;
        box-sizing: border-box;

        &:first-child {
          margin-top: 0;
        }

        .prize-icon {
          width: 60rpx;
          height: 60rpx;
          margin-right: 16rpx;
          border-radius: 5rpx;
        }
        .prize-name {
          width: 300rpx;
          color: #000;
          font-size: 24rpx;
          font-weight: bold;
        }
        .prize-desc {
          width: 300rpx;
          font-size: 22rpx;
          color: #000;
          opacity: 0.5;
          .img-loading {
            width: 60rpx;
            height: 24rpx;
            display: inline-block;
          }
        }
        .prize-btn {
          width: 140rpx;
          height: 70rpx;
          line-height: 70rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24rpx;
          color: #fff;
          background-size: 100%;
          background-repeat: no-repeat;
          border: none;

          &.gray {
            filter: grayscale(1);
          }
        }
      }
    }
    .pop__bg-bottom {
      position: relative;
      width: 628rpx;
      .bottom-img {
        width: 628rpx;
      }
      .pop__desc {
        position: absolute;
        bottom: 10%;
        width: 100%;
        padding: 0 60rpx;
        text-align: center;
        color: #fff;
        font-size: 24rpx;
        box-sizing: border-box;
      }
    }
  }

  .auto-jump-text {
    position: absolute;
    bottom: -100rpx;
    left: 0;
    right: 0;
    font-size: 30rpx;
    font-weight: 700;
    color: #fff;
    text-align: center;
  }
  .auto-jump-time {
    font-size: 40rpx;
    color: #ffd70f;
  }

  .close-btn {
    color: #fff;
    position: absolute;
    /* #ifdef H5 */
    top: 60rpx;
    /* #endif */
    /* #ifdef MP-WEIXIN */
    top: 180rpx;
    /* #endif */
    right: 80rpx;
    font-size: 54rpx;
    font-weight: bold;
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
