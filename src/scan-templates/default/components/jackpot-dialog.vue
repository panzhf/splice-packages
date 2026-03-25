<template>
  <view v-if="isShow" class="jackpot-dialog-container">
    <view class="mask" @click="handleClickMask" />
    <view class="content" :style="{ backgroundImage: 'url(' + PopupBg + ')' }">
      <view class="name">
        <img v-if="isFrist" class="img1" :src="zjImg" alt="" />
        <img v-else class="img2" :src="canyuImg" alt="" />
        <view class="jiang">一 您获得了{{ info.PrizeName }} 一</view>
        <view class="time">参与时间：{{ info.Addtime }}</view>
      </view>
      <view class="content-box">
        <scroll-view
          :scroll-top="scrollTop"
          scroll-y="true"
          class="scroll-Y"
          @scrolltoupper="upper"
          @scrolltolower="lower"
          @scroll="scroll"
        >
          <!-- 红包零钱 -->
          <view
            v-if="info.IsGetHb"
            class="scroll-view-item"
            :style="{
              backgroundImage: 'url(' + listBg + ')',
              backgroundSize: '100%'
            }"
          >
            <view class="left">
              <view class="photo">
                <img :src="hongImg" mode="widthFix" alt="" />
              </view>
              <view class="info-box">
                <view class="title ellipsis">{{ info.PrizeHbName }}</view>
                <view
                  v-if="!info.IsHbsendResult && ['发放中', '发放成功（待到账）'].includes(info.HbSendResult)"
                  class="tips ellipsis-2"
                >
                  <!-- <image :src="hbLoading" mode="scaleToFill" class="img-loading" /> -->
                  <!-- 红包已发出，请到微信上查阅（若未到账请联系客服补发） -->
                  {{ info.HbType === 1 ? '发放中，稍后可到“我的奖品”中查看' : '红包已发出，稍后可到“微信钱包”查收~' }}
                </view>
                <view v-else class="tips ellipsis-2">
                  {{ info.PrizeHbReceiveDesc }}
                </view>
              </view>
            </view>
            <view class="right">
              <view v-if="info.HbType === 1 && info.IsHbsendResult" class="tx-buttom" @tap="handlewithdraw">
                {{ info.prizeHbReceiveDescText }}
              </view>
              <view v-else-if="info.HbSendResult === '发放中'" />
              <button
                v-else-if="info.HbSendResult === '发放失败'"
                plain
                hover-class="none"
                class="tx-buttom"
                open-type="contact"
              >
                联系客服
              </button>
            </view>
          </view>
          <!-- 券 -->
          <view
            v-if="info.IsGetVolume"
            class="scroll-view-item"
            :style="{
              backgroundImage: 'url(' + listBg + ')',
              backgroundSize: '100%'
            }"
          >
            <view class="left">
              <view class="photo">
                <img v-if="info.VolumeType === 2" :src="info.VoucherImg" mode="aspectFit" />
                <img v-else :src="kaquanImg" mode="widthFix" alt="" />
              </view>
              <view class="info-box">
                <view class="title ellipsis">
                  {{ info.VolumeType === 0 ? info.ParValue : '' }}{{ info | volumeType }}
                </view>
                <view class="tips ellipsis-2">
                  <text v-if="info.VolumeStatus === 2">发放中，稍后可到“我的奖品”中查看</text>
                  <text v-else-if="info.VolumeStatus === 0">抱歉，卡券发放失败，请联系客服进行补发</text>
                  <text v-else-if="[0, 1, 2].indexOf(info.VolumeType) > -1">{{ info.PrizeVolumeReceiveDesc }}</text>
                  <text
                    v-else-if="
                      info.VolumeType === 3 &&
                      info.VolumeStatus == 1 &&
                      info.PrizeVolumeState != 2 &&
                      new Date(
                        info.PrizeVolumeEffectiveEndTime ? info.PrizeVolumeEffectiveEndTime.replace(/-/g, '/') : ''
                      ).getTime() <= Date.now()
                    "
                  >
                    <!-- 已过期状态 -->
                    已过期
                  </text>
                  <view v-else-if="info.VolumeType === 3" class="hbvoucher-countdown">
                    <text v-if="countTimeItem.day > 0" class="hbvoucher-countdown-item">{{ countTimeItem.day }}</text>
                    <text v-if="countTimeItem.day > 0" style="color: #999" class="hbvoucher-countdown-colon">天</text>
                    <text class="hbvoucher-countdown-item">{{ countTimeItem.newhour }}</text>
                    <!-- <text class="hbvoucher-countdown-item">{{ countTimeItem.hour }}</text> -->
                    <text class="hbvoucher-countdown-colon">:</text>
                    <text class="hbvoucher-countdown-item">{{ countTimeItem.minute }}</text>
                    <text class="hbvoucher-countdown-colon">:</text>
                    <text class="hbvoucher-countdown-item">{{ countTimeItem.second }}</text>
                    <text class="hbvoucher-countdown-colon">:</text>
                    <text class="hbvoucher-countdown-item hbvoucher-countdown-item--last">
                      {{ countTimeItem.millisecond }}
                    </text>
                    <text class="hbvoucher-countdown-tips">后过期</text>
                    <text v-if="info.PrizeVolumeCouponType === 1" class="hbvoucher-countdown-tips">
                      ,每小时贬值{{ info.PrizeVolumeUnlockAmount }}元
                    </text>
                  </view>
                  <text v-else>已到账，可商城下单抵扣</text>
                </view>
              </view>
            </view>
            <view class="right">
              <view class="unlock">
                <!-- 右侧按钮 -->
                <view v-if="info.VolumeStatus === 2" />
                <button
                  v-else-if="info.VolumeStatus === 0"
                  plain
                  hover-class="none"
                  class="tx-buttom"
                  open-type="contact"
                >
                  联系客服
                </button>
                <template v-if="info.VolumeStatus == 1">
                  <view
                    v-if="
                      info.VolumeType === 3 &&
                      info.IsVolumeResult &&
                      info.PrizeVolumeState != 2 &&
                      new Date(
                        info.PrizeVolumeEffectiveEndTime ? info.PrizeVolumeEffectiveEndTime.replace(/-/g, '/') : ''
                      ).getTime() <= Date.now()
                    "
                    class="tx-buttom"
                  >
                    已过期
                  </view>
                  <view v-else-if="info.VolumeType === 3" class="tx-buttom" @tap="handleGetCouponExplain">
                    如何解锁
                  </view>
                  <view v-else class="tx-buttom" @tap="handleVolume">去使用</view>
                </template>
              </view>
            </view>
          </view>
          <!-- 积分 -->
          <view
            v-if="info.Point"
            class="scroll-view-item"
            :style="{
              backgroundImage: 'url(' + listBg + ')',
              backgroundSize: '100%'
            }"
          >
            <view class="left">
              <view class="photo">
                <img :src="jfImg" mode="widthFix" alt="" />
              </view>
              <view class="info-box">
                <view class="title ellipsis">{{ info.Point }} 积分</view>
                <view class="tips ellipsis-2">
                  <text v-if="info.PointSendResult === 0">发放中，稍后可到“我的积分”中查看</text>
                  <text v-else-if="info.PointSendResult === 2">抱歉，积分发放失败，请联系客服进行补发</text>
                  <text v-else>
                    {{ info.PrizePointReceiveDesc }}
                  </text>
                </view>
              </view>
            </view>
            <view class="right">
              <!-- PointSendResult 0：发放中；1：发放成功；2：发放失败； 4：补发成功； -->
              <view
                v-if="info.PointSendResult === 1 || info.PointSendResult === 4"
                class="tx-buttom"
                @tap="handlePoint"
              >
                去兑换
              </view>
              <button
                v-else-if="info.PointSendResult === 2"
                plain
                hover-class="none"
                class="tx-buttom"
                open-type="contact"
              >
                联系客服
              </button>
            </view>
          </view>
          <!-- 机会 -->
          <view
            v-if="info.IsGetDraw"
            class="scroll-view-item"
            :style="{
              backgroundImage: 'url(' + listBg + ')',
              backgroundSize: '100%'
            }"
          >
            <view class="left">
              <view class="photo">
                <img :src="chanceImg" mode="widthFix" alt="" />
              </view>
              <view class="info-box">
                <view class="title ellipsis">
                  {{ info.DrawNum
                  }}{{
                    info.DrawActSetting && info.DrawActSetting.DrawChanceTitleType === 1
                      ? info.DrawActSetting.DrawChanceTitle
                      : '次参与机会'
                  }}
                </view>
                <view v-if="[0, 3].includes(info.drawsendresult)" class="tips ellipsis-2">
                  发放中，稍后可到“我的奖品”中查看
                </view>
                <view v-else-if="info.IsDrawSendResult" class="tips ellipsis-2">
                  <template v-if="info.DrawActSetting && info.DrawActSetting.DrawActAwardAlertMsg !== ''">
                    {{ info.DrawActSetting.DrawActAwardAlertMsg }}
                  </template>
                  <template v-else>{{ info.DrawActTitle }}（30天内参与有效）</template>
                </view>
                <view v-else class="tips ellipsis-2">
                  <template v-if="info.DrawActSetting && info.DrawActSetting.DrawActSendErrorAlertMsg !== ''">
                    {{ info.DrawActSetting.DrawActSendErrorAlertMsg }}
                  </template>
                  <template v-else>
                    {{ info.DrawRemark }}
                  </template>
                </view>
              </view>
            </view>
            <view class="right">
              <view v-if="[1, 4].includes(info.drawsendresult)" class="tx-buttom" @tap="handleDraw">去参与</view>
              <button
                v-else-if="[2, 5].includes(info.drawsendresult)"
                plain
                hover-class="none"
                class="tx-buttom"
                open-type="contact"
              >
                联系客服
              </button>
            </view>
          </view>
          <!-- 礼品 -->
          <view
            v-if="info.IsProduct"
            class="scroll-view-item"
            :style="{
              backgroundImage: 'url(' + listBg + ')',
              backgroundSize: '100%'
            }"
          >
            <view class="left">
              <view class="photo">
                <img :src="info.PicUrl1" mode="aspectFit" alt="" />
              </view>
              <view class="info-box">
                <view class="title ellipsis">{{ info.PrizeProductTitle }}</view>
                <view v-if="info.IsVirtual == 2" class="tips ellipsis-2">
                  <block v-if="[0, 3].includes(info.ProductSendResult)">发放中，稍后可到“我的奖品”中查看领取</block>
                  <block v-else-if="[1, 4].includes(info.ProductSendResult)">卡券已放入卡包，可点击查看使用</block>
                  <block v-else-if="[2, 5].includes(info.ProductSendResult)">
                    抱歉，卡券发放失败，请联系客服进行补发
                  </block>
                </view>
                <view v-else-if="info.PrizeProductVaildDay > 0" class="tips ellipsis-2">
                  {{
                    info.GoodsGiftPrice > 0
                      ? `支付￥${info.GoodsGiftPrice}可领，限${info.PrizeProductVaildDay}天内领取有效`
                      : `限${info.PrizeProductVaildDay}天内领取有效，请立即领取`
                  }}
                </view>
              </view>
            </view>
            <view v-if="info.IsVirtual !== 2 || ![0, 3].includes(info.ProductSendResult)" class="right">
              <!-- 联盟卡券 -->
              <template v-if="[2, 5].includes(info.ProductSendResult)">
                <button plain hover-class="none" class="tx-buttom" open-type="contact">联系客服</button>
              </template>
              <block v-else-if="info.IsGetProduct && info.IsVirtual === 2">
                <view v-if="[1, 4].includes(info.ProductSendResult)" class="tx-buttom" @tap="handleGoCard(false)">
                  去使用
                </view>
              </block>
              <!-- 实物 -->
              <view v-else-if="info.IsGetProduct" class="tx-buttom">已领取</view>
              <view
                v-else-if="!info.IsGetProduct && info.PrizeProductVaildDay > 0"
                class="tx-buttom"
                @tap="handleReceive(false)"
              >
                {{ info.IsVirtual === 2 ? '去使用' : '去领取' }}
              </view>
              <view v-else class="tx-buttom">已失效</view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view v-if="isAutoJump" class="auto-jump-text">
        <text class="auto-jump-time">{{ autoJumpPageTime }}</text>
        秒后即将跳转
        <text v-if="autoJumpInfo.SaoMaResultAutoJumpPageText !== ''">
          ，{{ autoJumpInfo.SaoMaResultAutoJumpPageText }}
        </text>
      </view>
      <view
        class="iconfont icon-close2 close-btn"
        :style="isAutoJump ? 'bottom: -230rpx' : 'bottom: -170rpx'"
        @click="handleCloseDialog"
      />
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
  </view>
