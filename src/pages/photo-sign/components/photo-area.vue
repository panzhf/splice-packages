<template>
  <view class="photo-area">
    <view v-if="hadSign" class="upload-box flex flex-middle flex-center">
      <image :src="tempImg || info.signedimg" mode="aspectFit" class="cover" />
    </view>
    <view v-else class="w-1 p-r upload-box">
      <view class="upload-box flex flex-middle flex-center" @tap="handlePhoto">
        <view class="iconfont iconpack-xiangji icon" />
      </view>
      <!-- #ifdef MP-WEIXIN -->
      <auth-button :mode="2" />
      <!-- #endif -->
    </view>

    <view class="btn-box flex flex-between mb-30">
      <button v-if="step === 2" open-type="share" class="flex-1 confirm-btn active fw-bold fs-36 text-center">
        立即分享
      </button>
      <view v-else-if="disabledSign" class="flex-1 confirm-btn disabled fw-bold fs-36 text-center">
        {{ btnTxt }}
      </view>
      <view v-else class="w-1 p-r">
        <view class="flex-1 confirm-btn active fw-bold fs-36 text-center" @tap="handlePhoto">立即拍照打卡</view>
        <!-- #ifdef MP-WEIXIN -->
        <auth-button :mode="2" />
        <!-- #endif -->
      </view>
    </view>
    <view class="tip text-center fs-24">{{ tip }}</view>
    <view class="flex flex-middle flex-center side-btn rule fs-24" @tap="handleNavigate('rule')">拍 照 规 则</view>
    <view class="flex flex-middle flex-center side-btn rank fs-24 p-r w-m-n">
      <text class="flex flex-middle flex-center side-btn" @tap="handleNavigate('rank')">查 看 排 行 榜</text>
      <!-- #ifdef MP-WEIXIN -->
      <auth-button :mode="2" />
      <!-- #endif -->
    </view>
    <view class="flex flex-middle flex-center side-btn record fs-24 p-r w-m-n">
      <text class="flex flex-middle flex-center side-btn" @tap="handleNavigate('record')">我 的 打 卡</text>
      <!-- #ifdef MP-WEIXIN -->
      <auth-button :mode="2" />
      <!-- #endif -->
    </view>
    <UploadDialog v-model="showUpload" :info="{ actId: info.actId, photomode: info.photomode }" @success="onSuccess" />
    <CommonPopup v-model="showPopup" :title="popTitle" confirm-text="我知道了">
      <view>上传打卡机会已用完</view>
      <view>请明日再来哦~</view>
    </CommonPopup>
  </view>
</template>

<script>
import popupMixin from 'packages/mixins/popup'
import UploadDialog from './upload-dialog'
import CommonPopup from 'packages/components/common-popup/common-popup'

export default {
  name: 'PhotoArea',
  components: { UploadDialog, CommonPopup },
  mixins: [popupMixin],
  props: {
    info: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      step: 0, // 0未拍照 1已拍照未打卡 2完成打卡 3未开始 4已结束 5已禁用 6已删除 7待审核
      showUpload: false,
      tempImg: ''
    }
  },
  computed: {
    tip() {
      let tip = '完成拍照打卡上排行榜，打卡次数越多排名越靠前哦~'
      const o = {
        4: '来晚一步，活动已结束',
        5: '活动筹备中...',
        6: '活动已经删除'
      }
      if (this.step === 3) {
        tip = `开始时间：${this.info?.begintime}`
      } else if (this.step in o) {
        tip = o[this.step]
      }
      return tip
    },
    btnTxt() {
      let tip = ''
      const o = {
        3: '活动还未开始',
        4: '活动已结束',
        5: '活动已禁用',
        6: '活动已删除',
        7: '待审核'
      }
      if (this.step in o) {
        tip = o[this.step]
      }
      return tip
    },
    hadSign() {
      return [1, 2, 7].includes(this.step)
    },
    disabledSign() {
      return [3, 4, 5, 6, 7].includes(this.step)
    }
  },
  watch: {
    info: {
      immediate: true,
      deep: true,
      handler(v) {
        const { status, lastsignstatus } = v
        const disabledStatus = [0, 2, 3, -1]
        if (disabledStatus.includes(status)) {
          this.step = disabledStatus.indexOf(status) + 3
        } else {
          this.step = lastsignstatus === 1 ? 2 : lastsignstatus === 0 ? 7 : 0
        }
      }
    }
  },
  methods: {
    handlePhoto() {
      if (this.info.audittype === 1 && this.info.leftsignnum < 1) {
        // 审核模式下，上传次数用完
        this.showTips()
        return
      }
      if (this.disabledSign) return
      this.showUpload = true
    },
    handleNavigate(type) {
      switch (type) {
        case 'rule':
          this.$emit('rule')
          break
        case 'rank':
          uni.navigateTo({ url: `/packages/src/pages/photo-sign/rank?id=${this.info.actId}` })
          break
        case 'record':
          uni.navigateTo({
            url: `/packages/src/pages/photo-sign/record?id=${this.info.actId}&type=${this.info.audittype}`
          })
          break

        default:
          break
      }
    },
    onSuccess({ prize, img }) {
      this.tempImg = img
      this.showUpload = false
      this.$emit('success', { ...prize, audittype: this.info.audittype })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'packages/styles/mixins.scss';
$prefix: photo-area;
.#{$prefix} {
  position: relative;
  padding-bottom: 48rpx;
  .p-r {
    position: relative;
  }
  .w-1 {
    width: 100%;
  }
  .upload-box {
    margin: 30rpx auto 40rpx;
    @include wh(480rpx);
    background-color: #f2f2f2;
    .icon {
      font-size: 180rpx;
      color: #fff;
    }
    .cover {
      @include wh(480rpx);
    }
  }
  .side-btn {
    position: absolute;
    background-color: var(--sidebtn-bg);
    color: var(--theme-color);
    // 竖向不能用padding撑开内容，否则布局会错乱，left等不生效
    writing-mode: vertical-rl;
    &.w-m-n {
      writing-mode: horizontal-tb;
    }
    &.rule {
      top: 165rpx;
      left: 0;
      @include wh(50rpx, 150rpx);
      @include round(0 10rpx 10rpx 0);
    }
    &.rank {
      top: 70rpx;
      right: 0;
      @include wh(50rpx, 170rpx);
      @include round(10rpx 0 0 10rpx);
    }
    &.record {
      top: 284rpx;
      right: 0;
      @include wh(50rpx, 150rpx);
      @include round(10rpx 0 0 10rpx);
    }
  }
  .confirm-btn {
    @include lh(80rpx);
    @include box;
    @include round(40rpx);
    &.active {
      color: #fff;
      background: linear-gradient(90deg, var(--theme-color) 0%, var(--confirmbtn-bg) 50%, var(--theme-color) 100%);
    }
    &.plain {
      color: var(--theme-color);
      background-color: #fff;
      border: 1px solid var(--theme-color);
    }
    &.disabled {
      background: linear-gradient(90deg, #e8e8e8 0%, #f4f4f4 50%, #e8e8e8 100%);
      color: #aaa;
    }
  }
  .btn-box {
    padding: 0 60rpx;
  }
  .tip {
    color: #aaa;
  }
}
/* #ifdef MP-CLOUDSHOP */
// 兼容云店
view {
  box-sizing: border-box;
}
image {
  display: block;
}
/* #endif */
</style>
