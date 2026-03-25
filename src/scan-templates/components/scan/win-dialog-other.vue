<!-- 其他角色 -->
<template>
  <!-- #ifdef H5 -->
  <view v-show="isShow" class="win-dialog-container theme-base-style">
    <!-- #endif -->
    <!-- #ifdef MP-WEIXIN -->
    <view v-if="isShow" class="win-dialog-container theme-base-style">
      <!-- #endif -->
      <view class="mask" @click="handleClickMask" />
      <view class="content">
        <view class="pop__content" :style="{ backgroundImage: `url(${popBg})` }">
          <image v-if="popTitleImg" class="pop__bg-top-img-bg" :src="popTitleImg" mode="widthFix" />
          <view class="iconfont icon-close2 close-btn" @click="clearAutoJumpPage" />
          <view class="dialog-content-title">
            <view class="award-name">
              {{ isFristAward ? '恭喜' : '' }}获得
              <text class="award-text">{{ prizeInfo.PrizeName }}</text>
            </view>
            <view v-if="!isFristAward" class="award-time">参与时间：{{ prizeInfo.Addtime }}</view>
          </view>
          <view class="pop__bg-center">
            <!-- 红包零钱 -->
            <view
              v-if="prizeInfo.IsGetHb"
              class="pop__prize-item"
              :style="{ backgroundImage: `url(${customImg.itemBg})` }"
            >
              <view class="preset-icon-wrap">
                <image class="prize-icon" :src="hongImg" mode="widthFix" />
              </view>
              <view>
                <view class="prize-name ellipsis">{{ prizeInfo.PrizeHbName }}</view>
                <view
                  v-if="!prizeInfo.IsHbsendResult && ['发放中', '发放成功（待到账）'].includes(prizeInfo.HbSendResult)"
                  class="prize-desc ellipsis-2"
                >
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
                :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                @tap="handlewithdraw(prizeInfo.prizeHbReceiveDescLink)"
              >
                <!-- #ifdef H5 -->
                <!-- 如果是导购自定义模版的跳转导购小程序 -->
                <drow-btn v-if="isCustomType === 'guide' || isCustomType === 'store'" :info="getDrowConfigInfo('hb')" />
                <template v-else>{{ prizeInfo.prizeHbReceiveDescText }}</template>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                {{ prizeInfo.prizeHbReceiveDescText }}
                <!-- #endif -->
              </view>
              <template v-else>
                <!-- #ifdef H5 -->
                <view
                  v-if="prizeInfo.HbSendResult == '发放失败' && prizeInfo.prizeHbReceiveDescLink"
                  class="prize-btn"
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                  @tap="handleHbContactUs(prizeInfo.prizeHbReceiveDescLink)"
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
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
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
              :style="{ backgroundImage: `url(${customImg.itemBg})` }"
            >
              <view class="preset-icon-wrap">
                <image
                  v-if="prizeInfo.VolumeType === 2"
                  class="prize-icon"
                  :src="prizeInfo.VoucherImg"
                  mode="aspectFit"
                />
                <image v-else class="prize-icon" :src="kaquanImg" mode="widthFix" />
              </view>
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
                <view class="prize-btn" :style="{ backgroundImage: `url(${customImg.btnBg})` }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
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
                    new Date(prizeInfo.PrizeVolumeEffectiveEndTime).getTime() <= Date.now()
                  "
                  class="prize-btn"
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                >
                  已过期
                </view>
                <view
                  v-else-if="prizeInfo.VolumeType === 3"
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                  class="prize-btn"
                  @tap="handleGetCouponExplain"
                >
                  如何解锁
                </view>
                <template v-else>
                  <!-- #ifdef H5 -->
                  <view
                    v-if="isCustomType === 'guide' || isCustomType === 'store'"
                    class="prize-btn"
                    :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                  >
                    <drow-btn :info="getDrowConfigInfo('card')" />
                  </view>
                  <view
                    v-else
                    class="prize-btn"
                    :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                    @tap="handleVolume"
                  >
                    去使用
                  </view>
                  <!-- #endif -->
                  <!-- #ifdef MP-WEIXIN -->
                  <view class="prize-btn" :style="{ backgroundImage: `url(${customImg.btnBg})` }" @tap="handleVolume">
                    去使用
                  </view>
                  <!-- #endif -->
                </template>
              </template>
            </view>
            <!-- 积分 -->
            <view
              v-if="prizeInfo.Point"
              class="pop__prize-item"
              :style="{ backgroundImage: `url(${customImg.itemBg})` }"
            >
              <view class="preset-icon-wrap">
                <image class="prize-icon" :src="jfImg" mode="widthFix" />
              </view>
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
                :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                @tap="
                  handlePoint(prizeInfo.PrizePointReceiveDescLink, prizeInfo.OtherPageSetJson.CustomAwardRedirection)
                "
              >
                <!-- #ifdef H5 -->
                <!-- 如果是导购自定义模版的跳转导购小程序 -->
                <drow-btn
                  v-if="isCustomType === 'guide' || isCustomType === 'store'"
                  :info="getDrowConfigInfo('point')"
                />
                <template v-else>去兑换</template>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                去兑换
                <!-- #endif -->
              </view>
              <template v-else-if="prizeInfo.PointSendResult === 2">
                <!-- #ifdef H5 -->
                <view class="prize-btn" :style="{ backgroundImage: `url(${customImg.btnBg})` }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
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
              :style="{ backgroundImage: `url(${customImg.itemBg})` }"
            >
              <view class="preset-icon-wrap">
                <image class="prize-icon" :src="chanceImg" mode="widthFix" />
              </view>
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
                :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                @tap="handleDraw(prizeInfo.DrawCenterUrl)"
              >
                去参与
              </view>
              <template v-else-if="[2, 5].includes(prizeInfo.drawsendresult)">
                <!-- #ifdef H5 -->
                <view class="prize-btn" :style="{ backgroundImage: `url(${customImg.btnBg})` }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
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
              :style="{ backgroundImage: `url(${customImg.itemBg})` }"
            >
              <view class="preset-icon-wrap">
                <image class="prize-icon" :src="prizeInfo.PicUrl1" mode="aspectFit" />
              </view>
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
                <view class="prize-btn" :style="{ backgroundImage: `url(${customImg.btnBg})` }" @tap="handleContactUs">
                  联系客服
                </view>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <button
                  plain
                  hover-class="none"
                  class="prize-btn"
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
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
                  :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                  @tap="handleGoCard(false)"
                >
                  <!-- #ifdef H5 -->
                  <!-- 如果是导购跳转导购小程序 -->
                  <drow-btn
                    v-if="isCustomType === 'guide' || isCustomType === 'store'"
                    :info="getDrowConfigInfo('lp')"
                  />
                  <template v-else>去使用</template>
                  <!-- #endif -->
                  <!-- #ifdef MP-WEIXIN -->
                  去使用
                  <!-- #endif -->
                </view>
              </block>
              <view
                v-else-if="prizeInfo.IsGetProduct"
                class="prize-btn gray"
                :style="{ backgroundImage: `url(${customImg.btnBg})` }"
              >
                已领取
              </view>
              <view
                v-else-if="!prizeInfo.IsGetProduct && prizeInfo.PrizeProductVaildDay > 0"
                class="prize-btn"
                :style="{ backgroundImage: `url(${customImg.btnBg})` }"
                @tap="handleReceive(false)"
              >
                <!-- #ifdef H5 -->
                <!-- 如果是导购自定义模版的跳转导购小程序 -->
                <drow-btn v-if="isCustomType === 'guide' || isCustomType === 'store'" :info="getDrowConfigInfo('lp')" />
                <template v-else>{{ prizeInfo.IsVirtual === 2 ? '去使用' : '去领取' }}</template>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                {{ prizeInfo.IsVirtual === 2 ? '去使用' : '去领取' }}
                <!-- #endif -->
              </view>
              <view v-else class="prize-btn" :style="{ backgroundImage: `url(${customImg.btnBg})` }">已失效</view>
            </view>
          </view>
        </view>
        <view class="auto-jump-text">
          <image
            v-if="showImg"
            :src="winPageSetting.imgInfo.imgUrl"
            mode="widthFix"
            class="ad-img"
            show-menu-by-longpress
            @click.stop="handleJumpAd"
          />
          <view v-if="isAutoJump && showJump" class="mt-20">
            <text class="auto-jump-time">{{ autoJumpPageTime }}</text>
            秒后即将跳转
            <text v-if="autoJumpInfo.autoJumpPageText !== ''">，{{ autoJumpInfo.autoJumpPageText }}</text>
          </view>
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
import { commonMixin } from './mixins/common'
import { otherMixin } from './mixins/other'
import Dialog from '../dialog'
import HbUnlockExplain from '../hb-unlock-explain'
import DrowBtn from 'packages/design/scan/drow-btn.vue'
export default {
  components: {
    Dialog,
    Dialog2: Dialog,
    Dialog3: Dialog,
    HbUnlockExplain,
    DrowBtn
  },
  mixins: [commonMixin, otherMixin]
}
</script>

<style lang="scss" scoped>
@import './styles/common.scss';
</style>

