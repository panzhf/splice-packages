<template>
  <view>
    <common-popup
      v-if="[1, 4].includes(btnInfo.type)"
      v-model="showDialog"
      :title="btnInfo.type === 1 ? '本次活动限制说明' : '提示'"
      type="confirm"
      cancel-text="知道了"
      :confirm-text="btnInfo.type === 1 ? '个人中心' : '去赚积分'"
      @confirm="onNavigate"
    >
      <view class="fs-30">{{ btnInfo.msg }}</view>
    </common-popup>
    <template v-else-if="btnInfo.type === 5">
      <!-- #ifdef MP-WEIXIN -->
      <common-popup
        v-model="showDialog"
        title="获取你的位置信息"
        type="confirm"
        confirm-text="去开启"
        @confirm="onLocation"
      >
        <text>{{ btnInfo.msg }}</text>
      </common-popup>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <common-popup
        v-model="showDialog"
        title="获取你的位置信息"
        confirm-text="立即刷新"
        custom-style="width: 560rpx"
        @close="onLocation"
      >
        <view>{{ btnInfo.msg }}</view>
      </common-popup>
      <!-- #endif -->
    </template>
    <common-popup
      v-else
      v-model="showDialog"
      :pop-hide-button="btmJumpHtml ? true : false"
      confirm-text="知道了"
      @close="onResetTimer"
    >
      <view v-if="btnInfo.type === 2" class="fs-32">
        <view class="mb-10">距离活动开始还有</view>
        <text class="tip">{{ countdown.days }}</text>
        天
        <text class="tip">{{ countdown.hours }}</text>
        时
        <text class="tip">{{ countdown.minutes }}</text>
        分
        <text class="tip">{{ countdown.seconds }}</text>
        秒
      </view>
      <view v-else class="fs-30">{{ btnInfo.msg }}</view>
      <!-- #ifdef H5 -->
      <view v-if="btmJumpHtml" class="footer">
        <!-- eslint-disable -->
        <view v-html="btmJumpHtml" />
      </view>
      <!-- #endif -->
    </common-popup>
  </view>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
import CommonPopup from 'packages/components/common-popup/common-popup.vue'
export default {
  name: 'CustomTip',
  components: {
    CommonPopup
  },
  mixins: [dialogMixin],
  props: {
    btnInfo: {
      type: Object,
      default: () => {}
    },
    countdown: {
      type: Object,
      default: () => {}
    },
    btmJumpHtml: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  methods: {
    onNavigate() {
      this.close()
      this.$emit('navigate')
    },
    onLocation() {
      this.close()
      this.$emit('location')
    },
    onResetTimer() {
      this.$emit('cleartimer')
    }
  }
}
</script>

<style lang="scss" scoped>
.tip {
  margin: 0 4rpx;
  color: #ffa200;
}
.footer {
  margin: 60rpx 60rpx -10rpx;
}
</style>