</template>

<script>
import { apiCouponExplain, apiGetHbState, apiGetAwardGrantState } from 'packages/api/scan'
import Dialog from '../../components/dialog'
import HbUnlockExplain from '../../components/hb-unlock-explain'
import dayjs from 'dayjs'
import { staticURL } from '@/config'
import { getQuery } from '@/utils'
import navigateToMP from '@/utils/navigate-mp'
import { subscribePrizeMixin, subscribePrizeJudgeMixin } from 'packages/mixins/subscribe-prize'
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
  mixins: [subscribePrizeMixin, subscribePrizeJudgeMixin],
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 弹窗内容
    info: {
      type: Object,
      default: () => {}
    },
    // 中级是否第一次
    isFrist: {
      type: Number,
      default: 0
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
    // 活动id
    activityId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      hbLoading: staticURL(true) + 'scan/hb-loading.gif',
      PopupBg: staticURL(true) + 'bg_top.png',
      listBg: staticURL(true) + 'djslt-bg.png',
      successImg: staticURL(true) + 'xiao.png',
      errImg: staticURL(true) + 'ku.png',
      suoImg: staticURL(true) + 'suo.png',
      butImg: staticURL(true) + 'but.png',
      canyuImg: staticURL(true) + 'canyu.png',
      zjImg: staticURL(true) + 'zj.png',
      hongImg: staticURL(true) + 'hong.jpg',
      kaquanImg: staticURL(true) + 'kaquan.jpg',
      suohongImg: staticURL(true) + 'suohongbao.jpg',
      jfImg: staticURL(true) + 'jifengIcon.jpg',
      chanceImg: staticURL(true) + 'jihui.jpg',
      tips: `很遗憾~ \n你没有获得奖励，再接再厉`,
      state: 2, //1成功2失败
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
      lockGuide: {
        isVisible: false,
        title: '红包券解锁攻略',
        content: ''
      },
      requestCountOfUnionCard: 7,
      requestCountOfVirtual: 7,
      autoJumpPageTimer: null, // 自动跳转定时器
      autoJumpPageTime: 1 // 自动跳转时间
    }
  },
  computed: {
    stateImg() {
      return this.state === 1 ? this.successImg : this.errImg
    }
  },
  watch: {
    info: {
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
          // 消息订阅
          this.initTemplateSetting(val)
        }
      },
      immediate: true
    },
    isShow(val) {
      if (val && this.isAutoJump) {
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
        let info = JSON.parse(JSON.stringify(this.info))
        info.HbSendResult = '发放中'
        info.PrizeHbReceiveDesc =
          info.HbType === 1 ? '发放中，稍后可到“我的奖品”中查看' : '红包已发出，稍后可到“微信钱包”查收~'
        this.$emit('update:info', info)
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
            let info = JSON.parse(JSON.stringify(this.info))
            info.HbSendResult = '发放失败'
            info.PrizeHbReceiveDesc = res.return_data.HbRemark || '抱歉，红包发放失败，请联系客服进行补发'
            this.$emit('update:info', info)
          } else if (['发放中', '发放中（待到账）'].includes(res.return_data.HbSendResult)) {
            setTimeout(() => {
              this.requestCountOfUnionCard--
              this.getHbState(AwardId)
            }, 3000)
          } else {
            let info = JSON.parse(JSON.stringify(this.info))
            info.HbSendResult = '发放成功'
            info.PrizeHbReceiveDesc =
              info.HbType === 1
                ? '已到账，请到“个人中心-我的零钱”中查看提现'
                : info.HbType === 0
                ? '已到账，请返回微信(公众号/服务通知)领取(24小时内有效)'
                : '已到账，请到“微信钱包”中查看'
            this.$emit('update:info', info)
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
            let info = JSON.parse(JSON.stringify(this.info))
            info.ProductSendResult = res.return_data.ProductSendResult
            this.$emit('update:info', info)
          }
        }
      })
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
      clearInterval(this.autoJumpPageTimer)
      this.countTag = null
    },
    /** 去使用券 */
    async handleVolume() {
      let url
      if (this.info.VolumeType === 0) {
        // 购物券
        url = '/personal/coupon/list'
      } else if (this.info.VolumeType === 1) {
        // 第三方卡券
        let { id } = getQuery(this.info.ThirdCardDetailUrl)
        url = `/personal/prize/third-voucher?id=${id}&type=1`
      } else if (this.info.VolumeType === 2) {
        // 提领券
        url = '/personal/bring-coupon/list'
      } else if (this.info.VolumeType === 3) {
        // 红包券
        url = '/personal/my-voucher/list'
      }
      if (this.prizeInfo.VolumeType === 2) {
        await this.requestSubscribeMsg(this.noticeTempList)
      }
      uni.navigateTo({
        url
      })
    },
    /** 联盟卡券跳转 */
    handleGoCard(isOpened) {
      // 开启了礼品领取说明
      if (this.info.ProductGetRemark !== '' && !isOpened) {
        this.$refs.CardDialog.open({
          content: decodeURI(this.info.ProductGetRemark),
          btns: [
            {
              text: '我知道了'
            }
          ]
        })
        return
      }
      uni.navigateTo({
        url: '/packages/src/union-card/list'
      })
    },
    handlewithdraw() {
      uni.navigateTo({
        url: '/personal/change/index'
      })
    },
    handlePoint() {
      uni.navigateTo({
        url: '/packages/src/integral/index'
      })
    },
    // 点击遮罩
    handleClickMask() {
      this.$emit('update:isShow', false)
      this.$emit('mask')
    },
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    },
    // 实物礼品
    async handleReceive(isOpened, isCollect = false) {
      // 开启了礼品领取说明
      if (this.info.ProductGetRemark !== '' && !isOpened) {
        this.$refs.ReceiveDialog.open({
          content: decodeURI(this.info.ProductGetRemark),
          btns: [
            {
              text: '我知道了'
            }
          ]
        })
        return
      }
      if (!isCollect && this.info.IsVirtual === 0) {
        this.$emit('register')
        return
      }

      // 首次领奖联盟卡券
      if (this.info.IsVirtual === 2) {
        this.handleGoCard(true)
        return
      }
      await this.requestSubscribeMsg(this.noticeTempList)
      // ProductGetType  0：邮寄，1：线下，2：两种
      if (this.info.ProductGetType === 0) {
        uni.redirectTo({
          url: `/packages/src/integral/detail?type=2&id=${this.info.AwardId}&activityprizeid=${this.info.SaoMaActivityPrizeID}&subcategory=6&actid=${this.activityId}`
        })
      } else if (this.info.ProductGetType === 1) {
        uni.redirectTo({
          url: `/packages/src/integral/settle?type=4&id=${this.info.AwardId}&ordersourcetype=2`
        })
      } else {
        this.$emit('open')
      }
    },
    // 参与机会跳转
    handleDraw() {
      if (this.info.DrawMpUrl) {
        uni.navigateTo({
          url: '/' + this.info.DrawMpUrl
        })
      } else {
        this.$emit('qrcode', this.info.DrawCenterUrl)
      }
    },
    // 如何解锁待解锁红包券
    handleGetCouponExplain() {
      /* #ifdef MP-WEIXIN */
      apiCouponExplain({
        CouponId: this.info.PrizeVolumeCouponId // 券id
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
    // 领奖自动跳转
    handleAutoJumpPage() {
      this.autoJumpPageTime = Number(this.autoJumpInfo.SaoMaResultAutoJumpPageTime)
      this.autoJumpPageTimer = setInterval(() => {
        if (this.autoJumpPageTime <= 0) {
          clearInterval(this.autoJumpPageTimer)
          /* #ifdef MP-WEIXIN */
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
    }
  }
}
</script>

<style lang="scss" scoped>
img {
  width: 100%;
  height: 100%;
}
.jackpot-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;

  align-items: center;
  width: 100%;
  height: 100%;
  .state-img {
    width: 319rpx;
    height: 223rpx;
    position: absolute;
    bottom: 30rpx;
  }
  // .name {
  //   font-size: 32rpx;
  //   font-family: PingFang SC Bold, PingFang SC Bold-Bold;
  //   font-weight: 700;
  //   text-align: center;
  //   color: #ffffff;
  //   line-height: 48rpx;
  //   position: absolute;
  //   top: 80rpx;
  // }
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 680rpx;
    // height: 667rpx;
    border-radius: 40rpx;
    background-image: linear-gradient(#e91f1f, #ff4147);
    animation: tanchuang 0.4s ease-in-out;
    background-size: 100%;
    background-repeat: no-repeat;
    .name {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 220rpx;
      .jiang {
        margin-top: 15rpx;
        font-size: 30rpx;
        font-family: PingFang SC Bold, PingFang SC Bold-Bold;
        font-weight: 700;
        text-align: center;
        color: #ec2425;
        letter-spacing: -2rpx;
        text-shadow: 2rpx 2rpx 0rpx 0rpx #fff9d7;
      }
      .time {
        margin-top: 14rpx;
        opacity: 1;
        font-size: 24rpx;
        font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        font-weight: 500;
        text-align: center;
        color: #7b1617;
      }
      .img1,
      .img2 {
        height: 55rpx;
      }
      .img1 {
        width: 276rpx;
      }
      .img2 {
        width: 470rpx;
      }
    }
    .content-box {
      width: 100%;
      padding: 0 25rpx;
      border-radius: 0 0 20rpx 20rpx;
      background-color: #fb383e;
      .scroll-Y {
        margin-top: 40rpx;
        max-height: 500rpx;
        margin-bottom: 25rpx;
        .scroll-view-item {
          margin-bottom: 20rpx;
          width: 100%;
          height: 180rpx;
          background: linear-gradient(0deg, #ffe3a2 24%, #ffb347 100%);
          border-radius: 10rpx;
          box-shadow: 0px 0px 30px 0px #ffffff inset;
          display: flex;
          padding: 20rpx;
          .left {
            // width: 430rpx;
            display: flex;
            .photo {
              width: 140rpx;
              display: flex;
              justify-content: center;
              align-items: center;
              img {
                width: 100rpx;
                height: 100rpx;
              }
            }
            .info-box {
              margin-left: 30rpx;
              width: 270rpx;
              display: flex;
              flex-direction: column;
              justify-content: center;
              .title {
                opacity: 1;
                font-size: 28rpx;
                font-family: PingFang SC Bold, PingFang SC Bold-Bold;
                font-weight: 700;
                text-align: left;
                color: #000000;
                overflow: hidden; // 超出隐藏
                text-overflow: ellipsis; // 超出省略号
                white-space: nowrap; // 不换行
              }
              .tips {
                margin-top: 10rpx;
                font-size: 24rpx;
                font-family: PingFang SC Medium, PingFang SC Medium-Medium;
                font-weight: 500;
                text-align: left;
                color: #999999;
                line-height: 32rpx;
                .img-loading {
                  width: 60rpx;
                  height: 24rpx;
                  display: inline-block;
                }
                .red {
                  color: #f80002;
                  font-weight: 700;
                  margin-right: 10rpx;
                }
              }
            }
          }
          .right {
            flex: 1;
            margin-left: 30rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            .tx-buttom {
              width: 110rpx;
              height: 50rpx;
              opacity: 1;
              background: linear-gradient(0deg, #ff2529 0%, #ff5e1f 100%);
              border-radius: 25rpx;
              font-size: 24rpx;
              color: #ffffff;
              text-align: center;
              line-height: 50rpx;
              border: none;
            }
            .unlock {
              img {
                width: 30rpx;
                height: 40rpx;
              }
              .unlock-box {
                background-color: #fff;
                border-radius: 50%;
                width: 85rpx;
                height: 85rpx;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: -12rpx;
                margin-left: 14rpx;
              }
            }
          }
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
      bottom: -230rpx;
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
.hbvoucher-countdown-item {
  color: #f80002;
  font-weight: 700;
  font-size: 26rpx;
}
.hbvoucher-countdown-colon {
  color: #f80002;
  font-size: 26rpx;
}
</style>
